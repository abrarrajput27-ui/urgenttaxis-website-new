import { supabaseServer } from '@/lib/supabase/server';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';
import Link from 'next/link';
import masterRoutesData from '@/lib/data/processed-master-routes.json';

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
    <div className="pb-16 bg-white text-slate-900">
      <PublicBreadcrumbs items={breadcrumbItems} />

      {/* Header Banner */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-3">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#059669]/10 text-[#059669] border border-[#059669]/20 text-xs font-bold">
          {allRoutes.length} Verified Intercity Corridors
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#1e1b4b] tracking-tight">
          Outstation Taxi Routes Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          Explore one-way and round-trip outstation cab routes across Delhi NCR, Uttarakhand, Himachal Pradesh, Uttar Pradesh, and Rajasthan with guaranteed transparent per-KM rates.
        </p>
      </section>

      {/* Routes Grid */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {allRoutes.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 flex flex-col justify-between hover:shadow-lg transition-all"
            >
              <div className="space-y-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-50 text-[#1e1b4b] border border-indigo-100">
                  Intercity Outstation Route
                </span>
                <h2 className="text-lg font-black text-[#1e1b4b]">
                  {r.originName} → {r.destName}
                </h2>
                <div className="text-xs text-slate-600 space-y-1 pt-1 font-medium">
                  <p>Verified Distance: <span className="text-[#059669] font-bold">{r.distanceKm} KM</span></p>
                  <p>Est. Travel Time: <span className="text-slate-800 font-semibold">{r.durationText}</span></p>
                  <p>Sedan Fare: <span className="text-blue-600 font-bold">{r.sedanFare}</span></p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/routes/${r.slug}`}
                  className="text-xs font-bold text-[#1e1b4b] hover:text-[#059669] transition-colors border border-slate-200 bg-slate-50 px-3.5 py-2 rounded-xl"
                >
                  View Route & Fares →
                </Link>
                <a
                  href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis%2C%20I%20want%20to%20book%20a%20cab%20from%20${encodeURIComponent(r.originName)}%20to%20${encodeURIComponent(r.destName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
                >
                  Book Cab
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
