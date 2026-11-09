'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getLocationState, POPULAR_AUTOCOMPLETE_CITIES } from '@/lib/location-authority';
import { SITE_CONFIG } from '@/lib/seo';
import masterRoutesData from '@/lib/data/processed-master-routes.json';
import {
  calculateAdvanceToken,
  calculateRoundTripFare,
  calculateLocalRentalFare,
  resolveOneWayFare,
  resolveMultiStopRoute,
  resolveAirportFare,
  buildWhatsAppBookingLink,
  HOURLY_RENTAL_PACKAGES,
  HourlyRentalPackageId,
  BOOKING_ADDONS,
  BookingAddOn,
  isAddOnSupported,
  ADDON_PRICE_PER_ITEM,
} from '@/lib/pricing';

export type BookingServiceType = 'one_way' | 'round_trip' | 'local_rental' | 'airport_transfer';
export type VehicleCategoryKey = 'sedan' | 'suv-muv' | 'executive-suv' | 'hatchback';

export interface UnifiedBookingWidgetProps {
  initialServiceType?: BookingServiceType;
  defaultOrigin?: string;
  defaultDestination?: string;
  defaultDistanceKm?: number;
  defaultDate?: string;
  defaultTime?: string;
  defaultPackageId?: HourlyRentalPackageId;
  defaultStops?: string[];
  isDedicatedPage?: boolean;
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

export const VEHICLE_CARDS: VehicleCardDef[] = [
  {
    key: 'sedan',
    name: 'Sedan',
    models: 'Dzire, Etios, Amaze',
    seats: 4,
    bags: 2,
    image: '/fleet-brand/dzire.webp',
    badge: 'Most Popular',
    pricingCategory: 'sedan',
  },
  {
    key: 'suv-muv',
    name: 'SUV / MPV',
    models: 'Ertiga, Carens, Triber',
    seats: 6,
    bags: 4,
    image: '/fleet-brand/Ertiga.webp',
    badge: 'Family Ride',
    pricingCategory: 'suv-muv',
  },
  {
    key: 'executive-suv',
    name: 'Innova Crysta',
    models: 'Innova Crysta, Hycross',
    seats: 7,
    bags: 5,
    image: '/fleet-brand/Innova Crysta.webp',
    badge: 'Premium Luxury',
    pricingCategory: 'executive-suv',
  },
  {
    key: 'hatchback',
    name: 'Hatchback',
    models: 'WagonR, Swift, Celerio',
    seats: 4,
    bags: 1,
    image: '/fleet-brand/Hatchback.webp',
    badge: 'Budget Value',
    pricingCategory: 'hatchback',
  },
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
  defaultDate,
  defaultTime,
  defaultPackageId,
  defaultStops,
  isDedicatedPage = false,
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
  const [stops, setStops] = useState<string[]>(defaultStops || []);
  const [activeStopDropdownIndex, setActiveStopDropdownIndex] = useState<number | null>(null);
  const [distanceKm, setDistanceKm] = useState(defaultDistanceKm || 0);
  const [activeRouteId, setActiveRouteId] = useState(routeId || '');
  const [validationError, setValidationError] = useState('');

  // Autocomplete UI state
  const [originSuggestions, setOriginSuggestions] = useState<string[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<string[]>([]);
  const [stopSuggestions, setStopSuggestions] = useState<string[]>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  // Local Rental Selection (Exactly 5 Packages)
  const [rentalCity, setRentalCity] = useState('Ghaziabad');
  const [selectedPackageId, setSelectedPackageId] = useState<HourlyRentalPackageId>(defaultPackageId || '8h80km');

  // Airport Transfer Selection
  const [airportDirection, setAirportDirection] = useState<'drop' | 'pickup'>('drop');
  const [selectedAirport, setSelectedAirport] = useState(AIRPORTS_LIST[0].name);
  const [selectedZone, setSelectedZone] = useState('Ghaziabad');

  // Dates & Times
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Compute minimum booking time (current time + 45 mins buffer to prevent past/expired bookings)
  const getMinTimeForToday = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 45);
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const [pickupDate, setPickupDate] = useState(defaultDate || todayStr);
  const minTimeForToday = useMemo(() => getMinTimeForToday(), [pickupDate]);
  const [pickupTime, setPickupTime] = useState(() => {
    if (defaultTime) return defaultTime;
    const minT = getMinTimeForToday();
    return '09:00' > minT ? '09:00' : minT;
  });
  const [returnDate, setReturnDate] = useState(todayStr);
  const [returnTime, setReturnTime] = useState('20:00');
  const [numberOfDays, setNumberOfDays] = useState(1);
  const [passengerCount, setPassengerCount] = useState(2);

  // Active Vehicle Selection
  const [selectedVehicleKey, setSelectedVehicleKey] = useState<VehicleCategoryKey>('sedan');
  const [hasSearched, setHasSearched] = useState(isDedicatedPage);

  // Phase 3: Chargeable Vehicle Add-ons State
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  // Auto-deselect incompatible add-ons when switching vehicles (e.g. rooftop carrier on sedan/hatchback)
  useEffect(() => {
    setSelectedAddOns((prev) => prev.filter((id) => isAddOnSupported(id, selectedVehicleKey)));
  }, [selectedVehicleKey]);

  const selectedAddOnObjects = useMemo(() => {
    return selectedAddOns.map((id) => BOOKING_ADDONS[id]).filter(Boolean);
  }, [selectedAddOns]);

  const addOnTotal = useMemo(() => {
    return selectedAddOnObjects.length * ADDON_PRICE_PER_ITEM;
  }, [selectedAddOnObjects]);

  // Expandable Breakdown & Terms
  const [showFareBreakupModal, setShowFareBreakupModal] = useState(false);
  const [activeBreakupTab, setActiveBreakupTab] = useState<'breakup' | 'inclusions' | 'terms'>('breakup');

  // Return to Pickup location for round-trip (automatically tracks origin)
  const returnToPickupLocation = useMemo(() => {
    return origin.trim() || 'Same as Pickup Location';
  }, [origin]);

  // Match known route distance from master dataset or multi-stop resolver
  const matchKnownRoute = useCallback((orig: string, dest: string, currentStops: string[] = stops) => {
    const origClean = orig.toLowerCase().trim();
    const destClean = dest.toLowerCase().trim();
    if (!origClean || !destClean) {
      setDistanceKm(0);
      setActiveRouteId('');
      return;
    }

    const validStops = currentStops.map((s) => s.trim()).filter(Boolean);
    if (validStops.length > 0) {
      const ms = resolveMultiStopRoute(orig, validStops, dest);
      if (ms && ms.totalDistanceKm > 0) {
        setDistanceKm(ms.totalDistanceKm);
      } else {
        setDistanceKm(0);
      }
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
  }, [stops]);

  // Synchronize incoming props if explicitly provided
  useEffect(() => {
    if (defaultOrigin) setOrigin(defaultOrigin);
    if (defaultDestination) setDestination(defaultDestination);
    if (defaultDistanceKm && defaultDistanceKm > 0) {
      setDistanceKm(defaultDistanceKm);
    } else if (defaultOrigin && defaultDestination) {
      matchKnownRoute(defaultOrigin, defaultDestination, defaultStops || []);
    }
    if (defaultDate) setPickupDate(defaultDate);
    if (defaultTime) setPickupTime(defaultTime);
    if (defaultPackageId) setSelectedPackageId(defaultPackageId);
    if (defaultStops && defaultStops.length > 0) setStops(defaultStops);
    if (routeId) setActiveRouteId(routeId);
    if (initialServiceType) setServiceType(initialServiceType);
  }, [defaultOrigin, defaultDestination, defaultDistanceKm, defaultDate, defaultTime, defaultPackageId, defaultStops, routeId, initialServiceType, matchKnownRoute]);

  // Handle Autocomplete
  const handleOriginChange = (val: string) => {
    setOrigin(val);
    setValidationError('');
    if (val.trim().length > 0) {
      const filtered = TOP_CITIES.filter((c) => c.toLowerCase().includes(val.toLowerCase()) || getLocationState(c).toLowerCase().includes(val.toLowerCase()));
      setOriginSuggestions(filtered);
      setShowOriginDropdown(filtered.length > 0);
    } else {
      setShowOriginDropdown(false);
    }
    matchKnownRoute(val, destination, stops);
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
    matchKnownRoute(origin, val, stops);
  };

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
    matchKnownRoute(destination, temp, stops);
  };

  // Add Stop Handlers
  const handleAddStop = () => {
    if (stops.length < 5) {
      const updated = [...stops, ''];
      setStops(updated);
      setValidationError('');
    }
  };

  const handleRemoveStop = (index: number) => {
    const updated = stops.filter((_, i) => i !== index);
    setStops(updated);
    setValidationError('');
    matchKnownRoute(origin, destination, updated);
  };

  const handleStopChange = (index: number, val: string) => {
    const updated = [...stops];
    updated[index] = val;
    setStops(updated);
    setValidationError('');
    if (val.trim().length > 0) {
      const filtered = TOP_CITIES.filter((c) => c.toLowerCase().includes(val.toLowerCase()));
      setStopSuggestions(filtered);
      setActiveStopDropdownIndex(index);
    } else {
      setActiveStopDropdownIndex(null);
    }
    matchKnownRoute(origin, destination, updated);
  };

  // Date & Time handlers
  const handlePickupDateChange = (val: string) => {
    if (val < todayStr) val = todayStr;
    setPickupDate(val);
    setValidationError('');
    if (val === todayStr) {
      const minT = getMinTimeForToday();
      if (pickupTime < minT) {
        setPickupTime(minT);
      }
    }
    if (returnDate < val) {
      setReturnDate(val);
      setNumberOfDays(1);
    } else {
      const diffTime = Math.abs(new Date(returnDate).getTime() - new Date(val).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setNumberOfDays(Math.max(1, diffDays));
    }
  };

  const handlePickupTimeChange = (val: string) => {
    if (pickupDate === todayStr) {
      const minT = getMinTimeForToday();
      if (val < minT) {
        setValidationError(`Selected pickup time has already passed. Earliest pickup is ${minT}.`);
        setPickupTime(minT);
        return;
      }
    }
    setValidationError('');
    setPickupTime(val);
  };

  const handleReturnDateChange = (val: string) => {
    if (val < pickupDate) {
      setValidationError('Return date cannot precede pickup date.');
      return;
    }
    setReturnDate(val);
    setValidationError('');
    const diffTime = Math.abs(new Date(val).getTime() - new Date(pickupDate).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    setNumberOfDays(Math.max(1, diffDays));
  };

  // ---------------------------------------------------------------------------
  // LIVE FARE CALCULATION ENGINE
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
      const pkg = HOURLY_RENTAL_PACKAGES.find((p) => p.id === selectedPackageId);
      return `${pkg?.name || selectedPackageId} Local Tour`;
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
        requiresConfirmation?: boolean;
        confirmationMessage?: string;
        estimatedToll: number;
        distanceKm: number;
        durationText?: string;
        billableKm?: number;
        driverAllowance?: number;
      }
    > = {};

    const validStops = stops.map((s) => s.trim()).filter(Boolean);

    if (serviceType === 'one_way') {
      if (validStops.length > 0) {
        const multi = resolveMultiStopRoute(origin, validStops, destination);
        if (multi && multi.isReliablyCalculated) {
          VEHICLE_CARDS.forEach((v) => {
            let fare = multi.sedanFare;
            if (v.key === 'suv-muv') fare = multi.ertigaFare;
            else if (v.key === 'executive-suv') fare = multi.crystaFare;
            else if (v.key === 'hatchback') fare = Math.round(multi.sedanFare * 0.88);

            const tokenAmount = calculateAdvanceToken(fare, 30);
            quotes[v.key] = {
              fare,
              tokenAmount,
              balanceAmount: fare - tokenAmount,
              isFixed: true,
              estimatedToll: multi.estimatedToll,
              distanceKm: multi.totalDistanceKm,
              durationText: multi.durationText,
            };
          });
        } else {
          // Unmapped intermediate stops: do NOT calculate misleading fare
          VEHICLE_CARDS.forEach((v) => {
            quotes[v.key] = {
              fare: 0,
              tokenAmount: 0,
              balanceAmount: 0,
              isFixed: false,
              requiresWhatsAppQuote: true,
              estimatedToll: 0,
              distanceKm: multi?.totalDistanceKm || 0,
              durationText: multi?.durationText,
            };
          });
        }
      } else {
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
      }
    } else if (serviceType === 'round_trip') {
      const roundTripDist = distanceKm || 200;
      VEHICLE_CARDS.forEach((v) => {
        const rt = calculateRoundTripFare(roundTripDist, numberOfDays, v.pricingCategory);
        quotes[v.key] = {
          fare: rt.totalFare,
          tokenAmount: rt.tokenAmount,
          balanceAmount: rt.balanceAmount,
          isFixed: true,
          estimatedToll: Math.round(roundTripDist * 3.2),
          distanceKm: rt.actualDistanceKm,
          billableKm: rt.billableKm,
          driverAllowance: rt.totalDriverAllowance,
        };
      });
    } else if (serviceType === 'local_rental') {
      VEHICLE_CARDS.forEach((v) => {
        const local = calculateLocalRentalFare(selectedPackageId, v.pricingCategory);
        if (local.isFixed) {
          quotes[v.key] = {
            fare: local.basePrice,
            tokenAmount: local.tokenAmount,
            balanceAmount: local.balanceAmount,
            isFixed: true,
            estimatedToll: 0,
            distanceKm: local.km,
            durationText: `${local.hours} Hours`,
          };
        } else {
          // 4/40, 6/60, 10/100: Do NOT invent fares
          quotes[v.key] = {
            fare: 0,
            tokenAmount: 0,
            balanceAmount: 0,
            isFixed: false,
            requiresConfirmation: true,
            confirmationMessage: local.confirmationMessage,
            estimatedToll: 0,
            distanceKm: local.km,
            durationText: `${local.hours} Hours`,
          };
        }
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
    stops,
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

  // WhatsApp Quote Link with optional Add-ons
  const whatsAppUrl = useMemo(() => {
    const vCard = VEHICLE_CARDS.find((v) => v.key === selectedVehicleKey) || VEHICLE_CARDS[0];
    const fare = (activeVehicleQuote?.fare || 0) + addOnTotal;
    const addOnNote = selectedAddOns.length > 0
      ? `Requested Add-ons: ${selectedAddOns.map(id => BOOKING_ADDONS[id]?.name).join(', ')} (+₹${addOnTotal})`
      : undefined;

    const currentKm = activeVehicleQuote?.distanceKm || distanceKm || 0;
    const tripKm = serviceType === 'round_trip'
      ? Math.max(currentKm * 2, numberOfDays * 250)
      : currentKm;

    return buildWhatsAppBookingLink({
      serviceType: serviceTypeLabel,
      vehicleName: vCard.name,
      origin: effectiveOrigin || 'Delhi NCR',
      destination: effectiveDestination || 'Outstation',
      travelDate: pickupDate,
      travelTime: pickupTime,
      returnDate: serviceType === 'round_trip' ? returnDate : undefined,
      returnTime: serviceType === 'round_trip' ? returnTime : undefined,
      numberOfDays: serviceType === 'round_trip' ? numberOfDays : undefined,
      distanceKm: tripKm > 0 ? tripKm : undefined,
      estimatedFare: fare,
      pageUrl: typeof window !== 'undefined' ? window.location.href : 'https://www.urgenttaxis.in',
      customNote: addOnNote,
    });
  }, [
    selectedAddOns,
    addOnTotal,
    selectedVehicleKey,
    activeVehicleQuote,
    serviceTypeLabel,
    effectiveOrigin,
    effectiveDestination,
    pickupDate,
    pickupTime,
    serviceType,
    returnDate,
    returnTime,
    numberOfDays,
    distanceKm,
  ]);

  // Custom WhatsApp quote link for unmapped routes or multi-stop
  const customWhatsAppUrl = useMemo(() => {
    const validStops = stops.map((s) => s.trim()).filter(Boolean);
    const stopDetails = validStops.length > 0 ? ` with stops: ${validStops.join(', ')}` : '';
    const currentKm = distanceKm || 0;
    const tripKm = serviceType === 'round_trip' ? Math.max(currentKm * 2, numberOfDays * 250) : currentKm;
    return buildWhatsAppBookingLink({
      serviceType: serviceTypeLabel,
      vehicleName: 'Sedan / SUV',
      origin: origin || 'Pickup City',
      destination: `${destination || 'Drop City'}${stopDetails}`,
      travelDate: pickupDate,
      travelTime: pickupTime,
      returnDate: serviceType === 'round_trip' ? returnDate : undefined,
      returnTime: serviceType === 'round_trip' ? returnTime : undefined,
      numberOfDays: serviceType === 'round_trip' ? numberOfDays : undefined,
      distanceKm: tripKm > 0 ? tripKm : undefined,
      pageUrl: typeof window !== 'undefined' ? window.location.href : 'https://www.urgenttaxis.in',
    });
  }, [serviceTypeLabel, origin, destination, stops, pickupDate, pickupTime, serviceType, returnDate, returnTime, numberOfDays, distanceKm]);

  // Submit Handler -> Navigate to Checkout
  const handleProceedToCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (pickupDate < todayStr) {
      setValidationError('Departure date cannot be in the past.');
      return;
    }

    if (pickupDate === todayStr) {
      const minT = getMinTimeForToday();
      if (pickupTime < minT) {
        setValidationError(`Selected pickup time has already passed. Earliest dispatch is ${minT}.`);
        return;
      }
    }

    if (!hasRequiredLocations) {
      setValidationError('Please enter both pickup and destination to view live fares and book.');
      return;
    }

    if (stops.some((s) => !s.trim())) {
      setValidationError('Please enter a location for all added stops or remove empty stop fields.');
      return;
    }

    if (serviceType === 'round_trip') {
      if (returnDate < pickupDate) {
        setValidationError('Return date cannot precede pickup date.');
        return;
      }
      if (returnDate === pickupDate && returnTime <= pickupTime) {
        setValidationError('Return time must be later than pickup time for same-day round trips.');
        return;
      }
    }

    setValidationError('');

    const baseFare = activeVehicleQuote?.fare || 0;
    const totalFare = baseFare > 0 ? baseFare + addOnTotal : 0;
    const token = calculateAdvanceToken(totalFare, 30);
    const balance = totalFare > 0 ? totalFare - token : 0;

    const query = new URLSearchParams({
      serviceType,
      categoryId: selectedVehicleKey,
      origin: effectiveOrigin,
      destination: effectiveDestination,
      distanceKm: String(distanceKm || 200),
      pickupDate,
      pickupTime,
      passengers: String(passengerCount),
      fare: String(totalFare),
      token: String(token),
      balance: String(balance),
    });

    if (selectedAddOns.length > 0) {
      query.set('addOns', selectedAddOns.join(','));
    }

    if (stops.length > 0) {
      query.set('stops', stops.join('|'));
    }

    if (serviceType === 'round_trip') {
      query.set('returnDate', returnDate);
      query.set('returnTime', returnTime);
      query.set('days', String(numberOfDays));
      query.set('returnTo', returnToPickupLocation);
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
      const el = document.getElementById(
        serviceType === 'one_way' || serviceType === 'round_trip' ? 'booking-pickup' : 'rental-city'
      );
      el?.focus();
      return;
    }

    if (stops.some((s) => !s.trim())) {
      setValidationError('Please enter a location for all added stops or remove empty stop fields.');
      return;
    }

    if (serviceType === 'round_trip') {
      if (returnDate < pickupDate) {
        setValidationError('Return date cannot precede pickup date.');
        return;
      }
      if (returnDate === pickupDate && returnTime <= pickupTime) {
        setValidationError('Return time must be later than pickup time for same-day round trips.');
        return;
      }
    }

    setValidationError('');
    setHasSearched(true);

    // If already on /cabs page or in dedicated results mode, smooth scroll to cab selection panel
    if (isDedicatedPage || (typeof window !== 'undefined' && window.location.pathname.startsWith('/cabs'))) {
      const el = document.getElementById('cab-selection-panel');
      el?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Navigate to dedicated vehicle results page
    const query = new URLSearchParams({
      serviceType,
      pickup: effectiveOrigin,
      drop: effectiveDestination,
      date: pickupDate,
      time: pickupTime,
      passengers: String(passengerCount),
    });

    if (distanceKm > 0) query.set('distanceKm', String(distanceKm));
    if (stops.length > 0) query.set('stops', stops.join('|'));
    if (serviceType === 'round_trip') {
      query.set('returnDate', returnDate);
      query.set('returnTime', returnTime);
      query.set('days', String(numberOfDays));
      query.set('returnTo', returnToPickupLocation);
    } else if (serviceType === 'local_rental') {
      query.set('packageId', selectedPackageId);
      query.set('city', rentalCity);
    } else if (serviceType === 'airport_transfer') {
      query.set('airport', selectedAirport);
      query.set('direction', airportDirection);
      query.set('zone', selectedZone);
    }

    router.push(`/cabs?${query.toString()}`);
  };

  return (
    <div className={`bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden font-sans ${className}`}>
      {/* 1. TOP SERVICE MODE SELECTOR TABS */}
      <div className="bg-slate-100/90 p-2 sm:p-2.5 border-b border-slate-200">
        {/* DESKTOP TABS: 4 Clear Service Options */}
        <div className="hidden md:grid md:grid-cols-4 gap-2">
          {[
            { id: 'one_way', label: 'One-way Outstation', icon: '↗' },
            { id: 'round_trip', label: 'Round-trip Outstation', icon: '🔁' },
            { id: 'airport_transfer', label: 'Airport Transfer', icon: '✈' },
            { id: 'local_rental', label: 'Hourly Rentals', icon: '⏱' },
          ].map((tab) => {
            const isActive = serviceType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                id={`desktop-tab-${tab.id}`}
                onClick={() => {
                  setServiceType(tab.id as BookingServiceType);
                  setValidationError('');
                }}
                className={`min-h-[44px] flex items-center justify-center gap-2 py-3 px-3 rounded-2xl font-bold text-xs lg:text-sm transition-all cursor-pointer ${
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

        {/* MOBILE TABS: Parent Category with Sub-choice */}
        <div className="md:hidden space-y-2">
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-white rounded-2xl border border-slate-200">
            <button
              type="button"
              id="mobile-tab-outstation"
              onClick={() => {
                if (serviceType !== 'one_way' && serviceType !== 'round_trip') {
                  setServiceType('one_way');
                }
                setValidationError('');
              }}
              className={`py-2 px-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer ${
                serviceType === 'one_way' || serviceType === 'round_trip'
                  ? 'bg-[#1e1b4b] text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>🚗</span>
              <span className="truncate">Outstation</span>
            </button>
            <button
              type="button"
              id="mobile-tab-airport"
              onClick={() => {
                setServiceType('airport_transfer');
                setValidationError('');
              }}
              className={`py-2 px-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer ${
                serviceType === 'airport_transfer'
                  ? 'bg-[#1e1b4b] text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>✈</span>
              <span className="truncate">Airport</span>
            </button>
            <button
              type="button"
              id="mobile-tab-rental"
              onClick={() => {
                setServiceType('local_rental');
                setValidationError('');
              }}
              className={`py-2 px-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer ${
                serviceType === 'local_rental'
                  ? 'bg-[#1e1b4b] text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>⏱</span>
              <span className="truncate">Hourly</span>
            </button>
          </div>

          {/* Outstation Sub-toggle: One-way vs Round-trip */}
          {(serviceType === 'one_way' || serviceType === 'round_trip') && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/70 rounded-xl">
              <button
                type="button"
                id="mobile-subtab-oneway"
                onClick={() => setServiceType('one_way')}
                className={`py-1.5 px-3 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  serviceType === 'one_way' ? 'bg-white text-[#1e1b4b] shadow-xs' : 'text-slate-600'
                }`}
              >
                ↗ One-way
              </button>
              <button
                type="button"
                id="mobile-subtab-roundtrip"
                onClick={() => setServiceType('round_trip')}
                className={`py-1.5 px-3 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  serviceType === 'round_trip' ? 'bg-white text-[#1e1b4b] shadow-xs' : 'text-slate-600'
                }`}
              >
                🔁 Round-trip
              </button>
            </div>
          )}
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
          <div className="space-y-3">
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
                    onBlur={() => setTimeout(() => setShowOriginDropdown(false), 200)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setShowOriginDropdown(false);
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
                        matchKnownRoute('', destination, stops);
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
                          matchKnownRoute(city, destination, stops);
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
                  id="swap-locations-button"
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
                    onBlur={() => setTimeout(() => setShowDestDropdown(false), 200)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setShowDestDropdown(false);
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
                        matchKnownRoute(origin, '', stops);
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
                          matchKnownRoute(origin, city, stops);
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

            {/* INTERMEDIATE STOPS SECTION */}
            <div className="space-y-2 pt-1">
              {stops.map((stop, idx) => (
                <div key={idx} className="relative flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-brand-blue bg-blue-50 px-2 py-1 rounded-md shrink-0">
                    Stop {idx + 1}
                  </span>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={stop}
                      id={`stop-input-${idx}`}
                      onChange={(e) => handleStopChange(idx, e.target.value)}
                      onBlur={() => setTimeout(() => setActiveStopDropdownIndex(null), 200)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setActiveStopDropdownIndex(null);
                      }}
                      placeholder={`Enter intermediate stop ${idx + 1}...`}
                      className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1e1b4b]"
                    />
                    {activeStopDropdownIndex === idx && stopSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-40 overflow-y-auto">
                        {stopSuggestions.map((city) => (
                          <div
                            key={city}
                            onClick={() => {
                              handleStopChange(idx, city);
                              setActiveStopDropdownIndex(null);
                            }}
                            className="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 cursor-pointer"
                          >
                            {city}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveStop(idx)}
                    id={`remove-stop-${idx}`}
                    title="Remove this stop"
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <div className="flex items-center justify-between">
                {stops.length < 5 && (
                  <button
                    type="button"
                    id="add-stop-button"
                    onClick={handleAddStop}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1e1b4b] hover:text-brand-green py-2 px-3.5 min-h-[40px] rounded-lg border border-slate-200 hover:border-brand-green bg-white shadow-2xs cursor-pointer transition-colors"
                  >
                    <span>＋</span>
                    <span>Add Intermediate Stop</span>
                  </button>
                )}

                {/* Journey Sequence Badge */}
                {stops.filter(Boolean).length > 0 && origin && destination && (
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full truncate max-w-md">
                    Sequence: {origin} ➔ {stops.filter(Boolean).join(' ➔ ')} ➔ {destination}
                  </span>
                )}
              </div>
            </div>

            {/* ROUND-TRIP RETURN TO PICKUP AUTOMATIC SYNC */}
            {serviceType === 'round_trip' && (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-brand-blue font-bold">🔁 Return Location:</span>
                  <span className="font-semibold text-slate-800">
                    {returnToPickupLocation} (automatically returns to your pickup address)
                  </span>
                </div>
                <span className="text-[10px] uppercase font-black text-brand-blue tracking-wider bg-white px-2 py-0.5 rounded-full border border-blue-200">
                  Auto Synced
                </span>
              </div>
            )}
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

            {/* Exactly 5 Hourly Packages */}
            <div>
              <label htmlFor="rental-package" className="block text-slate-800 font-bold mb-1 text-xs uppercase tracking-wider">
                Select Hourly Package <span className="text-rose-500">*</span>
              </label>
              <select
                id="rental-package"
                value={selectedPackageId}
                onChange={(e) => setSelectedPackageId(e.target.value as HourlyRentalPackageId)}
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl px-4 py-3 font-semibold text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] focus:bg-white transition-all cursor-pointer"
              >
                {HOURLY_RENTAL_PACKAGES.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} {pkg.hasApprovedRate ? '(Instant Online Fare)' : '(Rate on Request)'}
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
                id="airport-direction-drop"
                onClick={() => setAirportDirection('drop')}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  airportDirection === 'drop' ? 'bg-[#1e1b4b] text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                Drop at Airport
              </button>
              <button
                type="button"
                id="airport-direction-pickup"
                onClick={() => setAirportDirection('pickup')}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  airportDirection === 'pickup' ? 'bg-[#1e1b4b] text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                Pickup from Airport
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="airport-select" className="block text-slate-800 font-bold mb-1 text-xs uppercase tracking-wider">
                  Airport Selection
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
              Journey Date
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
              Journey Time
            </label>
            <input
              id="pickup-time"
              type="time"
              min={pickupDate === todayStr ? minTimeForToday : undefined}
              value={pickupTime}
              onChange={(e) => handlePickupTimeChange(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl px-4 py-3 font-semibold text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] focus:bg-white transition-all"
            />
          </div>

          {/* Return Date / Time (Round-Trip Only) */}
          {serviceType === 'round_trip' ? (
            <>
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
              <div>
                <label htmlFor="return-time" className="block text-slate-800 font-bold mb-1 text-xs uppercase tracking-wider">
                  Return Time
                </label>
                <input
                  id="return-time"
                  type="time"
                  value={returnTime}
                  onChange={(e) => setReturnTime(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl px-4 py-3 font-semibold text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] focus:bg-white transition-all"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-slate-800 font-bold mb-1 text-xs uppercase tracking-wider">
                  Estimated Distance
                </label>
                <div className="w-full bg-slate-100 text-slate-800 border border-slate-200 rounded-2xl px-4 py-3 tabular-nums font-bold text-sm">
                  {distanceKm > 0 ? `${distanceKm} KM` : 'Enter route above'}
                </div>
              </div>

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
            </>
          )}
        </div>

        {/* SEARCH CABS ACTION ROW */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="button"
            id="search-cabs-button"
            onClick={handleCalculateClick}
            className="w-full sm:w-auto px-10 py-3.5 bg-[#059669] hover:bg-[#047857] text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🔍</span>
            <span>Search Cabs</span>
          </button>
        </div>

        {/* 4. LIVE FARE CALCULATION & VEHICLE CARDS */}
        {(isDedicatedPage || hasSearched) ? (
          !hasRequiredLocations ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-200 text-slate-700 text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">💡</span>
              <span className="font-medium">
                Enter your pickup and destination above to see instant fares for all cab categories.
              </span>
            </div>
          </div>
        ) : activeVehicleQuote?.requiresWhatsAppQuote ? (
          <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 text-slate-800 text-xs sm:text-sm space-y-3 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-brand-blue">
              <span className="text-base">🚗</span>
              <span>Custom Route Corridor: ~{distanceKm > 0 ? `${distanceKm} KM` : 'Intermediate Stops'}</span>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium">
              This route contains intermediate stops or unmapped corridors. We provide instant custom quotes with verified commercial cabs and local chauffeurs.
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

            {/* Vehicle Tiers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {VEHICLE_CARDS.map((v) => {
                const isSelected = selectedVehicleKey === v.key;
                const quote = vehicleQuotes[v.key];
                const isConfirmationOnly = quote?.requiresConfirmation;
                const baseFare = quote?.fare || 0;
                const cardAddOns = selectedAddOns.filter((id) => isAddOnSupported(id, v.key));
                const cardAddOnTotal = cardAddOns.length * ADDON_PRICE_PER_ITEM;
                const fare = baseFare > 0 ? baseFare + cardAddOnTotal : 0;
                const token = calculateAdvanceToken(fare, 30);
                const balance = fare > 0 ? fare - token : 0;

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
                      {isConfirmationOnly ? (
                        <div className="space-y-2">
                          <div className="flex items-baseline justify-between">
                            <span className="font-bold text-brand-blue text-sm">Rate on Request</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Dispatch Quote</span>
                          </div>
                          <div className="p-2.5 bg-blue-50/70 rounded-xl text-xs text-brand-blue font-medium">
                            Base rate for this package confirmed instantly via WhatsApp without surge.
                          </div>
                          <a
                            href={cardWhatsAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="w-full py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 text-center cursor-pointer"
                          >
                            💬 Confirm Rate on WhatsApp
                          </a>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-baseline justify-between">
                            <div>
                              <span className="font-black text-slate-900 tabular-nums text-xl sm:text-2xl">
                                ₹{fare.toLocaleString('en-IN')}
                              </span>
                              {cardAddOnTotal > 0 && (
                                <span className="block text-[10px] text-slate-500 font-medium">
                                  ₹{baseFare.toLocaleString('en-IN')} base + ₹{cardAddOnTotal} add-ons
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-bold text-slate-500 uppercase">
                              {serviceType === 'one_way' ? 'One-Way' : serviceType === 'round_trip' ? 'Total' : 'Base'}
                            </span>
                          </div>

                          {/* 30% Token & 70% Driver Balance breakdown */}
                          <div className="bg-slate-50 rounded-xl p-2.5 space-y-1 text-xs border border-slate-200/80">
                            <div className="flex items-center justify-between">
                              <span className="text-emerald-700 font-bold">30% Advance Token:</span>
                              <span className="tabular-nums font-black text-emerald-800">₹{token.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-600">
                              <span className="font-medium">70% Driver Balance:</span>
                              <span className="tabular-nums font-bold text-slate-800">₹{balance.toLocaleString('en-IN')}</span>
                            </div>
                          </div>

                          {/* Inclusions summary */}
                          <div className="text-[10px] text-slate-500 font-medium space-y-0.5 pt-0.5">
                            <p className="text-emerald-700 font-bold">✓ Fuel, chauffeur & AC included</p>
                            <p className="text-slate-500 font-medium">ℹ Tolls & parking extra at actuals</p>
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
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Phase 3: Chargeable Vehicle Add-ons Section */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50/50 via-blue-50/20 to-slate-50 rounded-2xl border border-blue-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                      <span>✨</span> Optional Trip Add-ons
                    </h4>
                    <span className="text-[10px] font-bold bg-brand-green/10 text-brand-green px-2 py-0.5 rounded-full border border-brand-green/20">
                      ₹300 per add-on
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Customise your trip with owner-approved preferences. Fixed at ₹300 per selection (All 3 = ₹900).
                  </p>
                </div>
                {selectedAddOns.length > 0 && (
                  <div className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 self-start sm:self-auto flex items-center gap-1.5">
                    <span>✓ {selectedAddOns.length} Add-on{selectedAddOns.length > 1 ? 's' : ''} Selected:</span>
                    <span className="tabular-nums font-black text-emerald-900">+₹{addOnTotal}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.values(BOOKING_ADDONS).map((addon) => {
                  const isCompatible = isAddOnSupported(addon.id, selectedVehicleKey);
                  const isSelected = selectedAddOns.includes(addon.id);

                  return (
                    <div
                      key={addon.id}
                      onClick={() => {
                        if (!isCompatible) return;
                        setSelectedAddOns((prev) =>
                          prev.includes(addon.id) ? prev.filter((id) => id !== addon.id) : [...prev, addon.id]
                        );
                      }}
                      className={`p-3.5 rounded-xl border transition-all select-none ${
                        !isCompatible
                          ? 'bg-slate-100/70 border-slate-200 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'bg-white border-[#1e1b4b] ring-2 ring-[#1e1b4b]/20 cursor-pointer shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <label className="flex items-center gap-2 cursor-pointer pointer-events-none">
                          <input
                            type="checkbox"
                            checked={isSelected && isCompatible}
                            disabled={!isCompatible}
                            readOnly
                            className="w-4 h-4 text-[#1e1b4b] rounded border-slate-300 focus:ring-[#1e1b4b] cursor-pointer"
                          />
                          <span className="font-bold text-xs text-slate-900 leading-tight">{addon.name}</span>
                        </label>
                        <span className="tabular-nums font-black text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                          +₹{addon.price}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-snug pl-6 mb-1.5">{addon.shortDescription}</p>

                      {!isCompatible ? (
                        <p className="text-[10px] text-rose-600 font-semibold pl-6 flex items-center gap-1">
                          <span>⚠️</span> {addon.ineligibleMessage || 'Not compatible with this vehicle.'}
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic pl-6">{addon.disclaimer}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="text-[10px] text-slate-500 italic pt-1">
                *Note: Add-on selections represent customer preferences and are subject to fleet operational availability upon vehicle assignment.
              </p>
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
                    {stops.filter(Boolean).length > 0 && (
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span>Intermediate Stops:</span>
                        <strong className="text-slate-900">{stops.filter(Boolean).join(', ')}</strong>
                      </div>
                    )}
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
                    {addOnTotal > 0 && (
                      <div className="flex justify-between py-1 border-b border-slate-200 text-brand-blue">
                        <span>Selected Add-ons ({selectedAddOns.length}):</span>
                        <strong className="tabular-nums font-bold">+₹{addOnTotal}</strong>
                      </div>
                    )}
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span>Advance Token (30%):</span>
                      <strong className="text-emerald-700">
                        ₹{calculateAdvanceToken((activeVehicleQuote?.fare || 0) + addOnTotal, 30).toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Driver Balance (70%):</span>
                      <strong className="text-slate-900">
                        ₹{Math.max(0, ((activeVehicleQuote?.fare || 0) + addOnTotal) - calculateAdvanceToken((activeVehicleQuote?.fare || 0) + addOnTotal, 30)).toLocaleString('en-IN')}
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
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <span className="font-bold text-brand-blue block text-xs">⚠️ Payable at Actuals:</span>
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
        )) : null}
      </form>
    </div>
  );
}
