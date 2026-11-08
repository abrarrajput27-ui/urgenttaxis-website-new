import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  calculateMasterOneWayFare,
  calculateMasterRoundTripFare,
  calculateMasterLocalRentalFare,
  calculateMasterAirportTransferFare,
  MasterFareInput,
} from '@/lib/pricing/engine';
import { calculateAdvanceToken } from '@/lib/pricing';
import { validateAndComputeAddOns } from '@/lib/pricing/add-ons';
import { sendBookingConfirmationEmail } from '@/lib/email/booking-mailer';
import { randomBytes } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      serviceType,
      categoryId,
      routeId,
      airportLocationId,
      cityZoneLocationId,
      packageId,
      pickupAddress,
      dropAddress,
      travelDateTime,
      returnDateTime,
      actualDistanceKm = 0,
      durationHours = 0,
      numberOfDays = 1,
      numberOfNights = 0,
      passengerCount = 1,
      luggageCount = 0,
      specialInstructions,
      stops = [],
      selectedAddOns = [],
      
      // Customer Details
      customerFullName,
      customerPhone,
      customerEmail,
    } = body;

    // 1. Basic validation
    if (!serviceType || !categoryId || !pickupAddress || !travelDateTime || !customerFullName || !customerPhone) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // Server-side validation of chargeable add-ons
    const addOnValidation = validateAndComputeAddOns(selectedAddOns, categoryId);
    if (addOnValidation.errors.length > 0) {
      return NextResponse.json({ success: false, message: addOnValidation.errors.join(' ') }, { status: 400 });
    }

    const numericPassengerCount = Number(passengerCount);
    if (isNaN(numericPassengerCount) || numericPassengerCount < 1) {
      return NextResponse.json({ success: false, message: 'Invalid passenger count' }, { status: 400 });
    }

    const numericDistance = Number(actualDistanceKm);
    if (isNaN(numericDistance) || numericDistance < 0) {
      return NextResponse.json({ success: false, message: 'Invalid distance' }, { status: 400 });
    }

    const adminClient = supabaseAdmin();

    // 2. Fetch Pricing Rule or compute standard fallback rule
    let rule: any = null;
    if (serviceType === 'one_way') {
      const { data } = await adminClient.from('pricing_one_way').select('*').eq('route_id', routeId).eq('category_id', categoryId).eq('is_active', true).single();
      rule = data;
    } else if (serviceType === 'round_trip') {
      const { data } = await adminClient.from('pricing_round_trip').select('*').eq('category_id', categoryId).eq('is_active', true).single();
      rule = data;
    } else if (serviceType === 'local_rental') {
      const { data } = await adminClient.from('pricing_local_packages').select('*').eq('id', packageId).eq('category_id', categoryId).eq('is_active', true).single();
      rule = data;
    } else if (serviceType === 'airport_transfer') {
      const { data } = await adminClient.from('pricing_airport_transfers').select('*').eq('airport_location_id', airportLocationId).eq('city_zone_location_id', cityZoneLocationId).eq('category_id', categoryId).eq('is_active', true).single();
      rule = data;
    }

    const catLower = String(categoryId).toLowerCase();
    const isHatch = catLower.includes('hatch');
    const isErtiga = catLower.includes('ertiga');
    const isSuv = (catLower.includes('suv') || catLower.includes('muv') || isErtiga) && !catLower.includes('exec') && !catLower.includes('crysta');
    const isInnova = catLower.includes('innova') && !catLower.includes('crysta');
    const isExec = catLower.includes('exec') || catLower.includes('crysta');
    const isTempo = catLower.includes('tempo');
    const isUrbania = catLower.includes('urbania');
    const isBus = catLower.includes('bus');

    if (!rule) {
      if (serviceType === 'one_way') {
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
          base_fare: Math.round(numericDistance * baseRate),
          included_km: numericDistance,
          extra_km_rate: extraKmRate,
          driver_allowance: 0,
          night_charge: 0,
          default_included_charges: ['Fuel', 'Driver Allowance'],
          default_excluded_charges: ['Toll Tax', 'State Tax', 'Parking'],
          is_active: true,
          created_at: new Date().toISOString(),
        };
      } else if (serviceType === 'round_trip') {
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
      } else if (serviceType === 'local_rental') {
        const pkgKey = String(packageId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const is8h = pkgKey.includes('8h') || pkgKey.includes('80') || Number(durationHours) === 8;
        const is12h = pkgKey.includes('12h') || pkgKey.includes('120') || Number(durationHours) === 12;

        if (is8h) {
          const price = isExec ? 3200 : isSuv ? 2500 : isHatch ? 1600 : 1800;
          const extraHr = isExec ? 300 : isSuv ? 220 : isHatch ? 150 : 180;
          const extraKm = isExec ? 20 : isSuv ? 15 : isHatch ? 10 : 11;
          rule = {
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
          rule = {
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
        } else {
          return NextResponse.json({ success: false, message: 'Custom rental package requires manual WhatsApp dispatch confirmation.' }, { status: 400 });
        }
      } else if (serviceType === 'airport_transfer') {
        const airportBase = isExec ? 2500 : isSuv ? 1800 : isHatch ? 1100 : 1300;
        rule = {
          id: `standard-airport-${categoryId}`,
          airport_location_id: airportLocationId || '',
          city_zone_location_id: cityZoneLocationId || '',
          category_id: categoryId,
          base_fare: airportBase,
          included_km: 40,
          extra_km_rate: isExec ? 20 : isSuv ? 15 : isHatch ? 9 : 11,
          driver_allowance: 0,
          night_charge: 0,
          default_included_charges: ['Fuel', 'Driver Allowance', 'Terminal Drop'],
          default_excluded_charges: ['Parking Fee'],
          is_active: true,
          created_at: new Date().toISOString(),
        };
      } else {
        return NextResponse.json({ success: false, message: 'Invalid pricing rule or route configuration.' }, { status: 400 });
      }
    }

    // 3. Dynamic Surge
    const { data: dynamicRulesData } = await adminClient
      .from('dynamic_pricing_rules')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    // 4. Server-Side Fare Calculation (Master Fare Engine)
    const calcInput: MasterFareInput = {
      serviceType,
      categoryId,
      routeId,
      airportLocationId,
      cityZoneLocationId,
      packageId,
      actualDistanceKm: numericDistance,
      durationHours: Number(durationHours) || 0,
      numberOfDays: Number(numberOfDays) || 1,
      numberOfNights: Number(numberOfNights) || 0,
      pickupDateTime: travelDateTime,
    };

    let calcResult = null;
    if (serviceType === 'one_way') calcResult = calculateMasterOneWayFare(calcInput, rule, dynamicRulesData || []);
    if (serviceType === 'round_trip') calcResult = calculateMasterRoundTripFare(calcInput, rule, dynamicRulesData || []);
    if (serviceType === 'local_rental') calcResult = calculateMasterLocalRentalFare(calcInput, rule, dynamicRulesData || []);
    if (serviceType === 'airport_transfer') calcResult = calculateMasterAirportTransferFare(calcInput, rule, dynamicRulesData || []);

    if (!calcResult) {
      return NextResponse.json({ success: false, message: 'Fare calculation failed.' }, { status: 500 });
    }

    // Phase 3 Add-on Calculation
    const baseVehicleFare = calcResult.customerPayable;
    const finalCustomerPayable = baseVehicleFare + addOnValidation.addOnTotal;
    const finalTokenAmount = calculateAdvanceToken(finalCustomerPayable, 30);
    const finalBalanceAmount = finalCustomerPayable - finalTokenAmount;

    // 5. Handle Customer Record (Upsert using phone)
    let customerId = '';
    const { data: existingCustomer } = await adminClient.from('customers').select('id').eq('phone', customerPhone).single();
    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const { data: newCustomer, error: custError } = await adminClient.from('customers').insert({
        full_name: customerFullName,
        phone: customerPhone,
        email: customerEmail || null,
      }).select('id').single();
      if (custError || !newCustomer) return NextResponse.json({ success: false, message: 'Failed to create customer.' }, { status: 500 });
      customerId = newCustomer.id;
    }

    // 6. Generate Reference (12 hex chars for higher entropy)
    const bookingReference = `UT-${randomBytes(6).toString('hex').toUpperCase()}`;

    // Resolve Category ID to valid UUID if slug or non-UUID passed
    let resolvedCategoryUuid = categoryId;
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_REGEX.test(categoryId)) {
      const { data: catData } = await adminClient
        .from('vehicle_categories')
        .select('id')
        .or(`slug.eq.${categoryId},name.ilike.%${categoryId}%`)
        .maybeSingle();
      if (catData?.id) {
        resolvedCategoryUuid = catData.id;
      } else {
        const SLUG_TO_UUID: Record<string, string> = {
          'sedan': 'b8f8e608-491d-4c7c-847d-14456fb41696',
          'cat-sedan': 'b8f8e608-491d-4c7c-847d-14456fb41696',
          'suv-muv': '1550e012-7d85-4829-b912-1f0e2cf99d84',
          'cat-suv': '1550e012-7d85-4829-b912-1f0e2cf99d84',
          'executive-suv': '833d9fb3-65b6-4846-8a9d-44ba6ace6942',
          'cat-exec-suv': '833d9fb3-65b6-4846-8a9d-44ba6ace6942',
          'hatchback': '9e1014d2-71de-43cf-9b73-128773002872',
          'cat-hatchback': '9e1014d2-71de-43cf-9b73-128773002872',
        };
        resolvedCategoryUuid = SLUG_TO_UUID[categoryId] || 'b8f8e608-491d-4c7c-847d-14456fb41696';
      }
    }

    // 7. Insert Booking
    // Format special instructions including intermediate stops and add-ons
    const stopDetails = Array.isArray(stops) && stops.length > 0 ? `Stops: ${stops.join(' ➔ ')}` : '';
    const addOnDetails = addOnValidation.validAddOns.length > 0
      ? `[ADD-ONS: ${addOnValidation.validAddOns.map(a => `${a.name} (₹${a.price})`).join(', ')}]`
      : '';
    const instructionParts = [specialInstructions?.trim(), stopDetails, addOnDetails].filter(Boolean);
    const finalInstructions = instructionParts.length > 0 ? instructionParts.join(' | ') : null;

    const { data: booking, error: bookingError } = await adminClient.from('bookings').insert({
      booking_reference: bookingReference,
      customer_id: customerId,
      category_id: resolvedCategoryUuid,
      trip_type: serviceType,
      pickup_address: pickupAddress,
      drop_address: dropAddress,
      pickup_datetime: travelDateTime,
      return_datetime: returnDateTime || null,
      passenger_count: numericPassengerCount,
      luggage_count: luggageCount ? Number(luggageCount) : 0,
      special_instructions: finalInstructions,
      status: 'pending',
      payment_status: 'unpaid',
      booking_source: 'public_website',
    }).select('id').single();

    if (bookingError || !booking) {
      console.error('Failed to create booking in DB:', bookingError);
      return NextResponse.json({ success: false, message: 'Failed to create booking record.' }, { status: 500 });
    }

    // 8. Freeze Fare Snapshot with Authoritative Financial Calculations
    const snapshotPayload = {
      booking_id: booking.id,
      automatic_fare: calcResult.automaticFare + addOnValidation.addOnTotal,
      manual_override_fare: null,
      final_fare: finalCustomerPayable,
      base_fare: calcResult.baseFare,
      included_km: calcResult.includedKm,
      extra_km_rate: calcResult.extraKmRate,
      toll_tax: calcResult.charges?.find((c: any) => c.id === 'toll_tax')?.amount || 0,
      state_tax: calcResult.charges?.find((c: any) => c.id === 'state_tax')?.amount || 0,
      customer_payable: finalCustomerPayable,
      token_amount: finalTokenAmount,
      balance_amount: finalBalanceAmount,
      breakdown_json: {
        ...calcResult,
        baseVehicleFare,
        addOns: addOnValidation.validAddOns.map((a) => ({
          id: a.id,
          name: a.name,
          price: a.price,
          disclaimer: a.disclaimer,
        })),
        addOnTotal: addOnValidation.addOnTotal,
        customerPayable: finalCustomerPayable,
        tokenAmount: finalTokenAmount,
        balanceAmount: finalBalanceAmount,
        intermediateStops: Array.isArray(stops) ? stops : [],
      } as any,
    };

    const { error: snapError } = await adminClient.from('fare_snapshots').insert(snapshotPayload);
    if (snapError) {
      console.error('Failed to save snapshot:', snapError);
      // Rollback booking if snapshot fails to ensure atomicity
      await adminClient.from('bookings').delete().eq('id', booking.id);
      return NextResponse.json({ success: false, message: 'Failed to freeze fare snapshot. Booking aborted to ensure consistency.' }, { status: 500 });
    }

    // 9. Dispatch Transactional Confirmation Email (Non-blocking, never fails booking)
    const categoryName = isExec ? 'Executive SUV (Innova Crysta)' : isSuv ? 'SUV / MUV (Ertiga / Carens)' : isHatch ? 'Hatchback (WagonR / Swift)' : 'Sedan (Dzire / Etios)';
    sendBookingConfirmationEmail(bookingReference, {
      bookingId: booking.id,
      customerId: customerId,
      customerName: customerFullName,
      customerEmail: customerEmail || null,
      customerPhone: customerPhone,
      serviceType,
      pickupAddress,
      dropAddress,
      intermediateStops: Array.isArray(stops) ? stops : [],
      travelDateTime,
      returnDateTime,
      vehicleName: categoryName,
      baseFare: baseVehicleFare,
      addOns: addOnValidation.validAddOns.map((a) => ({ name: a.name, price: a.price })),
      addOnTotal: addOnValidation.addOnTotal,
      customerPayable: finalCustomerPayable,
      tokenAmount: finalTokenAmount,
      balanceAmount: finalBalanceAmount,
      bookingStatus: 'pending',
      paymentStatus: 'unpaid',
    }).catch((emailErr) => {
      console.warn('[BOOKING_EMAIL_ERROR] Asynchronous email failure (non-blocking):', emailErr);
    });

    return NextResponse.json({
      success: true,
      bookingReference,
      bookingId: booking.id,
      payable: finalCustomerPayable,
      token: finalTokenAmount,
    });

  } catch (error: unknown) {
    console.error('Booking API Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
