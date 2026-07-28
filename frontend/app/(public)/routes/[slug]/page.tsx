import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';
import PublicFareWidget from '@/components/public/PublicFareWidget';
import VehicleImage from '@/components/public/VehicleImage';
import Link from 'next/link';

interface DynamicRoutePageProps {
  params: Promise<{
    slug: string;
  }>;
}

function generateSlug(originName: string, destName: string): string {
  return `${originName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-to-${destName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-taxi`;
}

import masterRoutesData from '@/lib/data/processed-master-routes.json';

// Helper to resolve route by slug from database or master routes
async function resolveRouteBySlug(slug: string) {
  const supabase = await supabaseServer();
  const { data: routes } = await supabase
    .from('routes')
    .select('*, origin:locations!routes_origin_location_id_fkey(*), destination:locations!routes_destination_location_id_fkey(*)')
    .eq('is_active', true);

  if (routes) {
    const dbMatch = routes.find((r) => {
      const originName = r.origin?.name || '';
      const destName = r.destination?.name || '';
      return generateSlug(originName, destName) === slug;
    });

    if (dbMatch) return dbMatch;
  }

  // Fallback to master 502 consolidated routes
  const masterMatch = masterRoutesData.find((mr) => mr.slug === slug);
  if (masterMatch) {
    return {
      id: masterMatch.id,
      is_active: true,
      estimated_distance_km: masterMatch.estimated_distance_km,
      estimated_duration_minutes: masterMatch.estimated_duration_minutes,
      origin: { name: masterMatch.originName },
      destination: { name: masterMatch.destName },
      aboutContent: masterMatch.about,
      customFaqs: masterMatch.faqs,
      sedanFare: masterMatch.sedanFare,
      ertigaFare: masterMatch.ertigaFare,
      crystaFare: masterMatch.crystaFare,
    };
  }

  return null;
}

export async function generateMetadata({ params }: DynamicRoutePageProps) {
  const resolvedParams = await params;
  const route = await resolveRouteBySlug(resolvedParams.slug);

  if (!route) {
    return constructMetadata({
      title: 'Route Not Found',
      noIndex: true,
    });
  }

  const originName = route.origin?.name || 'Origin';
  const destName = route.destination?.name || 'Destination';

  return constructMetadata({
    title: `${originName} to ${destName} Taxi Service | One Way & Round Trip Cab`,
    description: `Book reliable sedan and SUV cabs from ${originName} to ${destName}. Verified distance ${route.estimated_distance_km} KM. Transparent per-KM pricing and professional drivers.`,
    canonicalPath: `/routes/${resolvedParams.slug}`,
  });
}

import { getPublicSupabaseClient } from '@/lib/supabase/static-public';

export async function generateStaticParams() {
  const supabase = getPublicSupabaseClient();
  const { data: routes } = await supabase
    .from('routes')
    .select('*, origin:locations!routes_origin_location_id_fkey(*), destination:locations!routes_destination_location_id_fkey(*)')
    .eq('is_active', true);

  const slugsSet = new Set<string>();

  if (routes) {
    routes.forEach((r) => {
      slugsSet.add(generateSlug(r.origin?.name || '', r.destination?.name || ''));
    });
  }

  masterRoutesData.forEach((mr) => {
    slugsSet.add(mr.slug);
  });

  return Array.from(slugsSet).map((slug) => ({ slug }));
}

export default async function RouteDetailPage({ params }: DynamicRoutePageProps) {
  const resolvedParams = await params;
  const route = await resolveRouteBySlug(resolvedParams.slug);

  if (!route) {
    notFound();
  }

  const supabase = await supabaseServer();

  const originName = route.origin?.name || 'Origin';
  const destName = route.destination?.name || 'Destination';

  // Fetch Master Data
  const { data: categories } = await supabase
    .from('vehicle_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  const { data: localPackages } = await supabase
    .from('pricing_local_packages')
    .select('*')
    .eq('is_active', true);

  const { data: oneWayRules } = await supabase
    .from('pricing_one_way')
    .select('*, vehicle_categories(*)')
    .eq('route_id', route.id)
    .eq('is_active', true);

  // Check for reverse route in DB
  const { data: allRoutes } = await supabase
    .from('routes')
    .select('*, origin:locations!routes_origin_location_id_fkey(*), destination:locations!routes_destination_location_id_fkey(*)')
    .eq('is_active', true);

  const reverseRoute = allRoutes?.find(
    (r) => r.origin_location_id === route.destination_location_id && r.destination_location_id === route.origin_location_id
  );
  const reverseSlug = reverseRoute ? generateSlug(destName, originName) : null;

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Outstation Routes', href: '/routes' },
    { label: `${originName} to ${destName}` },
  ];

  // Route specific visible FAQs
  const visibleFaqs = [
    {
      question: `What is the driving distance from ${originName} to ${destName}?`,
      answer: `The verified highway driving distance from ${originName} to ${destName} is approximately ${route.estimated_distance_km} KM.`,
    },
    {
      question: `Can I book a one-way cab from ${originName} to ${destName}?`,
      answer: `Yes, Urgent Taxis provides dedicated one-way outstation cab service from ${originName} to ${destName}. You pay only for one-way travel.`,
    },
    {
      question: `Are toll taxes included in the ${originName} to ${destName} taxi fare?`,
      answer: `Toll taxes and state border entry taxes are excluded from the base fare and are payable at actual toll plazas, unless explicitly marked as included in your quotation.`,
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
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#059669]/10 text-[#059669] border border-[#059669]/20 text-xs font-bold">
          Verified Intercity Taxi Corridor
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[#1e1b4b] tracking-tight leading-tight">
          {originName} to {destName} Taxi Service
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
          Book reliable One-Way and Round-Trip cabs from {originName} to {destName}. Clean vehicles, experienced highway chauffeurs, and itemized billing.
        </p>
      </section>

      {/* 3. Route Summary & 4. Fare Quotation Widget */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Route Summary Card */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 lg:col-span-1 shadow-sm">
          <h2 className="text-lg font-black text-[#1e1b4b] border-b border-slate-100 pb-3">Route Summary</h2>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Origin:</span>
              <span className="text-[#1e1b4b] font-bold">{originName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Destination:</span>
              <span className="text-[#1e1b4b] font-bold">{destName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Verified Distance:</span>
              <span className="text-[#059669] font-bold">{route.estimated_distance_km} KM</span>
            </div>
            {route.estimated_duration_minutes && (
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Est. Duration:</span>
                <span className="text-slate-800 font-semibold">
                  {Math.floor(route.estimated_duration_minutes / 60)} hrs {route.estimated_duration_minutes % 60} mins
                </span>
              </div>
            )}
          </div>

          {reverseSlug && (
            <div className="pt-3 border-t border-slate-100">
              <Link
                href={`/routes/${reverseSlug}`}
                className="text-xs text-[#059669] hover:underline font-bold inline-flex items-center gap-1"
              >
                🔄 View Return Route ({destName} to {originName}) →
              </Link>
            </div>
          )}
        </div>

        {/* Fare Search Widget */}
        <div className="lg:col-span-2">
          <PublicFareWidget
            localPackages={localPackages || []}
            categories={categories || []}
            routes={allRoutes || []}
            locations={locations || []}
          />
        </div>
      </section>

      {/* 5. Available Vehicle Categories & 6. Pricing Rules */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-[#1e1b4b] tracking-tight">
            Available Cabs & Pricing for {originName} to {destName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Database-backed rates per vehicle category.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories?.map((cat) => {
            const rule = oneWayRules?.find((r) => r.category_id === cat.id);

            return (
              <div key={cat.id} className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-24 h-20 relative bg-slate-50 border border-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                    <VehicleImage
                      categoryImageUrl={cat.image_url}
                      alt={`${cat.name} cab for ${originName} to ${destName}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{cat.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{cat.description}</p>
                    <span className="text-xs text-slate-300 font-medium block mt-1">Capacity: {cat.max_passengers || 4} Passengers</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                  <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1">Fare Breakdown</h4>
                  {rule ? (
                    <div className="space-y-1 text-slate-300">
                      <div className="flex justify-between">
                        <span>Base Fare ({rule.included_km} KM Included):</span>
                        <span className="font-mono text-emerald-400 font-bold">₹{rule.base_fare}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Extra Distance Rate:</span>
                        <span className="font-mono text-slate-300">₹{rule.extra_km_rate}/KM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Driver Allowance:</span>
                        <span className="font-mono text-slate-300">₹{rule.driver_allowance}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 text-center text-amber-400 font-bold">
                      Fare on Request
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Included vs 8. Excluded Charges */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3">
          <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
            ✓ Included in Base Fare
          </h3>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li>Vehicle fuel charges for the entire trip distance</li>
            <li>Driver allowance and night halt (if applicable)</li>
            <li>Included distance threshold as specified in rule</li>
            <li>Doorstep pickup and drop</li>
          </ul>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3">
          <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
            ⚠️ Excluded / Payable at Actuals
          </h3>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li>Toll Plaza charges encountered during the journey</li>
            <li>State Border Entry Taxes (e.g. UP, Haryana, Rajasthan state tax)</li>
            <li>Parking fees at destinations or transit stops</li>
            <li>Airport entry/parking fees if applicable</li>
          </ul>
        </div>
      </section>

      {/* 9. Booking Process & 10. Why Choose Us */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How to Book Your {originName} to {destName} Cab
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">Simple 3-step outstation cab booking process.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-bold mx-auto flex items-center justify-center text-sm">1</div>
            <h3 className="text-sm font-bold text-white">Select Vehicle & Date</h3>
            <p className="text-xs text-slate-400">Choose your preferred vehicle category (Sedan or SUV) and pickup time.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-bold mx-auto flex items-center justify-center text-sm">2</div>
            <h3 className="text-sm font-bold text-white">Get Instant Quotation</h3>
            <p className="text-xs text-slate-400">Check itemized quotation via our secure server pricing calculator.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-bold mx-auto flex items-center justify-center text-sm">3</div>
            <h3 className="text-sm font-bold text-white">Confirm via WhatsApp</h3>
            <p className="text-xs text-slate-400">Connect with our support desk for instant driver assignment.</p>
          </div>
        </div>
      </section>

      {/* About Route Content (From Master Consolidation) */}
      {'aboutContent' in route && route.aboutContent && (
        <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100 space-y-4">
          <h2 className="text-2xl font-black text-[#1e1b4b]">About {originName} to {destName} Taxi Route</h2>
          <div className="bg-slate-50 border border-slate-200 p-6 sm:p-8 rounded-2xl text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            {route.aboutContent}
          </div>
        </section>
      )}

      {/* 11. Route FAQ */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-100">
        <h2 className="text-xl sm:text-2xl font-black text-[#1e1b4b] text-center mb-8">
          Frequently Asked Questions ({originName} to {destName})
        </h2>
        <div className="space-y-4 text-xs">
          {('customFaqs' in route && Array.isArray(route.customFaqs) && route.customFaqs.length > 0 ? route.customFaqs : visibleFaqs).map((faq: { question?: string; answer?: string; q?: string; a?: string }, idx: number) => (
            <div key={idx} className="bg-white border border-slate-200 p-5 rounded-xl space-y-2 shadow-sm">
              <h3 className="text-sm font-bold text-[#1e1b4b]">{faq.question || faq.q}</h3>
              <p className="text-slate-600 leading-relaxed">{faq.answer || faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 12. Final CTA */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center border-t border-slate-900">
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Book {originName} to {destName} Taxi Now
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`tel:${SITE_CONFIG.phoneRaw}`}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              📞 Call {SITE_CONFIG.phone}
            </a>
            <a
              href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis%2C%20I%20want%20to%20book%20a%20cab%20from%20${encodeURIComponent(originName)}%20to%20${encodeURIComponent(destName)}`}
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
