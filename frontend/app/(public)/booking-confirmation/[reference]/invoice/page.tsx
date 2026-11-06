import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { headers } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/admin';
import InvoicePrintToolbar from '@/components/public/InvoicePrintToolbar';
import { BUSINESS_CONFIG } from '@/lib/config';
import { getClientIp, checkLookupRateLimit, recordFailedLookup } from '@/lib/security/rate-limiter';
import { maskCustomerName, maskPhoneNumber, maskEmailAddress, maskAddress } from '@/lib/security/masking';

export const metadata = {
  title: 'Booking Invoice & Quotation | Urgent Taxis',
  description: 'Download or print your official Urgent Taxis booking invoice and journey quotation.',
};

export default async function BookingInvoicePage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const cleanRef = reference?.trim();

  // SEC-02: Rate limiting check to protect against reference probing
  const headerList = await headers();
  const clientIp = getClientIp(headerList);
  const rateLimitStatus = await checkLookupRateLimit(clientIp);

  if (!rateLimitStatus.allowed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full">
          <h2 className="text-xl font-bold mb-3 text-slate-900">Too Many Lookup Requests</h2>
          <p className="text-slate-600 mb-6 text-sm">
            For security, invoice lookups from your network are temporarily limited. Please retry in {rateLimitStatus.retryAfterSeconds} seconds.
          </p>
          <Link href="/" className="px-6 py-3 bg-brand-blue text-white rounded-xl font-bold inline-block">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Strict validation of booking reference to prevent arbitrary parameter manipulation
  if (!cleanRef || !/^UT-[A-Za-z0-9_-]+$/i.test(cleanRef)) {
    await recordFailedLookup(clientIp);
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full">
          <h2 className="text-xl font-bold mb-3 text-slate-900">Invalid Booking Reference</h2>
          <p className="text-slate-600 mb-6 text-sm">The invoice reference format is invalid.</p>
          <Link href="/" className="px-6 py-3 bg-brand-blue text-white rounded-xl font-bold inline-block">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const adminClient = supabaseAdmin();

  // Query authoritative booking and fare snapshot on server
  const { data: booking } = await adminClient
    .from('bookings')
    .select(`
      *,
      customers (
        full_name,
        phone,
        email
      ),
      vehicle_categories (
        name
      ),
      fare_snapshots (
        customer_payable,
        token_amount,
        balance_amount,
        breakdown_json
      ),
      payments (
        amount,
        status,
        payment_mode,
        transaction_reference,
        created_at
      )
    `)
    .eq('booking_reference', cleanRef)
    .single();

  if (!booking) {
    await recordFailedLookup(clientIp);
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full">
          <h2 className="text-xl font-bold mb-3 text-slate-900">Invoice Not Found</h2>
          <p className="text-slate-600 mb-6 text-sm">
            No booking record exists for reference <strong className="tabular-nums text-slate-800">{cleanRef}</strong>.
          </p>
          <Link href="/" className="px-6 py-3 bg-brand-blue text-white rounded-xl font-bold inline-block">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Authoritative financial extraction from immutable fare snapshot (handles object or array)
  const rawSnapshot = booking.fare_snapshots;
  const snapshot = Array.isArray(rawSnapshot) ? (rawSnapshot[0] || {}) : (rawSnapshot || {});
  const breakdown = snapshot.breakdown_json || {};
  const selectedAddOns: Array<{ id: string; name: string; price: number; disclaimer?: string }> = breakdown.addOns || [];
  const addOnTotal = breakdown.addOnTotal ?? (selectedAddOns.length * 300);
  const baseVehicleFare = breakdown.baseVehicleFare ?? (snapshot.customer_payable ? Math.max(0, snapshot.customer_payable - addOnTotal) : 0);
  const customerPayable = snapshot.customer_payable || 0;
  const tokenAmount = snapshot.token_amount || 0;
  const balanceAmount = snapshot.balance_amount || 0;

  // Payments Ledger
  const successfulPayments = booking.payments?.filter((p: any) => p.status === 'success') || [];
  const totalPaid = successfulPayments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
  const remainingBalance = Math.max(0, customerPayable - totalPaid);

  // Document Classification
  const isPaidOrPartial = booking.payment_status === 'paid' || booking.payment_status === 'partially_paid' || totalPaid > 0;
  const documentTitle = isPaidOrPartial ? 'Tax Invoice / Payment Receipt' : 'Proforma Invoice & Booking Quotation';
  const invoiceNumber = `INV-${booking.booking_reference}`;

  // SEC-01: Sensitive customer PII masked for public unauthenticated views
  const maskedName = maskCustomerName(booking.customers?.full_name);
  const maskedPhone = maskPhoneNumber(booking.customers?.phone);
  const maskedEmail = maskEmailAddress(booking.customers?.email);
  const maskedPickup = maskAddress(booking.pickup_address);
  const maskedDrop = maskAddress(booking.drop_address);

  // Parse intermediate stops
  let intermediateStops: string[] = breakdown.intermediateStops || [];
  if (intermediateStops.length === 0 && booking.special_instructions?.includes('Stops:')) {
    const match = booking.special_instructions.match(/Stops:\s*([^|\]]+)/i);
    if (match && match[1]) {
      intermediateStops = match[1].split('➔').map((s: string) => s.trim()).filter(Boolean);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white text-slate-900 font-sans print:py-0">
      {/* Interactive Toolbar (Hidden during print / PDF rendering) */}
      <InvoicePrintToolbar bookingReference={booking.booking_reference} documentTitle={documentTitle} />

      {/* Main A4 Printable Document Container */}
      <div className="max-w-4xl mx-auto my-6 sm:my-8 print:my-0 p-6 sm:p-10 bg-white border border-slate-200 print:border-none shadow-sm rounded-xl print:rounded-none print:shadow-none">
        
        {/* Header: Official Branding & Approved Contact Info */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-slate-900 gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
              <Image
                src="/logo.jpg"
                alt="Urgent Taxis Official Logo"
                fill
                priority
                sizes="80px"
                className="object-contain"
              />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-brand-blue tracking-tight block">URGENT TAXIS</span>
              <span className="text-[11px] sm:text-xs text-slate-500 font-medium block">
                Fast To Your Destination – Your Quick Ride Solution!
              </span>
              <span className="text-[11px] text-slate-600 block mt-1">
                Desk: 2nd Floor, Block B, Sector 62, Noida, Uttar Pradesh 201309
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-600 space-y-1">
            <p><strong>Phone / 24x7 Desk:</strong> +91 93117 76363</p>
            <p><strong>Support Email:</strong> info@urgenttaxis.in</p>
            <p><strong>Official Web:</strong> www.urgenttaxis.in</p>
            <p className="text-[11px] text-slate-400 tabular-nums">Operations: Ghaziabad • Noida • Delhi NCR</p>
          </div>
        </div>

        {/* Document Title Banner & Invoice Metadata */}
        <div className="my-6 p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase">
              {documentTitle}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isPaidOrPartial
                ? 'Official commercial trip receipt & verified payment confirmation.'
                : 'Provisional quotation. Token payment required to confirm commercial chauffeur reservation.'}
            </p>
          </div>

          <div className="text-left sm:text-right text-xs space-y-1 shrink-0">
            <p><span className="text-slate-500">Invoice No:</span> <strong className="tabular-nums text-slate-900">{invoiceNumber}</strong></p>
            <p><span className="text-slate-500">Booking Ref:</span> <strong className="tabular-nums text-brand-blue">{booking.booking_reference}</strong></p>
            <p><span className="text-slate-500">Date Issued:</span> <span className="text-slate-700">{new Date(booking.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></p>
            <p>
              <span className="text-slate-500">Status: </span>
              <span className={`inline-block font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
                booking.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                booking.payment_status === 'partially_paid' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                {booking.payment_status.replace('_', ' ')}
              </span>
            </p>
          </div>
        </div>

        {/* Customer Details & Journey Specifications Grid (SEC-01 Masked) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-200 text-xs">
          {/* Customer Info */}
          <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center mb-2.5">
              <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Billed To (Customer Details)</h2>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded">Privacy Protected</span>
            </div>
            <div className="space-y-1.5 tabular-nums">
              <p><span className="text-slate-500 block text-[10px] uppercase font-semibold font-sans">Name</span><strong className="text-sm text-slate-900">{maskedName}</strong></p>
              <p><span className="text-slate-500 block text-[10px] uppercase font-semibold font-sans">Contact Phone</span><span className="text-slate-800 font-medium">{maskedPhone}</span></p>
              <p><span className="text-slate-500 block text-[10px] uppercase font-semibold font-sans">Email</span><span className="text-slate-800">{maskedEmail}</span></p>
            </div>
          </div>

          {/* Journey Specs */}
          <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-200">
            <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">Journey & Vehicle Specifications</h2>
            <div className="space-y-1.5">
              <p><span className="text-slate-500 block text-[10px] uppercase font-semibold">Service Type</span><strong className="capitalize text-slate-900">{booking.trip_type.replace('_', ' ')} Service</strong></p>
              <p><span className="text-slate-500 block text-[10px] uppercase font-semibold">Assigned Vehicle Category</span><strong className="text-slate-900">{booking.vehicle_categories?.name || 'Commercial Sedan / SUV'}</strong></p>
              <div className="flex gap-4">
                <p><span className="text-slate-500 block text-[10px] uppercase font-semibold">Passengers</span><span className="text-slate-800 font-medium">{booking.passenger_count || 1} Persons</span></p>
                <p><span className="text-slate-500 block text-[10px] uppercase font-semibold">Luggage</span><span className="text-slate-800 font-medium">{booking.luggage_count || 0} Bags</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Route Details Card */}
        <div className="py-4 border-b border-slate-200 text-xs">
          <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Route Specifications</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-semibold block">Pickup Address</span>
              <p className="text-slate-900 font-medium mt-0.5">{maskedPickup}</p>
            </div>
            {maskedDrop && (
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Drop Address</span>
                <p className="text-slate-900 font-medium mt-0.5">{maskedDrop}</p>
              </div>
            )}
            {intermediateStops.length > 0 && (
              <div className="sm:col-span-2">
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Intermediate Stops</span>
                <p className="text-brand-blue font-semibold mt-0.5">{intermediateStops.join(' ➔ ')}</p>
              </div>
            )}
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-semibold block">Departure Schedule</span>
              <p className="text-slate-900 font-medium mt-0.5">{new Date(booking.pickup_datetime).toLocaleString('en-IN')}</p>
            </div>
            {booking.return_datetime && (
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Return Schedule</span>
                <p className="text-slate-900 font-medium mt-0.5">{new Date(booking.return_datetime).toLocaleString('en-IN')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Itemized Financial Charges Table (Authoritative Fare Snapshot) */}
        <div className="py-6 border-b border-slate-200">
          <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Itemized Fare Breakdown</h2>
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-center">Type</th>
                <th className="py-2.5 px-3 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr>
                <td className="py-2.5 px-3">
                  <strong className="block text-slate-900">Base Vehicle Fare</strong>
                  <span className="text-[11px] text-slate-500">Includes commercial cab rental, standard fuel allowance, and professional chauffeur.</span>
                </td>
                <td className="py-2.5 px-3 text-center text-slate-500">Mandatory</td>
                <td className="py-2.5 px-3 text-right tabular-nums font-semibold">₹{baseVehicleFare.toLocaleString('en-IN')}</td>
              </tr>

              {selectedAddOns.map((addon) => (
                <tr key={addon.id} className="bg-slate-50/40">
                  <td className="py-2.5 px-3">
                    <strong className="block text-slate-900">{addon.name}</strong>
                    {addon.disclaimer && (
                      <span className="text-[11px] text-slate-500 italic">{addon.disclaimer}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center text-brand-blue font-medium">Add-on</td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold">₹{addon.price.toLocaleString('en-IN')}</td>
                </tr>
              ))}

              {selectedAddOns.length > 0 && (
                <tr className="bg-slate-50 font-semibold text-slate-700 text-xs">
                  <td colSpan={2} className="py-2 px-3 text-right">Total Optional Add-on Charges:</td>
                  <td className="py-2 px-3 text-right tabular-nums">₹{addOnTotal.toLocaleString('en-IN')}</td>
                </tr>
              )}

              <tr className="bg-slate-100 font-bold text-slate-900 text-sm border-t-2 border-slate-300">
                <td colSpan={2} className="py-3 px-3 text-right">Total Customer Payable:</td>
                <td className="py-3 px-3 text-right tabular-nums text-brand-blue text-base font-black">₹{customerPayable.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment Policy Ledger (30% Token / 70% Balance) */}
        <div className="py-6 border-b border-slate-200">
          <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Payment Schedule & Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-lg">
              <span className="text-slate-600 block text-[10px] uppercase font-bold">30% Advance Token</span>
              <span className="text-base font-black text-brand-blue block mt-0.5">₹{tokenAmount.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-slate-500 block mt-1">Required to guarantee chauffeur reservation</span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-600 block text-[10px] uppercase font-bold">Verified Amount Paid</span>
              <span className="text-base font-black text-emerald-700 block mt-0.5">₹{totalPaid.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-slate-500 block mt-1">Recorded in platform payment ledger</span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-600 block text-[10px] uppercase font-bold">70% Balance Due</span>
              <span className="text-base font-black text-slate-900 block mt-0.5">₹{remainingBalance.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-slate-500 block mt-1">Payable directly to driver upon completion</span>
            </div>
          </div>

          {successfulPayments.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px]">
              <span className="font-bold text-slate-700 block mb-1">Payment Transactions:</span>
              <div className="space-y-1">
                {successfulPayments.map((p: any, idx: number) => (
                  <div key={p.id || idx} className="flex justify-between text-slate-600">
                    <span>Txn #{p.transaction_reference || 'REF-' + idx} ({p.payment_mode || 'UPI'}) on {new Date(p.created_at).toLocaleDateString('en-IN')}</span>
                    <strong className="text-emerald-700 tabular-nums">₹{Number(p.amount).toLocaleString('en-IN')} (Success)</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mandatory Exclusions & Inclusions */}
        <div className="py-6 border-b border-slate-200 text-xs">
          <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">Inclusions & Commercial Exclusions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-emerald-50/50 border border-emerald-200/60 rounded-lg">
              <span className="font-bold text-emerald-900 block mb-1">✓ Included in Base Fare</span>
              <ul className="list-disc list-inside space-y-0.5 text-emerald-950 text-[11px]">
                <li>Commercial vehicle hire with clean interior</li>
                <li>Fuel expenses for the booked itinerary</li>
                <li>Professional chauffeur service & driver allowance</li>
              </ul>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="font-bold text-slate-900 block mb-1">✕ Excluded (Charged at Actuals)</span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                <li>Fastag Toll Plaza fees & Expressway surcharges</li>
                <li>State border transport entry permits (tax at border)</li>
                <li>Airport terminal parking fees or MCD civic levies</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Operating Terms & Owner Disclaimers */}
        <div className="pt-6 text-[11px] text-slate-500 space-y-2">
          <p>
            <strong>Cancellation & Refund Policy:</strong> Advance tokens are 100% refundable if cancellation is requested at least 6 hours prior to the scheduled departure time via WhatsApp or phone desk.
          </p>
          <p>
            <strong>Vehicle Preference & Add-on Disclaimer:</strong> New Vehicle Preference guarantees a 2022–2024 model year vehicle or clean commercial equivalent. Chauffeur language preferences are assigned subject to dispatch corridor availability.
          </p>
          <p>
            <strong>Hill Travel Protocol:</strong> Air conditioning may be switched off temporarily on steep mountain gradients to ensure optimal engine power and road safety.
          </p>
          <p className="text-[10px] text-slate-400 italic">
            * Note: Urgent Taxis operates as a commercial transport dispatch service. Official GSTIN and registered corporate tax invoices are issued upon verified business request.
          </p>
        </div>

        {/* Document Footer */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2">
          <span>This is a computer-generated travel document. No physical signature required.</span>
          <span className="font-semibold text-slate-700">Urgent Taxis Desk: +91 93117 76363</span>
        </div>

      </div>
    </div>
  );
}
