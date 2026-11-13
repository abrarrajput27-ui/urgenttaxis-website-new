import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Return sample discrepancy / review items for admin verification queue
    const queue = [
      {
        id: 'vq-1',
        toll_plaza_id: 'chhajrasi-nh9',
        toll_name: 'Chhajrasi Toll Plaza',
        highway: 'NH-9',
        vehicle_class: 'Sedan',
        provider_amount: 95,
        database_amount: 90,
        discrepancy_reason: 'TollGuru reported ₹95 vs Database ₹90 (annual revision check)',
        status: 'PENDING',
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      {
        id: 'vq-2',
        toll_plaza_id: 'jewar-ye',
        toll_name: 'Jewar Toll Plaza',
        highway: 'Yamuna Expressway',
        vehicle_class: 'Tempo Traveller',
        provider_amount: 385,
        database_amount: 380,
        discrepancy_reason: 'YEIDA commercial permit revision',
        status: 'PENDING',
        created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      data: queue,
      count: queue.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to retrieve verification queue', details: error?.message },
      { status: 500 }
    );
  }
}
