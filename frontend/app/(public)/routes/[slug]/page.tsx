import { notFound, permanentRedirect } from 'next/navigation';
import { getPublicSupabaseClient } from '@/lib/supabase/static-public';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';
import Image from 'next/image';
import Link from 'next/link';
import RouteBookingWidget from '@/components/public/RouteBookingWidget';
import RoutePlacesSection from '@/components/public/RoutePlacesSection';
import RouteTravelInfoSection from '@/components/public/RouteTravelInfoSection';
import RouteGallerySection from '@/components/public/RouteGallerySection';
import { getPlacesForRoute } from '@/lib/data/route-places-data';

interface DynamicRoutePageProps {
  params: Promise<{
    slug: string;
  }>;
}

function generateSlug(originName: string, destName: string): string {
  return `${originName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-to-${destName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-taxi`;
}

import masterRoutesData from '@/lib/data/processed-master-routes.json';

async function resolveRouteBySlug(slug: string) {
  // 1. Check local master routes first for instant zero-latency resolution
  const masterMatch = masterRoutesData.find((mr) => mr.slug === slug);
  if (masterMatch) {
    return {
      id: masterMatch.id,
      slug: masterMatch.slug,
      is_active: true,
      estimated_distance_km: masterMatch.estimated_distance_km,
      estimated_duration_minutes: masterMatch.estimated_duration_minutes,
      durationText: masterMatch.durationText,
      origin: { name: masterMatch.originName },
      destination: { name: masterMatch.destName },
      sedanFare: masterMatch.sedanFare,
      ertigaFare: masterMatch.ertigaFare,
      crystaFare: masterMatch.crystaFare,
      about: masterMatch.about || '',
      faqs: masterMatch.faqs || [],
    };
  }

  // 2. Fallback to Supabase with safe error handling
  try {
    const supabase = getPublicSupabaseClient();
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
  } catch (err) {
    console.warn('Supabase query failed in resolveRouteBySlug:', err);
  }

  return null;
}

export async function generateMetadata({ params }: DynamicRoutePageProps) {
  const resolvedParams = await params;

  // 301 Permanent redirect for deprecated Gurugram Airport routes
  if (resolvedParams.slug?.startsWith('gurugram-airport-to-')) {
    const canonicalSlug = resolvedParams.slug.replace('gurugram-airport-to-', 'delhi-airport-to-');
    permanentRedirect(`/routes/${canonicalSlug}`);
  }

  // 301 Permanent redirect for non-suffix routes (e.g. /routes/delhi-to-haridwar -> /routes/delhi-to-haridwar-taxi)
  if (resolvedParams.slug && !resolvedParams.slug.endsWith('-taxi')) {
    permanentRedirect(`/routes/${resolvedParams.slug}-taxi`);
  }

  const route = await resolveRouteBySlug(resolvedParams.slug);

  if (!route) {
    return constructMetadata({ title: 'Route Not Found', noIndex: true });
  }

  const originName = route.origin?.name || 'Origin';
  const destName = route.destination?.name || 'Destination';

  return constructMetadata({
    title: `${originName} to ${destName} Taxi Service | Reliable AC Cabs`,
    description: `Reliable AC Cabs & Professional Highway Drivers for ${originName} to ${destName}. Explore one way drops, tolls, distance and fare breakdown.`,
    canonicalPath: `/routes/${resolvedParams.slug}`,
  });
}


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

  // 301 Permanent redirect for deprecated Gurugram Airport routes
  if (resolvedParams.slug?.startsWith('gurugram-airport-to-')) {
    const canonicalSlug = resolvedParams.slug.replace('gurugram-airport-to-', 'delhi-airport-to-');
    permanentRedirect(`/routes/${canonicalSlug}`);
  }

  // 301 Permanent redirect for non-suffix routes
  if (resolvedParams.slug && !resolvedParams.slug.endsWith('-taxi')) {
    permanentRedirect(`/routes/${resolvedParams.slug}-taxi`);
  }

  const route = await resolveRouteBySlug(resolvedParams.slug);

  if (!route) notFound();

  const originName = route.origin?.name || 'Origin';
  const destName = route.destination?.name || 'Destination';
  const distance = route.estimated_distance_km || 200;
  const hrs = Math.floor((route.estimated_duration_minutes || 240) / 60);
  const mins = (route.estimated_duration_minutes || 240) % 60;

  // Curated Places along this corridor
  const placesAlongRoute = getPlacesForRoute(destName, distance);

  // Unified transparent pricing logic
  const parseFare = (val: any, fallbackRate: number) => {
    if (typeof val === 'number' && val > 0) return val;
    if (typeof val === 'string') {
      const parsed = parseInt(val.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return Math.round(distance * fallbackRate);
  };

  const sedanFareTotal = parseFare(route.sedanFare, 13.5);
  const ertigaFareTotal = parseFare(route.ertigaFare, 17.5);
  const crystaFareTotal = parseFare(route.crystaFare, 26);

  const estimatedToll = Math.round(distance * 1.6);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Routes', href: '/routes' },
    { label: `${originName} to ${destName} Taxi Service` },
  ];

  // Calculate up to 4 genuinely related routes from the same origin or sharing the destination
  const relatedRoutes = masterRoutesData
    .filter((mr) => mr.slug !== resolvedParams.slug && (mr.originName === originName || mr.destName === destName))
    .slice(0, 4);

  return (
    <div className="pb-20 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <PublicBreadcrumbs items={breadcrumbItems} />
      </div>

      {/* Hero Header */}
      <section className="bg-brand-blue text-white py-6 sm:py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-3">
          <span className="inline-block px-3.5 py-1 bg-white/20 rounded-full text-xs font-black backdrop-blur-sm border border-white/30 uppercase tracking-wider">
            One-Way & Round-Trip Taxi Service
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight drop-shadow-md">
            {originName} to {destName} Taxi Service
          </h1>
          <p className="text-base sm:text-lg text-blue-100 font-medium max-w-2xl mx-auto">
            Reliable AC Cabs & Professional Highway Drivers for {originName} to {destName} (~{distance} km)
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Route Map & Overview (Phase 2.3) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-black text-brand-blue flex items-center gap-2">
                  <span className="text-brand-green text-2xl">🗺️</span> Route Map & Highway Corridor Overview
                </h2>
                <span className="text-xs bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full">
                  Corridor Map
                </span>
              </div>
              <div className="p-6 bg-slate-50 space-y-6">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm font-bold flex-1 text-slate-700">
                    <span className="text-slate-400 text-xs block mb-1 uppercase">Corridor:</span>
                    Primary Expressway ({originName} → {destName}) ~ {distance} km
                  </div>
                  <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm font-bold text-slate-700">
                    <span className="text-slate-400 text-xs block mb-1 uppercase">Estimated Toll:</span>
                    <span className="text-brand-green">~ ₹{estimatedToll} (Fastag Plaza Estimates)</span>
                  </div>
                </div>

                {/* Keyless OpenStreetMap Live Corridor Overview */}
                <div className="space-y-3">
                  <div className="w-full h-64 rounded-xl overflow-hidden border border-slate-300 relative bg-slate-100">
                    <iframe
                      title={`Interactive Highway Corridor Route Map from ${originName} to ${destName}`}
                      src="https://www.openstreetmap.org/export/embed.html?bbox=76.5%2C26.5%2C80.0%2C31.0&layer=mapnik"
                      width="100%"
                      height="256"
                      loading="lazy"
                      className="w-full h-full border-0"
                    />
                  </div>
                  <div className="flex justify-end">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originName)}&destination=${encodeURIComponent(destName)}&travelmode=driving`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-brand-blue hover:text-brand-green flex items-center gap-1.5 transition-colors"
                    >
                      📍 Open Turn-by-Turn GPS Directions in Google Maps →
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Route Metrics (Phase 2.2) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-black text-brand-blue mb-4 border-b border-slate-100 pb-3">
                Key Route Metrics & Driving Conditions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Total Distance & Travel Time</div>
                  <div className="text-xl font-black text-slate-800">{distance} km ~ {hrs} hrs {mins} mins</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Recommended Departure</div>
                  <div className="text-xl font-black text-slate-800">Early Morning <span className="text-sm font-bold text-slate-500">(5 AM - 7 AM)</span></div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-1 text-xs text-blue-900 font-medium">
                <span className="font-bold flex items-center gap-1">ℹ️ Doorstep Pickup Information:</span>
                <p>Our driver arrives at your specified home or hotel address with air conditioning prepared for your journey.</p>
              </div>
            </div>

            {/* Available Vehicle Fares (Phase 2.5) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-brand-blue text-white flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black flex items-center gap-2">
                    🚕 Available Vehicle Fares & Rate Card
                  </h2>
                  <p className="text-xs text-blue-200 mt-1">One-Way Drop Fares for {originName} to {destName}</p>
                </div>
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-bold">
                  Clear Breakdown Options
                </span>
              </div>

              {/* Sedan Card */}
              <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-6 hover:bg-slate-50 transition-colors">
                <div className="md:w-1/3 flex flex-col items-center text-center space-y-2">
                  <h3 className="font-black text-lg text-slate-800 uppercase tracking-wide">Sedan</h3>
                  <p className="text-xs font-bold text-slate-500">Dzire, Etios or similar</p>
                  <div className="h-24 w-40 relative my-2">
                    <Image src="/fleet-brand/dzire.png" alt="Sedan Dzire Cab" fill className="object-contain" />
                  </div>
                  <div className="flex gap-4 text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                    <span>👤 4</span>
                    <span>💼 2</span>
                    <span>❄️ AC</span>
                  </div>
                </div>
                <div className="md:w-2/3 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Total Fare</div>
                      <div className="text-3xl font-black text-brand-blue">₹{sedanFareTotal.toLocaleString('en-IN')}</div>
                      <div className="text-xs text-slate-600 mt-1 font-medium">
                        Base: ₹{Math.max(sedanFareTotal - estimatedToll, Math.round(distance * 11)).toLocaleString('en-IN')} + Est. Toll: ~₹{estimatedToll}
                      </div>
                    </div>
                    <span className="bg-blue-50 text-brand-blue px-3 py-1 rounded-full text-xs font-bold border border-blue-200">Fixed Fare</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                    <div className="bg-white border border-slate-200 p-2.5 rounded-xl flex flex-col">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Extra km fare</span>
                      <span className="font-bold text-slate-800">₹11/km after {distance} kms</span>
                    </div>
                    <div className="bg-white border border-slate-200 p-2.5 rounded-xl flex flex-col">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Driver Allowance</span>
                      <span className="font-bold text-brand-green">Included in Base</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                    <Link
                      href={`/checkout?serviceType=one_way&categoryId=sedan&routeId=${route.id || ''}&pickup=${encodeURIComponent(originName)}&drop=${encodeURIComponent(destName)}&km=${distance}`}
                      className="flex-1 bg-brand-blue hover:bg-brand-blue-hover text-white text-center font-bold py-2.5 rounded-lg shadow-sm transition-colors text-sm"
                    >
                      Book Sedan Online
                    </Link>
                    <a
                      href={generateWhatsAppLink(SITE_CONFIG.whatsapp, {
                        pickup: originName,
                        drop: destName,
                        tripType: 'Outstation Drop',
                        vehicleCategory: 'Sedan (Dzire/Etios)',
                        totalFare: sedanFareTotal,
                        tokenAmount: Math.round(sedanFareTotal * 0.30),
                        balanceAmount: sedanFareTotal - Math.round(sedanFareTotal * 0.30),
                        baseFare: Math.max(sedanFareTotal - estimatedToll, Math.round(distance * 11)),
                        estimatedToll: estimatedToll,
                        customMessage: `Hello Urgent Taxis! 👋\n\nI would like to book a *Sedan* for ${originName} to ${destName}.\nEstimated Fare: ₹${sedanFareTotal.toLocaleString('en-IN')}.`
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-brand-green hover:bg-emerald-600 text-white text-center font-bold py-2.5 rounded-lg shadow-sm transition-colors text-sm"
                    >
                      Book via WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              {/* SUV / MPV Card */}
              <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-6 hover:bg-slate-50 transition-colors">
                <div className="md:w-1/3 flex flex-col items-center text-center space-y-2">
                  <h3 className="font-black text-lg text-slate-800 uppercase tracking-wide">SUV / MPV</h3>
                  <p className="text-xs font-bold text-slate-500">Ertiga, Carens or similar</p>
                  <div className="h-24 w-40 relative my-2">
                    <Image src="/fleet-brand/Ertiga.png" alt="SUV Ertiga Cab" fill className="object-contain" />
                  </div>
                  <div className="flex gap-4 text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                    <span>👤 6</span>
                    <span>💼 4</span>
                    <span>❄️ AC</span>
                  </div>
                </div>
                <div className="md:w-2/3 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Total Fare</div>
                      <div className="text-3xl font-black text-brand-blue">₹{ertigaFareTotal.toLocaleString('en-IN')}</div>
                      <div className="text-xs text-slate-600 mt-1 font-medium">
                        Base: ₹{Math.max(ertigaFareTotal - estimatedToll, Math.round(distance * 15)).toLocaleString('en-IN')} + Est. Toll: ~₹{estimatedToll}
                      </div>
                    </div>
                    <span className="bg-blue-50 text-brand-blue px-3 py-1 rounded-full text-xs font-bold border border-blue-200">Spacious</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                    <div className="bg-white border border-slate-200 p-2.5 rounded-xl flex flex-col">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Extra km fare</span>
                      <span className="font-bold text-slate-800">₹15/km after {distance} kms</span>
                    </div>
                    <div className="bg-white border border-slate-200 p-2.5 rounded-xl flex flex-col">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Driver Allowance</span>
                      <span className="font-bold text-brand-green">Included in Base</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                    <Link
                      href={`/checkout?serviceType=one_way&categoryId=suv-muv&routeId=${route.id || ''}&pickup=${encodeURIComponent(originName)}&drop=${encodeURIComponent(destName)}&km=${distance}`}
                      className="flex-1 bg-brand-blue hover:bg-brand-blue-hover text-white text-center font-bold py-2.5 rounded-lg shadow-sm transition-colors text-sm"
                    >
                      Book SUV Online
                    </Link>
                    <a
                      href={generateWhatsAppLink(SITE_CONFIG.whatsapp, {
                        pickup: originName,
                        drop: destName,
                        tripType: 'Outstation Drop',
                        vehicleCategory: 'SUV (Ertiga/Carens)',
                        totalFare: ertigaFareTotal,
                        tokenAmount: Math.round(ertigaFareTotal * 0.30),
                        balanceAmount: ertigaFareTotal - Math.round(ertigaFareTotal * 0.30),
                        baseFare: Math.max(ertigaFareTotal - estimatedToll, Math.round(distance * 15)),
                        estimatedToll: estimatedToll,
                        customMessage: `Hello Urgent Taxis! 👋\n\nI would like to book an *Ertiga SUV* for ${originName} to ${destName}.\nEstimated Fare: ₹${ertigaFareTotal.toLocaleString('en-IN')}.`
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-brand-green hover:bg-emerald-600 text-white text-center font-bold py-2.5 rounded-lg shadow-sm transition-colors text-sm"
                    >
                      Book via WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              {/* Premium Innova Crysta Card */}
              <div className="p-6 flex flex-col md:flex-row gap-6 hover:bg-slate-50 transition-colors">
                <div className="md:w-1/3 flex flex-col items-center text-center space-y-2">
                  <h3 className="font-black text-lg text-slate-800 uppercase tracking-wide">Innova Crysta</h3>
                  <p className="text-xs font-bold text-slate-500">Toyota Innova Crysta / Hycross</p>
                  <div className="h-24 w-40 relative my-2">
                    <Image src="/fleet-brand/Innova%20Crysta.png" alt="Innova Crysta Luxury Taxi" fill className="object-contain" />
                  </div>
                  <div className="flex gap-4 text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                    <span>👤 7</span>
                    <span>💼 5</span>
                    <span>❄️ AC</span>
                  </div>
                </div>
                <div className="md:w-2/3 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Total Fare</div>
                      <div className="text-3xl font-black text-brand-blue">₹{crystaFareTotal.toLocaleString('en-IN')}</div>
                      <div className="text-xs text-slate-600 mt-1 font-medium">
                        Base: ₹{Math.max(crystaFareTotal - estimatedToll, Math.round(distance * 20)).toLocaleString('en-IN')} + Est. Toll: ~₹{estimatedToll}
                      </div>
                    </div>
                    <span className="bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">Luxury</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                    <div className="bg-white border border-slate-200 p-2.5 rounded-xl flex flex-col">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Extra km fare</span>
                      <span className="font-bold text-slate-800">₹20/km after {distance} kms</span>
                    </div>
                    <div className="bg-white border border-slate-200 p-2.5 rounded-xl flex flex-col">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Captain Seats</span>
                      <span className="font-bold text-brand-green">Guaranteed</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                    <Link
                      href={`/checkout?serviceType=one_way&categoryId=executive-suv&routeId=${route.id || ''}&pickup=${encodeURIComponent(originName)}&drop=${encodeURIComponent(destName)}&km=${distance}`}
                      className="flex-1 bg-brand-blue hover:bg-brand-blue-hover text-white text-center font-bold py-2.5 rounded-lg shadow-sm transition-colors text-sm"
                    >
                      Book Crysta Online
                    </Link>
                    <a
                      href={generateWhatsAppLink(SITE_CONFIG.whatsapp, {
                        pickup: originName,
                        drop: destName,
                        tripType: 'Outstation Drop',
                        vehicleCategory: 'Premium SUV (Innova Crysta)',
                        totalFare: crystaFareTotal,
                        tokenAmount: Math.round(crystaFareTotal * 0.30),
                        balanceAmount: crystaFareTotal - Math.round(crystaFareTotal * 0.30),
                        baseFare: Math.max(crystaFareTotal - estimatedToll, Math.round(distance * 20)),
                        estimatedToll: estimatedToll,
                        customMessage: `Hello Urgent Taxis! 👋\n\nI would like to book a *Toyota Innova Crysta* for ${originName} to ${destName}.\nEstimated Fare: ₹${crystaFareTotal.toLocaleString('en-IN')}.`
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-brand-green hover:bg-emerald-600 text-white text-center font-bold py-2.5 rounded-lg shadow-sm transition-colors text-sm"
                    >
                      Book via WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Places Along the Route (Phase 2.6) */}
            <RoutePlacesSection
              places={placesAlongRoute}
              originName={originName}
              destName={destName}
            />

            {/* Route Travel Info & Highway Guide (Phase 2.7 & 2.9) */}
            <RouteTravelInfoSection
              originName={originName}
              destName={destName}
              distanceKm={distance}
              durationHours={hrs}
              durationMins={mins}
            />

            {/* Route & Fleet Gallery (Phase 2.8) */}
            <RouteGallerySection
              originName={originName}
              destName={destName}
            />

            {/* Verified Route Narrative (Phase 2.1) */}
            {route.about && route.about.trim().length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                <h2 className="text-xl font-black text-brand-blue border-b border-slate-100 pb-3 flex items-center gap-2">
                  <span>📖</span> Route Overview & Travel Guide
                </h2>
                <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed font-medium space-y-3">
                  <p>{route.about}</p>
                </div>
              </div>
            )}

            {/* Verified FAQs Accordion (Phase 2.10) */}
            {route.faqs && route.faqs.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                <h2 className="text-xl font-black text-brand-blue border-b border-slate-100 pb-3 flex items-center gap-2">
                  <span>❓</span> Frequently Asked Questions ({originName} to {destName} Cab)
                </h2>
                <div className="space-y-3 pt-2">
                  {route.faqs.map((faq: { question: string; answer: string }, idx: number) => (
                    <details key={idx} className="group border border-slate-200 rounded-xl p-4 open:bg-slate-50 transition-colors">
                      <summary className="font-bold text-slate-800 cursor-pointer list-none flex justify-between items-center text-sm">
                        <span>{faq.question}</span>
                        <span className="text-brand-blue group-open:rotate-180 transition-transform font-black">▾</span>
                      </summary>
                      <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium border-t border-slate-200/60 pt-3">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* Related Corridors / Internal Linking (Phase 2.11) */}
            {relatedRoutes.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                <h2 className="text-xl font-black text-brand-blue border-b border-slate-100 pb-3 flex items-center gap-2">
                  <span>🔄</span> Popular Related Outstation Taxi Corridors
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Frequently traveled connecting routes and destinations from {originName}:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {relatedRoutes.map((rel) => (
                    <Link
                      key={rel.slug}
                      href={`/routes/${rel.slug}`}
                      className="group p-3 rounded-xl border border-slate-200 hover:border-brand-blue bg-slate-50 hover:bg-blue-50/50 transition-all flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-800 group-hover:text-brand-blue text-sm">
                          {rel.originName} to {rel.destName} Cab
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          ~{rel.estimated_distance_km} km | From ₹{rel.sedanFare}
                        </div>
                      </div>
                      <span className="text-brand-blue group-hover:translate-x-1 transition-transform text-lg">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar: Interactive Route Booking Widget (Phase 2.4) */}
          <div className="space-y-6">
            <div className="sticky top-20 space-y-6">
              <RouteBookingWidget
                defaultOrigin={originName}
                defaultDestination={destName}
                defaultDistanceKm={distance}
                routeId={route.id}
              />

              {/* 24/7 Telephone Booking Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 text-center space-y-3">
                <h4 className="font-bold text-slate-800 text-sm">Need Help Booking?</h4>
                <p className="text-xs text-slate-500">Call our 24/7 highway dispatch desk directly:</p>
                <a
                  href={`tel:${SITE_CONFIG.phoneRaw}`}
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-base transition-colors"
                >
                  📞 {SITE_CONFIG.phone}
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
