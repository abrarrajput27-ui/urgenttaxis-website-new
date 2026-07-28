import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import SurgeClient from './SurgeClient';

export default async function AdminSurgePage() {
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

  const { data: categories } = await supabase
    .from('vehicle_categories')
    .select('*')
    .order('display_order', { ascending: true });

  const { data: rules } = await supabase
    .from('dynamic_pricing_rules')
    .select('*, vehicle_categories(*)')
    .order('priority', { ascending: false });

  return (
    <AdminShell user={currentUser}>
      <SurgeClient initialRules={rules || []} categories={categories || []} />
    </AdminShell>
  );
}
