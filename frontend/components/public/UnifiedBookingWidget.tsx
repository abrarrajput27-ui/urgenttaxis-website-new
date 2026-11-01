'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
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
  image: string;
  badge?: string;
  outstationRatePerKm: number;
  oneWayMultiplier: number;
  minKmRoundTrip: number;
  driverAllowanceDay: number;
  airportBase: number;
  local8hPrice: number;
  local12hPrice: number;
  extraKmRate: number;
  extraHourRate: number;
}

const VEHICLE_OPTIONS: VehicleOption[] = [
  {
    key: 'sedan',
    name: 'Sedan',
    models: 'Dzire, Etios, Amaze',
    seats: 4,
    bags: 2,
    image: '/fleet-brand/dzire.png',
    badge: 'Most Popular',
    outstationRatePerKm: 11,
    oneWayMultiplier: 13.5,
    minKmRoundTrip: 250,
    driverAllowanceDay: 400,
    airportBase: 1300,
    local8hPrice: 1800,
    local12hPrice: 2500,
    extraKmRate: 11,
    extraHourRate: 180,
  },
  {
    key: 'suv-muv',
    name: 'SUV / MUV',
    models: 'Ertiga, Carens, Triber',
    seats: 6,
    bags: 4,
    image: '/fleet-brand/Ertiga.png',
    badge: 'Family Ride',
    outstationRatePerKm: 15,
    oneWayMultiplier: 17.5,
    minKmRoundTrip: 250,
    driverAllowanceDay: 400,
    airportBase: 1800,
    local8hPrice: 2500,
    local12hPrice: 3400,
    extraKmRate: 15,
    extraHourRate: 220,
  },
  {
    key: 'executive-suv',
    name: 'Innova Crysta',
    models: 'Innova Crysta, Hycross',
    seats: 7,
    bags: 5,
    image: '/fleet-brand/Innova Crysta.png',
    badge: 'Premium Luxury',
    outstationRatePerKm: 20,
    oneWayMultiplier: 26,
    minKmRoundTrip: 300,
    driverAllowanceDay: 500,
    airportBase: 2500,
    local8hPrice: 3200,
    local12hPrice: 4500,
    extraKmRate: 20,
    extraHourRate: 300,
  },
  {
    key: 'hatchback',
    name: 'Hatchback',
    models: 'WagonR, Swift, Celerio',
    seats: 4,
    bags: 2,
    image: '/fleet-brand/Hatchback.png',
    badge: 'Budget Value',
    outstationRatePerKm: 9,
    oneWayMultiplier: 11,
    minKmRoundTrip: 250,
    driverAllowanceDay: 300,
    airportBase: 1100,
    local8hPrice: 1600,
    local12hPrice: 2200,
    extraKmRate: 10,
    extraHourRate: 150,
  },
];

const LOCAL_RENTAL_PACKAGES = [
  { id: '4hr40km', name: '4 Hours / 40 KM', hours: 4, km: 40, isFareOnRequest: true },
  { id: '6hr60km', name: '6 Hours / 60 KM', hours: 6, km: 60, isFareOnRequest: true },
  { id: '8hr80km', name: '8 Hours / 80 KM', hours: 8, km: 80, isFareOnRequest: false },
  { id: '10hr100km', name: '10 Hours / 100 KM', hours: 10, km: 100, isFareOnRequest: true },
  { id: '12hr120km', name: '12 Hours / 120 KM', hours: 12, km: 120, isFareOnRequest: false },
];

const TOP_CITIES = [
  'Delhi',
  'Ghaziabad',
  'Noida',
  'Greater Noida',
  'Gurugram',
  'Faridabad',
  'Agra',
  'Haridwar',
  'Rishikesh',
  'Dehradun',
  'Jaipur',
  'Chandigarh',
  'Haldwani',
  'Nainital',
  'Mathura',
  'Vrindavan',
  'Shimla',
  'Manali',
  'Lucknow',
  'Ayodhya',
  'Meerut',
];

const AIRPORTS_LIST = [
  { id: 'delhi-igi', name: 'Delhi IGI Airport (T1, T2, T3)' },
  { id: 'noida-jewar', name: 'Noida International Airport (Jewar)' },
];

const AIRPORT_ZONES = [
  'Ghaziabad',
  'Noida',
  'Greater Noida',
  'East Delhi',
  'South Delhi',
  'West Delhi',
  'North Delhi',
  'Gurugram',
  'Faridabad',
  'Meerut',
];

export default function UnifiedBookingWidget({
  initialServiceType = 'one_way',
  defaultOrigin = '',
  defaultDestination = '',
  defaultDistanceKm = 0,
  routeId = '',
  compact: _compact = false,
  className = '',
}: UnifiedBookingWidgetProps) {
  const router = useRouter();

  // Mode Selection
  const [serviceType, setServiceType] = useState<BookingServiceType>(initialServiceType);

  // STRICT REQUIREMENT: Pickup & drop blank by default
  const [origin, setOrigin] = useState(defaultOrigin || '');
  const [destination, setDestination] = useState(defaultDestination || '');
  const [distanceKm, setDistanceKm] = useState(defaultDistanceKm || 0);
  const [activeRouteId, setActiveRouteId] = useState(routeId || '');
  const [validationError, setValidationError] = useState('');

  // Autocomplete UI state
  const [originSuggestions, setOriginSuggestions] = useState<string[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<string[]>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  // Local Rental Selection
  const [rentalCity, setRentalCity] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState('8hr80km');

  // Airport Transfer Selection
  const [airportDirection, setAirportDirection] = useState<'drop' | 'pickup'>('drop');
  const [selectedAirport, setSelectedAirport] = useState(AIRPORTS_LIST[0].name);
  const [selectedZone, setSelectedZone] = useState('');

  // Dates & Times
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [pickupDate, setPickupDate] = useState(todayStr);
  const [pickupTime, setPickupTime] = useState('06:00');
  const [returnDate, setReturnDate] = useState(todayStr);
  const [numberOfDays, setNumberOfDays] = useState(1);
  const [passengerCount, setPassengerCount] = useState(2);

  // Vehicle Category
  const [selectedVehicleKey, setSelectedVehicleKey] = useState<VehicleCategoryKey>('sedan');

  // MakeMyTrip-Style Fare Breakup & Terms Modal/Accordion State
  const [showFareBreakupModal, setShowFareBreakupModal] = useState(false);
  const [activeBreakupTab, setActiveBreakupTab] = useState<'breakup' | 'inclusions' | 'terms'>('breakup');

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

  const matchKnownRoute = useCallback((orig: string, dest: string) => {
    const origClean = orig.toLowerCase().trim();
    const destClean = dest.toLowerCase().trim();
    if (!origClean || !destClean) {
      setDistanceKm(0);
      setActiveRouteId('');
      return;
    }

    const match = masterRoutesData.find(
      (mr) =>
        (mr.originName.toLowerCase().includes(origClean) || origClean.includes(mr.originName.toLowerCase())) &&
        (mr.destName.toLowerCase().includes(destClean) || destClean.includes(mr.destName.toLowerCase()))
    );

    if (match) {
      setDistanceKm(match.estimated_distance_km);
      setActiveRouteId(match.id);
    } else {
      // Default baseline distance of 200 km if both are specified but unindexed
      setDistanceKm((prev) => (prev > 0 ? prev : 200));
    }
  }, []);

  // Synchronize incoming props (e.g. from dedicated route pages or city pages)
  useEffect(() => {
    if (defaultOrigin) setOrigin(defaultOrigin);
    if (defaultDestination) setDestination(defaultDestination);
    if (defaultDistanceKm && defaultDistanceKm > 0) {
      setDistanceKm(defaultDistanceKm);
    } else if (defaultOrigin && defaultDestination) {
      matchKnownRoute(defaultOrigin, defaultDestination);
    }
    if (routeId) setActiveRouteId(routeId);
    if (initialServiceType) setServiceType(initialServiceType);
  }, [defaultOrigin, defaultDestination, defaultDistanceKm, routeId, initialServiceType, matchKnownRoute]);

  // Find active vehicle option
  const selectedVehicle = useMemo(() => {
    return VEHICLE_OPTIONS.find((v) => v.key === selectedVehicleKey) || VEHICLE_OPTIONS[0];
  }, [selectedVehicleKey]);

  // Handle Location Autocomplete & Distance Lookups
  const handleOriginChange = (val: string) => {
    setOrigin(val);
    setValidationError('');
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
    setValidationError('');
    if (val.trim().length > 0) {
      const filtered = TOP_CITIES.filter((c) => c.toLowerCase().includes(val.toLowerCase()));
      setDestSuggestions(filtered);
      setShowDestDropdown(filtered.length > 0);
    } else {
      setShowDestDropdown(false);
    }
    matchKnownRoute(origin, val);
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
      // For outstation, wait until both locations are provided
      if ((serviceType === 'one_way' || serviceType === 'round_trip') && (!origin.trim() || !destination.trim())) {
        setServerFare(null);
        return;
      }

      setIsLoading(true);

      try {
        const payload: Record<string, any> = {
          serviceType,
          categoryId: selectedVehicleKey,
        };

        if (serviceType === 'one_way') {
          payload.routeId = activeRouteId;
          payload.actualDistanceKm = distanceKm > 0 ? distanceKm : 200;
        } else if (serviceType === 'round_trip') {
          const tripKm = distanceKm > 0 ? distanceKm * 2 : 400;
          payload.actualDistanceKm = tripKm;
          payload.numberOfDays = numberOfDays;
          payload.numberOfNights = Math.max(0, numberOfDays - 1);
        } else if (serviceType === 'local_rental') {
          payload.packageId = selectedPackageId;
          const pkg = LOCAL_RENTAL_PACKAGES.find((p) => p.id === selectedPackageId);
          if (pkg) {
            payload.durationHours = pkg.hours;
            payload.actualDistanceKm = pkg.km;
            if (pkg.isFareOnRequest) {
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
          }
        } else if (serviceType === 'airport_transfer') {
          payload.airportLocationId = selectedAirport;
          payload.cityZoneLocationId = selectedZone || 'Ghaziabad';
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
            // Check fallback for local rental
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
            } else if (serviceType === 'airport_transfer') {
              const price = selectedVehicle.airportBase;
              const token = Math.round(price * 0.30);
              setServerFare({
                customerPayable: price,
                tokenAmount: token,
                balanceAmount: price - token,
                billableKm: 40,
                baseFare: price,
                driverAllowance: 0,
                isFareOnRequest: false,
              });
            } else {
              setServerFare(null);
            }
          }
        }
      } catch (err) {
        console.warn('Live fare sync encountered error, applying local fallback:', err);
        if (!isCancelled) {
          if (serviceType === 'one_way' && distanceKm > 0) {
            const price = Math.round(distanceKm * selectedVehicle.oneWayMultiplier);
            const token = Math.round(price * 0.30);
            setServerFare({
              customerPayable: price,
              tokenAmount: token,
              balanceAmount: price - token,
              billableKm: distanceKm,
              baseFare: price,
              driverAllowance: 0,
              isFareOnRequest: false,
            });
          } else if (serviceType === 'round_trip' && distanceKm > 0) {
            const billable = Math.max(distanceKm * 2, selectedVehicle.minKmRoundTrip * numberOfDays);
            const driverAllow = selectedVehicle.driverAllowanceDay * numberOfDays;
            const price = Math.round(billable * selectedVehicle.outstationRatePerKm + driverAllow);
            const token = Math.round(price * 0.30);
            setServerFare({
              customerPayable: price,
              tokenAmount: token,
              balanceAmount: price - token,
              billableKm: billable,
              baseFare: price - driverAllow,
              driverAllowance: driverAllow,
              isFareOnRequest: false,
            });
          }
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchLiveFare();

    return () => {
      isCancelled = true;
    };
  }, [
    serviceType,
    selectedVehicleKey,
    selectedVehicle,
    origin,
    destination,
    distanceKm,
    activeRouteId,
    numberOfDays,
    selectedPackageId,
    selectedAirport,
    selectedZone,
  ]);

  // Fastag Highway Toll Estimate
  const estimatedHighwayToll = useMemo(() => {
    if (serviceType === 'one_way') {
      return Math.round((distanceKm / 100) * 120);
    }
    if (serviceType === 'round_trip') {
      return Math.round(((distanceKm * 2) / 100) * 110);
    }
    return 0;
  }, [serviceType, distanceKm]);

  // Construct WhatsApp Inquiry Link
  const whatsAppUrl = useMemo(() => {
    let serviceLabel = 'One-Way Outstation Taxi';
    let tripDetails = `Pickup: ${origin || '[Specify Location]'}\nDrop: ${destination || '[Specify Location]'}\nDistance: ${distanceKm || 0} km`;

    if (serviceType === 'round_trip') {
      serviceLabel = 'Round-Trip Outstation Taxi';
      tripDetails = `Route: ${origin || '[Origin]'} ⇄ ${destination || '[Destination]'}\nDuration: ${numberOfDays} Days\nPickup Date: ${pickupDate}\nReturn Date: ${returnDate}`;
    } else if (serviceType === 'local_rental') {
      const pkg = LOCAL_RENTAL_PACKAGES.find((p) => p.id === selectedPackageId);
      serviceLabel = `Local Hourly Rental (${pkg?.name})`;
      tripDetails = `City: ${rentalCity || 'Ghaziabad / NCR'}\nPackage: ${pkg?.name}\nPickup Date: ${pickupDate} at ${pickupTime}`;
    } else if (serviceType === 'airport_transfer') {
      serviceLabel = 'Airport Transfer';
      tripDetails = `Direction: ${airportDirection === 'drop' ? 'City Drop to Airport' : 'Airport Pickup to City'}\nAirport: ${selectedAirport}\nZone: ${selectedZone || 'Ghaziabad'}\nPickup: ${pickupDate} at ${pickupTime}`;
    }

    return generateWhatsAppLink({
      tripType: serviceLabel,
      origin: origin || rentalCity || selectedZone || 'Ghaziabad',
      destination: destination || selectedAirport || 'Airport / Destination',
      category: selectedVehicle.name,
      baseFare: serverFare && !serverFare.isFareOnRequest ? serverFare.baseFare : undefined,
      totalFare: serverFare && !serverFare.isFareOnRequest ? serverFare.customerPayable : undefined,
      tokenAmount: serverFare && !serverFare.isFareOnRequest ? serverFare.tokenAmount : undefined,
      balanceAmount: serverFare && !serverFare.isFareOnRequest ? serverFare.balanceAmount : undefined,
      customMessage: `Hello Urgent Taxis! 🚖\n\nI want to book a cab with the following details:\n\n• Service: ${serviceLabel}\n• Vehicle: ${selectedVehicle.name} (${selectedVehicle.models})\n${tripDetails}\n• Estimated Total: ${
        serverFare && !serverFare.isFareOnRequest ? '₹' + serverFare.customerPayable.toLocaleString('en-IN') : 'Quote on Request'
      }\n• Advance to Confirm (30%): ${
        serverFare && !serverFare.isFareOnRequest ? '₹' + serverFare.tokenAmount.toLocaleString('en-IN') : '30% Policy'
      }\n\nPlease confirm vehicle availability.`,
    });
  }, [
    serviceType,
    origin,
    destination,
    distanceKm,
    numberOfDays,
    pickupDate,
    pickupTime,
    returnDate,
    rentalCity,
    selectedPackageId,
    airportDirection,
    selectedAirport,
    selectedZone,
    selectedVehicle,
    serverFare,
  ]);

  // Submit Handler -> Navigate to Checkout with validated params
  const handleProceedToCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (serviceType === 'one_way' || serviceType === 'round_trip') {
      if (!origin.trim() || !destination.trim()) {
        setValidationError('Please enter both pickup and drop locations to proceed.');
        return;
      }
    } else if (serviceType === 'local_rental') {
      if (!rentalCity.trim()) {
        setValidationError('Please select a city for your local hourly rental.');
        return;
      }
    } else if (serviceType === 'airport_transfer') {
      if (!selectedZone.trim()) {
        setValidationError('Please select your pickup or drop zone area.');
        return;
      }
    }

    setValidationError('');

    const query = new URLSearchParams({
      serviceType,
      categoryId: selectedVehicleKey,
      origin: origin || rentalCity || selectedZone || 'Delhi NCR',
      destination: destination || selectedAirport || 'Outstation',
      distanceKm: String(distanceKm || 200),
      pickupDate,
      pickupTime,
      passengers: String(passengerCount),
    });

    if (serviceType === 'round_trip') {
      query.set('returnDate', returnDate);
      query.set('days', String(numberOfDays));
    } else if (serviceType === 'local_rental') {
      query.set('packageId', selectedPackageId);
    } else if (serviceType === 'airport_transfer') {
      query.set('airport', selectedAirport);
      query.set('direction', airportDirection);
      query.set('zone', selectedZone);
    }

    if (serverFare && !serverFare.isFareOnRequest) {
      query.set('fare', String(serverFare.customerPayable));
      query.set('token', String(serverFare.tokenAmount));
      query.set('balance', String(serverFare.balanceAmount));
    }

    router.push(`/checkout?${query.toString()}`);
  };

  return (
    <div className={`bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden font-sans ${className}`}>
      {/* 1. TOP SERVICE MODE SELECTOR TABS (MakeMyTrip Pattern) */}
      <div className="bg-slate-100/80 p-2 sm:p-2.5 border-b border-slate-200">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2">
          {[
            { id: 'one_way', label: 'One-Way Outstation', icon: '↗' },
            { id: 'round_trip', label: 'Round-Trip Outstation', icon: '🔁' },
            { id: 'local_rental', label: 'Local Hourly Rentals', icon: '⏱' },
            { id: 'airport_transfer', label: 'Airport Transfers', icon: '✈' },
          ].map((tab) => {
            const isActive = serviceType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setServiceType(tab.id as BookingServiceType);
                  setValidationError('');
                }}
                className={`flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-brand-blue shadow-sm border border-slate-200 scale-[1.01]'
                    : 'text-slate-600 hover:text-brand-blue hover:bg-white/60'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleProceedToCheckout} className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Validation Alert */}
        {validationError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 animate-shake">
            <span>⚠️</span>
            <span>{validationError}</span>
          </div>
        )}

        {/* 2. DYNAMIC LOCATION & ROUTE INPUTS */}
        {(serviceType === 'one_way' || serviceType === 'round_trip') && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-3 items-center">
              {/* Pickup Input */}
              <div className="relative">
                <label className="block text-slate-700 font-bold mb-1 text-xs uppercase tracking-wider">
                  Pickup Location <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-brand-green text-sm">📍</span>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => handleOriginChange(e.target.value)}
                    onFocus={() => {
                      if (origin.trim()) setShowOriginDropdown(true);
                    }}
                    placeholder="Enter pickup city or location..."
                    className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl pl-9 pr-4 py-3 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all"
                  />
                </div>

                {/* Autocomplete Dropdown */}
                {showOriginDropdown && originSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto">
                    {originSuggestions.map((city) => (
                      <div
                        key={city}
                        onClick={() => {
                          setOrigin(city);
                          setShowOriginDropdown(false);
                          matchKnownRoute(city, destination);
                        }}
                        className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-blue-50/70 hover:text-brand-blue cursor-pointer transition-colors"
                      >
                        {city}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Swap Button (MakeMyTrip Pattern) */}
              <div className="flex md:items-end justify-center pt-2 md:pt-4">
                <button
                  type="button"
                  onClick={handleSwap}
                  title="Swap Origin & Destination"
                  className="p-3 bg-slate-100 hover:bg-brand-blue hover:text-white rounded-full border border-slate-200 transition-all text-sm font-bold text-slate-600 shadow-xs cursor-pointer"
                >
                  ⇄
                </button>
              </div>

              {/* Destination Input */}
              <div className="relative">
                <label className="block text-slate-700 font-bold mb-1 text-xs uppercase tracking-wider">
                  Drop Destination <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-rose-500 text-sm">🏁</span>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => handleDestinationChange(e.target.value)}
                    onFocus={() => {
                      if (destination.trim()) setShowDestDropdown(true);
                    }}
                    placeholder="Enter destination city or drop..."
                    className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl pl-9 pr-4 py-3 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all"
                  />
                </div>

                {/* Autocomplete Dropdown */}
                {showDestDropdown && destSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto">
                    {destSuggestions.map((city) => (
                      <div
                        key={city}
                        onClick={() => {
                          setDestination(city);
                          setShowDestDropdown(false);
                          matchKnownRoute(origin, city);
                        }}
                        className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-blue-50/70 hover:text-brand-blue cursor-pointer transition-colors"
                      >
                        {city}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Suggestions for Empty State */}
            {(!origin || !destination) && (
              <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 text-xs">
                <span className="text-slate-400 font-semibold flex-shrink-0">Popular:</span>
                {['Delhi', 'Ghaziabad', 'Noida', 'Agra', 'Haridwar', 'Jaipur', 'Chandigarh', 'Dehradun'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      if (!origin) {
                        setOrigin(c);
                        matchKnownRoute(c, destination);
                      } else if (!destination) {
                        setDestination(c);
                        matchKnownRoute(origin, c);
                      }
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-brand-blue rounded-lg text-[11px] font-bold border border-slate-200 transition-colors flex-shrink-0"
                  >
                    + {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Local Rental City & Package Inputs */}
        {serviceType === 'local_rental' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1 text-xs uppercase tracking-wider">
                Select City / Region <span className="text-rose-500">*</span>
              </label>
              <select
                value={rentalCity}
                onChange={(e) => {
                  setRentalCity(e.target.value);
                  setValidationError('');
                }}
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl px-4 py-3 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="">Select City / NCR Area...</option>
                <option value="Ghaziabad">Ghaziabad (Headquarters)</option>
                <option value="Noida">Noida</option>
                <option value="Greater Noida">Greater Noida</option>
                <option value="Delhi">Delhi NCR</option>
                <option value="Gurugram">Gurugram</option>
                <option value="Faridabad">Faridabad</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1 text-xs uppercase tracking-wider">
                Rental Duration Package
              </label>
              <select
                value={selectedPackageId}
                onChange={(e) => setSelectedPackageId(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl px-4 py-3 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                {LOCAL_RENTAL_PACKAGES.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} {pkg.isFareOnRequest ? '(Fare on Request)' : '(Instant Quote)'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Airport Transfers Inputs */}
        {serviceType === 'airport_transfer' && (
          <div className="space-y-4">
            {/* Direction Selector */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAirportDirection('drop')}
                className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${
                  airportDirection === 'drop'
                    ? 'bg-brand-blue text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🛫 Drop to Airport
              </button>
              <button
                type="button"
                onClick={() => setAirportDirection('pickup')}
                className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${
                  airportDirection === 'pickup'
                    ? 'bg-brand-blue text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🛬 Pickup from Airport
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1 text-xs uppercase tracking-wider">
                  Airport Terminal
                </label>
                <select
                  value={selectedAirport}
                  onChange={(e) => setSelectedAirport(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl px-4 py-3 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                >
                  {AIRPORTS_LIST.map((a) => (
                    <option key={a.id} value={a.name}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 text-xs uppercase tracking-wider">
                  City Zone / Area <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedZone}
                  onChange={(e) => {
                    setSelectedZone(e.target.value);
                    setValidationError('');
                  }}
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl px-4 py-3 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                >
                  <option value="">Select Pickup / Drop Zone...</option>
                  {AIRPORT_ZONES.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 3. DATES, TIMES, PASSENGERS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
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
              <label className="block text-slate-700 font-bold mb-1 text-xs">Est. Distance</label>
              <div className="w-full bg-slate-100 text-slate-800 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-xs">
                {distanceKm > 0 ? `${distanceKm} KM` : 'Auto-Calculated'}
              </div>
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

        {/* 4. VEHICLE SELECTION CARDS (MakeMyTrip / Goibibo Pattern) */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2.5 gap-1">
            <label className="block text-slate-800 font-black text-xs uppercase tracking-wider">
              Select Your Cab Category (MMT / Goibibo Verified Rate Card)
            </label>
            <span className="text-[11px] font-bold text-brand-green bg-brand-green/10 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 w-fit">
              <span>✓</span> All-Inclusive Fuel & Chauffeur Allowance
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {VEHICLE_OPTIONS.map((v) => {
              const isSelected = selectedVehicleKey === v.key;

              // Quick estimated cost for this category
              let estimatedCost = 0;
              let rateBadge = `₹${v.outstationRatePerKm}/km`;

              if (serviceType === 'one_way') {
                rateBadge = `₹${v.oneWayMultiplier}/km`;
                if (distanceKm > 0) estimatedCost = Math.round(distanceKm * v.oneWayMultiplier);
              } else if (serviceType === 'round_trip') {
                rateBadge = `₹${v.outstationRatePerKm}/km`;
                if (distanceKm > 0) {
                  const billable = Math.max(distanceKm * 2, v.minKmRoundTrip * numberOfDays);
                  estimatedCost = Math.round(billable * v.outstationRatePerKm + v.driverAllowanceDay * numberOfDays);
                }
              } else if (serviceType === 'local_rental') {
                const pkg = LOCAL_RENTAL_PACKAGES.find((p) => p.id === selectedPackageId);
                if (pkg?.isFareOnRequest) {
                  rateBadge = 'On Request';
                  estimatedCost = 0;
                } else {
                  estimatedCost = selectedPackageId === '12hr120km' ? v.local12hPrice : v.local8hPrice;
                  rateBadge = `₹${estimatedCost}`;
                }
              } else if (serviceType === 'airport_transfer') {
                estimatedCost = v.airportBase;
                rateBadge = `₹${v.airportBase}`;
              }

              const estimatedToken = estimatedCost > 0 ? Math.round(estimatedCost * 0.30) : 0;
              const originalCost = estimatedCost > 0 ? Math.round(estimatedCost * 1.15) : 0;

              return (
                <div
                  key={v.key}
                  onClick={() => setSelectedVehicleKey(v.key)}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-brand-blue bg-blue-50/50 shadow-md ring-2 ring-brand-blue/30 scale-[1.01]'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 shadow-xs'
                  }`}
                >
                  {/* Top Badge & Rating */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold text-amber-500 flex items-center gap-0.5">
                      ★ 4.8 <span className="text-slate-400 font-medium">(Top Rated)</span>
                    </span>
                    {v.badge && (
                      <span className="px-2 py-0.5 bg-brand-green/10 text-brand-green font-black text-[9px] rounded-full uppercase tracking-wider">
                        {v.badge}
                      </span>
                    )}
                  </div>

                  {/* Vehicle Image */}
                  <div className="relative h-20 w-full my-1.5 flex items-center justify-center">
                    <Image
                      src={v.image}
                      alt={v.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                  </div>

                  {/* Vehicle Name & Specs */}
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-slate-900 text-sm">{v.name}</h4>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-brand-blue bg-brand-blue text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <span className="text-[9px] leading-none">✓</span>}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold">{v.models}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-600 font-bold">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded">👥 {v.seats} Seats</span>
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded">🧳 {v.bags} Bags</span>
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded">❄️ AC</span>
                    </div>
                  </div>

                  {/* Pricing Section (MMT / Goibibo Strikethrough & Token) */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    <div className="flex items-baseline justify-between">
                      <div>
                        {originalCost > 0 && (
                          <span className="text-[11px] text-slate-400 line-through mr-1 font-mono">
                            ₹{originalCost.toLocaleString('en-IN')}
                          </span>
                        )}
                        <span className="font-black text-slate-900 font-mono text-base sm:text-lg">
                          {estimatedCost > 0 ? `₹${estimatedCost.toLocaleString('en-IN')}` : rateBadge}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {serviceType === 'one_way' ? 'One-Way' : serviceType === 'round_trip' ? 'Total' : 'Base'}
                      </span>
                    </div>

                    {/* 30% Token Info Pill */}
                    {estimatedToken > 0 && (
                      <div className="mt-1.5 pt-1 border-t border-dashed border-slate-200 flex items-center justify-between text-[10px]">
                        <span className="text-emerald-700 font-bold">30% Token:</span>
                        <span className="font-mono font-black text-emerald-800">₹{estimatedToken.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. LIVE CALCULATION OUTPUT & TRANSPARENT BREAKDOWN SECTION */}
        {isLoading ? (
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center animate-pulse space-y-2">
            <div className="h-6 bg-slate-200 rounded-md w-1/3 mx-auto"></div>
            <div className="h-4 bg-slate-200 rounded-md w-1/2 mx-auto"></div>
          </div>
        ) : serverFare && serverFare.isFareOnRequest ? (
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-3 text-center shadow-sm">
            <p className="font-bold text-sm text-amber-800">Fare Available Upon Instant Request</p>
            <p className="text-amber-800/90 leading-relaxed max-w-lg mx-auto font-medium">
              This rental package or specialized corridor requires manual dispatch confirmation to ensure confirmed driver allocation.
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
          <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 shadow-sm">
            {/* Top Fare Summary Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500">
                  Total Cab Fare (Fuel & Driver Allowance Included)
                </span>
                <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                  ₹{serverFare.customerPayable.toLocaleString('en-IN')}
                </div>
              </div>

              {/* 30% Token & 70% Balance Badges */}
              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-center">
                  <span className="text-[10px] text-emerald-700 uppercase font-black block">
                    30% Token Advance
                  </span>
                  <span className="font-mono font-black text-emerald-800 text-base">
                    ₹{serverFare.tokenAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl text-center">
                  <span className="text-[10px] text-blue-700 uppercase font-black block">
                    70% Remaining Balance
                  </span>
                  <span className="font-mono font-black text-blue-800 text-base">
                    ₹{serverFare.balanceAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics Breakdown Grid (Phase 6) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-3.5 rounded-2xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Billable Distance</span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {serverFare.billableKm} KM
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Base Cab Rental</span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  ₹{serverFare.baseFare.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Driver Allowance</span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {serverFare.driverAllowance > 0 ? `₹${serverFare.driverAllowance}` : 'Included'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Est. Fastag Toll</span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {estimatedHighwayToll > 0 ? `~₹${estimatedHighwayToll}` : 'At Actuals'}
                </span>
              </div>
            </div>

            {/* Inclusions & Exclusions Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div className="space-y-1">
                <span className="text-brand-green font-bold flex items-center gap-1">
                  ✓ Included in Quoted Fare:
                </span>
                <p className="text-slate-600 font-medium">
                  Vehicle rental, fuel cost, chauffeur allowance, and doorstep pickup.
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-amber-700 font-bold flex items-center gap-1">
                  ⚠️ Payable at Actuals During Trip:
                </span>
                <p className="text-slate-600 font-medium">
                  Fastag highway tolls, interstate border entrance taxes, and parking fees.
                </p>
              </div>
            </div>

            {/* MakeMyTrip-Style 'View Fare Details & Inclusions' Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowFareBreakupModal(!showFareBreakupModal)}
                className="text-xs font-bold text-brand-blue hover:text-brand-blue-hover flex items-center gap-1.5 cursor-pointer underline underline-offset-4"
              >
                <span>{showFareBreakupModal ? '▲ Hide' : '▼ View'} Detailed Fare Breakdown & Important Terms (Read Before You Book)</span>
              </button>
            </div>

            {/* Expandable MMT / Savaari Style Fare Details Section */}
            {showFareBreakupModal && (
              <div className="mt-3 p-4 bg-white rounded-2xl border border-slate-200 space-y-4 text-xs animate-fadeIn">
                {/* Modal Tab Switcher */}
                <div className="flex border-b border-slate-200 pb-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setActiveBreakupTab('breakup')}
                    className={`font-black pb-1 transition-all ${
                      activeBreakupTab === 'breakup'
                        ? 'text-brand-blue border-b-2 border-brand-blue'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    1. Fare Summary
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveBreakupTab('inclusions')}
                    className={`font-black pb-1 transition-all ${
                      activeBreakupTab === 'inclusions'
                        ? 'text-brand-blue border-b-2 border-brand-blue'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    2. Inclusions & Exclusions
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveBreakupTab('terms')}
                    className={`font-black pb-1 transition-all ${
                      activeBreakupTab === 'terms'
                        ? 'text-brand-blue border-b-2 border-brand-blue'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    3. Read Before You Book
                  </button>
                </div>

                {/* Tab 1: Detailed Fare Breakup Table */}
                {activeBreakupTab === 'breakup' && (
                  <div className="space-y-3">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase">
                            <th className="py-2">Component</th>
                            <th className="py-2">Rate / Amount</th>
                            <th className="py-2 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                          <tr>
                            <td className="py-2 font-semibold">Base Cab Rental ({serverFare.billableKm} KM)</td>
                            <td className="py-2">₹{serverFare.baseFare.toLocaleString('en-IN')}</td>
                            <td className="py-2 text-right">
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                                INCLUDED
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 font-semibold">Chauffeur Day Allowance</td>
                            <td className="py-2">₹{serverFare.driverAllowance > 0 ? serverFare.driverAllowance : 'Included in Base'}</td>
                            <td className="py-2 text-right">
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                                INCLUDED
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 font-semibold">Fuel & Vehicle Maintenance</td>
                            <td className="py-2">100% Covered</td>
                            <td className="py-2 text-right">
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                                INCLUDED
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 font-semibold">Night Allowance (10 PM to 6 AM)</td>
                            <td className="py-2">₹300 / Night</td>
                            <td className="py-2 text-right">
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                                IF APPLICABLE
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 font-semibold">Extra Distance Beyond Quoted KM</td>
                            <td className="py-2">₹{selectedVehicle.extraKmRate}/km</td>
                            <td className="py-2 text-right">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-bold text-[10px]">
                                IF EXCEEDED
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 font-semibold">Highway Toll Tax (FASTag)</td>
                            <td className="py-2">Electronic Toll Plaza Charge</td>
                            <td className="py-2 text-right">
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                                AT ACTUALS
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 font-semibold">Interstate State Border Tax</td>
                            <td className="py-2">Commercial Border Receipt</td>
                            <td className="py-2 text-right">
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                                AT ACTUALS
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 font-semibold">Parking Charges (Airport / Monument)</td>
                            <td className="py-2">Physical Parking Ticket</td>
                            <td className="py-2 text-right">
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                                AT ACTUALS
                              </span>
                            </td>
                          </tr>
                          <tr className="border-t-2 border-slate-200 font-bold text-slate-900">
                            <td className="py-2 text-sm">Total Quoted Cab Fare</td>
                            <td className="py-2 text-sm text-brand-blue font-black font-mono">₹{serverFare.customerPayable.toLocaleString('en-IN')}</td>
                            <td className="py-2 text-right text-xs">Final Quote</td>
                          </tr>
                          <tr className="bg-emerald-50/60 font-bold text-emerald-900">
                            <td className="py-2 pl-2">Required 30% Token to Confirm</td>
                            <td className="py-2 font-mono">₹{serverFare.tokenAmount.toLocaleString('en-IN')}</td>
                            <td className="py-2 pr-2 text-right text-[11px]">Pay Online</td>
                          </tr>
                          <tr className="bg-blue-50/60 font-bold text-blue-900">
                            <td className="py-2 pl-2">Remaining 70% Balance on Trip</td>
                            <td className="py-2 font-mono">₹{serverFare.balanceAmount.toLocaleString('en-IN')}</td>
                            <td className="py-2 pr-2 text-right text-[11px]">Pay to Driver</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tab 2: Inclusions & Exclusions */}
                {activeBreakupTab === 'inclusions' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2">
                      <span className="font-bold text-emerald-900 block text-xs">✓ Explicitly Included:</span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-700 font-medium">
                        <li>Dedicated vehicle reserved solely for your group.</li>
                        <li>All fuel costs for the booked distance.</li>
                        <li>Chauffeur daily allowance.</li>
                        <li>Doorstep pickup and drop.</li>
                        <li>Clean, air-conditioned commercial vehicle.</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
                      <span className="font-bold text-amber-900 block text-xs">⚠️ Explicitly Excluded (Pay at Actuals):</span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-700 font-medium">
                        <li>FASTag highway toll plaza deductions.</li>
                        <li>State commercial border permit entry taxes.</li>
                        <li>Airport parking fee (e.g. IGI MLCP).</li>
                        <li>Driver night allowance (₹300) if driving 10 PM - 6 AM.</li>
                        <li>Extra distance charged at ₹{selectedVehicle.extraKmRate}/km.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Tab 3: Read Before You Book */}
                {activeBreakupTab === 'terms' && (
                  <div className="space-y-2.5 text-slate-700 font-medium text-xs leading-relaxed">
                    <p>
                      <strong>• 30% Advance Token Policy:</strong> A 30% token payment confirms your booking and vehicle allocation. The remaining 70% is payable during the journey.
                    </p>
                    <p>
                      <strong>• Zero Cancellation Penalty:</strong> Cancel free of charge up to 6 hours before departure for a full 100% refund of your advance token.
                    </p>
                    <p>
                      <strong>• Driver Details:</strong> Chauffeur name, phone number, and vehicle registration are dispatched via SMS & WhatsApp 2 hours prior to scheduled pickup.
                    </p>
                    <p>
                      <strong>• Airport Waiting Grace:</strong> For airport pickups, flight tracking is included at no extra charge. We monitor your flight schedule and adjust pickup times automatically without waiting fees.
                    </p>
                  </div>
                )}
              </div>
            )}

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
        ) : (
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-600 font-medium">
              💡 Please select your pickup & drop locations above to view your live calculated fare, itemized breakdown, and 30% advance token.
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              Calculate Fare ➔
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
