import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';
import Image from 'next/image';
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

  const masterMatch = masterRoutesData.find((mr) => mr.slug === slug);
  if (masterMatch) {
    return {
      id: masterMatch.id,
      is_active: true,
      estimated_distance_km: masterMatch.estimated_distance_km,
      estimated_duration_minutes: masterMatch.estimated_duration_minutes,
      origin: { name: masterMatch.originName },
      destination: { name: masterMatch.destName },
      sedanFare: masterMatch.sedanFare,
    };
  }

  // Fallback generation for the mock mass routes
  const parts = slug.split('-to-');
  if (parts.length === 2) {
    const formatName = (str: string) => str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return {
      id: slug,
      is_active: true,
      estimated_distance_km: Math.floor(Math.random() * 400) + 150,
      estimated_duration_minutes: Math.floor(Math.random() * 300) + 120,
      origin: { name: formatName(parts[0].replace('-taxi', '')) },
      destination: { name: formatName(parts[1].replace('-taxi', '')) },
      sedanFare: '₹' + (Math.floor(Math.random() * 2000) + 2000).toLocaleString()
    }
  }

  return null;
}

export async function generateMetadata({ params }: DynamicRoutePageProps) {
  const resolvedParams = await params;
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

  if (!route) notFound();

  const originName = route.origin?.name || 'Origin';
  const destName = route.destination?.name || 'Destination';
  const distance = route.estimated_distance_km;
  const hrs = Math.floor((route.estimated_duration_minutes || 240) / 60);
  const mins = (route.estimated_duration_minutes || 240) % 60;

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Routes', href: '/routes' },
    { label: `${originName} to ${destName} Taxi Service` },
  ];

  const whatsappMessage = encodeURIComponent(`Hello Urgent Taxis! 👋\n\nI would like to book an *Outstation Cab*. 🚕\n📍 *Route*: ${originName} to ${destName}\nPlease let me know the availability and best fare.`);
  const whatsappUrl = `${SITE_CONFIG.whatsapp}?text=${whatsappMessage}`;

  return (
    <div className="pb-20 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <PublicBreadcrumbs items={breadcrumbItems} />
      </div>

      {/* Hero Header */}
      <section className="bg-brand-blue text-white py-4 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-4">
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-sm border border-white/30 uppercase tracking-wider">
            Trusted One Way & Round Trip Taxi Service
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-md">
            {originName} to {destName} Taxi Service
          </h1>
          <p className="text-lg text-blue-100 font-medium max-w-2xl mx-auto">
            Reliable AC Cabs & Professional Highway Drivers for {originName} to {destName}
          </p>
          <div className="text-sm font-semibold text-blue-200 mt-4 animate-bounce">
            ↓ Scroll down to select your preferred vehicle and confirm booking online or via WhatsApp
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Live Route Map & Overview */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-black text-brand-blue flex items-center gap-2">
                  <span className="text-brand-green text-2xl">🗺️</span> Live Route Map, Traffic & Overview
                </h2>
              </div>
              <div className="p-6 bg-slate-50 space-y-6">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm font-bold flex-1 text-slate-700">
                    <span className="text-slate-400 text-xs block mb-1 uppercase">Active Route:</span>
                    Primary Expressway Corridor ({originName} → {destName}) ~ {distance} km
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm font-bold text-slate-700">
                    <span className="text-slate-400 text-xs block mb-1 uppercase">Est. Toll:</span>
                    <span className="text-brand-green">~ ₹573 (5 Plazas)</span>
                  </div>
                </div>
                {/* Mock Map Image representing the iframe */}
                <div className="w-full h-64 bg-slate-200 rounded-xl overflow-hidden border border-slate-300 relative group">
                  <Image src="/logo.jpg" alt="Map" fill className="object-cover opacity-30 grayscale blur-sm" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="bg-brand-blue text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-blue-800 transition-colors">
                      📍 Open Direct Highway Corridor in Maps
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Route Metrics */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-black text-brand-blue mb-6 border-b border-slate-100 pb-4">
                Key Route Metrics & Conditions
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Total Distance & Travel Time</div>
                  <div className="text-xl font-black text-slate-800">{distance} km ~ {hrs} hrs {mins} mins</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Recommended Departure</div>
                  <div className="text-xl font-black text-slate-800">Early Morning <span className="text-sm font-bold text-slate-500">(5 AM - 7 AM)</span></div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-2">
                <h3 className="font-bold text-amber-800 text-sm flex items-center gap-2">
                  ⚠️ Important Customer Note:
                </h3>
                <ul className="list-disc list-inside text-xs text-amber-700 space-y-1 font-medium ml-2">
                  <li>Actual distance may vary depending on exact pickup and drop location.</li>
                  <li>Fuel type depends on vehicle availability.</li>
                  <li>Same vehicle category is guaranteed, exact model (e.g. Dzire/Amaze) depends on availability.</li>
                </ul>
              </div>
            </div>

            {/* Available Vehicle Fares */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-brand-blue text-white">
                <h2 className="text-xl font-black flex items-center gap-2">
                  🚕 Available Vehicle Fares & Rate Card
                </h2>
                <p className="text-sm text-blue-200 mt-1">One Way Drop Fares for {originName} to {destName}</p>
              </div>

              {/* Sedan Card */}
              <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-6 hover:bg-slate-50 transition-colors">
                <div className="md:w-1/3 flex flex-col items-center text-center space-y-2">
                  <h3 className="font-black text-lg text-slate-800 uppercase tracking-wide">Sedan</h3>
                  <p className="text-xs font-bold text-slate-500">Dzire, Etios or similar</p>
                  <div className="h-24 w-40 relative my-2">
                    <Image src="/fleet-brand/dzire.png" alt="Sedan" fill className="object-contain" />
                  </div>
                  <div className="flex gap-4 text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                    <span className="flex items-center gap-1">👤 4</span>
                    <span className="flex items-center gap-1">💼 2</span>
                    <span className="flex items-center gap-1">❄️ AC</span>
                  </div>
                </div>
                <div className="md:w-2/3 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase line-through">₹3652</div>
                      <div className="text-3xl font-black text-brand-blue">₹2889</div>
                      <div className="text-xs font-bold text-slate-500 mt-1">₹2889 + ₹245 (Taxes & Tolls)</div>
                    </div>
                    <span className="bg-brand-green/10 text-brand-green px-3 py-1 rounded-full text-xs font-black border border-brand-green/20">SAVE 20%</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                    <div className="bg-white border border-slate-200 p-2 rounded flex flex-col">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Extra km fare</span>
                      <span>₹15/km after {distance} kms</span>
                    </div>
                    <div className="bg-white border border-slate-200 p-2 rounded flex flex-col">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Fuel Type</span>
                      <span>CNG / Petrol with refills</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <a href={whatsappUrl} className="flex-1 bg-brand-green hover:bg-emerald-600 text-white text-center font-bold py-2.5 rounded-lg shadow-sm transition-colors text-sm">
                      Book via WhatsApp
                    </a>
                    <button className="flex-1 bg-brand-blue hover:bg-blue-900 text-white text-center font-bold py-2.5 rounded-lg shadow-sm transition-colors text-sm">
                      Book Direct Online
                    </button>
                  </div>
                </div>
              </div>

              {/* SUV Card */}
              <div className="p-6 flex flex-col md:flex-row gap-6 hover:bg-slate-50 transition-colors">
                <div className="md:w-1/3 flex flex-col items-center text-center space-y-2">
                  <h3 className="font-black text-lg text-slate-800 uppercase tracking-wide">SUV / MPV</h3>
                  <p className="text-xs font-bold text-slate-500">Ertiga, Carens or similar</p>
                  <div className="h-24 w-40 relative my-2">
                    <Image src="/fleet-brand/Ertiga.png" alt="SUV" fill className="object-contain" />
                  </div>
                  <div className="flex gap-4 text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                    <span className="flex items-center gap-1">👤 6</span>
                    <span className="flex items-center gap-1">💼 4</span>
                    <span className="flex items-center gap-1">❄️ AC</span>
                  </div>
                </div>
                <div className="md:w-2/3 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase line-through">₹4780</div>
                      <div className="text-3xl font-black text-brand-blue">₹3591</div>
                      <div className="text-xs font-bold text-slate-500 mt-1">₹3591 + ₹309 (Taxes & Tolls)</div>
                    </div>
                    <span className="bg-brand-green/10 text-brand-green px-3 py-1 rounded-full text-xs font-black border border-brand-green/20">SAVE 25%</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                    <div className="bg-white border border-slate-200 p-2 rounded flex flex-col">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Extra km fare</span>
                      <span>₹18/km after {distance} kms</span>
                    </div>
                    <div className="bg-white border border-slate-200 p-2 rounded flex flex-col">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Fuel Type</span>
                      <span>CNG / Petrol with refills</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <a href={whatsappUrl} className="flex-1 bg-brand-green hover:bg-emerald-600 text-white text-center font-bold py-2.5 rounded-lg shadow-sm transition-colors text-sm">
                      Book via WhatsApp
                    </a>
                    <button className="flex-1 bg-brand-blue hover:bg-blue-900 text-white text-center font-bold py-2.5 rounded-lg shadow-sm transition-colors text-sm">
                      Book Direct Online
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tolls & Taxes */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-black text-brand-blue mb-4">Estimated Tolls & State Taxes</h2>
              <div className="text-sm font-medium text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 mb-1">State Border Entry Tax</div>
                  <div className="text-xs">Applicable when crossing interstate borders.</div>
                </div>
                <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg font-black text-slate-800">
                  Est. Tax: ~ ₹500
                </div>
              </div>
            </div>

            {/* Airport Pickup Guide */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-black text-brand-blue">✈️ Airport Pickup Guide</h2>
                <span className="bg-white border border-slate-200 px-3 py-1 rounded text-xs font-bold shadow-sm">DEL</span>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h3 className="font-black text-slate-800 border-b border-slate-200 pb-2">Terminal 1 (T1)</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">Domestic low cost carriers. Pickup usually outside Arrivals Gate 1 & 2.</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-black text-slate-800 border-b border-slate-200 pb-2">Terminal 2 (T2)</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">Domestic flights. Short walk from T3. Pickup at designated cab area.</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-black text-slate-800 border-b border-slate-200 pb-2">Terminal 3 (T3)</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">International & Premium Domestic. Multi-level car parking. Pickup typically at Pillar 10 or 14 (Level 2).</p>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar / Quick Booking */}
          <div className="space-y-6">
            
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sticky top-24">
              <h3 className="text-lg font-black text-brand-blue text-center mb-2">Quick Booking</h3>
              <p className="text-xs text-center text-slate-500 font-medium mb-6">Need a cab urgently? Book instantly via WhatsApp or Call.</p>
              
              <div className="space-y-3">
                <a href={whatsappUrl} className="w-full bg-brand-green hover:bg-emerald-600 text-white font-black py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-lg">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" className="w-6 h-6 brightness-0 invert" />
                  WhatsApp Booking
                </a>
                
                <a href={`tel:${SITE_CONFIG.phone}`} className="w-full bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 text-slate-700 font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-lg">
                  📞 +91 7310651940
                </a>
              </div>

              <div className="mt-8 space-y-4">
                <h4 className="font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                  🛡️ Booking & Support
                </h4>
                <ul className="text-xs font-semibold text-slate-600 space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-brand-green">✓</span> Fast WhatsApp Booking
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-green">✓</span> Transparent Pricing Quote
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-green">✓</span> Driver Details 30 mins prior
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-green">✓</span> 24/7 Emergency Support Line
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
