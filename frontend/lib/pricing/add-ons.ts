/**
 * URGENT TAXIS — CHARGEABLE VEHICLE ADD-ONS (PHASE 3)
 * Single Source of Truth for owner-approved vehicle add-ons.
 * 
 * Commercial Rules:
 * 1. Fixed price: Exactly ₹300 per selected add-on.
 * 2. All 3 selected = ₹900.
 * 3. Never trust client-supplied prices; server always computes from this config.
 * 4. Preferences are subject to operational availability upon fleet dispatch.
 * 5. Rooftop Luggage Carrier is strictly permitted ONLY on eligible SUV/MUV and Innova Crysta categories.
 */

export interface BookingAddOn {
  id: 'new_vehicle' | 'english_driver' | 'rooftop_carrier';
  name: string;
  price: number;
  shortDescription: string;
  disclaimer: string;
  supportedCategories: string[]; // vehicle category IDs / slugs; ['*'] means all
  ineligibleMessage?: string;
}

export const ADDON_PRICE_PER_ITEM = 300;

export const BOOKING_ADDONS: Record<string, BookingAddOn> = {
  new_vehicle: {
    id: 'new_vehicle',
    name: 'New Vehicle Preference',
    price: ADDON_PRICE_PER_ITEM,
    shortDescription: 'Request a newer model vehicle, preferably model year 2023 or newer.',
    disclaimer: 'Preference requested. Subject to fleet operational availability at dispatch.',
    supportedCategories: [
      'hatchback',
      'sedan',
      'suv-muv',
      'suv_mpv',
      'suv',
      'executive-suv',
      'innova',
      'innova_crysta',
      'tempo12',
      'tempo16',
    ],
  },
  english_driver: {
    id: 'english_driver',
    name: 'English-Speaking Driver',
    price: ADDON_PRICE_PER_ITEM,
    shortDescription: 'Request an English-speaking chauffeur for clear communication.',
    disclaimer: 'Preference requested. Subject to driver assignment and operational availability.',
    supportedCategories: ['*'],
  },
  rooftop_carrier: {
    id: 'rooftop_carrier',
    name: 'Rooftop Luggage Carrier',
    price: ADDON_PRICE_PER_ITEM,
    shortDescription: 'Request an overhead rooftop luggage rack for additional group baggage.',
    disclaimer: 'Preference requested. Subject to operational carrier mounting and vehicle eligibility.',
    // Strictly eligible ONLY for SUV/MUV (Ertiga/Carens) and Executive SUV (Innova Crysta)
    supportedCategories: [
      'suv-muv',
      'suv_mpv',
      'suv',
      'executive-suv',
      'innova',
      'innova_crysta',
    ],
    ineligibleMessage: 'Safe intercity mounting available only on SUV/MUV & Innova Crysta. Not permitted on Sedans or Hatchbacks.',
  },
};

/**
 * Check if an add-on is operationally compatible with a given vehicle category.
 */
export function isAddOnSupported(addOnId: string, categoryId: string): boolean {
  const addon = BOOKING_ADDONS[addOnId];
  if (!addon) return false;
  if (addon.supportedCategories.includes('*')) return true;

  const normalizedCategory = (categoryId || '').toLowerCase().trim();
  return addon.supportedCategories.some(
    (cat) => cat.toLowerCase() === normalizedCategory || normalizedCategory.includes(cat.toLowerCase())
  );
}

export interface ValidatedAddOnsResult {
  validAddOns: BookingAddOn[];
  addOnTotal: number;
  errors: string[];
}

/**
 * Server & Client validation helper: validates add-on IDs, checks vehicle compatibility,
 * removes duplicates, and computes authoritative total charges.
 */
export function validateAndComputeAddOns(
  requestedAddOnIds: string[] | undefined | null,
  categoryId: string
): ValidatedAddOnsResult {
  if (!requestedAddOnIds || !Array.isArray(requestedAddOnIds) || requestedAddOnIds.length === 0) {
    return {
      validAddOns: [],
      addOnTotal: 0,
      errors: [],
    };
  }

  const seen = new Set<string>();
  const validAddOns: BookingAddOn[] = [];
  const errors: string[] = [];

  for (const rawId of requestedAddOnIds) {
    if (typeof rawId !== 'string') continue;
    const id = rawId.trim();
    if (!id) continue;

    if (seen.has(id)) {
      // Deduplicate silently or flag
      continue;
    }
    seen.add(id);

    const definition = BOOKING_ADDONS[id];
    if (!definition) {
      errors.push(`Invalid add-on ID: '${id}'.`);
      continue;
    }

    if (!isAddOnSupported(id, categoryId)) {
      errors.push(
        definition.ineligibleMessage ||
          `Add-on '${definition.name}' is not compatible with vehicle category '${categoryId}'.`
      );
      continue;
    }

    validAddOns.push(definition);
  }

  const addOnTotal = validAddOns.length * ADDON_PRICE_PER_ITEM;

  return {
    validAddOns,
    addOnTotal,
    errors,
  };
}
