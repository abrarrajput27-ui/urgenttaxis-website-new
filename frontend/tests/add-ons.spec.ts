import { test, expect } from '@playwright/test';
import {
  BOOKING_ADDONS,
  ADDON_PRICE_PER_ITEM,
  isAddOnSupported,
  validateAndComputeAddOns,
} from '../lib/pricing/add-ons';
import { calculateAdvanceToken } from '../lib/pricing';

test.describe('Phase 3 & MMT Parity: Chargeable Vehicle Add-ons Engine', () => {

  test('Approved Prices: New Vehicle (₹300), English Driver (₹300), Rooftop Carrier (₹300), Pet Friendly (₹1000), Airport Toll (₹270)', () => {
    expect(BOOKING_ADDONS.new_vehicle.price).toBe(300);
    expect(BOOKING_ADDONS.english_driver.price).toBe(300);
    expect(BOOKING_ADDONS.rooftop_carrier.price).toBe(300);
    expect(BOOKING_ADDONS.pet_friendly.price).toBe(1000);
    expect(BOOKING_ADDONS.airport_entry_toll.price).toBe(270);
  });

  test('Vehicle Compatibility: Rooftop carrier and pet friendly supported across all vehicles as requested', () => {
    expect(isAddOnSupported('rooftop_carrier', 'sedan')).toBe(true);
    expect(isAddOnSupported('rooftop_carrier', 'hatchback')).toBe(true);
    expect(isAddOnSupported('rooftop_carrier', 'suv-muv')).toBe(true);
    expect(isAddOnSupported('rooftop_carrier', 'executive-suv')).toBe(true);

    expect(isAddOnSupported('pet_friendly', 'sedan')).toBe(true);
    expect(isAddOnSupported('pet_friendly', 'hatchback')).toBe(true);
    expect(isAddOnSupported('airport_entry_toll', 'sedan')).toBe(true);
  });

  test('Zero Add-ons Calculation: No charges added to base fare', () => {
    const result = validateAndComputeAddOns([], 'sedan');
    expect(result.validAddOns.length).toBe(0);
    expect(result.addOnTotal).toBe(0);
    expect(result.errors.length).toBe(0);
  });

  test('Single Add-on Selected: Pet friendly adds exactly ₹1000', () => {
    const result = validateAndComputeAddOns(['pet_friendly'], 'sedan');
    expect(result.validAddOns.length).toBe(1);
    expect(result.addOnTotal).toBe(1000);
    expect(result.validAddOns[0].name).toBe('Pet Friendly Cab');
  });

  test('Multiple Add-ons Selected: Pet friendly (₹1000) + Airport Toll (₹270) + Rooftop (₹300) = ₹1570', () => {
    const result = validateAndComputeAddOns(['pet_friendly', 'airport_entry_toll', 'rooftop_carrier'], 'sedan');
    expect(result.validAddOns.length).toBe(3);
    expect(result.addOnTotal).toBe(1570);
    expect(result.errors.length).toBe(0);
  });

  test('Duplicate ID Deduplication: Duplicate add-ons do not result in double charges', () => {
    const result = validateAndComputeAddOns(['pet_friendly', 'pet_friendly'], 'sedan');
    expect(result.validAddOns.length).toBe(1);
    expect(result.addOnTotal).toBe(1000);
  });

  test('Unknown Add-on ID Rejection: Unknown IDs are flagged as errors', () => {
    const result = validateAndComputeAddOns(['invalid_vip_pass'], 'sedan');
    expect(result.validAddOns.length).toBe(0);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toContain("Invalid add-on ID: 'invalid_vip_pass'");
  });

  test('30% Advance Token & 70% Remaining Balance Formula Verification', () => {
    const baseFare = 3000;
    const addOns = 1000; // Pet friendly
    const grandTotal = baseFare + addOns;

    const token = calculateAdvanceToken(grandTotal, 30);
    const balance = grandTotal - token;

    expect(token).toBe(1200);
    expect(balance).toBe(2800);
    expect(token + balance).toBe(grandTotal);
  });
});

test.describe('Phase 3: Server-Side API Security & Validation', () => {

  test('POST /api/public/calculate-fare with 0 add-ons returns authoritative fare', async ({ request }) => {
    const res = await request.post('http://localhost:3000/api/public/calculate-fare', {
      data: {
        serviceType: 'one_way',
        categoryId: 'sedan',
        actualDistanceKm: 200,
        selectedAddOns: [],
      },
    });

    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.fare.addOnTotal).toBe(0);
    expect(json.fare.addOns.length).toBe(0);
    expect(json.fare.customerPayable).toBe(json.fare.baseVehicleFare);
  });

  test('POST /api/public/calculate-fare with Pet Friendly (₹1000) and Rooftop Carrier (₹300)', async ({ request }) => {
    const res = await request.post('http://localhost:3000/api/public/calculate-fare', {
      data: {
        serviceType: 'one_way',
        categoryId: 'sedan',
        actualDistanceKm: 200,
        selectedAddOns: ['pet_friendly', 'rooftop_carrier'],
      },
    });

    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.fare.addOnTotal).toBe(1300);
    expect(json.fare.addOns.length).toBe(2);
    expect(json.fare.customerPayable).toBe(json.fare.baseVehicleFare + 1300);
    expect(json.fare.tokenAmount + json.fare.balanceAmount).toBe(json.fare.customerPayable);
  });

  test('POST /api/public/calculate-fare REJECTS unknown add-on ID with 400 Bad Request', async ({ request }) => {
    const res = await request.post('http://localhost:3000/api/public/calculate-fare', {
      data: {
        serviceType: 'one_way',
        categoryId: 'sedan',
        actualDistanceKm: 200,
        selectedAddOns: ['fake_super_vip_pass'],
      },
    });

    expect(res.status()).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.message).toContain("Invalid add-on ID: 'fake_super_vip_pass'");
  });

  test('Client-side fare manipulation is strictly rejected: Server calculates authoritative payable', async ({ request }) => {
    const res = await request.post('http://localhost:3000/api/public/calculate-fare', {
      data: {
        serviceType: 'one_way',
        categoryId: 'sedan',
        actualDistanceKm: 200,
        selectedAddOns: ['new_vehicle'],
        customerPayable: 10,
        tokenAmount: 3,
        balanceAmount: 7,
      },
    });

    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.fare.customerPayable).toBeGreaterThan(2000);
    expect(json.fare.tokenAmount).toBeGreaterThan(500);
  });
});
