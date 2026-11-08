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

  // Dynamic trip-type detection
  const rawTripType = String(booking.trip_type || booking.service_type || 'one_way').toLowerCase();
  const isOneWay = rawTripType.includes('one_way') || rawTripType.includes('one-way') || rawTripType === 'one way';
  const isRoundTrip = rawTripType.includes('round_trip') || rawTripType.includes('round-trip') || rawTripType === 'round trip';
  const isRental = rawTripType.includes('rental') || rawTripType.includes('local');
  const isAirport = rawTripType.includes('airport');

  // Dynamic Inclusions & Exclusions based on trip type
  const tripInclusions = isOneWay
    ? [
        'Commercial AC vehicle hire with verified professional chauffeur',
        'Fuel expenses for the complete booked itinerary',
        'All National & State Highway FASTag Toll Taxes Included',
        'Inter-State border passenger transport entry permits Included',
        'Driver daily allowance and GST (5%) Included',
      ]
    : isRoundTrip
    ? [
        'Commercial AC vehicle hire with verified professional chauffeur',
        'Minimum 250 km/day daily travel quota',
        'Driver daily allowance for all journey days Included',
        'GST (5%) included in vehicle rental',
      ]
    : isRental
    ? [
        'Full city package hours and kilometers included',
        'Unlimited local city stops within package limits',
        'Chauffeur allowance & fuel charges included',
        'GST (5%) included in rental package',
      ]
    : [
        'Direct airport terminal pickup or drop with chauffeur',
        'Dedicated airport terminal arrival entry slip & toll clearance',
        '60 minutes complimentary flight arrival waiting time',
        'GST (5%) & driver allowance included',
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
        'FASTag Highway Toll Taxes & State Border Permits paid directly at actuals',
        'Airport / Hotel / Monument parking tickets payable at actuals',
        'Kilometers driven beyond daily minimum quota charged as per vehicle rate',
        'Driver night allowance (₹300/night if travel spans between 10 PM and 6 AM)',
      ]
    : isRental
    ? [
        'Extra distance beyond package limit charged as per vehicle rate',
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
        { title: 'Doorstep Pickup & Direct Drop', desc: 'Chauffeur will arrive at the scheduled pickup address. The quoted fare covers direct transport to your drop location with reasonable highway refreshment halts.' },
        { title: 'Tolls & State Permits Covered', desc: 'All standard electronic highway toll taxes and inter-state passenger vehicle entry permits for this one-way journey are prepaid and included.' },
        { title: '100% Refundable Token', desc: 'Advance token payment is 100% refundable if cancellation is requested at least 24 hours prior to scheduled departure.' },
        { title: 'Hill Route AC Protocol', desc: 'Air conditioning may be switched off temporarily on steep mountain gradients to ensure engine power and maximum road safety.' },
      ]
    : isRoundTrip
    ? [
        { title: 'Kilometer Calculation & Minimum Quota', desc: 'Outstation round-trip charges are based on a minimum daily average of 250 km. Garage to garage / origin return distance applies.' },
        { title: 'Tolls & State Taxes at Actuals', desc: 'FASTag toll charges, state border entry taxes, and parking fees must be paid directly by the passenger at actuals as incurred.' },
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

  // Document Classification
  const isPaidOrPartial = booking.payment_status === 'paid' || booking.payment_status === 'partially_paid' || totalPaid > 0;
  const vehicleProfile = getVehicleProfile(booking.vehicle_categories?.name);
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
        
        {/* Top Gradient Stripe */}
        <div className="h-2 w-full bg-gradient-to-r from-brand-blue via-emerald-500 to-brand-green rounded-t-xl -mt-6 sm:-mt-10 -mx-6 sm:-mx-10 mb-6 sm:mb-8 print:hidden"></div>

        {/* Header: Official Brand Logo & Verified Contact Desk */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-brand-blue/30 gap-6">
          <div className="space-y-2">
            <div className="relative w-52 sm:w-64 h-16 sm:h-20 shrink-0">
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
              <strong className="text-slate-800 block">Registered Dispatch Desk:</strong>
              Railway Station Road, Masuri, NH-9 Corridor, Ghaziabad, UP 201015
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-600 space-y-1 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 shrink-0">
            <p><strong className="text-slate-800">Phone / 24x7 Helpline:</strong> <span className="tabular-nums font-semibold text-brand-blue">+91 7310651940</span></p>
            <p><strong className="text-slate-800">WhatsApp Desk:</strong> <span className="tabular-nums font-semibold text-emerald-700">+91 8595066033</span></p>
            <p><strong className="text-slate-800">Email:</strong> <span className="text-slate-700">info@urgenttaxis.in</span></p>
            <p><strong className="text-slate-800">Web:</strong> <span className="text-brand-blue font-semibold">www.urgenttaxis.in</span></p>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider pt-0.5">Govt. Verified Commercial Fleet</p>
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

        {/* Selected Vehicle Showcase with Cutout/Image & Commercial Specs */}
        <div className="my-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-[#0a1128] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm border border-slate-800">
          <div className="relative w-40 h-20 sm:w-48 sm:h-24 shrink-0 flex items-center justify-center bg-white/5 rounded-xl p-2 border border-white/10">
            <Image
              src={vehicleProfile.image}
              alt={vehicleProfile.title}
              width={200}
              height={100}
              className="max-h-20 w-auto object-contain drop-shadow"
            />
          </div>

          <div className="flex-1 space-y-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                {vehicleProfile.tag}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Assigned Vehicle Category
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white">
              {vehicleProfile.title}
            </h3>
            <p className="text-xs text-slate-300 font-medium">
              {vehicleProfile.models}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-[11px] text-slate-300">
              <span className="bg-white/10 px-2 py-0.5 rounded">👥 {vehicleProfile.seats}</span>
              <span className="bg-white/10 px-2 py-0.5 rounded">🧳 {vehicleProfile.bags}</span>
              <span className="bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded">❄️ Dual AC</span>
              <span className="bg-blue-400/20 text-blue-300 px-2 py-0.5 rounded">🚕 Yellow Plate Permit</span>
            </div>
          </div>
        </div>

        {/* Assured Booking & Network Fleet Partners (Matching User Reference Image) */}
        <div className="py-4 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-3">
            <div>
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Assured Multi-Platform Network Fleet Partner
              </span>
              <p className="text-[11px] text-slate-500 font-medium">
                Verified commercial fleet fulfilling direct transfers across premier travel aggregators
              </p>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full w-fit">
              100% Direct Operator Guarantee
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {/* MakeMyTrip */}
            <div className="h-12 rounded-xl bg-slate-50 border border-slate-200/80 p-2 flex items-center justify-center hover:bg-white transition-colors shadow-2xs">
              <Image src="/partners/makemytrip.svg" alt="MakeMyTrip" width={90} height={30} className="max-h-7 w-auto object-contain" />
            </div>
            {/* Goibibo */}
            <div className="h-12 rounded-xl bg-slate-50 border border-slate-200/80 p-2 flex items-center justify-center hover:bg-white transition-colors shadow-2xs">
              <Image src="/partners/goibibo.png" alt="Goibibo" width={90} height={30} className="max-h-7 w-auto object-contain" />
            </div>
            {/* EaseMyTrip */}
            <div className="h-12 rounded-xl bg-slate-50 border border-slate-200/80 p-2 flex items-center justify-center hover:bg-white transition-colors shadow-2xs">
              <Image src="/partners/easemytrip.svg" alt="EaseMyTrip" width={90} height={30} className="max-h-7 w-auto object-contain" />
            </div>
            {/* Savaari */}
            <div className="h-12 rounded-xl bg-slate-50 border border-slate-200/80 p-2 flex items-center justify-center hover:bg-white transition-colors shadow-2xs">
              <Image src="/partners/savaari.png" alt="Savaari" width={90} height={30} className="max-h-7 w-auto object-contain" />
            </div>
            {/* Justdial */}
            <div className="h-12 rounded-xl bg-slate-50 border border-slate-200/80 p-2 flex items-center justify-center hover:bg-white transition-colors shadow-2xs">
              <Image src="/partners/justdial.png" alt="Justdial" width={90} height={30} className="max-h-7 w-auto object-contain" />
            </div>
            {/* Tripadvisor */}
            <div className="h-12 rounded-xl bg-slate-50 border border-slate-200/80 p-2 flex items-center justify-center hover:bg-white transition-colors shadow-2xs">
              <Image src="/partners/tripadvisor.jpg" alt="Tripadvisor" width={90} height={30} className="max-h-7 w-auto object-contain rounded" />
            </div>
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
                  <strong className="block text-slate-900">Base Vehicle Rental &amp; Fuel</strong>
                  <span className="text-[11px] text-slate-500">Includes commercial cab rental, standard fuel allowance, and professional chauffeur.</span>
                </td>
                <td className="py-2.5 px-3 text-center text-slate-500 font-medium">Mandatory</td>
                <td className="py-2.5 px-3 text-right tabular-nums font-semibold">₹{baseVehicleFare.toLocaleString('en-IN')}</td>
              </tr>

              <tr>
                <td className="py-2.5 px-3">
                  <strong className="block text-slate-900">FASTag Tolls &amp; Inter-State Passenger Entry Taxes</strong>
                  <span className="text-[11px] text-slate-500">
                    {isOneWay ? 'Prepaid and fully included for this one-way journey.' : 'Payable at actuals as incurred along the highway plazas.'}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-center text-emerald-700 font-semibold">{isOneWay ? 'Included' : 'At Actuals'}</td>
                <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-emerald-700">{isOneWay ? '₹0 Extra' : 'As Incurred'}</td>
              </tr>

              <tr>
                <td className="py-2.5 px-3">
                  <strong className="block text-slate-900">Chauffeur Daily Allowance &amp; Night Halt</strong>
                  <span className="text-[11px] text-slate-500">Chauffeur daily maintenance &amp; meals allowance included.</span>
                </td>
                <td className="py-2.5 px-3 text-center text-emerald-700 font-semibold">Included</td>
                <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-emerald-700">₹0 Extra</td>
              </tr>

              <tr>
                <td className="py-2.5 px-3">
                  <strong className="block text-slate-900">Goods &amp; Services Tax (GST 5%)</strong>
                  <span className="text-[11px] text-slate-500">Statutory passenger transport levy under Ministry of Finance.</span>
                </td>
                <td className="py-2.5 px-3 text-center text-emerald-700 font-semibold">Included</td>
                <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-emerald-700">Included</td>
              </tr>

              {selectedAddOns.map((addon) => (
                <tr key={addon.id} className="bg-blue-50/30">
                  <td className="py-2.5 px-3">
                    <strong className="block text-slate-900">{addon.name}</strong>
                    {addon.disclaimer && (
                      <span className="text-[11px] text-slate-500 italic">{addon.disclaimer}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center text-brand-blue font-semibold">Add-on</td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-slate-900">₹{addon.price.toLocaleString('en-IN')}</td>
                </tr>
              ))}

              {selectedAddOns.length > 0 && (
                <tr className="bg-slate-50 font-semibold text-slate-700 text-xs">
                  <td colSpan={2} className="py-2 px-3 text-right">Total Optional Add-on Charges:</td>
                  <td className="py-2 px-3 text-right tabular-nums text-brand-blue">₹{addOnTotal.toLocaleString('en-IN')}</td>
                </tr>
              )}

              <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 font-bold text-slate-900 text-sm border-t-2 border-brand-blue/30">
                <td colSpan={2} className="py-3 px-3 text-right text-base">Total Customer Payable:</td>
                <td className="py-3 px-3 text-right tabular-nums text-brand-blue text-lg sm:text-xl font-black">₹{customerPayable.toLocaleString('en-IN')}</td>
              </tr></tbody>
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

        {/* Trip-Type Specific Inclusions & Exclusions */}
        <div className="py-6 border-b border-slate-200 text-xs">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Trip Inclusions &amp; Commercial Exclusions
            </h2>
            <span className="text-[10px] font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-200 capitalize">
              {rawTripType.replace('_', ' ')} Policy
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-1.5">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                <span>✓</span> Included in Your Fare
              </span>
              <ul className="space-y-1 text-emerald-950 text-[11px] pl-1">
                {tripInclusions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <span>✕</span> Excluded (Payable at Actuals)
              </span>
              <ul className="space-y-1 text-slate-600 text-[11px] pl-1">
                {tripExclusions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-slate-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Operating Terms & Conditions (Trip-Type Specific) */}
        <div className="pt-6 border-b border-slate-200 pb-6 text-xs text-slate-600">
          <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
            Terms &amp; Conditions ({rawTripType.replace('_', ' ').toUpperCase()} RIDE)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
            {tripTerms.map((t, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
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
          <span>This is a computer-generated travel document. No physical signature required.</span>
          <span className="font-semibold text-slate-700">Urgent Taxis Desk: +91 7310651940 | WhatsApp: +91 8595066033</span>
        </div>

      </div>
    </div>
  );
}
