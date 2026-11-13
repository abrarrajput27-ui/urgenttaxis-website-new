import { constructMetadata } from '@/lib/seo';
import { BUSINESS_CONFIG } from '@/lib/config';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';
import RateCardSection from '@/components/public/RateCardSection';
import { ShieldCheck, CheckCircle2, Clock, HelpCircle, FileText, Phone, MessageSquare, CreditCard } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Booking, Fares & Cancellation Policy | Urgent Taxis',
  description: 'Understand how Urgent Taxis calculates fares, night allowances, toll charges, our 30% advance booking policy, and 100% transparent cancellation terms.',
  canonicalPath: '/booking-policy',
});

export const revalidate = 3600; // Static Edge Caching with 1-Hour ISR (TTFB < 50ms)

export default function BookingPolicyPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Booking & Fare Policy' },
  ];

  return (
    <div className="pb-16 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <div className="bg-white border-b border-slate-200">
        <PublicBreadcrumbs items={breadcrumbItems} />
      </div>

      {/* Header Banner */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 text-xs font-bold shadow-sm">
          <FileText className="w-4 h-4" />
          Transparent Commercial Transport Policy
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-brand-blue tracking-tight">
          How Our Fares, Bookings & Policies Work
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          At Urgent Taxis, transparency is our foremost promise. We believe you should know exactly what you are paying for before you begin your journey.
        </p>
      </section>

      {/* Policy Details */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section 1: Fare Calculation */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 text-brand-green">
            <CheckCircle2 className="w-6 h-6" />
            <h2 className="text-xl sm:text-2xl font-black text-brand-blue">1. How Outstation Fares Are Calculated</h2>
          </div>
          <div className="text-sm text-slate-600 space-y-3 leading-relaxed font-medium">
            <p>
              Outstation journeys are priced using our standardized rate card based on vehicle category:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
              <li><strong>Hatchback (WagonR, Swift):</strong> ₹11/km (Round-Trip) | ₹11/km (One-Way)</li>
              <li><strong>Sedan (Dzire, Etios):</strong> ₹12/km (Round-Trip) | ₹12/km (One-Way)</li>
              <li><strong>SUV / MPV (Ertiga 6-Seater):</strong> ₹15/km (Round-Trip) | ₹15/km (One-Way)</li>
              <li><strong>Innova (Classic 7-Seater):</strong> ₹19/km (Round-Trip) | ₹19/km (One-Way)</li>
              <li><strong>Premium SUV (Innova Crysta 7-Seater):</strong> ₹22/km (Round-Trip) | ₹22/km (One-Way)</li>
            </ul>
            <p className="pt-2">
              <strong>Minimum Billing for Round Trips:</strong> For round-trip outstation bookings, a standard industry minimum of <strong>{BUSINESS_CONFIG.policies.roundTripMinKmPerDay} km per calendar day</strong> applies (300 km/day for Innova Crysta). If actual distance exceeds this baseline, additional kilometers are charged at the vehicle category’s standard per-km rate.
            </p>
          </div>
        </div>

        {/* Official 2026 Rate Card Matrix */}
        <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm">
          <RateCardSection id="rate-card" className="py-6 sm:py-8 px-2 sm:px-6" />
        </div>

        {/* Section 2: Advance Payment Policy (30% / 70%) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 text-brand-blue">
            <CreditCard className="w-6 h-6 text-brand-green" />
            <h2 className="text-xl sm:text-2xl font-black text-brand-blue">2. Advance Payment & Balance Collection Policy</h2>
          </div>
          <div className="text-sm text-slate-600 space-y-3 leading-relaxed font-medium">
            <p>
              To confirm and guarantee vehicle allocation for your scheduled journey, Urgent Taxis operates under a clear, standardized two-stage payment structure:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-xs font-black text-emerald-800 uppercase tracking-wider block mb-1">
                  30% Token Advance
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Paid online via UPI, debit card, or net banking at the time of reservation. This locks in your driver dispatch and guarantees vehicle availability.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
                <span className="text-xs font-black text-brand-blue uppercase tracking-wider block mb-1">
                  70% Trip Balance
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Payable directly during the journey to your assigned chauffeur via cash or UPI as per the transparent booking invoice.
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 italic">
              * The 30% advance token and 70% remaining balance are calculated automatically and itemized transparently on every quotation and booking summary.
            </p>
          </div>
        </div>

        {/* Section 3: Tolls, Taxes & Parking */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 text-brand-green">
            <ShieldCheck className="w-6 h-6" />
            <h2 className="text-xl sm:text-2xl font-black text-brand-blue">3. Tolls, State Taxes & Parking Charges</h2>
          </div>
          <div className="text-sm text-slate-600 space-y-3 leading-relaxed font-medium">
            <p>
              {BUSINESS_CONFIG.policies.tollTaxPolicy}
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
              <li><strong>Highway Toll Plazas (FASTag):</strong> Toll charges are recorded electronically via FASTag and collected at actual government-mandated plaza rates.</li>
              <li><strong>State Border Entry Taxes:</strong> Commercial passenger vehicles crossing state lines (e.g., UP to Uttarakhand, Haryana, or Rajasthan) pay official state commercial vehicle entry tax at the checkpost.</li>
              <li><strong>Airport / Monument Parking:</strong> Airport pickup parking fees (e.g., Delhi IGI MLCP) or sightseeing parking receipts are paid directly by the passenger at actuals.</li>
            </ul>
          </div>
        </div>

        {/* Section 4: Driver Night Allowance */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 text-brand-blue">
            <Clock className="w-6 h-6" />
            <h2 className="text-xl sm:text-2xl font-black text-brand-blue">4. Driver Night Allowance</h2>
          </div>
          <div className="text-sm text-slate-600 space-y-3 leading-relaxed font-medium">
            <p>
              A driver night allowance of <strong>₹{BUSINESS_CONFIG.policies.driverNightAllowance.amount}</strong> is applicable when travel occurs during late-night hours between <strong>{BUSINESS_CONFIG.policies.driverNightAllowance.startTime} and {BUSINESS_CONFIG.policies.driverNightAllowance.endTime}</strong>.
            </p>
            <p>
              This allowance directly supports our professional chauffeurs who maintain alertness and ensure passenger safety during nighttime highway driving.
            </p>
          </div>
        </div>

        {/* Section 5: Cancellation & Refund Policy */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 text-brand-blue">
            <HelpCircle className="w-6 h-6 text-brand-green" />
            <h2 className="text-xl sm:text-2xl font-black text-brand-blue">5. Cancellation & Refund Policy</h2>
          </div>
          <div className="text-sm text-slate-600 space-y-3 leading-relaxed font-medium">
            <p>
              We understand that plans can change unexpectedly. Our cancellation policy is simple and fair:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
              <li><strong>Free Cancellation:</strong> You can cancel your scheduled booking free of charge up to <strong>6 hours</strong> prior to the designated pickup time. Any 30% advance token payment made is promptly refunded.</li>
              <li><strong>Last-Minute Cancellation:</strong> Cancellations made within 6 hours of pickup may incur a nominal cancellation fee equivalent to the driver dispatch compensation.</li>
              <li><strong>Flight Delays:</strong> If your incoming flight to Delhi IGI Airport is delayed, we do NOT charge cancellation or waiting fees. We monitor your flight number and adjust pickup timings automatically.</li>
            </ul>
          </div>
        </div>

        {/* Contact Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-brand-blue text-white text-center space-y-4 shadow-lg">
          <h3 className="text-xl sm:text-2xl font-black">Have a Specific Billing or Route Question?</h3>
          <p className="text-xs sm:text-sm text-blue-100 max-w-lg mx-auto font-medium leading-relaxed">
            Our dispatch desk is available 24/7 to provide instant customized quotes and answer any route queries.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
            <a
              href={`tel:${BUSINESS_CONFIG.phone.primaryRaw}`}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-brand-blue hover:bg-blue-50 font-black text-sm shadow-md transition-all"
            >
              <Phone className="w-4 h-4 text-brand-green" />
              <span>Call {BUSINESS_CONFIG.phone.display}</span>
            </a>
            <a
              href={`https://wa.me/${BUSINESS_CONFIG.phone.whatsappRaw}?text=${encodeURIComponent(
                'Hello Urgent Taxis, I have a query regarding fares and booking policy.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white font-black text-sm shadow-md transition-all"
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
