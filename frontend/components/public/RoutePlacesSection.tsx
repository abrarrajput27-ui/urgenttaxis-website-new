'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { RoutePlaceItem } from '@/lib/data/route-corridor-details';
import { FaUtensils, FaGasPump, FaChargingStation, FaLandmark, FaMapMarkerAlt, FaExternalLinkAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';

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
  const [expandedCols, setExpandedCols] = useState<{
    restaurants: boolean;
    petrol: boolean;
    cng: boolean;
    attractions: boolean;
  }>({
    restaurants: false,
    petrol: false,
    cng: false,
    attractions: false,
  });

  const toggleCol = (col: 'restaurants' | 'petrol' | 'cng' | 'attraction') => {
    setExpandedCols((prev) => ({
      ...prev,
      [col]: !prev[col],
    }));
  };

  // Helper to render fuel brand badge
  const renderBrandBadge = (name: string, isCNG: boolean) => {
    const lower = name.toLowerCase();

    if (lower.includes('indian oil') || lower.includes('iocl')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-[#002f6c] border border-orange-500/40 p-1 flex flex-col items-center justify-center shrink-0 shadow-2xs">
          <span className="text-[9px] font-black tracking-tighter text-white leading-none">IOCL</span>
          <span className="text-[7px] font-bold text-orange-400 leading-none">{isCNG ? 'CNG' : 'PETROL'}</span>
        </div>
      );
    }

    if (lower.includes('bharat petroleum') || lower.includes('bpcl')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-[#003399] border border-yellow-400/40 p-1 flex flex-col items-center justify-center shrink-0 shadow-2xs">
          <span className="text-[9px] font-black tracking-tighter text-white leading-none">BPCL</span>
          <span className="text-[7px] font-bold text-yellow-300 leading-none">MAK</span>
        </div>
      );
    }

    if (lower.includes('hp') || lower.includes('hindustan petroleum')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-[#c8102e] border border-blue-400/40 p-1 flex flex-col items-center justify-center shrink-0 shadow-2xs">
          <span className="text-[9px] font-black tracking-tighter text-white leading-none">HP</span>
          <span className="text-[7px] font-bold text-white/90 leading-none">POWER</span>
        </div>
      );
    }

    if (lower.includes('mahanagar') || lower.includes('mgl')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-[#008852] border border-white/40 p-1 flex flex-col items-center justify-center shrink-0 shadow-2xs">
          <span className="text-[9px] font-black tracking-tighter text-white leading-none">MGL</span>
          <span className="text-[7px] font-bold text-white/90 leading-none">CNG</span>
        </div>
      );
    }

    if (lower.includes('green gas')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-[#15803d] border border-emerald-400/40 p-1 flex flex-col items-center justify-center shrink-0 shadow-2xs">
          <span className="text-[9px] font-black tracking-tighter text-white leading-none">GGL</span>
          <span className="text-[7px] font-bold text-blue-200 leading-none">CNG</span>
        </div>
      );
    }

    if (lower.includes('torrent')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-[#0369a1] border border-sky-400/40 p-1 flex flex-col items-center justify-center shrink-0 shadow-2xs">
          <span className="text-[9px] font-black tracking-tighter text-white leading-none">TORRENT</span>
          <span className="text-[7px] font-bold text-sky-200 leading-none">GAS</span>
        </div>
      );
    }

    if (lower.includes('igl') || lower.includes('indraprastha')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-[#047857] border border-emerald-300/40 p-1 flex flex-col items-center justify-center shrink-0 shadow-2xs">
          <span className="text-[9px] font-black tracking-tighter text-white leading-none">IGL</span>
          <span className="text-[7px] font-bold text-emerald-100 leading-none">CNG</span>
        </div>
      );
    }

    // Default Fuel Badge
    return (
      <div className="w-10 h-10 rounded-xl bg-slate-800 text-white p-1 flex flex-col items-center justify-center shrink-0 shadow-2xs">
        <FaGasPump className="w-4 h-4 text-emerald-400 mb-0.5" />
        <span className="text-[7px] font-bold uppercase">{isCNG ? 'CNG' : 'FUEL'}</span>
      </div>
    );
  };

  const getMapLink = (name: string, location: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${location}`)}`;
  };

  const visibleRestaurants = expandedCols.restaurants ? places.restaurants : places.restaurants.slice(0, 3);
  const visiblePetrol = expandedCols.petrol ? places.petrolPumps : places.petrolPumps.slice(0, 3);
  const visibleCng = expandedCols.cng ? places.cngPumps : places.cngPumps.slice(0, 3);
  const visibleAttractions = expandedCols.attractions ? places.attractions : places.attractions.slice(0, 3);

  return (
    <div id="places-along-route" className={`space-y-6 font-sans ${className}`}>
      {/* Section Header matching Urgent Taxis Brand Theme */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>⛽</span> Places on This Route
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Find popular restaurants, fuel stations, CNG pumps, and top attractions on your {originName} to {destName} drive.
          </p>
        </div>

        <span className="text-xs bg-emerald-50 text-brand-green border border-emerald-200 font-bold px-3 py-1 rounded-full self-start sm:self-auto">
          Verified Highway Stops
        </span>
      </div>

      {/* 4 Categorized Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
        {/* Column 1: Restaurants & Dhabas */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center text-xs">
                  <FaUtensils className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-black text-sm text-slate-900">Restaurants & Dhabas</h3>
              </div>
              <span className="text-[10px] font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded-full">
                {places.restaurants.length} Stops
              </span>
            </div>

            <div className="space-y-2.5">
              {visibleRestaurants.map((item, idx) => (
                <a
                  key={idx}
                  href={getMapLink(item.name, item.location)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-blue-50/50 hover:border-brand-blue/30 transition-all flex items-center gap-3 block"
                >
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-slate-200">
                    <Image
                      src={item.image || '/destinations/chandigarh.webp'}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="44px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-slate-800 group-hover:text-brand-blue truncate">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">{item.location}</p>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-brand-blue mt-0.5">
                      <FaMapMarkerAlt className="w-2.5 h-2.5" />
                      <span>{item.distanceKm} km mark</span>
                    </div>
                  </div>
                  <FaExternalLinkAlt className="w-2.5 h-2.5 text-slate-400 group-hover:text-brand-blue shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>

          {places.restaurants.length > 3 && (
            <button
              type="button"
              onClick={() => toggleCol('restaurants')}
              className="w-full mt-2 py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-brand-blue text-xs font-bold border border-slate-200 hover:border-brand-blue/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{expandedCols.restaurants ? 'Show Less' : `+ Show ${places.restaurants.length - 3} More Restaurants`}</span>
              {expandedCols.restaurants ? <FaChevronUp className="w-2.5 h-2.5" /> : <FaChevronDown className="w-2.5 h-2.5" />}
            </button>
          )}
        </div>

        {/* Column 2: Petrol & Diesel Pumps */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-brand-green flex items-center justify-center text-xs">
                  <FaGasPump className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-black text-sm text-slate-900">Petrol & Diesel</h3>
              </div>
              <span className="text-[10px] font-bold text-brand-green bg-emerald-50 px-2 py-0.5 rounded-full">
                {places.petrolPumps.length} Stations
              </span>
            </div>

            <div className="space-y-2.5">
              {visiblePetrol.map((item, idx) => (
                <a
                  key={idx}
                  href={getMapLink(item.name, item.location)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-emerald-50/50 hover:border-brand-green/30 transition-all flex items-center gap-3 block"
                >
                  {renderBrandBadge(item.name, false)}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-slate-800 group-hover:text-brand-green truncate">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">{item.location}</p>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-brand-green mt-0.5">
                      <FaMapMarkerAlt className="w-2.5 h-2.5" />
                      <span>{item.distanceKm} km mark</span>
                    </div>
                  </div>
                  <FaExternalLinkAlt className="w-2.5 h-2.5 text-slate-400 group-hover:text-brand-green shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>

          {places.petrolPumps.length > 3 && (
            <button
              type="button"
              onClick={() => toggleCol('petrol')}
              className="w-full mt-2 py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-brand-green text-xs font-bold border border-slate-200 hover:border-brand-green/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{expandedCols.petrol ? 'Show Less' : `+ Show ${places.petrolPumps.length - 3} More Fuel Stations`}</span>
              {expandedCols.petrol ? <FaChevronUp className="w-2.5 h-2.5" /> : <FaChevronDown className="w-2.5 h-2.5" />}
            </button>
          )}
        </div>

        {/* Column 3: CNG Pumps */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-xs">
                  <FaChargingStation className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-black text-sm text-slate-900">CNG Stations</h3>
              </div>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                {places.cngPumps.length} Pumps
              </span>
            </div>

            <div className="space-y-2.5">
              {visibleCng.map((item, idx) => (
                <a
                  key={idx}
                  href={getMapLink(item.name, item.location)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-teal-50/50 hover:border-teal-300 transition-all flex items-center gap-3 block"
                >
                  {renderBrandBadge(item.name, true)}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-slate-800 group-hover:text-teal-800 truncate">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">{item.location}</p>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-teal-700 mt-0.5">
                      <FaMapMarkerAlt className="w-2.5 h-2.5" />
                      <span>{item.distanceKm} km mark</span>
                    </div>
                  </div>
                  <FaExternalLinkAlt className="w-2.5 h-2.5 text-slate-400 group-hover:text-teal-700 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>

          {places.cngPumps.length > 3 && (
            <button
              type="button"
              onClick={() => toggleCol('cng')}
              className="w-full mt-2 py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-teal-50 text-teal-800 text-xs font-bold border border-slate-200 hover:border-teal-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{expandedCols.cng ? 'Show Less' : `+ Show ${places.cngPumps.length - 3} More CNG Stations`}</span>
              {expandedCols.cng ? <FaChevronUp className="w-2.5 h-2.5" /> : <FaChevronDown className="w-2.5 h-2.5" />}
            </button>
          )}
        </div>

        {/* Column 4: Nearby Attractions */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center text-xs">
                  <FaLandmark className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-black text-sm text-slate-900">Nearby Attractions</h3>
              </div>
              <span className="text-[10px] font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded-full">
                {places.attractions.length} Places
              </span>
            </div>

            <div className="space-y-2.5">
              {visibleAttractions.map((item, idx) => (
                <a
                  key={idx}
                  href={getMapLink(item.name, item.location)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-blue-50/50 hover:border-blue-300 transition-all flex items-center gap-3 block"
                >
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-slate-200">
                    <Image
                      src={item.image || '/destinations/nainital.webp'}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="44px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-slate-800 group-hover:text-brand-blue truncate">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">{item.location}</p>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-brand-blue mt-0.5">
                      <FaMapMarkerAlt className="w-2.5 h-2.5" />
                      <span>{item.distanceKm} km mark</span>
                    </div>
                  </div>
                  <FaExternalLinkAlt className="w-2.5 h-2.5 text-slate-400 group-hover:text-brand-blue shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>

          {places.attractions.length > 3 && (
            <button
              type="button"
              onClick={() => toggleCol('attractions')}
              className="w-full mt-2 py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-brand-blue text-xs font-bold border border-slate-200 hover:border-blue-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{expandedCols.attractions ? 'Show Less' : `+ Show ${places.attractions.length - 3} More Attractions`}</span>
              {expandedCols.attractions ? <FaChevronUp className="w-2.5 h-2.5" /> : <FaChevronDown className="w-2.5 h-2.5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
