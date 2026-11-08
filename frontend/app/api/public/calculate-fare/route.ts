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
import { calculateAdvanceToken } from '@/lib/pricing';
import { validateAndComputeAddOns } from '@/lib/pricing/add-ons';

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
    baseVehicleFare?: number;
    addOns?: Array<{ id: string; name: string; price: number; disclaimer: string }>;
    addOnTotal?: number;
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
      stops = [],
      actualDistanceKm = 0,
      durationHours = 0,
      numberOfDays = 1,
      numberOfNights = 0,
      pickupDateTime,
      fuelTypePreference,
      selectedAddOns = [],
    } = body as Partial<MasterFareInput> & { stops?: string[]; selectedAddOns?: string[] };

    // 1. Basic input validation
    if (!serviceType || !categoryId) {
      return NextResponse.json(
        { success: false, isFareOnRequest: true, message: 'Missing required parameters (serviceType, categoryId).' },
        { status: 400 }
      );
    }

    // Server-side validation of chargeable add-ons
    const addOnValidation = validateAndComputeAddOns(selectedAddOns, categoryId);
    if (addOnValidation.errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          isFareOnRequest: true,
          message: addOnValidation.errors.join(' '),
        },
        { status: 400 }
      );
    }

    // Validate serviceType
    const validServiceTypes = ['one_way', 'round_trip', 'local_rental', 'airport_transfer'];
    if (!validServiceTypes.includes(serviceType)) {
      return NextResponse.json(
        { success: false, isFareOnRequest: true, message: `Invalid serviceType '${serviceType}'. Must be one of: ${validServiceTypes.join(', ')}.` },
        { status: 400 }
      );
    }

    // Validate dates if provided
    if (pickupDateTime && isNaN(Date.parse(pickupDateTime))) {
      return NextResponse.json(
        { success: false, isFareOnRequest: true, message: 'Invalid pickupDateTime format.' },
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
    const isHatch = catLower.includes('hatch');
    const isErtiga = catLower.includes('ertiga');
    const isSuv = (catLower.includes('suv') || catLower.includes('muv') || isErtiga) && !catLower.includes('exec') && !catLower.includes('crysta');
    const isInnova = catLower.includes('innova') && !catLower.includes('crysta');
    const isExec = catLower.includes('exec') || catLower.includes('crysta');
    const isTempo = catLower.includes('tempo');
    const isUrbania = catLower.includes('urbania');
    const isBus = catLower.includes('bus');

    if (serviceType === 'one_way') {
      let rule = (oneWayRules || []).find((r) => r.route_id === routeId && r.category_id === categoryId);
      if (!rule) {
        // Authoritative fallback rule for one-way journeys
        let baseRate = 11;
        let extraKmRate = 11;
        if (isHatch) { baseRate = 10; extraKmRate = 10; }
        else if (isErtiga || isSuv) { baseRate = 15; extraKmRate = 15; }
        else if (isInnova) { baseRate = 18; extraKmRate = 18; }
        else if (isExec) { baseRate = 20; extraKmRate = 20; }
        else if (isTempo) { baseRate = 26; extraKmRate = 26; }
        else if (isUrbania) { baseRate = 32; extraKmRate = 32; }
        else if (isBus) { baseRate = 48; extraKmRate = 48; }

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
        if (isHatch) { perKmRate = 10; minKm = 250; driverAllowance = 400; }
        else if (isErtiga || isSuv) { perKmRate = 15; minKm = 250; driverAllowance = 400; }
        else if (isInnova) { perKmRate = 18; minKm = 250; driverAllowance = 500; }
        else if (isExec) { perKmRate = 20; minKm = 250; driverAllowance = 500; }
        else if (isTempo) { perKmRate = 26; minKm = 250; driverAllowance = 600; }
        else if (isUrbania) { perKmRate = 32; minKm = 250; driverAllowance = 700; }
        else if (isBus) { perKmRate = 48; minKm = 250; driverAllowance = 1000; }

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
        // Authoritative fallback from BUSINESS_CONFIG for all 5 verified local packages
        const pkgKey = String(packageId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const is4h = pkgKey.includes('4h') || pkgKey.includes('40') || Number(durationHours) === 4;
        const is6h = pkgKey.includes('6h') || pkgKey.includes('60') || Number(durationHours) === 6;
        const is10h = pkgKey.includes('10h') || pkgKey.includes('100') || Number(durationHours) === 10;
        const is12h = pkgKey.includes('12h') || pkgKey.includes('120') || Number(durationHours) === 12;

        let hours = 8;
        let km = 80;
        let name = '8 Hours / 80 KM';
        let price = isExec ? 2500 : isSuv ? 2000 : isHatch ? 1200 : 1500;
        const extraHr = isExec ? 300 : isSuv ? 220 : isHatch ? 150 : 180;
        const extraKm = isExec ? 20 : isSuv ? 15 : isHatch ? 10 : 11;

        if (is4h) {
          hours = 4;
          km = 40;
          name = '4 Hours / 40 KM';
          price = isExec ? 1650 : isSuv ? 1350 : isHatch ? 850 : 1050;
        } else if (is6h) {
          hours = 6;
          km = 60;
          name = '6 Hours / 60 KM';
          price = isExec ? 2100 : isSuv ? 1680 : isHatch ? 1050 : 1299;
        } else if (is10h) {
          hours = 10;
          km = 100;
          name = '10 Hours / 100 KM';
          price = isExec ? 3500 : isSuv ? 2740 : isHatch ? 1700 : 2080;
        } else if (is12h) {
          hours = 12;
          km = 120;
          name = '12 Hours / 120 KM';
          price = isExec ? 4500 : isSuv ? 3480 : isHatch ? 2200 : 2660;
        }

        pkg = {
          id: `pkg-${hours}hr${km}km-${categoryId}`,
          category_id: categoryId,
          package_name: name,
          included_hours: hours,
          included_km: km,
          package_price: price,
          extra_hour_rate: extraHr,
          extra_km_rate: extraKm,
          default_included_charges: ['Fuel', 'Driver Allowance'],
          default_excluded_charges: ['Toll Tax', 'Parking'],
          is_active: true,
          created_at: new Date().toISOString(),
        };
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

    // Phase 3 Add-on Calculation: baseFare + addOnTotal, calculate 30% advance token & 70% balance
    const baseVehicleFare = calcResult.customerPayable;
    const finalCustomerPayable = baseVehicleFare + addOnValidation.addOnTotal;
    const finalTokenAmount = calculateAdvanceToken(finalCustomerPayable, 30);
    const finalBalanceAmount = finalCustomerPayable - finalTokenAmount;

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
        automaticFare: calcResult.automaticFare + addOnValidation.addOnTotal,
        customerPayable: finalCustomerPayable,
        tokenAmount: finalTokenAmount,
        balanceAmount: finalBalanceAmount,
        pricingMode: calcResult.pricingMode,
        includedCharges: calcResult.includedCharges || [],
        excludedCharges: calcResult.excludedCharges || [],
        calculatedAt: calcResult.calculationTimestamp,
        baseVehicleFare,
        addOns: addOnValidation.validAddOns.map((a) => ({
          id: a.id,
          name: a.name,
          price: a.price,
          disclaimer: a.disclaimer,
        })),
        addOnTotal: addOnValidation.addOnTotal,
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
