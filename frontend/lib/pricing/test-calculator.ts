/**
 * Verification Test Script for Pricing Calculation Engine
 */

import {
  CalculateFareInput,
  calculateOneWayFare,
  calculateRoundTripFare,
  calculateLocalRentalFare,
  calculateAirportTransferFare,
  resolveDynamicPricingRule,
} from './calculator';
import {
  PricingOneWay,
  PricingRoundTrip,
  PricingLocalPackage,
  PricingAirportTransfer,
  DynamicPricingRule,
} from '@/types/database';

export function runPricingTests() {
  console.log('====================================================');
  console.log('RUNNING PRICING ENGINE VERIFICATION TESTS');
  console.log('====================================================\n');

  // Test Case 1: One-Way Outstation (Delhi to Agra - 210 KM)
  const oneWayInput: CalculateFareInput = {
    serviceType: 'one_way',
    categoryId: 'cat-sedan-id',
    actualDistanceKm: 210,
    pickupDateTime: '2026-08-01T09:00:00Z',
  };

  const oneWayRule: PricingOneWay = {
    id: 'ow-rule-delhi-agra',
    route_id: 'route-delhi-agra-id',
    category_id: 'cat-sedan-id',
    base_fare: 2500,
    included_km: 100,
    extra_km_rate: 14,
    driver_allowance: 300,
    default_included_charges: ['Fuel', 'Driver Allowance'],
    default_excluded_charges: ['Toll Tax', 'State Border Tax', 'Parking'],
    is_active: true,
    created_at: new Date().toISOString(),
  };

  // 110 Extra KM @ ₹14 = ₹1540 + Base ₹2500 + DA ₹300 = ₹4340
  const oneWayResult = calculateOneWayFare(oneWayInput, oneWayRule);
  console.log('✓ TEST 1: One-Way Outstation (Delhi -> Agra, 210 KM)');
  console.log(`  Actual KM: ${oneWayResult.actualKm} | Extra KM: ${oneWayResult.extraKm}`);
  console.log(`  Base Fare: ₹${oneWayResult.baseFare} | Extra KM Charge: ₹${oneWayResult.extraKmCharge} | Driver Allowance: ₹${oneWayResult.driverAllowance}`);
  console.log(`  Automatic Fare: ₹${oneWayResult.automaticFare} (Expected: ₹4340)\n`);

  // Test Case 2: Round-Trip Outstation (3 Days, 600 KM actual)
  // Daily Min: 250 KM/day * 3 days = 750 KM guarantee.
  // 750 KM * ₹12/KM = ₹9000 + Driver Allowance ₹400/day * 3 = ₹1200 + Night Halt ₹250 * 2 = ₹500. Total = ₹10700
  const roundTripInput: CalculateFareInput = {
    serviceType: 'round_trip',
    categoryId: 'cat-suv-id',
    actualDistanceKm: 600,
    numberOfDays: 3,
    numberOfNights: 2,
  };

  const roundTripRule: PricingRoundTrip = {
    id: 'rt-rule-suv',
    category_id: 'cat-suv-id',
    min_km_per_day: 250,
    per_km_rate: 12,
    driver_allowance_per_day: 400,
    night_halt_charge: 250,
    default_included_charges: ['Fuel', 'Driver Allowance'],
    default_excluded_charges: ['Toll Tax', 'State Tax', 'Parking'],
    is_active: true,
    created_at: new Date().toISOString(),
  };

  const roundTripResult = calculateRoundTripFare(roundTripInput, roundTripRule);
  console.log('✓ TEST 2: Round-Trip Outstation (3 Days, 600 KM Actual vs 750 KM Min Guarantee)');
  console.log(`  Actual KM: ${roundTripResult.actualKm} | Billable Guaranteed KM: ${roundTripResult.billableKm}`);
  console.log(`  Base Fare: ₹${roundTripResult.baseFare} (Not in schema) | Distance Charge: ₹${roundTripResult.distanceCharge} | Total Driver Allowance: ₹${roundTripResult.driverAllowance} | Night Halt: ₹${roundTripResult.nightHaltCharge}`);
  console.log(`  Automatic Fare: ₹${roundTripResult.automaticFare} (Expected: ₹10700)\n`);

  // Test Case 3: Local Hourly Rental (8 Hours / 80 KM package, actual 9.5 hours, 95 KM)
  // Package: ₹2000. Extra 1.5 Hours @ ₹150/hr = ₹225. Extra 15 KM @ ₹15/km = ₹225. Total = ₹2450
  const localInput: CalculateFareInput = {
    serviceType: 'local_rental',
    categoryId: 'cat-sedan-id',
    actualDistanceKm: 95,
    durationHours: 9.5,
  };

  const localPackage: PricingLocalPackage = {
    id: 'local-pkg-8h80k',
    category_id: 'cat-sedan-id',
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
  };

  const localResult = calculateLocalRentalFare(localInput, localPackage);
  console.log('✓ TEST 3: Local Rental (8H/80KM Package, 9.5 Hrs & 95 KM Actual)');
  console.log(`  Package Price: ₹${localResult.baseFare}`);
  console.log(`  Extra Hours: ${localResult.extraHours} Hrs (Charge: ₹${localResult.extraHourCharge})`);
  console.log(`  Extra Distance: ${localResult.extraKm} KM (Charge: ₹${localResult.extraKmCharge})`);
  console.log(`  Automatic Fare: ₹${localResult.automaticFare} (Expected: ₹2450)\n`);

  // Test Case 4: Airport Transfer (IGI Airport to Noida Zone, 45 KM)
  // Base: ₹1200 for 30 KM. Extra 15 KM @ ₹16/km = ₹240. Subtotal = ₹1440.
  // Dynamic Peak Hour Surge (+10% Priority 20) -> ₹144. Total = ₹1584
  const airportInput: CalculateFareInput = {
    serviceType: 'airport_transfer',
    categoryId: 'cat-sedan-id',
    actualDistanceKm: 45,
    pickupDateTime: '2026-08-01T18:30:00Z', // Peak evening time
  };

  const airportRule: PricingAirportTransfer = {
    id: 'airport-transfer-noida',
    airport_location_id: 'loc-igi-airport-id',
    city_zone_location_id: 'loc-noida-zone-id',
    category_id: 'cat-sedan-id',
    base_fare: 1200,
    included_km: 30,
    extra_km_rate: 16,
    default_included_charges: ['Fuel', 'Driver Allowance', 'Airport Entry Fee'],
    default_excluded_charges: ['Parking Fee'],
    is_active: true,
    created_at: new Date().toISOString(),
  };

  const dynamicRules: DynamicPricingRule[] = [
    {
      id: 'rule-low-priority',
      rule_name: 'Standard Off-Peak Discount',
      trip_type: 'airport_transfer',
      category_id: null,
      start_date: null,
      end_date: null,
      start_time: null,
      end_time: null,
      adjustment_type: 'percentage',
      adjustment_value: 5,
      priority: 5,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'rule-evening-peak',
      rule_name: 'Evening Airport Rush Surge',
      trip_type: 'airport_transfer',
      category_id: null,
      start_date: '2026-08-01',
      end_date: '2026-08-01',
      start_time: '17:00:00',
      end_time: '21:00:00',
      adjustment_type: 'percentage',
      adjustment_value: 10,
      priority: 20,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ];

  const matchedDynamicRule = resolveDynamicPricingRule(dynamicRules, 'airport_transfer', 'cat-sedan-id', airportInput.pickupDateTime);
  console.log(`  Dynamic Pricing Priority Test: Resolved Rule "${matchedDynamicRule?.rule_name}" (Priority: ${matchedDynamicRule?.priority})`);

  const airportResult = calculateAirportTransferFare(airportInput, airportRule, dynamicRules);
  console.log('✓ TEST 4: Airport Transfer (IGI -> Noida Zone 45 KM + 10% Peak Surge)');
  console.log(`  Base Transfer Fare: ₹${airportResult.baseFare} | Extra KM Charge: ₹${airportResult.extraKmCharge}`);
  console.log(`  Subtotal: ₹${airportResult.subtotalFare} | Surge (+10%): ₹${airportResult.dynamicSurgeAmount}`);
  console.log(`  Automatic Fare: ₹${airportResult.automaticFare} (Expected: ₹1584)\n`);

  console.log('====================================================');
  console.log('ALL PRICING ENGINE VERIFICATION TESTS COMPLETED');
  console.log('====================================================');
}
