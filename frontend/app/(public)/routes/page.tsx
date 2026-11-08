import { supabaseServer } from '@/lib/supabase/server';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';
import Link from 'next/link';
import masterRoutesData from '@/lib/data/processed-master-routes.json';
import verifiedRoutesData from '@/lib/data/verified-routes.json';
import { resolveOneWayFare } from '@/lib/pricing';
import { getLocationState } from '@/lib/location-authority';
import RoutesTabWidget from '@/components/public/RoutesTabWidget';
import DirectBookingComparison from '@/components/public/DirectBookingComparison';

export const metadata = constructMetadata({
  title: 'Outstation Taxi Routes & Intercity Cabs Directory',
  description: 'Explore verified outstation cab routes from Delhi NCR to Agra, Haridwar, Jaipur, Dehradun, Haldwani, Nainital, and popular North India destinations with transparent pricing.',
  canonicalPath: '/routes',
});

function generateSlug(originName: string, destName: string): string {
  return `${originName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-to-${destName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-taxi`;
}

export default async function RoutesDirectoryPage() {
  const supabase = await supabaseServer();

  const { data: dbRoutes } = await supabase
    .from('routes')
    .select('*, origin:locations!routes_origin_location_id_fkey(*), destination:locations!routes_destination_location_id_fkey(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // Consolidate DB routes and 502 master routes into one unified unique list
  const routeMap = new Map();

  // Add DB routes first
  if (dbRoutes) {
    dbRoutes.forEach((r) => {
      const originName = r.origin?.name || 'Origin';
      const destName = r.destination?.name || 'Destination';
      const slug = generateSlug(originName, destName);
      routeMap.set(slug, {
        id: r.id,
        slug,
        originName,
        destName,
        distanceKm: r.estimated_distance_km,
        durationText: r.estimated_duration_minutes ? `${Math.floor(r.estimated_duration_minutes / 60)} hrs ${r.estimated_duration_minutes % 60} mins` : 'Flexible',
        sedanFare: 'From ₹11/KM',
      });
    });
  }

  // Add master routes from legacy consolidation
  masterRoutesData.forEach((mr) => {
    if (!routeMap.has(mr.slug)) {
      routeMap.set(mr.slug, {
        id: mr.id,
        slug: mr.slug,
        originName: mr.originName,
        destName: mr.destName,
        distanceKm: mr.estimated_distance_km,
        durationText: mr.durationText,
        sedanFare: `Starting ₹${mr.sedanFare}`,
      });
    }
  });

  const allRoutes = Array.from(routeMap.values());

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Outstation Routes' },
  ];

  return (
    <div className="pb-16 bg-slate-50 text-slate-900 min-h-screen">
      <div className="bg-white border-b border-slate-100">
        <PublicBreadcrumbs items={breadcrumbItems} />
      </div>

      {/* 1. UPGRADED HERO SECTION */}
      <section className="relative bg-[#0a1128] text-white py-14 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
            <span>{verifiedRoutesData.length} Verified Intercity Corridors</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
            Outstation Taxi <span className="text-brand-green">Routes Directory</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed font-medium">
            Explore one-way and round-trip outstation cab routes across Delhi NCR, Uttarakhand, Himachal Pradesh, Uttar Pradesh, and Rajasthan with guaranteed transparent per-KM rates.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs sm:text-sm font-semibold text-blue-200">
            <span className="bg-white/10 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/15">
              🛣️ 500+ Verified Routes
            </span>
            <span>•</span>
            <span className="bg-white/10 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/15">
              🛡️ Verified Yellow-Plate Cabs
            </span>
            <span>•</span>
            <span className="bg-white/10 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/15">
              💰 Zero Return Fare on One-Way
            </span>
          </div>
        </div>
      </section>

      {/* Routes Widget */}
      <section className="py-10 sm:py-14 md:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white rounded-3xl shadow-sm mb-6 mt-6">
        <RoutesTabWidget />
      </section>

      {/* Featured Priority Corridors for Direct Indexation */}
      <section className="py-10 sm:py-14 md:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-brand-blue flex items-center gap-2">
            <span>⭐</span> Popular Priority Outstation Routes
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Direct highway drops with door-to-door pickup across Delhi, Ghaziabad, Noida, and Gurgaon:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
            {[
              // Uttarakhand Corridors
              { name: 'Ghaziabad to Haridwar Taxi', slug: 'ghaziabad-to-haridwar-taxi', origin: 'Ghaziabad', dest: 'Haridwar' },
              { name: 'Ghaziabad to Nainital Taxi', slug: 'ghaziabad-to-nainital-taxi', origin: 'Ghaziabad', dest: 'Nainital' },
              { name: 'Ghaziabad to Haldwani Taxi', slug: 'ghaziabad-to-haldwani-taxi', origin: 'Ghaziabad', dest: 'Haldwani' },
              { name: 'Ghaziabad to Dehradun Taxi', slug: 'ghaziabad-to-dehradun-taxi', origin: 'Ghaziabad', dest: 'Dehradun' },
              { name: 'Ghaziabad to Rishikesh Taxi', slug: 'ghaziabad-to-rishikesh-taxi', origin: 'Ghaziabad', dest: 'Rishikesh' },
              { name: 'Ghaziabad to Jim Corbett Taxi', slug: 'ghaziabad-to-jim-corbett-taxi', origin: 'Ghaziabad', dest: 'Jim Corbett' },
              { name: 'Ghaziabad to Mussoorie Taxi', slug: 'ghaziabad-to-mussoorie-taxi', origin: 'Ghaziabad', dest: 'Mussoorie' },
              { name: 'Ghaziabad to Kainchi Dham Taxi', slug: 'ghaziabad-to-kainchi-dham-taxi', origin: 'Ghaziabad', dest: 'Kainchi Dham' },
              { name: 'Ghaziabad to Jaipur Taxi', slug: 'ghaziabad-to-jaipur-taxi', origin: 'Ghaziabad', dest: 'Jaipur' },
              { name: 'Ghaziabad to Agra Taxi', slug: 'ghaziabad-to-agra-taxi', origin: 'Ghaziabad', dest: 'Agra' },
              { name: 'Ghaziabad to Mathura Taxi', slug: 'ghaziabad-to-mathura-taxi', origin: 'Ghaziabad', dest: 'Mathura' },
              { name: 'Ghaziabad to Chandigarh Taxi', slug: 'ghaziabad-to-chandigarh-taxi', origin: 'Ghaziabad', dest: 'Chandigarh' },
              { name: 'Delhi to Haridwar Taxi', slug: 'delhi-to-haridwar-taxi', origin: 'Delhi', dest: 'Haridwar' },
              { name: 'Delhi to Rishikesh Taxi', slug: 'delhi-to-rishikesh-taxi', origin: 'Delhi', dest: 'Rishikesh' },
              { name: 'Delhi to Dehradun Taxi', slug: 'delhi-to-dehradun-taxi', origin: 'Delhi', dest: 'Dehradun' },
              { name: 'Delhi to Mussoorie Taxi', slug: 'delhi-to-mussoorie-taxi', origin: 'Delhi', dest: 'Mussoorie' },
              { name: 'Delhi to Nainital Taxi', slug: 'delhi-to-nainital-taxi', origin: 'Delhi', dest: 'Nainital' },
              { name: 'Delhi to Haldwani Taxi', slug: 'delhi-to-haldwani-taxi', origin: 'Delhi', dest: 'Haldwani' },
              { name: 'Delhi to Bhimtal Taxi', slug: 'delhi-to-bhimtal-taxi', origin: 'Delhi', dest: 'Bhimtal' },
              { name: 'Delhi to Almora Taxi', slug: 'delhi-to-almora-taxi', origin: 'Delhi', dest: 'Almora' },
              { name: 'Delhi to Ranikhet Taxi', slug: 'delhi-to-ranikhet-taxi', origin: 'Delhi', dest: 'Ranikhet' },
              { name: 'Delhi to Jim Corbett Taxi', slug: 'delhi-to-jim-corbett-taxi', origin: 'Delhi', dest: 'Jim Corbett' },
              { name: 'Delhi to Ramnagar Taxi', slug: 'delhi-to-ramnagar-taxi', origin: 'Delhi', dest: 'Ramnagar' },
              { name: 'Delhi to Rudrapur Taxi', slug: 'delhi-to-rudrapur-taxi', origin: 'Delhi', dest: 'Rudrapur' },
              { name: 'Delhi to Kashipur Taxi', slug: 'delhi-to-kashipur-taxi', origin: 'Delhi', dest: 'Kashipur' },
              { name: 'Delhi to Roorkee Taxi', slug: 'delhi-to-roorkee-taxi', origin: 'Delhi', dest: 'Roorkee' },
              { name: 'Delhi to Kotdwar Taxi', slug: 'delhi-to-kotdwar-taxi', origin: 'Delhi', dest: 'Kotdwar' },
              { name: 'Delhi to Lansdowne Taxi', slug: 'delhi-to-lansdowne-taxi', origin: 'Delhi', dest: 'Lansdowne' },
              // UP Corridors
              { name: 'Delhi to Agra Taxi', slug: 'delhi-to-agra-taxi', origin: 'Delhi', dest: 'Agra' },
              { name: 'Delhi to Mathura Taxi', slug: 'delhi-to-mathura-taxi', origin: 'Delhi', dest: 'Mathura' },
              { name: 'Delhi to Vrindavan Taxi', slug: 'delhi-to-vrindavan-taxi', origin: 'Delhi', dest: 'Vrindavan' },
              { name: 'Delhi to Goverdhan Taxi', slug: 'delhi-to-goverdhan-taxi', origin: 'Delhi', dest: 'Goverdhan' },
              { name: 'Delhi to Bareilly Taxi', slug: 'delhi-to-bareilly-taxi', origin: 'Delhi', dest: 'Bareilly' },
              { name: 'Delhi to Moradabad Taxi', slug: 'delhi-to-moradabad-taxi', origin: 'Delhi', dest: 'Moradabad' },
              { name: 'Delhi to Aligarh Taxi', slug: 'delhi-to-aligarh-taxi', origin: 'Delhi', dest: 'Aligarh' },
              { name: 'Delhi to Lucknow Taxi', slug: 'delhi-to-lucknow-taxi', origin: 'Delhi', dest: 'Lucknow' },
              { name: 'Delhi to Kanpur Taxi', slug: 'delhi-to-kanpur-taxi', origin: 'Delhi', dest: 'Kanpur' },
              { name: 'Delhi to Ayodhya Taxi', slug: 'delhi-to-ayodhya-taxi', origin: 'Delhi', dest: 'Ayodhya' },
              { name: 'Delhi to Varanasi Taxi', slug: 'delhi-to-varanasi-taxi', origin: 'Delhi', dest: 'Varanasi' },
              { name: 'Delhi to Prayagraj Taxi', slug: 'delhi-to-prayagraj-taxi', origin: 'Delhi', dest: 'Prayagraj' },
              { name: 'Delhi to Gorakhpur Taxi', slug: 'delhi-to-gorakhpur-taxi', origin: 'Delhi', dest: 'Gorakhpur' },
              { name: 'Delhi to Meerut Taxi', slug: 'delhi-to-meerut-taxi', origin: 'Delhi', dest: 'Meerut' },
              // Rajasthan Corridors
              { name: 'Delhi to Jaipur Taxi', slug: 'delhi-to-jaipur-taxi', origin: 'Delhi', dest: 'Jaipur' },
              { name: 'Delhi to Ajmer Taxi', slug: 'delhi-to-ajmer-taxi', origin: 'Delhi', dest: 'Ajmer' },
              { name: 'Delhi to Pushkar Taxi', slug: 'delhi-to-pushkar-taxi', origin: 'Delhi', dest: 'Pushkar' },
              { name: 'Delhi to Khatu Shyam Ji Taxi', slug: 'delhi-to-khatu-shyam-ji-taxi', origin: 'Delhi', dest: 'Khatu Shyam Ji' },
              { name: 'Delhi to Salasar Balaji Taxi', slug: 'delhi-to-salasar-balaji-taxi', origin: 'Delhi', dest: 'Salasar Balaji' },
              { name: 'Delhi to Neemrana Taxi', slug: 'delhi-to-neemrana-taxi', origin: 'Delhi', dest: 'Neemrana' },
              { name: 'Delhi to Bhiwadi Taxi', slug: 'delhi-to-bhiwadi-taxi', origin: 'Delhi', dest: 'Bhiwadi' },
              { name: 'Delhi to Udaipur Taxi', slug: 'delhi-to-udaipur-taxi', origin: 'Delhi', dest: 'Udaipur' },
              { name: 'Delhi to Jodhpur Taxi', slug: 'delhi-to-jodhpur-taxi', origin: 'Delhi', dest: 'Jodhpur' },
              // Himachal & Punjab Corridors
              { name: 'Delhi to Chandigarh Taxi', slug: 'delhi-to-chandigarh-taxi', origin: 'Delhi', dest: 'Chandigarh' },
              { name: 'Delhi to Shimla Taxi', slug: 'delhi-to-shimla-taxi', origin: 'Delhi', dest: 'Shimla' },
              { name: 'Delhi to Manali Taxi', slug: 'delhi-to-manali-taxi', origin: 'Delhi', dest: 'Manali' },
              { name: 'Delhi to Dharamshala Taxi', slug: 'delhi-to-dharamshala-taxi', origin: 'Delhi', dest: 'Dharamshala' },
              { name: 'Delhi to Kasauli Taxi', slug: 'delhi-to-kasauli-taxi', origin: 'Delhi', dest: 'Kasauli' },
              { name: 'Delhi to Amritsar Taxi', slug: 'delhi-to-amritsar-taxi', origin: 'Delhi', dest: 'Amritsar' },
              { name: 'Delhi to Ludhiana Taxi', slug: 'delhi-to-ludhiana-taxi', origin: 'Delhi', dest: 'Ludhiana' },
              { name: 'Delhi to Jalandhar Taxi', slug: 'delhi-to-jalandhar-taxi', origin: 'Delhi', dest: 'Jalandhar' },
              // Noida & Gurgaon Corridors
              { name: 'Noida to Dehradun Taxi', slug: 'noida-to-dehradun-taxi', origin: 'Noida', dest: 'Dehradun' },
              { name: 'Noida to Haldwani Taxi', slug: 'noida-to-haldwani-taxi', origin: 'Noida', dest: 'Haldwani' },
              { name: 'Noida to Nainital Taxi', slug: 'noida-to-nainital-taxi', origin: 'Noida', dest: 'Nainital' },
              { name: 'Noida to Haridwar Taxi', slug: 'noida-to-haridwar-taxi', origin: 'Noida', dest: 'Haridwar' },
              { name: 'Noida to Jaipur Taxi', slug: 'noida-to-jaipur-taxi', origin: 'Noida', dest: 'Jaipur' },
              { name: 'Noida to Agra Taxi', slug: 'noida-to-agra-taxi', origin: 'Noida', dest: 'Agra' },
              { name: 'Noida to Mathura Taxi', slug: 'noida-to-mathura-taxi', origin: 'Noida', dest: 'Mathura' },
              { name: 'Noida to Chandigarh Taxi', slug: 'noida-to-chandigarh-taxi', origin: 'Noida', dest: 'Chandigarh' },
              { name: 'Gurugram to Jaipur Taxi', slug: 'gurugram-to-jaipur-taxi', origin: 'Gurugram', dest: 'Jaipur' },
              { name: 'Gurugram to Agra Taxi', slug: 'gurugram-to-agra-taxi', origin: 'Gurugram', dest: 'Agra' },
              { name: 'Gurugram to Chandigarh Taxi', slug: 'gurugram-to-chandigarh-taxi', origin: 'Gurugram', dest: 'Chandigarh' },
              { name: 'Gurugram to Haridwar Taxi', slug: 'gurugram-to-haridwar-taxi', origin: 'Gurugram', dest: 'Haridwar' },
            ].map((route) => {
              const q = resolveOneWayFare(route.origin, route.dest);
              const fare = q?.sedanFare ? `₹${q.sedanFare.toLocaleString('en-IN')}` : '₹3,499';
              return { ...route, fare };
            }).map((route) => (
              <Link
                key={route.slug}
                href={`/routes/${route.slug}`}
                className="p-3 rounded-xl border border-slate-200 hover:border-brand-blue bg-slate-50 hover:bg-blue-50/50 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded">
                      {getLocationState(route.dest)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Verified</span>
                  </div>
                  <span className="font-bold text-slate-800 group-hover:text-brand-blue text-xs sm:text-sm block">
                    {route.name}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-brand-green mt-2 block">
                  Starting {route.fare}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Direct Booking Comparison Section */}
      <DirectBookingComparison />
    </div>
  );
}
