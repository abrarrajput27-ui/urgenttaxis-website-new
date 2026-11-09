import masterRoutesData from '../data/processed-master-routes.json';

export interface VerifiedMasterRoute {
  id: string;
  slug: string;
  originName: string;
  destName: string;
  estimated_distance_km: number;
  estimated_duration_minutes: number;
  durationText?: string;
  sedanFare: number;
  ertigaFare: number;
  crystaFare: number;
  about?: string;
  faqs?: Array<{ question: string; answer: string }>;
}

export interface VerifiedCorridorFareResult {
  isVerified: boolean;
  fare: number;
  category: string;
  matchedRoute?: VerifiedMasterRoute;
  reason?: string;
}

export type SupportedVehicleCategory =
  | 'hatchback'
  | 'sedan'
  | 'suv-muv'
  | 'innova'
  | 'executive-suv'
  | 'tempo'
  | 'urbania'
  | 'bus';

export interface VehicleValidationResult {
  isValid: boolean;
  normalizedCategory?: SupportedVehicleCategory;
  perKmRate?: number;
  displayName?: string;
  error?: string;
  isOnlineBookingPermitted?: boolean;
  requiresManualQuote?: boolean;
  quoteRequiredMessage?: string;
}

export const GROUP_VEHICLE_NORMALIZED_CATEGORIES = ['tempo', 'urbania', 'bus'] as const;
export type GroupVehicleCategory = (typeof GROUP_VEHICLE_NORMALIZED_CATEGORIES)[number];

export function isGroupVehicleCategory(rawCategory?: string | null): boolean {
  if (!rawCategory || typeof rawCategory !== 'string' || !rawCategory.trim()) return false;
  const clean = rawCategory.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
  const match = SUPPORTED_VEHICLE_CATEGORIES[clean];
  if (!match) return false;
  return (GROUP_VEHICLE_NORMALIZED_CATEGORIES as readonly string[]).includes(match.normalized);
}

export const SUPPORTED_VEHICLE_CATEGORIES: Record<
  string,
  { normalized: SupportedVehicleCategory; perKmRate: number; displayName: string }
> = {
  // Hatchback (₹11/km)
  'hatchback': { normalized: 'hatchback', perKmRate: 11, displayName: 'Hatchback (WagonR / Swift)' },
  'cat-hatchback': { normalized: 'hatchback', perKmRate: 11, displayName: 'Hatchback (WagonR / Swift)' },
  'wagonr': { normalized: 'hatchback', perKmRate: 11, displayName: 'Hatchback (WagonR / Swift)' },
  'swift': { normalized: 'hatchback', perKmRate: 11, displayName: 'Hatchback (WagonR / Swift)' },

  // Sedan (₹12/km)
  'sedan': { normalized: 'sedan', perKmRate: 12, displayName: 'Sedan (Dzire / Etios)' },
  'cat-sedan': { normalized: 'sedan', perKmRate: 12, displayName: 'Sedan (Dzire / Etios)' },
  'dzire': { normalized: 'sedan', perKmRate: 12, displayName: 'Sedan (Dzire / Etios)' },
  'etios': { normalized: 'sedan', perKmRate: 12, displayName: 'Sedan (Dzire / Etios)' },

  // SUV / MUV / Ertiga (₹15/km)
  'suv-muv': { normalized: 'suv-muv', perKmRate: 15, displayName: 'SUV / MUV (Ertiga / Carens)' },
  'cat-suv': { normalized: 'suv-muv', perKmRate: 15, displayName: 'SUV / MUV (Ertiga / Carens)' },
  'suv_mpv': { normalized: 'suv-muv', perKmRate: 15, displayName: 'SUV / MUV (Ertiga / Carens)' },
  'suv': { normalized: 'suv-muv', perKmRate: 15, displayName: 'SUV / MUV (Ertiga / Carens)' },
  'muv': { normalized: 'suv-muv', perKmRate: 15, displayName: 'SUV / MUV (Ertiga / Carens)' },
  'mpv': { normalized: 'suv-muv', perKmRate: 15, displayName: 'SUV / MUV (Ertiga / Carens)' },
  'ertiga': { normalized: 'suv-muv', perKmRate: 15, displayName: 'SUV / MUV (Ertiga / Carens)' },
  'carens': { normalized: 'suv-muv', perKmRate: 15, displayName: 'SUV / MUV (Ertiga / Carens)' },

  // Standard Toyota Innova Classic (₹19/km)
  'innova': { normalized: 'innova', perKmRate: 19, displayName: 'Toyota Innova (Classic 7-Seater)' },
  'cat-innova': { normalized: 'innova', perKmRate: 19, displayName: 'Toyota Innova (Classic 7-Seater)' },
  'toyota-innova': { normalized: 'innova', perKmRate: 19, displayName: 'Toyota Innova (Classic 7-Seater)' },

  // Innova Crysta / Executive SUV (₹22/km)
  'executive-suv': { normalized: 'executive-suv', perKmRate: 22, displayName: 'Executive SUV (Innova Crysta)' },
  'cat-exec-suv': { normalized: 'executive-suv', perKmRate: 22, displayName: 'Executive SUV (Innova Crysta)' },
  'crysta': { normalized: 'executive-suv', perKmRate: 22, displayName: 'Executive SUV (Innova Crysta)' },
  'innova-crysta': { normalized: 'executive-suv', perKmRate: 22, displayName: 'Executive SUV (Innova Crysta)' },
  'innova_crysta': { normalized: 'executive-suv', perKmRate: 22, displayName: 'Executive SUV (Innova Crysta)' },

  // Tempo Traveller (₹26/km)
  'tempo': { normalized: 'tempo', perKmRate: 26, displayName: 'Tempo Traveller' },
  'tempo-traveller': { normalized: 'tempo', perKmRate: 26, displayName: 'Tempo Traveller' },
  'tempo12': { normalized: 'tempo', perKmRate: 24, displayName: '12-Seater Tempo Traveller' },
  'tempo16': { normalized: 'tempo', perKmRate: 26, displayName: '16-Seater Tempo Traveller' },
  'tempo20': { normalized: 'tempo', perKmRate: 28, displayName: '20-Seater Tempo Traveller' },
  'tempo26': { normalized: 'tempo', perKmRate: 32, displayName: '26-Seater Tempo Traveller' },

  // Force Urbania (₹32/km)
  'urbania': { normalized: 'urbania', perKmRate: 32, displayName: 'Force Urbania Luxury' },
  'force-urbania': { normalized: 'urbania', perKmRate: 32, displayName: 'Force Urbania Luxury' },
  'urbania12': { normalized: 'urbania', perKmRate: 30, displayName: '12-Seater Force Urbania' },
  'urbania16': { normalized: 'urbania', perKmRate: 34, displayName: '16-Seater Force Urbania' },

  // Luxury Bus (₹48/km)
  'bus': { normalized: 'bus', perKmRate: 48, displayName: 'Luxury Bus Charter' },
  'luxury-bus': { normalized: 'bus', perKmRate: 48, displayName: 'Luxury Bus Charter' },
  'coach': { normalized: 'bus', perKmRate: 48, displayName: 'Luxury Bus Charter' },
  'bus27': { normalized: 'bus', perKmRate: 45, displayName: '27-Seater Mini Bus' },
  'bus45': { normalized: 'bus', perKmRate: 55, displayName: '45-Seater Luxury Coach' },
};

/**
 * Validates and normalizes vehicle category input against approved commercial categories.
 * Rejects missing, empty, or unsupported vehicle categories.
 */
export function validateAndNormalizeVehicleCategory(
  rawCategory?: string | null
): VehicleValidationResult {
  if (!rawCategory || typeof rawCategory !== 'string' || !rawCategory.trim()) {
    return {
      isValid: false,
      error: 'Vehicle category is required and cannot be empty.',
    };
  }

  const clean = rawCategory.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
  const match = SUPPORTED_VEHICLE_CATEGORIES[clean];
  if (match) {
    const isGroup = (GROUP_VEHICLE_NORMALIZED_CATEGORIES as readonly string[]).includes(match.normalized);
    return {
      isValid: true,
      normalizedCategory: match.normalized,
      perKmRate: match.perKmRate,
      displayName: match.displayName,
      isOnlineBookingPermitted: !isGroup,
      requiresManualQuote: isGroup,
      quoteRequiredMessage: isGroup
        ? `${match.displayName} requires a manual quotation and dispatch confirmation. Please contact our 24x7 desk via Call (+91 7310651940) or WhatsApp (+91 8595066033).`
        : undefined,
    };
  }

  return {
    isValid: false,
    error: `Unsupported vehicle category '${rawCategory}'. Supported categories are: Hatchback, Sedan, Ertiga / SUV, Innova, Innova Crysta, Tempo Traveller, Urbania, Bus.`,
  };
}

export const CANONICAL_MASTER_PLACES = [
  'Agra', 'Ajmer', 'Aligarh', 'Almora', 'Ambala', 'Amritsar', 'Ayodhya',
  'Bahadurgarh', 'Bareilly', 'Bhimtal', 'Chandigarh', 'Dalhousie', 'Dehradun',
  'Dharamshala', 'Faridabad', 'Ghaziabad', 'Gorakhpur', 'Gurugram', 'Haldwani',
  'Haridwar', 'Jaipur', 'Jalandhar', 'Jammu', 'Jodhpur', 'Kainchi Dham',
  'Kanpur', 'Karnal', 'Kasol', 'Kathgodam', 'Kausani', 'Kurukshetra',
  'Lucknow', 'Ludhiana', 'Manali', 'Mathura', 'Meerut', 'Moradabad',
  'Mukteshwar', 'Mussoorie', 'Nainital', 'Panipat', 'Prayagraj', 'Pushkar',
  'Ramnagar', 'Rampur', 'Ranikhet', 'Rishikesh', 'Rohtak', 'Rudrapur',
  'Sattal', 'Shimla', 'Sonipat', 'Srinagar', 'Udaipur', 'Varanasi', 'Vrindavan'
];

/**
 * Resolves raw user input (city or street address) into a distinct canonical location.
 * Implements strict boundary and phrase matching to ensure:
 * - Greater Noida and Noida remain strictly distinct.
 * - Delhi and Delhi Airport remain strictly distinct.
 * - Ambiguous mixed addresses return 'AMBIGUOUS'.
 */
export function resolveCanonicalPlace(raw?: string | null): string {
  if (!raw || typeof raw !== 'string') return '';

  const text = raw
    .toLowerCase()
    .replace(/-/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) return '';

  // 1. Noida International Airport / Jewar Airport / Noida Airport
  if (/\b(noida\s+(international\s+)?airport|jewar\s+airport|jewar)\b/i.test(text)) {
    return 'Noida International Airport';
  }

  // 2. Greater Noida vs Noida Disambiguation
  const hasGrNoida = /\b(greater\s+noida|gr\s+noida|gr\.?\s*noida)\b/i.test(text);
  if (hasGrNoida) {
    const remaining = text.replace(/\b(greater\s+noida|gr\s+noida|gr\.?\s*noida)\b/gi, '').trim();
    if (/\bnoida\b/i.test(remaining)) {
      return 'AMBIGUOUS';
    }
    return 'Greater Noida';
  }

  // Standalone plain Noida
  if (/\bnoida\b/i.test(text)) {
    return 'Noida';
  }

  // 3. Delhi Airport vs New Delhi vs Delhi Disambiguation
  const hasDelhiAirport = /\b(delhi\s+airport|igi\s+airport|igi\s+t[123]|igi\s+terminal\s*[123]|indira\s+gandhi\s+(international\s+)?airport|t[123]\s+delhi\s+airport|terminal\s+[123]\s+igi|igi)\b/i.test(text);
  if (hasDelhiAirport) {
    return 'Delhi Airport';
  }

  const hasNewDelhi = /\b(new\s+delhi|ndls|connaught\s+place)\b/i.test(text);
  if (hasNewDelhi) {
    const remaining = text.replace(/\b(new\s+delhi|ndls|connaught\s+place)\b/gi, '').trim();
    if (/\bdelhi\b/i.test(remaining) && /old\s+delhi/i.test(text)) {
      return 'AMBIGUOUS';
    }
    return 'New Delhi';
  }

  if (/\bdelhi\b/i.test(text)) {
    return 'Delhi';
  }

  // 4. Jim Corbett
  if (/\b(jim\s+corbett|corbett\s+national\s+park|corbett)\b/i.test(text)) {
    return 'Jim Corbett';
  }

  // 5. Canonical Cities in Master Routes
  for (const c of CANONICAL_MASTER_PLACES) {
    const rx = new RegExp(`\\b${c.toLowerCase()}\\b`, 'i');
    if (rx.test(text)) {
      return c;
    }
  }

  return '';
}

/**
 * Authoritative lookup for verified master route corridors.
 * Matches ONLY explicit requested-direction routes.
 * A forward-only route is NEVER automatically reused for the opposite direction.
 */
export function findVerifiedMasterRoute(
  routeId?: string,
  origin?: string,
  destination?: string
): VerifiedMasterRoute | null {
  const routes = masterRoutesData as VerifiedMasterRoute[];

  const canOrig = origin ? resolveCanonicalPlace(origin) : '';
  const canDest = destination ? resolveCanonicalPlace(destination) : '';

  // Ambiguity check
  if (canOrig === 'AMBIGUOUS' || canDest === 'AMBIGUOUS') {
    return null;
  }

  // Match by routeId / slug if provided
  let idMatch: VerifiedMasterRoute | null = null;
  if (routeId && typeof routeId === 'string' && routeId.trim()) {
    const cleanId = routeId.trim().toLowerCase();
    idMatch =
      routes.find(
        (r) =>
          r.id.toLowerCase() === cleanId ||
          r.slug.toLowerCase() === cleanId ||
          r.slug.toLowerCase() === `${cleanId}-taxi` ||
          `${r.slug.toLowerCase()}-taxi` === cleanId
      ) || null;
  }

  // If both origin and destination are provided
  if (canOrig && canDest) {
    if (canOrig.toLowerCase() === canDest.toLowerCase()) {
      return null; // Same origin and destination cannot be a verified intercity corridor
    }

    // If an idMatch was found, verify it matches the requested travel direction
    if (idMatch) {
      const idOrig = resolveCanonicalPlace(idMatch.originName);
      const idDest = resolveCanonicalPlace(idMatch.destName);
      if (idOrig.toLowerCase() === canOrig.toLowerCase() && idDest.toLowerCase() === canDest.toLowerCase()) {
        return idMatch;
      }
      // If idMatch direction conflicts with requested travel direction, do NOT use idMatch
    }

    // Look for EXACT requested direction in master dataset
    const forwardMatch = routes.find(
      (r) =>
        resolveCanonicalPlace(r.originName).toLowerCase() === canOrig.toLowerCase() &&
        resolveCanonicalPlace(r.destName).toLowerCase() === canDest.toLowerCase()
    );

    if (forwardMatch) {
      return forwardMatch;
    }

    // New Delhi outstation alias fallback (e.g. 'New Delhi' -> 'Nainital' maps to 'Delhi' -> 'Nainital')
    if (canOrig.toLowerCase() === 'new delhi') {
      const ndFallback = routes.find(
        (r) =>
          resolveCanonicalPlace(r.originName).toLowerCase() === 'delhi' &&
          resolveCanonicalPlace(r.destName).toLowerCase() === canDest.toLowerCase()
      );
      if (ndFallback) return ndFallback;
    }
    if (canDest.toLowerCase() === 'new delhi') {
      const ndDestFallback = routes.find(
        (r) =>
          resolveCanonicalPlace(r.originName).toLowerCase() === canOrig.toLowerCase() &&
          resolveCanonicalPlace(r.destName).toLowerCase() === 'delhi'
      );
      if (ndDestFallback) return ndDestFallback;
    }

    // If no explicit requested-direction record exists:
    // Under approved policy: DO NOT reuse the reverse-direction record! Return null!
    return null;
  }

  // If only routeId was provided without conflicting origin/destination
  if (idMatch && (!origin || !destination)) {
    return idMatch;
  }

  return null;
}

/**
 * Resolves authoritative corridor fare for a verified master route record.
 * Validates vehicle category and rejects unsupported classes without defaulting to Sedan.
 */
export function getVerifiedRouteCorridorFare(
  route: VerifiedMasterRoute,
  categoryId: string,
  actualDistanceKm?: number
): VerifiedCorridorFareResult {
  const validation = validateAndNormalizeVehicleCategory(categoryId);
  if (!validation.isValid || !validation.normalizedCategory) {
    return {
      isVerified: false,
      fare: 0,
      category: '',
      reason: validation.error || 'Invalid or unsupported vehicle category',
    };
  }

  const normCat = validation.normalizedCategory;
  const dist = actualDistanceKm || route.estimated_distance_km || 250;

  if (normCat === 'hatchback') {
    const fare = Math.round(route.sedanFare * 0.88);
    return { isVerified: true, fare, category: 'hatchback', matchedRoute: route };
  }
  if (normCat === 'executive-suv') {
    const fare = route.crystaFare || Math.round(route.sedanFare * 2.1);
    return { isVerified: true, fare, category: 'executive-suv', matchedRoute: route };
  }
  if (normCat === 'suv-muv') {
    const fare = route.ertigaFare || Math.round(route.sedanFare * 1.35);
    return { isVerified: true, fare, category: 'suv-muv', matchedRoute: route };
  }
  if (normCat === 'innova') {
    const fare = Math.max(2800, Math.round(dist * 19));
    return { isVerified: true, fare, category: 'innova', matchedRoute: route };
  }
  if (normCat === 'tempo') {
    const fare = Math.max(4500, Math.round(dist * (validation.perKmRate || 26)));
    return { isVerified: true, fare, category: 'tempo', matchedRoute: route };
  }
  if (normCat === 'urbania') {
    const fare = Math.max(6000, Math.round(dist * (validation.perKmRate || 32)));
    return { isVerified: true, fare, category: 'urbania', matchedRoute: route };
  }
  if (normCat === 'bus') {
    const fare = Math.max(9000, Math.round(dist * (validation.perKmRate || 48)));
    return { isVerified: true, fare, category: 'bus', matchedRoute: route };
  }
  if (normCat === 'sedan') {
    const fare = route.sedanFare || Math.max(1600, Math.round(dist * 12));
    return { isVerified: true, fare, category: 'sedan', matchedRoute: route };
  }

  return {
    isVerified: false,
    fare: 0,
    category: '',
    reason: `Unsupported vehicle category '${categoryId}'`,
  };
}
