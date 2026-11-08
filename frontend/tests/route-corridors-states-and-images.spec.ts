import { test, expect } from '@playwright/test';

test.describe('Route Corridors, State Association, Destination Images & Transparent Cars', () => {
  test('1. MMT Booking Widget & Universal Search display State names for locations & in autocomplete', async ({ page }) => {
    // 1. Visit route page where origin and destination are populated in MmtBookingWidget
    await page.goto('/routes/delhi-to-nainital-taxi');

    // Check origin input subtitle has state name
    const originCard = page.locator('#booking-pickup').locator('..');
    await expect(originCard).toContainText('Delhi NCR');

    // Check destination input subtitle has state name
    const destCard = page.locator('#booking-drop').locator('..');
    await expect(destCard).toContainText('Uttarakhand');

    // 2. Visit homepage and verify state search and badges in autocomplete
    await page.goto('/');

    const dropInput = page.locator('#booking-drop');
    await dropInput.fill('Nainital');

    const suggestion = page.locator('div:has-text("Nainital")').filter({ hasText: 'Uttarakhand' }).first();
    await expect(suggestion).toBeVisible();
    await expect(suggestion).toContainText('Uttarakhand');
  });

  test('2. Route Page Hero contains Scenic Destination Visual & Transparent Car', async ({ page }) => {
    await page.goto('/routes/delhi-to-nainital-taxi');

    // Verify State Corridor Pill in Hero
    const corridorPill = page.locator('div.rounded-full:has-text("Highway Corridor")').first();
    await expect(corridorPill).toBeVisible();
    await expect(corridorPill).toContainText('Uttarakhand');

    // Verify Scenic Destination Image in Hero Background
    const heroBgImg = page.locator('section img[alt*="Nainital Scenic Landmark"]');
    await expect(heroBgImg).toBeVisible();
    const src = await heroBgImg.getAttribute('src');
    expect(src).toContain('nainital.webp');

    // Verify Transparent Car in Hero
    const heroCarImg = page.locator('section img[src*="hero-transparent.webp"]');
    await expect(heroCarImg).toBeVisible();

    // Verify Route Places section does not fall back to car image for food
    const placesSection = page.locator('#places-along-route');
    await expect(placesSection).toBeVisible();
    await expect(placesSection).toContainText('Restaurants & Dhabas');
    await expect(placesSection).toContainText('Bikanervala');

    // Ensure restaurant images don't contain dzire/car
    const restaurantImages = placesSection.locator('a[href*="maps"] img');
    const firstImgSrc = await restaurantImages.first().getAttribute('src');
    expect(firstImgSrc).not.toContain('dzire.webp');
  });

  test('3. Universal Dynamic Resolution resolves any valid route without 404', async ({ page }) => {
    const response = await page.goto('/routes/delhi-to-kainchi-dham-taxi');
    expect(response?.status()).toBe(200);

    // Verify page content rendered
    await expect(page.locator('h1')).toContainText('Delhi to Kainchi Dham Taxi');
    await expect(page.locator('body')).toContainText('Uttarakhand Highway Corridor');

    // Check Kainchi Dham authentic destination photo was used
    const heroBg = page.locator('section img[alt*="Kainchi Dham Scenic Landmark"]');
    await expect(heroBg).toBeVisible();
    const src = await heroBg.getAttribute('src');
    expect(src).toContain('kainchi-dham.webp');
  });

  test('4. Protected Footer Designer Credit is permanently intact', async ({ page }) => {
    await page.goto('/');

    const footerCredit = page.locator('.footer-designer-credit');
    await expect(footerCredit).toBeVisible();

    const spanText = await footerCredit.locator('span').textContent();
    const strongText = await footerCredit.locator('strong').textContent();

    expect(spanText?.trim()).toBe('Designed by');
    expect(strongText?.trim()).toBe('Mantsha Khan');
  });
});
