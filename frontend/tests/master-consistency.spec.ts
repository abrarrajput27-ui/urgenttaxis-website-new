import { test, expect } from '@playwright/test';

test.describe('Master Website Consistency & Functionality Verification', () => {
  const BASE_URL = 'http://127.0.0.1:3000';

  test('1. Protected Footer Designer Credit strictly preserved', async ({ page }) => {
    await page.goto(BASE_URL);
    const credit = page.locator('.footer-designer-credit');
    await expect(credit).toBeVisible();
    await expect(credit).toContainText('Designed by');
    await expect(credit).toContainText('Mantsha Khan');

    const spanWeight = await credit.locator('span').evaluate((el) => window.getComputedStyle(el).fontWeight);
    const strongWeight = await credit.locator('strong').evaluate((el) => window.getComputedStyle(el).fontWeight);
    
    expect(['400', 'normal']).toContain(spanWeight);
    expect(['700', 'bold']).toContain(strongWeight);
  });

  test('2. Official Contact Numbers verified across site', async ({ page }) => {
    await page.goto(BASE_URL);
    // WhatsApp links point to 918595066033
    const waLinks = page.locator('a[href*="wa.me"], a[href*="whatsapp.com"]');
    const waCount = await waLinks.count();
    expect(waCount).toBeGreaterThan(0);
    for (let i = 0; i < waCount; i++) {
      const href = await waLinks.nth(i).getAttribute('href');
      expect(href).toContain('918595066033');
    }

    // Call links point to 7310651940
    const callLinks = page.locator('a[href^="tel:"]');
    const callCount = await callLinks.count();
    expect(callCount).toBeGreaterThan(0);
    for (let i = 0; i < callCount; i++) {
      const href = await callLinks.nth(i).getAttribute('href');
      expect(href).toContain('7310651940');
    }
  });

  test('3. Shared PageFAQSection & Non-duplicate Schema on all pages', async ({ page }) => {
    const pagesToCheck = [
      '/',
      '/airport-transfers',
      '/local-rentals',
      '/services',
      '/airport-transfers/ghaziabad-to-delhi-airport',
      '/taxi-service/ghaziabad',
      '/blog/delhi-to-nainital-road-trip-guide'
    ];

    for (const path of pagesToCheck) {
      await page.goto(`${BASE_URL}${path}`);
      
      // Check FAQPage schema count
      const faqSchemas = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
        return scripts.filter(s => {
          try {
            const data = JSON.parse(s.textContent || '{}');
            return data['@type'] === 'FAQPage' || (Array.isArray(data['@graph']) && data['@graph'].some((g: any) => g['@type'] === 'FAQPage'));
          } catch {
            return false;
          }
        });
      });

      expect(faqSchemas.length).toBeLessThanOrEqual(1);
    }
  });

  test('4. WebP Image Assets deliver 200 OK responses', async ({ request }) => {
    const webpAssets = [
      '/cta-hero.webp',
      '/fleet-hero-bg.webp',
      '/fleet-brand/Ertiga.webp',
      '/fleet-brand/dzire.webp',
      '/fleet-brand/Innova Crysta.webp',
      '/destinations/jaipur.webp',
      '/destinations/haridwar.webp',
      '/destinations/nainital.webp',
      '/destinations/shimla.webp',
      '/services/local.webp',
      '/services/airport.webp',
    ];

    for (const asset of webpAssets) {
      const res = await request.get(`${BASE_URL}${asset}`);
      expect(res.status(), `Asset ${asset} failed with status ${res.status()}`).toBe(200);
      const contentType = res.headers()['content-type'];
      expect(contentType).toContain('image/webp');
    }
  });

  test('5. Touch Target Ergonomics & Button Sizes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE_URL);

    // Footer social icons
    const socialIcons = page.locator('footer a[aria-label]');
    const count = await socialIcons.count();
    for (let i = 0; i < count; i++) {
      const box = await socialIcons.nth(i).boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(38);
        expect(box.height).toBeGreaterThanOrEqual(38);
      }
    }
  });

  test('6. Complete Booking Funnel Navigation: Home -> Cabs -> Checkout', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    // Fill pickup and drop
    await page.fill('#booking-pickup', 'Delhi');
    await page.fill('#booking-drop', 'Haridwar');
    await page.keyboard.press('Escape');

    // Click search cabs
    await page.click('#search-cabs-button');

    // Must navigate to /cabs with query params
    await page.waitForURL(/\/cabs\?/, { timeout: 10000 });
    expect(page.url()).toContain('pickup=Delhi');
    expect(page.url()).toContain('drop=Haridwar');

    // Cab selection panel rendered
    await expect(page.locator('#cab-selection-panel')).toBeVisible();

    // Select first vehicle
    const bookButton = page.locator('#cab-selection-panel button:has-text("Book Online")').first();
    await expect(bookButton).toBeVisible();
    await bookButton.click();

    // Must navigate to /checkout with query params
    await page.waitForURL(/\/checkout\?/, { timeout: 10000 });
    expect(page.url()).toContain('/checkout?');
    expect(page.url()).toContain('origin=Delhi');
    expect(page.url()).toContain('destination=Haridwar');
  });
});
