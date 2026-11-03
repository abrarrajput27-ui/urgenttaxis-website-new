import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
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

  const currentUser = {
    email: user.email,
    fullName: profile?.full_name || user.email?.split('@')[0],
    roles: rolesList,
  };

  // Pagination and Filtering Logic
  const queryStr = typeof resolvedParams.query === 'string' ? resolvedParams.query : '';
  const statusFilter = typeof resolvedParams.status === 'string' ? resolvedParams.status : '';
  const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page, 10) : 1;
  const itemsPerPage = 20;
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  let dbQuery = supabase
    .from('bookings')
    .select(`
      *,
      customers ( full_name, phone ),
      vehicle_categories ( name ),
      actual_fleet ( registration_number ),
      drivers ( full_name, phone )
    `, { count: 'exact' });

  if (statusFilter) {
    dbQuery = dbQuery.eq('status', statusFilter);
  }

  if (queryStr) {
    dbQuery = dbQuery.or(`reference_number.ilike.%${queryStr}%,customer_phone.ilike.%${queryStr}%`);
  }

  const { data: bookings, count } = await dbQuery
    .order('created_at', { ascending: false })
    .range(from, to);

  const totalPages = count ? Math.ceil(count / itemsPerPage) : 0;

  return (
    <AdminShell user={currentUser}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Booking Management</h1>
            <p className="text-sm text-slate-400 mt-1">
              View, assign, and manage customer bookings and dispatch.
            </p>
          </div>
          <div className="flex gap-3">
            <a href="/admin/api/export-bookings" target="_blank" rel="noreferrer" className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center">
              Export CSV
            </a>
            <button className="bg-brand-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">
              + Manual Booking
            </button>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
          <form className="p-4 border-b border-slate-800 bg-slate-900/50 flex gap-4">
            <input type="text" name="query" defaultValue={queryStr} placeholder="Search Reference, Phone..." className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-4 py-2 w-full max-w-sm" />
            <select name="status" defaultValue={statusFilter} className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-4 py-2">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="assigned">Assigned</option>
              <option value="on_trip">On Trip</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold">Filter</button>
          </form>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Reference</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Customer</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Trip Details</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Amount</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {bookings?.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{b.reference_number}</div>
                      <div className="text-xs text-slate-500 mt-1">{formatDistanceToNow(new Date(b.created_at))} ago</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-300 font-semibold">{b.customers?.full_name || 'Guest'}</div>
                      <div className="text-xs text-slate-500">{b.customers?.phone || b.customer_phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-300">{b.trip_type.replace('_', ' ').toUpperCase()}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px]">{b.pickup_location_name} &rarr; {b.drop_location_name}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-bold text-brand-blue">₹{b.total_fare}</div>
                      <div className="text-[10px] text-slate-500 uppercase">{b.payment_status}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${b.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : b.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/admin/bookings/${b.id}`} className="text-xs font-bold text-brand-green hover:text-emerald-400 transition-colors">
                        Manage &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
                {(!bookings || bookings.length === 0) && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 text-sm">
                      No bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center text-sm text-slate-400">
              <div>Showing {from + 1} to {Math.min(to + 1, count || 0)} of {count} entries</div>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link href={`/admin/bookings?page=${page - 1}&query=${queryStr}&status=${statusFilter}`} className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700 text-white">
                    Previous
                  </Link>
                )}
                {page < totalPages && (
                  <Link href={`/admin/bookings?page=${page + 1}&query=${queryStr}&status=${statusFilter}`} className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700 text-white">
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
