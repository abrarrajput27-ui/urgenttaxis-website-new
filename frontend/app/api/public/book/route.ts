import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  calculateMasterOneWayFare,
  calculateMasterRoundTripFare,
  calculateMasterLocalRentalFare,
  calculateMasterAirportTransferFare,
  MasterFareInput,
} from '@/lib/pricing/engine';
import {
  calculateAdvanceToken,
  findVerifiedMasterRoute,
  getVerifiedRouteCorridorFare,
  validateAndNormalizeVehicleCategory,
} from '@/lib/pricing';
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
      calculatedBaseFare,
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

    // Strict vehicle category validation
    const vehicleValidation = validateAndNormalizeVehicleCategory(categoryId);
    if (!vehicleValidation.isValid || !vehicleValidation.normalizedCategory) {
      return NextResponse.json(
        { success: false, message: vehicleValidation.error || 'Invalid vehicle category.' },
        { status: 400 }
      );
    }

    // Strict group vehicle online booking restriction (Requires manual quotation)
    if (vehicleValidation.requiresManualQuote || !vehicleValidation.isOnlineBookingPermitted) {
      return NextResponse.json(
        {
          success: false,
          code: 'GROUP_VEHICLE_QUOTE_REQUIRED',
          isFareOnRequest: true,
          message:
            vehicleValidation.quoteRequiredMessage ||
            'Group vehicles (Tempo Traveller, Force Urbania, and Luxury Buses) require manual quotation and dispatch confirmation. Please contact our 24x7 desk via Call (+91 7310651940) or WhatsApp (+91 8595066033).',
          contact: {
            phone: '7310651940',
            phoneDisplay: '+91 7310651940',
            whatsapp: '8595066033',
            whatsappUrl: 'https://wa.me/918595066033',
          },
        },
        { status: 400 }
      );
    }
    const normalizedCategory = vehicleValidation.normalizedCategory;

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

    const isHatch = normalizedCategory === 'hatchback';
    const isSuv = normalizedCategory === 'suv-muv';
    const isErtiga = normalizedCategory === 'suv-muv';
    const isInnova = normalizedCategory === 'innova';
    const isExec = normalizedCategory === 'executive-suv';
    const isTempo = normalizedCategory === 'tempo';
    const isUrbania = normalizedCategory === 'urbania';
    const isBus = normalizedCategory === 'bus';

    if (!rule) {
      if (serviceType === 'one_way') {
        const verifiedRoute = findVerifiedMasterRoute(routeId, pickupAddress, dropAddress);

        let extraKmRate = 12;
        if (isHatch) { extraKmRate = 11; }
        else if (isErtiga || isSuv) { extraKmRate = 15; }
        else if (isInnova) { extraKmRate = 19; }
        else if (isExec) { extraKmRate = 22; }
        else if (isTempo) { extraKmRate = 26; }
        else if (isUrbania) { extraKmRate = 32; }
        else if (isBus) { extraKmRate = 48; }

        if (verifiedRoute) {
          const verifiedFare = getVerifiedRouteCorridorFare(verifiedRoute, categoryId, numericDistance);
          rule = {
            id: `master-ow-${verifiedRoute.id}-${categoryId}`,
            route_id: verifiedRoute.id,
            category_id: categoryId,
            base_fare: verifiedFare.fare,
            included_km: Math.max(verifiedRoute.estimated_distance_km || 0, numericDistance),
            extra_km_rate: extraKmRate,
            driver_allowance: 0,
            night_charge: 0,
            default_included_charges: ['Fuel', 'Driver Allowance'],
            default_excluded_charges: ['Toll Tax', 'State Tax', 'Parking'],
            is_active: true,
            created_at: new Date().toISOString(),
          };
        } else {
          // If no verified master route corridor exists, a valid distance is required
          if (numericDistance <= 0) {
            return NextResponse.json(
              { success: false, message: 'Valid travel distance is required for custom outstation route calculation.' },
              { status: 400 }
            );
          }
          const baseRate = vehicleValidation.perKmRate || 12;

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
        }
      } else if (serviceType === 'round_trip') {
        let perKmRate = 12;
        let minKm = 250;
        let driverAllowance = 400;
        if (isHatch) { perKmRate = 11; minKm = 250; driverAllowance = 400; }
        else if (isErtiga || isSuv) { perKmRate = 15; minKm = 250; driverAllowance = 400; }
        else if (isInnova) { perKmRate = 19; minKm = 250; driverAllowance = 500; }
        else if (isExec) { perKmRate = 22; minKm = 250; driverAllowance = 500; }
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

        rule = {
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

    // Phase 3 Add-on Calculation & Authoritative Server-Side Fare Enforcement
    // Client calculatedBaseFare is validated against authoritative server calculation (calcResult.customerPayable)
    // to prevent client-side manipulation while preserving verified fixed corridor fares.
    const reqBaseFare = Number(calculatedBaseFare);
    if (reqBaseFare > 0 && Math.abs(reqBaseFare - calcResult.customerPayable) > 50) {
      console.warn(
        `[Pricing Guard] Client base fare (₹${reqBaseFare}) differs from authoritative server fare (₹${calcResult.customerPayable}) for route ${routeId || 'generic'} (${categoryId}). Enforcing server fare.`
      );
    }
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
          'dzire': 'b8f8e608-491d-4c7c-847d-14456fb41696',
          'etios': 'b8f8e608-491d-4c7c-847d-14456fb41696',
          'suv-muv': '1550e012-7d85-4829-b912-1f0e2cf99d84',
          'cat-suv': '1550e012-7d85-4829-b912-1f0e2cf99d84',
          'suv': '1550e012-7d85-4829-b912-1f0e2cf99d84',
          'muv': '1550e012-7d85-4829-b912-1f0e2cf99d84',
          'mpv': '1550e012-7d85-4829-b912-1f0e2cf99d84',
          'ertiga': '1550e012-7d85-4829-b912-1f0e2cf99d84',
          'carens': '1550e012-7d85-4829-b912-1f0e2cf99d84',
          'innova': '1550e012-7d85-4829-b912-1f0e2cf99d84',
          'cat-innova': '1550e012-7d85-4829-b912-1f0e2cf99d84',
          'toyota-innova': '1550e012-7d85-4829-b912-1f0e2cf99d84',
          'executive-suv': '833d9fb3-65b6-4846-8a9d-44ba6ace6942',
          'cat-exec-suv': '833d9fb3-65b6-4846-8a9d-44ba6ace6942',
          'crysta': '833d9fb3-65b6-4846-8a9d-44ba6ace6942',
          'innova-crysta': '833d9fb3-65b6-4846-8a9d-44ba6ace6942',
          'innova_crysta': '833d9fb3-65b6-4846-8a9d-44ba6ace6942',
          'hatchback': '9e1014d2-71de-43cf-9b73-128773002872',
          'cat-hatchback': '9e1014d2-71de-43cf-9b73-128773002872',
          'wagonr': '9e1014d2-71de-43cf-9b73-128773002872',
          'swift': '9e1014d2-71de-43cf-9b73-128773002872',
          'tempo': '1550e012-7d85-4829-b912-1f0e2cf99d84',
          'urbania': '833d9fb3-65b6-4846-8a9d-44ba6ace6942',
          'bus': '1550e012-7d85-4829-b912-1f0e2cf99d84',
        };
        const mappedUuid = SLUG_TO_UUID[categoryId.toLowerCase().trim()] || SLUG_TO_UUID[normalizedCategory];
        if (!mappedUuid) {
          return NextResponse.json(
            { success: false, message: `Vehicle category '${categoryId}' could not be resolved to a valid fleet record.` },
            { status: 400 }
          );
        }
        resolvedCategoryUuid = mappedUuid;
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

    // Map serviceType to valid database trip_type_enum ('one_way', 'round_trip', 'local', 'airport')
    const dbTripType =
      serviceType === 'local_rental' || serviceType === 'local' ? 'local' :
      serviceType === 'airport_transfer' || serviceType === 'airport' ? 'airport' :
      serviceType === 'round_trip' ? 'round_trip' : 'one_way';

    const { data: booking, error: bookingError } = await adminClient.from('bookings').insert({
      booking_reference: bookingReference,
      customer_id: customerId,
      category_id: resolvedCategoryUuid,
      trip_type: dbTripType,
      pickup_address: pickupAddress,
      drop_address: (serviceType === 'local_rental' || serviceType === 'local') ? null : (dropAddress || null),
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
    const categoryName = vehicleValidation.displayName || 'Commercial AC Cab';
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
