import { NextRequest, NextResponse } from 'next/server';
import { TOLL_PLAZAS } from '@/lib/data/tolls-data';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    // In local development or authenticated session
    return NextResponse.json({
      success: true,
      data: TOLL_PLAZAS,
      total_count: TOLL_PLAZAS.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to retrieve toll plazas', details: error?.message },
      { status: 500 }
    );
  }
}
