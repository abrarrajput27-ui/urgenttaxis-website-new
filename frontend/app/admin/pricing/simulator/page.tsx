import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import SimulatorClient from './SimulatorClient';

export default async function AdminSimulatorPage() {
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

  // Fetch master data for simulation controls
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

  // Fetch active pricing rules across 4 service types & surge rules
  const { data: oneWayRules } = await supabase
    .from('pricing_one_way')
    .select('*')
    .eq('is_active', true);

  const { data: roundTripRules } = await supabase
    .from('pricing_round_trip')
    .select('*')
    .eq('is_active', true);

  const { data: localPackages } = await supabase
    .from('pricing_local_packages')
    .select('*')
    .eq('is_active', true);

  const { data: airportTransfers } = await supabase
    .from('pricing_airport_transfers')
    .select('*')
    .eq('is_active', true);

  const { data: dynamicRules } = await supabase
    .from('dynamic_pricing_rules')
    .select('*')
    .eq('is_active', true)
    .order('priority', { ascending: false });

  return (
    <AdminShell user={currentUser}>
      <SimulatorClient
        oneWayRules={oneWayRules || []}
        roundTripRules={roundTripRules || []}
        localPackages={localPackages || []}
        airportTransfers={airportTransfers || []}
        dynamicRules={dynamicRules || []}
        categories={categories || []}
        routes={routes || []}
        locations={locations || []}
      />
    </AdminShell>
  );
}
