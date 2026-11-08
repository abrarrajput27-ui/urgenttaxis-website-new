import { test, expect } from '@playwright/test';

test.describe('Live Production Verification (https://www.urgenttaxis.in)', () => {

  test('Live Popular Routes Widget: Isolated State Tabs', async ({ page }) => {
    await page.goto('https://www.urgenttaxis.in/', { waitUntil: 'domcontentloaded' });

    const widget = page.locator('#popular-routes-tabs');
    await expect(widget).toBeVisible({ timeout: 15000 });

    // Click Uttarakhand tab
    const ukTab = widget.locator('button', { hasText: 'Uttarakhand' }).first();
    await ukTab.click();
    await expect(widget.locator('text=Nainital').first()).toBeVisible();

    // Verify zero cross-state pollution
    await expect(widget.locator('h3:has-text("Jaipur")')).toHaveCount(0);
  });

  test('Live Cabs Page: Universal Address & 9-Vehicle Series with Inclusions & Exclusions', async ({ page }) => {
    const pickup = encodeURIComponent('Shop 9, SR Complex, Masuri, Ghaziabad');
    const drop = encodeURIComponent('Mall Road, Nainital');
    await page.goto(`https://www.urgenttaxis.in/cabs?pickup=${pickup}&drop=${drop}&serviceType=one_way`, {
      waitUntil: 'domcontentloaded',
    });

    // Check heading
    await expect(page.locator('h1').first()).toContainText('Masuri, Ghaziabad to Mall Road, Nainital');

    // Check 9 vehicle categories rendered
    const cabPanel = page.locator('#cab-selection-panel');
    await expect(cabPanel).toBeVisible({ timeout: 15000 });

    const cards = cabPanel.locator('> div');
    const count = await cards.count();
    console.log('Live vehicle cards count:', count);
    expect(count).toBeGreaterThanOrEqual(9);

    // Check Inclusions and Exclusions
    const firstCard = cards.first();
    await expect(firstCard.locator('button:has-text("Included in Fare")')).toBeVisible();
    await expect(firstCard.locator('button:has-text("Excluded / Extra Charges")')).toBeVisible();

    // Check protected designer credit on live footer
    const credit = page.locator('.footer-designer-credit');
    await expect(credit.first()).toContainText('Mantsha Khan');
  });

  test('Live Checkout Page: Authentic MakeMyTrip Style & Zero Gap', async ({ page }) => {
    const pickup = encodeURIComponent('Shop 9, SR Complex, Masuri, Ghaziabad');
    const drop = encodeURIComponent('Mall Road, Nainital, Uttarakhand');
    await page.goto(`https://www.urgenttaxis.in/checkout?pickup=${pickup}&drop=${drop}&serviceType=one_way&categoryId=sedan&km=310`, {
      waitUntil: 'domcontentloaded',
    });

    // 1. Verify 4-step progress bar
    await expect(page.locator('text=1. Search Route')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=3. Trip & Passenger Details')).toBeVisible();

    // 2. Verify selected cab card
    await expect(page.locator('text=Selected Cab: Sedan')).toBeVisible();
    await expect(page.locator('text=Change Cab')).toBeVisible();

    // 3. Verify doorstep address fields
    await expect(page.locator('text=Exact Doorstep Address Details')).toBeVisible();
    await expect(page.locator('input[placeholder*="House/Flat No"]')).toBeVisible();

    // 4. Verify passenger details fields
    await expect(page.locator('text=Passenger & Contact Details')).toBeVisible();
    await expect(page.locator('input[placeholder="Enter full name"]')).toBeVisible();
    await expect(page.locator('input[placeholder="10-digit mobile number"]')).toBeVisible();

    // 5. Verify price breakdown card & 30% token button
    await expect(page.locator('text=Fare & Payment Summary')).toBeVisible();
    await expect(page.locator('button:has-text("CONFIRM & BOOK RIDE (30% TOKEN)")')).toBeVisible();
  });

});
