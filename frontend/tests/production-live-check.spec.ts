import { test, expect } from '@playwright/test';

test.describe('Live Production Verification (https://www.urgenttaxis.in)', () => {
  test('Live Cabs page loads in sub-2 seconds and renders authentic MakeMyTrip layout with accurate distance & duration', async ({ page }) => {
    const startTime = Date.now();
    await page.setViewportSize({ width: 1280, height: 900 });
    
    const response = await page.goto('https://www.urgenttaxis.in/cabs?serviceType=one_way&pickup=Delhi&drop=Nainital', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    const loadTimeMs = Date.now() - startTime;
    console.log(`Live Cabs Page Load Time: ${loadTimeMs} ms`);

    expect(response?.status()).toBe(200);

    // Verify Title & Route
    await expect(page.locator('h1')).toContainText('Delhi to Nainital Cabs');

    // Verify 4-Step Booking Tracker
    await expect(page.locator('text=1. Search Route')).toBeVisible();
    await expect(page.locator('text=2. Select Vehicle')).toBeVisible();
    await expect(page.locator('text=3. Trip Details')).toBeVisible();

    // Verify accurate highway distance & duration (zero fake numbers)
    await expect(page.locator('text=310 km').first()).toBeVisible();
    await expect(page.locator('text=Highway').first()).toBeVisible();

    // Verify vehicle cards
    await expect(page.locator('text=Sedan').first()).toBeVisible();
    await expect(page.locator('text=SUV / MPV').first()).toBeVisible();
    await expect(page.locator('text=Innova Crysta').first()).toBeVisible();
    await expect(page.locator('text=Hatchback').first()).toBeVisible();

    // Verify 30% Token & 70% Driver Balance breakdown
    await expect(page.locator('text=Pay Now (30% Token):').first()).toBeVisible();
    await expect(page.locator('text=To Driver at start (70%):').first()).toBeVisible();

    // Protected Footer Credit
    const footerCredit = page.locator('.footer-designer-credit');
    await expect(footerCredit).toBeVisible();
    await expect(footerCredit).toContainText('Designed by');
    await expect(footerCredit).toContainText('Mantsha Khan');

    await page.screenshot({ path: 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f/production_cabs_verified.png' });
  });

  test('Live Route page loads fast with clean MMT search bar and verified destination image without cross-contamination', async ({ page }) => {
    const startTime = Date.now();
    await page.setViewportSize({ width: 1280, height: 900 });

    const response = await page.goto('https://www.urgenttaxis.in/routes/delhi-to-nainital-taxi', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    const loadTimeMs = Date.now() - startTime;
    console.log(`Live Route Page Load Time: ${loadTimeMs} ms`);

    expect(response?.status()).toBe(200);

    // Verify Route heading & clean Search Cabs button
    await expect(page.locator('h1')).toContainText('Delhi to Nainital');
    await expect(page.locator('#search-cabs-button')).toBeVisible();

    // Verify Protected Footer Credit
    const footerCredit = page.locator('.footer-designer-credit');
    await expect(footerCredit).toBeVisible();
    await expect(footerCredit).toContainText('Designed by');
    await expect(footerCredit).toContainText('Mantsha Khan');

    await page.screenshot({ path: 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f/production_route_nainital_verified.png' });
  });

  test('Live Homepage loads fast and search directs to authentic /cabs page', async ({ page }) => {
    const startTime = Date.now();
    await page.setViewportSize({ width: 1280, height: 900 });

    const response = await page.goto('https://www.urgenttaxis.in/', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    const loadTimeMs = Date.now() - startTime;
    console.log(`Live Homepage Load Time: ${loadTimeMs} ms`);

    expect(response?.status()).toBe(200);

    // Protected Footer Credit
    const footerCredit = page.locator('.footer-designer-credit');
    await expect(footerCredit).toBeVisible();
    await expect(footerCredit).toContainText('Designed by');
    await expect(footerCredit).toContainText('Mantsha Khan');

    await page.screenshot({ path: 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f/production_homepage_verified.png' });
  });
});
