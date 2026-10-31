import { VehicleCategory, Location, Route, PricingLocalPackage } from '@/types/database';
import masterRoutesData from '@/lib/data/processed-master-routes.json';

export const FALLBACK_CATEGORIES: VehicleCategory[] = [
  {
    id: 'cat-sedan',
    name: 'Sedan',
    slug: 'sedan',
    description: 'Comfortable 4-seater sedans ideal for outstation travel and small families.',
    display_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-suv',
    name: 'SUV / MUV',
    slug: 'suv-muv',
    description: 'Spacious 6 to 7-seater vehicles perfect for family outstation trips and hilly terrain.',
    display_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-exec-suv',
    name: 'Executive SUV',
    slug: 'executive-suv',
    description: 'Premium luxury SUVs offering top-tier comfort and style.',
    display_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-hatchback',
    name: 'Hatchback',
    slug: 'hatchback',
    description: 'Compact and economical cars ideal for quick city rides and short trips.',
    display_order: 4,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const FALLBACK_PACKAGES: PricingLocalPackage[] = [
  {
    id: 'pkg-8h80k',
    category_id: 'cat-sedan',
    package_name: '8 Hours / 80 KM',
    included_hours: 8,
    included_km: 80,
    package_price: 2000,
    extra_hour_rate: 150,
    extra_km_rate: 15,
    default_included_charges: ['Fuel', 'Driver Allowance'],
    default_excluded_charges: ['Toll Tax', 'Parking'],
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'pkg-12h120k',
    category_id: 'cat-sedan',
    package_name: '12 Hours / 120 KM',
    included_hours: 12,
    included_km: 120,
    package_price: 2800,
    extra_hour_rate: 150,
    extra_km_rate: 15,
    default_included_charges: ['Fuel', 'Driver Allowance'],
    default_excluded_charges: ['Toll Tax', 'Parking'],
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

// Generate unique locations from masterRoutesData
const locationMap = new Map<string, Location>();

// Ensure Delhi Airport & Noida Airport are present as airport type
locationMap.set('Delhi Airport', {
  id: 'loc-delhi-airport',
  name: 'Delhi Airport',
  city: 'Delhi',
  state: 'Delhi',
  location_type: 'airport',
  is_active: true,
  created_at: new Date().toISOString(),
});

locationMap.set('Noida Airport', {
  id: 'loc-noida-airport',
  name: 'Noida Airport',
  city: 'Noida',
  state: 'Uttar Pradesh',
  location_type: 'airport',
  is_active: true,
  created_at: new Date().toISOString(),
});

masterRoutesData.slice(0, 50).forEach((r) => {
  if (!locationMap.has(r.originName)) {
    locationMap.set(r.originName, {
      id: `loc-${r.originName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: r.originName,
      city: r.originName,
      state: 'North India',
      location_type: r.originName.toLowerCase().includes('airport') ? 'airport' : 'city',
      is_active: true,
      created_at: new Date().toISOString(),
    });
  }
  if (!locationMap.has(r.destName)) {
    locationMap.set(r.destName, {
      id: `loc-${r.destName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: r.destName,
      city: r.destName,
      state: 'North India',
      location_type: r.destName.toLowerCase().includes('airport') ? 'airport' : 'city',
      is_active: true,
      created_at: new Date().toISOString(),
    });
  }
});

export const FALLBACK_LOCATIONS: Location[] = Array.from(locationMap.values());

export const FALLBACK_ROUTES: Route[] = masterRoutesData.slice(0, 30).map((r) => {
  const originLoc = locationMap.get(r.originName) || {
    id: `loc-${r.originName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: r.originName,
    city: r.originName,
    state: 'North India',
    location_type: 'city',
    is_active: true,
    created_at: new Date().toISOString(),
  };

  const destLoc = locationMap.get(r.destName) || {
    id: `loc-${r.destName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: r.destName,
    city: r.destName,
    state: 'North India',
    location_type: 'city',
    is_active: true,
    created_at: new Date().toISOString(),
  };

  return {
    id: r.id,
    origin_location_id: originLoc.id,
    destination_location_id: destLoc.id,
    estimated_distance_km: r.estimated_distance_km || 250,
    estimated_duration_minutes: r.estimated_duration_minutes || 240,
    is_active: true,
    created_at: new Date().toISOString(),
    origin: originLoc,
    destination: destLoc,
  };
});

/**
 * Execute a promise with a strict timeout to prevent Server Component hangs on external dependencies.
 */
export async function withTimeout<T>(promise: Promise<T>, timeoutMs = 2500, fallback: T): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timeoutId = setTimeout(() => {
      resolve(fallback);
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch {
    clearTimeout(timeoutId!);
    return fallback;
  }
}
