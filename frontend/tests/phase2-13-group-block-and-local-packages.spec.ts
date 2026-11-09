import { test, expect } from '@playwright/test';
import {
  validateAndNormalizeVehicleCategory,
  isGroupVehicleCategory,
  GROUP_VEHICLE_NORMALIZED_CATEGORIES,
  calculateLocalRentalFare,
  LOCAL_RENTAL_CONFIG,
  HOURLY_RENTAL_PACKAGES,
} from '../lib/pricing';
import { FALLBACK_PACKAGES } from '../lib/data/fallback-data';

test.describe('Phase 2.13: Group Vehicle Online Booking Block & Local Rental Price Reconciliation', () => {

  // ── 1. ARCHITECTURE & CATEGORY VALIDATION TESTS ──
  test('Group vehicle categories are recognized but NOT permitted for online booking', () => {
    const groupCategories = [
      'tempo', 'tempo-traveller', 'tempo12', 'tempo16', 'tempo20', 'tempo26',
      'urbania', 'force-urbania', 'urbania12', 'urbania16',
      'bus', 'luxury-bus', 'coach', 'bus27', 'bus45',
    ];

    for (const cat of groupCategories) {
      expect(isGroupVehicleCategory(cat)).toBe(true);
      const res = validateAndNormalizeVehicleCategory(cat);
      expect(res.isValid).toBe(true);
      expect(res.isOnlineBookingPermitted).toBe(false);
      expect(res.requiresManualQuote).toBe(true);
      expect(res.quoteRequiredMessage).toContain('requires a manual quotation');
      expect(res.quoteRequiredMessage).toContain('+91 7310651940');
      expect(res.quoteRequiredMessage).toContain('+91 8595066033');
    }
  });

  test('Passenger vehicle categories are recognized AND permitted for online booking', () => {
    const passengerCategories = ['hatchback', 'sedan', 'ertiga', 'suv-muv', 'innova', 'executive-suv', 'crysta'];

    for (const cat of passengerCategories) {
      expect(isGroupVehicleCategory(cat)).toBe(false);
      const res = validateAndNormalizeVehicleCategory(cat);
      expect(res.isValid).toBe(true);
      expect(res.isOnlineBookingPermitted).toBe(true);
      expect(res.requiresManualQuote).toBe(false);
      expect(res.quoteRequiredMessage).toBeUndefined();
    }
  });

  test('Invalid vehicle categories remain strictly invalid with no silent fallback', () => {
    const invalidCategories = ['helicopter', 'rocket', 'bicycle', '', 'unknown_cab'];

    for (const cat of invalidCategories) {
      const res = validateAndNormalizeVehicleCategory(cat);
      expect(res.isValid).toBe(false);
      expect(res.error).toBeDefined();
    }
  });

  // ── 2. LOCAL RENTAL RECONCILIATION: 20 PACKAGES ACROSS 4 VEHICLES & 5 TIERS ──
  test('Established approved local package prices are strictly preserved', () => {
    // Sedan
    expect(calculateLocalRentalFare('4h40km', 'sedan').basePrice).toBe(1050);
    expect(calculateLocalRentalFare('6h60km', 'sedan').basePrice).toBe(1299);
    expect(calculateLocalRentalFare('8h80km', 'sedan').basePrice).toBe(1500);
    expect(calculateLocalRentalFare('10h100km', 'sedan').basePrice).toBe(2080);
    expect(calculateLocalRentalFare('12h120km', 'sedan').basePrice).toBe(2660);

    // Hatchback approved
    expect(calculateLocalRentalFare('8h80km', 'hatchback').basePrice).toBe(1200);
    expect(calculateLocalRentalFare('12h120km', 'hatchback').basePrice).toBe(2200);

    // Ertiga / SUV approved
    expect(calculateLocalRentalFare('8h80km', 'suv-muv').basePrice).toBe(2000);
    expect(calculateLocalRentalFare('12h120km', 'suv-muv').basePrice).toBe(3480);

    // Innova Crysta approved
    expect(calculateLocalRentalFare('8h80km', 'executive-suv').basePrice).toBe(2500);
    expect(calculateLocalRentalFare('12h120km', 'executive-suv').basePrice).toBe(4500);
  });

  test('Additional unconfirmed local packages preserve active engine values without modification', () => {
    // Hatchback additional packages
    expect(calculateLocalRentalFare('4h40km', 'hatchback').basePrice).toBe(850);
    expect(calculateLocalRentalFare('6h60km', 'hatchback').basePrice).toBe(1050);
    expect(calculateLocalRentalFare('10h100km', 'hatchback').basePrice).toBe(1700);

    // SUV / Ertiga additional packages
    expect(calculateLocalRentalFare('4h40km', 'suv-muv').basePrice).toBe(1350);
    expect(calculateLocalRentalFare('6h60km', 'suv-muv').basePrice).toBe(1680);
    expect(calculateLocalRentalFare('10h100km', 'suv-muv').basePrice).toBe(2740);

    // Innova Crysta additional packages
    expect(calculateLocalRentalFare('4h40km', 'executive-suv').basePrice).toBe(1650);
    expect(calculateLocalRentalFare('6h60km', 'executive-suv').basePrice).toBe(2100);
    expect(calculateLocalRentalFare('10h100km', 'executive-suv').basePrice).toBe(3500);
  });

  test('FALLBACK_PACKAGES catalog has exactly 20 items synchronized with LOCAL_RENTAL_CONFIG', () => {
    expect(FALLBACK_PACKAGES.length).toBe(20);

    const categories = ['cat-sedan', 'cat-suv', 'cat-exec-suv', 'cat-hatchback'];
    for (const catId of categories) {
      const catPackages = FALLBACK_PACKAGES.filter((p) => p.category_id === catId);
      expect(catPackages.length).toBe(5);

      const hours = catPackages.map((p) => p.included_hours).sort((a, b) => a - b);
      expect(hours).toEqual([4, 6, 8, 10, 12]);
    }
  });

  // ── 3. API ROUTE TESTS: CALCULATE-FARE & BOOK GROUP VEHICLE BLOCKS ──
  test('POST /api/public/calculate-fare REJECTS group vehicle Tempo Traveller with GROUP_VEHICLE_QUOTE_REQUIRED', async ({ request }) => {
    const res = await request.post('http://localhost:3000/api/public/calculate-fare', {
      data: {
        serviceType: 'one_way',
        categoryId: 'tempo',
        actualDistanceKm: 300,
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.code).toBe('GROUP_VEHICLE_QUOTE_REQUIRED');
    expect(body.isFareOnRequest).toBe(true);
    expect(body.message).toContain('manual quotation');
    expect(body.contact.phone).toBe('7310651940');
    expect(body.contact.whatsapp).toBe('8595066033');
  });

  test('POST /api/public/calculate-fare REJECTS Force Urbania with GROUP_VEHICLE_QUOTE_REQUIRED', async ({ request }) => {
    const res = await request.post('http://localhost:3000/api/public/calculate-fare', {
      data: {
        serviceType: 'one_way',
        categoryId: 'urbania',
        actualDistanceKm: 250,
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.code).toBe('GROUP_VEHICLE_QUOTE_REQUIRED');
  });

  test('POST /api/public/calculate-fare REJECTS Luxury Bus with GROUP_VEHICLE_QUOTE_REQUIRED', async ({ request }) => {
    const res = await request.post('http://localhost:3000/api/public/calculate-fare', {
      data: {
        serviceType: 'one_way',
        categoryId: 'bus',
        actualDistanceKm: 400,
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.code).toBe('GROUP_VEHICLE_QUOTE_REQUIRED');
  });

  test('POST /api/public/book REJECTS group vehicle Tempo Traveller and creates 0 DB rows', async ({ request }) => {
    const res = await request.post('http://localhost:3000/api/public/book', {
      data: {
        serviceType: 'one_way',
        categoryId: 'tempo',
        pickupAddress: 'Sector 62, Noida',
        dropAddress: 'Mall Road, Nainital',
        travelDateTime: '2026-12-01T08:00:00Z',
        customerFullName: 'Group Travel Inquiry Test',
        customerPhone: '9999999999',
        actualDistanceKm: 300,
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.code).toBe('GROUP_VEHICLE_QUOTE_REQUIRED');
    expect(body.message).toContain('manual quotation');
  });

  test('POST /api/public/book REJECTS Force Urbania and Luxury Bus online booking requests', async ({ request }) => {
    for (const groupCat of ['urbania', 'bus']) {
      const res = await request.post('http://localhost:3000/api/public/book', {
        data: {
          serviceType: 'one_way',
          categoryId: groupCat,
          pickupAddress: 'Delhi',
          dropAddress: 'Agra',
          travelDateTime: '2026-12-01T08:00:00Z',
          customerFullName: 'Group Booking Attempt',
          customerPhone: '9999999999',
          actualDistanceKm: 220,
        },
      });

      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.code).toBe('GROUP_VEHICLE_QUOTE_REQUIRED');
    }
  });

  test('Attempt to bypass group restriction with routeId or manipulated fare is strictly blocked', async ({ request }) => {
    // Attempt with routeId
    const resRouteId = await request.post('http://localhost:3000/api/public/book', {
      data: {
        serviceType: 'one_way',
        routeId: 'delhi-to-nainital-taxi',
        categoryId: 'tempo',
        pickupAddress: 'Delhi',
        dropAddress: 'Nainital',
        travelDateTime: '2026-12-01T08:00:00Z',
        customerFullName: 'Bypass Attempt RouteId',
        customerPhone: '9999999999',
      },
    });
    expect(resRouteId.status()).toBe(400);
    expect((await resRouteId.json()).code).toBe('GROUP_VEHICLE_QUOTE_REQUIRED');

    // Attempt with client manipulated fare
    const resFare = await request.post('http://localhost:3000/api/public/book', {
      data: {
        serviceType: 'one_way',
        categoryId: 'urbania',
        calculatedBaseFare: 100,
        pickupAddress: 'Delhi',
        dropAddress: 'Jaipur',
        travelDateTime: '2026-12-01T08:00:00Z',
        customerFullName: 'Bypass Attempt Fare',
        customerPhone: '9999999999',
        actualDistanceKm: 280,
      },
    });
    expect(resFare.status()).toBe(400);
    expect((await resFare.json()).code).toBe('GROUP_VEHICLE_QUOTE_REQUIRED');
  });

  // ── 4. PASSENGER REGRESSION: NORMAL BOOKING & CALCULATION INTACT ──
  test('Passenger vehicle (Sedan) continues to receive authoritative calculation and 30% advance split', async ({ request }) => {
    const res = await request.post('http://localhost:3000/api/public/calculate-fare', {
      data: {
        serviceType: 'one_way',
        categoryId: 'sedan',
        actualDistanceKm: 300,
      },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.fare.customerPayable).toBe(3600); // 300 * 12 = 3600
    expect(body.fare.tokenAmount).toBe(1080); // 30% of 3600
    expect(body.fare.balanceAmount).toBe(2520); // 70% of 3600
  });

  // ── 5. CHECKOUT PAGE DIRECT URL TEST ──
  test('Direct /checkout?categoryId=tempo renders Manual Quotation Required card with Call and WhatsApp', async ({ page }) => {
    await page.goto('http://localhost:3000/checkout?pickup=Delhi&drop=Nainital&serviceType=one_way&categoryId=tempo&km=300');

    // Header badge
    await expect(page.locator('text=Group Fleet Enquiry').first()).toBeVisible();

    // Quotation Required Card
    await expect(page.locator('text=Manual Quotation Required').first()).toBeVisible();
    await expect(page.locator('h2:has-text("Tempo Traveller")')).toBeVisible();

    // Call Now button with official number
    const callBtn = page.locator('a[href="tel:+917310651940"]');
    await expect(callBtn.first()).toBeVisible();

    // WhatsApp button with official number
    const waBtn = page.locator('a[href*="wa.me/918595066033"]');
    await expect(waBtn.first()).toBeVisible();

    // Normal booking inputs should NOT be present
    await expect(page.locator('input[placeholder*="Full Name"]')).toHaveCount(0);
    await expect(page.locator('button:has-text("Confirm Booking")')).toHaveCount(0);
  });

});
