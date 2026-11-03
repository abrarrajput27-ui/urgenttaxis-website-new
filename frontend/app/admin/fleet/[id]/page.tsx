import { supabaseServer } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import Link from 'next/link';
import { format } from 'date-fns';
import { revalidatePath } from 'next/cache';

async function toggleVehicleStatus(formData: FormData) {
  'use server';
  const supabase = await supabaseServer();
  const id = formData.get('vehicle_id') as string;
  const currentStatus = formData.get('current_status') as string;
  const newStatus = currentStatus === 'available' ? 'maintenance' : 'available';
  await supabase.from('actual_fleet').update({ status: newStatus }).eq('id', id);

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('audit_logs').insert({
      user_id: user.id, action: 'TOGGLE_VEHICLE_STATUS', entity_name: 'actual_fleet', entity_id: id, new_values: { status: newStatus }
    });
  }
  revalidatePath(`/admin/fleet/${id}`);
}

async function updateVehicleNotes(formData: FormData) {
  'use server';
  const supabase = await supabaseServer();
  const id = formData.get('vehicle_id') as string;
  const notes = formData.get('notes') as string;
  await supabase.from('actual_fleet').update({ notes }).eq('id', id);
  revalidatePath(`/admin/fleet/${id}`);
}

export default async function VehicleProfilePage({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: vehicle, error } = await supabase
    .from('actual_fleet')
    .select(`
      *,
      vehicle_models ( name, category:vehicle_categories(name) ),
      vendors ( id, company_name ),
      drivers!actual_fleet_driver_id_fkey ( id, full_name ),
      bookings ( id, reference_number, status, total_fare, created_at )
    `)
    .eq('id', resolvedParams.id)
    .single();

  if (error || !vehicle) notFound();

  // Basic aggregation for Trips
  const vehicleBookings = vehicle.bookings || [];
  const completedTrips = vehicleBookings.filter((b: any) => b.status === 'completed');
  const activeTrips = vehicleBookings.filter((b: any) => b.status === 'assigned' || b.status === 'on_trip');
  const totalRevenue = completedTrips.reduce((acc: number, b: any) => acc + (b.total_fare || 0), 0);

  return (
    <AdminShell user={currentUser}>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/admin/fleet" className="text-slate-400 hover:text-white">&larr; Back</Link>
              <h1 className="text-2xl font-bold text-white tracking-tight">{vehicle.registration_number}</h1>
              <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${vehicle.status === 'available' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                {vehicle.status}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Model: {vehicle.vehicle_models?.name} &bull; Category: {vehicle.vehicle_models?.category?.name}
            </p>
          </div>
          <div className="flex gap-2">
            <form action={toggleVehicleStatus}>
              <input type="hidden" name="vehicle_id" value={vehicle.id} />
              <input type="hidden" name="current_status" value={vehicle.status} />
              <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">
                {vehicle.status === 'available' ? 'Mark as Maintenance' : 'Mark as Available'}
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
            <p className="text-xs font-semibold uppercase text-slate-400">Current Driver</p>
            <p className="text-xl font-extrabold text-white mt-2 truncate">{vehicle.drivers?.full_name || 'Unassigned'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Vehicle Details & Documents */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="font-bold text-white">Vehicle Documents & Compliance</h3>
              </div>
              <div className="p-6 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Ownership</p>
                  <p className="text-sm text-white font-medium">
                    {vehicle.vendors ? <Link href={`/admin/vendors/${vehicle.vendors.id}`} className="text-brand-blue hover:underline">{vehicle.vendors.company_name}</Link> : 'In-House Fleet'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Color / Year</p>
                  <p className="text-sm text-white font-medium">{vehicle.color || 'N/A'} / {vehicle.manufacturing_year || 'N/A'}</p>
                </div>
                <div className="col-span-2 border-t border-slate-800 pt-4 mt-2">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-3">Compliance Status</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 border border-slate-800 rounded bg-slate-900/50 text-center">
                      <p className="text-sm text-white font-bold mb-1">RC Book</p>
                      <span className="text-[10px] uppercase font-bold text-emerald-500">Verified</span>
                    </div>
                    <div className="p-3 border border-slate-800 rounded bg-slate-900/50 text-center">
                      <p className="text-sm text-white font-bold mb-1">Insurance</p>
                      <span className="text-[10px] uppercase font-bold text-emerald-500">Active</span>
                    </div>
                    <div className="p-3 border border-slate-800 rounded bg-slate-900/50 text-center">
                      <p className="text-sm text-white font-bold mb-1">Fitness Cert.</p>
                      <span className="text-[10px] uppercase font-bold text-amber-500">Expiring Soon</span>
                    </div>
                    <div className="p-3 border border-slate-800 rounded bg-slate-900/50 text-center">
                      <p className="text-sm text-white font-bold mb-1">PUC</p>
                      <span className="text-[10px] uppercase font-bold text-emerald-500">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trip History */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="font-bold text-white">Trip History</h3>
              </div>
              <div className="p-0">
                <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-slate-800/50">
                    {vehicleBookings.slice(0, 5).map((b: any) => (
                      <tr key={b.id} className="hover:bg-slate-900/40">
                        <td className="p-4">
                          <div className="text-sm font-bold text-brand-blue">{b.reference_number}</div>
                          <div className="text-xs text-slate-500">{format(new Date(b.created_at), 'PPP')}</div>
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
                    {vehicleBookings.length === 0 && (
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
                <h3 className="font-bold text-white">Maintenance / Internal Notes</h3>
              </div>
              <div className="p-4">
                <form action={updateVehicleNotes}>
                  <input type="hidden" name="vehicle_id" value={vehicle.id} />
                  <textarea 
                    name="notes" 
                    defaultValue={vehicle.notes || ''} 
                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-lg p-3 text-sm min-h-[150px]"
                    placeholder="Log damages, maintenance schedules, internal remarks..."
                  />
                  <button type="submit" className="mt-3 w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-sm font-bold shadow-sm">
                    Save Notes
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AdminShell>
  );
}
