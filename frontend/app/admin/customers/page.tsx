import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  const { data: profile } = await supabase.from('user_profiles').select('full_name').eq('id', user.id).single();
  const currentUser = {
    email: user.email,
    fullName: profile?.full_name || user.email?.split('@')[0],
    roles: ['admin'],
  };

  // Pagination & Filters
  const queryStr = typeof resolvedParams.query === 'string' ? resolvedParams.query : '';
  const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page, 10) : 1;
  const itemsPerPage = 20;
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  // Dashboard Metrics
  const { count: totalCustomers } = await supabase.from('customers').select('*', { count: 'exact', head: true });
  
  // To get active customers and revenue efficiently, we normally use a view or materialized view.
  // For the dashboard, we'll approximate recent signups
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { count: recentSignups } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', thirtyDaysAgo.toISOString());

  // List Query
  let dbQuery = supabase
    .from('customers')
    .select(`
      *,
      bookings ( id, total_fare, status )
    `, { count: 'exact' });

  if (queryStr) {
    dbQuery = dbQuery.or(`full_name.ilike.%${queryStr}%,phone.ilike.%${queryStr}%,email.ilike.%${queryStr}%`);
  }

  const { data: customers, count } = await dbQuery.order('created_at', { ascending: false }).range(from, to);
  const totalPages = count ? Math.ceil(count / itemsPerPage) : 0;

  return (
    <AdminShell user={currentUser}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Customer CRM</h1>
            <p className="text-sm text-slate-400 mt-1">Manage customer profiles, booking history, and support cases.</p>
          </div>
          <button className="bg-brand-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">+ Add Customer</button>
        </div>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Total Registered</p>
            <p className="text-3xl font-extrabold text-white mt-2">{totalCustomers ?? 0}</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">New Signups (30 Days)</p>
            <p className="text-3xl font-extrabold text-emerald-500 mt-2">{recentSignups ?? 0}</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Active Campaign</p>
            <p className="text-xl font-extrabold text-brand-blue mt-2 truncate">Summer Promo 2026</p>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
          <form className="p-4 border-b border-slate-800 bg-slate-900/50 flex gap-4">
            <input type="text" name="query" defaultValue={queryStr} placeholder="Search Name, Phone, Email..." className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-4 py-2 w-full max-w-sm" />
            <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold">Search</button>
          </form>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Customer</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Contact</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Trips Taken</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">LTV (Lifetime Value)</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Joined</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {customers?.map((c) => {
                  const completedTrips = c.bookings?.filter((b: any) => b.status === 'completed') || [];
                  const totalSpent = completedTrips.reduce((sum: number, b: any) => sum + (b.total_fare || 0), 0);
                  
                  return (
                    <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{c.full_name}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-slate-300">{c.phone}</div>
                        <div className="text-xs text-slate-500 mt-1">{c.email || 'No email'}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-white font-bold">{completedTrips.length}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-brand-green font-bold">₹{totalSpent}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-slate-300">{format(new Date(c.created_at), 'MMM dd, yyyy')}</div>
                        <div className="text-xs text-slate-500">{formatDistanceToNow(new Date(c.created_at))} ago</div>
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/admin/customers/${c.id}`} className="text-xs font-bold text-brand-blue hover:text-blue-400 transition-colors">
                          View CRM &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {(!customers || customers.length === 0) && (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-500 text-sm">No customers found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center text-sm text-slate-400">
              <div>Showing {from + 1} to {Math.min(to + 1, count || 0)} of {count} entries</div>
              <div className="flex gap-2">
                {page > 1 && <Link href={`/admin/customers?page=${page - 1}&query=${queryStr}`} className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700 text-white">Previous</Link>}
                {page < totalPages && <Link href={`/admin/customers?page=${page + 1}&query=${queryStr}`} className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700 text-white">Next</Link>}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
