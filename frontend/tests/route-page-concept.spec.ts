import { test, expect } from '@playwright/test';

test.describe('Route Page Concept Layout Verification', () => {
  test('should render route page with reference concept layout and urgent taxis branding', async ({ page }) => {
    // 1. Desktop Viewport
    await page.setViewportSize({ width: 1280, height: 900 });
    const response = await page.goto('http://localhost:3000/routes/delhi-to-nainital-taxi', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    expect(response?.status()).toBe(200);

    // Hero Section Verification
    await expect(page.locator('h1')).toContainText('Delhi to Nainital Taxi');
    await expect(page.getByText('One-way & Round Trip').first()).toBeVisible();
    await expect(page.getByText('310 km').first()).toBeVisible();
    await expect(page.getByText(/5 - 6 Hours/i).first()).toBeVisible();

    // Top 3-Card Row
    await expect(page.getByRole('heading', { name: /Route Overview/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Route Map/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Cab Options & Fare/ })).toBeVisible();

    // Available Cabs inside Cab Options & Fare
    await expect(page.getByRole('heading', { name: 'Hatchback' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sedan' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'SUV' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Innova Crysta' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tempo Traveller' })).toBeVisible();

    // Quick Route Highlights
    await expect(page.getByText('Scenic Mountain Drive')).toBeVisible();
    await expect(page.getByText('Popular Hill Station')).toBeVisible();
    await expect(page.getByText(/Well Connected Route/i)).toBeVisible();

    // Places Along the Route (4 Columns)
    await expect(page.getByText('Places on This Route').first()).toBeVisible();
    await expect(page.getByText('Haveli Restaurant').first()).toBeVisible();
    await expect(page.getByText('Indian Oil Petrol Pump').first()).toBeVisible();
    await expect(page.getByText('IOCL CNG Station').first()).toBeVisible();
    await expect(page.getByText('Naini Lake').first()).toBeVisible();

    // Route Gallery
    await expect(page.getByRole('heading', { name: /Route Gallery/ })).toBeVisible();
    await expect(page.getByText('NH9 Highway View').first()).toBeVisible();

    // Milestones & Weather / Travel Tips
    await expect(page.getByRole('heading', { name: /Distance & Route Details/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Weather in Nainital/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Travel Tips/ })).toBeVisible();

    // FAQs (2-Column)
    await expect(page.getByText('Frequently Asked Questions').first()).toBeVisible();

    // Similar Routes (Directly before CTA)
    await expect(page.getByRole('heading', { name: /Similar Routes/ })).toBeVisible();
    // Confirm starting fares are shown without "on demand"
    await expect(page.getByText('From ₹3,999').first()).toBeVisible();

    // Bottom CTA
    await expect(page.getByText('Plan Your Next Journey with Urgent Taxis')).toBeVisible();

    // Protected Footer Credit
    await expect(page.locator('.footer-designer-credit')).toContainText('Designed by Mantsha Khan');

    // Desktop Screenshot
    await page.screenshot({
      path: 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f/route_page_concept_desktop.png',
      fullPage: true,
    });

    // Mobile Viewport Check (390px)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Verify zero horizontal overflow on mobile
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

    // Mobile Screenshot
    await page.screenshot({
      path: 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f/route_page_concept_mobile.png',
      fullPage: true,
    });
  });

  test('should render dehradun route with dehradun attractions and places', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const response = await page.goto('http://localhost:3000/routes/delhi-to-dehradun-taxi', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toContainText('Delhi to Dehradun Taxi');
    // Confirm Dehradun specific attractions are rendered
    await expect(page.getByText(/Robber.*s Cave/i).first()).toBeVisible();
    await expect(page.getByText(/Sahastradhara/i).first()).toBeVisible();

    await page.screenshot({
      path: 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f/route_page_concept_dehradun_desktop.png',
      fullPage: true,
    });
  });
});
