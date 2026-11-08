import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import { BUSINESS_CONFIG } from '@/lib/config';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';
import DirectBookingComparison from '@/components/public/DirectBookingComparison';
import { ShieldCheck, CheckCircle2, Clock, Award, Phone, MapPin, HeartHandshake } from 'lucide-react';
import { FaPhoneAlt, FaWhatsapp, FaCar, FaRoute, FaUserCheck } from 'react-icons/fa';
import Link from 'next/link';

export const metadata = constructMetadata({
  title: 'About Us | Urgent Taxis - Verified North India Cab Service',
  description: 'Learn about Urgent Taxis, India’s trusted outstation cab provider offering verified drivers, transparent per-KM pricing, and 24/7 customer support from Masuri, Ghaziabad.',
  canonicalPath: '/about',
});

export default function AboutUsPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'About Us' },
  ];

  return (
    <div className="pb-16 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <div className="bg-white border-b border-slate-100">
        <PublicBreadcrumbs items={breadcrumbItems} />
      </div>

      {/* 1. UPGRADED HERO SECTION */}
      <section className="relative bg-[#0a1128] text-white py-14 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
            <span>Trusted Highway Travel Partner • हमेशा आपके साथ!</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
            About <span className="text-brand-green">Urgent Taxis</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed font-medium">
            Delivering safe, punctual, and transparent doorstep taxi service across Delhi NCR, Uttarakhand, Uttar Pradesh, Himachal Pradesh, and Rajasthan from our Masuri, Ghaziabad operations headquarters.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs sm:text-sm font-semibold text-blue-200">
            <span className="bg-white/10 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/15">
              ⭐ 15,000+ Happy Riders
            </span>
            <span>•</span>
            <span className="bg-white/10 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/15">
              🛣️ 500+ Intercity Corridors
            </span>
            <span>•</span>
            <span className="bg-white/10 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/15">
              🛡️ 15 Lakh+ Safe KM
            </span>
            <span>•</span>
            <span className="bg-white/10 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/15">
              📍 Masuri, Ghaziabad HQ
            </span>
          </div>
        </div>
      </section>

      {/* 2. OUR STORY & LOCAL OPERATOR ETHOS */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 bg-white border border-slate-200/90 p-8 sm:p-10 rounded-3xl space-y-5 shadow-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-brand-blue text-xs font-bold border border-blue-100">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Our Mission &amp; Operator Story</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-brand-blue tracking-tight">
              Pioneering Zero Surge &amp; Direct Driver Accountability
            </h2>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
              Founded with the objective to eliminate middleman commissions, hidden toll markups, and unpredictable algorithmic surge pricing, <strong>Urgent Taxis</strong> has grown into the preferred outstation travel partner for thousands of families, solo professionals, and spiritual pilgrims.
            </p>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
              Operating 24/7 directly from <strong>Shop No. 09, S. R. Complex, Railway Station Road, Masuri, Ghaziabad</strong> along the NH-9 corridor, our central dispatch desk personally briefs each highway driver before departure. We ensure every trip receives a commercial yellow-plate vehicle in pristine condition with working AC, Fastag, and polite professional chauffeurs.
            </p>

            <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-slate-100">
              <div className="text-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xl font-black text-brand-green block">99.4%</span>
                <span className="text-[11px] font-bold text-slate-600 block">On-Time Arrival</span>
              </div>
              <div className="text-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xl font-black text-brand-blue block">30%</span>
                <span className="text-[11px] font-bold text-slate-600 block">Token Advance</span>
              </div>
              <div className="text-center p-3 rounded-2xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
                <span className="text-xl font-black text-emerald-800 block">24x7</span>
                <span className="text-[11px] font-bold text-slate-600 block">Live Support</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-gradient-to-br from-[#0a1128] to-[#1e293b] text-white p-8 sm:p-10 rounded-3xl shadow-xl space-y-6 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <span className="text-xs font-bold text-brand-green uppercase tracking-wider block">
                Local Presence
              </span>
              <h3 className="text-2xl font-black text-white">
                Registered Office in Masuri, Ghaziabad
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
                Unlike anonymous algorithmic platforms that operate through call centers, our operations team is physically based right here in Ghaziabad. We handle driver dispatch, route planning, emergency support, and customer queries with personal care.
              </p>
              <div className="space-y-2 text-xs text-slate-200 pt-2">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" />
                  <span>{BUSINESS_CONFIG.headOffice.formattedAddress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-brand-green flex-shrink-0" />
                  <span>24/7 Helpline: <strong>{BUSINESS_CONFIG.phone.primary}</strong></span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="px-5 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white font-bold text-xs shadow-md transition-all"
              >
                Visit Contact Desk →
              </Link>
              <a
                href={`tel:${BUSINESS_CONFIG.phone.primaryRaw}`}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all"
              >
                Call Supervisor
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 4 CORE OPERATIONAL PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <span className="text-xs font-bold text-brand-green uppercase tracking-wider">Service Standards</span>
          <h2 className="text-2xl sm:text-3xl font-black text-brand-blue tracking-tight">
            Our 4 Operational Standards
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200/90 p-6 rounded-3xl space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-xl border border-blue-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">100% Commercial Fleet</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Every vehicle holds official yellow-plate commercial registration, passenger fitness clearance, and up-to-date highway permits.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 p-6 rounded-3xl space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-brand-green flex items-center justify-center font-bold text-xl border border-emerald-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">Fixed Per-KM Fares</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Zero algorithmic surge or hidden surcharges. All base fares, driver allowances, and tolls are itemized upfront.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 p-6 rounded-3xl space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-xl border border-blue-100">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">24/7 Punctual Dispatch</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Whether departing for a 3:30 AM flight or a dawn hill station journey, our chauffeur arrives at your doorstep ahead of time.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 p-6 rounded-3xl space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-brand-green flex items-center justify-center font-bold text-xl border border-emerald-100">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">Experienced Chauffeurs</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Highway and hill station specialists trained for smooth driving, courteous etiquette, and patient waiting during family trips.
            </p>
          </div>
        </div>
      </section>

      {/* 4. WHY BOOK DIRECT COMPARISON SECTION (Platform Logos & Operator vs Aggregators Matrix) */}
      <DirectBookingComparison />
    </div>
  );
}
