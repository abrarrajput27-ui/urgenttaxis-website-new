import { test, expect } from '@playwright/test';
import {
  BOOKING_ADDONS,
  ADDON_PRICE_PER_ITEM,
  isAddOnSupported,
  validateAndComputeAddOns,
} from '../lib/pricing/add-ons';
import { calculateAdvanceToken } from '../lib/pricing';

test.describe('Phase 3: Chargeable Vehicle Add-ons Engine & Business Rules', () => {

  test('Fixed Approved Prices: Each add-on is exactly ₹300; all three equal ₹900', () => {
    expect(ADDON_PRICE_PER_ITEM).toBe(300);
    expect(BOOKING_ADDONS.new_vehicle.price).toBe(300);
    expect(BOOKING_ADDONS.english_driver.price).toBe(300);
    expect(BOOKING_ADDONS.rooftop_carrier.price).toBe(300);

    const allThreeTotal =
      BOOKING_ADDONS.new_vehicle.price +
      BOOKING_ADDONS.english_driver.price +
      BOOKING_ADDONS.rooftop_carrier.price;
    expect(allThreeTotal).toBe(900);
  });

  test('Vehicle Compatibility Matrix: Rooftop carrier strictly prohibited on Sedans and Hatchbacks', () => {
    // Sedans and Hatchbacks must NOT support rooftop luggage carrier
    expect(isAddOnSupported('rooftop_carrier', 'sedan')).toBe(false);
    expect(isAddOnSupported('rooftop_carrier', 'hatchback')).toBe(false);

    // SUV/MUV and Executive SUV (Innova Crysta) MUST support rooftop carrier
    expect(isAddOnSupported('rooftop_carrier', 'suv-muv')).toBe(true);
    expect(isAddOnSupported('rooftop_carrier', 'suv_mpv')).toBe(true);
    expect(isAddOnSupported('rooftop_carrier', 'executive-suv')).toBe(true);
    expect(isAddOnSupported('rooftop_carrier', 'innova')).toBe(true);

    // New Vehicle Preference and English Driver are supported across standard categories
    expect(isAddOnSupported('new_vehicle', 'sedan')).toBe(true);
    expect(isAddOnSupported('new_vehicle', 'suv-muv')).toBe(true);
    expect(isAddOnSupported('english_driver', 'sedan')).toBe(true);
    expect(isAddOnSupported('english_driver', 'hatchback')).toBe(true);
  });

  test('Zero Add-ons Calculation: No charges added to base fare', () => {
    const result = validateAndComputeAddOns([], 'sedan');
    expect(result.validAddOns.length).toBe(0);
    expect(result.addOnTotal).toBe(0);
    expect(result.errors.length).toBe(0);
  });

  test('Single Add-on Selected: Adds exactly ₹300', () => {
    const result = validateAndComputeAddOns(['new_vehicle'], 'sedan');
    expect(result.validAddOns.length).toBe(1);
    expect(result.addOnTotal).toBe(300);
    expect(result.validAddOns[0].name).toBe('New Vehicle Preference');
  });

  test('Two Add-ons Selected: Adds exactly ₹600', () => {
    const result = validateAndComputeAddOns(['new_vehicle', 'english_driver'], 'sedan');
    expect(result.validAddOns.length).toBe(2);
    expect(result.addOnTotal).toBe(600);
  });

  test('All Three Add-ons on Eligible SUV: Adds exactly ₹900', () => {
    const result = validateAndComputeAddOns(
      ['new_vehicle', 'english_driver', 'rooftop_carrier'],
      'suv-muv'
    );
    expect(result.validAddOns.length).toBe(3);
    expect(result.addOnTotal).toBe(900);
    expect(result.errors.length).toBe(0);
  });

  test('Incompatible Vehicle Validation: Prohibits rooftop carrier on Sedan with descriptive error', () => {
    const result = validateAndComputeAddOns(['rooftop_carrier'], 'sedan');
    expect(result.validAddOns.length).toBe(0);
    expect(result.addOnTotal).toBe(0);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('Safe intercity mounting available only on SUV/MUV');
  });

  test('Duplicate ID Deduplication: Duplicate add-ons do not result in double charges', () => {
    const result = validateAndComputeAddOns(['new_vehicle', 'new_vehicle', 'new_vehicle'], 'sedan');
    expect(result.validAddOns.length).toBe(1);
    expect(result.addOnTotal).toBe(300);
  });

  test('Unknown Add-on ID Rejection: Unknown IDs are flagged as errors', () => {
    const result = validateAndComputeAddOns(['invalid_vip_lounge_access'], 'sedan');
    expect(result.validAddOns.length).toBe(0);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toContain("Invalid add-on ID: 'invalid_vip_lounge_access'");
  });

  test('30% Advance Token & 70% Remaining Balance Formula Verification', () => {
    const baseFare = 3000;

    // 0 add-ons: Total ₹3000 => Token 30% = ₹900, Balance 70% = ₹2100
    const token0 = calculateAdvanceToken(baseFare, 30);
    const bal0 = baseFare - token0;
    expect(token0).toBe(900);
    expect(bal0).toBe(2100);
    expect(token0 + bal0).toBe(baseFare);

    // 1 add-on (₹300): Total ₹3300 => Token 30% = ₹990, Balance 70% = ₹2310
    const total1 = baseFare + 300;
    const token1 = calculateAdvanceToken(total1, 30);
    const bal1 = total1 - token1;
    expect(token1).toBe(990);
    expect(bal1).toBe(2310);
    expect(token1 + bal1).toBe(total1);

    // 2 add-ons (₹600): Total ₹3600 => Token 30% = ₹1080, Balance 70% = ₹2520
    const total2 = baseFare + 600;
    const token2 = calculateAdvanceToken(total2, 30);
    const bal2 = total2 - token2;
    expect(token2).toBe(1080);
    expect(bal2).toBe(2520);
    expect(token2 + bal2).toBe(total2);

    // 3 add-ons (₹900): Total ₹3900 => Token 30% = ₹1170, Balance 70% = ₹2730
    const total3 = baseFare + 900;
    const token3 = calculateAdvanceToken(total3, 30);
    const bal3 = total3 - token3;
    expect(token3).toBe(1170);
    expect(bal3).toBe(2730);
    expect(token3 + bal3).toBe(total3);
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

  test('POST /api/public/calculate-fare with 1 add-on (₹300)', async ({ request }) => {
    const res = await request.post('http://localhost:3000/api/public/calculate-fare', {
      data: {
        serviceType: 'one_way',
        categoryId: 'sedan',
        actualDistanceKm: 200,
        selectedAddOns: ['new_vehicle'],
      },
    });

    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.fare.addOnTotal).toBe(300);
    expect(json.fare.addOns.length).toBe(1);
    expect(json.fare.addOns[0].id).toBe('new_vehicle');
    expect(json.fare.addOns[0].price).toBe(300);
    expect(json.fare.customerPayable).toBe(json.fare.baseVehicleFare + 300);
    expect(json.fare.tokenAmount + json.fare.balanceAmount).toBe(json.fare.customerPayable);
  });

  test('POST /api/public/calculate-fare with 2 add-ons (₹600)', async ({ request }) => {
    const res = await request.post('http://localhost:3000/api/public/calculate-fare', {
      data: {
        serviceType: 'one_way',
        categoryId: 'sedan',
        actualDistanceKm: 200,
        selectedAddOns: ['new_vehicle', 'english_driver'],
      },
    });

    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.fare.addOnTotal).toBe(600);
    expect(json.fare.addOns.length).toBe(2);
    expect(json.fare.customerPayable).toBe(json.fare.baseVehicleFare + 600);
  });

  test('POST /api/public/calculate-fare with all 3 add-ons on SUV (₹900)', async ({ request }) => {
    const res = await request.post('http://localhost:3000/api/public/calculate-fare', {
      data: {
        serviceType: 'one_way',
        categoryId: 'suv-muv',
        actualDistanceKm: 200,
        selectedAddOns: ['new_vehicle', 'english_driver', 'rooftop_carrier'],
      },
    });

    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.fare.addOnTotal).toBe(900);
    expect(json.fare.addOns.length).toBe(3);
    expect(json.fare.customerPayable).toBe(json.fare.baseVehicleFare + 900);
  });

  test('POST /api/public/calculate-fare REJECTS rooftop carrier on Sedan with 400 Bad Request', async ({ request }) => {
    const res = await request.post('http://localhost:3000/api/public/calculate-fare', {
      data: {
        serviceType: 'one_way',
        categoryId: 'sedan',
        actualDistanceKm: 200,
        selectedAddOns: ['rooftop_carrier'],
      },
    });

    expect(res.status()).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.message).toContain('Safe intercity mounting available only on SUV/MUV');
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
    // Malicious attempt to pass manipulated customerPayable = 10
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
    // Server must compute true fare, never accepting the injected 10
    expect(json.fare.customerPayable).toBeGreaterThan(2000);
    expect(json.fare.tokenAmount).toBeGreaterThan(500);
  });
});

test.describe('Phase 3: Checkout Page UI & Persistence', () => {

  test('Checkout page correctly parses add-ons from URL and renders breakdown', async ({ page }) => {
    await page.goto(
      'http://localhost:3000/checkout?serviceType=one_way&categoryId=sedan&pickup=Ghaziabad&drop=Haridwar&km=215&date=2026-11-10T06:00&addOns=new_vehicle,english_driver',
      { waitUntil: 'domcontentloaded' }
    );

    // Optional Trip Add-ons section must be visible
    await expect(page.locator('text=Optional Trip Add-ons')).toBeVisible({ timeout: 10000 });

    // Review section shows individual ₹300 items
    await expect(page.locator('text=New Vehicle Preference')).toBeVisible();
    await expect(page.locator('text=English-Speaking Driver')).toBeVisible();

    // Summary column shows selected add-ons breakdown (SEC-05: timeout set to 10s for async calculate-fare)
    await expect(page.locator('text=Total Add-on Charges')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=₹600')).toBeVisible({ timeout: 10000 });

    // Rooftop carrier is disabled for sedan
    const rooftopCard = page.locator('text=Safe intercity mounting available only on SUV/MUV');
    await expect(rooftopCard).toBeVisible();
  });
});
