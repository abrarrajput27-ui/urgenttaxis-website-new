"use client";

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Car } from 'lucide-react';
import { resolveOneWayFare, buildWhatsAppBookingLink } from '@/lib/pricing';
import masterRoutesData from '@/lib/data/processed-master-routes.json';
import { useState, useMemo } from 'react';

// De-duplicated list of state destinations
const STATES_DATA: Record<string, string[]> = {
  "Delhi": [
    "New Delhi", "Delhi Airport", "Connaught Place", "Dwarka", "Rohini", "Vasant Kunj", 
    "Karol Bagh", "Lajpat Nagar", "Hauz Khas", "Saket", "Chandni Chowk", "Mayur Vihar", 
    "Janakpuri", "Pitampura", "Okhla", "Chanakyapuri", "Greater Kailash", "Defense Colony", 
    "South Extension", "Sarojini Nagar", "Rajouri Garden", "Punjabi Bagh", "Kirti Nagar", 
    "Patel Nagar", "Paharganj", "Sadar Bazar", "Kashmere Gate", "Shahdara", "Seelampur", 
    "Narela", "Bawana", "Najafgarh", "Palam", "Mahipalpur", "Chattarpur", "Mehrauli", 
    "Vasant Vihar", "R.K. Puram", "Moti Bagh", "Dhaula Kuan", "Delhi Cantonment", 
    "Rajendra Place", "Paschim Vihar", "Peera Garhi", "Mangolpuri", "Sultanpuri", 
    "Nangloi", "Mundka", "Tikri Border"
  ],
  "Ghaziabad & UP": [
    "Ghaziabad", "Noida", "Greater Noida", "Indirapuram", "Vaishali", "Vasundhara", 
    "Raj Nagar Extension", "Crossings Republik", "Agra", "Mathura", "Vrindavan", 
    "Varanasi", "Lucknow", "Kanpur", "Allahabad (Prayagraj)", "Meerut", "Aligarh", 
    "Bareilly", "Moradabad", "Saharanpur", "Gorakhpur", "Jhansi", "Muzaffarnagar", "Ayodhya"
  ],
  "Haryana": [
    "Gurugram", "Faridabad", "Panipat", "Karnal", "Ambala", "Hisar", "Rohtak", 
    "Sonipat", "Kurukshetra", "Yamunanagar", "Panchkula", "Rewari", "Bhiwani", "Palwal"
  ],
  "Uttarakhand": [
    "Haridwar", "Rishikesh", "Dehradun", "Nainital", "Haldwani", "Mussoorie", 
    "Jim Corbett", "Ramnagar", "Almora", "Ranikhet", "Kausani", "Roorkee", 
    "Mukteshwar", "Badrinath", "Kedarnath", "Auli"
  ],
  "Rajasthan": [
    "Jaipur", "Jodhpur", "Udaipur", "Bikaner", "Ajmer", "Kota", "Alwar", 
    "Pushkar", "Jaisalmer", "Mount Abu", "Bharatpur", "Neemrana"
  ],
  "Punjab & HP": [
    "Chandigarh", "Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Shimla", 
    "Manali", "Dharamshala", "Dalhousie", "Kasauli", "Kullu", "Mandi"
  ]
};

const TOP_DESTINATIONS = [
  "Haridwar", "Rishikesh", "Dehradun", "Nainital", "Haldwani", "Agra", "Jaipur", 
  "Chandigarh", "Shimla", "Manali", "Jim Corbett", "Mathura", "Amritsar", "Ayodhya"
];

export default function RoutesTabWidget() {
  const [activeState, setActiveState] = useState("Ghaziabad & UP");
  const [activeCity, setActiveCity] = useState("Ghaziabad");

  // Generate verified routes using single source of truth pricing engine
  const currentRoutes = useMemo(() => {
    const origin = activeCity;
    const destList = TOP_DESTINATIONS.filter(
      (d) => d.toLowerCase() !== origin.toLowerCase()
    ).slice(0, 8);

    return destList.map((dest, i) => {
      const q = resolveOneWayFare(origin, dest);
      const exactMatch = (masterRoutesData as any[]).find(
        (r) =>
          r.originName.toLowerCase() === origin.toLowerCase() &&
          r.destName.toLowerCase() === dest.toLowerCase()
      );

      const distance = q?.distanceKm || exactMatch?.estimated_distance_km || 220;
      const price = q?.sedanFare || exactMatch?.sedanFare || Math.round(distance * 11);
      const slug = q?.slug || exactMatch?.slug || `${origin.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-to-${dest.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-taxi`;

      return {
        id: i,
        origin,
        destination: dest,
        distance,
        price,
        slug,
        image: `/destinations/${dest.toLowerCase().replace(/ /g, '-')}.jpg`,
      };
    });
  }, [activeCity]);

  return (
    <div className="w-full max-w-full min-w-0 font-sans">
      {/* 1. STATE SELECTOR TABS */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 py-2 px-2 mb-2 sm:mb-4">
        {Object.keys(STATES_DATA).map((state) => (
          <button
            key={state}
            type="button"
            onClick={() => {
              setActiveState(state);
              setActiveCity(STATES_DATA[state][0]);
            }}
            className={`whitespace-nowrap px-3 sm:px-5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 border-2 cursor-pointer ${
              activeState === state
                ? 'bg-[#1e1b4b] border-[#1e1b4b] text-white shadow-md scale-[1.02]'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {state}
          </button>
        ))}
      </div>

      {/* 2. ORIGIN CITY CHIPS */}
      <div className="bg-slate-50 rounded-3xl p-4 sm:p-6 border border-slate-200/80">
        <div className="flex overflow-x-auto hide-scrollbar gap-1.5 sm:gap-2 pb-2 mb-4 sm:mb-6">
          {(STATES_DATA[activeState] || []).map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => setActiveCity(city)}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border whitespace-nowrap shrink-0 cursor-pointer ${
                activeCity === city
                  ? 'bg-[#059669] border-[#059669] text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-[#059669] hover:text-[#059669]'
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* 3. POPULAR CORRIDORS CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {currentRoutes.map((route) => {
            const whatsappUrl = buildWhatsAppBookingLink({
              serviceType: 'One-way',
              vehicleName: 'Sedan',
              origin: route.origin,
              destination: route.destination,
              estimatedFare: route.price,
              pageUrl: `https://www.urgenttaxis.in/routes/${route.slug}`,
            });

            return (
              <div
                key={route.id}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col h-full"
              >
                <div className="h-40 relative overflow-hidden bg-slate-100">
                  <Image
                    src={route.image}
                    alt={`${route.origin} to ${route.destination} cab`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/destinations/nainital.jpg';
                    }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                    <h3 className="text-white font-black tracking-tight leading-tight text-sm">
                      <span className="block text-[11px] font-semibold text-slate-300">
                        {route.origin} to
                      </span>
                      {route.destination}
                    </h3>
                  </div>
                </div>

                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center text-xs text-slate-600 font-semibold bg-slate-50 p-2 rounded-xl">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 text-emerald-600 shrink-0" />
                      <span>
                        Approx. <strong className="text-slate-900">{route.distance} KM</strong>
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-slate-600 font-semibold bg-slate-50 p-2 rounded-xl">
                      <Car className="w-3.5 h-3.5 mr-1.5 text-indigo-900 shrink-0" />
                      <span>Hatchback, Sedan & Innova</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2 mt-auto">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold text-slate-500">Starts at</span>
                      <span className="text-lg font-black text-[#1e1b4b] font-mono">
                        ₹{route.price.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link
                        href={`/routes/${route.slug}`}
                        prefetch={true}
                        className="bg-[#1e1b4b] hover:bg-slate-800 text-white text-xs text-center font-bold px-3 py-2 rounded-xl shadow-xs transition-all flex items-center justify-center"
                      >
                        View Fare
                      </Link>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#059669] hover:bg-[#047857] text-white text-xs text-center font-bold px-3 py-2 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1"
                      >
                        <span>💬</span> WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
}
