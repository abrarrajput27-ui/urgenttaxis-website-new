import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';

export default async function AdminDashboardPage() {
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

  // Metrics query
  const { count: categoryCount } = await supabase.from('vehicle_categories').select('*', { count: 'exact', head: true });
  const { count: modelCount } = await supabase.from('vehicle_models').select('*', { count: 'exact', head: true });
  const { count: variantCount } = await supabase.from('vehicle_variants').select('*', { count: 'exact', head: true });
  const { count: fleetCount } = await supabase.from('actual_fleet').select('*', { count: 'exact', head: true });

  const currentUser = {
    email: user.email,
    fullName: profile?.full_name || user.email?.split('@')[0],
    roles: rolesList,
  };

  return (
    <AdminShell user={currentUser}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Overview Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Control center for vehicle master data, pricing engine, and fleet availability.
          </p>
        </div>

        {/* Quick Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Vehicle Categories</p>
            <p className="text-3xl font-extrabold text-white mt-2">{categoryCount ?? 0}</p>
            <p className="text-[11px] text-emerald-400 mt-1">Master catalog categories</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Vehicle Models</p>
            <p className="text-3xl font-extrabold text-white mt-2">{modelCount ?? 0}</p>
            <p className="text-[11px] text-amber-400 mt-1">Makes & models defined</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Vehicle Variants</p>
            <p className="text-3xl font-extrabold text-white mt-2">{variantCount ?? 0}</p>
            <p className="text-[11px] text-cyan-400 mt-1">Trims & fuel configurations</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Actual Fleet Units</p>
            <p className="text-3xl font-extrabold text-white mt-2">{fleetCount ?? 0}</p>
            <p className="text-[11px] text-slate-400 mt-1">Physical vehicles on road</p>
          </div>
        </div>

        {/* Informational Architecture Card */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-6 space-y-3">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
            Vehicle Master vs Operational Fleet System Status
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            The platform architecture strictly separates <strong>Vehicle Master Catalog Data</strong> (categories, models, variants, amenities, catalog images) from <strong>Actual Fleet Operations</strong> (registration numbers, drivers, vendors).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400 pt-2">
            <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <span className="font-semibold text-white block mb-1">Catalog Vehicle Mode:</span>
              Allows displaying models like <em>&quot;Maruti Dzire or Similar Sedan&quot;</em> on the public site even when no physical registration number is assigned.
            </div>
            <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <span className="font-semibold text-white block mb-1">Actual Fleet Mode:</span>
              Physical vehicles with optional registration numbers assigned to drivers/vendors with live availability status.
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
