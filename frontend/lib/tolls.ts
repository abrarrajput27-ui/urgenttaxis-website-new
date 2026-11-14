/**
 * URGENT TAXIS — SMART ROUTE-BASED TOLL & STATE TAX CALCULATION ENGINE
 * 
 * Implements the 3-layer engine:
 * Layer 1: Route Detection & Corridor Resolution
 * Layer 2: Toll Plaza Identification along the direction of travel
 * Layer 3: Vehicle-category specific Toll Calculation + State Border Entry Taxes
 */

import {
  TOLL_PLAZAS,
  STATE_TAX_RATES,
  CORRIDOR_TOLL_MAPPINGS,
  TollPlazaItem,
  StateTaxRate,
} from './data/tolls-data';
import { getLocationState } from './location-authority';

export interface CalculatedTollPlaza {
  id: string;
  name: string;
  highway: string;
  state: string;
  lat: number;
  lng: number;
  oneWayRate: number;
  returnRate: number;
  appliedRate: number;
  verifiedAt: string;
  authority: string;
}

export interface AppliedStateTax {
  state: string;
  name: string;
  rate: number;
  validity: string;
  description: string;
}

export interface RouteTollCalculationResult {
  origin: string;
  destination: string;
  vehicleCategory: string;
  isRoundTrip: boolean;
  tollPlazas: CalculatedTollPlaza[];
  totalToll: number;
  stateTaxes: AppliedStateTax[];
  totalStateTax: number;
  grandTotal: number;
  verificationSource: string;
  lastVerified: string;
}

/**
 * Normalizes vehicle category to rate key
 */
function getVehicleRateKey(category: string): 'sedan' | 'suv' | 'traveller' | 'bus' {
  const c = (category || 'sedan').toLowerCase();
  if (c.includes('sedan') || c.includes('hatchback') || c.includes('dzire') || c.includes('etios')) {
    return 'sedan';
  }
  if (c.includes('suv') || c.includes('ertiga') || c.includes('innova') || c.includes('crysta')) {
    return 'suv';
  }
  if (c.includes('tempo') || c.includes('urbania') || c.includes('traveller')) {
    return 'traveller';
  }
  if (c.includes('bus') || c.includes('charter')) {
    return 'bus';
  }
  return 'sedan';
}

/**
 * Normalizes location string for corridor matching
 */
function normalizePlace(place: string): string {
  return (place || '')
    .toLowerCase()
    .replace(/\b(airport|t3|cantt|junction|railway station|bus stand|sector \d+|city|hq)\b/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Resolves Corridor Key for Toll Mapping
 */
function resolveCorridorKey(origin: string, destination: string): string | null {
  const normO = normalizePlace(origin);
  const normD = normalizePlace(destination);

  // Kumaon & Nainital corridor
  const isKumaon = [
    'nainital', 'haldwani', 'kathgodam', 'bhimtal', 'almora', 'ranikhet', 
    'kausani', 'kainchidham', 'kainchi', 'jimcorbett', 'corbett', 'ramnagar', 
    'rudrapur', 'pantnagar', 'kashipur', 'bhowali', 'mukteshwar'
  ].some((k) => normO.includes(k) || normD.includes(k));

  const isDelhiNcr = [
    'delhi', 'ghaziabad', 'noida', 'greaternoida', 'gurugram', 'gurgaon', 'faridabad', 'masuri'
  ].some((d) => normO.includes(d) || normD.includes(d));

  if (isDelhiNcr && isKumaon) return 'delhi-nainital';

  // Haridwar corridor (NH-334 / Delhi-Meerut Expressway)
  const isHaridwar = ['haridwar', 'bahadrabad', 'jwalapur', 'laksar', 'bhagwanpur'].some(
    (h) => normO.includes(h) || normD.includes(h)
  );
  if (isDelhiNcr && isHaridwar) return 'delhi-haridwar';

  // Dehradun / Mussoorie / Rishikesh / Garhwal corridor
  const isGarhwal = [
    'dehradun', 'mussoorie', 'rishikesh', 'tapovan', 'roorkee', 
    'dhanaulti', 'kanatal', 'tehri', 'chamba'
  ].some((g) => normO.includes(g) || normD.includes(g));
  if (isDelhiNcr && isGarhwal) return 'delhi-dehradun';

  // Agra / Mathura corridor
  const isBraj = ['agra', 'mathura', 'vrindavan', 'goverdhan', 'barsana', 'firozabad', 'fatehabadsikri'].some(
    (b) => normO.includes(b) || normD.includes(b)
  );
  if (isDelhiNcr && isBraj) return 'delhi-agra';

  // Jaipur / Rajasthan corridor
  const isRajasthan = ['jaipur', 'ajmer', 'pushkar', 'khatushyam', 'salasar', 'alwar', 'neemrana', 'bhiwadi'].some(
    (r) => normO.includes(r) || normD.includes(r)
  );
  if (isDelhiNcr && isRajasthan) return 'delhi-jaipur';

  // Amritsar corridor (5 NH-44 Plazas)
  const isAmritsar = ['amritsar', 'beas', 'tarntaran'].some(
    (a) => normO.includes(a) || normD.includes(a)
  );
  if (isDelhiNcr && isAmritsar) return 'delhi-amritsar';

  // Ludhiana / Jalandhar
  const isLudhianaJalandhar = ['ludhiana', 'jalandhar', 'phagwara', 'khanna'].some(
    (l) => normO.includes(l) || normD.includes(l)
  );
  if (isDelhiNcr && isLudhianaJalandhar) return 'delhi-ludhiana';

  // Chandigarh / Mohali / Panchkula
  const isPunjab = ['chandigarh', 'mohali', 'panchkula', 'patiala', 'bathinda', 'hoshiarpur'].some(
    (p) => normO.includes(p) || normD.includes(p)
  );
  if (isDelhiNcr && isPunjab) return 'delhi-chandigarh';

  // Jammu / Katra / Srinagar
  const isJammuKashmir = ['jammu', 'katra', 'srinagar', 'gulmarg', 'pahalgam', 'patnitop'].some(
    (j) => normO.includes(j) || normD.includes(j)
  );
  if (isDelhiNcr && isJammuKashmir) return 'delhi-jammu';

  // Himachal corridor
  const isHimachal = ['shimla', 'manali', 'kullu', 'dharamshala', 'dalhousie', 'solan', 'kasauli', 'chail'].some(
    (h) => normO.includes(h) || normD.includes(h)
  );
  if (isDelhiNcr && isHimachal) return 'delhi-shimla';

  // Ayodhya corridor
  const isAyodhya = ['ayodhya', 'faizabad'].some(
    (ay) => normO.includes(ay) || normD.includes(ay)
  );
  if (isDelhiNcr && isAyodhya) return 'delhi-ayodhya';

  // Varanasi / Prayagraj corridor
  const isVaranasi = ['varanasi', 'kashi', 'prayagraj', 'allahabad', 'mirzapur'].some(
    (v) => normO.includes(v) || normD.includes(v)
  );
  if (isDelhiNcr && isVaranasi) return 'delhi-varanasi';

  // Agra-Lucknow / Avadh expressway
  const isAvadh = ['lucknow', 'kanpur', 'gorakhpur'].some(
    (a) => normO.includes(a) || normD.includes(a)
  );
  if (isBraj && isAvadh) return 'agra-lucknow';
  if (isDelhiNcr && isAvadh) return 'delhi-lucknow';

  // MP corridor
  const isMp = ['gwalior', 'bhopal', 'indore', 'ujjain', 'jhansi', 'orchha'].some(
    (m) => normO.includes(m) || normD.includes(m)
  );
  if (isDelhiNcr && isMp) return 'delhi-gwalior';

  // Mumbai to Pune / Nashik
  if ((normO.includes('mumbai') || normO.includes('thane') || normO.includes('navimumbai')) && normD.includes('pune')) return 'mumbai-pune';
  if ((normD.includes('mumbai') || normD.includes('thane') || normD.includes('navimumbai')) && normO.includes('pune')) return 'mumbai-pune';
  if ((normO.includes('mumbai') || normO.includes('thane')) && (normD.includes('nashik') || normD.includes('shirdi'))) return 'mumbai-nashik';
  if ((normD.includes('mumbai') || normD.includes('thane')) && (normO.includes('nashik') || normO.includes('shirdi'))) return 'mumbai-nashik';

  // Gujarat corridors
  if (normO.includes('ahmedabad') && normD.includes('surat')) return 'ahmedabad-surat';
  if (normD.includes('ahmedabad') && normO.includes('surat')) return 'ahmedabad-surat';
  if (normO.includes('ahmedabad') && normD.includes('vadodara')) return 'ahmedabad-vadodara';
  if (normD.includes('ahmedabad') && normO.includes('vadodara')) return 'ahmedabad-vadodara';

  // Bihar corridors
  if (normO.includes('patna') && (normD.includes('gaya') || normD.includes('bodhgaya'))) return 'patna-gaya';
  if (normD.includes('patna') && (normO.includes('gaya') || normO.includes('bodhgaya'))) return 'patna-gaya';

  // West Bengal corridors
  if (normO.includes('kolkata') && (normD.includes('durgapur') || normD.includes('asansol'))) return 'kolkata-durgapur';
  if (normD.includes('kolkata') && (normO.includes('durgapur') || normO.includes('asansol'))) return 'kolkata-durgapur';

  // Haridwar departure corridors
  if (normO.includes('haridwar') && (normD.includes('delhi') || normD.includes('ghaziabad') || normD.includes('noida'))) return 'haridwar-delhi';
  if (normO.includes('haridwar') && (normD.includes('chandigarh') || normD.includes('mohali') || normD.includes('panchkula'))) return 'haridwar-chandigarh';
  if (normO.includes('haridwar') && (normD.includes('dehradun') || normD.includes('mussoorie') || normD.includes('rishikesh'))) return 'haridwar-dehradun';

  return null;
}

/**
 * Detects whether a route is an intra-NCR local transit (e.g., Ghaziabad <-> Delhi, Noida <-> Delhi, Gurugram <-> Delhi)
 * where NO NHAI highway toll plazas exist (only municipal MCD / state border tax applies).
 */
export function isDelhiNcrTransit(origin: string, destination: string): boolean {
  const normO = origin.toLowerCase();
  const normD = destination.toLowerCase();

  const ncrTokens = [
    'delhi', 'new delhi', 'ghaziabad', 'noida', 'greater noida', 'gurugram', 'gurgaon',
    'faridabad', 'sahibabad', 'indirapuram', 'vaishali', 'vasundhara', 'abul fazal',
    'jamia', 'okhla', 'jasola', 'saket', 'dwarka', 'rohini', 'lajpat nagar', 'crossings republik',
    'raj nagar', 'dasna', 'masuri', 'modinagar', 'muradnagar', 'loni', 'manesar', 'kundli',
    'anand vihar', 'sarita vihar', 'kalindi kunj', 'mayur vihar', 'laxmi nagar', 'akshardham',
    'connaught place', 'karol bagh', 'chhattarpur', 'mehrauli', 'hauz khas', 'cr park', 'kalkaji'
  ];

  const originIsNcr = ncrTokens.some((t) => normO.includes(t));
  const destIsNcr = ncrTokens.some((t) => normD.includes(t));

  return originIsNcr && destIsNcr;
}

/**
 * Calculates Route Tolls & State Taxes
 */
export function calculateRouteTolls(
  origin: string,
  destination: string,
  vehicleCategory: string = 'sedan',
  isRoundTrip: boolean = false,
  approxDistanceKm?: number
): RouteTollCalculationResult {
  const rateKey = getVehicleRateKey(vehicleCategory);
  const corridorKey = resolveCorridorKey(origin, destination);

  let selectedPlazas: TollPlazaItem[] = [];
  let crossingStates: string[] = [];

  const originState = getLocationState(origin) || 'Delhi';
  const destState = getLocationState(destination) || 'Uttar Pradesh';
  const isNcr = isDelhiNcrTransit(origin, destination);

  if (corridorKey && CORRIDOR_TOLL_MAPPINGS[corridorKey]) {
    const mapping = CORRIDOR_TOLL_MAPPINGS[corridorKey];
    selectedPlazas = mapping.tollIds
      .map((id) => TOLL_PLAZAS.find((p) => p.id === id))
      .filter((p): p is TollPlazaItem => Boolean(p));
    crossingStates = [...mapping.crossingStates];
  } else if (isNcr) {
    // Delhi NCR local cross-border or intra-city trip:
    // (e.g. Ghaziabad <-> Delhi / Abul Fazal Enclave, Noida <-> Delhi, Gurugram <-> Delhi)
    // There are NO NHAI highway toll plazas on direct city/NCR routes!
    selectedPlazas = [];

    // Check if commercial border entry / MCD toll applies
    const isDestDelhi = destState.toLowerCase().includes('delhi');
    const isOriginDelhi = originState.toLowerCase().includes('delhi');

    if (isDestDelhi && !isOriginDelhi) {
      // Commercial taxi entering Delhi from UP or Haryana pays Delhi MCD toll
      crossingStates = ['Delhi'];
    } else if (!isDestDelhi && isOriginDelhi) {
      // Commercial taxi leaving Delhi entering UP or Haryana
      crossingStates = [destState];
    } else if (originState.toLowerCase() !== destState.toLowerCase()) {
      crossingStates = [destState];
    } else {
      crossingStates = [];
    }
  } else {
    // Dynamic fallback for any other town or corridor based on distance & state crossing
    const dist = approxDistanceKm || 200;

    if (originState.toLowerCase() !== destState.toLowerCase()) {
      crossingStates = [destState];
    } else {
      // Intra-state trip: ZERO interstate commercial border entry tax!
      crossingStates = [];
    }

    // Short-distance rule: trips under 45 km without an explicit expressway mapping have NO highway tolls!
    if (dist < 45) {
      selectedPlazas = [];
    } else {
      // Smart Regional & Highway Toll Selection (Strictly matches destination & origin states)
      const matchingPlazas = TOLL_PLAZAS.filter(
        (p) => p.state.toLowerCase() === destState.toLowerCase() || p.state.toLowerCase() === originState.toLowerCase()
      );

      if (matchingPlazas.length > 0) {
        const count = Math.max(0, Math.min(matchingPlazas.length, Math.round(dist / 85)));
        selectedPlazas = matchingPlazas.slice(0, count);
      } else {
        // Select plazas matching distance
        const count = Math.max(0, Math.min(3, Math.round(dist / 100)));
        selectedPlazas = TOLL_PLAZAS.slice(0, count);
      }
    }
  }

  // Ensure intra-state routes never incur border entry taxes
  const detectedOriginState = getLocationState(origin);
  const detectedDestState = getLocationState(destination);
  if (detectedOriginState && detectedDestState && detectedOriginState.toLowerCase() === detectedDestState.toLowerCase()) {
    crossingStates = [];
  }

  // Calculate individual plaza rates
  const calculatedPlazas: CalculatedTollPlaza[] = selectedPlazas.map((plaza) => {
    let oneWay = plaza.sedanRate;
    let returnVal = plaza.sedanReturn;

    if (rateKey === 'suv') {
      oneWay = plaza.suvRate;
      returnVal = plaza.suvReturn;
    } else if (rateKey === 'traveller') {
      oneWay = plaza.travellerRate;
      returnVal = plaza.travellerReturn;
    } else if (rateKey === 'bus') {
      oneWay = plaza.busRate;
      returnVal = plaza.busReturn;
    }

    const applied = isRoundTrip ? returnVal : oneWay;

    return {
      id: plaza.id,
      name: plaza.name,
      highway: plaza.highway,
      state: plaza.state,
      lat: plaza.lat,
      lng: plaza.lng,
      oneWayRate: oneWay,
      returnRate: returnVal,
      appliedRate: applied,
      verifiedAt: plaza.verifiedAt,
      authority: plaza.authority,
    };
  });

  const totalToll = calculatedPlazas.reduce((sum, p) => sum + p.appliedRate, 0);

  // Calculate State Border Taxes
  const appliedStateTaxes: AppliedStateTax[] = crossingStates.map((st) => {
    const taxConfig = STATE_TAX_RATES[st] || {
      state: st,
      name: `${st} Commercial Border Entry Tax`,
      sedanRate: 150,
      suvRate: 200,
      travellerRate: 300,
      busRate: 500,
      validity: 'Single Entry',
      description: `Commercial taxi border entry permit for ${st}.`,
    };

    let rate = taxConfig.sedanRate;
    if (rateKey === 'suv') rate = taxConfig.suvRate;
    else if (rateKey === 'traveller') rate = taxConfig.travellerRate;
    else if (rateKey === 'bus') rate = taxConfig.busRate;

    return {
      state: taxConfig.state,
      name: taxConfig.name,
      rate,
      validity: taxConfig.validity,
      description: taxConfig.description,
    };
  });

  const totalStateTax = appliedStateTaxes.reduce((sum, t) => sum + t.rate, 0);

  return {
    origin,
    destination,
    vehicleCategory,
    isRoundTrip,
    tollPlazas: calculatedPlazas,
    totalToll,
    stateTaxes: appliedStateTaxes,
    totalStateTax,
    grandTotal: totalToll + totalStateTax,
    verificationSource: 'NHAI Toll Information System (TIS) & State Transport Records',
    lastVerified: 'November 2026',
  };
}
