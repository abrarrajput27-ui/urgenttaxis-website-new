"use client";

import React, { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Car, Clock, Search, ChevronDown, ChevronUp, Compass, ChevronLeft, ChevronRight } from 'lucide-react';
import { resolveOneWayFare, buildWhatsAppBookingLink } from '@/lib/pricing';
import { getDestinationImage } from '@/lib/destination-images';
import allStatesData from '@/lib/data/all-states-destinations.json';

// -----------------------------------------------------------------------------
// STRICT STATE-BY-STATE DESTINATION DIRECTORY (ALL 35 STATES & UTs IN INDIA)
// Official Panchayati Raj LGD Database with 20,455+ verified districts, tehsils and villages
// -----------------------------------------------------------------------------
export const STATE_DESTINATIONS: Record<string, string[]> = allStatesData as Record<string, string[]>;

// Popular departure origins for quick switching
const ORIGIN_CHIPS = [
  "Delhi",
  "Ghaziabad",
  "Noida",
  "Greater Noida",
  "Gurugram",
  "Faridabad",
  "Delhi Airport",
  "Haridwar",
  "Rishikesh",
  "Dehradun",
  "Nainital",
  "Haldwani",
  "Agra",
  "Mathura",
  "Meerut",
  "Chandigarh",
  "Amritsar",
  "Shimla",
  "Jaipur",
  "Lucknow",
  "Ayodhya",
  "Varanasi",
  "Bhopal",
  "Indore",
  "Jammu",
  "Mumbai",
  "Pune",
  "Ahmedabad",
  "Patna",
  "Kolkata",
  "Bengaluru",
  "Chennai",
  "Hyderabad",
  "Panaji",
  "Goa"
];

interface RoutesTabWidgetProps {
  initialOrigin?: string;
  initialActiveState?: string;
}

export default function RoutesTabWidget({ initialOrigin, initialActiveState }: RoutesTabWidgetProps = {}) {
  const [activeState, setActiveState] = useState<string>(initialActiveState || "Delhi NCR");
  const [activeOrigin, setActiveOrigin] = useState<string>(initialOrigin || "Ghaziabad");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState<number>(24);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const scrollStateTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      tabsContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Synchronize state tab if navigated with ?state= in URL
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const stateParam = params.get('state');
      if (stateParam && STATE_DESTINATIONS[stateParam]) {
        setActiveState(stateParam);
      }
    }
  }, []);

  // Dynamic origin chips ensuring initialOrigin is prominent
  const availableChips = useMemo(() => {
    if (initialOrigin && !ORIGIN_CHIPS.some((chip) => chip.toLowerCase() === initialOrigin.toLowerCase())) {
      return [initialOrigin, ...ORIGIN_CHIPS];
    }
    return ORIGIN_CHIPS;
  }, [initialOrigin]);

  // Filter destination list strictly within the active state (Zero cross-state mixing!)
  const stateList = STATE_DESTINATIONS[activeState] || [];

  const filteredDestinations = useMemo(() => {
    let list = stateList.filter(
      (d) => d.toLowerCase() !== activeOrigin.toLowerCase()
    );

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((d) => d.toLowerCase().includes(q));
    }

    // STRICT A-TO-Z ALPHABETICAL SORTING (User Mandate)
    return list.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
  }, [stateList, activeOrigin, searchQuery]);

  // Compute live verified cards for the current view
  const currentRoutes = useMemo(() => {
    const subset = filteredDestinations.slice(0, visibleCount);

    return subset.map((dest, idx) => {
      const quote = resolveOneWayFare(activeOrigin, dest);
      const distance = quote?.distanceKm || 220;
      const price = quote?.sedanFare || Math.round(distance * 11);
      const duration = quote?.durationText || `${Math.round(distance / 50)} hrs`;
      const slug = quote?.slug || `${activeOrigin.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-to-${dest.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-taxi`;
      const image = getDestinationImage(dest, activeState);

      return {
        id: `${activeOrigin}-${dest}-${idx}`,
        origin: activeOrigin,
        destination: dest,
        distance,
        price,
        duration,
        slug,
        image,
      };
    });
  }, [filteredDestinations, visibleCount, activeOrigin]);

  const hasMore = filteredDestinations.length > visibleCount;

  return (
    <div id="popular-routes-tabs" className="w-full max-w-full min-w-0 font-sans">
      
      {/* 1. STATE SELECTOR TABS (Scrollable across all 35 States & UTs with smooth controls) */}
      <div className="relative w-full max-w-full mb-3 group">
        {/* Left Scroll Button */}
        <button
          type="button"
          onClick={() => scrollStateTabs('left')}
          className="hidden sm:flex absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-slate-300 shadow-md items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
          aria-label="Scroll States Left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={tabsContainerRef}
          className="flex overflow-x-auto hide-scrollbar gap-2 py-2 px-1 sm:px-8 scroll-smooth snap-x"
        >
          {Object.keys(STATE_DESTINATIONS).sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })).map((state) => {
            const isActive = activeState === state;
            const count = STATE_DESTINATIONS[state]?.length || 0;

            return (
              <button
                key={state}
                type="button"
                onClick={() => {
                  setActiveState(state);
                  setSearchQuery("");
                  setVisibleCount(24);
                }}
                className={`whitespace-nowrap px-4 py-2.5 min-h-[44px] rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all duration-200 border-2 cursor-pointer snap-start shrink-0 ${
                  isActive
                    ? 'bg-[#1e1b4b] border-[#1e1b4b] text-white shadow-md scale-[1.02]'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>{state}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Button */}
        <button
          type="button"
          onClick={() => scrollStateTabs('right')}
          className="hidden sm:flex absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-slate-300 shadow-md items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
          aria-label="Scroll States Right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 2. SUB-BAR: ORIGIN CHIPS & DESTINATION SEARCH */}
      <div className="bg-slate-50 rounded-3xl p-4 sm:p-6 border border-slate-200/80">
        
        {/* Origin Selector & Search Input Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-200/70">
          
          {/* Origin Chips */}
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-brand-green" /> From:
            </span>
            {availableChips.map((chip) => {
              const isSelected = activeOrigin === chip;
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setActiveOrigin(chip)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 border cursor-pointer ${
                    isSelected
                      ? 'bg-brand-green border-brand-green text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-brand-green hover:text-brand-green'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>

          {/* Quick Search inside this State */}
          <div className="relative min-w-[260px] md:w-80 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(8);
              }}
              placeholder={`Search in ${activeState}...`}
              className="w-full bg-white border border-slate-300 rounded-full pl-9 pr-4 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* State Notice & Total Results */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-1">
          <div>
            Showing destinations exclusively in <strong className="text-slate-900 font-bold">{activeState}</strong>
          </div>
          <div>
            Found <strong className="text-brand-blue font-bold">{filteredDestinations.length}</strong> locations
          </div>
        </div>

        {/* 3. POPULAR CORRIDORS CARDS GRID */}
        {currentRoutes.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
            <p className="text-sm font-semibold text-slate-600 mb-2">
              No destination matching &ldquo;{searchQuery}&rdquo; in {activeState}.
            </p>
            <p className="text-xs text-slate-400 mb-4">
              Urgent Taxis provides cab service to every village, town & city across {activeState}.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-xs font-bold text-brand-blue underline cursor-pointer"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {currentRoutes.map((route) => {
              const whatsappUrl = buildWhatsAppBookingLink({
                serviceType: 'One-way',
                vehicleName: 'Sedan',
                origin: route.origin,
                destination: route.destination,
                estimatedFare: route.price,
                pageUrl: `https://www.urgenttaxis.in/cabs?pickup=${encodeURIComponent(route.origin)}&drop=${encodeURIComponent(route.destination)}&serviceType=one_way`,
              });

              return (
                <div
                  key={route.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col h-full"
                >
                  {/* Destination WebP Image */}
                  <Link href={`/routes/${route.slug}`} prefetch={false} className="h-40 relative overflow-hidden bg-slate-100 block group/cardimg">
                    <Image
                      src={route.image}
                      alt={`${route.origin} to ${route.destination} cab`}
                      fill
                      loading="lazy"
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getDestinationImage('', activeState);
                      }}
                      sizes="(max-width: 640px) 360px, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent"></div>
                    <div className="absolute top-2.5 right-2.5">
                      <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                        {activeState}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                      <h3 className="text-white font-black tracking-tight leading-tight text-sm">
                        <span className="block text-[11px] font-medium text-slate-300">
                          {route.origin} to
                        </span>
                        {route.destination}, <span className="text-emerald-300 font-bold">{activeState}</span>
                      </h3>
                    </div>
                  </Link>

                  {/* Route Specs & Badges */}
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs text-slate-600 font-semibold bg-slate-50 p-2 rounded-xl">
                        <div className="flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1.5 text-emerald-600 shrink-0" />
                          <span>
                            Approx. <strong className="text-slate-900">{route.distance} KM</strong>
                          </span>
                        </div>
                        <div className="flex items-center text-[11px] text-slate-500">
                          <Clock className="w-3 h-3 mr-1 text-slate-400" />
                          <span>{route.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-slate-600 font-semibold bg-slate-50 p-2 rounded-xl">
                        <Car className="w-3.5 h-3.5 mr-1.5 text-brand-blue shrink-0" />
                        <span className="truncate">
                          {route.distance < 60 || activeState === 'Delhi NCR'
                            ? 'AC Hatchback & Sedan Available'
                            : 'Hatchback, Sedan, Ertiga & Innova'}
                        </span>
                      </div>
                    </div>

                    {/* Pricing & Booking CTA */}
                    <div className="pt-3 border-t border-slate-100 space-y-2 mt-auto">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-slate-500">Starts at</span>
                        <span className="text-lg font-black text-[#1e1b4b] tabular-nums">
                          ₹{route.price.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Link
                          href={`/cabs?pickup=${encodeURIComponent(route.origin)}&drop=${encodeURIComponent(route.destination)}&serviceType=one_way`}
                          prefetch={false}
                          className="bg-[#1e1b4b] hover:bg-slate-800 text-white text-xs text-center font-bold px-3 py-2 rounded-xl shadow-xs transition-all flex items-center justify-center cursor-pointer active:scale-95"
                        >
                          Select Cab
                        </Link>
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#059669] hover:bg-[#047857] text-white text-xs text-center font-bold px-3 py-2 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                        >
                          <span>💬</span> WhatsApp
                        </a>
                      </div>
                      <div className="text-center pt-1">
                        <Link
                          href={`/routes/${route.slug}`}
                          prefetch={false}
                          className="text-[11px] font-bold text-brand-blue hover:text-brand-green transition-colors inline-flex items-center gap-1 active:scale-95"
                        >
                          <span>
                            {route.distance < 60 || activeState === 'Delhi NCR'
                              ? 'View Route & Toll Details'
                              : 'Explore Route, Tolls & Stops'}
                          </span>
                          <span>→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. SHOW MORE DESTINATIONS BUTTON */}
        {hasMore && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 24)}
              className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-xs sm:text-sm px-7 py-3.5 rounded-full shadow-md transition-all cursor-pointer"
            >
              <span>Explore More {activeState} Routes &amp; Corridors ({filteredDestinations.length - visibleCount} more)</span>
              <ChevronDown className="w-4 h-4 text-white" />
            </button>
          </div>
        )}

        {visibleCount > 24 && !hasMore && filteredDestinations.length > 24 && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount(24)}
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-600 font-bold text-xs px-4 py-2 rounded-full border border-slate-200 transition-all cursor-pointer"
            >
              <span>Show Less</span>
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
}
