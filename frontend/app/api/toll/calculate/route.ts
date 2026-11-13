import { NextRequest, NextResponse } from 'next/server';
import { calculateRouteTolls } from '@/lib/tolls';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { origin, destination, vehicle_id = 'sedan', trip_type = 'one_way', distance_km } = body;

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required' },
        { status: 400 }
      );
    }

    const isRoundTrip = trip_type === 'round_trip';
    const result = calculateRouteTolls(origin, destination, vehicle_id, isRoundTrip, distance_km);

    return NextResponse.json({
      success: true,
      data: {
        origin: result.origin,
        destination: result.destination,
        vehicle_id: result.vehicleCategory,
        trip_type: isRoundTrip ? 'round_trip' : 'one_way',
        toll_plazas: result.tollPlazas.map((p) => ({
          id: p.id,
          name: p.name,
          highway: p.highway,
          state: p.state,
          latitude: p.lat,
          longitude: p.lng,
          amount: p.appliedRate,
          source: p.authority,
          verification_status: 'VERIFIED',
          last_verified_date: p.verifiedAt,
        })),
        toll_plazas_count: result.tollPlazas.length,
        total_toll: result.totalToll,
        state_taxes: result.stateTaxes.map((st) => ({
          state: st.state,
          name: st.name,
          amount: st.rate,
          validity: st.validity,
          description: st.description,
        })),
        total_state_tax: result.totalStateTax,
        grand_total: result.grandTotal,
        verification_status: 'VERIFIED',
        verification_badge: 'NHAI & State Expressway Verified',
        data_source: result.verificationSource,
        calculated_at: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error in /api/toll/calculate:', error);
    return NextResponse.json(
      {
        error: 'Toll information is currently unavailable for this vehicle and route. Please confirm the toll charges with our booking team.',
        details: error?.message,
      },
      { status: 500 }
    );
  }
}
