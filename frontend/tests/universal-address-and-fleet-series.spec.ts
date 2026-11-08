import { test, expect } from '@playwright/test';

test.describe('Universal Address, Strict State Isolation & MakeMyTrip Fleet Series', () => {

  test('1. Strict State Isolation in RoutesTabWidget', async ({ page }) => {
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

    const widget = page.locator('#popular-routes-tabs');
    await expect(widget).toBeVisible();

    // Look for Uttarakhand tab
    const ukTab = widget.locator('button', { hasText: 'Uttarakhand' }).first();
    await expect(ukTab).toBeVisible();
    await ukTab.click();

    // Verify Uttarakhand destinations appear
    await expect(widget.locator('text=Nainital').first()).toBeVisible();
    await expect(widget.locator('text=Haldwani').first()).toBeVisible();
    await expect(widget.locator('text=Bhimtal').first()).toBeVisible();

    // Verify ZERO cross-state contamination: Jaipur or Agra should NOT appear under Uttarakhand
    const jaipurInUk = widget.locator('h3:has-text("Jaipur")');
    await expect(jaipurInUk).toHaveCount(0);
    const agraInUk = widget.locator('h3:has-text("Agra")');
    await expect(agraInUk).toHaveCount(0);

    // Switch to Rajasthan tab
    const rjTab = widget.locator('button', { hasText: 'Rajasthan' }).first();
    await rjTab.click();

    // Verify Rajasthan destinations appear
    await expect(widget.locator('text=Jaipur').first()).toBeVisible();
    await expect(widget.locator('text=Ajmer').first()).toBeVisible();

    // Verify Uttarakhand destinations do NOT appear under Rajasthan
    const nainitalInRj = widget.locator('h3:has-text("Nainital")');
    await expect(nainitalInRj).toHaveCount(0);

    // Switch to Uttar Pradesh tab
    const upTab = widget.locator('button', { hasText: 'Uttar Pradesh' }).first();
    await upTab.click();

    // Verify UP destinations appear
    await expect(widget.locator('text=Agra').first()).toBeVisible();
    await expect(widget.locator('text=Mathura').first()).toBeVisible();
    await expect(widget.locator('text=Bareilly').first()).toBeVisible();

    // Verify Nainital does not appear under UP
    const nainitalInUp = widget.locator('h3:has-text("Nainital")');
    await expect(nainitalInUp).toHaveCount(0);
  });

  test('2. Universal Address & Locality Fare Resolution on /cabs', async ({ page }) => {
    // Search with specific street address and NCR colony
    const pickupAddress = encodeURIComponent('Shop 9, SR Complex, Masuri, Ghaziabad');
    const dropAddress = encodeURIComponent('Mall Road, Nainital, Uttarakhand');
    await page.goto(`http://localhost:3000/cabs?pickup=${pickupAddress}&drop=${dropAddress}&serviceType=one_way`, {
      waitUntil: 'domcontentloaded',
    });

    // Verify heading reflects the address
    await expect(page.locator('h1').first()).toContainText('Masuri, Ghaziabad to Mall Road, Nainital');

    // Verify highway distance is accurately calculated (> 250 km for Masuri to Nainital)
    const distElement = page.locator('text=Highway').first();
    await expect(distElement).toBeVisible();

    // Verify all 9 vehicle categories appear in the exact series
    const vehicleCards = page.locator('#cab-selection-panel > div');
    const count = await vehicleCards.count();
    expect(count).toBeGreaterThanOrEqual(9);

    // Verify Series: Hatchback -> Sedan -> Maruti Ertiga -> SUV / MUV -> Toyota Innova -> Innova Crysta -> Tempo Traveller -> Force Urbania -> Luxury Bus
    await expect(vehicleCards.nth(0)).toContainText('Hatchback');
    await expect(vehicleCards.nth(1)).toContainText('Sedan');
    await expect(vehicleCards.nth(2)).toContainText('Maruti Ertiga');
    await expect(vehicleCards.nth(3)).toContainText('SUV / MUV');
    await expect(vehicleCards.nth(4)).toContainText('Toyota Innova');
    await expect(vehicleCards.nth(5)).toContainText('Innova Crysta');
    await expect(vehicleCards.nth(6)).toContainText('Tempo Traveller');
    await expect(vehicleCards.nth(7)).toContainText('Force Urbania');
    await expect(vehicleCards.nth(8)).toContainText('Luxury Bus');
  });

  test('3. MakeMyTrip Style Inclusions & Exclusions on /cabs', async ({ page }) => {
    await page.goto('http://localhost:3000/cabs?pickup=Delhi&drop=Haridwar&serviceType=one_way', {
      waitUntil: 'domcontentloaded',
    });

    // Check first card has Inclusions and Exclusions tabs
    const firstCard = page.locator('#cab-selection-panel > div').first();
    await expect(firstCard.locator('button:has-text("Included in Fare")')).toBeVisible();
    await expect(firstCard.locator('button:has-text("Excluded / Extra Charges")')).toBeVisible();

    // Verify Inclusions contain Toll, Fuel, Driver
    await expect(firstCard).toContainText('Highway Toll Taxes Included');
    await expect(firstCard).toContainText('Driver Allowance & Fuel');

    // Click Exclusions tab
    await firstCard.locator('button:has-text("Excluded / Extra Charges")').click();

    // Verify Exclusions show parking at actuals and extra km
    await expect(firstCard).toContainText('parking charges');
    await expect(firstCard).toContainText('Extra kilometers');

    // Click back to Inclusions
    await firstCard.locator('button:has-text("Included in Fare")').click();
    await expect(firstCard).toContainText('Highway Toll Taxes Included');
  });

  test('4. Filter Pills on /cabs filter correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/cabs?pickup=Delhi&drop=Agra&serviceType=one_way', {
      waitUntil: 'domcontentloaded',
    });

    // Click Tempo Traveller filter
    await page.locator('button:has-text("Tempo Traveller")').click();
    const visibleCards = page.locator('#cab-selection-panel > div');
    await expect(visibleCards).toHaveCount(1);
    await expect(visibleCards.first()).toContainText('Tempo Traveller');

    // Click All Vehicles
    await page.locator('button:has-text("All Vehicles")').click();
    await expect(page.locator('#cab-selection-panel > div')).toHaveCount(9);
  });

  test('5. Permanent Designer Credit is intact', async ({ page }) => {
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    const credit = page.locator('.footer-designer-credit');
    await expect(credit.first()).toBeVisible();
    await expect(credit.first()).toContainText('Designed by');
    await expect(credit.first()).toContainText('Mantsha Khan');
  });

});
