import { supabaseServer } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import Link from 'next/link';
import { format } from 'date-fns';
import { revalidatePath } from 'next/cache';

async function recordPayment(formData: FormData) {
  'use server';
  const supabase = await supabaseServer();
  const invoice_id = formData.get('invoice_id') as string;
  const booking_id = formData.get('booking_id') as string;
  const amountStr = formData.get('amount') as string;
  const payment_mode = formData.get('payment_mode') as string;
  const transaction_reference = formData.get('transaction_reference') as string;
  
  const amount = parseFloat(amountStr);
  if (amount > 0) {
    await supabase.from('payments').insert({
      invoice_id,
      booking_id,
      amount,
      payment_mode,
      transaction_reference,
      status: 'success'
    });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('audit_logs').insert({
        user_id: user.id, action: 'RECORD_PAYMENT', entity_name: 'invoices', entity_id: invoice_id, new_values: { amount, payment_mode, transaction_reference }
      });
    }
  }
  revalidatePath(`/admin/invoices/${invoice_id}`);
}

export default async function InvoiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await supabaseServer();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data: profile } = await supabase.from('user_profiles').select('full_name').eq('id', user.id).single();

  const currentUser = {
    email: user.email,
    fullName: profile?.full_name || user.email?.split('@')[0],
    roles: ['admin'],
  };

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select(`
      *,
      customers ( id, full_name, phone, email, created_at ),
      bookings ( id, reference_number, pickup_location, drop_location, status, total_fare ),
      payments ( id, amount, payment_mode, transaction_reference, status, created_at )
    `)
    .eq('id', resolvedParams.id)
    .single();

  if (error || !invoice) notFound();

  const paidAmount = invoice.payments?.filter((p: any) => p.status === 'success').reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;
  const dueAmount = invoice.total_amount - paidAmount;
  const isFullyPaid = dueAmount <= 0;

  return (
    <AdminShell user={currentUser}>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/admin/invoices" className="text-slate-400 hover:text-white">&larr; Back</Link>
              <h1 className="text-2xl font-bold text-white tracking-tight">Invoice {invoice.invoice_number}</h1>
              <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${isFullyPaid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                {isFullyPaid ? 'Paid' : 'Unpaid / Partial'}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Issued on {format(new Date(invoice.issued_at), 'PPP')}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">
              Print / PDF
            </button>
            <button className="bg-brand-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">
              Email to Customer
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-6">
                <div className="flex justify-between items-start pb-6 border-b border-slate-800 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">Urgent Taxis</h2>
                    <p className="text-sm text-slate-400">123 Corporate Park, Sector 4<br/>Delhi, India 110001<br/>GSTIN: 07AABCU9603R1ZM</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-300 uppercase mb-1">Bill To</p>
                    <p className="text-base font-bold text-white">{invoice.customers?.full_name}</p>
                    <p className="text-sm text-slate-400">{invoice.customers?.phone}</p>
                    <p className="text-sm text-slate-400">{invoice.customers?.email || 'No email'}</p>
                  </div>
                </div>

                <table className="w-full text-left text-sm mb-6">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="py-2 text-slate-400 font-bold uppercase">Description</th>
                      <th className="py-2 text-right text-slate-400 font-bold uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    <tr>
                      <td className="py-4">
                        <div className="font-bold text-white">Booking Ref: {invoice.bookings?.reference_number}</div>
                        <div className="text-slate-400 mt-1">From: {invoice.bookings?.pickup_location}</div>
                        <div className="text-slate-400">To: {invoice.bookings?.drop_location}</div>
                      </td>
                      <td className="py-4 text-right font-bold text-white text-base">
                        ₹{(invoice.total_amount - invoice.tax_amount).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="w-full flex justify-end">
                  <div className="w-64 space-y-3 text-sm">
                    <div className="flex justify-between text-slate-300">
                      <span>Subtotal</span>
                      <span>₹{(invoice.total_amount - invoice.tax_amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Tax (GST)</span>
                      <span>₹{invoice.tax_amount}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold text-lg border-t border-slate-800 pt-3">
                      <span>Total</span>
                      <span>₹{invoice.total_amount}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Amount Paid</span>
                      <span className="text-emerald-500">₹{paidAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-brand-blue font-bold text-lg border-t border-slate-800 pt-3">
                      <span>Balance Due</span>
                      <span>₹{Math.max(dueAmount, 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payments History */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="font-bold text-white">Payment Receipts</h3>
              </div>
              <div className="p-0">
                <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-slate-800/50">
                    {invoice.payments?.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-900/40">
                        <td className="p-4">
                          <div className="text-sm font-bold text-white">₹{p.amount}</div>
                          <div className="text-xs text-slate-500">{format(new Date(p.created_at), 'PPP p')}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-slate-300 uppercase">{p.payment_mode}</div>
                          <div className="text-xs text-slate-500 font-mono mt-1">Ref: {p.transaction_reference || 'N/A'}</div>
                        </td>
                        <td className="p-4 text-right">
                          <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded text-[10px] font-bold uppercase">{p.status}</span>
                        </td>
                      </tr>
                    ))}
                    {(!invoice.payments || invoice.payments.length === 0) && (
                      <tr><td colSpan={3} className="p-6 text-center text-slate-500 text-sm">No payments recorded yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {!isFullyPaid && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                  <h3 className="font-bold text-white">Record Payment</h3>
                </div>
                <div className="p-6">
                  <form action={recordPayment} className="space-y-4">
                    <input type="hidden" name="invoice_id" value={invoice.id} />
                    <input type="hidden" name="booking_id" value={invoice.bookings?.id} />
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Amount Received</label>
                      <input type="number" step="0.01" name="amount" defaultValue={Math.max(dueAmount, 0)} max={Math.max(dueAmount, 0)} className="w-full bg-slate-900 border border-slate-800 text-white rounded p-2 text-sm" required />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Payment Mode</label>
                      <select name="payment_mode" className="w-full bg-slate-900 border border-slate-800 text-white rounded p-2 text-sm" required>
                        <option value="cash">Cash</option>
                        <option value="card">Credit/Debit Card</option>
                        <option value="upi">UPI</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="wallet">Wallet</option>
                        <option value="payment_gateway">Online Payment Gateway</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Transaction Ref (Optional)</label>
                      <input type="text" name="transaction_reference" className="w-full bg-slate-900 border border-slate-800 text-white rounded p-2 text-sm placeholder:text-slate-600" placeholder="Txn ID, UTR, etc." />
                    </div>

                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded shadow-sm text-sm transition-colors">
                      Record Payment
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
