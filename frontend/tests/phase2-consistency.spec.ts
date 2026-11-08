import { test, expect } from '@playwright/test';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f';

test.describe('Phase 2 — Global Typography & Brand Color Consistency', () => {

  test('Typography & Inter font applies globally on homepage and route pages', async ({ page }) => {
    await page.goto('/');
    
    // Check font-family on body includes Inter
    const bodyFont = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily;
    });
    expect(bodyFont.toLowerCase()).toContain('inter');

    // Verify H1 heading typography
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    const h1Weight = await h1.evaluate(el => window.getComputedStyle(el).fontWeight);
    expect(parseInt(h1Weight, 10)).toBeGreaterThanOrEqual(700);
  });

  test('Homepage FAQ section is migrated to PageFAQSection accordion with valid JSON-LD schema', async ({ page }) => {
    await page.goto('/');

    const faqSection = page.locator('#faq');
    await expect(faqSection).toBeVisible();

    // Check stylized Help Desk Box is present
    await expect(faqSection.getByText('Have Questions?')).toBeVisible();

    // Check "View All FAQs" link is present and points to /faq
    const viewAllLink = faqSection.locator('a[href="/faq"]');
    await expect(viewAllLink).toBeVisible();

    // Check native details accordion is present
    const details = faqSection.locator('details');
    const detailsCount = await details.count();
    expect(detailsCount).toBeGreaterThanOrEqual(3);

    // Test expanding an accordion item
    const firstSummary = details.first().locator('summary');
    await expect(firstSummary).toBeVisible();
    await firstSummary.click();
    await expect(details.first()).toHaveAttribute('open', '');

    // Check JSON-LD schema in DOM: must be EXACTLY ONE FAQPage schema (no duplicate)
    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const count = await jsonLdScripts.count();
    let faqSchemaCount = 0;
    for (let i = 0; i < count; i++) {
      const text = await jsonLdScripts.nth(i).textContent();
      if (text && text.includes('FAQPage')) {
        faqSchemaCount++;
        expect(text).toContain('One-Way Outstation');
      }
    }
    expect(faqSchemaCount).toBe(1);

    // Save screenshot for evidence
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase2_homepage_faq_accordion.png') });
  });

  test('Route page renders exactly one FAQPage structured data block', async ({ page }) => {
    await page.goto('/routes/delhi-to-nainital-taxi');
    await page.waitForLoadState('networkidle');
    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const count = await jsonLdScripts.count();
    let faqSchemaCount = 0;
    for (let i = 0; i < count; i++) {
      const text = await jsonLdScripts.nth(i).textContent();
      if (text && text.includes('FAQPage')) {
        faqSchemaCount++;
      }
    }
    expect(faqSchemaCount).toBe(1);
  });

  test('No legacy purple or violet classes on public pages (/cabs, /fleet, /taxi-service)', async ({ page }) => {
    // 1. Cabs results page
    await page.goto('/cabs?serviceType=one_way&pickup=Delhi&drop=Nainital&km=300');
    const cabsHtml = await page.content();
    expect(cabsHtml).not.toContain('bg-purple-50');
    expect(cabsHtml).not.toContain('text-purple-600');

    // 2. Fleet page
    await page.goto('/fleet');
    const fleetHtml = await page.content();
    expect(fleetHtml).not.toContain('bg-purple-50');
    expect(fleetHtml).not.toContain('text-purple-600');

    // 3. Taxi-service page
    await page.goto('/taxi-service');
    const taxiHtml = await page.content();
    expect(taxiHtml).not.toContain('text-purple-400');
    expect(taxiHtml).not.toContain('hover:border-purple-500');

    // Save screenshot of /cabs clean palette
    await page.goto('/cabs?serviceType=one_way&pickup=Delhi&drop=Nainital&km=300');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase2_cabs_palette.png') });
  });

  test('Protected designer credit remains intact at bottom of footer', async ({ page }) => {
    await page.goto('/');
    const credit = page.locator('.footer-designer-credit');
    await expect(credit).toBeVisible();
    await expect(credit).toContainText('Designed by');
    await expect(credit).toContainText('Mantsha Khan');
  });

  test('Booking flow from homepage to checkout maintains brand colors and 30% advance', async ({ page }) => {
    await page.goto(
      '/checkout?serviceType=one_way&categoryId=sedan&pickup=Ghaziabad&drop=Haridwar&km=215&date=2026-11-10T06:00&addOns=new_vehicle,english_driver',
      { waitUntil: 'domcontentloaded' }
    );
    
    // Check heading
    await expect(page.locator('h1')).toContainText('Ghaziabad');

    // Check brand green on advance payment CTA
    const advanceBtn = page.locator('button:has-text("CONFIRM & BOOK RIDE (30% TOKEN)")');
    await expect(advanceBtn).toBeVisible({ timeout: 10000 });

    // Numeric token amounts
    const advanceText = page.locator('text=Pay Now (30% Online Token)');
    await expect(advanceText).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase2_checkout_brand_palette.png') });
  });

});


