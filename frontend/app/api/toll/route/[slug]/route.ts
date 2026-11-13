import { NextRequest, NextResponse } from 'next/server';
import { calculateRouteTolls } from '@/lib/tolls';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const vehicle = searchParams.get('vehicle') || 'sedan';

    // Parse origin and destination from slug e.g. "delhi-to-nainital-taxi"
    const clean = slug.replace(/-taxi$/, '');
    const parts = clean.split('-to-');

    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      return NextResponse.json(
        { error: 'Invalid route slug format' },
        { status: 400 }
      );
    }

    const origin = parts[0]
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    const destination = parts[1]
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const result = calculateRouteTolls(origin, destination, vehicle, false);

    return NextResponse.json({
      success: true,
      data: {
        slug,
        origin: result.origin,
        destination: result.destination,
        vehicle_id: result.vehicleCategory,
        toll_plazas: result.tollPlazas,
        total_toll: result.totalToll,
        state_taxes: result.stateTaxes,
        total_state_tax: result.totalStateTax,
        grand_total: result.grandTotal,
        verification_status: 'VERIFIED',
        verification_badge: 'NHAI & State Expressway Verified',
        last_verified: result.lastVerified,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to retrieve route toll breakdown', details: error?.message },
      { status: 500 }
    );
  }
}
