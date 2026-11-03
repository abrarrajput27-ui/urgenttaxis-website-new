import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default async function AdminVendorsPage({
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

  // Aggregates for Vendor Dashboard
  const { count: totalVendors } = await supabase.from('vendors').select('*', { count: 'exact', head: true });
  const { count: activeVendors } = await supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('status', 'active');
  const { count: totalVendorFleet } = await supabase.from('actual_fleet').select('*', { count: 'exact', head: true }).not('vendor_id', 'is', null);

  // List Query
  let dbQuery = supabase
    .from('vendors')
    .select(`
      *,
      actual_fleet ( id ),
      drivers ( id )
    `, { count: 'exact' });

  if (statusFilter) dbQuery = dbQuery.eq('status', statusFilter);
  if (queryStr) {
    dbQuery = dbQuery.or(`company_name.ilike.%${queryStr}%,contact_person.ilike.%${queryStr}%,phone.ilike.%${queryStr}%`);
  }

  const { data: vendors, count } = await dbQuery.order('created_at', { ascending: false }).range(from, to);
  const totalPages = count ? Math.ceil(count / itemsPerPage) : 0;

  return (
    <AdminShell user={currentUser}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Vendor Management</h1>
            <p className="text-sm text-slate-400 mt-1">Manage partner agencies, vendor fleets, and drivers.</p>
          </div>
          <button className="bg-brand-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">+ Add Vendor</button>
        </div>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Total Vendors</p>
            <p className="text-3xl font-extrabold text-white mt-2">{totalVendors ?? 0}</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Active Partners</p>
            <p className="text-3xl font-extrabold text-emerald-500 mt-2">{activeVendors ?? 0}</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Vendor Fleet Size</p>
            <p className="text-3xl font-extrabold text-brand-blue mt-2">{totalVendorFleet ?? 0}</p>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
          <form className="p-4 border-b border-slate-800 bg-slate-900/50 flex gap-4">
            <input type="text" name="query" defaultValue={queryStr} placeholder="Search Company, Contact, Phone..." className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-4 py-2 w-full max-w-sm" />
            <select name="status" defaultValue={statusFilter} className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-4 py-2">
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold">Search</button>
          </form>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Company Name</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Contact Person</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Assets</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Joined</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {vendors?.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{v.company_name}</div>
                      <div className="text-xs text-slate-500 mt-1">{v.gst_number ? `GST: ${v.gst_number}` : 'No GST'}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-300">{v.contact_person}</div>
                      <div className="text-xs text-slate-500">{v.phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-slate-300">
                        <span className="font-bold text-brand-blue">{v.actual_fleet?.length || 0}</span> Vehicles
                      </div>
                      <div className="text-xs text-slate-300 mt-1">
                        <span className="font-bold text-emerald-400">{v.drivers?.length || 0}</span> Drivers
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-300">{formatDistanceToNow(new Date(v.created_at))} ago</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${v.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/admin/vendors/${v.id}`} className="text-xs font-bold text-brand-green hover:text-emerald-400 transition-colors">
                        View Details &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
                {(!vendors || vendors.length === 0) && (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-500 text-sm">No vendors found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center text-sm text-slate-400">
              <div>Showing {from + 1} to {Math.min(to + 1, count || 0)} of {count} entries</div>
              <div className="flex gap-2">
                {page > 1 && <Link href={`/admin/vendors?page=${page - 1}&query=${queryStr}&status=${statusFilter}`} className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700 text-white">Previous</Link>}
                {page < totalPages && <Link href={`/admin/vendors?page=${page + 1}&query=${queryStr}&status=${statusFilter}`} className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700 text-white">Next</Link>}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
