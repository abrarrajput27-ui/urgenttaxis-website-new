"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const STATES_DATA = {
  "Delhi": ["Delhi", "Delhi Airport"],
  "Haryana": ["Adampur", "Ambala", "Asandh", "Bhiwani", "Faridabad", "Gurugram", "Hisar", "Karnal", "Panipat", "Rohtak", "Sonipat"],
  "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Dalhousie", "Kullu", "Kasol"],
  "Jammu & Kashmir": ["Jammu", "Srinagar", "Katra"],
  "Madhya Pradesh": ["Gwalior", "Indore", "Bhopal", "Ujjain"],
  "Punjab": ["Chandigarh", "Amritsar", "Ludhiana", "Jalandhar", "Patiala"],
  "Rajasthan": ["Jaipur", "Udaipur", "Jodhpur", "Pushkar", "Ajmer", "Bikaner", "Jaisalmer"],
  "Uttar Pradesh": ["Noida", "Greater Noida", "Ghaziabad", "Agra", "Mathura", "Varanasi", "Lucknow", "Kanpur"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Rishikesh", "Nainital", "Haldwani", "Mussoorie", "Jim Corbett"]
};

// Mock routes based on active city to match video layout exactly
const generateMockRoutes = (originCity: string) => {
  const destinations = ["Haldwani", "Nainital", "Ramnagar", "Haridwar", "Rishikesh", "Dehradun", "Jim Corbett", "Mussoorie"];
  return destinations.map((dest, i) => ({
    id: i,
    origin: originCity,
    destination: dest,
    distance: Math.floor(Math.random() * 200) + 150,
    price: Math.floor(Math.random() * 3000) + 2500,
    image: `/destinations/${dest.toLowerCase().replace(/ /g, '-')}.jpg`
  }));
};

export default function RoutesTabWidget() {
  const [activeState, setActiveState] = useState("Delhi");
  const [activeCity, setActiveCity] = useState("Delhi");

  const handleStateClick = (state: string) => {
    setActiveState(state);
    setActiveCity(STATES_DATA[state as keyof typeof STATES_DATA][0]); // Default to first city of new state
  };

  const activeCities = STATES_DATA[activeState as keyof typeof STATES_DATA] || [];
  const currentRoutes = generateMockRoutes(activeCity);

  return (
    <div className="w-full font-sans">
      {/* State Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-4 hide-scrollbar mb-4 border-b border-slate-200">
        {Object.keys(STATES_DATA).map((state) => (
          <button
            key={state}
            onClick={() => handleStateClick(state)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-t-xl font-bold text-sm transition-colors border border-b-0 ${
              activeState === state 
                ? 'bg-brand-blue text-white border-brand-blue' 
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {state}
          </button>
        ))}
      </div>

      {/* Massive City Tags (Visible without typing) */}
      <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto p-2 border border-slate-100 rounded-xl bg-slate-50/50 mb-6 custom-scrollbar">
        {activeCities.map((city, index) => (
          <button
            key={`${city}-${index}`}
            onClick={() => setActiveCity(city)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
              activeCity === city
                ? 'bg-brand-green text-white shadow-sm ring-1 ring-brand-green'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-green hover:text-brand-green'
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentRoutes.map((route, i) => {
          const whatsappMessage = encodeURIComponent(`Hello Urgent Taxis! 👋\n\nI want to book an *Outstation Cab*. 🚕\n📍 *Route*: *${route.origin}* to *${route.destination}*\n\nPlease share the detailed fare and availability.`);
          const whatsappUrl = `https://wa.me/917310651940?text=${whatsappMessage}`;
          
          return (
          <div key={i} className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col group border border-slate-100 hover:border-brand-green/30 hover:shadow-xl transition-all duration-300">
            <div className="h-44 relative overflow-hidden bg-slate-100">
              <Image
                src={route.image}
                alt={`${route.origin} to ${route.destination}`}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <h3 className="text-white font-black tracking-tight leading-tight">
                  <span className="block text-xs font-bold text-slate-300 mb-0.5">{route.origin} -</span>
                  {route.destination}
                </h3>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-4 bg-slate-50 w-fit px-2.5 py-1 rounded-md">
                <span className="text-brand-green">📍</span> Approx. {route.distance} km
              </div>

              <div className="mb-4">
                <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Cab Availability</div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-600">
                  <span className="bg-brand-green/10 text-brand-green px-2 py-1 rounded-md border border-brand-green/20">Hatchback</span>
                  <span className="bg-brand-green/10 text-brand-green px-2 py-1 rounded-md border border-brand-green/20">Sedan</span>
                  <span className="bg-brand-green/10 text-brand-green px-2 py-1 rounded-md border border-brand-green/20">SUV</span>
                  <span className="bg-brand-green/10 text-brand-green px-2 py-1 rounded-md border border-brand-green/20">Innova</span>
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-3 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Starting From</div>
                  <div className="text-lg font-black text-brand-blue">₹{route.price}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Link
                    href={`/routes/${route.origin.toLowerCase().replace(/ /g, '-')}-to-${route.destination.toLowerCase().replace(/ /g, '-')}`}
                    className="bg-brand-blue hover:bg-blue-900 text-white text-xs text-center font-bold px-3 py-2.5 rounded-lg shadow-sm transition-colors"
                  >
                    View Fare
                  </Link>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-brand-green hover:bg-emerald-600 text-white text-xs text-center font-bold px-3 py-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>💬</span> WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        )})}
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
}
