import { constructMetadata } from '@/lib/seo';
import { BUSINESS_CONFIG } from '@/lib/config';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';
import { ShieldCheck, CheckCircle2, Clock, HelpCircle, FileText, Phone, MessageSquare } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Booking, Fares & Cancellation Policy | Urgent Taxis',
  description: 'Understand how Urgent Taxis calculates fares, night allowances, toll charges, and our 100% transparent zero-hassle cancellation policy.',
  canonicalPath: '/booking-policy',
});

export default function BookingPolicyPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Booking & Fare Policy' },
  ];

  return (
    <div className="pb-16 bg-slate-950 min-h-screen text-slate-100">
      <div className="bg-slate-900 border-b border-slate-800">
        <PublicBreadcrumbs items={breadcrumbItems} />
      </div>

      {/* Header Banner */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold">
          <FileText className="w-4 h-4" />
          Transparent Commercial Transport Policy
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          How Our Fares, Bookings & Cancellations Work
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          At Urgent Taxis, transparency is our foremost promise. We believe you should know exactly what you are paying for before you begin your journey.
        </p>
      </section>

      {/* Policy Details */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section 1: Fare Calculation */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">1. How Outstation Fares Are Calculated</h2>
          </div>
          <div className="text-sm text-slate-300 space-y-3 leading-relaxed">
            <p>
              Outstation journeys are priced using our standardized rate card based on vehicle category:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li><strong>Hatchback (WagonR, Swift):</strong> ₹10 per km</li>
              <li><strong>Sedan (Dzire, Etios):</strong> ₹11 per km</li>
              <li><strong>SUV / MPV (Ertiga 6-Seater):</strong> ₹15 per km</li>
              <li><strong>Premium SUV (Innova Crysta 7-Seater):</strong> ₹20 per km</li>
            </ul>
            <p className="pt-2">
              <strong>Minimum Billing for Round Trips:</strong> For round-trip outstation bookings, a standard industry minimum of <strong>{BUSINESS_CONFIG.policies.roundTripMinKmPerDay} km per calendar day</strong> applies. If actual distance exceeds this baseline, additional kilometers are charged at the vehicle category’s standard per-km rate.
            </p>
          </div>
        </div>

        {/* Section 2: Tolls, Taxes & Parking */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3 text-blue-400">
            <ShieldCheck className="w-6 h-6" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">2. Tolls, State Taxes & Parking Charges</h2>
          </div>
          <div className="text-sm text-slate-300 space-y-3 leading-relaxed">
            <p>
              {BUSINESS_CONFIG.policies.tollTaxPolicy}
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li><strong>Highway Toll Plazas (FASTag):</strong> Toll charges are recorded electronically via FASTag and collected at actual government-mandated rates.</li>
              <li><strong>State Border Entry Taxes:</strong> Commercial passenger vehicles crossing state lines (e.g., UP to Uttarakhand, Haryana, or Rajasthan) pay official state commercial vehicle entry tax at the checkpost.</li>
              <li><strong>Airport / Monument Parking:</strong> Airport pickup parking fees (e.g., Delhi IGI MLCP) or sightseeing parking receipts are paid directly by the passenger at actuals.</li>
            </ul>
          </div>
        </div>

        {/* Section 3: Driver Night Allowance */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3 text-amber-400">
            <Clock className="w-6 h-6" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">3. Driver Night Allowance</h2>
          </div>
          <div className="text-sm text-slate-300 space-y-3 leading-relaxed">
            <p>
              A driver night allowance of <strong>₹{BUSINESS_CONFIG.policies.driverNightAllowance.amount}</strong> is applicable when travel occurs during late-night hours between <strong>{BUSINESS_CONFIG.policies.driverNightAllowance.startTime} and {BUSINESS_CONFIG.policies.driverNightAllowance.endTime}</strong>.
            </p>
            <p>
              This allowance directly supports our professional chauffeurs who maintain alertness and ensure passenger safety during nighttime highway driving.
            </p>
          </div>
        </div>

        {/* Section 4: Cancellation & Refund Policy */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3 text-purple-400">
            <HelpCircle className="w-6 h-6" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">4. Cancellation & Refund Policy</h2>
          </div>
          <div className="text-sm text-slate-300 space-y-3 leading-relaxed">
            <p>
              We understand that plans can change unexpectedly. Our cancellation policy is simple and fair:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li><strong>Free Cancellation:</strong> You can cancel your scheduled booking free of charge up to <strong>6 hours</strong> prior to the designated pickup time. Any advance token payment made is promptly refunded.</li>
              <li><strong>Last-Minute Cancellation:</strong> Cancellations made within 6 hours of pickup may incur a nominal cancellation fee equivalent to the driver dispatch compensation.</li>
              <li><strong>Flight Delays:</strong> If your incoming flight to Delhi IGI Airport is delayed, we do NOT charge cancellation or waiting fees. We monitor your flight number and adjust pickup timings automatically.</li>
            </ul>
          </div>
        </div>

        {/* Contact Banner */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-blue-900 via-slate-900 to-slate-900 border border-blue-800/60 text-center space-y-4">
          <h3 className="text-xl font-bold text-white">Have a Specific Billing or Route Question?</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Our dispatch desk is available 24/7 to provide instant customized quotes and answer any route queries.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
            <a
              href={`tel:${BUSINESS_CONFIG.phone.primaryRaw}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Call {BUSINESS_CONFIG.phone.display}</span>
            </a>
            <a
              href={`https://wa.me/${BUSINESS_CONFIG.phone.whatsappRaw}?text=${encodeURIComponent(
                'Hello Urgent Taxis, I have a query regarding fares and booking policy.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
