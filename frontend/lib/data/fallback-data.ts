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

// Authoritative local rental fallback packages using approved rates from BUSINESS_CONFIG
export const FALLBACK_PACKAGES: (PricingLocalPackage & { base_fare?: number })[] = [
  // Sedan (Dzire, Etios)
  {
    id: 'pkg-8h80k-sedan',
    category_id: 'cat-sedan',
    package_name: '8 Hours / 80 KM',
    included_hours: 8,
    included_km: 80,
    package_price: 1800,
    base_fare: 1800,
    extra_hour_rate: 180,
    extra_km_rate: 11,
    default_included_charges: ['Fuel', 'Driver Allowance'],
    default_excluded_charges: ['Toll Tax', 'Parking'],
    is_active: true,
    created_at: new Date().toISOString(),
    vehicle_categories: {
      id: 'cat-sedan',
      name: 'Sedan (Dzire/Etios)',
      slug: 'sedan',
      display_order: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'pkg-12h120k-sedan',
    category_id: 'cat-sedan',
    package_name: '12 Hours / 120 KM',
    included_hours: 12,
    included_km: 120,
    package_price: 2500,
    base_fare: 2500,
    extra_hour_rate: 180,
    extra_km_rate: 11,
    default_included_charges: ['Fuel', 'Driver Allowance'],
    default_excluded_charges: ['Toll Tax', 'Parking'],
    is_active: true,
    created_at: new Date().toISOString(),
    vehicle_categories: {
      id: 'cat-sedan',
      name: 'Sedan (Dzire/Etios)',
      slug: 'sedan',
      display_order: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  // SUV / MUV (Ertiga)
  {
    id: 'pkg-8h80k-suv',
    category_id: 'cat-suv',
    package_name: '8 Hours / 80 KM',
    included_hours: 8,
    included_km: 80,
    package_price: 2500,
    base_fare: 2500,
    extra_hour_rate: 220,
    extra_km_rate: 15,
    default_included_charges: ['Fuel', 'Driver Allowance'],
    default_excluded_charges: ['Toll Tax', 'Parking'],
    is_active: true,
    created_at: new Date().toISOString(),
    vehicle_categories: {
      id: 'cat-suv',
      name: 'SUV / MPV (Ertiga 6-Seater)',
      slug: 'suv-muv',
      display_order: 2,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'pkg-12h120k-suv',
    category_id: 'cat-suv',
    package_name: '12 Hours / 120 KM',
    included_hours: 12,
    included_km: 120,
    package_price: 3400,
    base_fare: 3400,
    extra_hour_rate: 220,
    extra_km_rate: 15,
    default_included_charges: ['Fuel', 'Driver Allowance'],
    default_excluded_charges: ['Toll Tax', 'Parking'],
    is_active: true,
    created_at: new Date().toISOString(),
    vehicle_categories: {
      id: 'cat-suv',
      name: 'SUV / MPV (Ertiga 6-Seater)',
      slug: 'suv-muv',
      display_order: 2,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  // Executive SUV (Innova Crysta)
  {
    id: 'pkg-8h80k-exec',
    category_id: 'cat-exec-suv',
    package_name: '8 Hours / 80 KM',
    included_hours: 8,
    included_km: 80,
    package_price: 3200,
    base_fare: 3200,
    extra_hour_rate: 300,
    extra_km_rate: 20,
    default_included_charges: ['Fuel', 'Driver Allowance'],
    default_excluded_charges: ['Toll Tax', 'Parking'],
    is_active: true,
    created_at: new Date().toISOString(),
    vehicle_categories: {
      id: 'cat-exec-suv',
      name: 'Premium SUV (Innova Crysta)',
      slug: 'executive-suv',
      display_order: 3,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'pkg-12h120k-exec',
    category_id: 'cat-exec-suv',
    package_name: '12 Hours / 120 KM',
    included_hours: 12,
    included_km: 120,
    package_price: 4500,
    base_fare: 4500,
    extra_hour_rate: 300,
    extra_km_rate: 20,
    default_included_charges: ['Fuel', 'Driver Allowance'],
    default_excluded_charges: ['Toll Tax', 'Parking'],
    is_active: true,
    created_at: new Date().toISOString(),
    vehicle_categories: {
      id: 'cat-exec-suv',
      name: 'Premium SUV (Innova Crysta)',
      slug: 'executive-suv',
      display_order: 3,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  // Hatchback (WagonR, Swift)
  {
    id: 'pkg-8h80k-hatch',
    category_id: 'cat-hatchback',
    package_name: '8 Hours / 80 KM',
    included_hours: 8,
    included_km: 80,
    package_price: 1600,
    base_fare: 1600,
    extra_hour_rate: 150,
    extra_km_rate: 10,
    default_included_charges: ['Fuel', 'Driver Allowance'],
    default_excluded_charges: ['Toll Tax', 'Parking'],
    is_active: true,
    created_at: new Date().toISOString(),
    vehicle_categories: {
      id: 'cat-hatchback',
      name: 'Hatchback (WagonR/Swift)',
      slug: 'hatchback',
      display_order: 4,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'pkg-12h120k-hatch',
    category_id: 'cat-hatchback',
    package_name: '12 Hours / 120 KM',
    included_hours: 12,
    included_km: 120,
    package_price: 2200,
    base_fare: 2200,
    extra_hour_rate: 150,
    extra_km_rate: 10,
    default_included_charges: ['Fuel', 'Driver Allowance'],
    default_excluded_charges: ['Toll Tax', 'Parking'],
    is_active: true,
    created_at: new Date().toISOString(),
    vehicle_categories: {
      id: 'cat-hatchback',
      name: 'Hatchback (WagonR/Swift)',
      slug: 'hatchback',
      display_order: 4,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
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

export const FALLBACK_ROUTES: Route[] = masterRoutesData.slice(0, 30).map((r, index) => ({
  id: r.id || `fallback-route-${index + 1}`,
  origin_location_id: `loc-${r.originName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  destination_location_id: `loc-${r.destName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  estimated_distance_km: r.estimated_distance_km,
  estimated_duration_minutes: r.estimated_duration_minutes,
  is_active: true,
  created_at: new Date().toISOString(),
  origin: {
    id: `loc-${r.originName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: r.originName,
    city: r.originName,
    state: 'North India',
    location_type: r.originName.toLowerCase().includes('airport') ? 'airport' : 'city',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  destination: {
    id: `loc-${r.destName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: r.destName,
    city: r.destName,
    state: 'North India',
    location_type: r.destName.toLowerCase().includes('airport') ? 'airport' : 'city',
    is_active: true,
    created_at: new Date().toISOString(),
  },
}));


export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number = 2000,
  fallbackValue: T
): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timeoutId = setTimeout(() => resolve(fallbackValue), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}
