import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { headers } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/admin';
import InvoicePrintToolbar from '@/components/public/InvoicePrintToolbar';
import { BUSINESS_CONFIG } from '@/lib/config';
import { getClientIp, checkLookupRateLimit, recordFailedLookup } from '@/lib/security/rate-limiter';
import { maskCustomerName, maskPhoneNumber, maskEmailAddress, maskAddress } from '@/lib/security/masking';
import { getVehicleProfile } from '@/lib/fleet-mapping';

export const metadata = {
  title: 'Official Tax Invoice & Receipt | Urgent Taxis',
  description: 'Download or print your official Urgent Taxis booking invoice and payment receipt.',
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

  // Authoritative financial extraction from immutable fare snapshot
  const rawSnapshot = booking.fare_snapshots;
  const snapshot = Array.isArray(rawSnapshot) ? (rawSnapshot[0] || {}) : (rawSnapshot || {});
  const breakdown = snapshot.breakdown_json || {};
  const selectedAddOns: Array<{ id: string; name: string; price: number; disclaimer?: string }> = breakdown.addOns || [];
  const addOnTotal = breakdown.addOnTotal ?? (selectedAddOns.length * 300);
  const customerPayable = snapshot.customer_payable || 0;
  const baseVehicleFare = breakdown.baseVehicleFare ?? (customerPayable ? Math.max(0, customerPayable - addOnTotal) : 0);
  const tokenAmount = snapshot.token_amount || 0;
  const balanceAmount = snapshot.balance_amount || 0;

  // Exact GST (5%) itemized calculation
  // Base fare is inclusive of 5% GST (Ministry of Finance passenger road transport rate)
  const gstAmount = Math.round((baseVehicleFare * 0.05) / 1.05);
  const taxableBaseFare = baseVehicleFare - gstAmount;
  const cgstAmount = Math.round(gstAmount / 2);
  const sgstAmount = gstAmount - cgstAmount;

  // Payments Ledger
  const successfulPayments = booking.payments?.filter((p: any) => p.status === 'success') || [];
  const totalPaid = successfulPayments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
  const remainingBalance = Math.max(0, customerPayable - totalPaid);

  // Dynamic trip-type detection
  const rawTripType = String(booking.trip_type || booking.service_type || 'one_way').toLowerCase();
  const isOneWay = rawTripType.includes('one_way') || rawTripType.includes('one-way') || rawTripType === 'one way';
  const isRoundTrip = rawTripType.includes('round_trip') || rawTripType.includes('round-trip') || rawTripType === 'round trip';
  const isRental = rawTripType.includes('rental') || rawTripType.includes('local');
  const isAirport = rawTripType.includes('airport');

  // Dynamic Inclusions & Exclusions based on trip type (Exact MMT Conditions)
  const tripInclusions = isOneWay
    ? [
        'Commercial AC vehicle hire with verified professional chauffeur',
        'Fuel expenses for the complete booked corridor itinerary',
        'All National & State Highway FASTag Toll Plaza Taxes Included',
        'Inter-State border commercial passenger entry permits Included',
        `Chauffeur daily allowance & GST (5% - ₹${gstAmount.toLocaleString('en-IN')}) Included`,
      ]
    : isRoundTrip
    ? [
        'Commercial AC vehicle hire with verified professional chauffeur',
        'Minimum 250 km/day daily travel quota (garage-to-garage)',
        'Driver daily allowance for all journey days Included',
        `Statutory GST (5% - ₹${gstAmount.toLocaleString('en-IN')}) Included in vehicle rental`,
      ]
    : isRental
    ? [
        'Full city package hours and kilometers included',
        'Unlimited local city stops within package limits',
        'Chauffeur daily maintenance & fuel charges included',
        `GST (5% - ₹${gstAmount.toLocaleString('en-IN')}) Included in package fare`,
      ]
    : [
        'Direct airport terminal pickup or drop with chauffeur',
        'Dedicated airport terminal arrival entry slip & toll clearance',
        '60 minutes complimentary flight arrival waiting time',
        `GST (5% - ₹${gstAmount.toLocaleString('en-IN')}) & chauffeur allowance included`,
      ];

  const tripExclusions = isOneWay
    ? [
        'Airport / Railway station parking charges (payable at actuals if incurred)',
        'Extra kilometers beyond booked drop destination charged as per vehicle rate',
        'Waiting charges beyond scheduled highway halts (₹150/hr after first 30 mins)',
        'Multiple off-corridor detour stops outside direct highway route',
      ]
    : isRoundTrip
    ? [
        'FASTag Highway Toll Taxes & State Border Entry Taxes paid directly at actual toll plazas',
        'Airport / Hotel / Monument parking tickets payable at actuals',
        'Kilometers driven beyond daily minimum quota charged as per vehicle rate',
        'Driver night allowance (₹300/night if travel spans between 10:00 PM and 06:00 AM)',
      ]
    : isRental
    ? [
        'Extra distance beyond package limit charged as per vehicle standard per-km rate',
        'Extra hours beyond package duration charged at ₹150 - ₹300/hour',
        'Parking tickets and toll plaza fees payable at actuals',
      ]
    : [
        'Terminal parking charges beyond complimentary 60 minutes paid at actuals',
        'Extra local stops or route extensions outside booked corridor',
      ];

  // Dynamic Terms & Conditions based on trip type
  const tripTerms = isOneWay
    ? [
        { title: 'Doorstep Pickup & Direct Drop', desc: 'Chauffeur arrives at your exact scheduled address. Covers direct highway transit to destination with reasonable refreshment halts.' },
        { title: 'Tolls & State Permits Covered', desc: 'All standard electronic FASTag toll plaza taxes and inter-state passenger vehicle entry permits are prepaid and included.' },
        { title: '100% Refundable Token', desc: 'Advance token payment is 100% refundable if cancellation is notified 24 hours prior to scheduled departure.' },
        { title: 'Hill Route AC Protocol', desc: 'Air conditioning may be switched off temporarily on steep mountain hairpin inclines to ensure engine power and maximum road safety.' },
      ]
    : isRoundTrip
    ? [
        { title: 'Daily Travel Quota Baseline', desc: 'Outstation round-trips are based on a minimum daily average of 250 km. Garage-to-garage return distance applies.' },
        { title: 'Tolls & State Taxes at Actuals', desc: 'FASTag toll plaza fees, state border entry taxes, and parking fees must be paid directly by the passenger at actual plaza receipts.' },
        { title: 'Night Driving Allowance', desc: 'A driver night allowance of ₹300 per night applies if the journey spans between 10:00 PM and 06:00 AM.' },
        { title: '100% Refundable Token', desc: 'Advance token is fully refundable if booking cancellation is notified 24 hours before pickup time.' },
      ]
    : isRental
    ? [
        { title: 'Package Hours & Kilometers', desc: 'Local hourly rental starts from the scheduled reporting time and initial odometer reading at pickup.' },
        { title: 'Extra Usage Billing', desc: 'Kilometers and hours consumed beyond package limits will be billed at standard extra-km and extra-hour rates upon trip completion.' },
        { title: 'Toll & Parking Fees', desc: 'Any parking plaza fees or municipal entry fees incurred during local city travel are payable at actuals by the passenger.' },
        { title: '100% Refundable Token', desc: 'Cancellation requested 24 hours prior to reporting time receives a 100% advance token refund.' },
      ]
    : [
        { title: 'Flight Delay & Waiting Policy', desc: 'Urgent Taxis monitors live flight touchdown timings. We provide up to 60 minutes of complimentary waiting after flight landing.' },
        { title: 'Terminal Entry Slip Included', desc: 'Official airport terminal arrival lane entry permit is prepaid and included in your transfer quote.' },
        { title: '100% Refundable Token', desc: 'Token is 100% refundable if cancelled at least 24 hours before scheduled airport transfer.' },
      ];

  // Document Classification (Works for both initial reservation & trip-end completion)
  const isFullyPaid = booking.payment_status === 'paid' || remainingBalance === 0;
  const isTripCompleted = booking.status === 'completed';
  const vehicleProfile = getVehicleProfile(booking.vehicle_categories?.name);

  const documentTitle = isTripCompleted
    ? 'Official Tax Invoice & Trip Completion Receipt'
    : isFullyPaid
    ? 'Official Tax Invoice & Verified Payment Receipt'
    : 'Proforma Tax Invoice & Booking Confirmation';

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
      {/* Print-specific style rules to guarantee ONLY the invoice card prints */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body, html {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            color: #000000 !important;
            font-size: 11pt !important;
          }
          header, footer, nav, aside, .print\\:hidden {
            display: none !important;
          }
          .invoice-sheet {
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          .page-break-inside-avoid {
            page-break-inside: avoid;
          }
        }
      `}} />

      {/* Interactive Toolbar (Strictly hidden during PDF / Print export) */}
      <InvoicePrintToolbar bookingReference={booking.booking_reference} documentTitle={documentTitle} />

      {/* Main A4 Printable Document Container */}
      <div className="invoice-sheet max-w-4xl mx-auto my-6 sm:my-8 print:my-0 p-6 sm:p-10 bg-white border border-slate-200 print:border-none shadow-md rounded-2xl print:rounded-none print:shadow-none">
        
        {/* Top Colorful Header Gradient Stripe */}
        <div className="h-2.5 w-full bg-gradient-to-r from-brand-blue via-emerald-500 to-brand-green rounded-t-xl -mt-6 sm:-mt-10 -mx-6 sm:-mx-10 mb-6 sm:mb-8 print:hidden" />

        {/* Header: Brand Logo & Registered Helpline Desk */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-brand-blue/30 gap-6">
          <div className="space-y-2">
            <div className="relative w-56 sm:w-64 h-16 sm:h-20 shrink-0">
              <Image
                src="/logo.jpg"
                alt="Urgent Taxis Official Logo"
                fill
                priority
                sizes="260px"
                className="object-contain object-left"
              />
            </div>
            <div className="text-[11px] text-slate-600 font-medium leading-relaxed">
              <strong className="text-slate-900 block font-bold">Urgent Taxis — Commercial Transport Desk</strong>
              Railway Station Road, Masuri, NH-9 Corridor, Ghaziabad, UP 201015
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-600 space-y-1 bg-gradient-to-br from-blue-50/70 to-emerald-50/50 p-4 rounded-2xl border border-blue-200/80 shrink-0 shadow-2xs">
            <p><strong className="text-slate-900">24x7 Transport Helpline:</strong> <span className="tabular-nums font-bold text-brand-blue">+91 7310651940</span></p>
            <p><strong className="text-slate-900">WhatsApp Dispatch Desk:</strong> <span className="tabular-nums font-bold text-emerald-700">+91 8595066033</span></p>
            <p><strong className="text-slate-900">Official Support Email:</strong> <span className="text-slate-700 font-medium">info@urgenttaxis.in</span></p>
            <p><strong className="text-slate-900">Online Portal:</strong> <span className="text-brand-blue font-bold">www.urgenttaxis.in</span></p>
            <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider pt-0.5">Govt. Verified Yellow-Plate Commercial Fleet</p>
          </div>
        </div>

        {/* Document Title Banner & Invoice Metadata */}
        <div className="my-6 p-4 sm:p-5 bg-gradient-to-r from-slate-50 via-blue-50/40 to-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-brand-blue text-white text-[10px] font-black uppercase tracking-wider mb-1.5">
              <span>{isTripCompleted ? 'Trip Completed' : isFullyPaid ? 'Payment Confirmed' : 'Booking Scheduled'}</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              {documentTitle}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isTripCompleted
                ? 'Official commercial trip receipt & verified payment confirmation.'
                : isFullyPaid
                ? 'Verified payment confirmation for scheduled commercial chauffeur reservation.'
                : 'Provisional quotation & booking confirmation. Token payment locks in chauffeur dispatch.'}
            </p>
          </div>

          <div className="text-left sm:text-right text-xs space-y-1 shrink-0 bg-white p-3 rounded-xl border border-slate-200">
            <p><span className="text-slate-500">Invoice No:</span> <strong className="tabular-nums text-slate-900 font-bold">{invoiceNumber}</strong></p>
            <p><span className="text-slate-500">Booking Ref:</span> <strong className="tabular-nums text-brand-blue font-black">{booking.booking_reference}</strong></p>
            <p><span className="text-slate-500">Date Issued:</span> <span className="text-slate-700 font-semibold">{new Date(booking.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></p>
            <p>
              <span className="text-slate-500">Status: </span>
              <span className={`inline-block font-black uppercase text-[10px] px-2.5 py-0.5 rounded-full ${
                isFullyPaid ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                booking.payment_status === 'partially_paid' ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-slate-100 text-slate-700 border border-slate-300'
              }`}>
                {booking.payment_status.replace('_', ' ')}
              </span>
            </p>
          </div>
        </div>

        {/* Customer Details & Journey Specifications Grid (SEC-01 Masked) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pb-6 border-b border-slate-200 text-xs">
          {/* Customer Info */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Billed To (Passenger Details)</h2>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">Privacy Protected</span>
            </div>
            <div className="space-y-1.5 tabular-nums">
              <p><span className="text-slate-500 block text-[10px] uppercase font-semibold font-sans">Name</span><strong className="text-sm text-slate-900 font-bold">{maskedName}</strong></p>
              <p><span className="text-slate-500 block text-[10px] uppercase font-semibold font-sans">Contact Phone</span><span className="text-slate-800 font-semibold">{maskedPhone}</span></p>
              <p><span className="text-slate-500 block text-[10px] uppercase font-semibold font-sans">Email</span><span className="text-slate-700">{maskedEmail}</span></p>
            </div>
          </div>

          {/* Journey Specs */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <h2 className="text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">Journey &amp; Vehicle Specifications</h2>
            <div className="space-y-1.5">
              <p><span className="text-slate-500 block text-[10px] uppercase font-semibold">Service Type</span><strong className="capitalize text-brand-blue font-bold text-sm">{booking.trip_type.replace('_', ' ')} Service</strong></p>
              <p><span className="text-slate-500 block text-[10px] uppercase font-semibold">Assigned Category</span><strong className="text-slate-900 font-bold">{booking.vehicle_categories?.name || 'Commercial Sedan / SUV'}</strong></p>
              <div className="flex gap-4">
                <p><span className="text-slate-500 block text-[10px] uppercase font-semibold">Passengers</span><span className="text-slate-800 font-semibold">{booking.passenger_count || 1} Persons</span></p>
                <p><span className="text-slate-500 block text-[10px] uppercase font-semibold">Luggage</span><span className="text-slate-800 font-semibold">{booking.luggage_count || 0} Bags</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Route Details Card */}
        <div className="py-4 border-b border-slate-200 text-xs">
          <h2 className="text-[11px] font-black text-slate-700 uppercase tracking-wider mb-2.5">Route &amp; Schedule Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Pickup Address</span>
              <p className="text-slate-900 font-semibold mt-0.5">{maskedPickup}</p>
            </div>
            {maskedDrop && (
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Drop Address</span>
                <p className="text-slate-900 font-semibold mt-0.5">{maskedDrop}</p>
              </div>
            )}
            {intermediateStops.length > 0 && (
              <div className="sm:col-span-2">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Intermediate Stops</span>
                <p className="text-brand-blue font-bold mt-0.5">{intermediateStops.join(' ➔ ')}</p>
              </div>
            )}
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Pickup Departure Schedule</span>
              <p className="text-slate-900 font-bold mt-0.5 tabular-nums">{new Date(booking.pickup_datetime).toLocaleString('en-IN')}</p>
            </div>
            {booking.return_datetime && (
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Return Departure Schedule</span>
                <p className="text-slate-900 font-bold mt-0.5 tabular-nums">{new Date(booking.return_datetime).toLocaleString('en-IN')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Selected Vehicle Showcase with Cutout & Specs */}
        <div className="my-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#101935] to-[#0a1128] text-white flex flex-col sm:flex-row items-center justify-between gap-5 shadow-sm border border-slate-800">
          <div className="relative w-44 h-24 sm:w-52 sm:h-28 shrink-0 flex items-center justify-center bg-white/5 rounded-2xl p-2 border border-white/10">
            <Image
              src={vehicleProfile.image}
              alt={vehicleProfile.title}
              width={220}
              height={110}
              className="max-h-24 w-auto object-contain drop-shadow"
            />
          </div>

          <div className="flex-1 space-y-1.5 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                {vehicleProfile.tag}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Assigned Vehicle Class
              </span>
            </div>
            <h3 className="text-base sm:text-xl font-black text-white">
              {vehicleProfile.title}
            </h3>
            <p className="text-xs text-slate-300 font-medium">
              {vehicleProfile.models}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-[11px] text-slate-200">
              <span className="bg-white/10 px-2.5 py-1 rounded-lg">👥 {vehicleProfile.seats}</span>
              <span className="bg-white/10 px-2.5 py-1 rounded-lg">🧳 {vehicleProfile.bags}</span>
              <span className="bg-emerald-400/20 text-emerald-300 px-2.5 py-1 rounded-lg font-bold">❄️ Chilled Dual AC</span>
              <span className="bg-blue-400/20 text-blue-300 px-2.5 py-1 rounded-lg font-bold">🚕 Commercial Yellow Plate</span>
            </div>
          </div>
        </div>

        {/* Multi-Platform Assured Fleet Partners Strip (12 Top Aggregators) */}
        <div className="py-4 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-3">
            <div>
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Assured Multi-Platform Network Fleet Partner
              </span>
              <p className="text-[11px] text-slate-500 font-medium">
                Verified commercial fleet fulfilling direct transfers across premier travel platforms
              </p>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full w-fit">
              100% Direct Operator Guarantee
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[
              { src: '/partners/makemytrip.svg', alt: 'MakeMyTrip' },
              { src: '/partners/goibibo.png', alt: 'Goibibo' },
              { src: '/partners/easemytrip.svg', alt: 'EaseMyTrip' },
              { src: '/partners/savaari.png', alt: 'Savaari' },
              { src: '/partners/ola.svg', alt: 'Ola Cabs' },
              { src: '/partners/uber.svg', alt: 'Uber Intercity' },
              { src: '/partners/gozo.svg', alt: 'Gozo Cabs' },
              { src: '/partners/rapido.svg', alt: 'Rapido Cabs' },
              { src: '/partners/meru.svg', alt: 'Meru Cabs' },
              { src: '/partners/megacabs.svg', alt: 'Mega Cabs' },
              { src: '/partners/booking.svg', alt: 'Booking.com' },
              { src: '/partners/justdial.png', alt: 'Justdial Taxis' },
              { src: '/partners/tripadvisor.jpg', alt: 'Tripadvisor' },
            ].map((p) => (
              <div key={p.alt} className="h-11 rounded-lg bg-slate-50 border border-slate-200/80 p-1.5 flex items-center justify-center hover:bg-white transition-colors shadow-2xs">
                <Image src={p.src} alt={p.alt} width={80} height={26} className="max-h-6 w-auto object-contain" />
              </div>
            ))}
          </div>
        </div>

        {/* Itemized Financial Charges Table (Authoritative Fare Snapshot with Explicit 5% GST) */}
        <div className="py-6 border-b border-slate-200">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
              Itemized Fare &amp; Tax Breakdown
            </h2>
            <span className="text-[11px] font-bold text-slate-500">
              Statutory 5% GST Calculated &amp; Included
            </span>
          </div>
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <thead className="bg-slate-100 text-slate-700 font-black uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Description &amp; Tax Classification</th>
                <th className="py-2.5 px-3 text-center">Tax / Category</th>
                <th className="py-2.5 px-3 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {/* Base Taxable Vehicle Hire */}
              <tr>
                <td className="py-2.5 px-3">
                  <strong className="block text-slate-900 font-bold">Taxable Base Vehicle Hire &amp; Fuel Allowance</strong>
                  <span className="text-[11px] text-slate-500">Commercial vehicle hire for entire corridor journey with driver navigation.</span>
                </td>
                <td className="py-2.5 px-3 text-center text-slate-600 font-semibold">Taxable Baseline</td>
                <td className="py-2.5 px-3 text-right tabular-nums font-bold">₹{taxableBaseFare.toLocaleString('en-IN')}</td>
              </tr>

              {/* FASTag Tolls & Permits */}
              <tr>
                <td className="py-2.5 px-3">
                  <strong className="block text-slate-900 font-bold">FASTag Tolls &amp; Inter-State Passenger Border Taxes</strong>
                  <span className="text-[11px] text-slate-500">
                    {isOneWay ? 'Prepaid and fully included for this one-way journey.' : 'Payable at actuals as incurred along highway toll plazas.'}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-center text-emerald-700 font-bold">{isOneWay ? 'Prepaid Included' : 'At Actuals'}</td>
                <td className="py-2.5 px-3 text-right tabular-nums font-bold text-emerald-700">{isOneWay ? '₹0 Extra' : 'As Incurred'}</td>
              </tr>

              {/* Chauffeur Daily Allowance */}
              <tr>
                <td className="py-2.5 px-3">
                  <strong className="block text-slate-900 font-bold">Chauffeur Daily Maintenance Allowance</strong>
                  <span className="text-[11px] text-slate-500">Professional chauffeur food and daily maintenance allowance included.</span>
                </td>
                <td className="py-2.5 px-3 text-center text-emerald-700 font-bold">Included</td>
                <td className="py-2.5 px-3 text-right tabular-nums font-bold text-emerald-700">₹0 Extra</td>
              </tr>

              {/* Explicit Goods & Services Tax (GST 5%) Itemization */}
              <tr className="bg-emerald-50/40">
                <td className="py-2.5 px-3">
                  <strong className="block text-emerald-950 font-black">Goods &amp; Services Tax (GST 5% - Statutory Transport Levy)</strong>
                  <span className="text-[11px] text-emerald-700">
                    Mandatory Ministry of Finance road transport tax (CGST 2.5%: ₹{cgstAmount.toLocaleString('en-IN')} + SGST 2.5%: ₹{sgstAmount.toLocaleString('en-IN')}).
                  </span>
                </td>
                <td className="py-2.5 px-3 text-center text-emerald-800 font-black">5.0% Tax</td>
                <td className="py-2.5 px-3 text-right tabular-nums font-black text-emerald-950">
                  ₹{gstAmount.toLocaleString('en-IN')}
                </td>
              </tr>

              {/* Selected Add-ons (if any) */}
              {selectedAddOns.map((addon) => (
                <tr key={addon.id} className="bg-blue-50/30">
                  <td className="py-2.5 px-3">
                    <strong className="block text-slate-900 font-bold">{addon.name}</strong>
                    {addon.disclaimer && (
                      <span className="text-[11px] text-slate-500 italic">{addon.disclaimer}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center text-brand-blue font-bold">Add-on Service</td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold text-slate-900">₹{addon.price.toLocaleString('en-IN')}</td>
                </tr>
              ))}

              {selectedAddOns.length > 0 && (
                <tr className="bg-slate-50 font-bold text-slate-700 text-xs">
                  <td colSpan={2} className="py-2 px-3 text-right">Total Optional Add-on Charges:</td>
                  <td className="py-2 px-3 text-right tabular-nums text-brand-blue font-black">₹{addOnTotal.toLocaleString('en-IN')}</td>
                </tr>
              )}

              {/* Total Customer Payable Card */}
              <tr className="bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 font-black text-slate-900 text-sm border-t-2 border-brand-blue/40">
                <td colSpan={2} className="py-3.5 px-3 text-right text-base text-slate-900 font-black">
                  Total Final Customer Payable:
                </td>
                <td className="py-3.5 px-3 text-right tabular-nums text-brand-blue text-lg sm:text-2xl font-black">
                  ₹{customerPayable.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment Policy Ledger (30% Token / 70% Balance) */}
        <div className="py-6 border-b border-slate-200">
          <h2 className="text-[11px] font-black text-slate-700 uppercase tracking-wider mb-3">Two-Stage Payment Schedule &amp; Collection</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
              <span className="text-emerald-800 block text-[10px] uppercase font-black tracking-wider">30% Advance Token</span>
              <span className="text-xl font-black text-emerald-950 block mt-0.5 tabular-nums">₹{tokenAmount.toLocaleString('en-IN')}</span>
              <span className="text-[11px] text-emerald-700 block mt-1 font-medium">Guarantees chauffeur reservation &amp; dispatch</span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-600 block text-[10px] uppercase font-black tracking-wider">Verified Advance Received</span>
              <span className="text-xl font-black text-slate-900 block mt-0.5 tabular-nums">₹{totalPaid.toLocaleString('en-IN')}</span>
              <span className="text-[11px] text-slate-500 block mt-1 font-medium">Recorded in platform audit log</span>
            </div>

            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl">
              <span className="text-brand-blue block text-[10px] uppercase font-black tracking-wider">70% Balance Due</span>
              <span className="text-xl font-black text-brand-blue block mt-0.5 tabular-nums">₹{remainingBalance.toLocaleString('en-IN')}</span>
              <span className="text-[11px] text-slate-600 block mt-1 font-medium">Pay directly to driver via Cash or UPI at drop</span>
            </div>
          </div>
        </div>

        {/* Trip-Type Specific Inclusions & Exclusions */}
        <div className="py-6 border-b border-slate-200 text-xs">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
              Trip Inclusions &amp; Commercial Exclusions
            </h2>
            <span className="text-[10px] font-black text-brand-blue bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 capitalize">
              {rawTripType.replace('_', ' ')} Policy
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
              <span className="font-black text-emerald-900 flex items-center gap-1.5 text-xs">
                <span>✓</span> Included in Your Fare
              </span>
              <ul className="space-y-1.5 text-emerald-950 text-[11px] pl-1 font-medium">
                {tripInclusions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
                <span>✕</span> Excluded (Payable at Actuals)
              </span>
              <ul className="space-y-1.5 text-slate-600 text-[11px] pl-1 font-medium">
                {tripExclusions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-slate-400 font-bold shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Operating Terms & Conditions (Trip-Type Specific) */}
        <div className="pt-6 border-b border-slate-200 pb-6 text-xs text-slate-600">
          <h2 className="text-[11px] font-black text-slate-700 uppercase tracking-wider mb-3">
            Terms &amp; Conditions ({rawTripType.replace('_', ' ').toUpperCase()} RIDE)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
            {tripTerms.map((t, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <strong className="text-slate-900 block font-bold mb-0.5">{t.title}</strong>
                <span className="text-slate-600 leading-relaxed block">{t.desc}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 italic mt-3">
            * Note: Urgent Taxis operates under official Motor Vehicles Act guidelines. Tax invoice with GSTIN is issued upon verified business request.
          </p>
        </div>

        {/* Document Footer */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2">
          <span>This is an official computer-generated travel invoice. No physical signature required.</span>
          <span className="font-bold text-slate-700">Urgent Taxis Desk: +91 7310651940 | WhatsApp: +91 8595066033</span>
        </div>

      </div>
    </div>
  );
}
