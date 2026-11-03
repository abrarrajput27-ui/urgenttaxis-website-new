import { supabaseServer } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import Link from 'next/link';
import { format } from 'date-fns';
import { revalidatePath } from 'next/cache';

// Server Actions
async function updateBookingStatus(formData: FormData) {
  'use server';
  const supabase = await supabaseServer();
  const id = formData.get('booking_id') as string;
  const status = formData.get('status') as string;
  
  await supabase.from('bookings').update({ status }).eq('id', id);
  
  // Insert audit log
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'UPDATE_BOOKING_STATUS',
      entity_name: 'bookings',
      entity_id: id,
      new_values: { status }
    });
  }
  revalidatePath(`/admin/bookings/${id}`);
}

async function updatePaymentStatus(formData: FormData) {
  'use server';
  const supabase = await supabaseServer();
  const id = formData.get('booking_id') as string;
  const payment_status = formData.get('payment_status') as string;
  
  await supabase.from('bookings').update({ payment_status }).eq('id', id);
  revalidatePath(`/admin/bookings/${id}`);
}

async function addInternalRemark(formData: FormData) {
  'use server';
  const supabase = await supabaseServer();
  const id = formData.get('booking_id') as string;
  const remark = formData.get('remark') as string;
  
  if (remark) {
    await supabase.from('booking_remarks').insert({
      booking_id: id,
      remark,
      created_by: (await supabase.auth.getUser()).data.user?.id
    });
    revalidatePath(`/admin/bookings/${id}`);
  }
}

async function assignDriver(formData: FormData) {
  'use server';
  const supabase = await supabaseServer();
  const id = formData.get('booking_id') as string;
  const driver_id = formData.get('driver_id') as string;
  await supabase.from('bookings').update({ driver_id: driver_id || null }).eq('id', id);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('audit_logs').insert({
      user_id: user.id, action: 'ASSIGN_DRIVER', entity_name: 'bookings', entity_id: id, new_values: { driver_id: driver_id || null }
    });
  }
  revalidatePath(`/admin/bookings/${id}`);
}

async function assignVehicle(formData: FormData) {
  'use server';
  const supabase = await supabaseServer();
  const id = formData.get('booking_id') as string;
  const vehicle_id = formData.get('actual_fleet_id') as string;
  await supabase.from('bookings').update({ actual_fleet_id: vehicle_id || null }).eq('id', id);

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('audit_logs').insert({
      user_id: user.id, action: 'ASSIGN_VEHICLE', entity_name: 'bookings', entity_id: id, new_values: { actual_fleet_id: vehicle_id || null }
    });
  }
  revalidatePath(`/admin/bookings/${id}`);
}

async function assignVendor(formData: FormData) {
  'use server';
  const supabase = await supabaseServer();
  const id = formData.get('booking_id') as string;
  const vendor_id = formData.get('vendor_id') as string;
  await supabase.from('bookings').update({ vendor_id: vendor_id || null }).eq('id', id);

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('audit_logs').insert({
      user_id: user.id, action: 'ASSIGN_VENDOR', entity_name: 'bookings', entity_id: id, new_values: { vendor_id: vendor_id || null }
    });
  }
  revalidatePath(`/admin/bookings/${id}`);
}

export default async function BookingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await supabaseServer();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const currentUser = {
    email: user.email,
    fullName: profile?.full_name || user.email?.split('@')[0],
    roles: ['admin'],
  };

  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      *,
      customers ( full_name, phone, email ),
      vehicle_categories ( name ),
      actual_fleet ( id, registration_number ),
      drivers ( id, full_name, phone ),
      vendors ( id, company_name ),
      booking_remarks ( id, remark, created_at, created_by )
    `)
    .eq('id', resolvedParams.id)
    .single();

  if (error || !booking) notFound();

  // Fetch available entities for assignment
  const { data: allDrivers } = await supabase.from('drivers').select('id, full_name, is_active').eq('is_active', true);
  const { data: allFleet } = await supabase.from('actual_fleet').select('id, registration_number, status').eq('status', 'available');
  const { data: allVendors } = await supabase.from('vendors').select('id, company_name');

  return (
    <AdminShell user={currentUser}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/admin/bookings" className="text-slate-400 hover:text-white">&larr; Back</Link>
              <h1 className="text-2xl font-bold text-white tracking-tight">Booking #{booking.reference_number}</h1>
              <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${booking.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                {booking.status}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Created on {format(new Date(booking.created_at), 'PPP pp')}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">
              Export PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Trip Details */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="font-bold text-white">Trip Details</h3>
              </div>
              <div className="p-6 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Pickup</p>
                  <p className="text-sm text-white font-medium">{booking.pickup_location_name}</p>
                  <p className="text-xs text-slate-400 mt-1">{booking.pickup_datetime ? format(new Date(booking.pickup_datetime), 'PPP pp') : 'TBD'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Drop</p>
                  <p className="text-sm text-white font-medium">{booking.drop_location_name}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Trip Type</p>
                  <p className="text-sm text-white font-medium capitalize">{booking.trip_type?.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Vehicle Category</p>
                  <p className="text-sm text-white font-medium">{booking.vehicle_categories?.name || 'Not Specified'}</p>
                </div>
              </div>
            </div>

            {/* Dispatch / Assignment */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="font-bold text-white">Dispatch & Assignment</h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Driver */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Assigned Driver</p>
                  {booking.drivers ? (
                    <div>
                      <p className="text-sm font-bold text-white">{booking.drivers.full_name}</p>
                      <p className="text-xs text-slate-400">{booking.drivers.phone}</p>
                      <form action={assignDriver} className="mt-2">
                        <input type="hidden" name="booking_id" value={booking.id} />
                        <input type="hidden" name="driver_id" value="" />
                        <button type="submit" className="text-xs text-red-400 hover:text-red-300">Remove</button>
                      </form>
                    </div>
                  ) : (
                    <form action={assignDriver} className="flex flex-col gap-2 mt-2">
                      <input type="hidden" name="booking_id" value={booking.id} />
                      <select name="driver_id" className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded p-1.5" required>
                        <option value="">Select Driver</option>
                        {allDrivers?.map(d => (
                          <option key={d.id} value={d.id}>{d.full_name}</option>
                        ))}
                      </select>
                      <button type="submit" className="w-full bg-brand-blue hover:bg-blue-600 text-white rounded text-xs py-1 font-bold">Assign</button>
                    </form>
                  )}
                </div>

                {/* Vehicle */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Assigned Vehicle</p>
                  {booking.actual_fleet ? (
                    <div>
                      <p className="text-sm font-bold text-white">{booking.actual_fleet.registration_number}</p>
                      <form action={assignVehicle} className="mt-2">
                        <input type="hidden" name="booking_id" value={booking.id} />
                        <input type="hidden" name="actual_fleet_id" value="" />
                        <button type="submit" className="text-xs text-red-400 hover:text-red-300">Remove</button>
                      </form>
                    </div>
                  ) : (
                    <form action={assignVehicle} className="flex flex-col gap-2 mt-2">
                      <input type="hidden" name="booking_id" value={booking.id} />
                      <select name="actual_fleet_id" className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded p-1.5" required>
                        <option value="">Select Vehicle</option>
                        {allFleet?.map(v => (
                          <option key={v.id} value={v.id}>{v.registration_number}</option>
                        ))}
                      </select>
                      <button type="submit" className="w-full bg-brand-blue hover:bg-blue-600 text-white rounded text-xs py-1 font-bold">Assign</button>
                    </form>
                  )}
                </div>

                {/* Vendor */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Assigned Vendor</p>
                  {booking.vendors ? (
                    <div>
                      <p className="text-sm font-bold text-white">{booking.vendors.company_name}</p>
                      <form action={assignVendor} className="mt-2">
                        <input type="hidden" name="booking_id" value={booking.id} />
                        <input type="hidden" name="vendor_id" value="" />
                        <button type="submit" className="text-xs text-red-400 hover:text-red-300">Remove</button>
                      </form>
                    </div>
                  ) : (
                    <form action={assignVendor} className="flex flex-col gap-2 mt-2">
                      <input type="hidden" name="booking_id" value={booking.id} />
                      <select name="vendor_id" className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded p-1.5" required>
                        <option value="">Select Vendor</option>
                        {allVendors?.map(v => (
                          <option key={v.id} value={v.id}>{v.company_name}</option>
                        ))}
                      </select>
                      <button type="submit" className="w-full bg-brand-blue hover:bg-blue-600 text-white rounded text-xs py-1 font-bold">Assign</button>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* Internal Remarks */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="font-bold text-white">Internal Remarks & Activity</h3>
              </div>
              <div className="p-6 space-y-4">
                {booking.booking_remarks?.map((remark: any) => (
                  <div key={remark.id} className="bg-slate-900/30 p-3 rounded-lg border border-slate-800 text-sm">
                    <p className="text-slate-300">{remark.remark}</p>
                    <p className="text-xs text-slate-500 mt-2">Added on {format(new Date(remark.created_at), 'PPP pp')}</p>
                  </div>
                ))}
                
                <form action={addInternalRemark} className="mt-4 flex gap-2">
                  <input type="hidden" name="booking_id" value={booking.id} />
                  <input type="text" name="remark" placeholder="Add an internal note..." required className="flex-1 bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2 text-sm" />
                  <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold">Add</button>
                </form>
              </div>
            </div>

          </div>

          <div className="space-y-6">
            
            {/* Customer Details */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="font-bold text-white">Customer Details</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Name</p>
                  <p className="text-sm text-white font-medium">{booking.customers?.full_name || 'Guest User'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Phone</p>
                  <p className="text-sm text-white font-medium">{booking.customers?.phone || booking.customer_phone}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Email</p>
                  <p className="text-sm text-white font-medium">{booking.customers?.email || booking.customer_email || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="font-bold text-white">Payment & Status</h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Total Fare</p>
                  <p className="text-3xl font-black text-brand-green">₹{booking.total_fare}</p>
                </div>

                <form action={updatePaymentStatus} className="space-y-2">
                  <input type="hidden" name="booking_id" value={booking.id} />
                  <label className="text-xs font-bold text-slate-500 uppercase">Payment Status</label>
                  <div className="flex gap-2">
                    <select name="payment_status" defaultValue={booking.payment_status} className="flex-1 bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm">
                      <option value="pending">Pending</option>
                      <option value="partial">Partial / Advance</option>
                      <option value="paid">Fully Paid</option>
                      <option value="refunded">Refunded</option>
                    </select>
                    <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-sm font-bold">Save</button>
                  </div>
                </form>

                <form action={updateBookingStatus} className="space-y-2 pt-4 border-t border-slate-800">
                  <input type="hidden" name="booking_id" value={booking.id} />
                  <label className="text-xs font-bold text-slate-500 uppercase">Booking Status</label>
                  <div className="flex gap-2">
                    <select name="status" defaultValue={booking.status} className="flex-1 bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm">
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="assigned">Assigned</option>
                      <option value="on_trip">On Trip</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-sm font-bold">Update</button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AdminShell>
  );
}
