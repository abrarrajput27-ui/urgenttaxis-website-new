import { supabaseServer } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // RBAC check
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('roles(role_code)')
    .eq('user_id', user.id);

  const rolesList =
    (userRoles as unknown as Array<{ roles: { role_code: string } | { role_code: string }[] | null }>)
      ?.map((ur) => (Array.isArray(ur.roles) ? ur.roles[0]?.role_code : ur.roles?.role_code))
      .filter((role): role is string => Boolean(role)) || [];

  if (!rolesList.some((role: string) => ['super_admin', 'admin', 'dispatcher', 'billing_clerk'].includes(role))) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      reference_number,
      status,
      total_fare,
      pickup_location_name,
      drop_location_name,
      trip_type,
      pickup_datetime,
      created_at,
      customers ( full_name, phone ),
      drivers ( full_name ),
      actual_fleet ( registration_number )
    `)
    .order('created_at', { ascending: false });

  if (error || !bookings) {
    return new NextResponse('Error fetching data', { status: 500 });
  }

  // Generate CSV
  const header = ['Reference', 'Status', 'Fare', 'Trip Type', 'Pickup', 'Drop', 'Customer Name', 'Customer Phone', 'Driver', 'Vehicle', 'Created At'];
  const rows = bookings.map(b => [
    b.reference_number,
    b.status,
    b.total_fare,
    b.trip_type,
    `"${b.pickup_location_name}"`,
    `"${b.drop_location_name}"`,
    `"${b.customers?.full_name || ''}"`,
    `"${b.customers?.phone || ''}"`,
    `"${b.drivers?.full_name || ''}"`,
    `"${b.actual_fleet?.registration_number || ''}"`,
    b.created_at
  ]);

  const csvContent = [header.join(','), ...rows.map(r => r.join(','))].join('\n');

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="bookings_export.csv"',
    },
  });
}
