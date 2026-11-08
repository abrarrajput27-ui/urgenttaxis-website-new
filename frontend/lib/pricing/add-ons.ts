/**
 * URGENT TAXIS — CHARGEABLE VEHICLE ADD-ONS (PHASE 3 & MAKE MY TRIP PARITY)
 * Single Source of Truth for owner-approved vehicle add-ons.
 * 
 * Commercial Rules:
 * 1. Specific add-on pricing:
 *    - New Vehicle Preference: ₹300
 *    - English-Speaking Driver: ₹300
 *    - Rooftop Luggage Carrier: ₹300 (Available across ALL vehicles)
 *    - Pet Friendly Cab: ₹1,000
 *    - Airport Terminal Entry & Parking Fee: ₹270
 * 2. Never trust client-supplied prices; server always computes from this config.
 * 3. Preferences are subject to operational availability upon fleet dispatch.
 * 4. Rooftop Luggage Carrier is available across all vehicles as requested.
 */

export type BookingAddOnId =
  | 'new_vehicle'
  | 'english_driver'
  | 'rooftop_carrier'
  | 'pet_friendly'
  | 'airport_entry_toll';

export interface BookingAddOn {
  id: BookingAddOnId | string;
  name: string;
  price: number;
  shortDescription: string;
  disclaimer: string;
  supportedCategories: string[]; // vehicle category IDs / slugs; ['*'] means all
  ineligibleMessage?: string;
  icon?: string;
}

export const ADDON_PRICE_PER_ITEM = 300;

export const BOOKING_ADDONS: Record<string, BookingAddOn> = {
  new_vehicle: {
    id: 'new_vehicle',
    name: 'New Vehicle Preference',
    price: 300,
    shortDescription: 'Request a newer model vehicle, preferably model year 2023 or newer.',
    disclaimer: 'Preference requested. Subject to fleet operational availability at dispatch.',
    supportedCategories: ['*'],
    icon: '🚗',
  },
  english_driver: {
    id: 'english_driver',
    name: 'English-Speaking Driver',
    price: 300,
    shortDescription: 'Request an English-speaking chauffeur for clear communication.',
    disclaimer: 'Preference requested. Subject to driver assignment and operational availability.',
    supportedCategories: ['*'],
    icon: '🗣️',
  },
  rooftop_carrier: {
    id: 'rooftop_carrier',
    name: 'Rooftop Luggage Carrier',
    price: 300,
    shortDescription: 'Request an overhead rooftop luggage carrier rack for additional baggage.',
    disclaimer: 'Preference requested. Subject to carrier mounting and road clearance.',
    supportedCategories: ['*'],
    icon: '🧳',
  },
  pet_friendly: {
    id: 'pet_friendly',
    name: 'Pet Friendly Cab',
    price: 1000,
    shortDescription: 'Travel stress-free with pets; includes seat protective cover & deep sanitization.',
    disclaimer: 'Pets allowed with prior intimation. Driver carries pet-friendly protective mats.',
    supportedCategories: ['*'],
    icon: '🐾',
  },
  airport_entry_toll: {
    id: 'airport_entry_toll',
    name: 'Airport Terminal Entry & Parking Fee',
    price: 270,
    shortDescription: 'Prepaid airport terminal entry slip and dedicated parking bay clearance.',
    disclaimer: 'Includes airport terminal arrival entry slip and standard parking waiting clearance.',
    supportedCategories: ['*'],
    icon: '✈️',
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
      // Deduplicate silently
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

  const addOnTotal = validAddOns.reduce((sum, item) => sum + (item.price || 0), 0);

  return {
    validAddOns,
    addOnTotal,
    errors,
  };
}
