import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  calculateMasterOneWayFare,
  calculateMasterRoundTripFare,
  calculateMasterLocalRentalFare,
  calculateMasterAirportTransferFare,
  MasterFareInput,
} from '@/lib/pricing/engine';
import { resolveDynamicPricingRule } from '@/lib/pricing/calculator';
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
      
      // Customer Details
      customerFullName,
      customerPhone,
      customerEmail,
    } = body;

    // 1. Basic validation
    if (!serviceType || !categoryId || !pickupAddress || !travelDateTime || !customerFullName || !customerPhone) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
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

    // 2. Fetch Pricing Rule
    let rule: unknown = null;
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

    if (!rule) {
      return NextResponse.json({ success: false, message: 'Invalid pricing rule or route configuration.' }, { status: 400 });
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
      actualDistanceKm: Number(actualDistanceKm) || 0,
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

    // 7. Insert Booking
    const { data: booking, error: bookingError } = await adminClient.from('bookings').insert({
      booking_reference: bookingReference,
      customer_id: customerId,
      category_id: categoryId,
      trip_type: serviceType,
      pickup_address: pickupAddress,
      drop_address: dropAddress,
      pickup_datetime: travelDateTime,
      return_datetime: returnDateTime || null,
      passenger_count: numericPassengerCount,
      luggage_count: luggageCount ? Number(luggageCount) : 0,
      special_instructions: specialInstructions,
      status: 'pending',
      payment_status: 'unpaid',
      booking_source: 'public_website',
    }).select('id').single();

    if (bookingError || !booking) {
      return NextResponse.json({ success: false, message: 'Failed to create booking.' }, { status: 500 });
    }

    // 8. Freeze Fare Snapshot
    const snapshotPayload = {
      booking_id: booking.id,
      automatic_fare: calcResult.automaticFare,
      manual_override_fare: null,
      final_fare: calcResult.customerPayable,
      base_fare: calcResult.baseFare,
      included_km: calcResult.includedKm,
      extra_km_rate: calcResult.extraKmRate,
      toll_tax: calcResult.charges.find((c: unknown) => c.id === 'toll_tax')?.amount || 0,
      state_tax: calcResult.charges.find((c: unknown) => c.id === 'state_tax')?.amount || 0,
      customer_payable: calcResult.customerPayable,
      token_amount: calcResult.tokenAmount,
      balance_amount: calcResult.balanceAmount,
      breakdown_json: calcResult as any,
    };

    const { error: snapError } = await adminClient.from('fare_snapshots').insert(snapshotPayload);
    if (snapError) {
      console.error('Failed to save snapshot:', snapError);
      // Rollback booking if snapshot fails to ensure atomicity
      await adminClient.from('bookings').delete().eq('id', booking.id);
      return NextResponse.json({ success: false, message: 'Failed to freeze fare snapshot. Booking aborted to ensure consistency.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      bookingReference,
      bookingId: booking.id,
      payable: calcResult.customerPayable,
      token: calcResult.tokenAmount,
    });

  } catch (error: unknown) {
    console.error('Booking API Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
