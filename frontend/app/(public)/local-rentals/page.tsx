import { supabaseServer } from '@/lib/supabase/server';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';
import PublicFareWidget from '@/components/public/PublicFareWidget';

export const metadata = constructMetadata({
  title: 'Local Hourly Cab Rentals | 8h/80km & 12h/120km Packages',
  description: 'Book flexible local hourly cab rentals in Delhi NCR for business meetings, shopping, and city sightseeing. Active database packages with transparent extra-km and extra-hour rates.',
  canonicalPath: '/local-rentals',
});

export default async function LocalRentalsPage() {
  const supabase = await supabaseServer();

  // Fetch Master Data & Active Packages
  const { data: localPackages } = await supabase
    .from('pricing_local_packages')
    .select('*, vehicle_categories(*)')
    .eq('is_active', true);

  const { data: categories } = await supabase
    .from('vehicle_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  const { data: routes } = await supabase
    .from('routes')
    .select('*, origin:locations!routes_origin_location_id_fkey(*), destination:locations!routes_destination_location_id_fkey(*)')
    .eq('is_active', true);

  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

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

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: visibleFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="pb-16 bg-slate-50 min-h-screen text-slate-900">
      {/* 1. Breadcrumbs */}
      <div className="bg-white border-b border-slate-100">
        <PublicBreadcrumbs items={breadcrumbItems} />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* 2. Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
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

      {/* 3. Active Local Rental Packages Grid */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl font-black text-slate-900">Active Database Rental Packages</h2>
          <p className="text-sm text-slate-500 font-medium">Available hourly packages and extra usage rates.</p>
        </div>

        {localPackages && localPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {localPackages.map((pkg) => {
              const catName = pkg.vehicle_categories?.name || 'Standard Category';

              return (
                <div key={pkg.id} className="bg-white border border-slate-200 p-8 rounded-3xl space-y-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black px-3 py-1.5 rounded-lg bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                        {catName}
                      </span>
                      <span className="font-mono text-sm text-brand-green font-bold">
                        {pkg.included_hours}H / {pkg.included_km}KM
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900">
                      {pkg.package_name || `${pkg.included_hours}H / ${pkg.included_km}KM Package`}
                    </h3>

                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 text-sm space-y-3 text-slate-600 font-medium">
                      <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span>Base Package Fare:</span>
                        <span className="font-mono text-brand-green font-black text-lg">₹{pkg.base_fare}</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span>Extra KM Rate:</span>
                        <span className="font-mono text-slate-900 font-bold">₹{pkg.extra_km_rate}/KM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Extra Hour Rate:</span>
                        <span className="font-mono text-slate-900 font-bold">₹{pkg.extra_hour_rate}/Hour</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3">
                    <a
                      href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20would%20like%20to%20book%20a%20*Local%20Rental%20Cab*.%20%F0%9F%9A%96%0A%E2%8F%B1%EF%B8%8F%20*Package*%3A%20${encodeURIComponent(catName)}%20(${pkg.included_hours}H%2F${pkg.included_km}KM)`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center bg-brand-green hover:bg-brand-green-hover text-white text-sm font-bold py-3.5 rounded-xl transition-colors shadow-sm"
                    >
                      Book Package via WhatsApp
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 p-10 rounded-3xl text-center space-y-4 shadow-sm">
            <h3 className="text-xl font-black text-amber-600">Fare on Request</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto font-medium">
              Custom local rental packages (4h/40km, 8h/80km, 12h/120km) are available upon request through our support desk.
            </p>
          </div>
        )}
      </section>

      {/* 4. Fare Calculator Widget */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100">
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
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-emerald-100 p-8 rounded-3xl space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-5xl">✓</div>
          <h3 className="text-xl font-black text-brand-green relative z-10">Included in Package</h3>
          <ul className="text-sm text-slate-600 space-y-3 font-medium relative z-10">
            <li className="flex gap-2"><span className="text-brand-green">✓</span> Vehicle fuel charges up to package distance limit</li>
            <li className="flex gap-2"><span className="text-brand-green">✓</span> Driver allowance for package duration</li>
            <li className="flex gap-2"><span className="text-brand-green">✓</span> Multiple city stops within package limits</li>
          </ul>
        </div>

        <div className="bg-white border border-amber-100 p-8 rounded-3xl space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-5xl">⚠️</div>
          <h3 className="text-xl font-black text-amber-600 relative z-10">Excluded / Payable at Actuals</h3>
          <ul className="text-sm text-slate-600 space-y-3 font-medium relative z-10">
            <li className="flex gap-2"><span className="text-amber-500">⚠</span> Extra kilometers beyond package threshold (billed per KM)</li>
            <li className="flex gap-2"><span className="text-amber-500">⚠</span> Extra hours beyond package duration (billed per Hour)</li>
            <li className="flex gap-2"><span className="text-amber-500">⚠</span> Parking fees and municipal toll taxes</li>
          </ul>
        </div>
      </section>

      {/* 6. Visible FAQs */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-100">
        <h2 className="text-3xl font-black text-slate-900 text-center mb-10">
          Frequently Asked Questions
        </h2>
        <div className="space-y-5 text-sm">
          {visibleFaqs.map((faq, idx) => (
            <div key={idx} className="bg-white border border-slate-200 p-6 rounded-2xl space-y-2.5 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-base font-black text-brand-blue">{faq.question}</h3>
              <p className="text-slate-600 leading-relaxed font-medium">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Final CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center border-t border-slate-100">
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
              href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20would%20like%20to%20make%20an%20inquiry.%20%E2%9C%A8`}
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
