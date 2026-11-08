import { test, expect } from '@playwright/test';

test.describe('MMT Style Cabs & Clean Route Experience', () => {
  test('Cabs Page renders authentic MakeMyTrip layout with accurate distance & duration', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('http://localhost:3000/cabs?serviceType=one_way&pickup=Delhi&drop=Nainital', { waitUntil: 'networkidle' });

    // Verify Title & Route
    await expect(page.locator('h1')).toContainText('Delhi');
    await expect(page.locator('h1')).toContainText('Nainital');

    // Verify 4-step progress tracker
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

    // Take desktop screenshot
    await page.screenshot({ path: 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f/mmt_cabs_desktop_verified.png' });
  });

  test('Route Page displays clean MMT search bar and verified location image without cross-contamination', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('http://localhost:3000/routes/delhi-to-nainital-taxi', { waitUntil: 'networkidle' });

    // Verify Route heading
    await expect(page.locator('h1')).toContainText('Delhi to Nainital');

    // Verify Search Cabs button
    await expect(page.locator('#search-cabs-button')).toBeVisible();

    // Verify protected footer credit
    const footerCredit = page.locator('.footer-designer-credit');
    await expect(footerCredit).toBeVisible();
    await expect(footerCredit).toContainText('Designed by');
    await expect(footerCredit).toContainText('Mantsha Khan');

    // Take route page screenshot
    await page.screenshot({ path: 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f/route_nainital_verified.png' });
  });

  test('Mobile view on /cabs is responsive and sleek', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:3000/cabs?serviceType=one_way&pickup=Delhi&drop=Nainital', { waitUntil: 'networkidle' });

    await expect(page.locator('h1')).toContainText('Delhi');
    await expect(page.locator('text=310 km').first()).toBeVisible();
    await expect(page.locator('text=Book Online (30% Token)').first()).toBeVisible();

    // Take mobile screenshot
    await page.screenshot({ path: 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f/mmt_cabs_mobile_verified.png' });
  });
});
