import { supabaseServer } from '@/lib/supabase/server';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';
import Link from 'next/link';
import masterRoutesData from '@/lib/data/processed-master-routes.json';
import verifiedRoutesData from '@/lib/data/verified-routes.json';
import { resolveOneWayFare } from '@/lib/pricing';
import RoutesTabWidget from '@/components/public/RoutesTabWidget';
import PublicFareWidget from '@/components/public/PublicFareWidget';

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

      {/* Header Banner */}
      <section className="py-10 sm:py-14 md:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 text-xs font-bold shadow-sm">
          {verifiedRoutesData.length} Verified Intercity Corridors
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-brand-blue tracking-tight">
          Outstation Taxi Routes Directory
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          Explore one-way and round-trip outstation cab routes across Delhi NCR, Uttarakhand, Himachal Pradesh, Uttar Pradesh, and Rajasthan with guaranteed transparent per-KM rates.
        </p>
      </section>

      {/* Live Fare Search & Calculator */}
      <section className="mb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <PublicFareWidget initialServiceType="one_way" />
      </section>

      {/* Routes Widget (Replaces Grid) */}
      <section className="py-10 sm:py-14 md:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white rounded-3xl shadow-sm mb-6">
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
              { name: 'Ghaziabad to Haridwar Taxi', slug: 'ghaziabad-to-haridwar-taxi', origin: 'Ghaziabad', dest: 'Haridwar' },
              { name: 'Ghaziabad to Nainital Taxi', slug: 'ghaziabad-to-nainital-taxi', origin: 'Ghaziabad', dest: 'Nainital' },
              { name: 'Ghaziabad to Haldwani Taxi', slug: 'ghaziabad-to-haldwani-taxi', origin: 'Ghaziabad', dest: 'Haldwani' },
              { name: 'Ghaziabad to Jaipur Taxi', slug: 'ghaziabad-to-jaipur-taxi', origin: 'Ghaziabad', dest: 'Jaipur' },
              { name: 'Ghaziabad to Chandigarh Taxi', slug: 'ghaziabad-to-chandigarh-taxi', origin: 'Ghaziabad', dest: 'Chandigarh' },
              { name: 'Delhi to Haridwar Taxi', slug: 'delhi-to-haridwar-taxi', origin: 'Delhi', dest: 'Haridwar' },
              { name: 'Delhi to Rishikesh Taxi', slug: 'delhi-to-rishikesh-taxi', origin: 'Delhi', dest: 'Rishikesh' },
              { name: 'Delhi to Dehradun Taxi', slug: 'delhi-to-dehradun-taxi', origin: 'Delhi', dest: 'Dehradun' },
              { name: 'Delhi to Mussoorie Taxi', slug: 'delhi-to-mussoorie-taxi', origin: 'Delhi', dest: 'Mussoorie' },
              { name: 'Delhi to Nainital Taxi', slug: 'delhi-to-nainital-taxi', origin: 'Delhi', dest: 'Nainital' },
              { name: 'Delhi to Haldwani Taxi', slug: 'delhi-to-haldwani-taxi', origin: 'Delhi', dest: 'Haldwani' },
              { name: 'Delhi to Jim Corbett Taxi', slug: 'delhi-to-jim-corbett-taxi', origin: 'Delhi', dest: 'Jim Corbett' },
              { name: 'Delhi to Agra Taxi', slug: 'delhi-to-agra-taxi', origin: 'Delhi', dest: 'Agra' },
              { name: 'Delhi to Jaipur Taxi', slug: 'delhi-to-jaipur-taxi', origin: 'Delhi', dest: 'Jaipur' },
              { name: 'Delhi to Chandigarh Taxi', slug: 'delhi-to-chandigarh-taxi', origin: 'Delhi', dest: 'Chandigarh' },
              { name: 'Delhi to Shimla Taxi', slug: 'delhi-to-shimla-taxi', origin: 'Delhi', dest: 'Shimla' },
              { name: 'Delhi to Manali Taxi', slug: 'delhi-to-manali-taxi', origin: 'Delhi', dest: 'Manali' },
              { name: 'Delhi to Mathura Taxi', slug: 'delhi-to-mathura-taxi', origin: 'Delhi', dest: 'Mathura' },
              { name: 'Delhi to Vrindavan Taxi', slug: 'delhi-to-vrindavan-taxi', origin: 'Delhi', dest: 'Vrindavan' },
              { name: 'Delhi to Ayodhya Taxi', slug: 'delhi-to-ayodhya-taxi', origin: 'Delhi', dest: 'Ayodhya' },
              { name: 'Noida to Dehradun Taxi', slug: 'noida-to-dehradun-taxi', origin: 'Noida', dest: 'Dehradun' },
              { name: 'Noida to Haldwani Taxi', slug: 'noida-to-haldwani-taxi', origin: 'Noida', dest: 'Haldwani' },
              { name: 'Noida to Jaipur Taxi', slug: 'noida-to-jaipur-taxi', origin: 'Noida', dest: 'Jaipur' },
              { name: 'Noida to Chandigarh Taxi', slug: 'noida-to-chandigarh-taxi', origin: 'Noida', dest: 'Chandigarh' },
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
                <span className="font-bold text-slate-800 group-hover:text-brand-blue text-xs sm:text-sm">
                  {route.name}
                </span>
                <span className="text-[11px] font-semibold text-brand-green mt-1">
                  Starting {route.fare}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
