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
    <div className="pb-16">
      {/* 1. Breadcrumbs */}
      <PublicBreadcrumbs items={breadcrumbItems} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* 2. Hero Section */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
          Flexible Hourly City Packages
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Local Hourly Cab Rentals
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Book half-day and full-day cabs for city travel, shopping, and business meetings with transparent package limits and fixed extra rates.
        </p>
      </section>

      {/* 3. Active Local Rental Packages Grid */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl font-bold text-white">Active Database Rental Packages</h2>
          <p className="text-xs text-slate-400">Available hourly packages and extra usage rates.</p>
        </div>

        {localPackages && localPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {localPackages.map((pkg) => {
              const catName = pkg.vehicle_categories?.name || 'Standard Category';

              return (
                <div key={pkg.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {catName}
                      </span>
                      <span className="font-mono text-xs text-amber-400 font-bold">
                        {pkg.included_hours} Hours / {pkg.included_km} KM
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white">
                      {pkg.package_name || `${pkg.included_hours}H / ${pkg.included_km}KM Package`}
                    </h3>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2 text-slate-300">
                      <div className="flex justify-between border-b border-slate-800 pb-1">
                        <span>Base Package Fare:</span>
                        <span className="font-mono text-emerald-400 font-bold">₹{pkg.base_fare}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Extra KM Rate:</span>
                        <span className="font-mono text-slate-300">₹{pkg.extra_km_rate}/KM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Extra Hour Rate:</span>
                        <span className="font-mono text-slate-300">₹{pkg.extra_hour_rate}/Hour</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <a
                      href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis%2C%20I%20want%20to%20book%20the%20${encodeURIComponent(catName)}%20Local%20Rental%20Package%20(${pkg.included_hours}H%2F${pkg.included_km}KM)`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-extrabold py-3 rounded-xl transition-colors"
                    >
                      Book Package via WhatsApp
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-3">
            <h3 className="text-base font-bold text-amber-400">Fare on Request</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Custom local rental packages (4h/40km, 8h/80km, 12h/120km) are available upon request through our support desk.
            </p>
          </div>
        )}
      </section>

      {/* 4. Fare Calculator Widget */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl font-bold text-white">Calculate Local Package Fare</h2>
          <p className="text-xs text-slate-400">Use our secure server pricing widget to estimate your trip fare.</p>
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
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3">
          <h3 className="text-base font-bold text-emerald-400">✓ Included in Package</h3>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li>Vehicle fuel charges up to package distance limit</li>
            <li>Driver allowance for package duration</li>
            <li>Multiple city stops within package limits</li>
          </ul>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3">
          <h3 className="text-base font-bold text-amber-400">⚠️ Excluded / Payable at Actuals</h3>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li>Extra kilometers beyond package threshold (billed per KM)</li>
            <li>Extra hours beyond package duration (billed per Hour)</li>
            <li>Parking fees and municipal toll taxes</li>
          </ul>
        </div>
      </section>

      {/* 6. Visible FAQs */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-900">
        <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-8">
          Frequently Asked Questions (Local Rentals)
        </h2>
        <div className="space-y-4 text-xs">
          {visibleFaqs.map((faq, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
              <h3 className="text-sm font-bold text-white">{faq.question}</h3>
              <p className="text-slate-400 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Final CTA */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center border-t border-slate-900">
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Need a Local City Taxi Package?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`tel:${SITE_CONFIG.phoneRaw}`}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              📞 Call {SITE_CONFIG.phone}
            </a>
            <a
              href={SITE_CONFIG.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-6 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              💬 WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
