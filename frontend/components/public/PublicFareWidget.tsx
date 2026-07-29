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
import { generateWhatsAppLink } from '@/lib/whatsapp';

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
    <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-5xl mx-auto font-sans relative z-10 border border-slate-100 mt-[-40px]">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-blue">Book Your Ride</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Get Instant Price & Book Your Taxi</p>
      </div>

      {/* Service Type Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 max-w-fit mx-auto shadow-sm">
        <button
          type="button"
          onClick={() => { setServiceType('one_way'); setFareResult(null); setIsFareOnRequest(false); }}
          className={`py-2.5 px-5 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center flex items-center gap-2 ${
            serviceType === 'one_way'
              ? 'bg-brand-blue text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>➔</span> One Way
        </button>
        <button
          type="button"
          onClick={() => { setServiceType('round_trip'); setFareResult(null); setIsFareOnRequest(false); }}
          className={`py-2.5 px-5 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center flex items-center gap-2 ${
            serviceType === 'round_trip'
              ? 'bg-brand-blue text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>🔄</span> Round Trip
        </button>
        <button
          type="button"
          onClick={() => { setServiceType('local_rental'); setFareResult(null); setIsFareOnRequest(false); }}
          className={`py-2.5 px-5 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center flex items-center gap-2 ${
            serviceType === 'local_rental'
              ? 'bg-brand-blue text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>🚘</span> Local Rental
        </button>
        <button
          type="button"
          onClick={() => { setServiceType('airport_transfer'); setFareResult(null); setIsFareOnRequest(false); }}
          className={`py-2.5 px-5 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center flex items-center gap-2 ${
            serviceType === 'airport_transfer'
              ? 'bg-brand-blue text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>✈</span> Airport
        </button>
      </div>

      {/* Booking Search Form */}
      <form onSubmit={handleCalculateFare} className="space-y-5 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Dynamic Field 1: Route / Location */}
          {serviceType === 'one_way' && (
            <div className="md:col-span-2">
              <label className="block text-slate-700 font-bold mb-1.5 text-xs">Select Route</label>
              <select
                value={routeId}
                onChange={(e) => {
                  setRouteId(e.target.value);
                  const selectedRoute = routes.find((r) => r.id === e.target.value);
                  if (selectedRoute) setActualDistanceKm(Number(selectedRoute.estimated_distance_km));
                }}
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3.5 font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue shadow-sm transition-shadow"
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
              <label className="block text-slate-700 font-bold mb-1.5 text-xs">Select Rental Package</label>
              <select
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3.5 font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue shadow-sm transition-shadow"
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
                <label className="block text-slate-700 font-bold mb-1.5 text-xs">Airport</label>
                <select
                  value={airportLocId}
                  onChange={(e) => setAirportLocId(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3.5 font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue shadow-sm transition-shadow"
                >
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.city})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1.5 text-xs">City Zone</label>
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
                <label className="block text-slate-700 font-bold mb-1.5 text-xs">Trip Distance (KM)</label>
                <input
                  type="number"
                  min="10"
                  value={actualDistanceKm}
                  onChange={(e) => setActualDistanceKm(Number(e.target.value))}
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3.5 font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue shadow-sm transition-shadow"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1.5 text-xs">Days</label>
                <input
                  type="number"
                  min="1"
                  value={numberOfDays}
                  onChange={(e) => setNumberOfDays(Number(e.target.value))}
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3.5 font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue shadow-sm transition-shadow"
                />
              </div>
            </div>
          )}

          {/* Vehicle Category */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5 text-xs">Vehicle Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3.5 font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue shadow-sm transition-shadow"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-3 flex flex-col items-center gap-3">
          <button
            type="submit"
            className="w-full py-4 bg-brand-green hover:bg-brand-green-hover text-white font-extrabold text-base rounded-2xl shadow-lg shadow-brand-green/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? <span>Calculating...</span> : <><span>Search Cabs</span><span>➔</span></>}
          </button>
          <span className="text-[12px] font-semibold text-slate-500 flex items-center gap-1">
            ⚡ Instant Price & WhatsApp Confirmation
          </span>
        </div>
      </form>

      {/* FARE ON REQUEST FALLBACK */}
      {isFareOnRequest && (
        <div className="mt-8 p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-3 text-center shadow-sm">
          <p className="font-bold text-sm text-amber-700">Fare Available Upon Instant Request</p>
          <p className="text-amber-800/90 leading-relaxed max-w-lg mx-auto">
            This route, vehicle category, or custom package requires manual dispatch confirmation for peak-hour or specialized vehicle availability.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href={generateWhatsAppLink(SITE_CONFIG.whatsapp, { customMessage: 'Hello Urgent Taxis! 👋\n\nI need a *Fare Quote* for my upcoming trip. 🚖' })}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 bg-brand-green hover:bg-brand-green-hover text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              💬 Request Quote on WhatsApp
            </a>
            <a
              href={`tel:${SITE_CONFIG.phoneRaw}`}
              className="w-full sm:w-auto px-6 py-3 bg-brand-blue hover:bg-brand-blue-light text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              📞 Call {SITE_CONFIG.phone}
            </a>
          </div>
        </div>
      )}

      {/* FARE CALCULATION DTO RESULT DISPLAY */}
      {fareResult && (
        <div className="mt-8 p-6 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-green">Guaranteed Automated Quotation</span>
              <h3 className="text-xl font-black text-brand-blue capitalize">{fareResult.serviceType.replace('_', ' ')} Service</h3>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Payable</span>
              <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">₹{fareResult.customerPayable.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 bg-brand-blue/5 p-4 rounded-xl border border-brand-blue/10">
            <div className="flex-1">
              <span className="text-[10px] text-brand-blue block uppercase font-bold mb-0.5">Booking Token (25%)</span>
              <span className="text-lg font-black text-brand-blue font-mono tracking-tight">₹{fareResult.tokenAmount.toLocaleString('en-IN')}</span>
              <p className="text-[10px] text-slate-600 font-medium leading-tight mt-1">Pay now to confirm</p>
            </div>
            <div className="w-px bg-brand-blue/10 hidden sm:block"></div>
            <div className="flex-1">
              <span className="text-[10px] text-slate-600 block uppercase font-bold mb-0.5">Balance Amount</span>
              <span className="text-lg font-black text-slate-700 font-mono tracking-tight">₹{fareResult.balanceAmount.toLocaleString('en-IN')}</span>
              <p className="text-[10px] text-slate-600 font-medium leading-tight mt-1">Payable to driver</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold mb-0.5">Billable Distance</span>
              <span className="font-mono font-bold text-slate-800 text-sm">{fareResult.billableKm} KM</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold mb-0.5">Base Fare</span>
              <span className="font-mono font-bold text-slate-800 text-sm">₹{fareResult.baseFare}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold mb-0.5">Distance Charge</span>
              <span className="font-mono font-bold text-slate-800 text-sm">₹{fareResult.distanceCharge}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold mb-0.5">Surge Charge</span>
              <span className="font-mono font-bold text-slate-800 text-sm">₹{fareResult.dynamicSurgeAmount}</span>
            </div>
          </div>

          {/* Included / Excluded Items List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs pt-2">
            <div className="space-y-2">
              <span className="text-brand-green font-bold block flex items-center gap-1.5"><span className="text-sm">✓</span> Included in Quote:</span>
              <ul className="list-disc list-inside text-slate-600 space-y-1 font-medium">
                {fareResult.includedCharges.map((inc, i) => (
                  <li key={i}>{inc}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <span className="text-amber-600 font-bold block flex items-center gap-1.5"><span className="text-sm">⚠️</span> Payable at Actuals:</span>
              <ul className="list-disc list-inside text-slate-600 space-y-1 font-medium">
                {fareResult.excludedCharges.map((exc, i) => (
                  <li key={i}>{exc}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 mt-2">
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-medium">Book online or instantly via WhatsApp</span>
            </div>
            
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
              <a
                href={`/checkout?serviceType=${fareResult.serviceType}&categoryId=${fareResult.categoryId}&pickup=&drop=&date=${encodeURIComponent(pickupDateTime || '')}&km=${fareResult.actualKm}&routeId=${routeId || ''}&packageId=${packageId || ''}&airportLocId=${airportLocId}&cityZoneLocId=${cityZoneLocId}`}
                className="w-full sm:w-auto px-6 py-3.5 bg-brand-blue hover:bg-brand-blue-hover text-white font-black text-sm rounded-xl shadow-lg shadow-brand-blue/20 transition-all text-center flex items-center justify-center gap-2"
              >
                Continue to Checkout
              </a>
              <a
                href={generateWhatsAppLink(SITE_CONFIG.whatsapp, { 
                  tripType: fareResult.serviceType,
                  totalFare: fareResult.customerPayable,
                  baseFare: fareResult.baseFare,
                  distance: fareResult.billableKm,
                  customMessage: 'Hello Urgent Taxis! 👋\n\nI would like to book a cab.' 
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 bg-brand-green hover:bg-brand-green-hover text-white font-black text-sm rounded-xl shadow-lg shadow-brand-green/20 transition-all text-center flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824z"/></svg>
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
