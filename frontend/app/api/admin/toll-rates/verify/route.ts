import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { toll_id, status = 'APPROVED', remarks } = body;

    if (!toll_id) {
      return NextResponse.json({ error: 'toll_id is required' }, { status: 400 });
    }

    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    return NextResponse.json({
      success: true,
      message: `Toll plaza ${toll_id} marked as ${status}`,
      verified_by: user?.email || 'admin@urgenttaxis.in',
      verified_at: new Date().toISOString(),
      remarks,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to verify toll rate', details: error?.message },
      { status: 500 }
    );
  }
}
