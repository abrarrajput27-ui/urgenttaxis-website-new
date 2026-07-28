import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import FleetClient from './FleetClient';

export default async function ActualFleetPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

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

  const { data: fleet } = await supabase
    .from('actual_fleet')
    .select('*, vehicle_variants(*, vehicle_models(*, vehicle_categories(*))), vendors(*), drivers(*)')
    .order('created_at', { ascending: false });

  const { data: variants } = await supabase
    .from('vehicle_variants')
    .select('*, vehicle_models(*, vehicle_categories(*))')
    .eq('is_active', true)
    .order('variant_name', { ascending: true });

  const currentUser = {
    email: user.email,
    fullName: profile?.full_name || user.email?.split('@')[0],
    roles: rolesList,
  };

  return (
    <AdminShell user={currentUser}>
      <FleetClient initialFleet={fleet || []} variants={variants || []} />
    </AdminShell>
  );
}
