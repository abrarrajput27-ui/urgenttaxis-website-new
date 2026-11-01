'use client';

import React, { useState, useMemo } from 'react';
import { SITE_CONFIG } from '@/lib/seo';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { useRouter } from 'next/navigation';
import { FaCalendarAlt, FaClock, FaUsers, FaCar, FaExchangeAlt, FaShieldAlt } from 'react-icons/fa';

interface RouteBookingWidgetProps {
  defaultOrigin: string;
  defaultDestination: string;
  defaultDistanceKm: number;
  routeId?: string;
}

export default function RouteBookingWidget({
  defaultOrigin,
  defaultDestination,
  defaultDistanceKm,
  routeId = '',
}: RouteBookingWidgetProps) {
  const router = useRouter();

  const [tripType, setTripType] = useState<'one_way' | 'round_trip'>('one_way');
  const [origin, setOrigin] = useState(defaultOrigin);
  const [destination, setDestination] = useState(defaultDestination);
  
  // Date & Time
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [pickupDate, setPickupDate] = useState(todayStr);
  const [pickupTime, setPickupTime] = useState('06:00');
  const [returnDate, setReturnDate] = useState(todayStr);
  const [passengerCount, setPassengerCount] = useState(2);
  const [selectedVehicle, setSelectedVehicle] = useState<'sedan' | 'suv' | 'crysta'>('sedan');
  
  // Rates per km
  const rates = useMemo(() => ({
    sedan: {
      name: 'Sedan (Dzire / Etios)',
      perKm: 11,
      minKmPerDay: 250,
      capacity: '4 Passengers + 2 Bags',
      rateMultiplier: 13.5,
    },
    suv: {
      name: 'SUV / MPV (Ertiga / Carens)',
      perKm: 15,
      minKmPerDay: 250,
      capacity: '6 Passengers + 4 Bags',
      rateMultiplier: 17.5,
    },
    crysta: {
      name: 'Innova Crysta / Hycross',
      perKm: 20,
      minKmPerDay: 300,
      capacity: '7 Passengers + 5 Bags',
      rateMultiplier: 26,
    },
  }), []);

  // Calculate billable KM and fares
  const calculations = useMemo(() => {
    const isRound = tripType === 'round_trip';
    const minKm = rates[selectedVehicle].minKmPerDay;
    const effectiveKm = isRound ? Math.max(defaultDistanceKm * 2, minKm) : defaultDistanceKm;
    
    // Toll and state tax estimates (informational Fastag highway toll)
    const estToll = Math.round(effectiveKm * 1.6);
    const estStateTax = 350;

    let totalCabFare = 0;
    if (isRound) {
      const driverAllowance = selectedVehicle === 'crysta' ? 500 : 400;
      totalCabFare = Math.round(effectiveKm * rates[selectedVehicle].perKm + driverAllowance);
    } else {
      totalCabFare = Math.round(effectiveKm * rates[selectedVehicle].rateMultiplier);
    }

    const tokenAmount = Math.round(totalCabFare * 0.30); // Official 30% advance token
    const balanceAmount = totalCabFare - tokenAmount;

    return {
      billableKm: effectiveKm,
      estToll,
      estStateTax,
      baseFare: totalCabFare,
      totalPayable: totalCabFare,
      tokenAmount,
      balanceAmount,
    };
  }, [tripType, defaultDistanceKm, selectedVehicle, rates]);

  // Swap origin and destination
  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  // Prevent past dates
  const handleDateChange = (val: string) => {
    if (val < todayStr) {
      setPickupDate(todayStr);
    } else {
      setPickupDate(val);
      if (returnDate < val) setReturnDate(val);
    }
  };

  const handleReturnDateChange = (val: string) => {
    if (val < pickupDate) {
      setReturnDate(pickupDate);
    } else {
      setReturnDate(val);
    }
  };

  const handleProceedToCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams({
      serviceType: tripType,
      categoryId: selectedVehicle === 'sedan' ? 'sedan' : selectedVehicle === 'suv' ? 'suv-muv' : 'executive-suv',
      routeId: routeId,
      pickup: origin,
      drop: destination,
      date: `${pickupDate}T${pickupTime}:00`,
      km: calculations.billableKm.toString(),
      passengers: passengerCount.toString(),
    });

    router.push(`/checkout?${query.toString()}`);
  };

  const whatsappMessage = generateWhatsAppLink(SITE_CONFIG.whatsapp, {
    pickup: origin,
    drop: destination,
    tripType: tripType === 'one_way' ? 'One Way Outstation' : 'Round Trip Outstation',
    journeyDate: `${pickupDate} at ${pickupTime}`,
    vehicleCategory: rates[selectedVehicle].name,
    distance: calculations.billableKm,
    totalFare: calculations.totalPayable,
    baseFare: calculations.baseFare,
    tokenAmount: calculations.tokenAmount,
    balanceAmount: calculations.balanceAmount,
    estimatedToll: calculations.estToll,
    estimatedStateTax: calculations.estStateTax,
    customMessage: `Hello Urgent Taxis! 👋\n\nI would like to book a *${rates[selectedVehicle].name}*.\nPickup: ${origin}\nDrop: ${destination}\nType: ${tripType === 'one_way' ? 'One Way' : 'Round Trip'}\nDate: ${pickupDate} at ${pickupTime}\nEstimated Total: ₹${calculations.totalPayable.toLocaleString('en-IN')}\nAdvance Token (30%): ₹${calculations.tokenAmount.toLocaleString('en-IN')}\nRemaining Balance (70%): ₹${calculations.balanceAmount.toLocaleString('en-IN')}`,
  });

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden font-sans">
      <div className="bg-gradient-to-r from-brand-blue to-blue-900 text-white p-5 sm:p-6 text-center">
        <span className="inline-block bg-white/20 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full mb-2">
          Instant Fare & Booking
        </span>
        <h3 className="text-xl sm:text-2xl font-black tracking-tight">
          Book {origin} to {destination} Taxi
        </h3>
        <p className="text-xs text-blue-200 mt-1 font-medium">
          Transparent pricing • Direct Booking Assistance • Reliable Fleet
        </p>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Trip Type Selector */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setTripType('one_way')}
            className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              tripType === 'one_way'
                ? 'bg-brand-blue text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>➔</span> One-Way Drop
          </button>
          <button
            type="button"
            onClick={() => setTripType('round_trip')}
            className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              tripType === 'round_trip'
                ? 'bg-brand-blue text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🔄</span> Round Trip Outstation
          </button>
        </div>

        {/* Location Inputs with Swap */}
        <div className="space-y-3 relative">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Pickup City / Address
            </label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Enter pickup location"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <div className="flex justify-center -my-2 relative z-10">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap pickup and destination"
              className="bg-white border-2 border-slate-200 hover:border-brand-blue p-2 rounded-full text-slate-600 hover:text-brand-blue shadow-sm transition-all"
            >
              <FaExchangeAlt className="w-3.5 h-3.5 transform rotate-90 sm:rotate-0" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Drop Destination / Address
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Enter drop destination"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
        </div>

        {/* Date and Time Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <FaCalendarAlt className="text-brand-blue" /> Journey Date
            </label>
            <input
              type="date"
              min={todayStr}
              value={pickupDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <FaClock className="text-brand-blue" /> Pickup Time
            </label>
            <input
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          {tripType === 'round_trip' && (
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <FaCalendarAlt className="text-brand-green" /> Return Date
              </label>
              <input
                type="date"
                min={pickupDate}
                value={returnDate}
                onChange={(e) => handleReturnDateChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          )}
        </div>

        {/* Passenger Count */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <FaUsers className="text-brand-blue" /> Number of Passengers
          </label>
          <div className="flex gap-2">
            {[1, 2, 4, 6, 7].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setPassengerCount(num)}
                className={`flex-1 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                  passengerCount === num
                    ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {num} {num === 7 ? '7+' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Vehicle Selection Cards */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <FaCar className="text-brand-blue" /> Select Cab Model
          </label>
          <div className="space-y-2">
            {(['sedan', 'suv', 'crysta'] as const).map((vKey) => {
              const vInfo = rates[vKey];
              const isSelected = selectedVehicle === vKey;
              return (
                <div
                  key={vKey}
                  onClick={() => setSelectedVehicle(vKey)}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-brand-blue bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-extrabold text-sm text-slate-900">{vInfo.name}</div>
                    <div className="text-xs text-slate-500 font-medium">{vInfo.capacity}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 block uppercase">Extra KM</span>
                    <span className="text-xs font-black text-brand-blue">₹{vInfo.perKm}/km</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transparent Fare Summary Card */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
          <div className="flex justify-between items-baseline border-b border-slate-200 pb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Cab Rental Fare</span>
            <span className="text-2xl font-black text-brand-blue">
              ₹{calculations.totalPayable.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-semibold text-slate-600">
            <div className="flex justify-between">
              <span>Cab Fare ({calculations.billableKm} km):</span>
              <span className="font-bold text-slate-800">₹{calculations.baseFare.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Driver Day Allowance:</span>
              <span className="text-brand-green font-bold">Included</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Highway Toll (Est. Fastag):</span>
              <span className="font-medium text-slate-600">~ ₹{calculations.estToll.toLocaleString('en-IN')} (At Plaza)</span>
            </div>
            <div className="flex justify-between">
              <span>Advance Token to Confirm:</span>
              <span className="font-bold text-brand-blue">₹{calculations.tokenAmount.toLocaleString('en-IN')} (30%)</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Payable to Driver on Trip:</span>
              <span>₹{calculations.balanceAmount.toLocaleString('en-IN')} (70%)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center gap-1.5 text-[11px] text-slate-500">
            <FaShieldAlt className="text-brand-green" />
            <span>Clear fare estimate. Fuel & vehicle rental included. Tolls itemized clearly.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={handleProceedToCheckout}
            className="w-full bg-brand-blue hover:bg-brand-blue-hover text-white font-black py-3.5 px-4 rounded-xl shadow-lg shadow-brand-blue/20 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to Online Booking →</span>
          </button>

          <a
            href={whatsappMessage}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-brand-green hover:bg-brand-green-hover text-white font-black py-3.5 px-4 rounded-xl shadow-lg shadow-brand-green/20 transition-all text-sm flex items-center justify-center gap-2 text-center"
          >
            <span>💬 Book Instantly via WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
