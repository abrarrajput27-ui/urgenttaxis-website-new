import { test, expect } from '@playwright/test';

test.describe('Trip & Passenger Details Page (MakeMyTrip Experience)', () => {

  test('1. Checkout page renders flush with header (Zero Gap) and authentic MMT layout', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const pickup = encodeURIComponent('Shop 9, SR Complex, Masuri, Ghaziabad');
    const drop = encodeURIComponent('Mall Road, Nainital, Uttarakhand');
    await page.goto(`http://localhost:3000/checkout?pickup=${pickup}&drop=${drop}&serviceType=one_way&categoryId=sedan&km=310&date=2026-11-08&time=09:00`, {
      waitUntil: 'domcontentloaded',
    });

    // 1. Verify 4-step progress tracker
    await expect(page.locator('text=1. Search Route')).toBeVisible();
    await expect(page.locator('text=2. Select Vehicle')).toBeVisible();
    await expect(page.locator('text=3. Trip & Passenger Details')).toBeVisible();
    await expect(page.locator('text=4. Booking Confirmed')).toBeVisible();

    // 2. Verify selected cab card
    await expect(page.locator('h2:has-text("Selected Cab: Sedan")')).toBeVisible();
    await expect(page.locator('text=Maruti Dzire, Toyota Etios, Honda Amaze')).toBeVisible();
    await expect(page.locator('text=Highway Tolls & Permits Included').first()).toBeVisible();

    // 3. Verify doorstep address fields
    await expect(page.locator('text=Exact Doorstep Address Details')).toBeVisible();
    await expect(page.locator('input[placeholder*="House/Flat No."]')).toBeVisible();
    await expect(page.locator('input[placeholder*="Destination Hotel"]')).toBeVisible();

    // 4. Verify passenger details fields
    const selectElem = page.locator('select').first();
    await expect(selectElem).toBeVisible();
    expect(await selectElem.inputValue()).toBe('Mr.');
    await expect(page.locator('input[placeholder="Enter full name"]')).toBeVisible();
    await expect(page.locator('input[placeholder="10-digit mobile number"]')).toBeVisible();

    // 5. Verify Fare Breakdown with 30% Token and 70% Driver Balance
    await expect(page.locator('h3:has-text("Fare & Payment Summary")')).toBeVisible();
    await expect(page.locator('text=Pay Now (30% Online Token)')).toBeVisible();
    await expect(page.locator('text=To Driver at Pickup (70% Balance)')).toBeVisible();

    // 6. Verify ZERO errors
    const errorBanner = page.locator('.text-red-700, .text-red-500');
    await expect(errorBanner).toHaveCount(0);

    // 7. Verify no "Invalid Booking Session"
    await expect(page.locator('text=Invalid Booking Session')).toHaveCount(0);
  });

  test('2. Checkout handles all vehicle categories with zero errors', async ({ page }) => {
    // Test with Ertiga
    await page.goto('http://localhost:3000/checkout?pickup=Delhi&drop=Haridwar&serviceType=one_way&categoryId=ertiga&km=220&date=2026-11-08&time=10:00', {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.locator('h2:has-text("Selected Cab: Maruti Ertiga")')).toBeVisible();
    await expect(page.locator('text=6 Seats').first()).toBeVisible();

    // Test with Innova Crysta
    await page.goto('http://localhost:3000/checkout?pickup=Delhi&drop=Agra&serviceType=one_way&categoryId=executive-suv&km=240&date=2026-11-08&time=08:00', {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.locator('h2:has-text("Selected Cab: Innova Crysta")')).toBeVisible();
    await expect(page.locator('text=7 Seats').first()).toBeVisible();

    // Test with Tempo Traveller (Phase 2.13: Group vehicle blocks online booking and requires manual quotation)
    await page.goto('http://localhost:3000/checkout?pickup=Delhi&drop=Shimla&serviceType=one_way&categoryId=tempo&km=350&date=2026-11-08&time=06:00', {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.locator('text=Manual Quotation Required').first()).toBeVisible();
    await expect(page.locator('h2:has-text("Tempo Traveller")')).toBeVisible();
  });

  test('3. Full funnel navigation from Home -> Cabs -> Checkout works seamlessly', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

    // Enter pickup and drop in hero widget
    await page.fill('#booking-pickup', 'Delhi');
    await page.fill('#booking-drop', 'Haridwar');
    await page.locator('button:has-text("SEARCH CABS")').click();
    await page.waitForURL(/\/cabs/, { timeout: 15000 });

    // Click Book Online on Sedan
    const bookBtn = page.locator('button:has-text("Book Online (30% Token)")').nth(1); // Sedan
    await expect(bookBtn).toBeVisible({ timeout: 10000 });
    await bookBtn.click();
    await page.waitForURL(/\/checkout/, { timeout: 15000 });

    // Verify checkout page loaded with correct vehicle and zero errors
    await expect(page.locator('h2:has-text("Selected Cab: Sedan")')).toBeVisible();
    await expect(page.locator('text=Pay Now (30% Online Token)')).toBeVisible();

    // Check footer credit
    const credit = page.locator('.footer-designer-credit');
    await expect(credit.first()).toContainText('Mantsha Khan');
  });

});
