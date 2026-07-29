import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import {
  calculateMasterOneWayFare,
  calculateMasterRoundTripFare,
  calculateMasterLocalRentalFare,
  calculateMasterAirportTransferFare,
  MasterFareInput,
  MasterFareResult,
} from '@/lib/pricing/engine';
import { resolveDynamicPricingRule } from '@/lib/pricing/calculator';

export interface PublicQuotationDTO {
  success: boolean;
  isFareOnRequest: boolean;
  message?: string;
  fare?: {
    serviceType: string;
    categoryId: string;
    actualKm: number;
    guaranteedMinKm: number;
    billableKm: number;
    includedKm: number;
    extraKm: number;
    numberOfDays: number;
    numberOfNights: number;
    baseFare: number;
    distanceCharge: number;
    driverAllowance: number;
    nightCharge: number;
    dynamicSurgeAmount: number;
    automaticFare: number;
    customerPayable: number;
    tokenAmount: number;
    balanceAmount: number;
    pricingMode: string;
    includedCharges: string[];
    excludedCharges: string[];
    calculatedAt: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      serviceType,
      categoryId,
      variantId,
      routeId,
      airportLocationId,
      cityZoneLocationId,
      packageId,
      actualDistanceKm = 0,
      durationHours = 0,
      numberOfDays = 1,
      numberOfNights = 0,
      pickupDateTime,
      fuelTypePreference,
    } = body as Partial<MasterFareInput>;

    // 1. Basic input validation
    if (!serviceType || !categoryId) {
      return NextResponse.json(
        { success: false, isFareOnRequest: true, message: 'Missing required parameters (serviceType, categoryId).' },
        { status: 400 }
      );
    }

    const supabase = await supabaseServer();

    // 2. Fetch active rules from database (Strictly active records only)
    const { data: oneWayRules } = await supabase
      .from('pricing_one_way')
      .select('*')
      .eq('is_active', true);

    const { data: roundTripRules } = await supabase
      .from('pricing_round_trip')
      .select('*')
      .eq('is_active', true);

    const { data: localPackages } = await supabase
      .from('pricing_local_packages')
      .select('*')
      .eq('is_active', true);

    const { data: airportTransfers } = await supabase
      .from('pricing_airport_transfers')
      .select('*')
      .eq('is_active', true);

    const { data: dynamicRules } = await supabase
      .from('dynamic_pricing_rules')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    // 3. Prepare calculation input
    const calcInput: MasterFareInput = {
      serviceType: serviceType as MasterFareInput['serviceType'],
      categoryId,
      routeId,
      airportLocationId,
      cityZoneLocationId,
      packageId,
      actualDistanceKm: Number(actualDistanceKm) || 0,
      durationHours: Number(durationHours) || 0,
      numberOfDays: Number(numberOfDays) || 1,
      numberOfNights: Number(numberOfNights) || 0,
      pickupDateTime,
      fuelTypePreference: fuelTypePreference as any,
    };

    // 4. Calculate fare using pure server-side engine
    let calcResult: MasterFareResult | null = null;

    if (serviceType === 'one_way') {
      const rule = (oneWayRules || []).find((r) => r.route_id === routeId && r.category_id === categoryId);
      if (!rule) {
        return NextResponse.json({ success: true, isFareOnRequest: true, message: 'No active one-way rule found for selected route and category.' } as PublicQuotationDTO);
      }
      calcResult = calculateMasterOneWayFare(calcInput, rule, dynamicRules || []);
    } else if (serviceType === 'round_trip') {
      const rule = (roundTripRules || []).find((r) => r.category_id === categoryId);
      if (!rule) {
        return NextResponse.json({ success: true, isFareOnRequest: true, message: 'No active round-trip rule found for category.' } as PublicQuotationDTO);
      }
      calcResult = calculateMasterRoundTripFare(calcInput, rule, dynamicRules || []);
    } else if (serviceType === 'local_rental') {
      const pkg = (localPackages || []).find((p) => p.id === packageId && p.category_id === categoryId);
      if (!pkg) {
        return NextResponse.json({ success: true, isFareOnRequest: true, message: 'No active local package found.' } as PublicQuotationDTO);
      }
      calcResult = calculateMasterLocalRentalFare(calcInput, pkg, dynamicRules || []);
    } else if (serviceType === 'airport_transfer') {
      const rule = (airportTransfers || []).find(
        (r) => r.airport_location_id === airportLocationId && r.city_zone_location_id === cityZoneLocationId && r.category_id === categoryId
      );
      if (!rule) {
        return NextResponse.json({ success: true, isFareOnRequest: true, message: 'No active airport transfer rule found.' } as PublicQuotationDTO);
      }
      calcResult = calculateMasterAirportTransferFare(calcInput, rule, dynamicRules || []);
    }

    if (!calcResult) {
      return NextResponse.json({ success: true, isFareOnRequest: true, message: 'Unsupported service type or rule combination.' } as PublicQuotationDTO);
    }

    // 5. Build sanitized Public Quotation DTO
    const quotation: PublicQuotationDTO = {
      success: true,
      isFareOnRequest: false,
      fare: {
        serviceType: calcResult.serviceType,
        categoryId: calcResult.categoryId,
        actualKm: calcResult.actualKm,
        guaranteedMinKm: calcResult.guaranteedMinKm,
        billableKm: calcResult.billableKm,
        includedKm: calcResult.includedKm,
        extraKm: calcResult.extraKm,
        numberOfDays: calcResult.numberOfDays,
        numberOfNights: calcResult.numberOfNights,
        baseFare: calcResult.baseFare,
        distanceCharge: calcResult.distanceCharge,
        driverAllowance: calcResult.driverAllowance,
        nightCharge: calcResult.nightCharge,
        dynamicSurgeAmount: calcResult.dynamicSurgeAmount,
        automaticFare: calcResult.automaticFare,
        customerPayable: calcResult.customerPayable,
        tokenAmount: calcResult.tokenAmount,
        balanceAmount: calcResult.balanceAmount,
        pricingMode: calcResult.pricingMode,
        includedCharges: calcResult.includedCharges || [],
        excludedCharges: calcResult.excludedCharges || [],
        calculatedAt: calcResult.calculationTimestamp,
      },
    };

    return NextResponse.json(quotation);
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        isFareOnRequest: true,
        message: error instanceof Error ? error.message : 'Internal calculation error',
      } as PublicQuotationDTO,
      { status: 500 }
    );
  }
}
