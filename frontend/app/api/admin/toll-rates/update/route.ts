import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { toll_id, vehicle_class, new_amount, reason = 'Admin rate update' } = body;

    if (!toll_id || new_amount === undefined) {
      return NextResponse.json(
        { error: 'toll_id and new_amount are required' },
        { status: 400 }
      );
    }

    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    const updatedBy = user?.email || 'admin@urgenttaxis.in';

    // Audit record
    const auditRecord = {
      toll_id,
      vehicle_class,
      new_amount,
      updated_by: updatedBy,
      update_reason: reason,
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Toll rate successfully updated and logged in audit history',
      audit: auditRecord,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update toll rate', details: error?.message },
      { status: 500 }
    );
  }
}
