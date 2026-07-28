/**
 * Pure Server-Side Pricing Calculation Engine for Urgent Taxis Platform.
 * Single Source of Truth for all trip fare calculations.
 * 
 * Supported Service Types:
 * 1. one_way: Point-to-Point Outstation trip per route & category.
 * 2. round_trip: Outstation return trip with daily minimum guaranteed distance & driver allowance.
 * 3. local_rental: Package-based hourly local rental (4h/40km, 8h/80km, 12h/120km) with extra rates.
 * 4. airport_transfer: Airport / Railway station transfer rates per city zone.
 */

import {
  PricingOneWay,
  PricingRoundTrip,
  PricingLocalPackage,
  PricingAirportTransfer,
  DynamicPricingRule,
} from '@/types/database';

export type ServiceType = 'one_way' | 'round_trip' | 'local_rental' | 'airport_transfer';

export interface CalculateFareInput {
  serviceType: ServiceType;
  categoryId: string;
  variantId?: string;
  routeId?: string;
  airportLocationId?: string;
  cityZoneLocationId?: string;
  packageId?: string;
  actualDistanceKm: number;
  durationHours?: number;
  numberOfDays?: number;
  numberOfNights?: number;
  pickupDateTime?: string; // ISO String format e.g. "2026-07-30T10:00:00Z"
}

export interface CalculationTraceLog {
  step: string;
  description: string;
  amount?: number;
  ruleId?: string;
  ruleName?: string;
}

export interface CalculateFareResult {
  serviceType: ServiceType;
  categoryId: string;
  variantId?: string;
  routeId?: string;
  airportLocationId?: string;
  cityZoneLocationId?: string;
  
  // Distance Math
  actualKm: number;
  guaranteedMinKm: number;
  billableKm: number;
  includedKm: number;
  extraKm: number;
  
  // Hours & Days Math
  includedHours: number;
  actualHours: number;
  extraHours: number;
  numberOfDays: number;
  numberOfNights: number;

  // Breakdown Amounts
  baseFare: number; // Base fare threshold (0 for Round-Trip as pricing_round_trip uses per_km_rate)
  distanceCharge: number; // Total distance charge (billableKm * per_km_rate or extraKm * extra_km_rate)
  extraKmCharge: number;
  extraHourCharge: number;
  driverAllowance: number;
  nightHaltCharge: number;
  
  // Dynamic Pricing
  appliedDynamicRuleId?: string;
  appliedDynamicRuleName?: string;
  dynamicAdjustmentType?: 'percentage' | 'flat';
  dynamicAdjustmentValue?: number;
  dynamicSurgeAmount: number;

  // Totals
  subtotalFare: number;
  automaticFare: number; // Final automatically calculated fare

  // Items included/excluded as per database configuration
  includedCharges: string[];
  excludedCharges: string[];

  // Calculation Audit Trace Log
  traceLogs: CalculationTraceLog[];
  appliedRuleId: string;
  calculatedAt: string;
}

/**
 * Validates input parameters for pricing calculations.
 */
function validateInput(input: CalculateFareInput): void {
  if (!input.serviceType || !['one_way', 'round_trip', 'local_rental', 'airport_transfer'].includes(input.serviceType)) {
    throw new Error(`Invalid service type provided: "${input.serviceType}". Must be one of: one_way, round_trip, local_rental, airport_transfer.`);
  }

  if (!input.categoryId || input.categoryId.trim() === '') {
    throw new Error('Category ID is required for fare calculation.');
  }

  if (typeof input.actualDistanceKm !== 'number' || isNaN(input.actualDistanceKm) || input.actualDistanceKm < 0) {
    throw new Error(`Invalid distance value: ${input.actualDistanceKm}. Distance cannot be negative or NaN.`);
  }

  if (input.numberOfDays !== undefined && (typeof input.numberOfDays !== 'number' || input.numberOfDays <= 0)) {
    throw new Error(`Invalid number of days: ${input.numberOfDays}. Days must be greater than 0.`);
  }

  if (input.numberOfNights !== undefined && (typeof input.numberOfNights !== 'number' || input.numberOfNights < 0)) {
    throw new Error(`Invalid number of nights: ${input.numberOfNights}. Nights cannot be negative.`);
  }

  if (input.durationHours !== undefined && (typeof input.durationHours !== 'number' || input.durationHours < 0)) {
    throw new Error(`Invalid duration hours: ${input.durationHours}. Hours cannot be negative.`);
  }
}

/**
 * Resolves active dynamic surge rules deterministically.
 * Rule Resolution Order:
 * 1. Filter active rules where is_active is true.
 * 2. Filter rules matching trip_type (or NULL for all trip types) AND category_id (or NULL for all categories).
 * 3. Filter rules matching date range (start_date <= targetDate <= end_date).
 * 4. Filter rules matching time window (start_time <= targetTime <= end_time).
 * 5. Sort by priority DESC (higher integer = higher priority).
 * 6. Tie-breaker: most recent created_at timestamp.
 */
export function resolveDynamicPricingRule(
  rules: DynamicPricingRule[],
  tripType: ServiceType,
  categoryId: string,
  pickupDateTimeIso?: string
): DynamicPricingRule | null {
  if (!rules || rules.length === 0) return null;

  const targetDateObj = pickupDateTimeIso ? new Date(pickupDateTimeIso) : new Date();
  const targetDateStr = targetDateObj.toISOString().split('T')[0]; // YYYY-MM-DD
  const targetTimeStr = targetDateObj.toTimeString().split(' ')[0]; // HH:MM:SS

  const matchingRules = rules.filter((rule) => {
    if (!rule.is_active) return false;

    // Trip type check
    if (rule.trip_type && rule.trip_type !== tripType) return false;

    // Category check
    if (rule.category_id && rule.category_id !== categoryId) return false;

    // Date range check
    if (rule.start_date && targetDateStr < rule.start_date) return false;
    if (rule.end_date && targetDateStr > rule.end_date) return false;

    // Time window check
    if (rule.start_time && targetTimeStr < rule.start_time) return false;
    if (rule.end_time && targetTimeStr > rule.end_time) return false;

    return true;
  });

  if (matchingRules.length === 0) return null;

  // Sort by priority DESC, then by created_at DESC
  matchingRules.sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return matchingRules[0];
}

/**
 * 1. Calculate One-Way Outstation Fare
 * Formula:
 * Extra KM = max(0, actualDistanceKm - included_km)
 * Extra KM Charge = Extra KM * extra_km_rate
 * Base Subtotal = base_fare + Extra KM Charge + driver_allowance
 */
export function calculateOneWayFare(
  input: CalculateFareInput,
  rule: PricingOneWay,
  dynamicRules: DynamicPricingRule[] = []
): CalculateFareResult {
  validateInput(input);
  const traceLogs: CalculationTraceLog[] = [];

  const baseFare = Number(rule.base_fare) || 0;
  const includedKm = Number(rule.included_km) || 0;
  const extraKmRate = Number(rule.extra_km_rate) || 0;
  const driverAllowance = Number(rule.driver_allowance) || 0;

  traceLogs.push({
    step: 'ONE_WAY_BASE',
    description: `Matched route rule (Rule ID: ${rule.id}). Base fare ₹${baseFare} for ${includedKm} KM.`,
    amount: baseFare,
    ruleId: rule.id,
  });

  const actualKm = input.actualDistanceKm;
  const extraKm = Math.max(0, actualKm - includedKm);
  const extraKmCharge = extraKm * extraKmRate;

  if (extraKm > 0) {
    traceLogs.push({
      step: 'EXTRA_KM_CHARGE',
      description: `Distance (${actualKm} KM) exceeds included distance (${includedKm} KM) by ${extraKm} KM @ ₹${extraKmRate}/KM.`,
      amount: extraKmCharge,
    });
  }

  if (driverAllowance > 0) {
    traceLogs.push({
      step: 'DRIVER_ALLOWANCE',
      description: `Driver allowance included: ₹${driverAllowance}.`,
      amount: driverAllowance,
    });
  }

  const subtotalFare = baseFare + extraKmCharge + driverAllowance;

  // Dynamic Pricing Surge Resolution
  let dynamicSurgeAmount = 0;
  const matchedSurgeRule = resolveDynamicPricingRule(dynamicRules, 'one_way', input.categoryId, input.pickupDateTime);

  if (matchedSurgeRule) {
    const adjValue = Number(matchedSurgeRule.adjustment_value) || 0;
    if (matchedSurgeRule.adjustment_type === 'percentage') {
      dynamicSurgeAmount = (subtotalFare * adjValue) / 100;
      traceLogs.push({
        step: 'DYNAMIC_SURGE',
        description: `Applied Dynamic Rule "${matchedSurgeRule.rule_name}" (+${adjValue}% Priority: ${matchedSurgeRule.priority}).`,
        amount: dynamicSurgeAmount,
        ruleId: matchedSurgeRule.id,
        ruleName: matchedSurgeRule.rule_name,
      });
    } else {
      dynamicSurgeAmount = adjValue;
      traceLogs.push({
        step: 'DYNAMIC_SURGE',
        description: `Applied Dynamic Rule "${matchedSurgeRule.rule_name}" (+₹${adjValue} Flat, Priority: ${matchedSurgeRule.priority}).`,
        amount: dynamicSurgeAmount,
        ruleId: matchedSurgeRule.id,
        ruleName: matchedSurgeRule.rule_name,
      });
    }
  }

  const automaticFare = Math.round((subtotalFare + dynamicSurgeAmount) * 100) / 100;

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
    includedHours: 0,
    actualHours: 0,
    extraHours: 0,
    numberOfDays: 1,
    numberOfNights: 0,
    baseFare,
    distanceCharge: extraKmCharge,
    extraKmCharge,
    extraHourCharge: 0,
    driverAllowance,
    nightHaltCharge: 0,
    appliedDynamicRuleId: matchedSurgeRule?.id,
    appliedDynamicRuleName: matchedSurgeRule?.rule_name,
    dynamicAdjustmentType: matchedSurgeRule?.adjustment_type,
    dynamicAdjustmentValue: matchedSurgeRule ? Number(matchedSurgeRule.adjustment_value) : undefined,
    dynamicSurgeAmount,
    subtotalFare,
    automaticFare,
    includedCharges: rule.default_included_charges || [],
    excludedCharges: rule.default_excluded_charges || [],
    traceLogs,
    appliedRuleId: rule.id,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * 2. Calculate Round-Trip Outstation Fare
 * Note: pricing_round_trip schema does NOT contain a base_fare column.
 * Exact Deployed Formula:
 * Guaranteed Daily Min KM = min_km_per_day * numberOfDays (Default: 250 KM/day)
 * Billable Distance = max(actualDistanceKm, Guaranteed Daily Min KM)
 * Distance Charge = Billable Distance * per_km_rate
 * Total Driver Allowance = driver_allowance_per_day * numberOfDays
 * Total Night Halt = night_halt_charge * numberOfNights
 * Automatic Subtotal = Distance Charge + Total Driver Allowance + Total Night Halt
 */
export function calculateRoundTripFare(
  input: CalculateFareInput,
  rule: PricingRoundTrip,
  dynamicRules: DynamicPricingRule[] = []
): CalculateFareResult {
  validateInput(input);
  const traceLogs: CalculationTraceLog[] = [];

  const days = input.numberOfDays || 1;
  const nights = input.numberOfNights ?? (days > 1 ? days - 1 : 0);

  const minKmPerDay = Number(rule.min_km_per_day) || 250;
  const perKmRate = Number(rule.per_km_rate) || 0;
  const driverAllowancePerDay = Number(rule.driver_allowance_per_day) || 0;
  const nightHaltCharge = Number(rule.night_halt_charge) || 0;

  const guaranteedMinKm = minKmPerDay * days;
  const actualKm = input.actualDistanceKm;
  const billableKm = Math.max(actualKm, guaranteedMinKm);

  traceLogs.push({
    step: 'ROUND_TRIP_MIN_KM',
    description: `Guaranteed minimum distance: ${minKmPerDay} KM/day × ${days} days = ${guaranteedMinKm} KM guarantee.`,
    ruleId: rule.id,
  });

  const distanceCharge = billableKm * perKmRate;
  traceLogs.push({
    step: 'DISTANCE_CHARGE',
    description: `Billable distance: ${billableKm} KM (Actual: ${actualKm} KM) @ ₹${perKmRate}/KM = ₹${distanceCharge}.`,
    amount: distanceCharge,
  });

  const totalDriverAllowance = driverAllowancePerDay * days;
  if (totalDriverAllowance > 0) {
    traceLogs.push({
      step: 'DRIVER_ALLOWANCE',
      description: `Driver allowance: ₹${driverAllowancePerDay}/day × ${days} days = ₹${totalDriverAllowance}.`,
      amount: totalDriverAllowance,
    });
  }

  const totalNightHalt = nightHaltCharge * nights;
  if (totalNightHalt > 0) {
    traceLogs.push({
      step: 'NIGHT_HALT_CHARGE',
      description: `Night halt charge: ₹${nightHaltCharge}/night × ${nights} nights = ₹${totalNightHalt}.`,
      amount: totalNightHalt,
    });
  }

  const subtotalFare = distanceCharge + totalDriverAllowance + totalNightHalt;

  // Dynamic Pricing Surge Resolution
  let dynamicSurgeAmount = 0;
  const matchedSurgeRule = resolveDynamicPricingRule(dynamicRules, 'round_trip', input.categoryId, input.pickupDateTime);

  if (matchedSurgeRule) {
    const adjValue = Number(matchedSurgeRule.adjustment_value) || 0;
    if (matchedSurgeRule.adjustment_type === 'percentage') {
      dynamicSurgeAmount = (subtotalFare * adjValue) / 100;
      traceLogs.push({
        step: 'DYNAMIC_SURGE',
        description: `Applied Dynamic Rule "${matchedSurgeRule.rule_name}" (+${adjValue}% Priority: ${matchedSurgeRule.priority}).`,
        amount: dynamicSurgeAmount,
        ruleId: matchedSurgeRule.id,
        ruleName: matchedSurgeRule.rule_name,
      });
    } else {
      dynamicSurgeAmount = adjValue;
      traceLogs.push({
        step: 'DYNAMIC_SURGE',
        description: `Applied Dynamic Rule "${matchedSurgeRule.rule_name}" (+₹${adjValue} Flat, Priority: ${matchedSurgeRule.priority}).`,
        amount: dynamicSurgeAmount,
        ruleId: matchedSurgeRule.id,
        ruleName: matchedSurgeRule.rule_name,
      });
    }
  }

  const automaticFare = Math.round((subtotalFare + dynamicSurgeAmount) * 100) / 100;

  return {
    serviceType: 'round_trip',
    categoryId: input.categoryId,
    variantId: input.variantId,
    actualKm,
    guaranteedMinKm,
    billableKm,
    includedKm: guaranteedMinKm,
    extraKm: Math.max(0, actualKm - guaranteedMinKm),
    includedHours: days * 24,
    actualHours: days * 24,
    extraHours: 0,
    numberOfDays: days,
    numberOfNights: nights,
    baseFare: 0, // pricing_round_trip schema does not have a base_fare column
    distanceCharge,
    extraKmCharge: 0,
    extraHourCharge: 0,
    driverAllowance: totalDriverAllowance,
    nightHaltCharge: totalNightHalt,
    appliedDynamicRuleId: matchedSurgeRule?.id,
    appliedDynamicRuleName: matchedSurgeRule?.rule_name,
    dynamicAdjustmentType: matchedSurgeRule?.adjustment_type,
    dynamicAdjustmentValue: matchedSurgeRule ? Number(matchedSurgeRule.adjustment_value) : undefined,
    dynamicSurgeAmount,
    subtotalFare,
    automaticFare,
    includedCharges: rule.default_included_charges || [],
    excludedCharges: rule.default_excluded_charges || [],
    traceLogs,
    appliedRuleId: rule.id,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * 3. Calculate Local Hourly Rental Fare
 * Formula:
 * Package Base Price = package_price
 * Extra Hours = max(0, actualHours - included_hours)
 * Extra Hours Charge = Extra Hours * extra_hour_rate
 * Extra KM = max(0, actualDistanceKm - included_km)
 * Extra KM Charge = Extra KM * extra_km_rate
 * Subtotal = package_price + Extra Hours Charge + Extra KM Charge
 */
export function calculateLocalRentalFare(
  input: CalculateFareInput,
  pkg: PricingLocalPackage,
  dynamicRules: DynamicPricingRule[] = []
): CalculateFareResult {
  validateInput(input);
  const traceLogs: CalculationTraceLog[] = [];

  const packagePrice = Number(pkg.package_price) || 0;
  const includedHours = Number(pkg.included_hours) || 0;
  const includedKm = Number(pkg.included_km) || 0;
  const extraHourRate = Number(pkg.extra_hour_rate) || 0;
  const extraKmRate = Number(pkg.extra_km_rate) || 0;

  traceLogs.push({
    step: 'LOCAL_PACKAGE_BASE',
    description: `Matched local package "${pkg.package_name}" (${includedHours} Hrs / ${includedKm} KM). Base price: ₹${packagePrice}.`,
    amount: packagePrice,
    ruleId: pkg.id,
  });

  const actualHours = input.durationHours || includedHours;
  const extraHours = Math.max(0, actualHours - includedHours);
  const extraHourCharge = extraHours * extraHourRate;

  if (extraHours > 0) {
    traceLogs.push({
      step: 'EXTRA_HOURS_CHARGE',
      description: `Duration (${actualHours} Hrs) exceeds package limit (${includedHours} Hrs) by ${extraHours} Hrs @ ₹${extraHourRate}/Hr.`,
      amount: extraHourCharge,
    });
  }

  const actualKm = input.actualDistanceKm;
  const extraKm = Math.max(0, actualKm - includedKm);
  const extraKmCharge = extraKm * extraKmRate;

  if (extraKm > 0) {
    traceLogs.push({
      step: 'EXTRA_KM_CHARGE',
      description: `Distance (${actualKm} KM) exceeds package limit (${includedKm} KM) by ${extraKm} KM @ ₹${extraKmRate}/KM.`,
      amount: extraKmCharge,
    });
  }

  const subtotalFare = packagePrice + extraHourCharge + extraKmCharge;

  // Dynamic Pricing Surge Resolution
  let dynamicSurgeAmount = 0;
  const matchedSurgeRule = resolveDynamicPricingRule(dynamicRules, 'local_rental', input.categoryId, input.pickupDateTime);

  if (matchedSurgeRule) {
    const adjValue = Number(matchedSurgeRule.adjustment_value) || 0;
    if (matchedSurgeRule.adjustment_type === 'percentage') {
      dynamicSurgeAmount = (subtotalFare * adjValue) / 100;
      traceLogs.push({
        step: 'DYNAMIC_SURGE',
        description: `Applied Dynamic Rule "${matchedSurgeRule.rule_name}" (+${adjValue}% Priority: ${matchedSurgeRule.priority}).`,
        amount: dynamicSurgeAmount,
        ruleId: matchedSurgeRule.id,
        ruleName: matchedSurgeRule.rule_name,
      });
    } else {
      dynamicSurgeAmount = adjValue;
      traceLogs.push({
        step: 'DYNAMIC_SURGE',
        description: `Applied Dynamic Rule "${matchedSurgeRule.rule_name}" (+₹${adjValue} Flat, Priority: ${matchedSurgeRule.priority}).`,
        amount: dynamicSurgeAmount,
        ruleId: matchedSurgeRule.id,
        ruleName: matchedSurgeRule.rule_name,
      });
    }
  }

  const automaticFare = Math.round((subtotalFare + dynamicSurgeAmount) * 100) / 100;

  return {
    serviceType: 'local_rental',
    categoryId: input.categoryId,
    variantId: input.variantId,
    actualKm,
    guaranteedMinKm: includedKm,
    billableKm: Math.max(actualKm, includedKm),
    includedKm,
    extraKm,
    includedHours,
    actualHours,
    extraHours,
    numberOfDays: 1,
    numberOfNights: 0,
    baseFare: packagePrice,
    distanceCharge: extraKmCharge,
    extraKmCharge,
    extraHourCharge,
    driverAllowance: 0,
    nightHaltCharge: 0,
    appliedDynamicRuleId: matchedSurgeRule?.id,
    appliedDynamicRuleName: matchedSurgeRule?.rule_name,
    dynamicAdjustmentType: matchedSurgeRule?.adjustment_type,
    dynamicAdjustmentValue: matchedSurgeRule ? Number(matchedSurgeRule.adjustment_value) : undefined,
    dynamicSurgeAmount,
    subtotalFare,
    automaticFare,
    includedCharges: pkg.default_included_charges || [],
    excludedCharges: pkg.default_excluded_charges || [],
    traceLogs,
    appliedRuleId: pkg.id,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * 4. Calculate Airport / Railway Station Transfer Fare
 * Formula:
 * Base Transfer Fare = base_fare for included_km
 * Extra KM = max(0, actualDistanceKm - included_km)
 * Extra KM Charge = Extra KM * extra_km_rate
 * Subtotal = base_fare + Extra KM Charge
 */
export function calculateAirportTransferFare(
  input: CalculateFareInput,
  rule: PricingAirportTransfer,
  dynamicRules: DynamicPricingRule[] = []
): CalculateFareResult {
  validateInput(input);
  const traceLogs: CalculationTraceLog[] = [];

  const baseFare = Number(rule.base_fare) || 0;
  const includedKm = Number(rule.included_km) || 0;
  const extraKmRate = Number(rule.extra_km_rate) || 0;

  traceLogs.push({
    step: 'AIRPORT_TRANSFER_BASE',
    description: `Matched airport transfer rule (Rule ID: ${rule.id}). Base fare ₹${baseFare} for ${includedKm} KM.`,
    amount: baseFare,
    ruleId: rule.id,
  });

  const actualKm = input.actualDistanceKm;
  const extraKm = Math.max(0, actualKm - includedKm);
  const extraKmCharge = extraKm * extraKmRate;

  if (extraKm > 0) {
    traceLogs.push({
      step: 'EXTRA_KM_CHARGE',
      description: `Transfer distance (${actualKm} KM) exceeds included limit (${includedKm} KM) by ${extraKm} KM @ ₹${extraKmRate}/KM.`,
      amount: extraKmCharge,
    });
  }

  const subtotalFare = baseFare + extraKmCharge;

  // Dynamic Pricing Surge Resolution
  let dynamicSurgeAmount = 0;
  const matchedSurgeRule = resolveDynamicPricingRule(dynamicRules, 'airport_transfer', input.categoryId, input.pickupDateTime);

  if (matchedSurgeRule) {
    const adjValue = Number(matchedSurgeRule.adjustment_value) || 0;
    if (matchedSurgeRule.adjustment_type === 'percentage') {
      dynamicSurgeAmount = (subtotalFare * adjValue) / 100;
      traceLogs.push({
        step: 'DYNAMIC_SURGE',
        description: `Applied Dynamic Rule "${matchedSurgeRule.rule_name}" (+${adjValue}% Priority: ${matchedSurgeRule.priority}).`,
        amount: dynamicSurgeAmount,
        ruleId: matchedSurgeRule.id,
        ruleName: matchedSurgeRule.rule_name,
      });
    } else {
      dynamicSurgeAmount = adjValue;
      traceLogs.push({
        step: 'DYNAMIC_SURGE',
        description: `Applied Dynamic Rule "${matchedSurgeRule.rule_name}" (+₹${adjValue} Flat, Priority: ${matchedSurgeRule.priority}).`,
        amount: dynamicSurgeAmount,
        ruleId: matchedSurgeRule.id,
        ruleName: matchedSurgeRule.rule_name,
      });
    }
  }

  const automaticFare = Math.round((subtotalFare + dynamicSurgeAmount) * 100) / 100;

  return {
    serviceType: 'airport_transfer',
    categoryId: input.categoryId,
    variantId: input.variantId,
    airportLocationId: rule.airport_location_id,
    cityZoneLocationId: rule.city_zone_location_id,
    actualKm,
    guaranteedMinKm: includedKm,
    billableKm: Math.max(actualKm, includedKm),
    includedKm,
    extraKm,
    includedHours: 0,
    actualHours: 0,
    extraHours: 0,
    numberOfDays: 1,
    numberOfNights: 0,
    baseFare,
    distanceCharge: extraKmCharge,
    extraKmCharge,
    extraHourCharge: 0,
    driverAllowance: 0,
    nightHaltCharge: 0,
    appliedDynamicRuleId: matchedSurgeRule?.id,
    appliedDynamicRuleName: matchedSurgeRule?.rule_name,
    dynamicAdjustmentType: matchedSurgeRule?.adjustment_type,
    dynamicAdjustmentValue: matchedSurgeRule ? Number(matchedSurgeRule.adjustment_value) : undefined,
    dynamicSurgeAmount,
    subtotalFare,
    automaticFare,
    includedCharges: rule.default_included_charges || [],
    excludedCharges: rule.default_excluded_charges || [],
    traceLogs,
    appliedRuleId: rule.id,
    calculatedAt: new Date().toISOString(),
  };
}
