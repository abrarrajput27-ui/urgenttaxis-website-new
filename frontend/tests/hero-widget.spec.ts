import { test, expect } from '@playwright/test';
import {
  resolveOneWayFare,
  resolveMultiStopRoute,
  calculateRoundTripFare,
  calculateLocalRentalFare,
  resolveAirportFare,
  calculateAdvanceToken,
  buildWhatsAppBookingLink,
  HOURLY_RENTAL_PACKAGES,
} from '../lib/pricing';

test.describe('Phase 2: Hero Booking Widget Engine & Quote Resolution', () => {

  test('Pickup & Drop Empty Default Rule: Resolves null when either field is missing', () => {
    // When pickup or drop is empty, hero widget does not show premature vehicle cards
    const emptyOrigin = resolveOneWayFare('', 'Haridwar', 0);
    expect(emptyOrigin).toBeNull();

    const emptyDest = resolveOneWayFare('Ghaziabad', '', 0);
    expect(emptyDest).toBeNull();
  });

  test('Instant One-Way Fare Calculation: Ghaziabad to Haridwar returns fixed master fare', () => {
    const quote = resolveOneWayFare('Ghaziabad', 'Haridwar');
    expect(quote).not.toBeNull();
    expect(quote!.isFixed).toBe(true);
    expect(quote!.sedanFare).toBe(3499);
    
    // 30% Advance Token & 70% Balance
    const token = calculateAdvanceToken(quote!.sedanFare, 30);
    const balance = quote!.sedanFare - token;
    expect(token).toBe(1050);
    expect(balance).toBe(2449);

    // Toll estimated separately
    expect(quote!.estimatedToll).toBeGreaterThan(0);
  });

  test('Instant Round-Trip Fare: Ghaziabad to Jaipur (300 km one-way, 2 days)', () => {
    // Billable KM = max(300*2 = 600, 250*2 = 500) = 600 KM
    const rtSedan = calculateRoundTripFare(300, 2, 'sedan');
    expect(rtSedan.billableKm).toBe(600);
    expect(rtSedan.ratePerKm).toBe(11);
    // 600 * 11 + 400 * 2 = 6600 + 800 = 7400
    expect(rtSedan.totalFare).toBe(7400);
    expect(rtSedan.tokenAmount).toBe(2220); // 7400 * 0.30 = 2220
    expect(rtSedan.balanceAmount).toBe(5180);
  });

  test('Instant Local Rental: 8h/80km and 12h/120km packages are instant, never "On Request"', () => {
    const pkg8h = calculateLocalRentalFare('8h80km', 'sedan');
    expect(pkg8h.basePrice).toBe(1500);
    expect(pkg8h.tokenAmount).toBe(450);

    const pkg12h = calculateLocalRentalFare('12h120km', 'sedan');
    expect(pkg12h.basePrice).toBe(2660);
    expect(pkg12h.tokenAmount).toBe(800);
  });

  test('Instant Airport Transfer: Ghaziabad to IGI Airport', () => {
    const airportQuote = resolveAirportFare('Delhi IGI Airport', 'Ghaziabad');
    expect(airportQuote).not.toBeNull();
    expect(airportQuote!.sedanFare).toBeGreaterThanOrEqual(1199);
    expect(airportQuote!.isFixed).toBe(true);
  });

  test('Custom Unmapped Corridor: Returns transparent distance & WhatsApp quote flag, never "Price on request"', () => {
    const custom = resolveOneWayFare('RandomVillageX', 'RandomVillageY', 350);
    expect(custom).not.toBeNull();
    expect(custom!.requiresWhatsAppQuote).toBe(true);
    expect(custom!.distanceKm).toBe(350);
  });

  test('Clean WhatsApp Link Formatting for Booking Card', () => {
    const waUrl = buildWhatsAppBookingLink({
      serviceType: 'One-way',
      vehicleName: 'Sedan',
      origin: 'Ghaziabad',
      destination: 'Haridwar',
      travelDate: '2026-11-15',
      travelTime: '06:00',
      estimatedFare: 3499,
      pageUrl: 'https://www.urgenttaxis.in',
    });
    const decoded = decodeURIComponent(waUrl);
    expect(decoded).toContain('https://wa.me/918595066033?text=Hello Urgent Taxis, I want to book a Sedan.');
    expect(decoded).toContain('Trip: One-way, Ghaziabad to Haridwar');
    expect(decoded).toContain('Estimated fare: ₹3,499 (toll and parking extra)');
    expect(decoded.match(/Hello Urgent Taxis/g)?.length).toBe(1);
  });

  test('Hourly Rentals: Exactly 5 Packages supported with verified rates preserved', () => {
    // Packages list must contain exactly the 5 requested packages
    expect(HOURLY_RENTAL_PACKAGES.length).toBe(5);
    const packageIds = HOURLY_RENTAL_PACKAGES.map((p) => p.id);
    expect(packageIds).toEqual(['4h40km', '6h60km', '8h80km', '10h100km', '12h120km']);

    // Verified 8h80km and 12h120km
    const pkg8h = calculateLocalRentalFare('8h80km', 'sedan');
    expect(pkg8h.isFixed).toBe(true);
    expect(pkg8h.basePrice).toBe(1500);

    const pkg12h = calculateLocalRentalFare('12h120km', 'sedan');
    expect(pkg12h.isFixed).toBe(true);
    expect(pkg12h.basePrice).toBe(2660);

    // Unverified packages must not invent prices
    const pkg4h = calculateLocalRentalFare('4h40km', 'sedan');
    expect(pkg4h.isFixed).toBe(false);
    expect(pkg4h.requiresConfirmation).toBe(true);
    expect(pkg4h.basePrice).toBe(0);

    const pkg6h = calculateLocalRentalFare('6h60km', 'sedan');
    expect(pkg6h.isFixed).toBe(false);
    expect(pkg6h.requiresConfirmation).toBe(true);

    const pkg10h = calculateLocalRentalFare('10h100km', 'sedan');
    expect(pkg10h.isFixed).toBe(false);
    expect(pkg10h.requiresConfirmation).toBe(true);
  });

  test('Multi-Stop Intermediate Routing: Correct leg distance calculation & sequence', () => {
    // Multi-stop route: Delhi -> Ghaziabad -> Haridwar
    const multi = resolveMultiStopRoute('Delhi', ['Ghaziabad'], 'Haridwar');
    expect(multi).not.toBeNull();
    expect(multi!.sequence).toEqual(['Delhi', 'Ghaziabad', 'Haridwar']);
    expect(multi!.totalDistanceKm).toBeGreaterThan(0);
    expect(multi!.sedanFare).toBeGreaterThan(0);
  });

  test('Multi-Stop Unmapped Route: Does not invent misleading fares', () => {
    const unmappedMulti = resolveMultiStopRoute('UnknownPlaceA', ['UnknownPlaceB'], 'UnknownPlaceC');
    expect(unmappedMulti).not.toBeNull();
    expect(unmappedMulti!.isReliablyCalculated).toBe(false);
    expect(unmappedMulti!.requiresWhatsAppQuote).toBe(true);
    expect(unmappedMulti!.sedanFare).toBe(0);
  });
});

test.describe('Phase 2: Unified Booking Widget UI & Interactions', () => {
  test('Desktop & Mobile Calculator Tabs Verification', async ({ page }) => {
    // 1. Desktop Viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    // Desktop tabs: 4 distinct service tabs visible
    await expect(page.locator('#desktop-tab-one_way')).toBeVisible();
    await expect(page.locator('#desktop-tab-round_trip')).toBeVisible();
    await expect(page.locator('#desktop-tab-airport_transfer')).toBeVisible();
    await expect(page.locator('#desktop-tab-local_rental')).toBeVisible();

    // 2. Mobile Viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    // Mobile parent tabs
    await expect(page.locator('#mobile-tab-outstation')).toBeVisible();
    await expect(page.locator('#mobile-tab-airport')).toBeVisible();
    await expect(page.locator('#mobile-tab-rental')).toBeVisible();

    // Mobile outstation sub-toggles
    await expect(page.locator('#mobile-subtab-oneway')).toBeVisible();
    await expect(page.locator('#mobile-subtab-roundtrip')).toBeVisible();
  });

  test('Pickup/Drop Swap and Add/Remove Stop Interaction', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    // Fill pickup and drop
    await page.fill('#booking-pickup', 'Delhi');
    await page.fill('#booking-drop', 'Haridwar');
    await page.keyboard.press('Escape');
    await expect(page.locator('#booking-pickup')).toHaveValue('Delhi');
    await expect(page.locator('#booking-drop')).toHaveValue('Haridwar');

    // Test Swap
    await page.click('#swap-locations-button');
    await page.keyboard.press('Escape');
    await expect(page.locator('#booking-pickup')).toHaveValue('Haridwar');
    await expect(page.locator('#booking-drop')).toHaveValue('Delhi');

    // Test Add Stop
    await page.click('#add-stop-button');
    await expect(page.locator('#stop-input-0')).toBeVisible();
    await page.fill('#stop-input-0', 'Meerut');
    await page.keyboard.press('Escape');

    // Test Remove Stop
    await page.click('#remove-stop-0');
    await expect(page.locator('#stop-input-0')).not.toBeVisible();
  });

  test('Round-Trip Return Location Auto-Sync & Date Validation', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    // Switch to Round-trip
    await page.click('#desktop-tab-round_trip');
    await page.fill('#booking-pickup', 'Ghaziabad');
    await page.fill('#booking-drop', 'Jaipur');

    // Return to pickup indicator automatically syncs
    await expect(page.getByText('Ghaziabad (automatically returns to your pickup address)')).toBeVisible();

    // Changing pickup updates return location
    await page.fill('#booking-pickup', 'Noida');
    await expect(page.getByText('Noida (automatically returns to your pickup address)')).toBeVisible();
  });

  test('Hourly Rentals: Exactly 5 packages and rate confirmation display', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    // Switch to Hourly Rentals
    await page.click('#desktop-tab-local_rental');
    const packageSelect = page.locator('#rental-package');
    await expect(packageSelect).toBeVisible();

    const optionCount = await packageSelect.locator('option').count();
    expect(optionCount).toBe(5);

    // Select 4 Hours / 40 KM (unverified rate)
    await packageSelect.selectOption('4h40km');
    await page.click('#search-cabs-button');
    await expect(page.locator('#cab-selection-panel').getByText(/Rate on Request/i).first()).toBeVisible();
    await expect(page.locator('#cab-selection-panel').getByText(/Confirm Rate on WhatsApp/i).first()).toBeVisible();

    // Select 8 Hours / 80 KM (verified rate)
    await packageSelect.selectOption('8h80km');
    await page.click('#search-cabs-button');
    await expect(page.locator('#cab-selection-panel').getByText('₹1,500').first()).toBeVisible();
    await expect(page.locator('#cab-selection-panel').getByText('₹450').first()).toBeVisible(); // 30% advance token
  });
});
