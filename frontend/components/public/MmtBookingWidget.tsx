'use client';

/**
 * MmtBookingWidget — MakeMyTrip (MMT) Style Multi-Step Fare Calculator & Search Engine.
 *
 * MMT Design Pattern:
 *   - Service Tabs: Outstation (One-Way / Round-Trip + Intermediate Stops) | Airport Cabs | Hourly Rentals
 *   - Segmented Card: FROM (city) ⇄ TO (city) | DEPARTURE (readable date + day) | PICKUP TIME
 *   - Intermediate Stops: Add / Remove intermediate via destinations with live corridor sequence
 *   - Big Floating "Search Cabs" CTA in Urgent Taxis Emerald Green (#059669)
 *   - Live Fare Teaser below search inputs
 *
 * Multi-Step UX Flow:
 *   Step 1: Search on Hero or Route Page (this widget)
 *   Step 2: /cabs page (Vehicle Selection: Hatchback, Sedan, SUV, Innova Crysta)
 *   Step 3: /checkout page (Trip & Contact Details)
 *   Step 4: /booking-confirmation/[ref] page (Confirmed)
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaMapMarkerAlt,
  FaExchangeAlt,
  FaCalendarAlt,
  FaClock,
  FaSearch,
  FaCheckCircle,
  FaTimes,
  FaPlus,
} from 'react-icons/fa';
import { trackFareSearchCompleted } from '@/lib/analytics';
import {
  resolveOneWayFare,
  resolveMultiStopRoute,
  HOURLY_RENTAL_PACKAGES,
  HourlyRentalPackageId,
  calculateLocalRentalFare,
} from '@/lib/pricing';
import { resolveAccurateRoute } from '@/lib/distance-resolver';
import { formatLocationWithState, POPULAR_AUTOCOMPLETE_CITIES } from '@/lib/location-authority';

export type MmtTripType = 'one_way' | 'round_trip' | 'airport_transfer' | 'local_rental';

export interface MmtBookingWidgetProps {
  defaultOrigin?: string;
  defaultDestination?: string;
  defaultDistanceKm?: number;
  defaultStops?: string[];
  /** When true, pre-fills origin & destination from route data */
  routeMode?: boolean;
  className?: string;
}

const AIRPORT_LIST = [
  { name: 'Delhi Airport (IGI T3)', code: 'DEL', subtitle: 'Indira Gandhi International Airport, New Delhi' },
  { name: 'Noida International Airport', code: 'DXN', subtitle: 'Jewar Airport, Noida / Greater Noida' },
];

const AIRPORT_ZONES = [
  'Ghaziabad',
  'Masuri',
  'Noida',
  'Greater Noida',
  'Delhi',
  'Gurugram',
  'Faridabad',
  'Meerut',
];

// Helper: Format date into MMT-style: { day: '8', monthYear: "Nov '26", weekday: 'Sunday' }
function formatMmtDate(dateStr: string) {
  if (!dateStr) return { day: '--', monthYear: 'Select Date', weekday: 'Choose date' };
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    if (isNaN(dateObj.getTime())) return { day: '--', monthYear: 'Select Date', weekday: 'Choose date' };
    const day = String(d);
    const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
    const year = String(y).slice(-2);
    const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    return { day, monthYear: `${month} '${year}`, weekday };
  } catch {
    return { day: '--', monthYear: 'Select Date', weekday: 'Choose date' };
  }
}

// Helper: Format 24-hr time into MMT-style: "10:00 AM"
function formatMmtTime(timeStr: string) {
  if (!timeStr) return '10:00 AM';
  try {
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    const minStr = String(m).padStart(2, '0');
    return `${hour12}:${minStr} ${ampm}`;
  } catch {
    return timeStr;
  }
}

export default function MmtBookingWidget({
  defaultOrigin = '',
  defaultDestination = '',
  defaultDistanceKm = 0,
  defaultStops = [],
  routeMode = false,
  className = '',
}: MmtBookingWidgetProps) {
  const router = useRouter();

  // ── Trip Type State ──
  const [tripType, setTripType] = useState<MmtTripType>('one_way');

  // ── Locations State ──
  const [origin, setOrigin] = useState(defaultOrigin || '');
  const [destination, setDestination] = useState(defaultDestination || '');
  const [stops, setStops] = useState<string[]>(defaultStops || []);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [swapAnim, setSwapAnim] = useState(false);

  // ── Dates & Times State ──
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Compute minimum booking time (current time + 45 mins buffer to prevent past/expired bookings)
  const getMinTimeForToday = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 45);
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const defaultReturnStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  }, []);

  const [pickupDate, setPickupDate] = useState(todayStr);
  const [returnDate, setReturnDate] = useState(defaultReturnStr);
  const [pickupTime, setPickupTime] = useState(() => {
    const minT = getMinTimeForToday();
    return '09:00' > minT ? '09:00' : minT;
  });

  const minTimeForToday = useMemo(() => getMinTimeForToday(), [pickupDate]);

  const handleDateChange = (newDate: string) => {
    if (newDate < todayStr) newDate = todayStr;
    setPickupDate(newDate);
    if (newDate > returnDate) {
      setReturnDate(newDate);
    }
    if (newDate === todayStr) {
      const minT = getMinTimeForToday();
      if (pickupTime < minT) {
        setPickupTime(minT);
      }
    }
    setErrorMsg('');
  };

  const handleTimeChange = (newTime: string) => {
    if (pickupDate === todayStr) {
      const minT = getMinTimeForToday();
      if (newTime < minT) {
        setErrorMsg(`Selected pickup time has already passed. Earliest pickup is ${formatMmtTime(minT)}.`);
        setPickupTime(minT);
        return;
      }
    }
    setErrorMsg('');
    setPickupTime(newTime);
  };

  // Hidden date input refs to trigger native calendar with custom MMT UI
  const pickupDateInputRef = useRef<HTMLInputElement>(null);
  const returnDateInputRef = useRef<HTMLInputElement>(null);
  const pickupTimeInputRef = useRef<HTMLInputElement>(null);

  // ── Hourly Rental State ──
  const [rentalPackageId, setRentalPackageId] = useState<HourlyRentalPackageId>('8h80km');
  const [rentalCity, setRentalCity] = useState('Ghaziabad');

  // ── Airport Transfer State ──
  const [airportDirection, setAirportDirection] = useState<'drop' | 'pickup'>('drop');
  const [selectedAirport, setSelectedAirport] = useState(AIRPORT_LIST[0].name);
  const [selectedAirportZone, setSelectedAirportZone] = useState('Ghaziabad');

  // ── Validation Error ──
  const [errorMsg, setErrorMsg] = useState('');

  // Close dropdown on outside click
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync default origin/destination when props change
  useEffect(() => {
    if (defaultOrigin) setOrigin(defaultOrigin);
    if (defaultDestination) setDestination(defaultDestination);
    if (defaultStops && defaultStops.length > 0) setStops(defaultStops);
  }, [defaultOrigin, defaultDestination, defaultStops]);

  // ── Swap Origin & Destination ──
  const handleSwap = useCallback(() => {
    setSwapAnim(true);
    setTimeout(() => setSwapAnim(false), 300);
    setOrigin((prevOrigin) => {
      const newOrigin = destination;
      setDestination(prevOrigin);
      return newOrigin;
    });
  }, [destination]);

  // ── Intermediate Stops Handlers ──
  const handleAddStop = () => {
    if (stops.length < 4) {
      setStops((prev) => [...prev, '']);
      setErrorMsg('');
    }
  };

  const handleRemoveStop = (index: number) => {
    setStops((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStopChange = (index: number, val: string) => {
    setStops((prev) => {
      const updated = [...prev];
      updated[index] = val;
      return updated;
    });
  };

  // ── Live Fare Preview ──
  const liveQuote = useMemo(() => {
    if ((tripType === 'one_way' || tripType === 'round_trip') && origin && destination && origin.toLowerCase() !== destination.toLowerCase()) {
      try {
        const validStops = stops.map((s) => s.trim()).filter(Boolean);
        if (validStops.length > 0) {
          const multi = resolveMultiStopRoute(origin, validStops, destination);
          if (multi && multi.sedanFare) {
            return {
              sedanFare: multi.sedanFare,
              ertigaFare: multi.ertigaFare || Math.round(multi.sedanFare * 1.35),
              crystaFare: multi.crystaFare || Math.round(multi.sedanFare * 1.95),
              distanceKm: multi.totalDistanceKm,
            };
          }
        }
        const quote = resolveOneWayFare(origin, destination, defaultDistanceKm);
        if (quote && !quote.requiresWhatsAppQuote && quote.sedanFare) {
          return {
            sedanFare: quote.sedanFare,
            ertigaFare: quote.ertigaFare || Math.round(quote.sedanFare * 1.35),
            crystaFare: quote.crystaFare || Math.round(quote.sedanFare * 1.95),
            distanceKm: quote.distanceKm || defaultDistanceKm,
          };
        }
      } catch {
        return null;
      }
    }
    return null;
  }, [origin, destination, stops, tripType, defaultDistanceKm]);

  // ── Search Submission (Step 1 ➔ Step 2: /cabs) ──
  const handleSearchCabs = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (tripType === 'local_rental') {
      if (!origin.trim() && !rentalCity.trim()) {
        setErrorMsg('Please enter city for hourly rental.');
        return;
      }
    } else if (tripType === 'airport_transfer') {
      if (!selectedAirport) {
        setErrorMsg('Please select an airport.');
        return;
      }
    } else {
      if (!origin.trim()) {
        setErrorMsg('Please enter pickup city.');
        return;
      }
      if (!destination.trim()) {
        setErrorMsg('Please enter drop destination.');
        return;
      }
      if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
        setErrorMsg('Pickup and drop destinations cannot be the same city.');
        return;
      }
      if (stops.some((s) => !s.trim())) {
        setErrorMsg('Please fill all added stop fields or remove empty stops.');
        return;
      }
    }

    if (pickupDate < todayStr) {
      setErrorMsg('Departure date cannot be in the past.');
      return;
    }

    if (pickupDate === todayStr) {
      const minT = getMinTimeForToday();
      if (pickupTime < minT) {
        setErrorMsg(`Selected pickup time has already passed. Earliest dispatch is ${formatMmtTime(minT)}.`);
        return;
      }
    }

    if (tripType === 'round_trip' && returnDate < pickupDate) {
      setErrorMsg('Return date cannot be earlier than departure date.');
      return;
    }

    // Build URL query params for /cabs page
    const params = new URLSearchParams();
    params.set('serviceType', tripType);
    params.set('date', pickupDate);
    params.set('time', pickupTime);

    if (tripType === 'local_rental') {
      const city = (rentalCity || origin).trim() || 'Ghaziabad';
      params.set('pickup', city);
      params.set('city', city);
      params.set('packageId', rentalPackageId);
      params.delete('drop');
      params.delete('destination');
    } else if (tripType === 'airport_transfer') {
      const effectiveDrop = airportDirection === 'drop' ? selectedAirport : selectedAirportZone;
      const effectivePickup = airportDirection === 'drop' ? selectedAirportZone : selectedAirport;
      params.set('pickup', effectivePickup);
      params.set('drop', effectiveDrop);
      params.set('airport', selectedAirport);
      params.set('direction', airportDirection);
      params.set('zone', selectedAirportZone);
    } else {
      params.set('pickup', origin.trim());
      params.set('drop', destination.trim());
      if (tripType === 'round_trip') {
        params.set('returnDate', returnDate);
      }

      const validStops = stops.map((s) => s.trim()).filter(Boolean);
      if (validStops.length > 0) {
        params.set('stops', validStops.join('|'));
        const multi = resolveMultiStopRoute(origin.trim(), validStops, destination.trim());
        const totalKm = multi?.totalDistanceKm || defaultDistanceKm || 200;
        params.set('distanceKm', String(totalKm));
        params.set('km', String(totalKm));
      } else {
        const accurate = resolveAccurateRoute(origin.trim(), destination.trim(), defaultDistanceKm);
        params.set('distanceKm', String(accurate.distanceKm));
        params.set('km', String(accurate.distanceKm));
        if (accurate.durationText) {
          params.set('durationText', accurate.durationText);
        }
      }
    }

    // Dispatch GA4 conversion event
    const estFare = liveQuote?.sedanFare || Math.round((Number(params.get('distanceKm')) || 50) * 12);
    trackFareSearchCompleted(
      tripType,
      origin.trim() || rentalCity || selectedAirport || 'Delhi NCR',
      destination.trim() || selectedAirport || 'Local',
      estFare
    );

    // Navigate to /cabs (Step 2: Vehicle selection)
    router.push(`/cabs?${params.toString()}`);
  };

  // Filter cities for autocomplete
  const filteredOriginCities = useMemo(() => {
    const q = origin.trim().toLowerCase();
    if (!q) return POPULAR_AUTOCOMPLETE_CITIES;
    return POPULAR_AUTOCOMPLETE_CITIES.filter((c) => c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q));
  }, [origin]);

  const filteredDestCities = useMemo(() => {
    const q = destination.trim().toLowerCase();
    if (!q) return POPULAR_AUTOCOMPLETE_CITIES;
    return POPULAR_AUTOCOMPLETE_CITIES.filter((c) => c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q));
  }, [destination]);

  const pickupDateFormatted = formatMmtDate(pickupDate);
  const returnDateFormatted = formatMmtDate(returnDate);

  // Primary Categories for Mobile & Desktop
  const isOutstation = tripType === 'one_way' || tripType === 'round_trip';

  const primaryCategories = [
    {
      id: 'outstation',
      label: 'Outstation',
      desktopLabel: 'OUTSTATION CABS',
      icon: '🚗',
      active: isOutstation,
      select: () => {
        if (!isOutstation) setTripType('one_way');
        setErrorMsg('');
      },
    },
    {
      id: 'airport',
      label: 'Airport',
      desktopLabel: 'AIRPORT CABS',
      icon: '✈️',
      active: tripType === 'airport_transfer',
      select: () => {
        setTripType('airport_transfer');
        setErrorMsg('');
      },
    },
    {
      id: 'rentals',
      label: 'Rentals',
      desktopLabel: 'HOURLY RENTALS',
      icon: '⏱️',
      active: tripType === 'local_rental',
      select: () => {
        setTripType('local_rental');
        setErrorMsg('');
      },
    },
  ];

  return (
    <div ref={containerRef} className={`w-full max-w-7xl mx-auto font-sans relative ${className}`}>
      
      {/* ── MMT TABS HEADER (Clean Segmented Design for Both Mobile & Desktop) ── */}
      <div className="grid grid-cols-3 sm:flex sm:items-center gap-1 sm:gap-2 px-1 sm:px-4 select-none relative z-20">
        {primaryCategories.map((cat) => {
          return (
            <button
              key={cat.id}
              type="button"
              onClick={cat.select}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-6 py-3 sm:py-3.5 rounded-t-2xl font-black text-xs sm:text-sm tracking-wider transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                cat.active
                  ? 'bg-white text-brand-blue border-t-3 border-x border-slate-200 border-t-emerald-600 shadow-md font-black translate-y-px z-30'
                  : routeMode
                  ? 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs font-bold border border-white/10'
                  : 'bg-slate-100 hover:bg-slate-200/90 text-slate-700 font-bold border border-slate-200'
              }`}
            >
              <span className="text-sm sm:text-base">{cat.icon}</span>
              <span className="hidden sm:inline">{cat.desktopLabel}</span>
              <span className="inline sm:hidden">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── MMT UNIFIED SEARCH CONTAINER ── */}
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-4 sm:p-6 lg:p-7 relative z-10 transition-all">
        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm rounded-xl font-bold flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSearchCabs} className="space-y-4">
          
          {/* ── OUTSTATION SUB-TABS & ADD STOP BUTTON ── */}
          {isOutstation && (
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => { setTripType('one_way'); setErrorMsg(''); }}
                  className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    tripType === 'one_way'
                      ? 'bg-brand-blue text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <span>➔</span>
                  <span>One-Way</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setTripType('round_trip'); setErrorMsg(''); }}
                  className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    tripType === 'round_trip'
                      ? 'bg-brand-blue text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <span>⇄</span>
                  <span>Round-Trip</span>
                </button>
              </div>

              {/* Add Stop / Via Destination Button */}
              {stops.length < 4 ? (
                <button
                  type="button"
                  onClick={handleAddStop}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3.5 py-1.5 sm:py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
                >
                  <FaPlus className="w-3 h-3 text-emerald-600" />
                  <span>Add Stop / Via Destination</span>
                </button>
              ) : (
                <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl">
                  Max 4 stops reached
                </span>
              )}
            </div>
          )}

          {/* ── SEGMENTED INPUT ROW (MMT Style) ── */}
          {tripType === 'one_way' || tripType === 'round_trip' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-12 rounded-2xl border border-slate-200 bg-slate-50/70 hover:border-slate-300 divide-y md:divide-y-0 md:divide-x divide-slate-200 shadow-xs relative">
                
                {/* 1. FROM CARD */}
                <div
                  className="md:col-span-3 p-3.5 sm:p-4 hover:bg-white transition-colors relative group rounded-t-2xl md:rounded-t-none md:rounded-l-2xl cursor-pointer"
                  onClick={() => setActiveDropdown('origin')}
                >
                  <div className="flex items-center justify-between">
                    <label htmlFor="booking-pickup" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block cursor-pointer">
                      FROM
                    </label>
                    <span className="text-[11px] text-brand-green font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      Type or pick
                    </span>
                  </div>
                  <div className="mt-1">
                    <input
                      id="booking-pickup"
                      type="text"
                      value={origin}
                      onChange={(e) => {
                        setOrigin(e.target.value);
                        setActiveDropdown('origin');
                      }}
                      onFocus={() => setActiveDropdown('origin')}
                      placeholder="Enter pickup city"
                      className="text-xl sm:text-2xl font-black text-slate-900 block truncate bg-transparent border-0 focus:outline-none w-full p-0"
                    />
                    <input id="pickup-input" type="hidden" value={origin} readOnly />
                    <span className="text-xs text-slate-500 font-medium truncate block mt-0.5">
                      {origin ? formatLocationWithState(origin) : 'Click to select city'}
                    </span>
                  </div>

                  {/* Autocomplete Dropdown */}
                  {activeDropdown === 'origin' && (
                    <div
                      className="absolute top-full left-0 right-0 md:w-80 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                        Popular Pickup Cities
                      </div>
                      <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                        {filteredOriginCities.map((city) => (
                          <button
                            key={city.name}
                            type="button"
                            onClick={() => {
                              setOrigin(city.name);
                              setActiveDropdown(null);
                            }}
                            className="w-full text-left py-2 px-2.5 rounded-lg hover:bg-blue-50/80 flex items-center justify-between group transition-colors cursor-pointer"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900 group-hover:text-brand-blue block">
                                  {city.name}
                                </span>
                                <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded font-bold">
                                  {city.state}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 block mt-0.5">{city.name}, {city.state}</span>
                            </div>
                            <span className="text-[10px] text-brand-green font-bold opacity-0 group-hover:opacity-100">
                              Select ➔
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* SWAP BUTTON (Desktop Floating Circle) */}
                <div className="hidden md:flex absolute left-[25%] top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSwap();
                    }}
                    title="Swap Origin & Destination"
                    aria-label="Swap cities"
                    className={`w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md hover:shadow-lg hover:bg-brand-blue hover:text-white text-slate-600 flex items-center justify-center transition-all cursor-pointer ${
                      swapAnim ? 'rotate-180 scale-110' : ''
                    }`}
                  >
                    <FaExchangeAlt className="w-3 h-3" />
                  </button>
                </div>

                {/* Mobile Swap Button (Between FROM and TO cards) */}
                <div className="flex md:hidden justify-end px-4 py-1.5 bg-slate-100/60">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSwap();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-300 shadow-2xs text-[11px] font-bold text-slate-700 hover:bg-brand-blue hover:text-white transition-all cursor-pointer"
                  >
                    <FaExchangeAlt className={`w-2.5 h-2.5 ${swapAnim ? 'rotate-180' : ''}`} />
                    <span>Swap Cities</span>
                  </button>
                </div>

                {/* 2. TO CARD */}
                <div
                  className="md:col-span-3 p-3.5 sm:p-4 hover:bg-white transition-colors relative group cursor-pointer"
                  onClick={() => setActiveDropdown('destination')}
                >
                  <div className="flex items-center justify-between">
                    <label htmlFor="booking-drop" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block cursor-pointer">
                      TO
                    </label>
                    <span className="text-[11px] text-brand-green font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      Type or pick
                    </span>
                  </div>
                  <div className="mt-1">
                    <input
                      id="booking-drop"
                      type="text"
                      value={destination}
                      onChange={(e) => {
                        setDestination(e.target.value);
                        setActiveDropdown('destination');
                      }}
                      onFocus={() => setActiveDropdown('destination')}
                      placeholder="Enter drop destination"
                      className="text-xl sm:text-2xl font-black text-slate-900 block truncate bg-transparent border-0 focus:outline-none w-full p-0"
                    />
                    <input id="drop-input" type="hidden" value={destination} readOnly />
                    <span className="text-xs text-slate-500 font-medium truncate block mt-0.5">
                      {destination ? formatLocationWithState(destination) : 'Click to select destination'}
                    </span>
                  </div>

                  {/* Autocomplete Dropdown */}
                  {activeDropdown === 'destination' && (
                    <div
                      className="absolute top-full left-0 right-0 md:w-80 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                        Popular Drop Cities
                      </div>
                      <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                        {filteredDestCities.map((city) => (
                          <button
                            key={city.name}
                            type="button"
                            onClick={() => {
                              setDestination(city.name);
                              setActiveDropdown(null);
                            }}
                            className="w-full text-left py-2 px-2.5 rounded-lg hover:bg-blue-50/80 flex items-center justify-between group transition-colors cursor-pointer"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900 group-hover:text-brand-blue block">
                                  {city.name}
                                </span>
                                <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded font-bold">
                                  {city.state}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 block mt-0.5">{city.name}, {city.state}</span>
                            </div>
                            <span className="text-[10px] text-brand-green font-bold opacity-0 group-hover:opacity-100">
                              Select ➔
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. DEPARTURE DATE CARD */}
                <div
                  className={`${
                    tripType === 'round_trip' ? 'md:col-span-2' : 'md:col-span-3'
                  } p-3.5 sm:p-4 hover:bg-white transition-colors cursor-pointer relative group`}
                  onClick={() => pickupDateInputRef.current?.showPicker?.()}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      DEPARTURE
                    </span>
                    <FaCalendarAlt className="w-3 h-3 text-brand-blue" />
                  </div>
                  <div className="mt-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900">
                        {pickupDateFormatted.day}
                      </span>
                      <span className="text-sm font-black text-slate-800">
                        {pickupDateFormatted.monthYear}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium block mt-0.5">
                      {pickupDateFormatted.weekday}
                    </span>
                  </div>
                  <input
                    ref={pickupDateInputRef}
                    type="date"
                    min={todayStr}
                    value={pickupDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="sr-only"
                    aria-label="Departure Date"
                  />
                </div>

                {/* 4. RETURN DATE CARD (Round-Trip Only) */}
                {tripType === 'round_trip' && (
                  <div
                    className="md:col-span-2 p-3.5 sm:p-4 hover:bg-white transition-colors cursor-pointer relative group"
                    onClick={() => returnDateInputRef.current?.showPicker?.()}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        RETURN
                      </span>
                      <FaCalendarAlt className="w-3 h-3 text-brand-blue" />
                    </div>
                    <div className="mt-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900">
                          {returnDateFormatted.day}
                        </span>
                        <span className="text-sm font-black text-slate-800">
                          {returnDateFormatted.monthYear}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium block mt-0.5">
                        {returnDateFormatted.weekday}
                      </span>
                    </div>
                    <input
                      ref={returnDateInputRef}
                      type="date"
                      min={pickupDate}
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="sr-only"
                      aria-label="Return Date"
                    />
                  </div>
                )}

                {/* 5. PICKUP TIME CARD */}
                <div
                  className={`${
                    tripType === 'round_trip' ? 'md:col-span-2' : 'md:col-span-3'
                  } p-3.5 sm:p-4 hover:bg-white transition-colors cursor-pointer relative group rounded-b-2xl md:rounded-b-none md:rounded-r-2xl`}
                  onClick={() => pickupTimeInputRef.current?.showPicker?.()}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      PICKUP TIME
                    </span>
                    <FaClock className="w-3 h-3 text-brand-blue" />
                  </div>
                  <div className="mt-1">
                    <span className="text-xl sm:text-2xl font-black text-slate-900 block">
                      {formatMmtTime(pickupTime)}
                    </span>
                    <span className="text-xs text-slate-500 font-medium block mt-0.5">
                      Daylight / Evening
                    </span>
                  </div>
                  <input
                    ref={pickupTimeInputRef}
                    type="time"
                    min={pickupDate === todayStr ? minTimeForToday : undefined}
                    value={pickupTime}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="sr-only"
                    aria-label="Pickup Time"
                  />
                </div>
              </div>

              {/* ── INTERMEDIATE STOPS CARDS (When User Adds Stops) ── */}
              {stops.length > 0 && (
                <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in duration-200">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between px-1">
                    <span>Intermediate Via Stops ({stops.length})</span>
                    <span className="text-emerald-700">Multi-destination corridor routing</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                    {stops.map((stop, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-300 relative group flex items-center justify-between gap-2 shadow-2xs">
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold uppercase text-brand-blue block">
                            STOP {idx + 1} (VIA)
                          </span>
                          <input
                            type="text"
                            value={stop}
                            onChange={(e) => handleStopChange(idx, e.target.value)}
                            placeholder="Enter stop city"
                            className="w-full text-xs font-bold text-slate-900 bg-transparent border-0 focus:outline-none p-0"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveStop(idx)}
                          title="Remove Stop"
                          className="w-6 h-6 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 flex items-center justify-center text-xs transition-colors cursor-pointer"
                        >
                          <FaTimes className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {origin && destination && (
                    <div className="text-[11px] font-semibold text-slate-600 px-1 pt-1 flex items-center gap-1.5 flex-wrap">
                      <span className="text-slate-400 font-bold">Corridor:</span>
                      <span className="text-slate-900 font-bold">{origin}</span>
                      {stops.filter(Boolean).map((s, i) => (
                        <React.Fragment key={i}>
                          <span className="text-emerald-600">➔</span>
                          <span className="text-brand-blue font-bold">{s}</span>
                        </React.Fragment>
                      ))}
                      <span className="text-emerald-600">➔</span>
                      <span className="text-slate-900 font-bold">{destination}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : tripType === 'airport_transfer' ? (
            /* ── AIRPORT TRANSFER FIELDS (Responsive Clean Layout) ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200">
              <div className="lg:col-span-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Trip Direction
                </label>
                <div className="grid grid-cols-2 gap-1.5 bg-slate-200/60 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setAirportDirection('drop')}
                    className={`py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      airportDirection === 'drop'
                        ? 'bg-brand-blue text-white shadow-xs'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    ✈️ To Airport
                  </button>
                  <button
                    type="button"
                    onClick={() => setAirportDirection('pickup')}
                    className={`py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      airportDirection === 'pickup'
                        ? 'bg-brand-blue text-white shadow-xs'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    🛬 From Airport
                  </button>
                </div>
              </div>

              <div className="lg:col-span-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Select Airport
                </label>
                <select
                  value={selectedAirport}
                  onChange={(e) => setSelectedAirport(e.target.value)}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue cursor-pointer"
                >
                  {AIRPORT_LIST.map((ap) => (
                    <option key={ap.code} value={ap.name}>
                      {ap.name} ({ap.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  {airportDirection === 'drop' ? 'Pickup City / Zone' : 'Drop City / Zone'}
                </label>
                <select
                  value={selectedAirportZone}
                  onChange={(e) => setSelectedAirportZone(e.target.value)}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue cursor-pointer"
                >
                  {AIRPORT_ZONES.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Flight Date & Time
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    min={todayStr}
                    value={pickupDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 cursor-pointer"
                  />
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* ── HOURLY LOCAL RENTAL FIELDS (Clean Responsive Layout) ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200">
              <div className="lg:col-span-4">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  City for Rental
                </label>
                <select
                  value={rentalCity}
                  onChange={(e) => setRentalCity(e.target.value)}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue cursor-pointer"
                >
                  <option value="Ghaziabad">Ghaziabad</option>
                  <option value="Masuri">Masuri</option>
                  <option value="Noida">Noida</option>
                  <option value="Greater Noida">Greater Noida</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Gurugram">Gurugram</option>
                  <option value="Faridabad">Faridabad</option>
                  <option value="Meerut">Meerut</option>
                  <option value="Lucknow">Lucknow</option>
                  <option value="Dehradun">Dehradun</option>
                  <option value="Haridwar">Haridwar</option>
                  <option value="Rishikesh">Rishikesh</option>
                  <option value="Agra">Agra</option>
                  <option value="Jaipur">Jaipur</option>
                </select>
              </div>

              <div className="lg:col-span-5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Select Rental Package
                </label>
                <select
                  value={rentalPackageId}
                  onChange={(e) => setRentalPackageId(e.target.value as HourlyRentalPackageId)}
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue cursor-pointer mb-2"
                >
                  {HOURLY_RENTAL_PACKAGES.map((pkg) => {
                    const quote = calculateLocalRentalFare(pkg.id, 'sedan');
                    return (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} — ₹{quote.basePrice.toLocaleString('en-IN')} (Sedan)
                      </option>
                    );
                  })}
                </select>

                {/* Quick Selection Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {HOURLY_RENTAL_PACKAGES.slice(0, 3).map((pkg) => {
                    const quote = calculateLocalRentalFare(pkg.id, 'sedan');
                    const isSelected = rentalPackageId === pkg.id;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setRentalPackageId(pkg.id)}
                        className={`p-1.5 rounded-xl text-left border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-brand-blue bg-blue-50 text-brand-blue font-bold ring-1 ring-brand-blue/30'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-[11px] font-black block leading-tight">{pkg.name}</span>
                        <span className="text-[10px] text-emerald-600 font-black block">
                          ₹{quote.basePrice.toLocaleString('en-IN')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Pickup Date & Time
                </label>
                <div className="space-y-1.5">
                  <input
                    type="date"
                    min={todayStr}
                    value={pickupDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 cursor-pointer"
                  />
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── MMT BIG SEARCH CABS BUTTON ── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
              <FaCheckCircle className="text-brand-green w-3.5 h-3.5 shrink-0" />
              <span>Clean AC Cabs • Verified Yellow-Plate Chauffeurs • Transparent Pricing</span>
            </div>

            <button
              type="submit"
              id="search-cabs-button"
              className="w-full sm:w-auto px-8 sm:px-12 py-3.5 sm:py-4 bg-[#059669] hover:bg-[#047857] active:scale-95 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Search Cabs</span>
              <FaSearch className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </form>

        {/* ── POPULAR ROUTE QUICK PILLS ── */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider mr-1">
            Popular:
          </span>
          {[
            { from: 'Delhi', to: 'Agra', fare: '₹2,499' },
            { from: 'Delhi', to: 'Jaipur', fare: '₹3,299' },
            { from: 'Delhi', to: 'Haridwar', fare: '₹2,899' },
            { from: 'Delhi', to: 'Dehradun', fare: '₹3,199' },
            { from: 'Delhi', to: 'Nainital', fare: '₹3,999' },
            { from: 'Ghaziabad', to: 'Haldwani', fare: '₹3,899' },
          ].map((r) => (
            <button
              key={`${r.from}-${r.to}`}
              type="button"
              onClick={() => {
                setTripType('one_way');
                setOrigin(r.from);
                setDestination(r.to);
                setStops([]);
              }}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-brand-green text-slate-700 font-bold text-[11px] border border-slate-200/80 transition-colors cursor-pointer"
            >
              {r.from} ➔ {r.to} <span className="text-slate-400 font-normal">({r.fare})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
