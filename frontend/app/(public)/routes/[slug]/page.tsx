import { notFound, permanentRedirect } from 'next/navigation';
import { getPublicSupabaseClient } from '@/lib/supabase/static-public';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';
import Image from 'next/image';
import Link from 'next/link';
import masterRoutesData from '@/lib/data/processed-master-routes.json';
import verifiedRoutesData from '@/lib/data/verified-routes.json';
import { getRouteCorridorDetails } from '@/lib/data/route-corridor-details';
import RouteMapCard from '@/components/public/RouteMapCard';
import RouteHighlights from '@/components/public/RouteHighlights';
import MmtBookingWidget from '@/components/public/MmtBookingWidget';
import RoutePlacesSection from '@/components/public/RoutePlacesSection';
import RouteMilestonesWeatherTips from '@/components/public/RouteMilestonesWeatherTips';
import RouteGallerySection from '@/components/public/RouteGallerySection';
import RouteSimilarRoutes, { SimilarRouteItem } from '@/components/public/RouteSimilarRoutes';
import DestinationConnectingRoutes, { ConnectingRouteItem } from '@/components/public/DestinationConnectingRoutes';
import PageFAQSection from '@/components/public/PageFAQSection';
import { getRouteSpecificFAQs, getCommonBookingFAQs } from '@/lib/faqs/faq-generator';
import { getDestinationImage } from '@/lib/destination-images';
import { FaRoad, FaArrowRight, FaShieldAlt, FaUserCheck, FaHeadset, FaCheckCircle, FaCar } from 'react-icons/fa';

interface DynamicRoutePageProps {
  params: Promise<{
    slug: string;
  }>;
}

function generateSlug(originName: string, destName: string): string {
  return `${originName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-to-${destName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-taxi`;
}

async function resolveRouteBySlug(slug: string) {
  // 1. Check local master routes first for zero-latency resolution
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

  // 301 Permanent redirect for non-suffix routes
  if (resolvedParams.slug && !resolvedParams.slug.endsWith('-taxi')) {
    permanentRedirect(`/routes/${resolvedParams.slug}-taxi`);
  }

  const route = await resolveRouteBySlug(resolvedParams.slug);

  if (!route) {
    return constructMetadata({ title: 'Route Not Found', noIndex: true });
  }

  const originName = route.origin?.name || 'Origin';
  const destName = route.destination?.name || 'Destination';

  const isVerified = (verifiedRoutesData as string[]).includes(resolvedParams.slug);

  return constructMetadata({
    title: `${originName} to ${destName} Taxi Service | Reliable AC Cabs`,
    description: `Reliable AC Cabs & Professional Highway Drivers for ${originName} to ${destName}. Explore fares, route map, waypoints and verified driver service.`,
    canonicalPath: `/routes/${resolvedParams.slug}`,
    noIndex: !isVerified,
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

export default async function DynamicRoutePage({ params }: DynamicRoutePageProps) {
  const resolvedParams = await params;

  // 301 Permanent redirect for non-suffix routes
  if (resolvedParams.slug && !resolvedParams.slug.endsWith('-taxi')) {
    permanentRedirect(`/routes/${resolvedParams.slug}-taxi`);
  }

  // 301 Permanent redirect for deprecated Gurugram Airport routes
  if (resolvedParams.slug?.startsWith('gurugram-airport-to-')) {
    const canonicalSlug = resolvedParams.slug.replace('gurugram-airport-to-', 'delhi-airport-to-');
    permanentRedirect(`/routes/${canonicalSlug}`);
  }

  const route = await resolveRouteBySlug(resolvedParams.slug);

  if (!route) {
    notFound();
  }

  const originName = route.origin?.name || 'Origin';
  const destName = route.destination?.name || 'Destination';
  const distance = route.estimated_distance_km || 300;
  const hrs = Math.floor((route.estimated_duration_minutes || 360) / 60);
  const durationText = `${hrs} - ${hrs + 1} Hours`;

  // Corridor details (milestones, weather, tips, places, highway)
  const corridor = getRouteCorridorDetails(originName, destName, distance);

  // Unified transparent pricing logic
  const parseFare = (val: any, fallbackRate: number) => {
    if (typeof val === 'number' && val > 0) return val;
    if (typeof val === 'string') {
      const parsed = parseInt(val.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return Math.round(distance * fallbackRate);
  };

  const hatchbackFareTotal = Math.max(1200, Math.round(distance * 10));
  const sedanFareTotal = parseFare(route.sedanFare, 11);
  const ertigaFareTotal = parseFare(route.ertigaFare, 15);
  const crystaFareTotal = parseFare(route.crystaFare, 20);
  const tempoFareTotal = Math.max(3500, Math.round(distance * 26));

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Outstation Taxi', href: '/routes' },
    { label: `${originName} to ${destName} Taxi` },
  ];


  // 1. Curate 5 similar routes from originName
  const similarRoutesMatches = masterRoutesData
    .filter((mr) => mr.slug !== resolvedParams.slug && mr.originName.toLowerCase() === originName.toLowerCase())
    .slice(0, 5);

  const similarRoutesList: SimilarRouteItem[] = similarRoutesMatches.length > 0
    ? similarRoutesMatches.map((mr) => ({
        slug: mr.slug,
        originName: mr.originName,
        destName: mr.destName,
        distanceKm: mr.estimated_distance_km,
        startingFare: typeof mr.sedanFare === 'number' ? mr.sedanFare : parseInt(String(mr.sedanFare || '').replace(/[^0-9]/g, '') || '2899', 10),
        image: getDestinationImage(mr.destName),
      }))
    : [
        { slug: 'delhi-to-mussoorie-taxi', originName: 'Delhi', destName: 'Mussoorie', distanceKm: 290, startingFare: 3499, image: '/destinations/mussoorie.webp' },
        { slug: 'delhi-to-dehradun-taxi', originName: 'Delhi', destName: 'Dehradun', distanceKm: 245, startingFare: 3199, image: '/destinations/dehradun.webp' },
        { slug: 'delhi-to-haridwar-taxi', originName: 'Delhi', destName: 'Haridwar', distanceKm: 215, startingFare: 2899, image: '/destinations/haridwar.webp' },
        { slug: 'delhi-to-rishikesh-taxi', originName: 'Delhi', destName: 'Rishikesh', distanceKm: 240, startingFare: 3299, image: '/destinations/rishikesh.webp' },
        { slug: 'delhi-to-jim-corbett-taxi', originName: 'Delhi', destName: 'Jim Corbett', distanceKm: 260, startingFare: 3699, image: '/destinations/jim-corbett.webp' },
      ];

  // 2. Curate connecting routes originating from destName (User's explicit requirement)
  const directConnectingFromDest = masterRoutesData
    .filter((mr) => mr.originName.toLowerCase() === destName.toLowerCase())
    .map((mr) => ({
      title: `${mr.originName} to ${mr.destName} Taxi`,
      fromCity: mr.originName,
      toCity: mr.destName,
      distanceKm: mr.estimated_distance_km,
      durationText: mr.durationText || `${Math.round(mr.estimated_distance_km / 50)} Hours`,
      startingFare: typeof mr.sedanFare === 'number' ? mr.sedanFare : 3499,
      image: getDestinationImage(mr.destName),
      href: `/routes/${mr.slug}`,
      isDirectRoutePage: true,
    }));

  const connectingRoutesList: ConnectingRouteItem[] = [...directConnectingFromDest];

  // Add return cab to origin if not already in list
  const hasReturnToOrigin = connectingRoutesList.some((r) => r.toCity.toLowerCase() === originName.toLowerCase());
  if (!hasReturnToOrigin) {
    connectingRoutesList.unshift({
      title: `${destName} to ${originName} Return Cab`,
      fromCity: destName,
      toCity: originName,
      distanceKm: distance,
      durationText: durationText,
      startingFare: sedanFareTotal,
      image: getDestinationImage(originName),
      href: `/checkout?serviceType=one_way&pickup=${encodeURIComponent(destName)}&drop=${encodeURIComponent(originName)}&km=${distance}`,
      isDirectRoutePage: false,
    });
  }

  // Ensure 5 solid connecting options departing from destName
  if (connectingRoutesList.length < 5) {
    const hubFallbacks = [
      { name: 'Delhi Airport (IGI T3)', dist: Math.round(distance + 20), fare: sedanFareTotal + 400, img: getDestinationImage('delhi-airport') },
      { name: 'Noida International Airport', dist: Math.round(distance + 15), fare: sedanFareTotal + 300, img: getDestinationImage('noida-international-airport') },
      { name: 'Gurugram Cyber City', dist: Math.round(distance + 35), fare: sedanFareTotal + 500, img: getDestinationImage('gurugram') },
      { name: 'Ghaziabad Junction', dist: Math.round(distance - 10), fare: Math.max(2500, sedanFareTotal - 200), img: getDestinationImage('ghaziabad') },
    ];

    for (const hub of hubFallbacks) {
      if (connectingRoutesList.length >= 5) break;
      if (!connectingRoutesList.some((r) => r.toCity.toLowerCase().includes(hub.name.toLowerCase()))) {
        connectingRoutesList.push({
          title: `${destName} to ${hub.name} Cab`,
          fromCity: destName,
          toCity: hub.name,
          distanceKm: hub.dist,
          durationText: `${Math.round(hub.dist / 50)} - ${Math.round(hub.dist / 45)} Hours`,
          startingFare: hub.fare,
          image: hub.img,
          href: `/checkout?serviceType=one_way&pickup=${encodeURIComponent(destName)}&drop=${encodeURIComponent(hub.name)}&km=${hub.dist}`,
          isDirectRoutePage: false,
        });
      }
    }
  }

  // Route-specific FAQs
  const routeSpecificFaqs = getRouteSpecificFAQs(originName, destName, distance, sedanFareTotal, ertigaFareTotal);
  const commonFaqs = getCommonBookingFAQs().filter(
    (f) => f.question.includes('30% advance') || f.question.includes('payment options') || f.question.includes('cancellation')
  );
  const customFaqs = (route.faqs || []).filter(
    (cf: any) => !routeSpecificFaqs.some((rf) => rf.question.toLowerCase() === cf.question.toLowerCase())
  );
  const allRouteFaqs = [...routeSpecificFaqs, ...customFaqs, ...commonFaqs].slice(0, 6);

  // Cab options cards definition
  const cabOptions = [
    {
      category: 'Hatchback',
      models: 'WagonR, Swift or similar',
      seats: 4,
      bags: 2,
      ratePerKm: 10,
      totalFare: hatchbackFareTotal,
      image: '/fleet-brand/Hatchback.webp',
      checkoutCat: 'hatchback',
    },
    {
      category: 'Sedan',
      models: 'Dzire, Etios or similar',
      seats: 4,
      bags: 3,
      ratePerKm: 11,
      totalFare: sedanFareTotal,
      image: '/fleet-brand/dzire.webp',
      checkoutCat: 'sedan',
    },
    {
      category: 'SUV',
      models: 'Ertiga, Carens or similar',
      seats: 6,
      bags: 4,
      ratePerKm: 15,
      totalFare: ertigaFareTotal,
      image: '/fleet-brand/Ertiga.webp',
      checkoutCat: 'suv-muv',
    },
    {
      category: 'Innova Crysta',
      models: 'Toyota Innova Crysta / Hycross',
      seats: 7,
      bags: 4,
      ratePerKm: 20,
      totalFare: crystaFareTotal,
      image: '/fleet-brand/Innova Crysta.webp',
      checkoutCat: 'executive-suv',
    },
    {
      category: 'Tempo Traveller',
      models: 'Force Tempo Traveller 12-16 Seater',
      seats: '12+',
      bags: 10,
      ratePerKm: 26,
      totalFare: tempoFareTotal,
      image: '/fleet-brand/Tempo Traveller.webp',
      checkoutCat: 'tempo12',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans pb-16">
      {/* Breadcrumbs Navigation - Schema preserved, visible row removed */}
      <PublicBreadcrumbs items={breadcrumbItems} />

      {/* 1. ROUTE HERO SECTION (Urgent Taxis Brand Theme: Navy + Gold CTA + Real Branded Car) */}
      <section className="bg-gradient-to-b from-[#0a1128] via-[#101b3b] to-[#141f42] text-white pt-8 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-6">
          {/* Top Hero Grid: Title + Badges + Car Graphic */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-md">
                {originName} to <span className="text-brand-green">{destName}</span> Taxi
              </h1>

              {/* Subtitle Pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs sm:text-sm font-bold text-blue-100">
                <span className="bg-white/10 backdrop-blur-xs px-3 py-1 rounded-full border border-white/20">
                  Comfortable
                </span>
                <span>•</span>
                <span className="bg-white/10 backdrop-blur-xs px-3 py-1 rounded-full border border-white/20">
                  Safe
                </span>
                <span>•</span>
                <span className="bg-white/10 backdrop-blur-xs px-3 py-1 rounded-full border border-white/20">
                  Affordable
                </span>
                <span>•</span>
                <span className="bg-white/10 backdrop-blur-xs px-3 py-1 rounded-full border border-white/20">
                  One-way & Round Trip
                </span>
              </div>

              {/* Trip Details Strip (Horizontal Icons) */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs sm:text-sm text-slate-200 font-semibold">
                <div className="flex items-center gap-2">
                  <span className="text-brand-green text-base">📏</span>
                  <span>
                    Distance: <strong className="text-white font-black">{distance} km</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-brand-green text-base">⏱️</span>
                  <span>
                    Travel Time: <strong className="text-white font-black">{durationText}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-brand-green text-base">🛣️</span>
                  <span>
                    Best Route: <strong className="text-white font-black">{corridor.highway}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-brand-green text-base">🔄</span>
                  <span>
                    Trip Type: <strong className="text-white font-black">One-way • Round Trip</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Hero Image (Real Branded Vehicle cleanly anchored) */}
            <div className="lg:col-span-5 relative h-52 sm:h-64 lg:h-80 w-full flex items-end justify-center lg:justify-end">
              <div className="relative w-full max-w-lg h-full">
                <Image
                  src="/fleet-brand/Hero.webp"
                  alt={`${originName} to ${destName} Taxi Cab Fleet`}
                  fill
                  priority
                  className="object-contain object-bottom drop-shadow-[0_20px_25px_rgba(0,0,0,0.5)]"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
              </div>
            </div>
          </div>

          {/* Embedded Hero Booking Bar — MMT Style Fare Calculator */}
          <div className="pt-2">
            <MmtBookingWidget
              defaultOrigin={originName}
              defaultDestination={destName}
              defaultDistanceKm={distance}
              routeMode={true}
            />
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* 2. TOP ROW: Route Overview (6 cols) & Cab Options & Fare (6 cols) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Card 1: Route Overview (6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>📖</span> Route Overview
                </h2>
                <span className="text-xs font-bold text-brand-green bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Verified Corridor
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {originName} to {destName} is one of the most popular travel corridors, offering scenic views, pleasant weather, and a comfortable highway journey. We provide clean, air-conditioned cabs with experienced highway drivers for safe doorstep rides.
              </p>

              {/* 2 Stat Boxes */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Highway Distance</span>
                  <span className="text-xl font-black text-slate-900">{distance} km</span>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Drive Duration</span>
                  <span className="text-xl font-black text-slate-900">{durationText}</span>
                </div>
              </div>

              {/* Best Route Chain */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <FaRoad className="text-brand-blue" />
                  <span>Best Highway Route: <strong className="text-brand-blue">{corridor.highway}</strong></span>
                </span>
                <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  {corridor.routeChain}
                </p>
              </div>

              {/* Road Type */}
              <div className="pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Corridor Condition & Road Type
                </span>
                <span className="inline-block text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl">
                  {corridor.roadType}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium flex items-center gap-2">
              <span>🛡️</span>
              <span>24/7 Doorstep Pickup with verified commercial yellow-plate chauffeurs.</span>
            </div>
          </div>

          {/* Card 2: Cab Options & Fare (6 cols) */}
          <div id="cab-options" className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>🚕</span> Cab Options & Fare
                </h2>
                <Link
                  href="/fleet"
                  className="text-xs font-black text-brand-blue hover:text-brand-green transition-colors"
                >
                  View All →
                </Link>
              </div>

              {/* Stack of 5 Vehicles */}
              <div className="divide-y divide-slate-100 space-y-3 pt-2">
                {cabOptions.map((cab, idx) => (
                  <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between gap-3 group">
                    <div className="relative w-14 h-11 shrink-0 bg-slate-50 rounded-lg p-1 border border-slate-100">
                      <Image
                        src={cab.image}
                        alt={`${cab.category} Cab`}
                        fill
                        className="object-contain"
                        sizes="60px"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-brand-blue transition-colors truncate">
                        {cab.category}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        👤 {cab.seats} Seats • 💼 {cab.bags} Bags
                      </p>
                      <div className="text-[11px] font-black text-brand-blue">
                        From ₹{cab.ratePerKm}/km <span className="text-slate-400 font-medium">(₹{cab.totalFare.toLocaleString('en-IN')})</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <Link
                        href={`/checkout?serviceType=one_way&categoryId=${cab.checkoutCat}&routeId=${route.id || ''}&pickup=${encodeURIComponent(originName)}&drop=${encodeURIComponent(destName)}&km=${distance}`}
                        className="px-3.5 py-1.5 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white font-black text-xs transition-all shadow-xs inline-block"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium text-center">
              * Fares exclude toll taxes, payable at actuals. 30% advance token.
            </div>
          </div>
        </section>

        {/* Dedicated Full-Container Highway Route Map */}
        <section className="w-full">
          <RouteMapCard
            originName={originName}
            destName={destName}
            distanceKm={distance}
            durationText={durationText}
            highwayName={corridor.highway}
          />
        </section>

        {/* 3. QUICK ROUTE HIGHLIGHTS (5 Cards) */}
        <section>
          <RouteHighlights
            originName={originName}
            destName={destName}
            highwayName={corridor.highway}
          />
        </section>

        {/* 4. PLACES ON THIS ROUTE (4 Categorized Columns with Show More options & verified maps) */}
        <section>
          <RoutePlacesSection
            originName={originName}
            destName={destName}
            places={corridor.places}
          />
        </section>

        {/* 5. ROUTE GALLERY (5 Cards Carousel with Location-Specific Photos) */}
        <section>
          <RouteGallerySection
            originName={originName}
            destName={destName}
            galleryItems={corridor.gallery}
          />
        </section>

        {/* 6. DISTANCE & ROUTE DETAILS (Milestones) + WEATHER IN DESTINATION + TRAVEL TIPS (2-Column Grid) */}
        <section>
          <RouteMilestonesWeatherTips
            originName={originName}
            destName={destName}
            milestones={corridor.milestones}
            weather={corridor.weather}
            travelTips={corridor.travelTips}
          />
        </section>

        {/* 7. POPULAR CABS & CONNECTING ROUTES FROM DESTINATION (New Section for destination routes) */}
        <section>
          <DestinationConnectingRoutes
            destName={destName}
            originName={originName}
            routes={connectingRoutesList}
          />
        </section>

        {/* 8. FREQUENTLY ASKED QUESTIONS (2-Column Layout matching concept) */}
        <section>
          <PageFAQSection
            faqs={allRouteFaqs}
            title={`Frequently Asked Questions (${originName} to ${destName} Cab)`}
            subtitle={`Quick answers to help you plan your ${originName} to ${destName} trip with Urgent Taxis.`}
            twoColumnLayout={true}
            includeSchema={true}
          />
        </section>

        {/* 9. SIMILAR ROUTES FROM ORIGIN (Real photos and calculated fares - no "on demand") */}
        <section>
          <RouteSimilarRoutes
            originName={originName}
            similarRoutes={similarRoutesList}
          />
        </section>

        {/* 10. BOTTOM CALL-TO-ACTION BANNER */}
        <section className="bg-gradient-to-r from-[#0f172a] via-[#1e1b4b] to-[#0f172a] rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-blue-900/40 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs font-black uppercase tracking-wider text-brand-green bg-brand-green/10 border border-brand-green/20 px-3 py-1 rounded-full">
                Instant Online Booking
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Plan Your Next Journey with <span className="text-brand-green">Urgent Taxis</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                Comfortable rides. Transparent pricing. Professional service across all major North India corridors.
              </p>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs font-bold text-slate-200">
                <div className="flex items-center gap-1.5">
                  <FaShieldAlt className="text-brand-green" />
                  <span>Best Price Guaranteed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaUserCheck className="text-emerald-400" />
                  <span>Verified Drivers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaHeadset className="text-blue-400" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/checkout?serviceType=one_way&pickup=${encodeURIComponent(originName)}&drop=${encodeURIComponent(destName)}&km=${distance}`}
                className="py-3.5 px-6 rounded-2xl bg-brand-green hover:bg-brand-green-hover text-white font-black text-sm text-center shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Book Your Ride</span>
                <FaArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href={`tel:${SITE_CONFIG.phoneRaw}`}
                className="py-3.5 px-6 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm text-center border border-white/20 backdrop-blur-xs transition-colors"
              >
                📞 {SITE_CONFIG.phone}
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
