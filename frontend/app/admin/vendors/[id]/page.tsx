import { supabaseServer } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import Link from 'next/link';
import { format } from 'date-fns';
import { revalidatePath } from 'next/cache';

async function toggleVendorStatus(formData: FormData) {
  'use server';
  const supabase = await supabaseServer();
  const id = formData.get('vendor_id') as string;
  const currentStatus = formData.get('current_status') as string;
  const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
  await supabase.from('vendors').update({ status: newStatus }).eq('id', id);

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('audit_logs').insert({
      user_id: user.id, action: 'TOGGLE_VENDOR_STATUS', entity_name: 'vendors', entity_id: id, new_values: { status: newStatus }
    });
  }
  revalidatePath(`/admin/vendors/${id}`);
}

export default async function VendorProfilePage({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: vendor, error } = await supabase
    .from('vendors')
    .select(`
      *,
      actual_fleet ( id, registration_number, status, vehicle_models(name), created_at ),
      drivers ( id, full_name, phone, is_active, created_at ),
      bookings ( id, total_fare, status )
    `)
    .eq('id', resolvedParams.id)
    .single();

  if (error || !vendor) notFound();

  // Basic aggregation for Finance
  const vendorBookings = vendor.bookings || [];
  const completedTrips = vendorBookings.filter((b: any) => b.status === 'completed');
  const totalRevenue = completedTrips.reduce((acc: number, b: any) => acc + (b.total_fare || 0), 0);
  const vendorCommissionPercent = 15; // Example constant, would normally come from DB

  return (
    <AdminShell user={currentUser}>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/admin/vendors" className="text-slate-400 hover:text-white">&larr; Back</Link>
              <h1 className="text-2xl font-bold text-white tracking-tight">{vendor.company_name}</h1>
              <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${vendor.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {vendor.status}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Partner since {format(new Date(vendor.created_at), 'PPP')} &bull; Contact: {vendor.contact_person}
            </p>
          </div>
          <div className="flex gap-2">
            <form action={toggleVendorStatus}>
              <input type="hidden" name="vendor_id" value={vendor.id} />
              <input type="hidden" name="current_status" value={vendor.status} />
              <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">
                {vendor.status === 'active' ? 'Suspend Vendor' : 'Activate Vendor'}
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Total Fleet Assets</p>
            <p className="text-3xl font-extrabold text-white mt-2">{vendor.actual_fleet?.length || 0}</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Total Drivers</p>
            <p className="text-3xl font-extrabold text-blue-500 mt-2">{vendor.drivers?.length || 0}</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Total Completed Trips</p>
            <p className="text-3xl font-extrabold text-emerald-500 mt-2">{completedTrips.length}</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Total Payouts</p>
            <p className="text-3xl font-extrabold text-brand-green mt-2">₹{totalRevenue - Math.round(totalRevenue * (vendorCommissionPercent/100))}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Vendor Fleet */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                <h3 className="font-bold text-white">Vendor Fleet (Vehicles)</h3>
                <button className="text-xs bg-slate-800 px-3 py-1 rounded hover:bg-slate-700 text-white">+ Add Vehicle</button>
              </div>
              <div className="p-0">
                <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-slate-800/50">
                    {vendor.actual_fleet?.map((v: any) => (
                      <tr key={v.id} className="hover:bg-slate-900/40">
                        <td className="p-4">
                          <div className="text-sm font-bold text-brand-blue">{v.registration_number}</div>
                          <div className="text-xs text-slate-500">{v.vehicle_models?.name || 'Unknown Model'}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${v.status === 'available' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-400'}`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Link href={`/admin/fleet/${v.id}`} className="text-xs text-slate-400 hover:text-white">Manage</Link>
                        </td>
                      </tr>
                    ))}
                    {(!vendor.actual_fleet || vendor.actual_fleet.length === 0) && (
                      <tr><td colSpan={3} className="p-6 text-center text-slate-500 text-sm">No vehicles added yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Vendor Drivers */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                <h3 className="font-bold text-white">Vendor Drivers</h3>
                <button className="text-xs bg-slate-800 px-3 py-1 rounded hover:bg-slate-700 text-white">+ Add Driver</button>
              </div>
              <div className="p-0">
                <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-slate-800/50">
                    {vendor.drivers?.map((d: any) => (
                      <tr key={d.id} className="hover:bg-slate-900/40">
                        <td className="p-4">
                          <div className="text-sm font-bold text-white">{d.full_name}</div>
                          <div className="text-xs text-slate-500">{d.phone}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${d.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                            {d.is_active ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Link href={`/admin/drivers/${d.id}`} className="text-xs text-slate-400 hover:text-white">View Profile</Link>
                        </td>
                      </tr>
                    ))}
                    {(!vendor.drivers || vendor.drivers.length === 0) && (
                      <tr><td colSpan={3} className="p-6 text-center text-slate-500 text-sm">No drivers added yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <div className="space-y-6">
            
            {/* Vendor Details */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="font-bold text-white">Business Information</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Company Address</p>
                  <p className="text-sm text-white font-medium">{vendor.address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</p>
                  <p className="text-sm text-white font-medium">{vendor.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Email / Website</p>
                  <p className="text-sm text-white font-medium">{vendor.email || 'N/A'}</p>
                  {vendor.website && <p className="text-sm text-brand-blue font-medium mt-1"><a href={vendor.website} target="_blank" rel="noreferrer">{vendor.website}</a></p>}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">GST & Registration</p>
                  <p className="text-sm text-white font-medium">{vendor.gst_number || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Financial Ledger / Settlements */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="font-bold text-white">Settlements Summary</h3>
              </div>
              <div className="p-4 space-y-3 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Gross Billings</span>
                  <span className="font-bold text-white">₹{totalRevenue}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Platform Commission ({vendorCommissionPercent}%)</span>
                  <span className="font-bold text-red-400">-₹{Math.round(totalRevenue * (vendorCommissionPercent/100))}</span>
                </div>
                <div className="border-t border-slate-800 pt-3 flex justify-between font-bold">
                  <span className="text-white">Net Vendor Payout</span>
                  <span className="text-brand-green">₹{totalRevenue - Math.round(totalRevenue * (vendorCommissionPercent/100))}</span>
                </div>
                <button className="w-full mt-4 text-xs font-bold text-brand-blue hover:text-blue-400">View Invoices & Payouts &rarr;</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AdminShell>
  );
}
