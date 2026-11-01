'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SITE_CONFIG } from '@/lib/seo';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import masterRoutesData from '@/lib/data/processed-master-routes.json';

export type BookingServiceType = 'one_way' | 'round_trip' | 'local_rental' | 'airport_transfer';
export type VehicleCategoryKey = 'sedan' | 'suv-muv' | 'executive-suv' | 'hatchback';

export interface UnifiedBookingWidgetProps {
  initialServiceType?: BookingServiceType;
  defaultOrigin?: string;
  defaultDestination?: string;
  defaultDistanceKm?: number;
  routeId?: string;
  compact?: boolean;
  className?: string;
}

interface VehicleOption {
  key: VehicleCategoryKey;
  name: string;
  models: string;
  seats: number;
  bags: number;
  badge?: string;
  outstationRatePerKm: number;
  oneWayMultiplier: number;
  minKmRoundTrip: number;
  driverAllowanceDay: number;
  airportBase: number;
  local8hPrice: number;
  local12hPrice: number;
}

const VEHICLE_OPTIONS: VehicleOption[] = [
  {
    key: 'sedan',
    name: 'Sedan',
    models: 'Dzire, Etios, Amaze',
    seats: 4,
    bags: 2,
    badge: 'Popular',
    outstationRatePerKm: 11,
    oneWayMultiplier: 13.5,
    minKmRoundTrip: 250,
    driverAllowanceDay: 400,
    airportBase: 1300,
    local8hPrice: 1800,
    local12hPrice: 2500,
  },
  {
    key: 'suv-muv',
    name: 'SUV / MUV',
    models: 'Ertiga, Carens, Triber',
    seats: 6,
    bags: 4,
    badge: 'Family Ride',
    outstationRatePerKm: 15,
    oneWayMultiplier: 17.5,
    minKmRoundTrip: 250,
    driverAllowanceDay: 400,
    airportBase: 1800,
    local8hPrice: 2500,
    local12hPrice: 3400,
  },
  {
    key: 'executive-suv',
    name: 'Innova Crysta',
    models: 'Innova Crysta, Hycross',
    seats: 7,
    bags: 5,
    badge: 'Premium Luxury',
    outstationRatePerKm: 20,
    oneWayMultiplier: 26,
    minKmRoundTrip: 300,
    driverAllowanceDay: 500,
    airportBase: 2500,
    local8hPrice: 3200,
    local12hPrice: 4500,
  },
  {
    key: 'hatchback',
    name: 'Hatchback',
    models: 'WagonR, Swift, Celerio',
    seats: 4,
    bags: 1,
    badge: 'Budget Friendly',
    outstationRatePerKm: 9,
    oneWayMultiplier: 11,
    minKmRoundTrip: 250,
    driverAllowanceDay: 300,
    airportBase: 1100,
    local8hPrice: 1600,
    local12hPrice: 2200,
  },
];

const LOCAL_RENTAL_PACKAGES = [
  { id: '4hr40km', name: '4 Hours / 40 KM', hours: 4, km: 40, isFareOnRequest: true },
  { id: '6hr60km', name: '6 Hours / 60 KM', hours: 6, km: 60, isFareOnRequest: true },
  { id: '8hr80km', name: '8 Hours / 80 KM (Half Day)', hours: 8, km: 80, isFareOnRequest: false },
  { id: '10hr100km', name: '10 Hours / 100 KM', hours: 10, km: 100, isFareOnRequest: true },
  { id: '12hr120km', name: '12 Hours / 120 KM (Full Day)', hours: 12, km: 120, isFareOnRequest: false },
];

const AIRPORTS_LIST = [
  { id: 'delhi-igi', name: 'Delhi IGI Airport (T1, T2, T3)', city: 'Delhi' },
  { id: 'noida-jewar', name: 'Noida International Airport (Jewar)', city: 'Jewar' },
];

const NCR_ZONES = [
  'Ghaziabad',
  'Noida',
  'Greater Noida',
  'Delhi (Central / South)',
  'Gurugram',
  'Faridabad',
];

// Popular cities for autocomplete
const TOP_CITIES = [
  'Delhi', 'Ghaziabad', 'Noida', 'Greater Noida', 'Gurugram', 'Faridabad',
  'Agra', 'Jaipur', 'Dehradun', 'Haridwar', 'Rishikesh', 'Nainital', 'Haldwani',
  'Mathura', 'Vrindavan', 'Lucknow', 'Chandigarh', 'Shimla', 'Manali', 'Ayodhya',
  'Amritsar', 'Bareilly', 'Moradabad', 'Meerut', 'Aligarh'
];

export default function UnifiedBookingWidget({
  initialServiceType = 'one_way',
  defaultOrigin = 'Delhi NCR',
  defaultDestination = 'Agra',
  defaultDistanceKm = 240,
  routeId = '',
  compact: _compact = false,
  className = '',
}: UnifiedBookingWidgetProps) {
  const router = useRouter();

  // Mode Selection
  const [serviceType, setServiceType] = useState<BookingServiceType>(initialServiceType);

  // Outstation Locations
  const [origin, setOrigin] = useState(defaultOrigin);
  const [destination, setDestination] = useState(defaultDestination);
  const [distanceKm, setDistanceKm] = useState(defaultDistanceKm);
  const [activeRouteId, setActiveRouteId] = useState(routeId);

  // Autocomplete UI state
  const [originSuggestions, setOriginSuggestions] = useState<string[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<string[]>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  // Local Rental Selection
  const [rentalCity, setRentalCity] = useState(defaultOrigin.includes('Airport') ? 'Delhi NCR' : defaultOrigin);
  const [selectedPackageId, setSelectedPackageId] = useState('8hr80km');

  // Airport Transfer Selection
  const [airportDirection, setAirportDirection] = useState<'drop' | 'pickup'>('drop');
  const [selectedAirport, setSelectedAirport] = useState(AIRPORTS_LIST[0].name);
  const [selectedZone, setSelectedZone] = useState('Ghaziabad');

  // Dates & Times
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [pickupDate, setPickupDate] = useState(todayStr);
  const [pickupTime, setPickupTime] = useState('06:00');
  const [returnDate, setReturnDate] = useState(todayStr);
  const [numberOfDays, setNumberOfDays] = useState(1);
  const [passengerCount, setPassengerCount] = useState(2);

  // Vehicle Category
  const [selectedVehicleKey, setSelectedVehicleKey] = useState<VehicleCategoryKey>('sedan');

  // Calculation state
  const [isLoading, setIsLoading] = useState(false);
  const [serverFare, setServerFare] = useState<{
    customerPayable: number;
    tokenAmount: number;
    balanceAmount: number;
    billableKm: number;
    baseFare: number;
    driverAllowance: number;
    isFareOnRequest: boolean;
  } | null>(null);

  // Find active vehicle option
  const selectedVehicle = useMemo(() => {
    return VEHICLE_OPTIONS.find((v) => v.key === selectedVehicleKey) || VEHICLE_OPTIONS[0];
  }, [selectedVehicleKey]);

  // Handle Location Autocomplete & Distance Lookups
  const handleOriginChange = (val: string) => {
    setOrigin(val);
    if (val.trim().length > 0) {
      const filtered = TOP_CITIES.filter((c) => c.toLowerCase().includes(val.toLowerCase()));
      setOriginSuggestions(filtered);
      setShowOriginDropdown(filtered.length > 0);
    } else {
      setShowOriginDropdown(false);
    }
    matchKnownRoute(val, destination);
  };

  const handleDestinationChange = (val: string) => {
    setDestination(val);
    if (val.trim().length > 0) {
      const filtered = TOP_CITIES.filter((c) => c.toLowerCase().includes(val.toLowerCase()));
      setDestSuggestions(filtered);
      setShowDestDropdown(filtered.length > 0);
    } else {
      setShowDestDropdown(false);
    }
    matchKnownRoute(origin, val);
  };

  const matchKnownRoute = (orig: string, dest: string) => {
    const origClean = orig.toLowerCase().trim();
    const destClean = dest.toLowerCase().trim();
    const match = masterRoutesData.find(
      (mr) =>
        (mr.originName.toLowerCase().includes(origClean) || origClean.includes(mr.originName.toLowerCase())) &&
        (mr.destName.toLowerCase().includes(destClean) || destClean.includes(mr.destName.toLowerCase()))
    );

    if (match) {
      setDistanceKm(match.estimated_distance_km);
      setActiveRouteId(match.id);
    }
  };

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
    matchKnownRoute(destination, temp);
  };

  // Date constraints
  const handlePickupDateChange = (val: string) => {
    if (val < todayStr) return;
    setPickupDate(val);
    if (returnDate < val) {
      setReturnDate(val);
      setNumberOfDays(1);
    } else {
      const diff = Math.max(1, Math.ceil((new Date(val).getTime() - new Date(val).getTime()) / (1000 * 60 * 60 * 24)) + 1);
      setNumberOfDays(diff);
    }
  };

  const handleReturnDateChange = (val: string) => {
    if (val < pickupDate) return;
    setReturnDate(val);
    const d1 = new Date(pickupDate);
    const d2 = new Date(val);
    const diffDays = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    setNumberOfDays(diffDays);
  };

  // Synchronize Live Fare Calculation
  useEffect(() => {
    let isCancelled = false;

    async function fetchLiveFare() {
      setIsLoading(true);

      try {
        const payload: Record<string, any> = {
          serviceType,
          categoryId: selectedVehicleKey,
        };

        if (serviceType === 'one_way') {
          payload.routeId = activeRouteId;
          payload.actualDistanceKm = distanceKm;
        } else if (serviceType === 'round_trip') {
          payload.actualDistanceKm = distanceKm * 2;
          payload.numberOfDays = numberOfDays;
          payload.numberOfNights = Math.max(0, numberOfDays - 1);
        } else if (serviceType === 'local_rental') {
          payload.packageId = selectedPackageId;
          const pkg = LOCAL_RENTAL_PACKAGES.find((p) => p.id === selectedPackageId);
          if (pkg && pkg.isFareOnRequest) {
            setServerFare({
              customerPayable: 0,
              tokenAmount: 0,
              balanceAmount: 0,
              billableKm: pkg.km,
              baseFare: 0,
              driverAllowance: 0,
              isFareOnRequest: true,
            });
            setIsLoading(false);
            return;
          }
        } else if (serviceType === 'airport_transfer') {
          payload.airportLocationId = selectedAirport;
          payload.cityZoneLocationId = selectedZone;
          payload.actualDistanceKm = 40;
        }

        const res = await fetch('/api/public/calculate-fare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!isCancelled) {
          if (res.ok && data.success && data.fare && !data.isFareOnRequest) {
            setServerFare({
              customerPayable: data.fare.customerPayable,
              tokenAmount: data.fare.tokenAmount,
              balanceAmount: data.fare.balanceAmount,
              billableKm: data.fare.billableKm,
              baseFare: data.fare.baseFare,
              driverAllowance: data.fare.driverAllowance || 0,
              isFareOnRequest: false,
            });
          } else {
            // Check fallback for local rental or client estimation
            if (serviceType === 'local_rental') {
              const pkg = LOCAL_RENTAL_PACKAGES.find((p) => p.id === selectedPackageId);
              if (pkg && !pkg.isFareOnRequest) {
                const price = pkg.hours === 8 ? selectedVehicle.local8hPrice : selectedVehicle.local12hPrice;
                const token = Math.round(price * 0.30);
                setServerFare({
                  customerPayable: price,
                  tokenAmount: token,
                  balanceAmount: price - token,
                  billableKm: pkg.km,
                  baseFare: price,
                  driverAllowance: 0,
                  isFareOnRequest: false,
                });
              } else {
                setServerFare({
                  customerPayable: 0,
                  tokenAmount: 0,
                  balanceAmount: 0,
                  billableKm: 0,
                  baseFare: 0,
                  driverAllowance: 0,
                  isFareOnRequest: true,
                });
              }
            } else {
              setServerFare({
                customerPayable: 0,
                tokenAmount: 0,
                balanceAmount: 0,
                billableKm: 0,
                baseFare: 0,
                driverAllowance: 0,
                isFareOnRequest: true,
              });
            }
          }
        }
      } catch {
        if (!isCancelled) {
          setServerFare({
            customerPayable: 0,
            tokenAmount: 0,
            balanceAmount: 0,
            billableKm: 0,
            baseFare: 0,
            driverAllowance: 0,
            isFareOnRequest: true,
          });
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    fetchLiveFare();

    return () => {
      isCancelled = true;
    };
  }, [
    serviceType,
    selectedVehicleKey,
    activeRouteId,
    distanceKm,
    numberOfDays,
    selectedPackageId,
    selectedAirport,
    selectedZone,
    selectedVehicle,
  ]);

  // Estimated Highway Fastag Toll
  const estimatedHighwayToll = useMemo(() => {
    if (serviceType === 'one_way') return Math.round(distanceKm * 1.6);
    if (serviceType === 'round_trip') return Math.round(distanceKm * 2 * 1.5);
    return 0;
  }, [serviceType, distanceKm]);

  // Navigation to Checkout
  const handleProceedCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    let pickupParam = origin;
    let dropParam = destination;

    if (serviceType === 'local_rental') {
      pickupParam = `${rentalCity} (${selectedPackageId})`;
      dropParam = 'Local NCR Disposal';
    } else if (serviceType === 'airport_transfer') {
      if (airportDirection === 'drop') {
        pickupParam = selectedZone;
        dropParam = selectedAirport;
      } else {
        pickupParam = selectedAirport;
        dropParam = selectedZone;
      }
    }

    const query = new URLSearchParams({
      serviceType,
      categoryId: selectedVehicleKey,
      pickup: pickupParam,
      drop: dropParam,
      date: `${pickupDate}T${pickupTime}`,
      km: String(serverFare?.billableKm || distanceKm),
      routeId: activeRouteId || '',
      packageId: serviceType === 'local_rental' ? selectedPackageId : '',
    });

    router.push(`/checkout?${query.toString()}`);
  };

  // WhatsApp Enquiry Link Generation
  const whatsAppUrl = useMemo(() => {
    let pickupText = origin;
    let dropText = destination;

    if (serviceType === 'local_rental') {
      pickupText = rentalCity;
      dropText = selectedPackageId;
    } else if (serviceType === 'airport_transfer') {
      pickupText = airportDirection === 'drop' ? selectedZone : selectedAirport;
      dropText = airportDirection === 'drop' ? selectedAirport : selectedZone;
    }

    return generateWhatsAppLink(SITE_CONFIG.whatsapp, {
      tripType: serviceType,
      pickupCity: pickupText,
      dropCity: dropText,
      pickupDate: `${pickupDate} at ${pickupTime}`,
      returnDate: serviceType === 'round_trip' ? returnDate : undefined,
      vehicleType: selectedVehicle.name,
      totalFare: serverFare && !serverFare.isFareOnRequest ? serverFare.customerPayable : undefined,
      tokenAmount: serverFare && !serverFare.isFareOnRequest ? serverFare.tokenAmount : undefined,
    });
  }, [
    serviceType,
    origin,
    destination,
    rentalCity,
    selectedPackageId,
    airportDirection,
    selectedZone,
    selectedAirport,
    pickupDate,
    pickupTime,
    returnDate,
    selectedVehicle,
    serverFare,
  ]);

  return (
    <div
      className={`bg-white text-slate-900 rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl max-w-5xl mx-auto font-sans relative z-10 border border-slate-100 ${className}`}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <span className="inline-block px-3 py-1 bg-brand-blue/10 text-brand-blue font-bold text-xs rounded-full uppercase tracking-wider mb-2">
          Urgent Taxis Official Booking Engine
        </span>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-blue">
          Book Your Ride & Get Instant Fare
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          Verified All-Inclusive Cabs • 30% Token Confirmation • 70% Balance on Trip
        </p>
      </div>

      {/* 4 Service Tabs (MakeMyTrip / Savaari Pattern) */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 max-w-fit mx-auto shadow-sm">
        <button
          type="button"
          onClick={() => setServiceType('one_way')}
          className={`py-2.5 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            serviceType === 'one_way'
              ? 'bg-brand-blue text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <span>➔</span> One Way Drop
        </button>

        <button
          type="button"
          onClick={() => setServiceType('round_trip')}
          className={`py-2.5 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            serviceType === 'round_trip'
              ? 'bg-brand-blue text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <span>🔄</span> Round Trip
        </button>

        <button
          type="button"
          onClick={() => setServiceType('local_rental')}
          className={`py-2.5 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            serviceType === 'local_rental'
              ? 'bg-brand-blue text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <span>⏱️</span> Hourly Rental
        </button>

        <button
          type="button"
          onClick={() => setServiceType('airport_transfer')}
          className={`py-2.5 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            serviceType === 'airport_transfer'
              ? 'bg-brand-blue text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <span>✈️</span> Airport Cabs
        </button>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleProceedCheckout} className="space-y-6">
        {/* Dynamic Route & Location Row */}
        {(serviceType === 'one_way' || serviceType === 'round_trip') && (
          <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center relative">
            {/* Origin Input */}
            <div className="md:col-span-5 relative">
              <label className="block text-slate-700 font-bold mb-1.5 text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Pickup Location
              </label>
              <input
                type="text"
                value={origin}
                onChange={(e) => handleOriginChange(e.target.value)}
                onFocus={() => setShowOriginDropdown(originSuggestions.length > 0)}
                placeholder="Enter pickup city or locality..."
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3.5 font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue shadow-sm"
                required
              />
              {showOriginDropdown && (
                <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto py-1">
                  {originSuggestions.map((city) => (
                    <li
                      key={city}
                      onClick={() => {
                        setOrigin(city);
                        setShowOriginDropdown(false);
                        matchKnownRoute(city, destination);
                      }}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer font-medium text-xs text-slate-800"
                    >
                      📍 {city}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Swap Button */}
            <div className="md:col-span-1 flex justify-center py-1">
              <button
                type="button"
                onClick={handleSwap}
                title="Swap Pickup and Drop Locations"
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-brand-blue hover:text-white border border-slate-300 text-slate-700 flex items-center justify-center transition-all shadow-sm cursor-pointer"
              >
                ⇄
              </button>
            </div>

            {/* Destination Input */}
            <div className="md:col-span-5 relative">
              <label className="block text-slate-700 font-bold mb-1.5 text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Drop Destination
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => handleDestinationChange(e.target.value)}
                onFocus={() => setShowDestDropdown(destSuggestions.length > 0)}
                placeholder="Enter drop destination..."
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3.5 font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue shadow-sm"
                required
              />
              {showDestDropdown && (
                <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto py-1">
                  {destSuggestions.map((city) => (
                    <li
                      key={city}
                      onClick={() => {
                        setDestination(city);
                        setShowDestDropdown(false);
                        matchKnownRoute(origin, city);
                      }}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer font-medium text-xs text-slate-800"
                    >
                      🏁 {city}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Local Rental Fields */}
        {serviceType === 'local_rental' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5 text-xs">
                City / Service Area
              </label>
              <input
                type="text"
                value={rentalCity}
                onChange={(e) => setRentalCity(e.target.value)}
                placeholder="e.g. Ghaziabad, Noida, Delhi NCR"
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3.5 font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1.5 text-xs">
                Rental Package Duration & Distance
              </label>
              <select
                value={selectedPackageId}
                onChange={(e) => setSelectedPackageId(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3.5 font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue shadow-sm"
              >
                {LOCAL_RENTAL_PACKAGES.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} {pkg.isFareOnRequest ? '(Quote on Request)' : '• Instant Fare'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Airport Transfer Fields */}
        {serviceType === 'airport_transfer' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4 py-1">
              <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-700">
                <input
                  type="radio"
                  name="airportDir"
                  checked={airportDirection === 'drop'}
                  onChange={() => setAirportDirection('drop')}
                  className="text-brand-blue focus:ring-brand-blue"
                />
                Drop to Airport
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-700">
                <input
                  type="radio"
                  name="airportDir"
                  checked={airportDirection === 'pickup'}
                  onChange={() => setAirportDirection('pickup')}
                  className="text-brand-blue focus:ring-brand-blue"
                />
                Pickup from Airport
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5 text-xs">
                  Select Airport
                </label>
                <select
                  value={selectedAirport}
                  onChange={(e) => setSelectedAirport(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3.5 font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue shadow-sm"
                >
                  {AIRPORTS_LIST.map((a) => (
                    <option key={a.id} value={a.name}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1.5 text-xs">
                  City Zone / Pickup Locality
                </label>
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3.5 font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue shadow-sm"
                >
                  {NCR_ZONES.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Schedule & Passengers Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-slate-700 font-bold mb-1 text-xs">Pickup Date</label>
            <input
              type="date"
              min={todayStr}
              value={pickupDate}
              onChange={(e) => handlePickupDateChange(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1 text-xs">Pickup Time</label>
            <input
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue"
              required
            />
          </div>

          {serviceType === 'round_trip' ? (
            <div>
              <label className="block text-slate-700 font-bold mb-1 text-xs">Return Date</label>
              <input
                type="date"
                min={pickupDate}
                value={returnDate}
                onChange={(e) => handleReturnDateChange(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-slate-700 font-bold mb-1 text-xs">Distance (KM)</label>
              <input
                type="number"
                min="10"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-bold mb-1 text-xs">Passengers</label>
            <select
              value={passengerCount}
              onChange={(e) => setPassengerCount(Number(e.target.value))}
              className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Passenger' : 'Passengers'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Vehicle Selection Cards (MakeMyTrip / Savaari Pattern) */}
        <div>
          <label className="block text-slate-700 font-bold mb-2.5 text-xs uppercase tracking-wider">
            Select Your Cab Category
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {VEHICLE_OPTIONS.map((v) => {
              const isSelected = selectedVehicleKey === v.key;

              // Quick estimated cost for this category
              let estimatedCost = 0;
              if (serviceType === 'one_way') {
                estimatedCost = Math.round(distanceKm * v.oneWayMultiplier);
              } else if (serviceType === 'round_trip') {
                const billable = Math.max(distanceKm * 2, v.minKmRoundTrip * numberOfDays);
                estimatedCost = Math.round(billable * v.outstationRatePerKm + v.driverAllowanceDay * numberOfDays);
              } else if (serviceType === 'local_rental') {
                estimatedCost = selectedPackageId === '12hr120km' ? v.local12hPrice : v.local8hPrice;
              } else if (serviceType === 'airport_transfer') {
                estimatedCost = v.airportBase;
              }

              return (
                <div
                  key={v.key}
                  onClick={() => setSelectedVehicleKey(v.key)}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-brand-blue bg-blue-50/40 shadow-md ring-2 ring-brand-blue/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  {v.badge && (
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-brand-green/10 text-brand-green font-black text-[9px] rounded-full uppercase">
                      {v.badge}
                    </span>
                  )}
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{v.name}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">{v.models}</p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-600 font-semibold">
                      <span>👥 {v.seats} Seats</span>
                      <span>🧳 {v.bags} Bags</span>
                      <span>❄️ AC</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-baseline justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Estimated</span>
                    <span className="font-black text-slate-900 font-mono text-base">
                      ₹{estimatedCost > 0 ? estimatedCost.toLocaleString('en-IN') : 'Quote'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Calculation Output / Breakdown Section */}
        {isLoading ? (
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center animate-pulse space-y-2">
            <div className="h-6 bg-slate-200 rounded-md w-1/3 mx-auto"></div>
            <div className="h-4 bg-slate-200 rounded-md w-1/2 mx-auto"></div>
          </div>
        ) : serverFare && serverFare.isFareOnRequest ? (
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-3 text-center shadow-sm">
            <p className="font-bold text-sm text-amber-700">Fare Available Upon Instant Request</p>
            <p className="text-amber-800/90 leading-relaxed max-w-lg mx-auto">
              This package duration or specialized route requires manual dispatch confirmation for peak-hour driver allocation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 bg-brand-green hover:bg-brand-green-hover text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                💬 Request Instant Quote on WhatsApp
              </a>
              <a
                href={`tel:${SITE_CONFIG.phoneRaw}`}
                className="w-full sm:w-auto px-6 py-3 bg-brand-blue hover:bg-brand-blue-hover text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                📞 Call {SITE_CONFIG.phone}
              </a>
            </div>
          </div>
        ) : serverFare && serverFare.customerPayable > 0 ? (
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 shadow-sm">
            {/* Top Fare Summary Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500">
                  Total Cab Fare (Fuel & Driver Included)
                </span>
                <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                  ₹{serverFare.customerPayable.toLocaleString('en-IN')}
                </div>
              </div>

              {/* 30% Token & 70% Balance Badges */}
              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-center">
                  <span className="text-[10px] text-emerald-700 uppercase font-bold block">
                    30% Token Advance
                  </span>
                  <span className="font-mono font-black text-emerald-800 text-base">
                    ₹{serverFare.tokenAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl text-center">
                  <span className="text-[10px] text-blue-700 uppercase font-bold block">
                    70% Remaining
                  </span>
                  <span className="font-mono font-black text-blue-800 text-base">
                    ₹{serverFare.balanceAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics Breakdown Grid (Phase 4) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Billable KM</span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {serverFare.billableKm} KM
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Base Cab Fare</span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  ₹{serverFare.baseFare.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Est. Fastag Toll</span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {estimatedHighwayToll > 0 ? `~₹${estimatedHighwayToll}` : 'Actuals'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Driver Allowance</span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {serverFare.driverAllowance > 0 ? `₹${serverFare.driverAllowance}` : 'Included'}
                </span>
              </div>
            </div>

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div className="space-y-1">
                <span className="text-brand-green font-bold flex items-center gap-1">
                  ✓ Included in Quoted Fare:
                </span>
                <p className="text-slate-600 font-medium">
                  Vehicle rental, fuel cost, chauffeur allowance, and passenger pickup.
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-amber-700 font-bold flex items-center gap-1">
                  ⚠️ Payable at Actuals during trip:
                </span>
                <p className="text-slate-600 font-medium">
                  Fastag highway tolls, interstate state entrance taxes, and parking fees.
                </p>
              </div>
            </div>

            {/* CTA Buttons Row */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
              <div className="text-xs text-slate-500 font-medium">
                Official 30% advance secures your cab • 100% refund on cancellation up to 6 hours before trip
              </div>

              <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3.5 bg-brand-blue hover:bg-brand-blue-hover text-white font-black text-sm rounded-xl shadow-lg shadow-brand-blue/20 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  Book Online (30% Token) ➔
                </button>
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-3.5 bg-brand-green hover:bg-brand-green-hover text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-center"
                >
                  💬 Book on WhatsApp
                </a>
              </div>
            </div>
          </div>
        ) : null}

        {/* Bottom Fallback Button if no fare displayed */}
        {(!serverFare || serverFare.customerPayable === 0) && (
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-4 bg-brand-blue hover:bg-brand-blue-hover text-white font-black text-sm rounded-xl shadow-lg shadow-brand-blue/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Check Availability & Book ➔
            </button>
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-4 bg-brand-green hover:bg-brand-green-hover text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-center"
            >
              💬 WhatsApp Fast Booking
            </a>
          </div>
        )}
      </form>
    </div>
  );
}
