import { test, expect } from '@playwright/test';

test.describe('Route Page Complete Layout & Feature Verification', () => {
  test('should render route page with all updated features, contained logo, and destination routes', async ({ page }) => {
    // 1. Desktop Viewport (1280px)
    await page.setViewportSize({ width: 1280, height: 900 });
    const response = await page.goto('http://localhost:3000/routes/delhi-to-nainital-taxi', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    expect(response?.status()).toBe(200);

    // 1. Header Logo Contained Test
    const headerBox = await page.locator('header').boundingBox();
    const logoBox = await page.locator('header img').boundingBox();
    expect(headerBox).not.toBeNull();
    expect(logoBox).not.toBeNull();
    if (headerBox && logoBox) {
      // Logo top must be >= header top, and logo bottom must be <= header bottom
      expect(logoBox.y).toBeGreaterThanOrEqual(headerBox.y);
      expect(logoBox.y + logoBox.height).toBeLessThanOrEqual(headerBox.y + headerBox.height);
    }

    // 2. Hero Section Verification
    await expect(page.locator('h1')).toContainText('Delhi to Nainital Taxi');
    await expect(page.getByText('One-way & Round Trip').first()).toBeVisible();
    await expect(page.getByText('310 km').first()).toBeVisible();
    await expect(page.getByText(/5 - 6 Hours/i).first()).toBeVisible();

    // Branded Car in Hero
    const heroCar = page.locator('section img[alt*="Fleet"]').first();
    await expect(heroCar).toBeVisible();

    // Hero Booking Bar elements
    await expect(page.locator('#pickup-input')).toHaveValue('Delhi');
    await expect(page.locator('#drop-input')).toHaveValue('Nainital');
    await expect(page.getByRole('button', { name: /Search Cabs/i })).toBeVisible();

    // 3. Top 3-Card Row
    await expect(page.getByRole('heading', { name: /Route Overview/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Route Map/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Cab Options & Fare/ })).toBeVisible();

    // Map Card controls
    await expect(page.getByRole('button', { name: 'Map' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Satellite' })).toBeVisible();
    await expect(page.locator('iframe[title*="Route Map"]')).toBeVisible();

    // 4. Cab Options & Fare
    await expect(page.getByRole('heading', { name: 'Hatchback' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sedan' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'SUV' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Innova Crysta' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tempo Traveller' })).toBeVisible();

    // 5. Places Along the Route with "+ Show More" Options
    await expect(page.getByText('Places on This Route').first()).toBeVisible();
    await expect(page.getByText('Haveli Restaurant').first()).toBeVisible();
    await expect(page.getByText('Indian Oil Petrol Pump').first()).toBeVisible();
    await expect(page.getByText('IOCL CNG Station').first()).toBeVisible();
    await expect(page.getByText('Naini Lake').first()).toBeVisible();

    // Expand "+ Show More" on restaurants
    const showMoreRestBtn = page.getByRole('button', { name: /\+ Show.*More Restaurants/i });
    if (await showMoreRestBtn.isVisible()) {
      await showMoreRestBtn.click();
      await expect(page.getByText('Bikanervala Highway Food Court')).toBeVisible();
    }

    // 6. Route Gallery
    await expect(page.getByRole('heading', { name: /Route Gallery/ })).toBeVisible();
    await expect(page.getByText('NH9 Highway View').first()).toBeVisible();

    // 7. Milestones & Weather / Travel Tips
    await expect(page.getByRole('heading', { name: /Distance & Route Details/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Weather in Nainital/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Travel Tips/ })).toBeVisible();

    // 8. Connecting Routes From Destination (NEW Section)
    await expect(page.getByRole('heading', { name: /Popular Cabs & Connecting Routes from Nainital/i })).toBeVisible();
    await expect(page.getByText(/Nainital → Delhi/i).first()).toBeVisible();

    // 9. FAQs (2-Column)
    await expect(page.getByText('Frequently Asked Questions').first()).toBeVisible();

    // 10. Similar Routes from Origin
    await expect(page.getByRole('heading', { name: /Similar Routes/ })).toBeVisible();
    await expect(page.getByText('From ₹3,999').first()).toBeVisible();

    // 11. Bottom CTA & Protected Footer Credit
    await expect(page.getByText('Plan Your Next Journey with Urgent Taxis')).toBeVisible();
    await expect(page.locator('.footer-designer-credit')).toContainText('Designed by Mantsha Khan');

    // Desktop Screenshot
    await page.screenshot({
      path: 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f/route_page_concept_desktop.png',
      fullPage: true,
    });

    // 12. Mobile Viewport Check (390px)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Verify zero horizontal overflow on mobile
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

    // Mobile Header Logo Contained Test
    const mobileHeader = await page.locator('header').boundingBox();
    const mobileLogo = await page.locator('header img').boundingBox();
    expect(mobileHeader).not.toBeNull();
    expect(mobileLogo).not.toBeNull();
    if (mobileHeader && mobileLogo) {
      expect(mobileLogo.y).toBeGreaterThanOrEqual(mobileHeader.y);
      expect(mobileLogo.y + mobileLogo.height).toBeLessThanOrEqual(mobileHeader.y + mobileHeader.height);
    }

    // Mobile Screenshot
    await page.screenshot({
      path: 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f/route_page_concept_mobile.png',
      fullPage: true,
    });
  });

  test('should render dehradun route with connecting routes from dehradun', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const response = await page.goto('http://localhost:3000/routes/delhi-to-dehradun-taxi', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toContainText('Delhi to Dehradun Taxi');
    await expect(page.getByRole('heading', { name: /Popular Cabs & Connecting Routes from Dehradun/i })).toBeVisible();
    await expect(page.getByText(/Robber.*s Cave/i).first()).toBeVisible();
    await expect(page.getByText(/Sahastradhara/i).first()).toBeVisible();
  });
});
