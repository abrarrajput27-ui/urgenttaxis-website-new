'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaRoute, FaArrowRight, FaMapMarkerAlt, FaCar, FaShieldAlt } from 'react-icons/fa';
import { getDestinationImage } from '@/lib/destination-images';

interface InterconnectedRouteNetworkProps {
  originName: string;
  originState: string;
  destName: string;
  destState: string;
  distanceKm: number;
  className?: string;
}

function toSlug(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// 14 Indian States with Key Hubs, Cities & Pilgrimage/Tourist Villages
const STATE_INTERCONNECT_HUBS: Record<string, string[]> = {
  'Bihar': [
    'Patna', 'Gaya', 'Bodh Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga', 
    'Rajgir', 'Nalanda', 'Buxar', 'Sasaram', 'Motihari', 'Bettiah', 
    'Arrah', 'Purnia', 'Begusarai', 'Katihar', 'Siwan', 'Chhapra'
  ],
  'Delhi NCR': [
    'Delhi', 'New Delhi', 'Delhi Airport (IGI T3)', 'Noida', 'Greater Noida', 
    'Ghaziabad', 'Gurugram', 'Faridabad', 'Noida International Airport', 
    'Alipur', 'Bawana', 'Mehrauli', 'Najafgarh'
  ],
  'Goa': [
    'Panaji', 'Margao (Madgaon)', 'Calangute', 'Candolim', 'Baga', 
    'Anjuna', 'Arambol', 'Colva', 'Morjim', 'Palolem', 'Vasco da Gama', 'Mapusa'
  ],
  'Gujarat': [
    'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 
    'Junagadh', 'Somnath', 'Dwarka', 'Gandhinagar', 'Anand', 'Dahej'
  ],
  'Haryana': [
    'Ambala', 'Panipat', 'Karnal', 'Rohtak', 'Hisar', 'Sonipat', 
    'Rewari', 'Sirsa', 'Kurukshetra', 'Jind', 'Bhiwani', 'Murthal'
  ],
  'Himachal Pradesh': [
    'Shimla', 'Manali', 'Kullu', 'Dharamshala', 'Kasauli', 'Dalhousie', 
    'Kasol', 'Chail', 'Solan', 'Bilaspur', 'Mandi', 'Palampur'
  ],
  'Jammu & Kashmir': [
    'Srinagar', 'Jammu', 'Katra (Vaishno Devi)', 'Gulmarg', 'Pahalgam', 
    'Patnitop', 'Sonamarg', 'Anantnag', 'Baramulla', 'Doda', 'Kishtwar'
  ],
  'Madhya Pradesh': [
    'Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Khajuraho', 
    'Omkareshwar', 'Orchha', 'Pachmarhi', 'Sagar', 'Rewa', 'Ratlam'
  ],
  'Maharashtra': [
    'Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Shirdi', 'Mahabaleshwar', 
    'Lonavala', 'Alibaug', 'Thane', 'Navi Mumbai', 'Kolhapur', 'Solapur'
  ],
  'Punjab': [
    'Amritsar', 'Ludhiana', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 
    'Pathankot', 'Hoshiarpur', 'Khanna', 'Phagwara', 'Kapurthala', 'Anandpur Sahib'
  ],
  'Rajasthan': [
    'Jaipur', 'Udaipur', 'Jodhpur', 'Jaisalmer', 'Bikaner', 'Ajmer', 
    'Pushkar', 'Khatu Shyam Ji', 'Salasar Balaji', 'Mount Abu', 'Alwar', 'Neemrana'
  ],
  'Uttar Pradesh': [
    'Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Prayagraj', 'Ayodhya', 
    'Mathura', 'Vrindavan', 'Bareilly', 'Moradabad', 'Meerut', 'Aligarh'
  ],
  'Uttarakhand': [
    'Haridwar', 'Rishikesh', 'Dehradun', 'Mussoorie', 'Nainital', 'Haldwani', 
    'Kathgodam', 'Bhimtal', 'Almora', 'Ranikhet', 'Jim Corbett', 'Ramnagar'
  ],
  'West Bengal': [
    'Kolkata', 'Howrah', 'Siliguri', 'Darjeeling', 'Durgapur', 'Asansol', 
    'Kalimpong', 'Shantiniketan', 'Digha', 'Mandarmoni', 'Murshidabad', 'Malda'
  ],
};

export default function InterconnectedRouteNetwork({
  originName,
  originState,
  destName,
  destState,
  distanceKm,
  className = '',
}: InterconnectedRouteNetworkProps) {
  // Default to destination state tab or neighboring state
  const stateKeys = Object.keys(STATE_INTERCONNECT_HUBS).sort((a, b) => a.localeCompare(b));
  const defaultTab = stateKeys.includes(destState) ? destState : 'Uttar Pradesh';
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  const hubs = STATE_INTERCONNECT_HUBS[activeTab] || [];
  const filteredHubs = hubs.filter((h) => h.toLowerCase() !== destName.toLowerCase());

  return (
    <div className={`space-y-6 font-sans ${className}`}>
      {/* 1. Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-brand-blue text-xs font-bold mb-1.5">
            <FaRoute className="w-3.5 h-3.5" />
            <span>All-India Interconnected Route Network</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Interconnected Cabs &amp; Routes from <span className="text-brand-blue">{destName}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl mt-1">
            Book verified outstation cabs connecting <strong>{destName} ({destState})</strong> with all states, cities, tehsils, and pilgrimage centers across India.
          </p>
        </div>

        {/* Return Trip Quick Link */}
        <Link
          href={`/routes/${toSlug(destName)}-to-${toSlug(originName)}-taxi`}
          prefetch={true}
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white font-black text-xs transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <span>{destName} to {originName} Return Cab</span>
          <FaArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* 2. State Tabs Navigation (Strict A-to-Z Order) */}
      <div className="relative">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs font-bold">
          {stateKeys.map((state) => {
            const isActive = activeTab === state;
            return (
              <button
                key={state}
                onClick={() => setActiveTab(state)}
                className={`shrink-0 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-brand-blue text-white shadow-xs font-black'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 font-bold'
                }`}
              >
                {state}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Interconnected Route Cards Grid for Selected State */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredHubs.map((hub, idx) => {
          const routeSlug = `${toSlug(destName)}-to-${toSlug(hub)}-taxi`;
          const hubImg = getDestinationImage(hub);
          
          return (
            <Link
              key={idx}
              href={`/routes/${routeSlug}`}
              prefetch={false}
              className="group p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-brand-blue/50 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 cursor-pointer active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                  <Image
                    src={hubImg}
                    alt={`${destName} to ${hub} Outstation Cab`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="48px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase font-bold text-slate-600 flex items-center gap-1 truncate">
                    <span>{destState}</span>
                    <span>➔</span>
                    <span className="text-brand-blue">{activeTab}</span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-brand-blue transition-colors truncate">
                    {destName} to {hub} Taxi
                  </h3>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-600 block uppercase font-bold leading-none">Starting Rate</span>
                  <span className="font-black text-brand-green text-sm leading-tight inline-block mt-0.5">
                    From ₹12/km
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 font-bold text-brand-blue text-xs group-hover:translate-x-0.5 transition-transform">
                  <span>View Fare</span>
                  <FaArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 4. Semantic Location Authority & High-Rank SEO Content Block */}
      <div className="rounded-2xl p-5 bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-200 text-xs sm:text-sm text-slate-600 space-y-2">
        <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
          <FaShieldAlt className="text-brand-green" />
          <span>Why Book Outstation Cabs from {destName} with Urgent Taxis?</span>
        </h3>
        <p className="leading-relaxed">
          Urgent Taxis delivers reliable, 24/7 doorstep outstation taxi service from <strong>{destName}</strong> to all cities, tehsils, and airports in <strong>{destState}</strong> and neighboring states. All rides feature verified commercial yellow-plate chauffeurs, transparent per-km billing (Hatchback ₹12/km, Sedan ₹14/km, Ertiga ₹16/km, Innova ₹20/km, Innova Crysta/Hycross ₹24/km), FASTag electronic toll clearance, and zero cancellation charges on advance bookings.
        </p>
      </div>
    </div>
  );
}
