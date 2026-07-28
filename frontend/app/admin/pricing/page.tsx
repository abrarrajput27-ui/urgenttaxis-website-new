import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import PricingClient from './PricingClient';

export default async function AdminPricingPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Fetch user profile and roles
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('roles(role_code)')
    .eq('user_id', user.id);

  const rolesList =
    (userRoles as unknown as Array<{ roles: { role_code: string } | { role_code: string }[] | null }>)
      ?.map((ur) => (Array.isArray(ur.roles) ? ur.roles[0]?.role_code : ur.roles?.role_code))
      .filter((role): role is string => Boolean(role)) || [];

  const currentUser = {
    email: user.email,
    fullName: profile?.full_name || user.email?.split('@')[0],
    roles: rolesList,
  };

  // Fetch reference master data
  const { data: categories } = await supabase
    .from('vehicle_categories')
    .select('*')
    .order('display_order', { ascending: true });

  const { data: routes } = await supabase
    .from('routes')
    .select('*, origin:locations!routes_origin_location_id_fkey(*), destination:locations!routes_destination_location_id_fkey(*)')
    .order('created_at', { ascending: false });

  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .order('name', { ascending: true });

  // Fetch pricing rules across 4 service types
  const { data: oneWayRules } = await supabase
    .from('pricing_one_way')
    .select('*, routes(*, origin:locations!routes_origin_location_id_fkey(*), destination:locations!routes_destination_location_id_fkey(*)), vehicle_categories(*)')
    .order('created_at', { ascending: false });

  const { data: roundTripRules } = await supabase
    .from('pricing_round_trip')
    .select('*, vehicle_categories(*)')
    .order('created_at', { ascending: false });

  const { data: localPackages } = await supabase
    .from('pricing_local_packages')
    .select('*, vehicle_categories(*)')
    .order('created_at', { ascending: false });

  const { data: airportTransfers } = await supabase
    .from('pricing_airport_transfers')
    .select('*, airport_location:locations!pricing_airport_transfers_airport_location_id_fkey(*), city_zone_location:locations!pricing_airport_transfers_city_zone_location_id_fkey(*), vehicle_categories(*)')
    .order('created_at', { ascending: false });

  return (
    <AdminShell user={currentUser}>
      <PricingClient
        initialOneWay={oneWayRules || []}
        initialRoundTrip={roundTripRules || []}
        initialLocalPackages={localPackages || []}
        initialAirportTransfers={airportTransfers || []}
        categories={categories || []}
        routes={routes || []}
        locations={locations || []}
      />
    </AdminShell>
  );
}
