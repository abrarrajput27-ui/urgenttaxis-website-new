import { supabaseServer } from '@/lib/supabase/server';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';
import Link from 'next/link';
import masterRoutesData from '@/lib/data/processed-master-routes.json';
import RoutesTabWidget from '@/components/public/RoutesTabWidget';

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
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 text-xs font-bold shadow-sm">
          {allRoutes.length} Verified Intercity Corridors
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-brand-blue tracking-tight">
          Outstation Taxi Routes Directory
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          Explore one-way and round-trip outstation cab routes across Delhi NCR, Uttarakhand, Himachal Pradesh, Uttar Pradesh, and Rajasthan with guaranteed transparent per-KM rates.
        </p>
      </section>

      {/* Routes Widget (Replaces Grid) */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white rounded-3xl shadow-sm mb-16">
        <RoutesTabWidget />
      </section>
    </div>
  );
}
