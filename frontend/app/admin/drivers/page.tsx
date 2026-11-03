import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default async function AdminDriversPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  const { data: profile } = await supabase.from('user_profiles').select('full_name').eq('id', user.id).single();
  const { data: userRoles } = await supabase.from('user_roles').select('roles(role_code)').eq('user_id', user.id);
  const rolesList = (userRoles as any[])?.map(ur => Array.isArray(ur.roles) ? ur.roles[0]?.role_code : ur.roles?.role_code).filter(Boolean) || [];

  const currentUser = {
    email: user.email,
    fullName: profile?.full_name || user.email?.split('@')[0],
    roles: rolesList,
  };

  // Pagination & Filters
  const queryStr = typeof resolvedParams.query === 'string' ? resolvedParams.query : '';
  const statusFilter = typeof resolvedParams.status === 'string' ? resolvedParams.status : '';
  const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page, 10) : 1;
  const itemsPerPage = 20;
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  // Aggregates for Driver Dashboard
  const { count: totalDrivers } = await supabase.from('drivers').select('*', { count: 'exact', head: true });
  const { count: activeDrivers } = await supabase.from('drivers').select('*', { count: 'exact', head: true }).eq('is_active', true);
  const { count: pendingDrivers } = await supabase.from('drivers').select('*', { count: 'exact', head: true }).eq('is_active', false);

  // List Query
  let dbQuery = supabase
    .from('drivers')
    .select(`*, vendors ( company_name )`, { count: 'exact' });

  if (statusFilter === 'active') dbQuery = dbQuery.eq('is_active', true);
  if (statusFilter === 'inactive') dbQuery = dbQuery.eq('is_active', false);
  if (queryStr) {
    dbQuery = dbQuery.or(`full_name.ilike.%${queryStr}%,phone.ilike.%${queryStr}%,license_number.ilike.%${queryStr}%`);
  }

  const { data: drivers, count } = await dbQuery.order('created_at', { ascending: false }).range(from, to);
  const totalPages = count ? Math.ceil(count / itemsPerPage) : 0;

  return (
    <AdminShell user={currentUser}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Driver Operations</h1>
            <p className="text-sm text-slate-400 mt-1">Manage driver profiles, documents, and availability.</p>
          </div>
          <button className="bg-brand-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">+ Add Driver</button>
        </div>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Total Registered</p>
            <p className="text-3xl font-extrabold text-white mt-2">{totalDrivers ?? 0}</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Active Fleet</p>
            <p className="text-3xl font-extrabold text-emerald-500 mt-2">{activeDrivers ?? 0}</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Pending / Suspended</p>
            <p className="text-3xl font-extrabold text-amber-500 mt-2">{pendingDrivers ?? 0}</p>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
          <form className="p-4 border-b border-slate-800 bg-slate-900/50 flex gap-4">
            <input type="text" name="query" defaultValue={queryStr} placeholder="Search Name, Phone, License..." className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-4 py-2 w-full max-w-sm" />
            <select name="status" defaultValue={statusFilter} className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-4 py-2">
              <option value="">All Drivers</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive / Pending</option>
            </select>
            <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold">Search</button>
          </form>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Driver Info</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Vendor</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">License / Docs</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Joined</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {drivers?.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{d.full_name}</div>
                      <div className="text-xs text-slate-500 mt-1">{d.phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-300 font-semibold">{d.vendors?.company_name || 'In-House'}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-300">{d.license_number || 'No License Added'}</div>
                      {d.license_expiry_date && <div className="text-xs text-slate-500">Exp: {d.license_expiry_date}</div>}
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-300">{formatDistanceToNow(new Date(d.created_at))} ago</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${d.is_active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        {d.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/admin/drivers/${d.id}`} className="text-xs font-bold text-brand-green hover:text-emerald-400 transition-colors">
                        View Profile &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
                {(!drivers || drivers.length === 0) && (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-500 text-sm">No drivers found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center text-sm text-slate-400">
              <div>Showing {from + 1} to {Math.min(to + 1, count || 0)} of {count} entries</div>
              <div className="flex gap-2">
                {page > 1 && <Link href={`/admin/drivers?page=${page - 1}&query=${queryStr}&status=${statusFilter}`} className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700 text-white">Previous</Link>}
                {page < totalPages && <Link href={`/admin/drivers?page=${page + 1}&query=${queryStr}&status=${statusFilter}`} className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700 text-white">Next</Link>}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
