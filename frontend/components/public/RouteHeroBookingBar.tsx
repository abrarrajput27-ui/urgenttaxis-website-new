'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FaMapMarkerAlt, FaExchangeAlt, FaCalendarAlt, FaSearch, FaClock } from 'react-icons/fa';
import { resolveOneWayFare } from '@/lib/pricing';

interface RouteHeroBookingBarProps {
  defaultOrigin: string;
  defaultDestination: string;
  defaultDistanceKm?: number;
  className?: string;
}

export default function RouteHeroBookingBar({
  defaultOrigin,
  defaultDestination,
  defaultDistanceKm = 0,
  className = '',
}: RouteHeroBookingBarProps) {
  const router = useRouter();
  const [serviceType, setServiceType] = useState<'one_way' | 'round_trip' | 'local_rental'>('one_way');
  const [pickup, setPickup] = useState(defaultOrigin);
  const [drop, setDrop] = useState(defaultDestination);
  const [swapAnim, setSwapAnim] = useState(false);
  
  // Format today's date for HTML date input
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [journeyDate, setJourneyDate] = useState(todayStr);
  const [journeyTime, setJourneyTime] = useState('09:00');

  const handleSwap = () => {
    setSwapAnim(true);
    setTimeout(() => setSwapAnim(false), 300);
    setPickup(drop);
    setDrop(pickup);
  };

  // Live fare estimate for MMT teaser strip
  const liveQuote = useMemo(() => {
    if (serviceType === 'one_way' && pickup && drop && pickup.toLowerCase() !== drop.toLowerCase()) {
      try {
        const quote = resolveOneWayFare(pickup, drop, defaultDistanceKm);
        if (!quote.requiresWhatsAppQuote && quote.sedanFare) {
          return {
            sedanFare: quote.sedanFare,
            ertigaFare: quote.ertigaFare || Math.round(quote.sedanFare * 1.35),
            distanceKm: quote.distanceKm || defaultDistanceKm,
          };
        }
      } catch {
        return null;
      }
    }
    return null;
  }, [pickup, drop, serviceType, defaultDistanceKm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // MMT Multi-Step Flow: Search ➔ /cabs (Vehicle Selection) ➔ /checkout ➔ /booking-confirmation
    const query = new URLSearchParams({
      serviceType,
      pickup: pickup || defaultOrigin,
      drop: serviceType === 'local_rental' ? '' : drop || defaultDestination,
      date: journeyDate,
      time: journeyTime,
    });

    if (defaultDistanceKm > 0) {
      query.set('distanceKm', defaultDistanceKm.toString());
      query.set('km', defaultDistanceKm.toString());
    }

    router.push(`/cabs?${query.toString()}`);
  };

  return (
    <div className={`w-full max-w-5xl mx-auto font-sans ${className}`}>
      {/* ── MMT Style Service Tabs ── */}
      <div className="flex items-center gap-1.5 mb-1.5 px-2 overflow-x-auto scrollbar-hide select-none">
        <button
          type="button"
          onClick={() => setServiceType('one_way')}
          className={`px-4 sm:px-5 py-2.5 rounded-t-xl text-xs sm:text-xs font-black tracking-wider transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            serviceType === 'one_way'
              ? 'bg-white text-brand-blue shadow-md border-t-2 border-brand-green font-black -translate-y-0.5'
              : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs font-bold'
          }`}
        >
          <span>🚗</span> OUTSTATION ONE-WAY
        </button>
        <button
          type="button"
          onClick={() => setServiceType('round_trip')}
          className={`px-4 sm:px-5 py-2.5 rounded-t-xl text-xs sm:text-xs font-black tracking-wider transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            serviceType === 'round_trip'
              ? 'bg-white text-brand-blue shadow-md border-t-2 border-brand-green font-black -translate-y-0.5'
              : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs font-bold'
          }`}
        >
          <span>🔁</span> OUTSTATION ROUND-TRIP
        </button>
        <button
          type="button"
          onClick={() => setServiceType('local_rental')}
          className={`px-4 sm:px-5 py-2.5 rounded-t-xl text-xs sm:text-xs font-black tracking-wider transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            serviceType === 'local_rental'
              ? 'bg-white text-brand-blue shadow-md border-t-2 border-brand-green font-black -translate-y-0.5'
              : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs font-bold'
          }`}
        >
          <span>⏱️</span> HOURLY RENTAL
        </button>
      </div>

      {/* ── MMT Segmented Booking Form Container ── */}
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-slate-200/90 space-y-3"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Pickup Location Segment */}
          <div className="md:col-span-3 bg-slate-50 hover:bg-slate-100/80 p-3 rounded-2xl border border-slate-200 transition-colors flex items-center gap-2.5">
            <FaMapMarkerAlt className="text-emerald-600 text-lg shrink-0" />
            <div className="flex-1 min-w-0">
              <label htmlFor="pickup-input" className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                FROM
              </label>
              <input
                id="pickup-input"
                type="text"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="Enter pickup city"
                className="w-full bg-transparent font-black text-slate-900 text-base sm:text-lg focus:outline-none truncate p-0"
              />
              <span className="text-[11px] text-slate-500 font-medium block truncate">
                {pickup ? `${pickup}, India` : 'Enter pickup city'}
              </span>
            </div>
          </div>

          {/* Swap Button */}
          {serviceType !== 'local_rental' && (
            <div className="hidden md:flex md:col-span-1 justify-center">
              <button
                type="button"
                onClick={handleSwap}
                aria-label="Swap pickup and drop"
                title="Swap cities"
                className={`w-9 h-9 rounded-full bg-slate-100 hover:bg-brand-blue hover:text-white text-slate-600 flex items-center justify-center transition-all cursor-pointer shadow-xs border border-slate-200 ${
                  swapAnim ? 'rotate-180 scale-110' : ''
                }`}
              >
                <FaExchangeAlt className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Drop Location Segment */}
          <div
            className={`${
              serviceType === 'local_rental' ? 'md:col-span-4' : 'md:col-span-3'
            } bg-slate-50 hover:bg-slate-100/80 p-3 rounded-2xl border border-slate-200 transition-colors flex items-center gap-2.5`}
          >
            <FaMapMarkerAlt className="text-brand-green text-lg shrink-0" />
            <div className="flex-1 min-w-0">
              <label htmlFor="drop-input" className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {serviceType === 'local_rental' ? 'CITY / AREA' : 'TO'}
              </label>
              <input
                id="drop-input"
                type="text"
                value={drop}
                onChange={(e) => setDrop(e.target.value)}
                placeholder={serviceType === 'local_rental' ? 'Local rental city' : 'Enter drop destination'}
                className="w-full bg-transparent font-black text-slate-900 text-base sm:text-lg focus:outline-none truncate p-0"
              />
              <span className="text-[11px] text-slate-500 font-medium block truncate">
                {drop ? `${drop}, India` : 'Enter drop destination'}
              </span>
            </div>
          </div>

          {/* Journey Date Segment */}
          <div
            className={`${
              serviceType === 'local_rental' ? 'md:col-span-3' : 'md:col-span-3'
            } bg-slate-50 hover:bg-slate-100/80 p-3 rounded-2xl border border-slate-200 transition-colors flex items-center gap-2.5`}
          >
            <FaCalendarAlt className="text-brand-blue text-lg shrink-0" />
            <div className="flex-1 min-w-0">
              <label htmlFor="journey-date-input" className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                DEPARTURE
              </label>
              <input
                id="journey-date-input"
                type="date"
                value={journeyDate}
                min={todayStr}
                onChange={(e) => setJourneyDate(e.target.value)}
                className="w-full bg-transparent font-black text-slate-900 text-sm focus:outline-none p-0 cursor-pointer"
              />
              <span className="text-[11px] text-slate-500 font-medium block">
                Pickup date
              </span>
            </div>
          </div>

          {/* Search CTA Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              id="search-cabs-button"
              className="w-full py-3.5 px-4 bg-[#059669] hover:bg-[#047857] text-white font-black rounded-2xl text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer group active:scale-95"
            >
              <span>Search Cabs</span>
              <FaSearch className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Live Fare Preview Ticker */}
        {liveQuote && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-slate-700">
                Live Estimates for {pickup} ➔ {drop} ({liveQuote.distanceKm} km):
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-50 text-brand-green font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                Sedan from ₹{liveQuote.sedanFare.toLocaleString('en-IN')}
              </span>
              <span className="bg-blue-50 text-brand-blue font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                SUV from ₹{liveQuote.ertigaFare.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">
                30% Token • 70% Driver Balance
              </span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
