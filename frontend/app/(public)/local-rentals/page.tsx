import { supabaseServer } from '@/lib/supabase/server';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';
import PageFAQSection from '@/components/public/PageFAQSection';
import PublicFareWidget from '@/components/public/PublicFareWidget';
import LocalRentalsViewer from '@/components/public/LocalRentalsViewer';
import RateCardSection from '@/components/public/RateCardSection';
import {
  FALLBACK_CATEGORIES,
  FALLBACK_LOCATIONS,
  FALLBACK_ROUTES,
  FALLBACK_PACKAGES,
  withTimeout,
} from '@/lib/data/fallback-data';

export const metadata = constructMetadata({
  title: 'Local Hourly Cab Rentals | 8h/80km & 12h/120km Packages',
  description: 'Book flexible local hourly cab rentals in Delhi NCR for business meetings, shopping, and city sightseeing. Active database packages with transparent extra-km and extra-hour rates.',
  canonicalPath: '/local-rentals',
});

export default async function LocalRentalsPage() {
  let categories = FALLBACK_CATEGORIES;
  let routes = FALLBACK_ROUTES;
  let locations = FALLBACK_LOCATIONS;
  let localPackages = FALLBACK_PACKAGES;

  try {
    const supabase = await supabaseServer();
    const [pkgRes, catRes, routeRes, locRes] = await Promise.all([
      withTimeout(
        supabase.from('pricing_local_packages').select('*, vehicle_categories(*)').eq('is_active', true),
        2000,
        { data: null }
      ),
      withTimeout(
        supabase.from('vehicle_categories').select('*').eq('is_active', true).order('display_order', { ascending: true }),
        2000,
        { data: null }
      ),
      withTimeout(
        supabase.from('routes').select('*, origin:locations!routes_origin_location_id_fkey(*), destination:locations!routes_destination_location_id_fkey(*)').eq('is_active', true),
        2000,
        { data: null }
      ),
      withTimeout(
        supabase.from('locations').select('*').eq('is_active', true).order('name', { ascending: true }),
        2000,
        { data: null }
      ),
    ]);

    if (pkgRes?.data && pkgRes.data.length > 0) localPackages = pkgRes.data;
    if (catRes?.data && catRes.data.length > 0) categories = catRes.data;
    if (routeRes?.data && routeRes.data.length > 0) routes = routeRes.data;
    if (locRes?.data && locRes.data.length > 0) locations = locRes.data;
  } catch (err) {
    console.warn('Supabase fetch failed on LocalRentalsPage, using fallback data:', err);
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Local Rentals' },
  ];

  const visibleFaqs = [
    {
      question: 'How do local hourly cab rental packages work?',
      answer: 'Local rental packages include a fixed duration (e.g. 8 Hours) and distance limit (e.g. 80 KM). If your trip exceeds these thresholds, extra hours and extra kilometers are billed at fixed database rates.',
    },
    {
      question: 'What are the extra kilometer and extra hour rates for local rentals?',
      answer: 'Extra rates depend on vehicle category. Standard extra KM rates range from ₹12 to ₹18 per KM, and extra hour rates range from ₹150 to ₹250 per hour as configured in our active pricing tables.',
    },
    {
      question: 'Are toll tax and parking charges included in local rental packages?',
      answer: 'Toll taxes, state border entry fees, and parking charges encountered during your local city trip are excluded and payable directly by the passenger at actuals.',
    },
  ];


  return (
    <div className="pb-16 bg-slate-50 min-h-screen text-slate-900">
      {/* 1. Breadcrumbs */}
      <div className="bg-white border-b border-slate-100">
        <PublicBreadcrumbs items={breadcrumbItems} />
      </div>


      {/* 2. Hero Section */}
      <section className="py-10 sm:py-14 md:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 text-xs font-bold shadow-sm">
          Flexible Hourly City Packages
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-brand-blue tracking-tight leading-tight">
          Local Hourly Cab Rentals
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          Book half-day and full-day cabs for city travel, shopping, and business meetings with transparent package limits and fixed extra rates.
        </p>
      </section>

      {/* 3. Confirmed Local Rental Packages & Interactive Fleet Selector */}
      <section className="py-10 sm:py-14 md:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-8">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Confirmed Hourly Rental Packages</h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-medium">
            Transparent flat rates for 8-Hour / 80-KM and 12-Hour / 120-KM city travel across Delhi NCR. 30% advance token confirms your ride.
          </p>
        </div>

        <LocalRentalsViewer />
      </section>

      {/* 3B. Official 2026 Rate Card Matrix Table */}
      <RateCardSection id="rate-card" className="border-t border-slate-200/80" />

      {/* 4. Fare Calculator Widget */}
      <section className="py-10 sm:py-14 md:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-3xl font-black text-slate-900">Calculate Local Package Fare</h2>
          <p className="text-sm text-slate-500 font-medium">Use our secure server pricing widget to estimate your trip fare.</p>
        </div>
        <PublicFareWidget
          localPackages={localPackages || []}
          categories={categories || []}
          routes={routes || []}
          locations={locations || []}
          initialServiceType="local_rental"
        />
      </section>

      {/* 5. Extra Hour & Extra KM Billing Rules */}
      <section className="py-10 sm:py-14 md:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-emerald-100 p-8 rounded-3xl space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-5xl">✓</div>
          <h3 className="text-xl font-black text-brand-green relative z-10">Included in Package</h3>
          <ul className="text-sm text-slate-600 space-y-3 font-medium relative z-10">
            <li className="flex gap-2"><span className="text-brand-green">✓</span> Vehicle fuel charges up to package distance limit</li>
            <li className="flex gap-2"><span className="text-brand-green">✓</span> Driver allowance for package duration</li>
            <li className="flex gap-2"><span className="text-brand-green">✓</span> Multiple city stops within package limits</li>
          </ul>
        </div>

        <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-5xl">ℹ️</div>
          <h3 className="text-xl font-black text-brand-blue relative z-10">Excluded / Payable at Actuals</h3>
          <ul className="text-sm text-slate-600 space-y-3 font-medium relative z-10">
            <li className="flex gap-2"><span className="text-slate-400 font-bold">ℹ</span> Extra kilometers beyond package threshold (billed per KM)</li>
            <li className="flex gap-2"><span className="text-slate-400 font-bold">ℹ</span> Extra hours beyond package duration (billed per Hour)</li>
            <li className="flex gap-2"><span className="text-slate-400 font-bold">ℹ</span> Parking fees and municipal toll taxes</li>
          </ul>
        </div>
      </section>

      {/* 6. Visible FAQs */}

      <section className="py-10 sm:py-14 md:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100">

        <PageFAQSection

          faqs={visibleFaqs}

          title="Local Rentals Frequently Asked Questions"

          subtitle="Clear answers on 8h/80km packages, extra km rates, night charges, and city travel rules."

          twoColumnLayout={true}

          includeSchema={true}

        />

      </section>



      {/* 7. Final CTA */}
      <section className="py-10 sm:py-14 md:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center border-t border-slate-100">
        <div className="bg-gradient-to-r from-brand-blue to-brand-blue-light border border-slate-800 rounded-3xl p-10 space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('/hero-pattern.svg')] bg-center"></div>
          <h2 className="text-3xl sm:text-4xl font-black text-white relative z-10">
            Need a Local City Taxi Package?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <a
              href={`tel:${SITE_CONFIG.phoneRaw}`}
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-brand-blue font-black text-sm px-8 py-4 rounded-xl transition-all shadow-lg"
            >
              Call {SITE_CONFIG.phone}
            </a>
            <a
              href={generateWhatsAppLink(SITE_CONFIG.whatsapp, { customMessage: 'Hello Urgent Taxis! 👋\n\nI would like to make an inquiry. ✨' })}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-brand-green hover:bg-brand-green-hover text-white font-black text-sm px-8 py-4 rounded-xl transition-all shadow-lg"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
