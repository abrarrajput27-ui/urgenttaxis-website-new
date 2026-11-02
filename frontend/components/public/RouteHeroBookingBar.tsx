'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaMapMarkerAlt, FaExchangeAlt, FaCalendarAlt, FaSearch } from 'react-icons/fa';

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
  
  // Format today's date for HTML date input
  const todayStr = new Date().toISOString().split('T')[0];
  const [journeyDate, setJourneyDate] = useState(todayStr);

  const handleSwap = () => {
    setPickup(drop);
    setDrop(pickup);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // If on route page and user searches, smooth scroll to Cab Options & Fare section
    const cabSection = document.getElementById('cab-options');
    if (cabSection && pickup === defaultOrigin && drop === defaultDestination) {
      cabSection.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Otherwise navigate to checkout or outstation booking
    const query = new URLSearchParams({
      serviceType,
      pickup: pickup || defaultOrigin,
      drop: serviceType === 'local_rental' ? '' : drop || defaultDestination,
      date: journeyDate,
      km: defaultDistanceKm.toString(),
    });

    router.push(`/checkout?${query.toString()}`);
  };

  return (
    <div className={`w-full max-w-5xl mx-auto font-sans ${className}`}>
      {/* Service Type Tabs */}
      <div className="flex items-center gap-1.5 mb-2 px-1">
        <button
          type="button"
          onClick={() => setServiceType('one_way')}
          className={`px-4 py-2 rounded-t-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            serviceType === 'one_way'
              ? 'bg-white text-brand-blue shadow-sm'
              : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs'
          }`}
        >
          <span>🚗</span> One Way
        </button>
        <button
          type="button"
          onClick={() => setServiceType('round_trip')}
          className={`px-4 py-2 rounded-t-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            serviceType === 'round_trip'
              ? 'bg-white text-brand-blue shadow-sm'
              : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs'
          }`}
        >
          <span>🔄</span> Round Trip
        </button>
        <button
          type="button"
          onClick={() => setServiceType('local_rental')}
          className={`px-4 py-2 rounded-t-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            serviceType === 'local_rental'
              ? 'bg-white text-brand-blue shadow-sm'
              : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs'
          }`}
        >
          <span>⏱️</span> Local Rental
        </button>
      </div>

      {/* Booking Form Input Bar */}
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-xl border border-slate-200/80 grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
      >
        {/* Pickup Location */}
        <div className="md:col-span-3 bg-slate-50 hover:bg-slate-100/80 p-2.5 rounded-xl border border-slate-200 transition-colors flex items-center gap-2.5">
          <FaMapMarkerAlt className="text-emerald-600 text-base shrink-0" />
          <div className="flex-1 min-w-0">
            <label htmlFor="pickup-input" className="block text-[10px] uppercase font-bold text-slate-400">
              Pickup Location
            </label>
            <input
              id="pickup-input"
              type="text"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              placeholder="Enter pickup city"
              className="w-full bg-transparent font-bold text-slate-900 text-sm focus:outline-none truncate"
            />
          </div>
        </div>

        {/* Swap Button (Hidden if local rental) */}
        {serviceType !== 'local_rental' && (
          <div className="hidden md:flex md:col-span-1 justify-center">
            <button
              type="button"
              onClick={handleSwap}
              aria-label="Swap pickup and drop"
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-brand-blue hover:text-white text-slate-600 flex items-center justify-center transition-all cursor-pointer shadow-xs border border-slate-200"
            >
              <FaExchangeAlt className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Drop Location */}
        <div
          className={`${
            serviceType === 'local_rental' ? 'md:col-span-4' : 'md:col-span-3'
          } bg-slate-50 hover:bg-slate-100/80 p-2.5 rounded-xl border border-slate-200 transition-colors flex items-center gap-2.5`}
        >
          <FaMapMarkerAlt className="text-amber-500 text-base shrink-0" />
          <div className="flex-1 min-w-0">
            <label htmlFor="drop-input" className="block text-[10px] uppercase font-bold text-slate-400">
              {serviceType === 'local_rental' ? 'City / Area' : 'Drop Location'}
            </label>
            <input
              id="drop-input"
              type="text"
              value={drop}
              onChange={(e) => setDrop(e.target.value)}
              placeholder={serviceType === 'local_rental' ? 'Local rental city' : 'Enter drop destination'}
              className="w-full bg-transparent font-bold text-slate-900 text-sm focus:outline-none truncate"
            />
          </div>
        </div>

        {/* Journey Date */}
        <div
          className={`${
            serviceType === 'local_rental' ? 'md:col-span-3' : 'md:col-span-3'
          } bg-slate-50 hover:bg-slate-100/80 p-2.5 rounded-xl border border-slate-200 transition-colors flex items-center gap-2.5`}
        >
          <FaCalendarAlt className="text-brand-blue text-base shrink-0" />
          <div className="flex-1 min-w-0">
            <label htmlFor="journey-date-input" className="block text-[10px] uppercase font-bold text-slate-400">
              Journey Date
            </label>
            <input
              id="journey-date-input"
              type="date"
              value={journeyDate}
              min={todayStr}
              onChange={(e) => setJourneyDate(e.target.value)}
              className="w-full bg-transparent font-bold text-slate-900 text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Search CTA Button */}
        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer group active:scale-95"
          >
            <span>Search Cabs</span>
            <FaSearch className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  );
}
