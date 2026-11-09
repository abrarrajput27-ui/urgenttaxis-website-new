/**
 * URGENT TAXIS — MASTER PRICING ENGINE
 * Single Source of Truth for all fare calculations across the platform:
 * Homepage, Routes Directory, Route Pages, Locality Pages, Airport Pages,
 * Fleet Pages, Checkout, and APIs.
 * 
 * Strict Commercial Rules:
 * 1. ONE-WAY & AIRPORT: Resolves the exact fixed fare stored in route/airport data.
 *    If unseeded, shows distance/time with "Get exact fare on WhatsApp" (NEVER "Price on request").
 * 2. ROUND-TRIP: billable_km = max(total_km, 250 km/day × days). Fare = billable_km × per_km_rate + driver allowance.
 * 3. LOCAL RENTAL: Fixed base rates for 8h/80km and 12h/120km across all fleet categories.
 * 4. ADVANCE TOKEN: Exactly 30% rounded to the nearest Rs 10. Remaining 70% paid to driver.
 * 5. TOLLS & STATE TAXES: Always quoted separately as "estimated, paid at actuals", never mixed into fixed cab rental.
 */

import masterRoutesData from './data/processed-master-routes.json';
import { AIRPORT_ROUTES_DATA } from './data/airport-routes-data';
import { SITE_CONFIG } from './seo';
import { resolveAccurateRoute } from './distance-resolver';
import { formatTime12Hour, formatDateReadable } from './date-utils';

// -----------------------------------------------------------------------------
// 1. RATE CONSTANTS (Owner Confirmed Values)
// -----------------------------------------------------------------------------

export const ADVANCE_PERCENT = 30;
export const ROUND_TRIP_MIN_KM_PER_DAY = 250;

/** Extra KM Rate per vehicle class */
export const EXTRA_KM_RATES: Record<string, number> = {
  hatchback: 11,
  sedan: 12,
  'suv-muv': 15,
  suv_mpv: 15,
  suv: 15,
  'executive-suv': 22,
  innova: 19,
  innova_crysta: 22,
  tempo12: 24,
  tempo16: 26,
  tempo20: 28,
  tempo26: 32,
  urbania12: 30,
  urbania16: 34,
  bus27: 45,
  bus45: 55,
};

/** Round Trip Per KM rate uses confirmed EXTRA_KM_RATES (Flagged in OWNER-TODO for optional custom rates) */
export const ROUND_TRIP_PER_KM_RATES: Record<string, number> = {
  ...EXTRA_KM_RATES,
};

/** Driver daily allowance for outstation */
export const DRIVER_ALLOWANCE_PER_DAY: Record<string, number> = {
  hatchback: 400,
  sedan: 400,
  'suv-muv': 400,
  suv_mpv: 400,
  suv: 400,
  'executive-suv': 500,
  innova: 500,
  tempo12: 600,
  tempo16: 600,
  tempo20: 700,
  tempo26: 700,
  urbania12: 700,
  urbania16: 700,
  bus27: 1000,
  bus45: 1200,
};

/** Local Hourly Rental Rates (Confirmed from live fleet cards + derived formula) */
export interface LocalRentalPackageConfig {
  hours: number;
  km: number;
  basePrice: number;
  extraKmRate: number;
  extraHourRate: number;
}

export const LOCAL_RENTAL_CONFIG: Record<string, Record<HourlyRentalPackageId, LocalRentalPackageConfig>> = {
  hatchback: {
    '4h40km': { hours: 4, km: 40, basePrice: 850, extraKmRate: 10, extraHourRate: 150 },
    '6h60km': { hours: 6, km: 60, basePrice: 1050, extraKmRate: 10, extraHourRate: 150 },
    '8h80km': { hours: 8, km: 80, basePrice: 1200, extraKmRate: 10, extraHourRate: 150 },
    '10h100km': { hours: 10, km: 100, basePrice: 1700, extraKmRate: 10, extraHourRate: 150 },
    '12h120km': { hours: 12, km: 120, basePrice: 2200, extraKmRate: 10, extraHourRate: 150 },
  },
  sedan: {
    '4h40km': { hours: 4, km: 40, basePrice: 1050, extraKmRate: 11, extraHourRate: 180 },
    '6h60km': { hours: 6, km: 60, basePrice: 1299, extraKmRate: 11, extraHourRate: 180 },
    '8h80km': { hours: 8, km: 80, basePrice: 1500, extraKmRate: 11, extraHourRate: 180 },
    '10h100km': { hours: 10, km: 100, basePrice: 2080, extraKmRate: 11, extraHourRate: 180 },
    '12h120km': { hours: 12, km: 120, basePrice: 2660, extraKmRate: 11, extraHourRate: 180 },
  },
  'suv-muv': {
    '4h40km': { hours: 4, km: 40, basePrice: 1350, extraKmRate: 15, extraHourRate: 220 },
    '6h60km': { hours: 6, km: 60, basePrice: 1680, extraKmRate: 15, extraHourRate: 220 },
    '8h80km': { hours: 8, km: 80, basePrice: 2000, extraKmRate: 15, extraHourRate: 220 },
    '10h100km': { hours: 10, km: 100, basePrice: 2740, extraKmRate: 15, extraHourRate: 220 },
    '12h120km': { hours: 12, km: 120, basePrice: 3480, extraKmRate: 15, extraHourRate: 220 },
  },
  suv_mpv: {
    '4h40km': { hours: 4, km: 40, basePrice: 1350, extraKmRate: 15, extraHourRate: 220 },
    '6h60km': { hours: 6, km: 60, basePrice: 1680, extraKmRate: 15, extraHourRate: 220 },
    '8h80km': { hours: 8, km: 80, basePrice: 2000, extraKmRate: 15, extraHourRate: 220 },
    '10h100km': { hours: 10, km: 100, basePrice: 2740, extraKmRate: 15, extraHourRate: 220 },
    '12h120km': { hours: 12, km: 120, basePrice: 3480, extraKmRate: 15, extraHourRate: 220 },
  },
  'executive-suv': {
    '4h40km': { hours: 4, km: 40, basePrice: 1650, extraKmRate: 20, extraHourRate: 300 },
    '6h60km': { hours: 6, km: 60, basePrice: 2100, extraKmRate: 20, extraHourRate: 300 },
    '8h80km': { hours: 8, km: 80, basePrice: 2500, extraKmRate: 20, extraHourRate: 300 },
    '10h100km': { hours: 10, km: 100, basePrice: 3500, extraKmRate: 20, extraHourRate: 300 },
    '12h120km': { hours: 12, km: 120, basePrice: 4500, extraKmRate: 20, extraHourRate: 300 },
  },
  innova: {
    '4h40km': { hours: 4, km: 40, basePrice: 1650, extraKmRate: 20, extraHourRate: 300 },
    '6h60km': { hours: 6, km: 60, basePrice: 2100, extraKmRate: 20, extraHourRate: 300 },
    '8h80km': { hours: 8, km: 80, basePrice: 2500, extraKmRate: 20, extraHourRate: 300 },
    '10h100km': { hours: 10, km: 100, basePrice: 3500, extraKmRate: 20, extraHourRate: 300 },
    '12h120km': { hours: 12, km: 120, basePrice: 4500, extraKmRate: 20, extraHourRate: 300 },
  },
  tempo12: {
    '4h40km': { hours: 4, km: 40, basePrice: 2400, extraKmRate: 24, extraHourRate: 350 },
    '6h60km': { hours: 6, km: 60, basePrice: 2950, extraKmRate: 24, extraHourRate: 350 },
    '8h80km': { hours: 8, km: 80, basePrice: 3500, extraKmRate: 24, extraHourRate: 350 },
    '10h100km': { hours: 10, km: 100, basePrice: 4680, extraKmRate: 24, extraHourRate: 350 },
    '12h120km': { hours: 12, km: 120, basePrice: 5860, extraKmRate: 24, extraHourRate: 350 },
  },
  tempo16: {
    '4h40km': { hours: 4, km: 40, basePrice: 3100, extraKmRate: 26, extraHourRate: 400 },
    '6h60km': { hours: 6, km: 60, basePrice: 3800, extraKmRate: 26, extraHourRate: 400 },
    '8h80km': { hours: 8, km: 80, basePrice: 4500, extraKmRate: 26, extraHourRate: 400 },
    '10h100km': { hours: 10, km: 100, basePrice: 5820, extraKmRate: 26, extraHourRate: 400 },
    '12h120km': { hours: 12, km: 120, basePrice: 7140, extraKmRate: 26, extraHourRate: 400 },
  },
  tempo20: {
    '4h40km': { hours: 4, km: 40, basePrice: 3800, extraKmRate: 28, extraHourRate: 450 },
    '6h60km': { hours: 6, km: 60, basePrice: 4650, extraKmRate: 28, extraHourRate: 450 },
    '8h80km': { hours: 8, km: 80, basePrice: 5500, extraKmRate: 28, extraHourRate: 450 },
    '10h100km': { hours: 10, km: 100, basePrice: 6960, extraKmRate: 28, extraHourRate: 450 },
    '12h120km': { hours: 12, km: 120, basePrice: 8420, extraKmRate: 28, extraHourRate: 450 },
  },
  tempo26: {
    '4h40km': { hours: 4, km: 40, basePrice: 4500, extraKmRate: 32, extraHourRate: 500 },
    '6h60km': { hours: 6, km: 60, basePrice: 5500, extraKmRate: 32, extraHourRate: 500 },
    '8h80km': { hours: 8, km: 80, basePrice: 6500, extraKmRate: 32, extraHourRate: 500 },
    '10h100km': { hours: 10, km: 100, basePrice: 8140, extraKmRate: 32, extraHourRate: 500 },
    '12h120km': { hours: 12, km: 120, basePrice: 9780, extraKmRate: 32, extraHourRate: 500 },
  },
  urbania12: {
    '4h40km': { hours: 4, km: 40, basePrice: 3500, extraKmRate: 30, extraHourRate: 400 },
    '6h60km': { hours: 6, km: 60, basePrice: 4250, extraKmRate: 30, extraHourRate: 400 },
    '8h80km': { hours: 8, km: 80, basePrice: 5000, extraKmRate: 30, extraHourRate: 400 },
    '10h100km': { hours: 10, km: 100, basePrice: 6400, extraKmRate: 30, extraHourRate: 400 },
    '12h120km': { hours: 12, km: 120, basePrice: 7800, extraKmRate: 30, extraHourRate: 400 },
  },
  urbania16: {
    '4h40km': { hours: 4, km: 40, basePrice: 4200, extraKmRate: 34, extraHourRate: 450 },
    '6h60km': { hours: 6, km: 60, basePrice: 5100, extraKmRate: 34, extraHourRate: 450 },
    '8h80km': { hours: 8, km: 80, basePrice: 6000, extraKmRate: 34, extraHourRate: 450 },
    '10h100km': { hours: 10, km: 100, basePrice: 7580, extraKmRate: 34, extraHourRate: 450 },
    '12h120km': { hours: 12, km: 120, basePrice: 9160, extraKmRate: 34, extraHourRate: 450 },
  },
  bus27: {
    '4h40km': { hours: 4, km: 40, basePrice: 5500, extraKmRate: 45, extraHourRate: 600 },
    '6h60km': { hours: 6, km: 60, basePrice: 6750, extraKmRate: 45, extraHourRate: 600 },
    '8h80km': { hours: 8, km: 80, basePrice: 8000, extraKmRate: 45, extraHourRate: 600 },
    '10h100km': { hours: 10, km: 100, basePrice: 10100, extraKmRate: 45, extraHourRate: 600 },
    '12h120km': { hours: 12, km: 120, basePrice: 12200, extraKmRate: 45, extraHourRate: 600 },
  },
  bus45: {
    '4h40km': { hours: 4, km: 40, basePrice: 7000, extraKmRate: 55, extraHourRate: 800 },
    '6h60km': { hours: 6, km: 60, basePrice: 8500, extraKmRate: 55, extraHourRate: 800 },
    '8h80km': { hours: 8, km: 80, basePrice: 10000, extraKmRate: 55, extraHourRate: 800 },
    '10h100km': { hours: 10, km: 100, basePrice: 12700, extraKmRate: 55, extraHourRate: 800 },
    '12h120km': { hours: 12, km: 120, basePrice: 15400, extraKmRate: 55, extraHourRate: 800 },
  },
};

// -----------------------------------------------------------------------------
// 2. HELPER CALCULATIONS
// -----------------------------------------------------------------------------

/**
 * Calculates 30% advance token rounded to nearest Rs 10
 * Example: 3499 * 0.30 = 1049.7 -> 1050
 */
export function calculateAdvanceToken(totalFare: number, advancePercent: number = ADVANCE_PERCENT): number {
  if (totalFare <= 0) return 0;
  const exactToken = totalFare * (advancePercent / 100);
  return Math.round(exactToken / 10) * 10;
}

/**
 * Normalizes city names for robust lookup (case-insensitive, trims whitespace & suffixes)
 */
export function normalizeCityName(city: string): string {
  if (!city) return '';
  return city
    .toLowerCase()
    .replace(/\b(airport|railway station|junction|cantt|city|ncr|t3|t1|t2)\b/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Generates canonical slug from origin and destination names
 */
export function generateRouteSlug(originName: string, destName: string): string {
  const o = originName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const d = destName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `${o}-to-${d}-taxi`;
}

// -----------------------------------------------------------------------------
// 3. MASTER ROUTE LOOKUP & FARE RESOLUTION
// -----------------------------------------------------------------------------

export interface RouteFareQuote {
  slug: string;
  originName: string;
  destName: string;
  distanceKm: number;
  durationText: string;
  sedanFare: number;
  ertigaFare: number;
  crystaFare: number;
  startsAt: number;
  estimatedToll: number;
  isFixed: boolean;
  requiresWhatsAppQuote?: boolean;
}

/**
 * Resolves One-Way Outstation Fare.
 * Hierarchy:
 * 1. Exact stored fixed fare in master-routes dataset.
 * 2. If unmapped, distance & time returned with requiresWhatsAppQuote: true (NEVER "Price on request").
 */
export function resolveOneWayFare(
  origin: string,
  destination: string,
  knownDistanceKm?: number
): RouteFareQuote | null {
  if (!origin || !destination) return null;

  const normOrigin = normalizeCityName(origin);
  const normDest = normalizeCityName(destination);

  // 1. Check exact match in processed master routes
  const match = (masterRoutesData as any[]).find((r) => {
    const o = normalizeCityName(r.originName);
    const d = normalizeCityName(r.destName);
    return (o === normOrigin && d === normDest) || (o === normDest && d === normOrigin);
  });

  if (match) {
    const distanceKm = match.estimated_distance_km || knownDistanceKm || 200;
    const sedanFare = match.sedanFare || 3499;
    const ertigaFare = match.ertigaFare || Math.round(sedanFare * 1.35);
    const crystaFare = match.crystaFare || Math.round(sedanFare * 2.2);
    const startsAt = Math.min(sedanFare, ertigaFare, crystaFare);
    const estimatedToll = Math.round(distanceKm * 1.6);

    return {
      slug: match.slug,
      originName: match.originName,
      destName: match.destName,
      distanceKm,
      durationText: match.durationText || `${Math.round(distanceKm / 50)} hours`,
      sedanFare,
      ertigaFare,
      crystaFare,
      startsAt,
      estimatedToll,
      isFixed: true,
    };
  }

  // 2. Universal Dynamic Calculation for all addresses, cities & unmapped locations
  const accurate = resolveAccurateRoute(origin, destination, knownDistanceKm || 0);
  const distanceKm = accurate.distanceKm;
  const sedanFare = accurate.sedanFare || Math.max(1600, Math.round(distanceKm * 12));
  const ertigaFare = accurate.ertigaFare || Math.max(2200, Math.round(distanceKm * 15));
  const crystaFare = accurate.crystaFare || Math.max(3400, Math.round(distanceKm * 22));
  const startsAt = Math.min(sedanFare, ertigaFare, crystaFare);
  const estimatedToll = Math.round(distanceKm * 1.6);

  return {
    slug: generateRouteSlug(origin, destination),
    originName: origin,
    destName: destination,
    distanceKm,
    durationText: accurate.durationText,
    sedanFare,
    ertigaFare,
    crystaFare,
    startsAt,
    estimatedToll,
    isFixed: true,
    requiresWhatsAppQuote: false,
  };
}

export interface MultiStopFareQuote {
  origin: string;
  stops: string[];
  destination: string;
  sequence: string[];
  totalDistanceKm: number;
  durationText: string;
  isReliablyCalculated: boolean;
  requiresWhatsAppQuote: boolean;
  explanation: string;
  sedanFare: number;
  ertigaFare: number;
  crystaFare: number;
  startsAt: number;
  estimatedToll: number;
}

export function resolveMultiStopRoute(
  origin: string,
  stops: string[] = [],
  destination: string
): MultiStopFareQuote | null {
  if (!origin || !destination) return null;
  const validStops = stops.map((s) => s.trim()).filter(Boolean);
  const sequence = [origin, ...validStops, destination];

  if (validStops.length === 0) {
    const direct = resolveOneWayFare(origin, destination);
    if (!direct) return null;
    return {
      origin,
      stops: [],
      destination,
      sequence,
      totalDistanceKm: direct.distanceKm,
      durationText: direct.durationText,
      isReliablyCalculated: direct.isFixed,
      requiresWhatsAppQuote: !direct.isFixed,
      explanation: `${origin} ➔ ${destination} direct route (${direct.distanceKm} KM)`,
      sedanFare: direct.sedanFare,
      ertigaFare: direct.ertigaFare,
      crystaFare: direct.crystaFare,
      startsAt: direct.startsAt,
      estimatedToll: direct.estimatedToll,
    };
  }

  // Calculate leg-by-leg
  let totalDistance = 0;
  let allLegsFound = true;
  const legDescriptions: string[] = [];

  for (let i = 0; i < sequence.length - 1; i++) {
    const legFrom = sequence[i];
    const legTo = sequence[i + 1];
    const directLeg = resolveOneWayFare(legFrom, legTo);
    if (directLeg && directLeg.distanceKm > 0) {
      totalDistance += directLeg.distanceKm;
      legDescriptions.push(`${legFrom}➔${legTo} (${directLeg.distanceKm} km)`);
    } else {
      allLegsFound = false;
      legDescriptions.push(`${legFrom}➔${legTo}`);
    }
  }

  const estHours = Math.max(1, Math.round(totalDistance / 50));
  const durationText = totalDistance > 0 ? `~${estHours} hrs` : 'Custom duration';
  const explanation = `Multi-stop sequence: ${sequence.join(' ➔ ')}`;

  // If intermediate legs cannot all be reliably calculated from database, do NOT display misleading fare
  if (!allLegsFound || totalDistance === 0) {
    return {
      origin,
      stops: validStops,
      destination,
      sequence,
      totalDistanceKm: totalDistance,
      durationText,
      isReliablyCalculated: false,
      requiresWhatsAppQuote: true,
      explanation: `${explanation}. Custom intermediate stop distance confirmed via WhatsApp.`,
      sedanFare: 0,
      ertigaFare: 0,
      crystaFare: 0,
      startsAt: 0,
      estimatedToll: 0,
    };
  }

  // Standard transparent multi-stop rate based on verified leg distances
  const sedanFare = Math.round((totalDistance * 13.5) / 50) * 50;
  const ertigaFare = Math.round((totalDistance * 17.5) / 50) * 50;
  const crystaFare = Math.round((totalDistance * 26) / 50) * 50;
  const startsAt = Math.min(sedanFare, ertigaFare, crystaFare);
  const estimatedToll = Math.round(totalDistance * 1.6);

  return {
    origin,
    stops: validStops,
    destination,
    sequence,
    totalDistanceKm: totalDistance,
    durationText,
    isReliablyCalculated: true,
    requiresWhatsAppQuote: false,
    explanation: `${explanation} (Total: ${totalDistance} KM)`,
    sedanFare,
    ertigaFare,
    crystaFare,
    startsAt,
    estimatedToll,
  };
}

// -----------------------------------------------------------------------------
// 4. AIRPORT TRANSFER FARE RESOLUTION
// -----------------------------------------------------------------------------

export interface AirportFareQuote {
  slug: string;
  origin: string;
  destination: string;
  distanceKm: number;
  sedanFare: number;
  ertigaFare: number;
  crystaFare: number;
  startsAt: number;
  estimatedToll: number;
  isFixed: boolean;
}

export function resolveAirportFare(slugOrOrigin: string, destination?: string): AirportFareQuote | null {
  // Check slug lookup in AIRPORT_ROUTES_DATA
  const data = (AIRPORT_ROUTES_DATA as Record<string, any>)[slugOrOrigin];
  if (data) {
    return {
      slug: data.slug,
      origin: data.origin,
      destination: data.destination,
      distanceKm: data.distanceKm,
      sedanFare: data.sedanFare,
      ertigaFare: data.ertigaFare,
      crystaFare: data.crystaFare,
      startsAt: Math.min(data.sedanFare, data.ertigaFare, data.crystaFare),
      estimatedToll: 0, // airport toll / parking paid at actuals
      isFixed: true,
    };
  }

  // Check matching by origin/destination
  if (destination) {
    const normO = normalizeCityName(slugOrOrigin);
    const normD = normalizeCityName(destination);
    const found = Object.values(AIRPORT_ROUTES_DATA).find((ar: any) => {
      const o = normalizeCityName(ar.origin);
      const d = normalizeCityName(ar.destination);
      return (o === normO && d === normD) || (o === normD && d === normO);
    });

    if (found) {
      return {
        slug: found.slug,
        origin: found.origin,
        destination: found.destination,
        distanceKm: found.distanceKm,
        sedanFare: found.sedanFare,
        ertigaFare: found.ertigaFare,
        crystaFare: found.crystaFare,
        startsAt: Math.min(found.sedanFare, found.ertigaFare, found.crystaFare),
        estimatedToll: 0,
        isFixed: true,
      };
    }
  }

  // Fallback airport transfer rates
  return {
    slug: 'delhi-airport-transfer',
    origin: slugOrOrigin,
    destination: destination || 'IGI Airport Delhi',
    distanceKm: 45,
    sedanFare: 1300,
    ertigaFare: 1800,
    crystaFare: 2500,
    startsAt: 1300,
    estimatedToll: 0,
    isFixed: true,
  };
}

// -----------------------------------------------------------------------------
// 5. ROUND-TRIP FARE CALCULATION
// -----------------------------------------------------------------------------

export interface RoundTripFareQuote {
  actualDistanceKm: number;
  totalRoundTripKm: number;
  numberOfDays: number;
  guaranteedMinKm: number;
  billableKm: number;
  ratePerKm: number;
  driverAllowancePerDay: number;
  totalDriverAllowance: number;
  baseFare: number;
  totalFare: number;
  tokenAmount: number;
  balanceAmount: number;
  workingExplanation: string;
}

export function calculateRoundTripFare(
  oneWayDistanceKm: number,
  numberOfDays: number = 1,
  vehicleCategory: string = 'sedan'
): RoundTripFareQuote {
  const normCategory = vehicleCategory.toLowerCase();
  const safeDays = Math.max(1, numberOfDays);
  const totalRoundTripKm = oneWayDistanceKm * 2;
  const guaranteedMinKm = ROUND_TRIP_MIN_KM_PER_DAY * safeDays;
  const billableKm = Math.max(totalRoundTripKm, guaranteedMinKm);

  const ratePerKm = ROUND_TRIP_PER_KM_RATES[normCategory] || 11;
  const driverAllowancePerDay = DRIVER_ALLOWANCE_PER_DAY[normCategory] || 400;
  const totalDriverAllowance = driverAllowancePerDay * safeDays;

  const baseFare = billableKm * ratePerKm;
  const totalFare = baseFare + totalDriverAllowance;
  const tokenAmount = calculateAdvanceToken(totalFare, ADVANCE_PERCENT);
  const balanceAmount = totalFare - tokenAmount;

  const workingExplanation = `Billable ${billableKm} km × ₹${ratePerKm}/km + Driver Allowance ₹${totalDriverAllowance} (${safeDays} day${safeDays > 1 ? 's' : ''})`;

  return {
    actualDistanceKm: oneWayDistanceKm,
    totalRoundTripKm,
    numberOfDays: safeDays,
    guaranteedMinKm,
    billableKm,
    ratePerKm,
    driverAllowancePerDay,
    totalDriverAllowance,
    baseFare,
    totalFare,
    tokenAmount,
    balanceAmount,
    workingExplanation,
  };
}

// -----------------------------------------------------------------------------
// 6. LOCAL HOURLY RENTAL CALCULATION
// -----------------------------------------------------------------------------

export type HourlyRentalPackageId = '4h40km' | '6h60km' | '8h80km' | '10h100km' | '12h120km';

export const HOURLY_RENTAL_PACKAGES = [
  { id: '4h40km' as const, name: '4 Hours / 40 KM', hours: 4, km: 40, hasApprovedRate: true },
  { id: '6h60km' as const, name: '6 Hours / 60 KM', hours: 6, km: 60, hasApprovedRate: true },
  { id: '8h80km' as const, name: '8 Hours / 80 KM', hours: 8, km: 80, hasApprovedRate: true },
  { id: '10h100km' as const, name: '10 Hours / 100 KM', hours: 10, km: 100, hasApprovedRate: true },
  { id: '12h120km' as const, name: '12 Hours / 120 KM', hours: 12, km: 120, hasApprovedRate: true },
] as const;

export interface LocalRentalQuote {
  category: string;
  packageId: HourlyRentalPackageId;
  packageName: string;
  hours: number;
  km: number;
  basePrice: number;
  extraKmRate: number;
  extraHourRate: number;
  tokenAmount: number;
  balanceAmount: number;
  isFixed: boolean;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

export function calculateLocalRentalFare(
  packageId: HourlyRentalPackageId = '8h80km',
  vehicleCategory: string = 'sedan'
): LocalRentalQuote {
  const normCategory = vehicleCategory.toLowerCase();
  const pkgMeta = HOURLY_RENTAL_PACKAGES.find((p) => p.id === packageId) || HOURLY_RENTAL_PACKAGES[2];

  const catConfig = LOCAL_RENTAL_CONFIG[normCategory] || LOCAL_RENTAL_CONFIG['sedan'];
  const pkg = catConfig[packageId] || catConfig['8h80km'];

  const tokenAmount = calculateAdvanceToken(pkg.basePrice, ADVANCE_PERCENT);
  const balanceAmount = pkg.basePrice - tokenAmount;

  return {
    category: normCategory,
    packageId,
    packageName: pkgMeta.name,
    hours: pkg.hours,
    km: pkg.km,
    basePrice: pkg.basePrice,
    extraKmRate: pkg.extraKmRate,
    extraHourRate: pkg.extraHourRate,
    tokenAmount,
    balanceAmount,
    isFixed: true,
  };
}

// -----------------------------------------------------------------------------
// 7. CLEAN WHATSAPP LINK GENERATOR
// -----------------------------------------------------------------------------

export interface WhatsAppBookingParams {
  serviceType: 'One-way' | 'Round-trip' | 'Local rental' | 'Airport transfer' | string;
  vehicleName: string;
  origin: string;
  destination: string;
  travelDate?: string;
  travelTime?: string;
  returnDate?: string;
  returnTime?: string;
  numberOfDays?: number;
  distanceKm?: number;
  estimatedFare?: number;
  pageUrl?: string;
  customNote?: string;
}

/**
 * Builds one clean, professional WhatsApp link matching exact specification
 */
export function buildWhatsAppBookingLink(params: WhatsAppBookingParams): string {
  const rawPhone = SITE_CONFIG.whatsappRaw || '918595066033';
  const phone = rawPhone.replace(/\D/g, '') || '918595066033';

  const token = params.estimatedFare && params.estimatedFare > 0
    ? calculateAdvanceToken(params.estimatedFare)
    : 0;
  const balance = params.estimatedFare && params.estimatedFare > 0
    ? params.estimatedFare - token
    : 0;

  const rawService = String(params.serviceType || '').toLowerCase();
  const isRoundTrip = rawService.includes('round') || Boolean(params.returnDate);

  const tripLines: string[] = [];
  if (isRoundTrip) {
    tripLines.push('• 🚗 *Service:* Round-trip');
    tripLines.push(`• 📍 *Pickup:* ${params.origin}`);
    tripLines.push(`• 🏁 *Destination:* ${params.destination}`);
    if (params.distanceKm && params.distanceKm > 0) {
      tripLines.push(`• 🛣️ *Total Distance:* ~${params.distanceKm} km (Round-trip)`);
    }
    const depDate = params.travelDate ? formatDateReadable(params.travelDate) : 'Immediate / Flexible';
    const depTime = params.travelTime ? ` at ${formatTime12Hour(params.travelTime)}` : '';
    tripLines.push(`• 📅 *Departure Date:* ${depDate}${depTime}`);

    if (params.returnDate) {
      const retDate = formatDateReadable(params.returnDate);
      const retTime = params.returnTime ? ` at ${formatTime12Hour(params.returnTime)}` : '';
      const daysText = params.numberOfDays
        ? ` (${params.numberOfDays} ${params.numberOfDays === 1 ? 'Day' : 'Days'})`
        : '';
      tripLines.push(`• 🔄 *Return Date / Duration:* ${retDate}${retTime}${daysText}`);
    } else if (params.numberOfDays) {
      tripLines.push(`• ⏱️ *Trip Duration:* ${params.numberOfDays} ${params.numberOfDays === 1 ? 'Day' : 'Days'}`);
    }
  } else {
    tripLines.push(`• 🚗 *Service:* ${params.serviceType}`);
    tripLines.push(`• 📍 *Pickup:* ${params.origin}`);
    tripLines.push(`• 🏁 *Drop:* ${params.destination}`);
    if (params.distanceKm && params.distanceKm > 0) {
      tripLines.push(`• 🛣️ *Distance:* ~${params.distanceKm} km`);
    }
    const travelDate = params.travelDate ? formatDateReadable(params.travelDate) : 'Immediate / Flexible';
    const travelTime = params.travelTime ? ` at ${formatTime12Hour(params.travelTime)}` : '';
    tripLines.push(`• 📅 *Date:* ${travelDate}${travelTime}`);
  }

  const lines = [
    '🚖 *URGENT TAXIS — CAB BOOKING INQUIRY*',
    '━━━━━━━━━━━━━━━━━━━━',
    '✨ *Fast To Your Destination – Your Quick Ride Solution!*',
    '',
    '📋 *TRIP DETAILS*',
    ...tripLines,
    '',
    '🚘 *VEHICLE SELECTION*',
    `• 🚗 *Vehicle:* *${params.vehicleName}*`,
    '',
    '💰 *FARE & PAYMENT BREAKDOWN*',
    params.estimatedFare && params.estimatedFare > 0
      ? [
          `• 💳 *Estimated Total Fare:* *₹${params.estimatedFare.toLocaleString('en-IN')}*`,
          `• 🟢 *30% Advance Token:* *₹${token.toLocaleString('en-IN')}* (To Confirm)`,
          `• ⚪ *70% Driver Balance:* *₹${balance.toLocaleString('en-IN')}* (At Pickup)`,
        ].join('\n')
      : '• 💳 *Fare:* Instant online estimate requested',
    '',
    params.customNote ? `📝 *Note:* ${params.customNote}\n` : '',
    `🌐 *Website:* ${params.pageUrl || 'https://www.urgenttaxis.in'}`,
    '📞 *24x7 Helpline:* +91 7310651940 | Masuri, Ghaziabad',
    '💬 *WhatsApp Desk:* +91 8595066033',
    '',
    'Please confirm cab availability & driver assignment! ✨',
  ].filter(Boolean);

  const message = lines.join('\n');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

// -----------------------------------------------------------------------------
// 8. RE-EXPORT CHARGEABLE VEHICLE ADD-ONS (PHASE 3)
// -----------------------------------------------------------------------------
export * from './pricing/add-ons';
export * from './pricing/routes';
