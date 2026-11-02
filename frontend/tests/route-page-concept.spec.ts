import { test, expect } from '@playwright/test';

test.describe('Route Page Original Layout Verification', () => {
  test('should render route page in original layout with updated missing information', async ({ page }) => {
    // 1. Desktop Viewport
    await page.setViewportSize({ width: 1280, height: 900 });
    const response = await page.goto('/routes/delhi-to-nainital-taxi', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    expect(response?.status()).toBe(200);

    // Hero Header
    await expect(page.locator('h1')).toContainText('Delhi to Nainital Taxi Service');
    await expect(page.getByText('One-Way & Round-Trip Taxi Service').first()).toBeVisible();

    // Sticky Sidebar Booking Widget
    await expect(page.getByText('Need Help Booking?')).toBeVisible();

    // 1. Route Map Card
    await expect(page.getByRole('heading', { name: /Route Map/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Map' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Satellite' })).toBeVisible();

    // 2. Key Route Metrics
    await expect(page.getByRole('heading', { name: /Key Route Metrics/ })).toBeVisible();
    await expect(page.getByText('via NH9').first()).toBeVisible();

    // 3. Quick Route Highlights
    await expect(page.getByRole('heading', { name: /Quick Route Highlights/ })).toBeVisible();

    // 4. Available Vehicle Fares
    await expect(page.getByRole('heading', { name: /Available Vehicle Fares/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sedan' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'SUV / MPV' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Innova Crysta' })).toBeVisible();

    // 5. Places Along the Route
    await expect(page.getByRole('heading', { name: /Places Along the Route/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /All Stops/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Restaurants & Dhabas/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /CNG Stations/ })).toBeVisible();

    // 6. Milestones + Weather & Travel Tips
    await expect(page.getByRole('heading', { name: /Distance & Route Milestones/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Weather in Nainital & Travel Tips/ })).toBeVisible();

    // 7. Route & Fleet Gallery
    await expect(page.getByRole('heading', { name: /Route & Fleet Gallery/ })).toBeVisible();

    // 8. Frequently Asked Questions
    await expect(page.getByRole('heading', { name: /Frequently Asked Questions/ })).toBeVisible();

    // 9. Popular Related Outstation Taxi Corridors
    await expect(page.getByRole('heading', { name: /Popular Related Outstation Taxi Corridors/ })).toBeVisible();

    // 10. Protected Footer Credit
    await expect(page.locator('.footer-designer-credit')).toContainText('Designed by Mantsha Khan');

    // Desktop Screenshot
    await page.screenshot({
      path: 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f/route_page_original_style_desktop.png',
      fullPage: true,
    });

    // Mobile Viewport Check (390px)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Verify zero horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

    // Mobile Screenshot
    await page.screenshot({
      path: 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f/route_page_original_style_mobile.png',
      fullPage: true,
    });
  });
});
