import { test, expect } from '@playwright/test';

test.describe('Phase 4: Internal Linking & Navigation Tests', () => {

  test('1. Homepage Fleet Carousel Cards have valid, non-404 destinations', async ({ page }) => {
    await page.goto('/');
    
    // Select all fleet carousel "View Details" links
    const fleetSlider = page.locator('#fleet');
    await expect(fleetSlider).toBeVisible();

    const viewDetailsLinks = fleetSlider.locator('a:has-text("View Details")');
    const count = await viewDetailsLinks.count();
    expect(count).toBe(12);

    const expectedHrefs = [
      '/fleet/hatchback',
      '/fleet/sedan',
      '/fleet/suv-muv',
      '/fleet/executive-suv',
      '/tempo-traveller',
      '/tempo-traveller',
      '/tempo-traveller',
      '/tempo-traveller',
      '/tempo-traveller',
      '/tempo-traveller',
      '/bus-charter',
      '/bus-charter'
    ];

    for (let i = 0; i < count; i++) {
      const href = await viewDetailsLinks.nth(i).getAttribute('href');
      expect(href).toBe(expectedHrefs[i]);
    }
  });

  test('2. Route page map anchor target exists and scrolls smoothly', async ({ page }) => {
    await page.goto('/routes/delhi-to-jaipur-taxi');

    // Verify #route-map exists in the DOM
    const mapSection = page.locator('#route-map');
    await expect(mapSection).toBeAttached();

    // Verify both "View on Map" links exist with href="#route-map"
    const timelineMapLink = page.locator('a:has-text("View on Map ↑")');
    await expect(timelineMapLink).toHaveAttribute('href', '#route-map');

    const weatherMapLink = page.locator('a:has-text("View Route on Map")');
    await expect(weatherMapLink).toHaveAttribute('href', '#route-map');

    // Click map link and assert section is attached and reachable
    await timelineMapLink.click();
    await page.waitForTimeout(500);
    await expect(mapSection).toBeAttached();
  });

  test('3. Desktop Header Services dropdown contains all 9 services', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    const servicesNav = page.locator('nav.hidden.lg\\:flex div.relative.group:has-text("Services")');
    await expect(servicesNav).toBeVisible();

    const dropdown = servicesNav.locator('div.absolute');
    
    // Check all 9 services in desktop dropdown
    const expectedServices = [
      { text: 'All Services Overview', href: '/services' },
      { text: 'NCR Taxi Service', href: '/taxi-service' },
      { text: 'Airport Transfers', href: '/airport-transfers' },
      { text: 'Local Rentals', href: '/local-rentals' },
      { text: 'Corporate Taxi', href: '/corporate-taxi' },
      { text: 'Tempo Traveller', href: '/tempo-traveller' },
      { text: 'Bus Charter', href: '/bus-charter' },
      { text: 'Chardham Yatra', href: '/chardham-yatra' },
      { text: 'Tour Packages', href: '/tour-packages' },
    ];

    for (const item of expectedServices) {
      const link = dropdown.locator(`a[href="${item.href}"]`);
      await expect(link).toContainText(item.text);
    }
  });

  test('4. Mobile Header Services menu contains all 9 services and expands without clipping', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Click Hamburger
    const hamburgerBtn = page.locator('button[aria-label="Toggle Navigation Menu"]');
    await hamburgerBtn.click();

    // Click Services accordion button
    const servicesAccordionBtn = page.locator('button:has-text("Services")');
    await expect(servicesAccordionBtn).toBeVisible();
    await servicesAccordionBtn.click();

    const expectedServices = [
      { text: 'All Services Overview', href: '/services' },
      { text: 'NCR Taxi Service', href: '/taxi-service' },
      { text: 'Airport Transfers', href: '/airport-transfers' },
      { text: 'Local Rentals', href: '/local-rentals' },
      { text: 'Corporate Taxi', href: '/corporate-taxi' },
      { text: 'Tempo Traveller', href: '/tempo-traveller' },
      { text: 'Bus Charter', href: '/bus-charter' },
      { text: 'Chardham Yatra', href: '/chardham-yatra' },
      { text: 'Tour Packages', href: '/tour-packages' },
    ];

    // Scope to the mobile drawer (lg:hidden)
    const mobileDrawer = page.locator('.lg\\:hidden.absolute');
    for (const item of expectedServices) {
      const link = mobileDrawer.locator(`a[href="${item.href}"]:has-text("${item.text}")`);
      await expect(link).toBeVisible();
    }
  });

  test('5. Footer navigation Our Services contains all required services with valid hrefs', async ({ page }) => {
    await page.goto('/');

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    const expectedFooterServices = [
      { text: 'Outstation Cabs', href: '/routes' },
      { text: 'Airport Transfers', href: '/airport-transfers' },
      { text: 'Local Rentals', href: '/local-rentals' },
      { text: 'Corporate Taxi', href: '/corporate-taxi' },
      { text: 'Tempo Traveller', href: '/tempo-traveller' },
      { text: 'Bus Charter', href: '/bus-charter' },
      { text: 'Chardham Yatra', href: '/chardham-yatra' },
      { text: 'Tour Packages', href: '/tour-packages' },
    ];

    for (const item of expectedFooterServices) {
      const link = footer.locator(`a[href="${item.href}"]:has-text("${item.text}")`);
      await expect(link).toBeAttached();
    }

    // Verify protected designer credit
    const credit = footer.locator('.footer-designer-credit');
    await expect(credit).toBeVisible();
    await expect(credit.locator('span')).toHaveText('Designed by ');
    await expect(credit.locator('strong')).toHaveText('Mantsha Khan');
  });

  test('6. HTTP 200 verification for modified navigation targets', async ({ request }) => {
    const targets = [
      '/fleet/hatchback',
      '/fleet/sedan',
      '/fleet/suv-muv',
      '/fleet/executive-suv',
      '/tempo-traveller',
      '/bus-charter',
      '/chardham-yatra',
      '/airport-transfers',
      '/routes'
    ];

    for (const target of targets) {
      const res = await request.get(target);
      expect(res.status(), `Target ${target} should return 200 OK`).toBe(200);
    }
  });

});
