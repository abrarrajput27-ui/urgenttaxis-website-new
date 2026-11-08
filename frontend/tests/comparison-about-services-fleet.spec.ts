import { test, expect } from '@playwright/test';

test.describe('Services No Calculator, About Us Modified, Route Car Fixed, Homepage MMT & Fleet, Comparison Section', () => {

  test('1. Services page has no fare calculator and has upgraded hero', async ({ page }) => {
    await page.goto('/services');

    const h1 = page.locator('h1');
    await expect(h1).toContainText('Our Taxi & Car Rental Services');

    // Fare calculator should be absent
    const bookingWidgetInput = page.locator('input[placeholder*="Enter pickup city"], #booking-pickup');
    await expect(bookingWidgetInput).toHaveCount(0);

    // Direct booking comparison should be present
    await expect(page.locator('text=Why Book Direct with Urgent Taxis?').first()).toBeVisible();
    await expect(page.locator('text=Compare our fares on top platforms').first()).toBeVisible();

    await page.screenshot({ path: 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f/services_no_calculator.png' });
  });

  test('2. About Us page has upgraded hero and comparison section', async ({ page }) => {
    await page.goto('/about');

    const h1 = page.locator('h1');
    await expect(h1).toContainText('About Urgent Taxis');
    await expect(page.locator('body')).toContainText('हमेशा आपके साथ!');
    await expect(page.locator('body')).toContainText('100% Commercial Fleet');

    // Comparison section present
    await expect(page.locator('text=Why Book Direct with Urgent Taxis?').first()).toBeVisible();
    await expect(page.locator('text=Compare our fares on top platforms').first()).toBeVisible();

    await page.screenshot({ path: 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f/about_us_upgraded_comparison.png' });
  });

  test('3. Route page hero displays fixed solid cutout car', async ({ page }) => {
    await page.goto('/routes/delhi-to-nainital-taxi');

    const carImg = page.locator('img[src*="hero-transparent.webp"]');
    await expect(carImg).toBeVisible();

    await page.screenshot({ path: 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f/route_hero_fixed_car.png' });
  });

  test('4. Homepage has uniform MmtBookingWidget and accurate Fleet Tempo & Bus', async ({ page }) => {
    await page.goto('/');

    // Uniform MmtBookingWidget in hero
    const mmtTabs = page.locator('text=OUTSTATION ONE-WAY').first();
    await expect(mmtTabs).toBeVisible();

    // Direct Booking Comparison present on homepage
    await expect(page.locator('text=Why Book Direct with Urgent Taxis?').first()).toBeVisible();
    await expect(page.locator('text=Compare our fares on top platforms').first()).toBeVisible();
    await expect(page.locator('img[alt="MakeMyTrip Cabs"]').first()).toBeVisible();

    // Fleet slider has Tempo & Bus with accurate details
    await expect(page.locator('text=12 Seater Traveller').first()).toBeVisible();
    await expect(page.locator('text=27 Seater Bus').first()).toBeVisible();

    await page.screenshot({ path: 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f/homepage_mmt_fleet_comparison.png' });
  });

  test('5. Protected Footer Designer Credit is strictly intact', async ({ page }) => {
    await page.goto('/');

    const designerCredit = page.locator('.footer-designer-credit');
    await expect(designerCredit).toBeVisible();

    const designedBySpan = designerCredit.locator('span');
    await expect(designedBySpan).toHaveText('Designed by ');

    const designerStrong = designerCredit.locator('strong');
    await expect(designerStrong).toHaveText('Mantsha Khan');
  });

});
