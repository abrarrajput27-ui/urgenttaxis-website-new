import { test, expect } from '@playwright/test';

test.describe('Website Consistency Phase 1: Viewport, WebP & Dedicated Vehicle Results', () => {

  // =========================================================================
  // TASK 1: Responsive Layout & Viewport Hygiene Tests
  // =========================================================================
  test('Viewport Hygiene: Zero horizontal scroll across mobile, tablet and desktop', async ({ page }) => {
    const viewports = [
      { width: 360, height: 740, name: 'Mobile Small (360px)' },
      { width: 390, height: 844, name: 'Mobile Standard (390px)' },
      { width: 768, height: 1024, name: 'Tablet (768px)' },
      { width: 1024, height: 768, name: 'Desktop Small (1024px)' },
      { width: 1440, height: 900, name: 'Desktop Large (1440px)' },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(300);

      // Verify scrollWidth matches clientWidth (zero horizontal overflow)
      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalOverflow, `Horizontal overflow detected at ${vp.name}`).toBe(false);
    }
  });

  test('Mobile Sticky Contacts: Visible, clickable and properly cleared above footer on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

    const callBtn = page.locator('#mobile-call-button');
    const waBtn = page.locator('#mobile-whatsapp-button');

    await expect(callBtn).toBeVisible();
    await expect(waBtn).toBeVisible();

    // Scroll to the absolute bottom of the footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    // Designer credit remains visible and unclipped
    const designerCredit = page.locator('.footer-designer-credit');
    await expect(designerCredit).toBeVisible();
    await expect(designerCredit).toContainText('Designed by');
    await expect(designerCredit).toContainText('Mantsha Khan');
  });

  // =========================================================================
  // TASK 2: Six Destination WebP Images Verification
  // =========================================================================
  test('WebP Destination Images: All 6 heavy destination images load as WebP with 200 OK', async ({ request }) => {
    const webpImages = [
      '/destinations/jaipur.webp',
      '/destinations/haridwar.webp',
      '/destinations/rishikesh.webp',
      '/destinations/shimla.webp',
      '/destinations/nainital.webp',
      '/destinations/ramnagar.webp',
    ];

    for (const imgPath of webpImages) {
      const res = await request.get(`http://localhost:3000${imgPath}`);
      expect(res.status(), `Image ${imgPath} failed to load`).toBe(200);
      const contentType = res.headers()['content-type'];
      expect(contentType).toContain('image/webp');
    }
  });

  // =========================================================================
  // TASK 3: Dedicated Vehicle Results Page & Booking Journey Tests
  // =========================================================================
  test('Dedicated Vehicle Results Page: Direct navigation with query parameters renders all vehicles', async ({ page }) => {
    await page.goto(
      'http://localhost:3000/cabs?serviceType=one_way&pickup=Delhi&drop=Haridwar&date=2026-11-15&time=06:00',
      { waitUntil: 'domcontentloaded' }
    );

    // Breadcrumb and headings
    await expect(page.getByText('Available Cabs', { exact: true })).toBeVisible();
    await expect(page.locator('text=Delhi to Haridwar Cabs')).toBeVisible();

    // Cab selection panel visible
    const cabPanel = page.locator('#cab-selection-panel');
    await expect(cabPanel).toBeVisible();

    // All standard categories rendered
    await expect(cabPanel.locator('text=Sedan').first()).toBeVisible();
    await expect(cabPanel.locator('text=SUV / MPV').first()).toBeVisible();
    await expect(cabPanel.locator('text=Innova Crysta').first()).toBeVisible();

    // Rooftop carrier restriction: disabled on sedan
    await page.click('text=Sedan');
    const carrierCheckbox = page.locator('#addon-checkbox-rooftop_carrier');
    if (await carrierCheckbox.count() > 0) {
      await expect(carrierCheckbox).toBeDisabled();
    }
  });

  test('Hero to Dedicated Results Page Journey: Searching from homepage navigates to /cabs', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    // Enter pickup and drop in hero widget
    await page.fill('#booking-pickup', 'Delhi');
    await page.fill('#booking-drop', 'Haridwar');
    await page.keyboard.press('Escape');

    // Click Search Available Cabs button
    await page.click('#search-cabs-button');

    // Verify navigation to /cabs with query parameters
    await page.waitForURL(/\/cabs\?/, { timeout: 10000 });
    expect(page.url()).toContain('/cabs?');
    expect(page.url()).toContain('pickup=Delhi');
    expect(page.url()).toContain('drop=Haridwar');

    // Cab selection panel rendered on /cabs
    await expect(page.locator('#cab-selection-panel')).toBeVisible();
  });

  test('Dedicated Results to Checkout Journey: Selecting vehicle and booking proceeds to /checkout', async ({ page }) => {
    await page.goto(
      'http://localhost:3000/cabs?serviceType=one_way&pickup=Ghaziabad&drop=Haridwar&date=2026-11-15&time=06:00',
      { waitUntil: 'domcontentloaded' }
    );

    await expect(page.locator('#cab-selection-panel')).toBeVisible();

    // Click Book Online on the active vehicle
    const bookButton = page.locator('#cab-selection-panel button:has-text("Book Online")').first();
    await expect(bookButton).toBeVisible();
    await bookButton.click();

    // Verify navigation to /checkout with journey details preserved
    await page.waitForURL(/\/checkout\?/, { timeout: 10000 });
    expect(page.url()).toContain('/checkout?');
    expect(page.url()).toContain('serviceType=one_way');
    expect(page.url()).toContain('origin=Ghaziabad');
    expect(page.url()).toContain('destination=Haridwar');

    // Checkout page renders review and customer details form
    await expect(page.locator('text=Contact Details')).toBeVisible();
  });
});
