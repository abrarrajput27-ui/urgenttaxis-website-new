'use client';

import React, { useState } from 'react';
import { RoutePlace } from '@/lib/data/route-places-data';
import { FaUtensils, FaGasPump, FaChargingStation, FaLandmark, FaStar, FaExternalLinkAlt } from 'react-icons/fa';

interface RoutePlacesSectionProps {
  places: RoutePlace[];
  originName: string;
  destName: string;
}

export default function RoutePlacesSection({ places, originName, destName }: RoutePlacesSectionProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'restaurant' | 'petrol' | 'cng' | 'attraction'>('all');

  const filteredPlaces = activeTab === 'all' 
    ? places 
    : places.filter((p) => p.category === activeTab);

  const getCategoryIcon = (cat: RoutePlace['category']) => {
    switch (cat) {
      case 'restaurant': return <FaUtensils className="text-amber-500" />;
      case 'petrol': return <FaGasPump className="text-blue-500" />;
      case 'cng': return <FaChargingStation className="text-emerald-500" />;
      case 'attraction': return <FaLandmark className="text-purple-500" />;
    }
  };

  const getCategoryLabel = (cat: RoutePlace['category']) => {
    switch (cat) {
      case 'restaurant': return 'Food & Dhaba';
      case 'petrol': return 'Petrol Pump';
      case 'cng': return 'CNG Station';
      case 'attraction': return 'Sightseeing';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6 font-sans">
      <div className="border-b border-slate-100 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl font-black text-brand-blue flex items-center gap-2">
              <span>⛽</span> Places Along the Route ({originName} to {destName})
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Verified food courts, dhabas, 24/7 petrol & CNG stations, and attractions on your corridor.
            </p>
          </div>
          <span className="text-xs bg-emerald-50 text-brand-green font-bold px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
            Highway Verified
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-brand-blue text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Stops ({places.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('restaurant')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'restaurant'
                ? 'bg-brand-blue text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FaUtensils className="text-amber-500" /> Restaurants & Dhabas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cng')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'cng'
                ? 'bg-brand-blue text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FaChargingStation className="text-emerald-500" /> CNG Pumps
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('petrol')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'petrol'
                ? 'bg-brand-blue text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FaGasPump className="text-blue-500" /> Petrol & Diesel
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('attraction')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'attraction'
                ? 'bg-brand-blue text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FaLandmark className="text-purple-500" /> Attractions
          </button>
        </div>
      </div>

      {/* Places Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPlaces.map((place, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-brand-blue hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-xs">
                    {getCategoryIcon(place.category)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 leading-snug">{place.name}</h3>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      {getCategoryLabel(place.category)}
                    </span>
                  </div>
                </div>

                {place.rating && (
                  <span className="flex items-center gap-1 bg-amber-50 text-amber-800 text-xs font-black px-2 py-0.5 rounded-md border border-amber-200">
                    <FaStar className="w-2.5 h-2.5 text-amber-500" /> {place.rating}
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-600 font-medium">
                📍 {place.location}
              </div>

              {place.highlight && (
                <p className="text-xs text-slate-600 leading-relaxed font-normal bg-white p-2.5 rounded-lg border border-slate-200/60">
                  {place.highlight}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-slate-500 mt-3">
              <span className="bg-slate-200/60 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                ~ {place.distanceFromStartKm} km from {originName}
              </span>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.gmapsQuery || `${place.name} ${place.location}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-blue hover:text-brand-green font-bold flex items-center gap-1 transition-colors text-[11px]"
              >
                Directions <FaExternalLinkAlt className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
