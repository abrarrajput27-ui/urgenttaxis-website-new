import { test, expect } from '@playwright/test';

test.describe('Route Page Concept Verification', () => {
  test('should render Delhi to Nainital route page with all concept sections', async ({ page }) => {
    // Navigate to local build or dev server
    await page.setViewportSize({ width: 1280, height: 900 });
    const response = await page.goto('/routes/delhi-to-nainital-taxi', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    expect(response?.status()).toBe(200);

    // 1. Hero checks
    await expect(page.locator('h1')).toContainText('Delhi to Nainital Taxi');
    await expect(page.getByText('via NH9').first()).toBeVisible();
    await expect(page.getByText('300 km').first()).toBeVisible();

    // 2. Route Map Card
    await expect(page.getByRole('heading', { name: 'Route Map' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Map' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Satellite' })).toBeVisible();

    // 3. Cab Options & Fare
    await expect(page.getByRole('heading', { name: 'Cab Options & Fare' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Hatchback' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sedan' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'SUV' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Innova Crysta' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tempo Traveller' })).toBeVisible();

    // 4. Quick Route Highlights
    await expect(page.getByRole('heading', { name: 'Quick Route Highlights' })).toBeVisible();

    // 5. Places on This Route (4 columns)
    await expect(page.getByRole('heading', { name: 'Places on This Route' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Restaurants' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Petrol Pumps' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'CNG Pumps' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Nearby Attractions' })).toBeVisible();

    // 6. Route Gallery
    await expect(page.getByRole('heading', { name: 'Route Gallery' })).toBeVisible();

    // 7. Distance & Route Details + Weather + Travel Tips
    await expect(page.getByRole('heading', { name: 'Distance & Route Details' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Weather in Nainital' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Travel Tips' })).toBeVisible();

    // 8. Frequently Asked Questions
    await expect(page.getByRole('heading', { name: /Frequently Asked Questions/ })).toBeVisible();

    // 9. Similar Routes
    await expect(page.getByRole('heading', { name: 'Similar Routes' })).toBeVisible();

    // 10. Bottom CTA
    await expect(page.getByRole('heading', { name: /Plan Your Next Journey with/ })).toBeVisible();

    // 11. Protected Footer Credit
    await expect(page.locator('.footer-designer-credit')).toContainText('Designed by Mantsha Khan');

    // Take Full Page Screenshot (Desktop)
    await page.screenshot({
      path: 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f/route_page_concept_desktop.png',
      fullPage: true,
    });

    // Mobile Viewport Check (390px)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Ensure no horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

    // Take Full Page Screenshot (Mobile)
    await page.screenshot({
      path: 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f/route_page_concept_mobile.png',
      fullPage: true,
    });
  });
});
