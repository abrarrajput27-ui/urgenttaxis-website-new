import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { SITE_CONFIG } from '@/lib/seo';
import DocumentUploadForm from '@/components/public/DocumentUploadForm';
import { getClientIp, checkLookupRateLimit, recordFailedLookup } from '@/lib/security/rate-limiter';
import { maskCustomerName, maskPhoneNumber, maskEmailAddress, maskAddress } from '@/lib/security/masking';

export default async function BookingConfirmationPage({ params }: { params: Promise<{ reference: string }> }) {
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
            For security, booking reference lookups from your network are temporarily limited. Please retry in {rateLimitStatus.retryAfterSeconds} seconds.
          </p>
          <Link href="/" className="px-6 py-3 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-xl font-bold inline-block">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Validate booking reference format to prevent SQL injection or arbitrary probe attacks
  if (!cleanRef || !/^UT-[A-Za-z0-9_-]+$/i.test(cleanRef)) {
    await recordFailedLookup(clientIp);
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full">
          <h2 className="text-xl font-bold mb-3 text-slate-900">Invalid Booking Reference</h2>
          <p className="text-slate-600 mb-6 text-sm">The booking reference format is invalid.</p>
          <Link href="/" className="px-6 py-3 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-xl font-bold inline-block">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const adminClient = supabaseAdmin();

  // Fetch booking details securely on server
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
          <h2 className="text-xl font-bold mb-3 text-slate-900">Booking Not Found</h2>
          <p className="text-slate-600 mb-6 text-sm">We couldn't find a booking with the reference <strong className="tabular-nums text-slate-800">{cleanRef}</strong>.</p>
          <Link href="/" className="px-6 py-3 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-xl font-bold inline-block">
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

  // Payments Ledger Calculation
  const payments = booking.payments?.filter((p: any) => p.status === 'success') || [];
  const totalPaid = payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
  const trueBalance = Math.max(0, customerPayable - totalPaid);

  // Check customer documents via separate safe query
  let documentsSubmitted = false;
  if (booking.customer_id) {
    const { data: docs } = await adminClient
      .from('customer_documents')
      .select('id, is_verified')
      .eq('customer_id', booking.customer_id);
    documentsSubmitted = Boolean(docs && docs.length > 0);
  }

  // SEC-01: Sensitive customer PII masked for public capability URL protection
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'pending': return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'cancelled': return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'completed': return 'bg-blue-50 text-blue-800 border-blue-200';
      default: return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'partially_paid': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'unpaid': return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'refunded': return 'bg-slate-50 text-slate-800 border-slate-200';
      default: return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  const isConfirmed = booking.status === 'confirmed';
  const isPaid = booking.payment_status === 'paid' || booking.payment_status === 'partially_paid';

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 text-center relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-2 ${isConfirmed ? 'bg-brand-green' : 'bg-brand-blue'}`}></div>
          
          <div className={`w-16 h-16 sm:w-20 sm:h-20 ${isConfirmed ? 'bg-green-50 text-brand-green' : 'bg-blue-50 text-brand-blue'} rounded-full flex items-center justify-center mx-auto mb-5`}>
            {isConfirmed ? (
              <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 tracking-tight">
            Booking {isConfirmed ? 'Confirmed' : 'Request Received'}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mb-6">
            Thank you, <strong className="text-slate-900 tabular-nums">{maskedName}</strong>! Your booking is currently <strong className="capitalize">{booking.status}</strong>.
          </p>
          
          {/* Key Reference Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center">
              <span className="text-[11px] text-slate-500 uppercase font-bold block mb-1">Booking Reference</span>
              <span className="text-base sm:text-lg font-black text-brand-blue tracking-wider tabular-nums">{booking.booking_reference}</span>
            </div>
            
            <div className={`border rounded-xl px-4 py-3 text-center ${getStatusColor(booking.status)}`}>
              <span className="text-[11px] uppercase font-bold block mb-1">Booking Status</span>
              <span className="text-base sm:text-lg font-black tracking-wider capitalize">{booking.status.replace('_', ' ')}</span>
            </div>

            <div className={`border rounded-xl px-4 py-3 text-center ${getPaymentStatusColor(booking.payment_status)}`}>
              <span className="text-[11px] uppercase font-bold block mb-1">Payment Status</span>
              <span className="text-base sm:text-lg font-black tracking-wider capitalize">{booking.payment_status.replace('_', ' ')}</span>
            </div>
          </div>

          {/* Customer & Booking Metadata (SEC-01 Masked) */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 sm:p-5 text-left mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer & Booking Information</h2>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded">Privacy Protected</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs sm:text-sm">
              <div>
                <span className="text-slate-500 block text-[11px] font-semibold uppercase">Customer Name</span>
                <strong className="text-slate-900 tabular-nums">{maskedName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px] font-semibold uppercase">Contact Phone</span>
                <strong className="text-slate-900 tabular-nums">{maskedPhone}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px] font-semibold uppercase">Email</span>
                <span className="text-slate-700 tabular-nums">{maskedEmail}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px] font-semibold uppercase">Booking Date</span>
                <span className="text-slate-700">{new Date(booking.created_at).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px] font-semibold uppercase">Service Category</span>
                <strong className="text-slate-900 capitalize">{booking.trip_type.replace('_', ' ')}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px] font-semibold uppercase">Assigned Vehicle</span>
                <strong className="text-slate-900">{booking.vehicle_categories?.name || 'Standard Commercial'}</strong>
              </div>
            </div>
          </div>

          {/* Journey Specifications Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-6">
            <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 uppercase font-bold block mb-2">Route & Locations</span>
              <div className="space-y-2 text-xs sm:text-sm">
                <div>
                  <span className="font-bold text-slate-700 block">Pickup Location:</span>
                  <p className="text-slate-900 font-medium">{maskedPickup}</p>
                </div>
                {intermediateStops.length > 0 && (
                  <div>
                    <span className="font-bold text-slate-700 block">Intermediate Stops:</span>
                    <p className="text-brand-blue font-medium">{intermediateStops.join(' ➔ ')}</p>
                  </div>
                )}
                {maskedDrop && (
                  <div>
                    <span className="font-bold text-slate-700 block">Drop Location:</span>
                    <p className="text-slate-900 font-medium">{maskedDrop}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 uppercase font-bold block mb-2">Schedule & Capacity</span>
              <div className="space-y-2 text-xs sm:text-sm">
                <div>
                  <span className="font-bold text-slate-700 block">Departure Date & Time:</span>
                  <p className="text-slate-900 font-medium">{new Date(booking.pickup_datetime).toLocaleString('en-IN')}</p>
                </div>
                {booking.return_datetime && (
                  <div>
                    <span className="font-bold text-slate-700 block">Return Schedule:</span>
                    <p className="text-slate-900 font-medium">{new Date(booking.return_datetime).toLocaleString('en-IN')}</p>
                  </div>
                )}
                <div className="flex gap-6 pt-1">
                  <div>
                    <span className="font-bold text-slate-700 block">Passengers:</span>
                    <p className="text-slate-900 font-medium">{booking.passenger_count || 1} Persons</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block">Luggage:</span>
                    <p className="text-slate-900 font-medium">{booking.luggage_count || 0} Bags</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Add-ons Line Items (Phase 3 Integration) */}
          {selectedAddOns.length > 0 && (
            <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 text-left mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[11px] text-slate-500 uppercase font-bold">Selected Optional Add-ons</span>
                <span className="text-xs font-bold text-slate-800">Total: ₹{addOnTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="divide-y divide-slate-200">
                {selectedAddOns.map((addon) => (
                  <div key={addon.id} className="py-2.5 flex justify-between items-start gap-4">
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">{addon.name}</span>
                      {addon.disclaimer && (
                        <span className="text-[11px] text-slate-500 italic block mt-0.5">{addon.disclaimer}</span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-slate-900 shrink-0 tabular-nums">₹{addon.price.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment & Financial Breakdown (Immutable Snapshot Authority) */}
          <div className="bg-brand-blue/5 border border-brand-blue/15 rounded-xl p-5 sm:p-6 text-left mb-6">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Financial Summary</h3>
            
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-center text-slate-600">
                <span>Base Vehicle Fare</span>
                <span className="font-semibold text-slate-900">₹{baseVehicleFare.toLocaleString('en-IN')}</span>
              </div>

              {selectedAddOns.length > 0 && (
                <div className="flex justify-between items-center text-slate-600">
                  <span>Vehicle Add-on Charges ({selectedAddOns.length} selected)</span>
                  <span className="font-semibold text-slate-900">+₹{addOnTotal.toLocaleString('en-IN')}</span>
                </div>
              )}
              
              <div className="h-px w-full bg-brand-blue/15 my-3"></div>

              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-base">Total Customer Payable</span>
                <span className="font-black text-brand-blue text-xl">₹{customerPayable.toLocaleString('en-IN')}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 mt-3 border-t border-brand-blue/15">
                <div className="bg-white p-3.5 rounded-lg border border-brand-blue/10">
                  <span className="text-[11px] text-slate-500 uppercase font-bold block">30% Advance Token Required</span>
                  <span className="text-lg font-black text-brand-blue block">₹{tokenAmount.toLocaleString('en-IN')}</span>
                  <span className="text-[11px] text-slate-500">Required to confirm cab reservation</span>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 uppercase font-bold block">70% Balance Due Chauffeur</span>
                  <span className="text-lg font-black text-slate-800 block">₹{trueBalance.toLocaleString('en-IN')}</span>
                  <span className="text-[11px] text-slate-500">Payable directly at destination</span>
                </div>
              </div>

              {payments.length > 0 && (
                <div className="mt-3 pt-3 border-t border-brand-blue/10 flex justify-between items-center text-xs">
                  <span className="text-emerald-700 font-semibold">Verified Payments Received:</span>
                  <span className="font-bold text-emerald-800 text-sm">₹{totalPaid.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          </div>

          {/* KYC Identity Verification Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left mb-6 flex gap-3.5 items-start">
            <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${documentsSubmitted ? 'text-brand-green' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {documentsSubmitted ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              )}
            </svg>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5">Identity Verification (KYC)</p>
              <p className="text-xs text-slate-600">
                {documentsSubmitted 
                  ? 'Your identity document has been securely received.'
                  : 'Action Required: Please upload your Aadhaar, PAN, or Passport to verify your identity before the trip.'}
              </p>
            </div>
          </div>
          
          {booking.status === 'pending' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left mb-6 flex gap-3.5 items-start">
              <svg className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5">Action Required: Pay 30% Token to Confirm</p>
                <p className="text-xs text-slate-600">
                  Your booking is currently <strong>PENDING</strong>. Please contact our support team via WhatsApp or Phone to complete your ₹{tokenAmount.toLocaleString('en-IN')} token payment and instantly confirm your commercial chauffeur.
                </p>
              </div>
            </div>
          )}

          {!documentsSubmitted && (
            <div className="mb-6">
              <DocumentUploadForm bookingReference={booking.booking_reference} />
            </div>
          )}

          {/* Action CTAs: Invoice Download, WhatsApp Payment & Return Home */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch pt-2">
            <Link
              href={`/booking-confirmation/${booking.booking_reference}/invoice`}
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download {isPaid ? 'Tax Invoice (PDF)' : 'Quotation & Invoice (PDF)'}
            </Link>

            <a 
              href={`https://wa.me/${SITE_CONFIG.whatsappRaw || '918595066033'}?text=${encodeURIComponent([
                '🚖 *URGENT TAXIS — BOOKING CONFIRMATION & TOKEN PAYMENT*',
                '━━━━━━━━━━━━━━━━━━━━',
                '✨ *Fast To Your Destination – Your Quick Ride Solution!*',
                '',
                '📋 *CONFIRMED BOOKING DETAILS*',
                `• 🔖 *Booking Ref:* *${booking.booking_reference}*`,
                `• 🚗 *Service:* ${booking.trip_type.replace('_', ' ').toUpperCase()}`,
                `• 🚘 *Vehicle:* ${booking.vehicle_categories?.name || 'Commercial AC Cab'}`,
                `• 📍 *Pickup:* ${booking.pickup_address}`,
                booking.drop_address ? `• 🏁 *Drop:* ${booking.drop_address}` : '',
                `• 📅 *Date:* ${new Date(booking.pickup_datetime).toLocaleString('en-IN')}`,
                '',
                '💰 *PAYMENT BREAKDOWN*',
                `• 💳 *Total Fare:* *₹${customerPayable.toLocaleString('en-IN')}*`,
                `• 🟢 *30% Advance Token:* *₹${tokenAmount.toLocaleString('en-IN')}* (To Pay Now)`,
                `• ⚪ *70% Driver Balance:* *₹${trueBalance.toLocaleString('en-IN')}* (At Pickup)`,
                '',
                '🧾 *DIGITAL INVOICE & RECEIPT:*',
                `https://www.urgenttaxis.in/booking-confirmation/${booking.booking_reference}/invoice`,
                '',
                '📞 *24x7 Helpline:* +91 7310651940 | Masuri, Ghaziabad',
                '💬 *WhatsApp Desk:* +91 8595066033',
                '',
                'Please share UPI payment details / QR code to dispatch cab! ✨'
              ].filter(Boolean).join('\n'))}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-brand-green hover:bg-brand-green-hover text-white font-bold rounded-xl shadow-lg shadow-brand-green/20 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
              </svg>
              Pay Token via WhatsApp
            </a>

            <Link 
              href="/"
              className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all text-sm text-center"
            >
              Return Home
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
