'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SITE_CONFIG } from '@/lib/seo';
import masterRoutesData from '@/lib/data/processed-master-routes.json';
import {
  calculateAdvanceToken,
  calculateRoundTripFare,
  calculateLocalRentalFare,
  resolveOneWayFare,
  resolveAirportFare,
  buildWhatsAppBookingLink,
} from '@/lib/pricing';

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

interface VehicleCardDef {
  key: VehicleCategoryKey;
  name: string;
  models: string;
  seats: number;
  bags: number;
  image: string;
  badge?: string;
  pricingCategory: string;
}

const VEHICLE_CARDS: VehicleCardDef[] = [
  {
    key: 'sedan',
    name: 'Sedan',
    models: 'Dzire, Etios, Amaze',
    seats: 4,
    bags: 2,
    image: '/fleet-brand/dzire.png',
    badge: 'Most Popular',
    pricingCategory: 'sedan',
  },
  {
    key: 'suv-muv',
    name: 'SUV / MPV',
    models: 'Ertiga, Carens, Triber',
    seats: 6,
    bags: 4,
    image: '/fleet-brand/Ertiga.png',
    badge: 'Family Ride',
    pricingCategory: 'suv-muv',
  },
  {
    key: 'executive-suv',
    name: 'Innova Crysta',
    models: 'Innova Crysta, Hycross',
    seats: 7,
    bags: 5,
    image: '/fleet-brand/Innova Crysta.png',
    badge: 'Premium Luxury',
    pricingCategory: 'executive-suv',
  },
  {
    key: 'hatchback',
    name: 'Hatchback',
    models: 'WagonR, Swift, Celerio',
    seats: 4,
    bags: 1,
    image: '/fleet-brand/Hatchback.png',
    badge: 'Budget Value',
    pricingCategory: 'hatchback',
  },
];

const LOCAL_RENTAL_PACKAGES = [
  { id: '8h80km', name: '8 Hours / 80 KM (Full Day Local)', hours: 8, km: 80 },
  { id: '12h120km', name: '12 Hours / 120 KM (Extended Day Local)', hours: 12, km: 120 },
] as const;

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
  { id: 'hindon-ghaziabad', name: 'Hindon Airport (Ghaziabad)' },
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
  const [rentalCity, setRentalCity] = useState('Ghaziabad');
  const [selectedPackageId, setSelectedPackageId] = useState<'8h80km' | '12h120km'>('8h80km');

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

  // Active Vehicle Selection
  const [selectedVehicleKey, setSelectedVehicleKey] = useState<VehicleCategoryKey>('sedan');

  // Expandable Breakdown & Terms
  const [showFareBreakupModal, setShowFareBreakupModal] = useState(false);
  const [activeBreakupTab, setActiveBreakupTab] = useState<'breakup' | 'inclusions' | 'terms'>('breakup');

  // Match known route distance from master dataset
  const matchKnownRoute = useCallback((orig: string, dest: string) => {
    const origClean = orig.toLowerCase().trim();
    const destClean = dest.toLowerCase().trim();
    if (!origClean || !destClean) {
      setDistanceKm(0);
      setActiveRouteId('');
      return;
    }

    const match = (masterRoutesData as any[]).find(
      (mr) =>
        (mr.originName.toLowerCase().includes(origClean) || origClean.includes(mr.originName.toLowerCase())) &&
        (mr.destName.toLowerCase().includes(destClean) || destClean.includes(mr.destName.toLowerCase()))
    );

    if (match) {
      setDistanceKm(match.estimated_distance_km || 200);
      setActiveRouteId(match.id || match.slug || '');
    } else {
      setDistanceKm((prev) => (prev > 0 ? prev : 200));
    }
  }, []);

  // Synchronize incoming props if explicitly provided
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

  // Handle Autocomplete
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

  // Date handlers
  const handlePickupDateChange = (val: string) => {
    if (val < todayStr) return;
    setPickupDate(val);
    if (returnDate < val) {
      setReturnDate(val);
      setNumberOfDays(1);
    } else {
      const diffTime = Math.abs(new Date(returnDate).getTime() - new Date(val).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setNumberOfDays(Math.max(1, diffDays));
    }
  };

  const handleReturnDateChange = (val: string) => {
    if (val < pickupDate) return;
    setReturnDate(val);
    const diffTime = Math.abs(new Date(val).getTime() - new Date(pickupDate).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    setNumberOfDays(Math.max(1, diffDays));
  };

  // ---------------------------------------------------------------------------
  // LIVE FARE CALCULATION ENGINE (In-Memory, Single Source of Truth)
  // ---------------------------------------------------------------------------
  const effectiveOrigin = useMemo(() => {
    if (serviceType === 'airport_transfer') {
      return airportDirection === 'drop' ? selectedZone : selectedAirport;
    }
    if (serviceType === 'local_rental') {
      return rentalCity;
    }
    return origin.trim();
  }, [serviceType, airportDirection, selectedZone, selectedAirport, rentalCity, origin]);

  const effectiveDestination = useMemo(() => {
    if (serviceType === 'airport_transfer') {
      return airportDirection === 'drop' ? selectedAirport : selectedZone;
    }
    if (serviceType === 'local_rental') {
      return `${selectedPackageId === '8h80km' ? '8h/80km' : '12h/120km'} Local City Tour`;
    }
    return destination.trim();
  }, [serviceType, airportDirection, selectedAirport, selectedZone, selectedPackageId, destination]);

  const hasRequiredLocations = useMemo(() => {
    if (serviceType === 'one_way' || serviceType === 'round_trip') {
      return origin.trim().length > 0 && destination.trim().length > 0;
    }
    if (serviceType === 'local_rental') {
      return rentalCity.trim().length > 0;
    }
    if (serviceType === 'airport_transfer') {
      return selectedZone.trim().length > 0 && selectedAirport.trim().length > 0;
    }
    return false;
  }, [serviceType, origin, destination, rentalCity, selectedZone, selectedAirport]);

  // Compute live quote for each vehicle card
  const vehicleQuotes = useMemo(() => {
    if (!hasRequiredLocations) return {};

    const quotes: Record<
      string,
      {
        fare: number;
        tokenAmount: number;
        balanceAmount: number;
        isFixed: boolean;
        requiresWhatsAppQuote?: boolean;
        estimatedToll: number;
        distanceKm: number;
        durationText?: string;
        billableKm?: number;
        driverAllowance?: number;
      }
    > = {};

    if (serviceType === 'one_way') {
      const oneWay = resolveOneWayFare(origin, destination, distanceKm);
      if (oneWay && oneWay.isFixed) {
        VEHICLE_CARDS.forEach((v) => {
          let fare = oneWay.sedanFare;
          if (v.key === 'suv-muv') fare = oneWay.ertigaFare;
          else if (v.key === 'executive-suv') fare = oneWay.crystaFare;
          else if (v.key === 'hatchback') fare = Math.round(oneWay.sedanFare * 0.88);

          const tokenAmount = calculateAdvanceToken(fare, 30);
          quotes[v.key] = {
            fare,
            tokenAmount,
            balanceAmount: fare - tokenAmount,
            isFixed: true,
            estimatedToll: oneWay.estimatedToll,
            distanceKm: oneWay.distanceKm,
            durationText: oneWay.durationText,
          };
        });
      } else if (oneWay && oneWay.requiresWhatsAppQuote) {
        VEHICLE_CARDS.forEach((v) => {
          quotes[v.key] = {
            fare: 0,
            tokenAmount: 0,
            balanceAmount: 0,
            isFixed: false,
            requiresWhatsAppQuote: true,
            estimatedToll: oneWay.estimatedToll,
            distanceKm: oneWay.distanceKm,
            durationText: oneWay.durationText,
          };
        });
      }
    } else if (serviceType === 'round_trip') {
      VEHICLE_CARDS.forEach((v) => {
        const rt = calculateRoundTripFare(distanceKm || 200, numberOfDays, v.pricingCategory);
        quotes[v.key] = {
          fare: rt.totalFare,
          tokenAmount: rt.tokenAmount,
          balanceAmount: rt.balanceAmount,
          isFixed: true,
          estimatedToll: Math.round((distanceKm || 200) * 3.2),
          distanceKm: rt.actualDistanceKm,
          billableKm: rt.billableKm,
          driverAllowance: rt.totalDriverAllowance,
        };
      });
    } else if (serviceType === 'local_rental') {
      VEHICLE_CARDS.forEach((v) => {
        const local = calculateLocalRentalFare(selectedPackageId, v.pricingCategory);
        quotes[v.key] = {
          fare: local.basePrice,
          tokenAmount: local.tokenAmount,
          balanceAmount: local.balanceAmount,
          isFixed: true,
          estimatedToll: 0,
          distanceKm: local.km,
          durationText: `${local.hours} Hours`,
        };
      });
    } else if (serviceType === 'airport_transfer') {
      const airport = resolveAirportFare(selectedAirport, selectedZone);
      if (airport) {
        VEHICLE_CARDS.forEach((v) => {
          let fare = airport.sedanFare;
          if (v.key === 'suv-muv') fare = airport.ertigaFare;
          else if (v.key === 'executive-suv') fare = airport.crystaFare;
          else if (v.key === 'hatchback') fare = Math.round(airport.sedanFare * 0.88);

          const tokenAmount = calculateAdvanceToken(fare, 30);
          quotes[v.key] = {
            fare,
            tokenAmount,
            balanceAmount: fare - tokenAmount,
            isFixed: true,
            estimatedToll: 0,
            distanceKm: airport.distanceKm,
          };
        });
      }
    }

    return quotes;
  }, [
    hasRequiredLocations,
    serviceType,
    origin,
    destination,
    distanceKm,
    numberOfDays,
    selectedPackageId,
    selectedAirport,
    selectedZone,
  ]);

  const activeVehicleQuote = vehicleQuotes[selectedVehicleKey];

  // Service label for WhatsApp & Checkout
  const serviceTypeLabel = useMemo(() => {
    switch (serviceType) {
      case 'one_way':
        return 'One-way';
      case 'round_trip':
        return 'Round-trip';
      case 'local_rental':
        return 'Local rental';
      case 'airport_transfer':
        return 'Airport transfer';
    }
  }, [serviceType]);

  // WhatsApp Quote Link
  const whatsAppUrl = useMemo(() => {
    const vCard = VEHICLE_CARDS.find((v) => v.key === selectedVehicleKey) || VEHICLE_CARDS[0];
    const fare = activeVehicleQuote?.fare || 0;
    return buildWhatsAppBookingLink({
      serviceType: serviceTypeLabel,
      vehicleName: vCard.name,
      origin: effectiveOrigin || 'Delhi NCR',
      destination: effectiveDestination || 'Outstation',
      travelDate: pickupDate,
      travelTime: pickupTime,
      estimatedFare: fare,
      pageUrl: typeof window !== 'undefined' ? window.location.href : 'https://www.urgenttaxis.in',
    });
  }, [
    selectedVehicleKey,
    activeVehicleQuote,
    serviceTypeLabel,
    effectiveOrigin,
    effectiveDestination,
    pickupDate,
    pickupTime,
  ]);

  // Custom WhatsApp quote link for unmapped routes
  const customWhatsAppUrl = useMemo(() => {
    return buildWhatsAppBookingLink({
      serviceType: serviceTypeLabel,
      vehicleName: 'Sedan / SUV',
      origin: origin || 'Pickup City',
      destination: destination || 'Drop City',
      travelDate: pickupDate,
      travelTime: pickupTime,
      pageUrl: typeof window !== 'undefined' ? window.location.href : 'https://www.urgenttaxis.in',
    });
  }, [serviceTypeLabel, origin, destination, pickupDate, pickupTime]);

  // Submit Handler -> Navigate to Checkout
  const handleProceedToCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasRequiredLocations) {
      setValidationError('Please enter both pickup and destination to view live fares and book.');
      return;
    }

    setValidationError('');

    const fare = activeVehicleQuote?.fare || 0;
    const token = activeVehicleQuote?.tokenAmount || 0;
    const balance = activeVehicleQuote?.balanceAmount || 0;

    const query = new URLSearchParams({
      serviceType,
      categoryId: selectedVehicleKey,
      origin: effectiveOrigin,
      destination: effectiveDestination,
      distanceKm: String(distanceKm || 200),
      pickupDate,
      pickupTime,
      passengers: String(passengerCount),
      fare: String(fare),
      token: String(token),
      balance: String(balance),
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

    router.push(`/checkout?${query.toString()}`);
  };

  const handleCalculateClick = () => {
    if (!hasRequiredLocations) {
      setValidationError('Please enter both pickup and destination to calculate fares.');
      const el = document.getElementById(serviceType === 'one_way' || serviceType === 'round_trip' ? 'booking-pickup' : 'rental-city');
      el?.focus();
      return;
    }
    setValidationError('');
    const el = document.getElementById('cab-selection-panel');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden font-sans ${className}`}>
      {/* 1. TOP SERVICE MODE SELECTOR TABS (44px min-height, Navy active state) */}
      <div className="bg-slate-100/90 p-2 sm:p-2.5 border-b border-slate-200">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
          {[
            { id: 'one_way', label: 'One-way', icon: '↗' },
            { id: 'round_trip', label: 'Round-trip', icon: '🔁' },
            { id: 'local_rental', label: 'Local rental', icon: '⏱' },
            { id: 'airport_transfer', label: 'Airport', icon: '✈' },
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
                className={`min-h-[44px] flex items-center justify-center gap-2 py-3 px-3 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1e1b4b] text-white shadow-md scale-[1.01]'
                    : 'bg-white text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <span className="text-sm">{tab.icon}</span>
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleProceedToCheckout} className="p-4 sm:p-6 lg:p-8 space-y-6">
        {validationError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm rounded-2xl font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{validationError}</span>
          </div>
        )}

        {/* 2. DYNAMIC INPUT FIELDS BASED ON SERVICE MODE */}
        {serviceType === 'one_way' || serviceType === 'round_trip' ? (
          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-3 items-center">
            {/* Origin Input */}
            <div className="relative">
              <label htmlFor="booking-pickup" className="block text-slate-800 font-bold mb-1 text-xs uppercase tracking-wider">
                Pickup Location <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-emerald-600 text-sm">📍</span>
                <input
                  id="booking-pickup"
                  type="text"
                  value={origin}
                  onChange={(e) => handleOriginChange(e.target.value)}
                  onFocus={() => {
                    if (origin.trim()) setShowOriginDropdown(true);
                  }}
                  placeholder="Enter pickup city or location..."
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl pl-9 pr-9 py-3 font-semibold text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] focus:bg-white transition-all"
                />
                {origin && (
                  <button
                    type="button"
                    onClick={() => {
                      setOrigin('');
                      setShowOriginDropdown(false);
                      matchKnownRoute('', destination);
                    }}
                    aria-label="Clear pickup location"
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-1 text-xs cursor-pointer font-bold"
                  >
                    ✕
                  </button>
                )}
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
                      className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-blue-50/70 hover:text-[#1e1b4b] cursor-pointer transition-colors"
                    >
                      {city}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Swap Button */}
            <div className="flex md:items-end justify-center pt-2 md:pt-4">
              <button
                type="button"
                onClick={handleSwap}
                aria-label="Swap pickup and drop locations"
                title="Swap Origin & Destination"
                className="p-3 bg-slate-100 hover:bg-[#1e1b4b] hover:text-white rounded-full border border-slate-200 transition-all text-sm font-bold text-slate-600 shadow-xs cursor-pointer"
              >
                ⇄
              </button>
            </div>

            {/* Destination Input */}
            <div className="relative">
              <label htmlFor="booking-drop" className="block text-slate-800 font-bold mb-1 text-xs uppercase tracking-wider">
                Drop Destination <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-rose-500 text-sm">🏁</span>
                <input
                  id="booking-drop"
                  type="text"
                  value={destination}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  onFocus={() => {
                    if (destination.trim()) setShowDestDropdown(true);
                  }}
                  placeholder="Enter destination city or drop..."
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl pl-9 pr-9 py-3 font-semibold text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] focus:bg-white transition-all"
                />
                {destination && (
                  <button
                    type="button"
                    onClick={() => {
                      setDestination('');
                      setShowDestDropdown(false);
                      matchKnownRoute(origin, '');
                    }}
                    aria-label="Clear drop destination"
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-1 text-xs cursor-pointer font-bold"
                  >
                    ✕
                  </button>
                )}
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
                      className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-blue-50/70 hover:text-[#1e1b4b] cursor-pointer transition-colors"
                    >
                      {city}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : serviceType === 'local_rental' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="rental-city" className="block text-slate-800 font-bold mb-1 text-xs uppercase tracking-wider">
                Select City / Region <span className="text-rose-500">*</span>
              </label>
              <select
                id="rental-city"
                value={rentalCity}
                onChange={(e) => setRentalCity(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl px-4 py-3 font-semibold text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] focus:bg-white transition-all cursor-pointer"
              >
                <option value="Ghaziabad">Ghaziabad & Delhi NCR</option>
                <option value="Noida">Noida & Greater Noida</option>
                <option value="Delhi">Delhi & New Delhi</option>
                <option value="Gurugram">Gurugram (Gurgaon)</option>
                <option value="Faridabad">Faridabad</option>
                <option value="Meerut">Meerut</option>
              </select>
            </div>

            <div>
              <label htmlFor="rental-package" className="block text-slate-800 font-bold mb-1 text-xs uppercase tracking-wider">
                Select Hourly Package <span className="text-rose-500">*</span>
              </label>
              <select
                id="rental-package"
                value={selectedPackageId}
                onChange={(e) => setSelectedPackageId(e.target.value as '8h80km' | '12h120km')}
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl px-4 py-3 font-semibold text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] focus:bg-white transition-all cursor-pointer"
              >
                {LOCAL_RENTAL_PACKAGES.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Airport Transfer Toggle */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl max-w-sm">
              <button
                type="button"
                onClick={() => setAirportDirection('drop')}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all ${
                  airportDirection === 'drop' ? 'bg-[#1e1b4b] text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                Going to Airport (Drop)
              </button>
              <button
                type="button"
                onClick={() => setAirportDirection('pickup')}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all ${
                  airportDirection === 'pickup' ? 'bg-[#1e1b4b] text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                Pickup from Airport
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="airport-select" className="block text-slate-800 font-bold mb-1 text-xs uppercase tracking-wider">
                  Airport
                </label>
                <select
                  id="airport-select"
                  value={selectedAirport}
                  onChange={(e) => setSelectedAirport(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl px-4 py-3 font-semibold text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] focus:bg-white transition-all cursor-pointer"
                >
                  {AIRPORTS_LIST.map((ap) => (
                    <option key={ap.id} value={ap.name}>
                      {ap.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="airport-zone" className="block text-slate-800 font-bold mb-1 text-xs uppercase tracking-wider">
                  {airportDirection === 'drop' ? 'Pickup City / Zone' : 'Drop City / Zone'}
                </label>
                <select
                  id="airport-zone"
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl px-4 py-3 font-semibold text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] focus:bg-white transition-all cursor-pointer"
                >
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

        {/* 3. DATE, TIME & TRAVELERS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Pickup Date */}
          <div>
            <label htmlFor="pickup-date" className="block text-slate-800 font-bold mb-1 text-xs uppercase tracking-wider">
              Pickup Date
            </label>
            <input
              id="pickup-date"
              type="date"
              min={todayStr}
              value={pickupDate}
              onChange={(e) => handlePickupDateChange(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl px-4 py-3 font-semibold text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] focus:bg-white transition-all"
            />
          </div>

          {/* Pickup Time */}
          <div>
            <label htmlFor="pickup-time" className="block text-slate-800 font-bold mb-1 text-xs uppercase tracking-wider">
              Pickup Time
            </label>
            <input
              id="pickup-time"
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl px-4 py-3 font-semibold text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] focus:bg-white transition-all"
            />
          </div>

          {/* Return Date (Round-Trip Only) */}
          {serviceType === 'round_trip' ? (
            <div>
              <label htmlFor="return-date" className="block text-slate-800 font-bold mb-1 text-xs uppercase tracking-wider">
                Return Date ({numberOfDays} {numberOfDays === 1 ? 'Day' : 'Days'})
              </label>
              <input
                id="return-date"
                type="date"
                min={pickupDate}
                value={returnDate}
                onChange={(e) => handleReturnDateChange(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl px-4 py-3 font-semibold text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] focus:bg-white transition-all"
              />
            </div>
          ) : (
            <div>
              <label className="block text-slate-800 font-bold mb-1 text-xs uppercase tracking-wider">
                Estimated Distance
              </label>
              <div className="w-full bg-slate-100 text-slate-800 border border-slate-200 rounded-2xl px-4 py-3 font-mono font-bold text-sm">
                {distanceKm > 0 ? `${distanceKm} KM` : 'Enter route above'}
              </div>
            </div>
          )}

          {/* Passengers */}
          <div>
            <label htmlFor="passengers-count" className="block text-slate-800 font-bold mb-1 text-xs uppercase tracking-wider">
              Passengers
            </label>
            <select
              id="passengers-count"
              value={passengerCount}
              onChange={(e) => setPassengerCount(Number(e.target.value))}
              className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl px-4 py-3 font-semibold text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] focus:bg-white transition-all cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Passenger' : 'Passengers'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4. LIVE FARE CALCULATION & VEHICLE CARDS (Instant Render Beneath Inputs) */}
        {!hasRequiredLocations ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-200 text-slate-700 text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">💡</span>
              <span className="font-medium">
                Enter your pickup and destination above to see instant fares for all cab categories.
              </span>
            </div>
            <button
              type="button"
              onClick={handleCalculateClick}
              className="px-5 py-2.5 bg-[#1e1b4b] hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all shrink-0 cursor-pointer shadow-xs"
            >
              Calculate Fare ➔
            </button>
          </div>
        ) : activeVehicleQuote?.requiresWhatsAppQuote ? (
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm space-y-3 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <span className="text-base">🚗</span>
              <span>Custom Corridor: ~{distanceKm} KM (~{Math.max(1, Math.round(distanceKm / 50))} hrs driving time)</span>
            </div>
            <p className="text-amber-800/90 leading-relaxed font-medium">
              This route is outside our standard fixed-fare corridors. We provide instant custom quotes with verified commercial cabs and local chauffeurs.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <a
                href={customWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 bg-[#059669] hover:bg-[#047857] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                💬 Request Custom Quote on WhatsApp
              </a>
              <a
                href={`tel:${SITE_CONFIG.phoneRaw}`}
                className="w-full sm:w-auto px-6 py-3 bg-[#1e1b4b] hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                📞 Call {SITE_CONFIG.phone}
              </a>
            </div>
          </div>
        ) : (
          <div id="cab-selection-panel" className="space-y-4 scroll-mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2 border-t border-slate-200">
              <div>
                <h3 className="text-slate-900 font-black text-base sm:text-lg">Select your cab</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {distanceKm > 0 ? `${distanceKm} KM total driving distance` : 'Doorstep pickup & drop'} • All-inclusive fuel & chauffeur allowance
                </p>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full inline-flex items-center gap-1 w-fit">
                <span>✓</span> 30% Advance Token • 70% Driver Balance
              </span>
            </div>

            {/* 3 Vehicle Tiers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {VEHICLE_CARDS.slice(0, 3).map((v) => {
                const isSelected = selectedVehicleKey === v.key;
                const quote = vehicleQuotes[v.key];
                const fare = quote?.fare || 0;
                const token = quote?.tokenAmount || 0;
                const balance = quote?.balanceAmount || 0;

                const cardWhatsAppUrl = buildWhatsAppBookingLink({
                  serviceType: serviceTypeLabel,
                  vehicleName: v.name,
                  origin: effectiveOrigin,
                  destination: effectiveDestination,
                  travelDate: pickupDate,
                  travelTime: pickupTime,
                  estimatedFare: fare,
                  pageUrl: typeof window !== 'undefined' ? window.location.href : 'https://www.urgenttaxis.in',
                });

                return (
                  <div
                    key={v.key}
                    onClick={() => setSelectedVehicleKey(v.key)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#1e1b4b] bg-blue-50/40 shadow-md ring-2 ring-[#1e1b4b]/20 scale-[1.01]'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Top Badge */}
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-black text-slate-900 text-sm">{v.name}</span>
                        {v.badge && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full uppercase tracking-wider">
                            {v.badge}
                          </span>
                        )}
                      </div>

                      {/* Models subtitle */}
                      <p className="text-[11px] text-slate-500 font-semibold">{v.models}</p>

                      {/* Image */}
                      <div className="relative h-24 w-full my-2 flex items-center justify-center">
                        <Image
                          src={v.image}
                          alt={v.name}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>

                      {/* Specs */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-semibold mb-3">
                        <span className="bg-slate-100 px-2 py-0.5 rounded">👥 {v.seats} Seats</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded">🧳 {v.bags} Bags</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded">❄️ AC</span>
                      </div>
                    </div>

                    {/* Price and Advance Token Section */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="font-black text-slate-900 font-mono text-xl sm:text-2xl">
                            ₹{fare.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase">
                          {serviceType === 'one_way' ? 'One-Way' : serviceType === 'round_trip' ? 'Total' : 'Base'}
                        </span>
                      </div>

                      {/* 30% Token & 70% Driver Balance breakdown */}
                      <div className="bg-slate-50 rounded-xl p-2.5 space-y-1 text-xs border border-slate-200/80">
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-700 font-bold">30% Advance Token:</span>
                          <span className="font-mono font-black text-emerald-800">₹{token.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="font-medium">70% Driver Balance:</span>
                          <span className="font-mono font-bold text-slate-800">₹{balance.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {/* Inclusions summary */}
                      <div className="text-[10px] text-slate-500 font-medium space-y-0.5 pt-0.5">
                        <p className="text-emerald-700 font-bold">✓ Fuel, chauffeur & AC included</p>
                        <p className="text-amber-700 font-medium">⚠️ Tolls & parking extra at actuals</p>
                      </div>

                      {/* Direct CTA Buttons inside each card */}
                      <div className="pt-2 flex flex-col gap-1.5">
                        <a
                          href={cardWhatsAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="w-full py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 text-center"
                        >
                          💬 Book via WhatsApp
                        </a>
                        <button
                          type="submit"
                          onClick={() => setSelectedVehicleKey(v.key)}
                          className="w-full py-2 bg-[#1e1b4b] hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                        >
                          Book Online (30% Token) ➔
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Expandable Fare Breakdown & Terms Accordion */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowFareBreakupModal(!showFareBreakupModal)}
                className="text-xs font-bold text-[#1e1b4b] hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <span>{showFareBreakupModal ? '▲ Hide' : '▼ View'} Detailed Fare Inclusions, Exclusions & Terms</span>
              </button>
            </div>

            {showFareBreakupModal && (
              <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs animate-fadeIn">
                <div className="flex border-b border-slate-200 pb-2 gap-3 sm:gap-4 overflow-x-auto no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setActiveBreakupTab('breakup')}
                    className={`font-black pb-1 transition-all ${
                      activeBreakupTab === 'breakup'
                        ? 'text-[#1e1b4b] border-b-2 border-[#1e1b4b]'
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
                        ? 'text-[#1e1b4b] border-b-2 border-[#1e1b4b]'
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
                        ? 'text-[#1e1b4b] border-b-2 border-[#1e1b4b]'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    3. Booking Policy
                  </button>
                </div>

                {activeBreakupTab === 'breakup' && (
                  <div className="space-y-2 text-slate-700">
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span>Trip Mode:</span>
                      <strong className="text-slate-900">{serviceTypeLabel}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span>Pickup:</span>
                      <strong className="text-slate-900">{effectiveOrigin}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span>Drop:</span>
                      <strong className="text-slate-900">{effectiveDestination}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span>Selected Cab:</span>
                      <strong className="text-slate-900">
                        {VEHICLE_CARDS.find((v) => v.key === selectedVehicleKey)?.name}
                      </strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span>Advance Token (30%):</span>
                      <strong className="text-emerald-700">
                        ₹{(activeVehicleQuote?.tokenAmount || 0).toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Driver Balance (70%):</span>
                      <strong className="text-slate-900">
                        ₹{(activeVehicleQuote?.balanceAmount || 0).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>
                )}

                {activeBreakupTab === 'inclusions' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1.5">
                      <span className="font-bold text-emerald-900 block text-xs">✓ Explicitly Included:</span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-700 font-medium">
                        <li>Dedicated commercial vehicle for your group</li>
                        <li>All fuel costs for the entire booked route</li>
                        <li>Chauffeur allowance</li>
                        <li>Doorstep pickup and drop</li>
                        <li>Clean, air-conditioned vehicle</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1.5">
                      <span className="font-bold text-amber-900 block text-xs">⚠️ Payable at Actuals:</span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-700 font-medium">
                        <li>FASTag highway toll plaza deductions</li>
                        <li>Interstate border entry taxes (if crossing state borders)</li>
                        <li>Airport/railway parking fees (at actuals)</li>
                        <li>Night allowance (₹300) only if driving between 10 PM - 6 AM</li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeBreakupTab === 'terms' && (
                  <div className="space-y-2 text-slate-700 font-medium text-xs leading-relaxed">
                    <p>
                      <strong>• 30% Advance Token Policy:</strong> A 30% token payment confirms your vehicle allocation. The remaining 70% is payable directly to your driver during the journey.
                    </p>
                    <p>
                      <strong>• 100% Refundable Cancellation:</strong> Cancel free of charge up to 6 hours before departure for a full 100% refund of your advance token.
                    </p>
                    <p>
                      <strong>• Chauffeur Details:</strong> Driver name, phone number, and vehicle registration are dispatched via WhatsApp & SMS 2 hours before your scheduled pickup.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
