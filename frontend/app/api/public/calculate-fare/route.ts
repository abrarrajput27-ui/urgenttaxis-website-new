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

    // 2. Fetch active rules from database
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
      variantId,
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

    // 4. Calculate fare using authoritative server-side engine
    let calcResult: MasterFareResult | null = null;
    const catLower = categoryId.toLowerCase();
    const isSuv = catLower.includes('suv') && !catLower.includes('exec');
    const isExec = catLower.includes('exec') || catLower.includes('crysta');
    const isHatch = catLower.includes('hatch');

    if (serviceType === 'one_way') {
      let rule = (oneWayRules || []).find((r) => r.route_id === routeId && r.category_id === categoryId);
      if (!rule) {
        // Authoritative fallback rule for one-way journeys
        let baseRate = 13.5;
        let extraKmRate = 11;
        if (isSuv) { baseRate = 17.5; extraKmRate = 15; }
        else if (isExec) { baseRate = 26; extraKmRate = 20; }
        else if (isHatch) { baseRate = 11; extraKmRate = 9; }

        rule = {
          id: `standard-ow-${categoryId}`,
          route_id: routeId || '',
          category_id: categoryId,
          base_fare: Math.round(Number(actualDistanceKm) * baseRate),
          included_km: Number(actualDistanceKm),
          extra_km_rate: extraKmRate,
          driver_allowance: 0,
          night_charge: 0,
          default_included_charges: ['Fuel', 'Driver Allowance'],
          default_excluded_charges: ['Toll Tax', 'State Tax', 'Parking'],
          is_active: true,
          created_at: new Date().toISOString(),
        };
      }
      calcResult = calculateMasterOneWayFare(calcInput, rule, dynamicRules || []);
    } else if (serviceType === 'round_trip') {
      let rule = (roundTripRules || []).find((r) => r.category_id === categoryId);
      if (!rule) {
        // Authoritative fallback rule for round-trip journeys
        let perKmRate = 11;
        let minKm = 250;
        let driverAllowance = 400;
        if (isSuv) { perKmRate = 15; minKm = 250; driverAllowance = 400; }
        else if (isExec) { perKmRate = 20; minKm = 300; driverAllowance = 500; }
        else if (isHatch) { perKmRate = 9; minKm = 250; driverAllowance = 300; }

        rule = {
          id: `standard-rt-${categoryId}`,
          category_id: categoryId,
          min_km_per_day: minKm,
          per_km_rate: perKmRate,
          driver_allowance_per_day: driverAllowance,
          night_halt_charge: 300,
          default_included_charges: ['Fuel', 'Vehicle Rent'],
          default_excluded_charges: ['Toll Tax', 'State Tax', 'Parking', 'Driver Night Allowance'],
          is_active: true,
          created_at: new Date().toISOString(),
        };
      }
      calcResult = calculateMasterRoundTripFare(calcInput, rule, dynamicRules || []);
    } else if (serviceType === 'local_rental') {
      let pkg = (localPackages || []).find((p) => p.id === packageId && p.category_id === categoryId);
      if (!pkg) {
        // Authoritative fallback from BUSINESS_CONFIG for verified local packages
        const pkgKey = String(packageId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const is8h = pkgKey.includes('8h') || pkgKey.includes('80') || Number(durationHours) === 8;
        const is12h = pkgKey.includes('12h') || pkgKey.includes('120') || Number(durationHours) === 12;

        if (is8h) {
          const price = isExec ? 3200 : isSuv ? 2500 : isHatch ? 1600 : 1800;
          const extraHr = isExec ? 300 : isSuv ? 220 : isHatch ? 150 : 180;
          const extraKm = isExec ? 20 : isSuv ? 15 : isHatch ? 10 : 11;
          pkg = {
            id: `pkg-8hr80km-${categoryId}`,
            category_id: categoryId,
            package_name: '8 Hours / 80 KM',
            included_hours: 8,
            included_km: 80,
            package_price: price,
            extra_hour_rate: extraHr,
            extra_km_rate: extraKm,
            default_included_charges: ['Fuel', 'Driver Allowance'],
            default_excluded_charges: ['Toll Tax', 'Parking'],
            is_active: true,
            created_at: new Date().toISOString(),
          };
        } else if (is12h) {
          const price = isExec ? 4500 : isSuv ? 3400 : isHatch ? 2200 : 2500;
          const extraHr = isExec ? 300 : isSuv ? 220 : isHatch ? 150 : 180;
          const extraKm = isExec ? 20 : isSuv ? 15 : isHatch ? 10 : 11;
          pkg = {
            id: `pkg-12hr120km-${categoryId}`,
            category_id: categoryId,
            package_name: '12 Hours / 120 KM',
            included_hours: 12,
            included_km: 120,
            package_price: price,
            extra_hour_rate: extraHr,
            extra_km_rate: extraKm,
            default_included_charges: ['Fuel', 'Driver Allowance'],
            default_excluded_charges: ['Toll Tax', 'Parking'],
            is_active: true,
            created_at: new Date().toISOString(),
          };
        }
      }

      if (!pkg) {
        return NextResponse.json({
          success: true,
          isFareOnRequest: true,
          message: 'Fare Available Upon Instant Request. Dispatch confirmation required for this rental package.',
        } as PublicQuotationDTO);
      }
      calcResult = calculateMasterLocalRentalFare(calcInput, pkg, dynamicRules || []);
    } else if (serviceType === 'airport_transfer') {
      const rule = (airportTransfers || []).find(
        (r) => r.airport_location_id === airportLocationId && r.city_zone_location_id === cityZoneLocationId && r.category_id === categoryId
      );
      if (!rule) {
        // Standard airport transfer calculation
        const airportBase = isSuv ? 1800 : isExec ? 2500 : 1300;
        const airportRule = {
          id: `standard-airport-${categoryId}`,
          airport_location_id: airportLocationId || '',
          city_zone_location_id: cityZoneLocationId || '',
          category_id: categoryId,
          base_fare: airportBase,
          included_km: 40,
          extra_km_rate: isSuv ? 15 : isExec ? 20 : 11,
          driver_allowance: 0,
          night_charge: 0,
          default_included_charges: ['Fuel', 'Driver Allowance', 'Terminal Drop'],
          default_excluded_charges: ['Parking Fee'],
          is_active: true,
          created_at: new Date().toISOString(),
        };
        calcResult = calculateMasterAirportTransferFare(calcInput, airportRule, dynamicRules || []);
      } else {
        calcResult = calculateMasterAirportTransferFare(calcInput, rule, dynamicRules || []);
      }
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
    console.error('Calculate Fare API Error:', error);
    return NextResponse.json(
      { success: false, isFareOnRequest: true, message: 'Internal server error while calculating fare.' },
      { status: 500 }
    );
  }
}
