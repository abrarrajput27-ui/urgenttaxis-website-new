import { supabaseServer } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import Link from 'next/link';
import { format } from 'date-fns';
import { revalidatePath } from 'next/cache';

async function toggleDriverStatus(formData: FormData) {
  'use server';
  const supabase = await supabaseServer();
  const id = formData.get('driver_id') as string;
  const currentStatus = formData.get('current_status') === 'true';
  await supabase.from('drivers').update({ is_active: !currentStatus }).eq('id', id);

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('audit_logs').insert({
      user_id: user.id, action: 'TOGGLE_DRIVER_STATUS', entity_name: 'drivers', entity_id: id, new_values: { is_active: !currentStatus }
    });
  }
  revalidatePath(`/admin/drivers/${id}`);
}

async function updateDriverNotes(formData: FormData) {
  'use server';
  const supabase = await supabaseServer();
  const id = formData.get('driver_id') as string;
  const notes = formData.get('notes') as string;
  await supabase.from('drivers').update({ notes }).eq('id', id);
  revalidatePath(`/admin/drivers/${id}`);
}

export default async function DriverProfilePage({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: driver, error } = await supabase
    .from('drivers')
    .select(`
      *,
      vendors ( company_name ),
      bookings ( id, reference_number, status, total_fare, created_at ),
      actual_fleet ( registration_number )
    `)
    .eq('id', resolvedParams.id)
    .single();

  if (error || !driver) notFound();

  // Basic aggregation for Trips/Finance
  const completedTrips = driver.bookings?.filter((b: any) => b.status === 'completed') || [];
  const activeTrips = driver.bookings?.filter((b: any) => b.status === 'assigned' || b.status === 'on_trip') || [];
  const totalRevenue = completedTrips.reduce((acc: number, b: any) => acc + (b.total_fare || 0), 0);

  return (
    <AdminShell user={currentUser}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/admin/drivers" className="text-slate-400 hover:text-white">&larr; Back</Link>
              <h1 className="text-2xl font-bold text-white tracking-tight">{driver.full_name}</h1>
              <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${driver.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {driver.is_active ? 'Active' : 'Suspended'}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Joined {format(new Date(driver.created_at), 'PPP')} &bull; Vendor: {driver.vendors?.company_name || 'In-House'}
            </p>
          </div>
          <div className="flex gap-2">
            <form action={toggleDriverStatus}>
              <input type="hidden" name="driver_id" value={driver.id} />
              <input type="hidden" name="current_status" value={driver.is_active.toString()} />
              <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">
                {driver.is_active ? 'Suspend Driver' : 'Activate Driver'}
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Total Trips</p>
            <p className="text-3xl font-extrabold text-white mt-2">{completedTrips.length}</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Active Trips</p>
            <p className="text-3xl font-extrabold text-blue-500 mt-2">{activeTrips.length}</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Generated Revenue</p>
            <p className="text-3xl font-extrabold text-brand-green mt-2">₹{totalRevenue}</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Current Vehicle</p>
            <p className="text-xl font-extrabold text-white mt-2 truncate">{driver.actual_fleet?.[0]?.registration_number || 'Unassigned'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Details & Documents */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="font-bold text-white">Profile & Documents</h3>
              </div>
              <div className="p-6 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</p>
                  <p className="text-sm text-white font-medium">{driver.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Driving License</p>
                  <p className="text-sm text-white font-medium">{driver.license_number || 'Missing'}</p>
                  {driver.license_expiry_date && <p className="text-[10px] text-slate-400 mt-1">Exp: {driver.license_expiry_date}</p>}
                </div>
                <div className="col-span-2 border-t border-slate-800 pt-4 mt-2">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-3">Document Verification Status</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 border border-slate-800 rounded bg-slate-900/50 text-center">
                      <p className="text-sm text-white font-bold mb-1">Aadhaar</p>
                      <span className="text-[10px] uppercase font-bold text-emerald-500">Verified</span>
                    </div>
                    <div className="p-3 border border-slate-800 rounded bg-slate-900/50 text-center">
                      <p className="text-sm text-white font-bold mb-1">PAN Card</p>
                      <span className="text-[10px] uppercase font-bold text-amber-500">Pending Review</span>
                    </div>
                    <div className="p-3 border border-slate-800 rounded bg-slate-900/50 text-center">
                      <p className="text-sm text-white font-bold mb-1">Police Ver.</p>
                      <span className="text-[10px] uppercase font-bold text-red-500">Missing</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assignment & Trip History */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="font-bold text-white">Recent Trips</h3>
              </div>
              <div className="p-0">
                <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-slate-800/50">
                    {driver.bookings?.slice(0, 5).map((b: any) => (
                      <tr key={b.id} className="hover:bg-slate-900/40">
                        <td className="p-4">
                          <div className="text-sm font-bold text-brand-blue">{b.reference_number}</div>
                          <div className="text-xs text-slate-500">{formatDistanceToNow(new Date(b.created_at))} ago</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-white font-bold">₹{b.total_fare}</div>
                          <div className="text-xs text-slate-500 capitalize">{b.status}</div>
                        </td>
                        <td className="p-4 text-right">
                          <Link href={`/admin/bookings/${b.id}`} className="text-xs text-slate-400 hover:text-white">View</Link>
                        </td>
                      </tr>
                    ))}
                    {(!driver.bookings || driver.bookings.length === 0) && (
                      <tr><td colSpan={3} className="p-6 text-center text-slate-500 text-sm">No trips recorded.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <div className="space-y-6">
            
            {/* Notes */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="font-bold text-white">Internal Notes</h3>
              </div>
              <div className="p-4">
                <form action={updateDriverNotes}>
                  <input type="hidden" name="driver_id" value={driver.id} />
                  <textarea 
                    name="notes" 
                    defaultValue={driver.notes || ''} 
                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-lg p-3 text-sm min-h-[150px]"
                    placeholder="Add private remarks about driver behaviour, compliance..."
                  />
                  <button type="submit" className="mt-3 w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-sm font-bold shadow-sm">
                    Save Notes
                  </button>
                </form>
              </div>
            </div>

            {/* Finance Quick Overview */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="font-bold text-white">Finance (Current Month)</h3>
              </div>
              <div className="p-4 space-y-3 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Gross Earnings</span>
                  <span className="font-bold text-white">₹{totalRevenue}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Commission (15%)</span>
                  <span className="font-bold text-red-400">-₹{Math.round(totalRevenue * 0.15)}</span>
                </div>
                <div className="border-t border-slate-800 pt-3 flex justify-between font-bold">
                  <span className="text-white">Net Payout</span>
                  <span className="text-brand-green">₹{totalRevenue - Math.round(totalRevenue * 0.15)}</span>
                </div>
                <button className="w-full mt-4 text-xs font-bold text-brand-blue hover:text-blue-400">View Full Ledger &rarr;</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AdminShell>
  );
}
