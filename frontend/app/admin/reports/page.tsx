import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';

export default async function AdminReportsPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  const { data: profile } = await supabase.from('user_profiles').select('full_name').eq('id', user.id).single();
  const currentUser = {
    email: user.email,
    fullName: profile?.full_name || user.email?.split('@')[0],
    roles: ['admin'],
  };

  // Performance Aggregates
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Total Revenue Last 30 Days (from completed bookings)
  const { data: recentBookings } = await supabase
    .from('bookings')
    .select('total_fare, created_at, status')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .eq('status', 'completed');
    
  const monthlyRevenue = recentBookings?.reduce((sum, b) => sum + (b.total_fare || 0), 0) || 0;
  
  // Total Active Vehicles
  const { count: activeVehicles } = await supabase.from('actual_fleet').select('*', { count: 'exact', head: true }).eq('status', 'available');
  const { count: totalVehicles } = await supabase.from('actual_fleet').select('*', { count: 'exact', head: true });
  const fleetUtilisation = totalVehicles ? Math.round(((activeVehicles || 0) / totalVehicles) * 100) : 0;

  // Total Leads vs Conversions
  const { count: totalEnquiries } = await supabase.from('enquiries').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo.toISOString());
  const { count: convertedEnquiries } = await supabase.from('enquiries').select('*', { count: 'exact', head: true }).eq('status', 'converted').gte('created_at', thirtyDaysAgo.toISOString());
  const conversionRate = totalEnquiries ? Math.round(((convertedEnquiries || 0) / totalEnquiries) * 100) : 0;

  return (
    <AdminShell user={currentUser}>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Performance & Analytics</h1>
            <p className="text-sm text-slate-400 mt-1">Track business performance, revenue growth, and fleet utilisation over time.</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-brand-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">
              Export Complete Report (CSV)
            </button>
          </div>
        </div>

        {/* Core KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Revenue (30 Days)</p>
            <p className="text-3xl font-extrabold text-brand-green mt-2">₹{monthlyRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Completed Trips (30 Days)</p>
            <p className="text-3xl font-extrabold text-white mt-2">{recentBookings?.length || 0}</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Fleet Utilisation</p>
            <p className="text-3xl font-extrabold text-brand-blue mt-2">{fleetUtilisation}%</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Lead Conversion Rate</p>
            <p className="text-3xl font-extrabold text-amber-500 mt-2">{conversionRate}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Revenue Breakdown */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50">
              <h3 className="font-bold text-white">Revenue Analysis (Simplified)</h3>
            </div>
            <div className="p-6">
              <div className="h-64 border border-dashed border-slate-800 rounded-lg flex items-center justify-center bg-slate-900/20">
                <p className="text-slate-500 text-sm font-bold text-center">
                  [Chart Placeholder: Revenue By Day]<br/><br/>
                  <span className="font-mono font-normal">Data points aggregated via database views for visualization library injection.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Operational Metrics */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50">
              <h3 className="font-bold text-white">Fleet & Driver Performance</h3>
            </div>
            <div className="p-6">
              <div className="h-64 border border-dashed border-slate-800 rounded-lg flex items-center justify-center bg-slate-900/20">
                <p className="text-slate-500 text-sm font-bold text-center">
                  [Chart Placeholder: Trips per Category]<br/><br/>
                  <span className="font-mono font-normal">Breakdown by Hatchback, Sedan, SUV, Tempo.</span>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AdminShell>
  );
}
