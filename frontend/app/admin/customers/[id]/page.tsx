import { supabaseServer } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: customer, error } = await supabase
    .from('customers')
    .select(`
      *,
      bookings ( 
        id, reference_number, status, total_fare, created_at, 
        pickup_location, drop_location, pickup_datetime,
        vehicles:actual_fleet(registration_number),
        drivers(full_name)
      ),
      enquiries ( id, status, trip_type, created_at )
    `)
    .eq('id', resolvedParams.id)
    .single();

  if (error || !customer) notFound();

  // Basic aggregation
  const completedTrips = customer.bookings?.filter((b: any) => b.status === 'completed') || [];
  const cancelledTrips = customer.bookings?.filter((b: any) => b.status === 'cancelled') || [];
  const totalRevenue = completedTrips.reduce((acc: number, b: any) => acc + (b.total_fare || 0), 0);
  
  const totalEnquiries = customer.enquiries?.length || 0;
  const convertedEnquiries = customer.enquiries?.filter((e: any) => e.status === 'converted').length || 0;

  return (
    <AdminShell user={currentUser}>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/admin/customers" className="text-slate-400 hover:text-white">&larr; Back</Link>
              <h1 className="text-2xl font-bold text-white tracking-tight">{customer.full_name}</h1>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Customer since {format(new Date(customer.created_at), 'PPP')}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">
              Send Email
            </button>
            <button className="bg-brand-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">
              Create Booking
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Total Revenue (LTV)</p>
            <p className="text-3xl font-extrabold text-brand-green mt-2">₹{totalRevenue}</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Total Rides</p>
            <p className="text-3xl font-extrabold text-white mt-2">{completedTrips.length}</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Cancelled Rides</p>
            <p className="text-3xl font-extrabold text-red-500 mt-2">{cancelledTrips.length}</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Enquiries / Conversion</p>
            <p className="text-xl font-extrabold text-brand-blue mt-2 truncate">
              {convertedEnquiries} / {totalEnquiries} ({totalEnquiries > 0 ? Math.round((convertedEnquiries/totalEnquiries)*100) : 0}%)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Booking History */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                <h3 className="font-bold text-white">Ride History</h3>
              </div>
              <div className="p-0">
                <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-slate-800/50">
                    {customer.bookings?.map((b: any) => (
                      <tr key={b.id} className="hover:bg-slate-900/40">
                        <td className="p-4">
                          <div className="text-sm font-bold text-brand-blue">{b.reference_number}</div>
                          <div className="text-xs text-slate-500">{format(new Date(b.created_at), 'PPP')}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-xs text-slate-300 truncate max-w-[200px]"><span className="text-slate-500">From:</span> {b.pickup_location}</div>
                          <div className="text-xs text-slate-300 truncate max-w-[200px] mt-1"><span className="text-slate-500">To:</span> {b.drop_location || 'Local'}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-white font-bold">₹{b.total_fare}</div>
                          <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">{b.status}</div>
                        </td>
                        <td className="p-4 text-right">
                          <Link href={`/admin/bookings/${b.id}`} className="text-xs font-bold text-slate-400 hover:text-white">View</Link>
                        </td>
                      </tr>
                    ))}
                    {(!customer.bookings || customer.bookings.length === 0) && (
                      <tr><td colSpan={4} className="p-6 text-center text-slate-500 text-sm">No rides booked yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <div className="space-y-6">
            
            {/* Customer Details */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="font-bold text-white">Contact Information</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</p>
                  <p className="text-sm text-white font-medium">{customer.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Email Address</p>
                  <p className="text-sm text-white font-medium">{customer.email || 'Not Provided'}</p>
                </div>
              </div>
            </div>

            {/* Wallet & Credits (Placeholder for future Wallet Module) */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="font-bold text-white">Wallet & Credits</h3>
              </div>
              <div className="p-6">
                <div className="text-center p-4 border border-slate-800 border-dashed rounded-lg bg-slate-900/20">
                  <p className="text-sm text-slate-400">Available Credits</p>
                  <p className="text-2xl font-extrabold text-white mt-1">₹0.00</p>
                  <button className="mt-4 text-xs font-bold text-brand-blue hover:text-blue-400">Add Credit &rarr;</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AdminShell>
  );
}
