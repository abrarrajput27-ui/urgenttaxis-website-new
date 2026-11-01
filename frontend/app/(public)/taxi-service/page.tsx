import { Metadata } from 'next';
import Link from 'next/link';
import { LOCALITIES_DATA } from '@/lib/data/localities-data';
import { BUSINESS_CONFIG } from '@/lib/config';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';
import { Phone, MessageSquare, MapPin, Shield, CheckCircle2, Clock, ArrowRight, Car, Building2, Plane } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Taxi Service in Ghaziabad & Delhi NCR | 24/7 Outstation Cabs',
  description: 'Book reliable taxi service across Ghaziabad, Masuri, Indirapuram, Noida, Greater Noida, and Delhi NCR. Commercial cabs for outstation drops and IGI Airport transfers.',
  alternates: {
    canonical: `${BUSINESS_CONFIG.canonicalDomain}/taxi-service`,
  },
  openGraph: {
    title: 'Taxi Service in Ghaziabad & Delhi NCR | Urgent Taxis',
    description: 'Book reliable taxi service across Ghaziabad, Masuri, Indirapuram, Noida, Greater Noida, and Delhi NCR. Commercial cabs for outstation drops and IGI Airport transfers.',
    url: `${BUSINESS_CONFIG.canonicalDomain}/taxi-service`,
    siteName: BUSINESS_CONFIG.brandName,
    locale: 'en_IN',
    type: 'website',
  },
};

export default function TaxiServiceHubPage() {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Taxi Service' },
  ];

  const localityList = Object.values(LOCALITIES_DATA);

  // Group localities
  const ghaziabadCore = localityList.filter((l) =>
    ['ghaziabad', 'masuri', 'raj-nagar', 'raj-nagar-extension', 'sahibabad'].includes(l.slug)
  );

  const transHindon = localityList.filter((l) =>
    ['indirapuram', 'vaishali', 'vasundhara', 'kaushambi', 'crossings-republik'].includes(l.slug)
  );

  const westernUP = localityList.filter((l) =>
    ['loni', 'modinagar', 'muradnagar', 'hapur', 'meerut'].includes(l.slug)
  );

  const noidaNCR = localityList.filter((l) =>
    ['noida', 'greater-noida', 'delhi', 'faridabad', 'gurugram'].includes(l.slug)
  );

  // Structured Data
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Urgent Taxis Service Localities in Ghaziabad and Delhi NCR',
    description: 'All cities and localities served by Urgent Taxis with doorstep pickup and outstation taxi service.',
    itemListElement: localityList.map((loc, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `Taxi Service in ${loc.name}`,
      url: `${BUSINESS_CONFIG.canonicalDomain}/taxi-service/${loc.slug}`,
    })),
  };

  const whatsappBaseUrl = `https://wa.me/${BUSINESS_CONFIG.phone.whatsappRaw}?text=${encodeURIComponent(
    'Hello Urgent Taxis, I am looking to book a cab in Ghaziabad / Delhi NCR. Please share details.'
  )}`;

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-slate-200">
        <PublicBreadcrumbs items={breadcrumbs} />
      </div>

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-brand-blue text-white pt-10 pb-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs sm:text-sm font-medium mb-4">
              <MapPin className="w-4 h-4 text-blue-400" />
              Serving Ghaziabad, Noida, Delhi NCR & Western UP
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Taxi Service Network in Ghaziabad & Delhi NCR
            </h1>

            <p className="mt-4 text-base sm:text-lg text-blue-100 leading-relaxed">
              Urgent Taxis is based in Masuri, Ghaziabad. We operate a fleet of verified commercial sedans and SUVs with transparent per-kilometer rates, guaranteed doorstep pickup, and professional highway chauffeurs.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href={`tel:${BUSINESS_CONFIG.phone.primaryRaw}`}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
              >
                <Phone className="w-5 h-5" />
                <span>Call {BUSINESS_CONFIG.phone.display}</span>
              </a>

              <a
                href={whatsappBaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02]"
              >
                <MessageSquare className="w-5 h-5" />
                <span>WhatsApp Booking</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Highlights */}
      <section className="bg-white border-b border-slate-200 py-6 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-brand-blue">Registered Head Office</p>
                <p className="text-xs text-slate-500 font-medium">Masuri, Ghaziabad 201302</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-brand-blue">100% Commercial Fleet</p>
                <p className="text-xs text-slate-500 font-medium">Yellow-plate certified vehicles</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-brand-blue">Fixed Rates from ₹9/km</p>
                <p className="text-xs text-slate-500 font-medium">No surprise surges or hidden fees</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Plane className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-brand-blue">IGI Airport Transfers</p>
                <p className="text-xs text-slate-500 font-medium">Fixed-rate drops from ₹1,199</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Localities Directory Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-blue">
            Select Your Pickup Locality in Ghaziabad & NCR
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Click on any locality to view dedicated outstation fares, local airport pickup schedules, key landmarks, and direct booking options.
          </p>
        </div>

        {/* Group 1: Ghaziabad Core */}
        <div>
          <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Ghaziabad Central & Key Hubs
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ghaziabadCore.map((loc) => (
              <Link
                key={loc.slug}
                href={`/taxi-service/${loc.slug}`}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-500/50 hover:bg-blue-50/40 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-base font-bold text-brand-blue group-hover:text-blue-400 transition-colors">
                      {loc.name}
                    </h4>
                    {loc.isHeadquarters && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Head Office
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {loc.tagline}
                  </p>
                  <div className="mt-3 text-[11px] text-slate-600">
                    Pincodes: {loc.pincodes.slice(0, 3).join(', ')}...
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-blue-400">
                  <span>View Rates & Book</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Group 2: Trans-Hindon */}
        <div>
          <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Trans-Hindon Residential Corridors
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {transHindon.map((loc) => (
              <Link
                key={loc.slug}
                href={`/taxi-service/${loc.slug}`}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-emerald-500/50 hover:bg-blue-50/40 transition-all group flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-base font-bold text-brand-blue group-hover:text-emerald-400 transition-colors mb-2">
                    {loc.name}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {loc.tagline}
                  </p>
                  <div className="mt-3 text-[11px] text-slate-600">
                    Pincodes: {loc.pincodes.slice(0, 3).join(', ')}...
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-emerald-400">
                  <span>View Rates & Book</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Group 3: Western UP & Outer NCR */}
        <div>
          <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Western UP & Extended NCR Hubs
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {westernUP.map((loc) => (
              <Link
                key={loc.slug}
                href={`/taxi-service/${loc.slug}`}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-amber-500/50 hover:bg-blue-50/40 transition-all group flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-base font-bold text-brand-blue group-hover:text-amber-400 transition-colors mb-2">
                    {loc.name}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {loc.tagline}
                  </p>
                  <div className="mt-3 text-[11px] text-slate-600">
                    District: {loc.district} • {loc.state}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-amber-400">
                  <span>View Rates & Book</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Group 4: Noida, Delhi & Gurgaon */}
        <div>
          <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Noida, Greater Noida, Delhi & NCR Cities
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {noidaNCR.map((loc) => (
              <Link
                key={loc.slug}
                href={`/taxi-service/${loc.slug}`}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-purple-500/50 hover:bg-blue-50/40 transition-all group flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-base font-bold text-brand-blue group-hover:text-purple-400 transition-colors mb-2">
                    {loc.name}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {loc.tagline}
                  </p>
                  <div className="mt-3 text-[11px] text-slate-600">
                    District: {loc.district} • {loc.state}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-purple-400">
                  <span>View Rates & Book</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
