'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  RoutePlaceItem,
  HotelCategoryGroup,
  FamousFoodItem,
  HiddenGemItem,
} from '@/lib/data/route-corridor-details';
import { getDestinationImage } from '@/lib/destination-images';
import {
  FaUtensils,
  FaGasPump,
  FaChargingStation,
  FaLandmark,
  FaMapMarkerAlt,
  FaExternalLinkAlt,
  FaChevronDown,
  FaChevronUp,
  FaHotel,
  FaBed,
  FaGem,
  FaStar,
} from 'react-icons/fa';

interface RoutePlacesSectionProps {
  originName: string;
  destName: string;
  places: {
    restaurants: RoutePlaceItem[];
    petrolPumps: RoutePlaceItem[];
    cngPumps: RoutePlaceItem[];
    attractions: RoutePlaceItem[];
    hotels?: RoutePlaceItem[];
  };
  hotelGroups?: HotelCategoryGroup;
  famousFoods?: FamousFoodItem[];
  hiddenGems?: HiddenGemItem[];
  className?: string;
}

export default function RoutePlacesSection({
  originName,
  destName,
  places,
  hotelGroups,
  famousFoods = [],
  hiddenGems = [],
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

  const [activeHotelTab, setActiveHotelTab] = useState<'budget' | 'medium' | 'luxury'>('medium');

  const toggleCol = (col: 'restaurants' | 'petrol' | 'cng' | 'attractions') => {
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

  // Active hotels list
  const currentHotels = hotelGroups
    ? hotelGroups[activeHotelTab]
    : places.hotels || [];

  return (
    <div id="places-along-route" className={`space-y-10 font-sans ${className}`}>
      
      {/* ── 1. HIGHWAY STOPS GRID (Dhabas, Petrol, Navgati CNG & Sightseeing) ── */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>⛽</span> Highway Stops &amp; Fuel on This Route
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Verified family dhabas, 24x7 fuel stations, Navgati-verified CNG pumps &amp; attractions on your {originName} to {destName} drive.
            </p>
          </div>

          <span className="text-xs bg-emerald-50 text-brand-green border border-emerald-200 font-bold px-3 py-1 rounded-full self-start sm:self-auto">
            Navgati &amp; Highway Verified
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
                  <h3 className="font-black text-sm text-slate-900">Dhabas &amp; Food Courts</h3>
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
                        src={item.image || '/destinations/food-plaza.webp'}
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
                <span>{expandedCols.restaurants ? 'Show Less' : `+ Show ${places.restaurants.length - 3} More Stops`}</span>
                {expandedCols.restaurants ? <FaChevronUp className="w-2.5 h-2.5" /> : <FaChevronDown className="w-2.5 h-2.5" />}
              </button>
            )}
          </div>

          {/* Column 2: Petrol & Diesel Stations */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-brand-green flex items-center justify-center text-xs">
                    <FaGasPump className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-black text-sm text-slate-900">Petrol &amp; Diesel</h3>
                </div>
                <span className="text-[10px] font-bold text-brand-green bg-emerald-50 px-2 py-0.5 rounded-full">
                  {places.petrolPumps.length} Hubs
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
                <span>{expandedCols.petrol ? 'Show Less' : `+ Show ${places.petrolPumps.length - 3} More Pumps`}</span>
                {expandedCols.petrol ? <FaChevronUp className="w-2.5 h-2.5" /> : <FaChevronDown className="w-2.5 h-2.5" />}
              </button>
            )}
          </div>

          {/* Column 3: Navgati-Verified CNG Pumps */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-xs">
                    <FaChargingStation className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-black text-sm text-slate-900">Navgati CNG Stations</h3>
                </div>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                  {places.cngPumps.length} Active
                </span>
              </div>

              <div className="space-y-2.5">
                {visibleCng.map((item, idx) => (
                  <a
                    key={idx}
                    href={getMapLink(item.name, item.location)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-teal-50/50 hover:border-teal-500/30 transition-all flex items-center gap-3 block"
                  >
                    {renderBrandBadge(item.name, true)}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs text-slate-800 group-hover:text-teal-700 truncate">
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
                className="w-full mt-2 py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-teal-50 text-teal-700 text-xs font-bold border border-slate-200 hover:border-teal-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{expandedCols.cng ? 'Show Less' : `+ Show ${places.cngPumps.length - 3} More CNG`}</span>
                {expandedCols.cng ? <FaChevronUp className="w-2.5 h-2.5" /> : <FaChevronDown className="w-2.5 h-2.5" />}
              </button>
            )}
          </div>

          {/* Column 4: Top Sightseeing & Sacred Attractions */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center text-xs">
                    <FaLandmark className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-black text-sm text-slate-900">Top Attractions</h3>
                </div>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                  {places.attractions.length} Points
                </span>
              </div>

              <div className="space-y-2.5">
                {visibleAttractions.map((item, idx) => (
                  <a
                    key={idx}
                    href={getMapLink(item.name, item.location)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-purple-50/50 hover:border-purple-500/30 transition-all flex items-center gap-3 block"
                  >
                    <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-slate-200">
                      <Image
                        src={item.image || getDestinationImage(destName)}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        sizes="44px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs text-slate-800 group-hover:text-purple-700 truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">{item.location}</p>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-purple-700 mt-0.5">
                        <FaMapMarkerAlt className="w-2.5 h-2.5" />
                        <span>{item.distanceKm} km</span>
                      </div>
                    </div>
                    <FaExternalLinkAlt className="w-2.5 h-2.5 text-slate-400 group-hover:text-purple-700 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>

            {places.attractions.length > 3 && (
              <button
                type="button"
                onClick={() => toggleCol('attractions')}
                className="w-full mt-2 py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-purple-50 text-purple-700 text-xs font-bold border border-slate-200 hover:border-purple-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{expandedCols.attractions ? 'Show Less' : `+ Show ${places.attractions.length - 3} More Places`}</span>
                {expandedCols.attractions ? <FaChevronUp className="w-2.5 h-2.5" /> : <FaChevronDown className="w-2.5 h-2.5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. WHERE TO STAY IN DESTINATION (Budget, Medium & Luxury Categories) ── */}
      {currentHotels && currentHotels.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-brand-blue text-xs font-bold mb-1">
                <FaHotel className="w-3.5 h-3.5 text-brand-blue" />
                <span>Verified Stay Points &amp; Resorts</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Where to Stay in {destName}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Curated hotel recommendations categorized by budget, medium comfort, and luxury resorts with verified addresses.
              </p>
            </div>

            {/* Category Switcher Tabs */}
            {hotelGroups && (
              <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveHotelTab('budget')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                    activeHotelTab === 'budget'
                      ? 'bg-white text-emerald-800 shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🟢 Cheaper / Budget
                </button>
                <button
                  type="button"
                  onClick={() => setActiveHotelTab('medium')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                    activeHotelTab === 'medium'
                      ? 'bg-white text-brand-blue shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🔵 Medium Comfort
                </button>
                <button
                  type="button"
                  onClick={() => setActiveHotelTab('luxury')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                    activeHotelTab === 'luxury'
                      ? 'bg-white text-purple-900 shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🟣 Luxury &amp; Resorts
                </button>
              </div>
            )}
          </div>

          {/* Hotel Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {currentHotels.map((hotel, idx) => (
              <div
                key={idx}
                className="bg-slate-50 rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
              >
                <div className="relative h-44 w-full bg-slate-200">
                  <Image
                    src={hotel.image || '/destinations/hotel-resort.webp'}
                    alt={hotel.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  {hotel.priceRange && (
                    <span className="absolute bottom-2.5 left-2.5 bg-slate-900/90 text-white font-black text-[11px] px-2.5 py-1 rounded-lg backdrop-blur-xs border border-white/20">
                      {hotel.priceRange}
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-black text-sm sm:text-base text-slate-900 group-hover:text-brand-blue transition-colors">
                      {hotel.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                      <FaMapMarkerAlt className="w-3 h-3 text-brand-blue shrink-0" />
                      <span className="truncate">{hotel.location}</span>
                    </p>
                    {hotel.highlight && (
                      <p className="text-xs text-slate-700 font-semibold bg-white p-2.5 rounded-xl border border-slate-200/80 mt-2.5">
                        ✨ {hotel.highlight}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <FaBed className="w-3 h-3" /> Safe Family Stay
                    </span>
                    <a
                      href={getMapLink(hotel.name, hotel.location)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-black text-brand-blue hover:text-brand-green inline-flex items-center gap-1"
                    >
                      <span>View Map</span>
                      <FaExternalLinkAlt className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. FAMOUS FOOD & CULINARY HERITAGE IN DESTINATION ── */}
      {famousFoods && famousFoods.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30 rounded-3xl p-6 sm:p-8 border border-amber-200/70 shadow-xs space-y-6">
          <div className="border-b border-amber-100 pb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 text-amber-900 text-xs font-bold mb-1">
              <FaUtensils className="w-3.5 h-3.5 text-amber-700" />
              <span>Iconic Culinary Heritage</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Famous Foods &amp; Legendary Spots in {destName}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              Traditional recipes, century-old sweet shops, and iconic street delicacies that every traveler must experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {famousFoods.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-amber-200/60 shadow-2xs hover:shadow-md transition-all space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-black text-sm text-slate-900 truncate">{item.name}</h4>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                    Must Try
                  </span>
                </div>
                <div className="text-xs font-black text-amber-800 bg-amber-50/80 p-2 rounded-xl border border-amber-200/50">
                  🍽️ {item.dish}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {item.description}
                </p>
                <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1 pt-1">
                  <FaMapMarkerAlt className="w-2.5 h-2.5 text-slate-400" />
                  <span>{item.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. HIDDEN GEMS & LESSER-KNOWN SIGHTS IN DESTINATION ── */}
      {hiddenGems && hiddenGems.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/30 rounded-3xl p-6 sm:p-8 border border-indigo-200/70 shadow-xs space-y-6">
          <div className="border-b border-indigo-100 pb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100/70 text-indigo-950 text-xs font-bold mb-1">
              <FaGem className="w-3.5 h-3.5 text-indigo-700" />
              <span>Offbeat Explorer Guide</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Hidden Gems in {destName} That Most Tourists Miss
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              Peaceful temples, serene forest viewpoints, and untouched river ghats away from mainstream tourist crowds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hiddenGems.map((gem, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-indigo-100 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-2.5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-black text-sm text-slate-900">{gem.name}</h4>
                    <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-full shrink-0">
                      {gem.distanceKm} km from Center
                    </span>
                  </div>
                  <div className="text-xs font-bold text-indigo-700 mb-1.5">
                    ✨ {gem.highlight}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {gem.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">{gem.location}</span>
                  <a
                    href={getMapLink(gem.name, gem.location)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-brand-blue hover:text-brand-green inline-flex items-center gap-1"
                  >
                    <span>Directions</span>
                    <FaExternalLinkAlt className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
