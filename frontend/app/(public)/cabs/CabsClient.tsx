'use client';

/**
 * CabsClient — Authentic MakeMyTrip (MMT) Style Vehicle Selection Page
 *
 * OWNER & USER MANDATES:
 * 1. "hum address field me jo bhi location daalein pickup me aur drop me us location aur us address se bhi fare show hona chahiye"
 * 2. "duniya ki har location se fare search hone par fare show hona chahiye iske liye perfect scenerio apply karo"
 * 3. "jaise hi koi search kare to us baad select vehicle wale page par jaise mmt show karta hai inlcude exclude jis trip type section me wo jo show karta hai sab kuch same show hona chahiye"
 * 4. "fleet ki type ke hisaab se dikhana hai har jagah fleet ko like as HATCHBAK, SEDAN, ERTIGA, SUV/MUV, INNOVA, INNOVA CRYSTA, TEMPO AND OTHER AFTER THESE LIKE SHOW AS FLLEET PAGE PAS JAISE HAI SAME WAISE HI SHOW HONE CHAHIYE SERIES ME"
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaRoad,
  FaEdit,
  FaCheckCircle,
  FaTimesCircle,
  FaWhatsapp,
  FaShieldAlt,
  FaUserFriends,
  FaSuitcase,
  FaSnowflake,
  FaStar,
  FaTimes,
  FaArrowRight,
  FaInfoCircle,
} from 'react-icons/fa';
import { SITE_CONFIG } from '@/lib/seo';
import { resolveAccurateRoute } from '@/lib/distance-resolver';
import {
  calculateAdvanceToken,
  calculateRoundTripFare,
  calculateLocalRentalFare,
  resolveAirportFare,
  HourlyRentalPackageId,
  LOCAL_RENTAL_CONFIG,
} from '@/lib/pricing';

export type BookingServiceType = 'one_way' | 'round_trip' | 'local_rental' | 'airport_transfer';
export type VehicleFilterKey =
  | 'all'
  | 'hatchback'
  | 'sedan'
  | 'ertiga'
  | 'suv-muv'
  | 'innova'
  | 'executive-suv';

interface VehicleCardData {
  key: string;
  filterKey: VehicleFilterKey;
  name: string;
  models: string;
  seats: string;
  bags: string;
  image: string;
  badge: string;
  badgeColor: string;
  totalFare: number;
  originalPrice: number;
  discountText: string;
  tokenAmount: number;
  balanceAmount: number;
  perKmRate: string;
  inclusions: string[];
  exclusions: string[];
}

export default function CabsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read URL query params (accepts arbitrary addresses, locations, pincodes)
  const initialServiceType = (searchParams.get('serviceType') as BookingServiceType) || 'one_way';
  const initialPickup = searchParams.get('pickup') || searchParams.get('origin') || 'Ghaziabad, Uttar Pradesh';
  const initialDrop = searchParams.get('drop') || searchParams.get('destination') || 'Nainital, Uttarakhand';
  const initialDate = searchParams.get('date') || searchParams.get('pickupDate') || '';
  const initialTime = searchParams.get('time') || searchParams.get('pickupTime') || '09:00';
  const initialDistanceKm = Number(searchParams.get('distanceKm') || searchParams.get('km') || 0);
  const initialPackageId = (searchParams.get('packageId') as HourlyRentalPackageId) || '8h80km';

  // State
  const [serviceType, setServiceType] = useState<BookingServiceType>(initialServiceType);
  const [pickup, setPickup] = useState(initialPickup);
  const [drop, setDrop] = useState(initialDrop);
  const [journeyDate, setJourneyDate] = useState(initialDate);
  const [journeyTime, setJourneyTime] = useState(initialTime);
  const [isModifyOpen, setIsModifyOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<VehicleFilterKey>('all');
  const [activeTabMap, setActiveTabMap] = useState<Record<string, 'inclusions' | 'exclusions'>>({});

  // Form draft state for modify drawer
  const [editPickup, setEditPickup] = useState(initialPickup);
  const [editDrop, setEditDrop] = useState(initialDrop);
  const [editDate, setEditDate] = useState(initialDate);
  const [editTime, setEditTime] = useState(initialTime);
  const [editServiceType, setEditServiceType] = useState<BookingServiceType>(initialServiceType);

  // Sync when searchParams change
  useEffect(() => {
    if (initialPickup) {
      setPickup(initialPickup);
      setEditPickup(initialPickup);
    }
    if (initialDrop) {
      setDrop(initialDrop);
      setEditDrop(initialDrop);
    }
    if (initialDate) {
      setJourneyDate(initialDate);
      setEditDate(initialDate);
    }
    if (initialTime) {
      setJourneyTime(initialTime);
      setEditTime(initialTime);
    }
    if (initialServiceType) {
      setServiceType(initialServiceType);
      setEditServiceType(initialServiceType);
    }
  }, [initialPickup, initialDrop, initialDate, initialTime, initialServiceType]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Compute minimum booking time (current time + 45 mins buffer to prevent past/expired bookings)
  const getMinTimeForToday = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 45);
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const minTimeForToday = useMemo(() => getMinTimeForToday(), [editDate]);

  // Set default date if blank
  useEffect(() => {
    if (!journeyDate) {
      setJourneyDate(todayStr);
      setEditDate(todayStr);
    }
  }, [journeyDate, todayStr]);

  // Calculate Accurate Highway Distance & Driving Duration for ANY address or location
  const routeData = useMemo(() => {
    if (serviceType === 'local_rental') {
      const pkg = LOCAL_RENTAL_CONFIG.sedan[initialPackageId] || LOCAL_RENTAL_CONFIG.sedan['8h80km'];
      return {
        origin: pickup,
        destination: `${pkg.hours} Hrs / ${pkg.km} KM Local City Package`,
        distanceKm: pkg.km,
        durationMinutes: pkg.hours * 60,
        durationText: `${pkg.hours} Hours Package`,
        isHillRoute: false,
        isFromMasterData: true,
      };
    }

    if (serviceType === 'airport_transfer') {
      const safePickup = pickup || 'Ghaziabad';
      const safeDrop = drop || 'Delhi IGI Airport (T1, T2, T3)';
      const accurate = resolveAccurateRoute(safePickup, safeDrop, initialDistanceKm);
      return {
        origin: safePickup,
        destination: safeDrop,
        distanceKm: accurate.distanceKm || 45,
        durationMinutes: accurate.durationMinutes || 75,
        durationText: accurate.durationText || '1 hr 15 mins',
        isHillRoute: false,
        isFromMasterData: accurate.isFromMasterData,
      };
    }

    return resolveAccurateRoute(pickup, drop, initialDistanceKm);
  }, [pickup, drop, serviceType, initialDistanceKm, initialPackageId]);

  // Format readable display date (e.g. "Sun, 8 Nov 2026")
  const formattedDate = useMemo(() => {
    if (!journeyDate) return 'Today';
    try {
      const [y, m, d] = journeyDate.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      return dt.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return journeyDate;
    }
  }, [journeyDate]);

  // Format readable time (e.g. "09:00 AM")
  const formattedTime = useMemo(() => {
    if (!journeyTime) return '09:00 AM';
    try {
      const [h, m] = journeyTime.split(':').map(Number);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 || 12;
      return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
    } catch {
      return journeyTime;
    }
  }, [journeyTime]);

  // Handle Modify Form Submit
  const handleModifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editDate < todayStr) {
      alert('Departure date cannot be in the past.');
      return;
    }
    if (editDate === todayStr) {
      const minT = getMinTimeForToday();
      if (editTime < minT) {
        alert(`Selected pickup time has already passed. Earliest pickup is ${minT}.`);
        return;
      }
    }
    setPickup(editPickup);
    setDrop(editDrop);
    setJourneyDate(editDate);
    setJourneyTime(editTime);
    setServiceType(editServiceType);
    setIsModifyOpen(false);

    // Update URL shallowly
    const p = new URLSearchParams();
    p.set('serviceType', editServiceType);
    p.set('pickup', editPickup);
    p.set('drop', editDrop);
    p.set('date', editDate);
    p.set('time', editTime);
    router.replace(`/cabs?${p.toString()}`);
  };

  // ---------------------------------------------------------------------------
  // BUILD COMPLETE 9-VEHICLE FLEET SERIES (MATCHING /fleet PAGE ORDER)
  // Series: 1. HATCHBACK -> 2. SEDAN -> 3. ERTIGA -> 4. SUV/MUV -> 5. INNOVA
  //         -> 6. INNOVA CRYSTA -> 7. TEMPO TRAVELLER -> 8. URBANIA -> 9. BUS
  // ---------------------------------------------------------------------------
  const vehiclesList = useMemo<VehicleCardData[]>(() => {
    const dist = routeData.distanceKm;

    // Base fare calculations
    let sedanFare = 0;
    let ertigaFare = 0;
    let crystaFare = 0;
    let hatchbackFare = 0;
    let suvMuvFare = 0;
    let innovaFare = 0;
    let tempoFare = 0;
    let urbaniaFare = 0;
    let busFare = 0;

    if (serviceType === 'one_way') {
      if (routeData.sedanFare && routeData.sedanFare > 0) {
        sedanFare = routeData.sedanFare;
        ertigaFare = routeData.ertigaFare || Math.round(sedanFare * 1.35);
        crystaFare = routeData.crystaFare || Math.round(sedanFare * 2.1);
        hatchbackFare = Math.round(sedanFare * 0.88);
      } else {
        sedanFare = Math.max(1600, Math.round(dist * 11));
        ertigaFare = Math.max(2200, Math.round(dist * 15));
        crystaFare = Math.max(3400, Math.round(dist * 20));
        hatchbackFare = Math.max(1300, Math.round(dist * 10));
      }
      suvMuvFare = ertigaFare;
      innovaFare = Math.max(2800, Math.round(dist * 18));
      tempoFare = Math.max(4500, Math.round(dist * 26));
      urbaniaFare = Math.max(6000, Math.round(dist * 32));
      busFare = Math.max(9000, Math.round(dist * 48));
    } else if (serviceType === 'round_trip') {
      const rtSedan = calculateRoundTripFare(dist, 1, 'sedan');
      const rtErtiga = calculateRoundTripFare(dist, 1, 'suv-muv');
      const rtCrysta = calculateRoundTripFare(dist, 1, 'executive-suv');
      const rtHatch = calculateRoundTripFare(dist, 1, 'hatchback');

      sedanFare = rtSedan.totalFare;
      ertigaFare = rtErtiga.totalFare;
      suvMuvFare = rtErtiga.totalFare;
      crystaFare = rtCrysta.totalFare;
      hatchbackFare = rtHatch.totalFare;
      innovaFare = Math.round(sedanFare * 1.6);
      tempoFare = Math.round(sedanFare * 2.3);
      urbaniaFare = Math.round(sedanFare * 2.9);
      busFare = Math.round(sedanFare * 4.3);
    } else if (serviceType === 'local_rental') {
      const pkg = initialPackageId;
      const lSedan = calculateLocalRentalFare(pkg, 'sedan');
      const lErtiga = calculateLocalRentalFare(pkg, 'suv-muv');
      const lCrysta = calculateLocalRentalFare(pkg, 'executive-suv');
      const lHatch = calculateLocalRentalFare(pkg, 'hatchback');

      sedanFare = lSedan.basePrice;
      ertigaFare = lErtiga.basePrice;
      suvMuvFare = lErtiga.basePrice;
      crystaFare = lCrysta.basePrice;
      hatchbackFare = lHatch.basePrice;
      innovaFare = Math.round(lSedan.basePrice * 1.5);
      tempoFare = Math.round(lSedan.basePrice * 2.3);
      urbaniaFare = Math.round(lSedan.basePrice * 3.3);
      busFare = Math.round(lSedan.basePrice * 5.3);
    } else if (serviceType === 'airport_transfer') {
      const air = resolveAirportFare('Delhi IGI Airport (T1, T2, T3)', pickup || 'Ghaziabad');
      if (air) {
        sedanFare = air.sedanFare;
        ertigaFare = air.ertigaFare;
        crystaFare = air.crystaFare;
        hatchbackFare = Math.round(air.sedanFare * 0.88);
      } else {
        sedanFare = 1599;
        ertigaFare = 2199;
        crystaFare = 3199;
        hatchbackFare = 1399;
      }
      suvMuvFare = ertigaFare;
      innovaFare = 2799;
      tempoFare = 4499;
      urbaniaFare = 5999;
      busFare = 8999;
    }

    // Helper: Dynamic MakeMyTrip Inclusions according to trip type
    const getTripInclusions = (vehicleName: string, rateStr: string): string[] => {
      const base = [
        `Doorstep pickup at your address in ${pickup}`,
        `Direct drop at exact destination in ${drop}`,
        `Clean, commercial ${vehicleName} with chauffeur`,
        'Driver Allowance & Fuel charges included',
        '24x7 Roadside Assistance & Live GPS Tracking',
        'Free Cancellation up to 24 hours before pickup',
      ];

      if (serviceType === 'one_way') {
        return [
          'All Highway Toll Taxes Included',
          'Inter-State Border Entry Permits Included',
          'GST (5%) & Service Taxes Included',
          ...base,
        ];
      }
      if (serviceType === 'round_trip') {
        return [
          'Driver daily allowance included for the full trip',
          'Minimum 250 km/day daily travel quota',
          'GST (5%) included in vehicle rental',
          ...base,
        ];
      }
      if (serviceType === 'local_rental') {
        return [
          'Full city package hours and kilometers included',
          'Unlimited local city stops within package',
          ...base,
        ];
      }
      return [
        'Airport terminal entry & toll charges included',
        '60 minutes complimentary flight arrival waiting time',
        ...base,
      ];
    };

    // Helper: Dynamic MakeMyTrip Exclusions according to trip type
    const getTripExclusions = (extraKmRate: string): string[] => {
      if (serviceType === 'one_way') {
        return [
          'Airport / Railway station parking charges (payable at actuals if incurred)',
          `Extra kilometers beyond primary destination route charged at ${extraKmRate}`,
          'Waiting charges beyond scheduled highway halts (₹150/hr after first 30 mins)',
          'Multiple pickup or drop deviations outside main corridor route',
        ];
      }
      if (serviceType === 'round_trip') {
        return [
          'Highway Toll Taxes & State Border Permits paid at actual toll booths during journey',
          'Airport / Monument / Hotel parking charges payable directly at actuals',
          `Kilometers driven beyond daily minimum quota charged at ${extraKmRate}`,
          'Driver night allowance (₹300/night if travel between 11 PM and 5 AM)',
        ];
      }
      if (serviceType === 'local_rental') {
        return [
          `Extra distance beyond package limit charged at ${extraKmRate}`,
          'Extra hours beyond package duration charged at ₹150 - ₹250/hour',
          'Parking tickets and toll plaza fees payable at actuals',
        ];
      }
      return [
        'Parking charges beyond complimentary 60 minutes paid at actuals to airport operator',
        `Extra local stops or route extensions charged at ${extraKmRate}`,
      ];
    };

    const buildCard = (
      key: string,
      filterKey: VehicleFilterKey,
      name: string,
      models: string,
      seats: string,
      bags: string,
      image: string,
      badge: string,
      badgeColor: string,
      fare: number,
      perKmRate: string
    ): VehicleCardData => {
      const token = calculateAdvanceToken(fare);
      const balance = Math.max(0, fare - token);
      const original = Math.round(fare * 1.12);
      const discountPercent = Math.round(((original - fare) / original) * 100);

      return {
        key,
        filterKey,
        name,
        models,
        seats,
        bags,
        image,
        badge,
        badgeColor,
        totalFare: fare,
        originalPrice: original,
        discountText: `${discountPercent}% OFF`,
        tokenAmount: token,
        balanceAmount: balance,
        perKmRate,
        inclusions: getTripInclusions(name, perKmRate),
        exclusions: getTripExclusions(perKmRate),
      };
    };

    // Series ordered strictly as requested:
    // 1. HATCHBACK -> 2. SEDAN -> 3. ERTIGA -> 4. SUV/MUV -> 5. INNOVA
    // -> 6. INNOVA CRYSTA -> 7. TEMPO TRAVELLER -> 8. URBANIA -> 9. LUXURY BUS
    return [
      buildCard(
        'hatchback',
        'hatchback',
        'Hatchback',
        'Maruti WagonR, Swift, Celerio',
        '4 Seats',
        '2 Bags',
        '/fleet-brand/Hatchback.webp',
        'BUDGET VALUE',
        'bg-amber-600',
        hatchbackFare,
        '₹10/km'
      ),
      buildCard(
        'sedan',
        'sedan',
        'Sedan',
        'Maruti Dzire, Toyota Etios, Honda Amaze',
        '4 Seats',
        '3 Bags',
        '/fleet-brand/dzire.webp',
        'MOST POPULAR',
        'bg-emerald-600',
        sedanFare,
        '₹11/km'
      ),
      buildCard(
        'ertiga',
        'ertiga',
        'Maruti Ertiga',
        'Maruti Ertiga 6-Seater AC',
        '6 Seats',
        '4 Bags',
        '/fleet-brand/Ertiga.webp',
        'FAMILY CHOICE',
        'bg-blue-600',
        ertigaFare,
        '₹15/km'
      ),
      buildCard(
        'suv-muv',
        'suv-muv',
        'SUV / MUV',
        'Renault Triber, Kia Carens, Mahindra Bolero (SUV / MPV)',
        '6/7 Seats',
        '4 Bags',
        '/fleet-brand/Ertiga.webp',
        'EXTRA SPACE',
        'bg-teal-700',
        suvMuvFare,
        '₹15/km'
      ),
      buildCard(
        'innova',
        'innova',
        'Toyota Innova',
        'Toyota Innova 7-Seater Classic',
        '7 Seats',
        '5 Bags',
        '/fleet-brand/Innova Crysta.webp',
        'COMFORT RIDE',
        'bg-indigo-700',
        innovaFare,
        '₹18/km'
      ),
      buildCard(
        'executive-suv',
        'executive-suv',
        'Innova Crysta',
        'Toyota Innova Crysta, Innova Hycross',
        '7 Seats',
        '5 Bags',
        '/fleet-brand/Innova Crysta.webp',
        'PREMIUM LUXURY',
        'bg-slate-900',
        crystaFare,
        '₹20/km'
      ),
    ];
  }, [routeData, serviceType, pickup, drop, initialPackageId]);

  // Filter vehicles by category tab
  const filteredVehicles = useMemo(() => {
    if (selectedFilter === 'all') return vehiclesList;
    return vehiclesList.filter((v) => v.filterKey === selectedFilter);
  }, [vehiclesList, selectedFilter]);

  // Build WhatsApp booking link
  const getWhatsAppLink = (v: VehicleCardData) => {
    const serviceTitle = serviceType === 'one_way' ? 'One-Way Outstation Cab' : serviceType === 'round_trip' ? 'Round-Trip Cab' : serviceType === 'local_rental' ? 'Hourly Local Rental' : 'Airport Cab Transfer';
    const lines = [
      '🚖 *URGENT TAXIS — VEHICLE SELECTION INQUIRY*',
      '━━━━━━━━━━━━━━━━━━━━',
      '✨ *Fast To Your Destination – Your Quick Ride Solution!*',
      '',
      '📋 *TRIP DETAILS*',
      `• 🚗 *Service:* ${serviceTitle}`,
      `• 📍 *Pickup:* ${pickup}`,
      `• 🏁 *Drop:* ${drop}`,
      `• 🛣️ *Distance:* ~${routeData.distanceKm} km (${routeData.durationText})`,
      `• 📅 *Date:* ${formattedDate} at ${formattedTime}`,
      '',
      '🚘 *VEHICLE SELECTED*',
      `• 🚗 *Vehicle:* *${v.name}*`,
      `• 💺 *Models:* ${v.models}`,
      `• 👥 *Capacity:* ${v.seats} • ${v.bags}`,
      '',
      '💰 *FARE & PAYMENT BREAKDOWN*',
      `• 💳 *Total Fare:* *₹${v.totalFare.toLocaleString('en-IN')}*`,
      `• 🟢 *30% Advance Token:* *₹${v.tokenAmount.toLocaleString('en-IN')}* (To Confirm)`,
      `• ⚪ *70% Driver Balance:* *₹${v.balanceAmount.toLocaleString('en-IN')}* (At Pickup)`,
      '',
      '📞 *24x7 Helpline:* +91 7310651940 | Masuri, Ghaziabad',
      '💬 *WhatsApp Desk:* +91 8595066033',
      '',
      'Please confirm driver availability and reservation! ✨',
    ];
    return `https://wa.me/${SITE_CONFIG.whatsappRaw}?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  // Build Checkout link leading directly to Step 3
  const getCheckoutLink = (v: VehicleCardData) => {
    const p = new URLSearchParams({
      serviceType,
      categoryId: v.key,
      pickup,
      drop,
      origin: pickup,
      destination: drop,
      date: journeyDate,
      time: journeyTime,
      km: String(routeData.distanceKm),
    });
    return `/checkout?${p.toString()}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans">
      
      {/* ── 1. MMT TRIP SUMMARY HEADER BAR ── */}
      <section className="bg-gradient-to-b from-[#1e1b4b] via-[#161b33] to-[#0f172a] text-white pt-6 pb-12 px-4 sm:px-6 lg:px-8 shadow-xl">
        <div className="max-w-7xl mx-auto space-y-4">
          
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-emerald-400 font-semibold">Available Cabs</span>
          </nav>

          {/* 4-Step Booking Progress Tracker (MakeMyTrip Style) */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-2 text-xs font-bold border-b border-white/10 scrollbar-hide">
            <div className="flex items-center gap-1.5 text-emerald-400 shrink-0">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-[10px]">
                ✓
              </span>
              <span>1. Search Route</span>
            </div>
            <span className="text-white/30 shrink-0">➔</span>
            <div className="flex items-center gap-1.5 text-white bg-emerald-600/30 border border-emerald-400 px-3 py-1 rounded-full shrink-0 shadow-xs">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                2
              </span>
              <span>2. Select Vehicle</span>
            </div>
            <span className="text-white/30 shrink-0">➔</span>
            <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">
                3
              </span>
              <span>3. Trip Details</span>
            </div>
            <span className="text-white/30 shrink-0">➔</span>
            <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">
                4
              </span>
              <span>4. Booking Confirmed</span>
            </div>
          </div>

          {/* Active Search Summary Card */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 bg-brand-green text-white rounded-full text-[10px] font-black uppercase tracking-wider">
                  {serviceType === 'one_way'
                    ? 'One-Way Outstation'
                    : serviceType === 'round_trip'
                    ? 'Round-Trip Outstation'
                    : serviceType === 'local_rental'
                    ? 'Hourly Rental'
                    : 'Airport Transfer'}
                </span>
                {routeData.isHillRoute && (
                  <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full text-[11px] font-bold">
                    Scenic Hill Route
                  </span>
                )}
              </div>

              {/* Origin ➔ Destination */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-2 flex-wrap">
                <span>{pickup && drop ? `${pickup} to ${drop} Cabs` : 'Available Cabs'}</span>
              </h1>

              {/* Accurate Highway Distance & Driving Duration (Zero Fake Data) */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold text-slate-300 pt-1">
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg">
                  <FaRoad className="text-emerald-400" />
                  <span className="text-white font-bold">{routeData.distanceKm} km</span>
                  <span className="text-slate-400 text-[11px]">Highway</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg">
                  <FaClock className="text-emerald-400" />
                  <span className="text-white font-bold">~{routeData.durationText}</span>
                  <span className="text-slate-400 text-[11px]">Duration</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg">
                  <FaCalendarAlt className="text-emerald-400" />
                  <span className="text-white font-bold">{formattedDate}</span>
                  <span className="text-slate-400 text-[11px]">at {formattedTime}</span>
                </div>
              </div>
            </div>

            {/* Modify Search Button */}
            <div className="shrink-0 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsModifyOpen(!isModifyOpen)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-emerald-50 hover:text-emerald-800 font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-white"
              >
                {isModifyOpen ? (
                  <>
                    <FaTimes className="w-3.5 h-3.5 text-red-500" />
                    <span>Close</span>
                  </>
                ) : (
                  <>
                    <FaEdit className="w-3.5 h-3.5 text-brand-green" />
                    <span>Modify Search</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ── Collapsible MMT Modify Search Drawer ── */}
          {isModifyOpen && (
            <form
              onSubmit={handleModifySubmit}
              className="bg-white rounded-2xl p-4 sm:p-5 text-slate-900 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-3 duration-200"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
                  Update Trip Details
                </span>
                <span className="text-[11px] text-slate-500">Universal distance &amp; fare calculated for any address</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Pickup City */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Pickup Location / Address
                  </label>
                  <input
                    type="text"
                    value={editPickup}
                    onChange={(e) => setEditPickup(e.target.value)}
                    placeholder="Enter pickup address or city"
                    className="w-full bg-transparent font-bold text-sm text-slate-900 focus:outline-none mt-1"
                    required
                  />
                </div>

                {/* Drop City */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Drop Destination / Address
                  </label>
                  <input
                    type="text"
                    value={editDrop}
                    onChange={(e) => setEditDrop(e.target.value)}
                    placeholder="Enter drop address or city"
                    className="w-full bg-transparent font-bold text-sm text-slate-900 focus:outline-none mt-1"
                    required
                  />
                </div>

                {/* Date */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={editDate}
                    onChange={(e) => {
                      const newD = e.target.value;
                      setEditDate(newD);
                      if (newD === todayStr) {
                        const minT = getMinTimeForToday();
                        if (editTime < minT) setEditTime(minT);
                      }
                    }}
                    className="w-full bg-transparent font-bold text-sm text-slate-900 focus:outline-none mt-1 cursor-pointer"
                    required
                  />
                </div>

                {/* Time */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Pickup Time
                  </label>
                  <input
                    type="time"
                    min={editDate === todayStr ? minTimeForToday : undefined}
                    value={editTime}
                    onChange={(e) => {
                      const newT = e.target.value;
                      if (editDate === todayStr) {
                        const minT = getMinTimeForToday();
                        if (newT < minT) {
                          alert(`Selected pickup time has already passed. Earliest pickup is ${minT}.`);
                          setEditTime(minT);
                          return;
                        }
                      }
                      setEditTime(newT);
                    }}
                    className="w-full bg-transparent font-bold text-sm text-slate-900 focus:outline-none mt-1 cursor-pointer"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModifyOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Update Cabs
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ── 2. MAIN VEHICLE SELECTION CONTAINER ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 space-y-6">
        
        {/* MMT Category Filter Pills (Strictly Ordered Fleet Series) */}
        <div className="bg-white rounded-2xl p-3 shadow-md border border-slate-200/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto hide-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedFilter('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                selectedFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold'
              }`}
            >
              All Vehicles ({vehiclesList.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('hatchback')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                selectedFilter === 'hatchback'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold'
              }`}
            >
              🚕 Hatchback
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('sedan')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                selectedFilter === 'sedan'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold'
              }`}
            >
              🚗 Sedan
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('ertiga')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                selectedFilter === 'ertiga'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold'
              }`}
            >
              🚙 Maruti Ertiga
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('suv-muv')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                selectedFilter === 'suv-muv'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold'
              }`}
            >
              🚙 SUV / MUV
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('innova')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                selectedFilter === 'innova'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold'
              }`}
            >
              ⭐ Toyota Innova
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('executive-suv')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                selectedFilter === 'executive-suv'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold'
              }`}
            >
              ✨ Innova Crysta
            </button>

          </div>

          <div className="text-xs text-slate-500 font-bold hidden xl:flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>All Fares 100% Guaranteed</span>
          </div>
        </div>

        {/* MMT Assurance Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs">
          <div className="bg-emerald-50/80 border border-emerald-200/80 p-2.5 rounded-xl flex items-center gap-2">
            <FaShieldAlt className="text-emerald-700 text-base shrink-0" />
            <div>
              <span className="font-black text-emerald-950 block text-[11px] leading-tight">30% Online Token</span>
              <span className="text-[10px] text-emerald-800 leading-none">100% Refundable up to 24 hrs</span>
            </div>
          </div>
          <div className="bg-blue-50/80 border border-blue-200/80 p-2.5 rounded-xl flex items-center gap-2">
            <FaCheckCircle className="text-blue-700 text-base shrink-0" />
            <div>
              <span className="font-black text-blue-950 block text-[11px] leading-tight">70% Driver Balance</span>
              <span className="text-[10px] text-blue-800 leading-none">Paid at start of your trip</span>
            </div>
          </div>
          <div className="bg-slate-100 border border-slate-200/90 p-2.5 rounded-xl flex items-center gap-2">
            <FaRoad className="text-slate-700 text-base shrink-0" />
            <div>
              <span className="font-black text-slate-900 block text-[11px] leading-tight">Zero Hidden Costs</span>
              <span className="text-[10px] text-slate-600 leading-none">Fuel, Driver &amp; Taxes Included</span>
            </div>
          </div>
          <div className="bg-slate-100 border border-slate-200 p-2.5 rounded-xl flex items-center gap-2">
            <FaSnowflake className="text-slate-700 text-base shrink-0" />
            <div>
              <span className="font-black text-slate-900 block text-[11px] leading-tight">AC &amp; GPS Fleet</span>
              <span className="text-[10px] text-slate-600 leading-none">Verified Highway Chauffeur</span>
            </div>
          </div>
        </div>

        {/* ── 3. VEHICLE LISTING CARDS (MMT Inclusions & Exclusions) ── */}
        <div id="cab-selection-panel" className="space-y-4">
          {filteredVehicles.map((vehicle) => {
            const activeTab = activeTabMap[vehicle.key] || 'inclusions';

            return (
              <div
                key={vehicle.key}
                className="bg-white rounded-3xl border border-slate-200 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col lg:flex-row"
              >
                {/* Col 1: Vehicle Photo & Specs */}
                <div className="lg:w-72 p-5 bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`px-2.5 py-0.5 text-white rounded-full text-[10px] font-black uppercase tracking-wider ${vehicle.badgeColor}`}
                      >
                        {vehicle.badge}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                        <FaStar className="w-2.5 h-2.5" /> 4.9 / 5
                      </span>
                    </div>

                    <div className="relative h-36 w-full rounded-2xl overflow-hidden my-2">
                      <Image
                        src={vehicle.image}
                        alt={`${vehicle.name} cab for ${pickup} to ${drop}`}
                        fill
                        className="object-contain hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, 300px"
                        priority={vehicle.key === 'sedan'}
                      />
                    </div>

                    <h3 className="text-lg font-black text-slate-900">{vehicle.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{vehicle.models}</p>
                  </div>

                  {/* Specs Chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200/80 text-[11px] font-bold text-slate-700 mt-2">
                    <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-slate-200">
                      <FaUserFriends className="text-brand-blue" />
                      <span>{vehicle.seats}</span>
                    </span>
                    <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-slate-200">
                      <FaSuitcase className="text-brand-green" />
                      <span>{vehicle.bags}</span>
                    </span>
                    <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-slate-200">
                      <FaSnowflake className="text-sky-500" />
                      <span>Chilled AC</span>
                    </span>
                  </div>
                </div>

                {/* Col 2: MakeMyTrip Authentic Inclusions & Exclusions */}
                <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between space-y-4">
                  <div>
                    {/* MakeMyTrip Inclusions vs Exclusions Toggle Buttons */}
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-3">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveTabMap((prev) => ({ ...prev, [vehicle.key]: 'inclusions' }))
                        }
                        className={`text-xs font-black uppercase tracking-wider pb-1 transition-all flex items-center gap-1.5 cursor-pointer ${
                          activeTab === 'inclusions'
                            ? 'text-emerald-700 border-b-2 border-emerald-600'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <FaCheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Included in Fare ({vehicle.inclusions.length})</span>
                      </button>

                      <span className="text-slate-300">|</span>

                      <button
                        type="button"
                        onClick={() =>
                          setActiveTabMap((prev) => ({ ...prev, [vehicle.key]: 'exclusions' }))
                        }
                        className={`text-xs font-black uppercase tracking-wider pb-1 transition-all flex items-center gap-1.5 cursor-pointer ${
                          activeTab === 'exclusions'
                            ? 'text-slate-900 border-b-2 border-slate-900'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <FaInfoCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Excluded / Extra Charges ({vehicle.exclusions.length})</span>
                      </button>
                    </div>

                    {/* Tab 1: Inclusions List */}
                    {activeTab === 'inclusions' && (
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-medium text-slate-700 animate-in fade-in duration-150">
                        {vehicle.inclusions.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <FaCheckCircle className="text-emerald-600 w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Tab 2: Exclusions List */}
                    {activeTab === 'exclusions' && (
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-medium text-slate-700 animate-in fade-in duration-150">
                        {vehicle.exclusions.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-600">
                            <FaTimesCircle className="text-amber-500 w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Route Highlights Footer */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-600 font-bold">
                      <FaRoad className="text-brand-green shrink-0" />
                      <span className="truncate">
                        Route: {pickup} ➔ {drop} ({routeData.distanceKm} km)
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                      Standard Rate: {vehicle.perKmRate}
                    </span>
                  </div>
                </div>

                {/* Col 3: Pricing Breakdown & CTAs (MakeMyTrip Style) */}
                <div className="lg:w-80 p-5 sm:p-6 bg-gradient-to-br from-emerald-50/40 via-white to-blue-50/30 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                        All-Inclusive Fare
                      </span>
                      <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {vehicle.discountText}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        ₹{vehicle.totalFare.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs font-bold text-slate-400 line-through">
                        ₹{vehicle.originalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* 30% Token & 70% Driver Balance breakdown */}
                    <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-bold">Pay Now (30% Token):</span>
                        <strong className="text-emerald-700 font-black">
                          ₹{vehicle.tokenAmount.toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                        <span className="text-slate-500 font-medium">To Driver at start (70%):</span>
                        <span className="text-slate-800 font-bold">
                          ₹{vehicle.balanceAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Booking CTA Buttons */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={() => router.push(getCheckoutLink(vehicle))}
                      className="w-full py-3 px-4 bg-[#059669] hover:bg-[#047857] active:scale-98 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group text-center"
                    >
                      <span>Book Online (30% Token)</span>
                      <FaArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <a
                      href={getWhatsAppLink(vehicle)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/40 text-[#128C7E] hover:text-[#075E54] font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                    >
                      <FaWhatsapp className="w-4 h-4 text-[#25D366]" />
                      <span>Book via WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── 4. TEMPO TRAVELLER & GROUP TRAVEL BANNER ── */}
        <div className="bg-gradient-to-r from-[#1e1b4b] to-[#0f172a] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3 py-1 bg-amber-400 text-slate-950 font-black rounded-full text-[10px] uppercase tracking-wider">
              Group Travel Desk
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Need a 12, 16, 20 or 26 Seater Tempo Traveller or Luxury Bus?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium">
              We provide luxury Maharaja Tempo Travellers, Force Urbania and 27-45 seater AC luxury coaches with pushback seats, individual AC vents, and large luggage capacity for family tours &amp; corporate outings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsappRaw}?text=${encodeURIComponent(
                `Hello Urgent Taxis! I need a Tempo Traveller / Bus quote for ${pickup} to ${drop} on ${formattedDate}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 bg-[#25D366] hover:bg-[#1ebc59] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <FaWhatsapp className="w-4 h-4" />
              <span>Inquire for Group</span>
            </a>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
}
