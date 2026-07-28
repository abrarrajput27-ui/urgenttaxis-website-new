'use client';

import { useState } from 'react';
import { PublicQuotationDTO } from '@/app/api/public/calculate-fare/route';
import {
  PricingLocalPackage,
  VehicleCategory,
  Route,
  Location,
} from '@/types/database';
import { SITE_CONFIG } from '@/lib/seo';

interface PublicFareWidgetProps {
  localPackages: PricingLocalPackage[];
  categories: VehicleCategory[];
  routes: Route[];
  locations: Location[];
  initialServiceType?: 'one_way' | 'round_trip' | 'local_rental' | 'airport_transfer';
}

export default function PublicFareWidget({
  localPackages,
  categories,
  routes,
  locations,
  initialServiceType = 'one_way',
}: PublicFareWidgetProps) {
  const [serviceType, setServiceType] = useState<'one_way' | 'round_trip' | 'local_rental' | 'airport_transfer'>(initialServiceType);

  // Input Controls
  const [routeId, setRouteId] = useState(routes[0]?.id || '');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [packageId, setPackageId] = useState(localPackages[0]?.id || '');
  const [airportLocId, setAirportLocId] = useState(locations.find((l) => l.location_type === 'airport')?.id || locations[0]?.id || '');
  const [cityZoneLocId, setCityZoneLocId] = useState(locations.find((l) => l.location_type === 'city')?.id || locations[0]?.id || '');

  const [actualDistanceKm, setActualDistanceKm] = useState(210);
  const [numberOfDays, setNumberOfDays] = useState(2);
  const [numberOfNights, setNumberOfNights] = useState(1);
  const [durationHours, setDurationHours] = useState(8);
  const [pickupDateTime, setPickupDateTime] = useState('');

  const [fareResult, setFareResult] = useState<NonNullable<PublicQuotationDTO['fare']> | null>(null);
  const [isFareOnRequest, setIsFareOnRequest] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCalculateFare = async (e: React.FormEvent) => {
    e.preventDefault();
    setFareResult(null);
    setIsFareOnRequest(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/public/calculate-fare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType,
          categoryId,
          routeId,
          packageId,
          airportLocationId: airportLocId,
          cityZoneLocationId: cityZoneLocId,
          actualDistanceKm,
          numberOfDays,
          numberOfNights,
          durationHours,
          pickupDateTime: pickupDateTime ? new Date(pickupDateTime).toISOString() : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success || data.isFareOnRequest || !data.fare) {
        setIsFareOnRequest(true);
      } else {
        setFareResult(data.fare);
      }
    } catch {
      setIsFareOnRequest(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#1e1b4b] text-white rounded-3xl p-6 sm:p-8 shadow-2xl max-w-4xl mx-auto font-sans">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Book Your Ride</h2>
        <p className="text-xs sm:text-sm text-indigo-200 mt-1 font-medium">Get Instant Price & Book Your Taxi</p>
      </div>

      {/* Service Type Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6 bg-white/10 p-1.5 rounded-2xl">
        <button
          type="button"
          onClick={() => { setServiceType('one_way'); setFareResult(null); setIsFareOnRequest(false); }}
          className={`py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center flex items-center gap-1.5 ${
            serviceType === 'one_way'
              ? 'bg-[#059669] text-white shadow-md'
              : 'text-white hover:bg-white/10'
          }`}
        >
          <span>➔</span> Outstation One Way
        </button>
        <button
          type="button"
          onClick={() => { setServiceType('round_trip'); setFareResult(null); setIsFareOnRequest(false); }}
          className={`py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center flex items-center gap-1.5 ${
            serviceType === 'round_trip'
              ? 'bg-[#059669] text-white shadow-md'
              : 'text-white hover:bg-white/10'
          }`}
        >
          <span>🔄</span> Outstation Round Trip
        </button>
        <button
          type="button"
          onClick={() => { setServiceType('local_rental'); setFareResult(null); setIsFareOnRequest(false); }}
          className={`py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center flex items-center gap-1.5 ${
            serviceType === 'local_rental'
              ? 'bg-[#059669] text-white shadow-md'
              : 'text-white hover:bg-white/10'
          }`}
        >
          <span>🚘</span> Local Rental
        </button>
        <button
          type="button"
          onClick={() => { setServiceType('airport_transfer'); setFareResult(null); setIsFareOnRequest(false); }}
          className={`py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center flex items-center gap-1.5 ${
            serviceType === 'airport_transfer'
              ? 'bg-[#059669] text-white shadow-md'
              : 'text-white hover:bg-white/10'
          }`}
        >
          <span>✈</span> Airport Transfer
        </button>
      </div>

      {/* Booking Search Form */}
      <form onSubmit={handleCalculateFare} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Dynamic Field 1: Route / Location */}
          {serviceType === 'one_way' && (
            <div className="md:col-span-2">
              <label className="block text-indigo-200 font-bold mb-1">Select Route</label>
              <select
                value={routeId}
                onChange={(e) => {
                  setRouteId(e.target.value);
                  const selectedRoute = routes.find((r) => r.id === e.target.value);
                  if (selectedRoute) setActualDistanceKm(Number(selectedRoute.estimated_distance_km));
                }}
                className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              >
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.origin?.name} → {r.destination?.name} ({r.estimated_distance_km} KM)
                  </option>
                ))}
              </select>
            </div>
          )}

          {serviceType === 'local_rental' && (
            <div className="md:col-span-2">
              <label className="block text-indigo-200 font-bold mb-1">Select Rental Package</label>
              <select
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              >
                {localPackages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.package_name} - ₹{p.package_price}
                  </option>
                ))}
              </select>
            </div>
          )}

          {serviceType === 'airport_transfer' && (
            <>
              <div>
                <label className="block text-indigo-200 font-bold mb-1">Airport</label>
                <select
                  value={airportLocId}
                  onChange={(e) => setAirportLocId(e.target.value)}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                >
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.city})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-indigo-200 font-bold mb-1">City Zone</label>
                <select
                  value={cityZoneLocId}
                  onChange={(e) => setCityZoneLocId(e.target.value)}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                >
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.city})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {serviceType === 'round_trip' && (
            <div className="md:col-span-2 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-indigo-200 font-bold mb-1">Trip Distance (KM)</label>
                <input
                  type="number"
                  min="10"
                  value={actualDistanceKm}
                  onChange={(e) => setActualDistanceKm(Number(e.target.value))}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-indigo-200 font-bold mb-1">Days</label>
                <input
                  type="number"
                  min="1"
                  value={numberOfDays}
                  onChange={(e) => setNumberOfDays(Number(e.target.value))}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                />
              </div>
            </div>
          )}

          {/* Vehicle Category */}
          <div>
            <label className="block text-indigo-200 font-bold mb-1">Vehicle Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2 flex flex-col items-center gap-3">
          <button
            type="submit"
            className="w-full py-4 bg-[#059669] hover:bg-[#047857] text-white font-extrabold text-base rounded-2xl shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Check Fare</span>
            <span>➔</span>
          </button>
          <span className="text-[12px] font-semibold text-emerald-300 flex items-center gap-1">
            ⚡ Instant WhatsApp Confirmation
          </span>
        </div>
      </form>

      {/* FARE ON REQUEST FALLBACK (WHEN NO PRICING RULE MATCHES) */}
      {isFareOnRequest && (
        <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-3 text-center">
          <p className="font-bold text-sm text-amber-300">Fare Available Upon Instant Request</p>
          <p className="text-amber-100/90 leading-relaxed">
            This route, vehicle category, or custom package requires manual dispatch confirmation for peak-hour or specialized vehicle availability.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <a
              href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis%2C%20I%20need%20a%20fare%20quote`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              💬 Request Quote on WhatsApp
            </a>
            <a
              href={`tel:${SITE_CONFIG.phoneRaw}`}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              📞 Call {SITE_CONFIG.phone}
            </a>
          </div>
        </div>
      )}
      {/* FARE CALCULATION DTO RESULT DISPLAY */}
      {fareResult && (
        <div className="mt-6 p-6 rounded-2xl bg-slate-900 border border-emerald-500/30 text-white space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Guaranteed Automated Quotation</span>
              <h3 className="text-xl font-black text-white capitalize">{fareResult.serviceType.replace('_', ' ')} Service</h3>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total Estimated Fare</span>
              <span className="text-2xl font-black text-amber-400 font-mono">₹{fareResult.automaticFare.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-400 block text-[10px]">Billable Distance</span>
              <span className="font-mono font-bold text-white">{fareResult.billableKm} KM</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Base Fare</span>
              <span className="font-mono font-bold text-white">₹{fareResult.baseFare}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Distance Charge</span>
              <span className="font-mono font-bold text-white">₹{fareResult.distanceCharge}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Surge Charge</span>
              <span className="font-mono font-bold text-white">₹{fareResult.dynamicSurgeAmount}</span>
            </div>
          </div>

          {/* Included / Excluded Items List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
            <div className="space-y-1">
              <span className="text-emerald-400 font-bold block">✓ Included in Quote:</span>
              <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                {fareResult.includedCharges.map((inc, i) => (
                  <li key={i}>{inc}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-1">
              <span className="text-amber-400 font-bold block">⚠️ Payable at Actuals (Excluded):</span>
              <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                {fareResult.excludedCharges.map((exc, i) => (
                  <li key={i}>{exc}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Instant Booking Action */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-[11px] text-slate-400">Instant Phone & WhatsApp booking confirmation</span>
            <a
              href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis%2C%20I%20want%20to%20book%20a%20${fareResult.serviceType}%20cab%20for%20Rs.${fareResult.automaticFare}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-colors text-center"
            >
              Book Cab Now via WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
