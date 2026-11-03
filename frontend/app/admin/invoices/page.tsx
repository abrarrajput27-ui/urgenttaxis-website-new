import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function AdminInvoicesPage({
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

  // List Query
  let dbQuery = supabase
    .from('invoices')
    .select(`
      *,
      customers ( full_name, phone ),
      bookings ( reference_number, status ),
      payments ( id, amount, status, payment_mode )
    `, { count: 'exact' });

  if (queryStr) {
    dbQuery = dbQuery.or(`invoice_number.ilike.%${queryStr}%`);
  }

  const { data: invoices, count } = await dbQuery.order('issued_at', { ascending: false }).range(from, to);
  const totalPages = count ? Math.ceil(count / itemsPerPage) : 0;

  // Aggregates for Dashboard Metrics
  const { data: allPayments } = await supabase.from('payments').select('amount, status').eq('status', 'success');
  const totalCollected = allPayments?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;
  const { count: pendingInvoicesCount } = await supabase.from('invoices').select('*', { count: 'exact', head: true }); 
  // Normally we'd filter pendingInvoicesCount by joining payments or adding a status to invoices.

  return (
    <AdminShell user={currentUser}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Billing & Invoices</h1>
            <p className="text-sm text-slate-400 mt-1">Manage customer invoices, quotations, and track payment receipts.</p>
          </div>
          <button className="bg-brand-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">Generate Invoice</button>
        </div>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Total Revenue Collected</p>
            <p className="text-3xl font-extrabold text-brand-green mt-2">₹{totalCollected.toLocaleString()}</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Total Invoices Issued</p>
            <p className="text-3xl font-extrabold text-white mt-2">{count || 0}</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Unpaid / Pending (Est)</p>
            <p className="text-3xl font-extrabold text-amber-500 mt-2">N/A</p>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
          <form className="p-4 border-b border-slate-800 bg-slate-900/50 flex gap-4">
            <input type="text" name="query" defaultValue={queryStr} placeholder="Search Invoice Number..." className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-4 py-2 w-full max-w-sm" />
            <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold">Search</button>
          </form>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Invoice No.</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Customer</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Booking Ref</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Total Amount</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Paid Amount</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Issued At</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {invoices?.map((inv) => {
                  const paidAmount = inv.payments?.filter((p: any) => p.status === 'success').reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;
                  const isFullyPaid = paidAmount >= inv.total_amount;

                  return (
                    <tr key={inv.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-brand-blue text-sm">{inv.invoice_number}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-white font-medium">{inv.customers?.full_name}</div>
                        <div className="text-xs text-slate-500">{inv.customers?.phone}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-slate-300">{inv.bookings?.reference_number}</div>
                        <div className="text-[10px] uppercase text-slate-500">{inv.bookings?.status}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-bold text-white">₹{inv.total_amount}</div>
                        <div className="text-[10px] text-slate-500 mt-1">Tax: ₹{inv.tax_amount}</div>
                      </td>
                      <td className="p-4">
                        <div className={`text-sm font-bold ${isFullyPaid ? 'text-emerald-500' : 'text-amber-500'}`}>₹{paidAmount}</div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-1 inline-block ${isFullyPaid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                          {isFullyPaid ? 'Paid' : 'Partial/Unpaid'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-slate-300">{format(new Date(inv.issued_at), 'MMM dd, yyyy')}</div>
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/admin/invoices/${inv.id}`} className="text-xs font-bold text-brand-blue hover:text-blue-400 transition-colors">
                          View &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {(!invoices || invoices.length === 0) && (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-500 text-sm">No invoices found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center text-sm text-slate-400">
              <div>Showing {from + 1} to {Math.min(to + 1, count || 0)} of {count} entries</div>
              <div className="flex gap-2">
                {page > 1 && <Link href={`/admin/invoices?page=${page - 1}&query=${queryStr}`} className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700 text-white">Previous</Link>}
                {page < totalPages && <Link href={`/admin/invoices?page=${page + 1}&query=${queryStr}`} className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700 text-white">Next</Link>}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
