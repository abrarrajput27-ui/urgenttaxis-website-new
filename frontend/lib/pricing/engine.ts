import {
  DynamicPricingRule,
  PricingOneWay,
  PricingRoundTrip,
  PricingLocalPackage,
  PricingAirportTransfer,
  VehicleCategory,
  VehicleModel,
  VehicleVariant,
  FuelType,
} from '@/types/database';

export type ServiceType = 'one_way' | 'round_trip' | 'local_rental' | 'airport_transfer';

// ----------------------------------------------------------------------
// PHASE 4B-1 & 4B-4: CORE TYPES & CHARGE CONFIGURATION
// ----------------------------------------------------------------------

export type PricingMode = 'AUTOMATIC' | 'MANUAL';

export interface ChargeItem {
  id: string;
  name: string;
  amount: number;
  isIncluded: boolean;
}

export interface MasterFareInput {
  serviceType: ServiceType;
  categoryId: string;
  variantId?: string;
  routeId?: string;
  airportLocationId?: string;
  cityZoneLocationId?: string;
  packageId?: string;
  
  // Distances and Durations
  actualDistanceKm: number;
  durationHours?: number;
  numberOfDays?: number;
  numberOfNights?: number;
  
  // Constraints & Preferences
  fuelTypePreference?: FuelType;
  pickupDateTime?: string;
  
  // Manual Override Inputs (from Admin)
  isManualOverride?: boolean;
  manualOverrideFare?: number;
  overrideReason?: string;
  overrideByUserId?: string;
}

export interface MasterFareResult {
  serviceType: ServiceType;
  categoryId: string;
  variantId?: string;
  routeId?: string;
  
  // Distance/Time
  actualKm: number;
  guaranteedMinKm: number;
  billableKm: number;
  includedKm: number;
  extraKm: number;
  
  numberOfDays: number;
  numberOfNights: number;
  
  // Rates
  baseFare: number;
  extraKmRate: number;
  
  // Charges
  distanceCharge: number;
  driverAllowance: number;
  nightCharge: number;
  
  // Configured Charges
  charges: ChargeItem[];
  
  // Dynamic Pricing
  dynamicSurgeAmount: number;
  discount: number;
  
  // Aggregated Totals
  subtotal: number;
  automaticFare: number;
  
  // 4B-9: Manual Override
  pricingMode: PricingMode;
  manualOverrideFare?: number;
  overrideReason?: string;
  overriddenByUserId?: string;
  
  // 4B-10: Final Payable & Token
  customerPayable: number;
  tokenAmount: number;
  balanceAmount: number;
  
  // Inclusions for Display
  includedCharges: string[];
  excludedCharges: string[];
  
  calculationTimestamp: string;
  pricingRuleId?: string;
}

// ----------------------------------------------------------------------
// PHASE 4B-2: EXISTING PRICING COMPATIBILITY (NORMALIZATION)
// ----------------------------------------------------------------------
function normalizeCharges(included: string[], excluded: string[]): ChargeItem[] {
  const charges: ChargeItem[] = [];
  
  // Normalizes existing DB JSONB string arrays into structured ChargeItems.
  // Since DB currently doesn't store exact amounts for these, amounts default to 0.
  included.forEach(name => {
    charges.push({ id: name.toLowerCase().replace(/\s+/g, '_'), name, amount: 0, isIncluded: true });
  });
  
  excluded.forEach(name => {
    charges.push({ id: name.toLowerCase().replace(/\s+/g, '_'), name, amount: 0, isIncluded: false });
  });
  
  return charges;
}

// ----------------------------------------------------------------------
// PHASE 4B-3: VEHICLE AND FUEL CONSTRAINTS
// ----------------------------------------------------------------------
export function validateVehicleConstraints(
  categoryId: string,
  fuelTypePreference?: FuelType,
  variants?: VehicleVariant[] // Pass in all variants for this category if available
): { isValid: boolean; error?: string } {
  if (!fuelTypePreference) return { isValid: true };
  
  if (variants && variants.length > 0) {
    const supportsFuel = variants.some(v => v.fuel_type === fuelTypePreference && v.is_active);
    if (!supportsFuel) {
      return { 
        isValid: false, 
        error: `The selected vehicle category does not support ${fuelTypePreference} fuel type.` 
      };
    }
  }
  
  return { isValid: true };
}

// ----------------------------------------------------------------------
// PHASE 4B-10: 25% TOKEN CALCULATION
// ----------------------------------------------------------------------
function calculatePayableAndToken(automaticFare: number, manualOverrideFare?: number): {
  customerPayable: number;
  tokenAmount: number;
  balanceAmount: number;
} {
  const customerPayable = manualOverrideFare !== undefined ? manualOverrideFare : automaticFare;
  // Token = 25% of payable, rounded to nearest whole number
  const tokenAmount = Math.round(customerPayable * 0.25);
  const balanceAmount = customerPayable - tokenAmount;
  
  return { customerPayable, tokenAmount, balanceAmount };
}

// ----------------------------------------------------------------------
// PHASE 4B-5: ONE-WAY CALCULATION
// ----------------------------------------------------------------------
export function calculateMasterOneWayFare(
  input: MasterFareInput,
  rule: PricingOneWay,
  dynamicRules: DynamicPricingRule[] = []
): MasterFareResult {
  const baseFare = Number(rule.base_fare) || 0;
  const includedKm = Number(rule.included_km) || 0;
  const extraKmRate = Number(rule.extra_km_rate) || 0;
  const driverAllowance = Number(rule.driver_allowance) || 0;

  const actualKm = input.actualDistanceKm;
  const extraKm = Math.max(0, actualKm - includedKm);
  const distanceCharge = extraKm * extraKmRate;
  
  const subtotal = baseFare + distanceCharge + driverAllowance;
  
  // TODO: Implement Dynamic Surge properly (Placeholder for now)
  const dynamicSurgeAmount = 0; 
  
  const automaticFare = subtotal + dynamicSurgeAmount;
  
  const pricingMode: PricingMode = input.isManualOverride && input.manualOverrideFare !== undefined ? 'MANUAL' : 'AUTOMATIC';
  
  const { customerPayable, tokenAmount, balanceAmount } = calculatePayableAndToken(automaticFare, input.isManualOverride ? input.manualOverrideFare : undefined);
  
  return {
    serviceType: 'one_way',
    categoryId: input.categoryId,
    variantId: input.variantId,
    routeId: rule.route_id,
    actualKm,
    guaranteedMinKm: includedKm,
    billableKm: Math.max(actualKm, includedKm),
    includedKm,
    extraKm,
    numberOfDays: 1,
    numberOfNights: 0,
    baseFare,
    extraKmRate,
    distanceCharge,
    driverAllowance,
    nightCharge: 0,
    charges: normalizeCharges(rule.default_included_charges, rule.default_excluded_charges),
    dynamicSurgeAmount,
    discount: 0,
    subtotal,
    automaticFare,
    pricingMode,
    manualOverrideFare: input.isManualOverride ? input.manualOverrideFare : undefined,
    overrideReason: input.overrideReason,
    overriddenByUserId: input.overrideByUserId,
    customerPayable,
    tokenAmount,
    balanceAmount,
    includedCharges: rule.default_included_charges || [],
    excludedCharges: rule.default_excluded_charges || [],
    calculationTimestamp: new Date().toISOString(),
    pricingRuleId: rule.id,
  };
}

// ----------------------------------------------------------------------
// PHASE 4B-6: ROUND TRIP CALCULATION
// ----------------------------------------------------------------------
export function calculateMasterRoundTripFare(
  input: MasterFareInput,
  rule: PricingRoundTrip,
  dynamicRules: DynamicPricingRule[] = []
): MasterFareResult {
  const days = input.numberOfDays || 1;
  const nights = input.numberOfNights ?? (days > 1 ? days - 1 : 0);

  const minKmPerDay = Number(rule.min_km_per_day) || 250;
  const perKmRate = Number(rule.per_km_rate) || 0;
  const driverAllowancePerDay = Number(rule.driver_allowance_per_day) || 0;
  const nightHaltCharge = Number(rule.night_halt_charge) || 0;

  const guaranteedMinKm = minKmPerDay * days;
  const actualKm = input.actualDistanceKm;
  const billableKm = Math.max(actualKm, guaranteedMinKm);

  const distanceCharge = billableKm * perKmRate;
  const totalDriverAllowance = driverAllowancePerDay * days;
  const totalNightHalt = nightHaltCharge * nights;

  const subtotal = distanceCharge + totalDriverAllowance + totalNightHalt;
  const dynamicSurgeAmount = 0;
  const automaticFare = subtotal + dynamicSurgeAmount;
  
  const pricingMode: PricingMode = input.isManualOverride && input.manualOverrideFare !== undefined ? 'MANUAL' : 'AUTOMATIC';
  const { customerPayable, tokenAmount, balanceAmount } = calculatePayableAndToken(automaticFare, input.isManualOverride ? input.manualOverrideFare : undefined);

  return {
    serviceType: 'round_trip',
    categoryId: input.categoryId,
    variantId: input.variantId,
    actualKm,
    guaranteedMinKm,
    billableKm,
    includedKm: guaranteedMinKm,
    extraKm: Math.max(0, actualKm - guaranteedMinKm),
    numberOfDays: days,
    numberOfNights: nights,
    baseFare: 0,
    extraKmRate: perKmRate, // In round trip, all KM is billed at per_km_rate or bounded by minimum
    distanceCharge,
    driverAllowance: totalDriverAllowance,
    nightCharge: totalNightHalt,
    charges: normalizeCharges(rule.default_included_charges, rule.default_excluded_charges),
    dynamicSurgeAmount,
    discount: 0,
    subtotal,
    automaticFare,
    pricingMode,
    manualOverrideFare: input.isManualOverride ? input.manualOverrideFare : undefined,
    overrideReason: input.overrideReason,
    overriddenByUserId: input.overrideByUserId,
    customerPayable,
    tokenAmount,
    balanceAmount,
    includedCharges: rule.default_included_charges || [],
    excludedCharges: rule.default_excluded_charges || [],
    calculationTimestamp: new Date().toISOString(),
    pricingRuleId: rule.id,
  };
}

// ----------------------------------------------------------------------
// PHASE 4B-7: LOCAL RENTAL CALCULATION
// ----------------------------------------------------------------------
export function calculateMasterLocalRentalFare(
  input: MasterFareInput,
  pkg: PricingLocalPackage,
  dynamicRules: DynamicPricingRule[] = []
): MasterFareResult {
  const packagePrice = Number(pkg.package_price) || 0;
  const includedHours = Number(pkg.included_hours) || 0;
  const includedKm = Number(pkg.included_km) || 0;
  const extraHourRate = Number(pkg.extra_hour_rate) || 0;
  const extraKmRate = Number(pkg.extra_km_rate) || 0;

  const actualHours = input.durationHours || includedHours;
  const extraHours = Math.max(0, actualHours - includedHours);
  const extraHourCharge = extraHours * extraHourRate;

  const actualKm = input.actualDistanceKm;
  const extraKm = Math.max(0, actualKm - includedKm);
  const extraKmCharge = extraKm * extraKmRate;

  const subtotal = packagePrice + extraHourCharge + extraKmCharge;
  const dynamicSurgeAmount = 0;
  const automaticFare = subtotal + dynamicSurgeAmount;

  const pricingMode: PricingMode = input.isManualOverride && input.manualOverrideFare !== undefined ? 'MANUAL' : 'AUTOMATIC';
  const { customerPayable, tokenAmount, balanceAmount } = calculatePayableAndToken(automaticFare, input.isManualOverride ? input.manualOverrideFare : undefined);

  return {
    serviceType: 'local_rental',
    categoryId: input.categoryId,
    variantId: input.variantId,
    actualKm,
    guaranteedMinKm: includedKm,
    billableKm: Math.max(actualKm, includedKm),
    includedKm,
    extraKm,
    numberOfDays: 1,
    numberOfNights: 0,
    baseFare: packagePrice,
    extraKmRate,
    distanceCharge: extraKmCharge, // Treat extra km charge as distance charge here
    driverAllowance: 0,
    nightCharge: 0,
    charges: normalizeCharges(pkg.default_included_charges, pkg.default_excluded_charges),
    dynamicSurgeAmount,
    discount: 0,
    subtotal,
    automaticFare,
    pricingMode,
    manualOverrideFare: input.isManualOverride ? input.manualOverrideFare : undefined,
    overrideReason: input.overrideReason,
    overriddenByUserId: input.overrideByUserId,
    customerPayable,
    tokenAmount,
    balanceAmount,
    includedCharges: pkg.default_included_charges || [],
    excludedCharges: pkg.default_excluded_charges || [],
    calculationTimestamp: new Date().toISOString(),
    pricingRuleId: pkg.id,
  };
}

// ----------------------------------------------------------------------
// PHASE 4B-8: AIRPORT TRANSFER CALCULATION
// ----------------------------------------------------------------------
export function calculateMasterAirportTransferFare(
  input: MasterFareInput,
  rule: PricingAirportTransfer,
  dynamicRules: DynamicPricingRule[] = []
): MasterFareResult {
  const baseFare = Number(rule.base_fare) || 0;
  const includedKm = Number(rule.included_km) || 0;
  const extraKmRate = Number(rule.extra_km_rate) || 0;

  const actualKm = input.actualDistanceKm;
  const extraKm = Math.max(0, actualKm - includedKm);
  const distanceCharge = extraKm * extraKmRate;

  const subtotal = baseFare + distanceCharge;
  const dynamicSurgeAmount = 0;
  const automaticFare = subtotal + dynamicSurgeAmount;

  const pricingMode: PricingMode = input.isManualOverride && input.manualOverrideFare !== undefined ? 'MANUAL' : 'AUTOMATIC';
  const { customerPayable, tokenAmount, balanceAmount } = calculatePayableAndToken(automaticFare, input.isManualOverride ? input.manualOverrideFare : undefined);

  return {
    serviceType: 'airport_transfer',
    categoryId: input.categoryId,
    variantId: input.variantId,
    routeId: undefined,
    actualKm,
    guaranteedMinKm: includedKm,
    billableKm: Math.max(actualKm, includedKm),
    includedKm,
    extraKm,
    numberOfDays: 1,
    numberOfNights: 0,
    baseFare,
    extraKmRate,
    distanceCharge,
    driverAllowance: 0,
    nightCharge: 0,
    charges: normalizeCharges(rule.default_included_charges, rule.default_excluded_charges),
    dynamicSurgeAmount,
    discount: 0,
    subtotal,
    automaticFare,
    pricingMode,
    manualOverrideFare: input.isManualOverride ? input.manualOverrideFare : undefined,
    overrideReason: input.overrideReason,
    overriddenByUserId: input.overrideByUserId,
    customerPayable,
    tokenAmount,
    balanceAmount,
    includedCharges: rule.default_included_charges || [],
    excludedCharges: rule.default_excluded_charges || [],
    calculationTimestamp: new Date().toISOString(),
    pricingRuleId: rule.id,
  };
}
