'use client';

import React from 'react';
import { RoutePlaceItem } from '@/lib/data/route-corridor-details';
import { FaUtensils, FaGasPump, FaChargingStation, FaLandmark, FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa';

interface RoutePlacesSectionProps {
  originName: string;
  destName: string;
  places: {
    restaurants: RoutePlaceItem[];
    petrolPumps: RoutePlaceItem[];
    cngPumps: RoutePlaceItem[];
    attractions: RoutePlaceItem[];
  };
  className?: string;
}

export default function RoutePlacesSection({
  originName,
  destName,
  places,
  className = '',
}: RoutePlacesSectionProps) {
  const getGoogleMapsSearchUrl = (name: string, location: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${location}`)}`;
  };

  return (
    <div className={`space-y-6 font-sans ${className}`}>
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>⛽</span> Places on This Route
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Find popular restaurants, fuel stations and attractions on your way from {originName} to {destName}.
          </p>
        </div>
        <a
          href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originName)}&destination=${encodeURIComponent(destName)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-black text-brand-blue hover:text-brand-green flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <span>View All Places on Map</span>
          <FaExternalLinkAlt className="w-3 h-3" />
        </a>
      </div>

      {/* 4 Categorized Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Restaurants Column */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xs">
                <FaUtensils />
              </div>
              <h3 className="font-black text-sm text-slate-900">Restaurants</h3>
            </div>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              Food & Dhabas
            </span>
          </div>

          <div className="space-y-2.5 flex-1">
            {places.restaurants.map((place, idx) => (
              <a
                key={idx}
                href={getGoogleMapsSearchUrl(place.name, place.location)}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-amber-50/60 hover:border-amber-200 transition-all flex items-center justify-between block"
              >
                <div className="min-w-0 pr-2">
                  <h4 className="font-bold text-xs text-slate-800 group-hover:text-amber-900 truncate">
                    {place.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium truncate">{place.location}</p>
                </div>
                <div className="shrink-0 flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 text-[10px] font-black text-slate-700 shadow-2xs">
                  <FaMapMarkerAlt className="text-amber-500 w-2.5 h-2.5" />
                  <span>{place.distanceKm} km</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* 2. Petrol Pumps Column */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
                <FaGasPump />
              </div>
              <h3 className="font-black text-sm text-slate-900">Petrol Pumps</h3>
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              Fuel & Air
            </span>
          </div>

          <div className="space-y-2.5 flex-1">
            {places.petrolPumps.map((place, idx) => (
              <a
                key={idx}
                href={getGoogleMapsSearchUrl(place.name, place.location)}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-blue-50/60 hover:border-blue-200 transition-all flex items-center justify-between block"
              >
                <div className="min-w-0 pr-2">
                  <h4 className="font-bold text-xs text-slate-800 group-hover:text-blue-900 truncate">
                    {place.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium truncate">{place.location}</p>
                </div>
                <div className="shrink-0 flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 text-[10px] font-black text-slate-700 shadow-2xs">
                  <FaMapMarkerAlt className="text-blue-500 w-2.5 h-2.5" />
                  <span>{place.distanceKm} km</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* 3. CNG Pumps Column */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
                <FaChargingStation />
              </div>
              <h3 className="font-black text-sm text-slate-900">CNG Pumps</h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Green Corridor
            </span>
          </div>

          <div className="space-y-2.5 flex-1">
            {places.cngPumps.map((place, idx) => (
              <a
                key={idx}
                href={getGoogleMapsSearchUrl(place.name, place.location)}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-emerald-50/60 hover:border-emerald-200 transition-all flex items-center justify-between block"
              >
                <div className="min-w-0 pr-2">
                  <h4 className="font-bold text-xs text-slate-800 group-hover:text-emerald-900 truncate">
                    {place.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium truncate">{place.location}</p>
                </div>
                <div className="shrink-0 flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 text-[10px] font-black text-slate-700 shadow-2xs">
                  <FaMapMarkerAlt className="text-emerald-500 w-2.5 h-2.5" />
                  <span>{place.distanceKm} km</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* 4. Nearby Attractions Column */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs">
                <FaLandmark />
              </div>
              <h3 className="font-black text-sm text-slate-900">Nearby Attractions</h3>
            </div>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              Sightseeing
            </span>
          </div>

          <div className="space-y-2.5 flex-1">
            {places.attractions.map((place, idx) => (
              <a
                key={idx}
                href={getGoogleMapsSearchUrl(place.name, place.location)}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-purple-50/60 hover:border-purple-200 transition-all flex items-center justify-between block"
              >
                <div className="min-w-0 pr-2">
                  <h4 className="font-bold text-xs text-slate-800 group-hover:text-purple-900 truncate">
                    {place.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium truncate">{place.location}</p>
                </div>
                <div className="shrink-0 flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 text-[10px] font-black text-slate-700 shadow-2xs">
                  <FaMapMarkerAlt className="text-purple-500 w-2.5 h-2.5" />
                  <span>{place.distanceKm} km</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
