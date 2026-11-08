import { test } from '@playwright/test';

test('Capture Screenshots of Updated Features', async ({ page }) => {
  // 1. Desktop Cabs page with address and MakeMyTrip Inclusions & Exclusions
  await page.setViewportSize({ width: 1440, height: 900 });
  const pickup = encodeURIComponent('Shop 9, SR Complex, Masuri, Ghaziabad');
  const drop = encodeURIComponent('Mall Road, Nainital, Uttarakhand');
  await page.goto(`http://localhost:3000/cabs?pickup=${pickup}&drop=${drop}&serviceType=one_way`, {
    waitUntil: 'networkidle',
  });
  await page.screenshot({
    path: 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f/cabs_universal_address_fleet_desktop.png',
    fullPage: false,
  });

  // 2. Click Exclusions tab on first card and screenshot
  const firstCard = page.locator('#cab-selection-panel > div').first();
  await firstCard.locator('button:has-text("Excluded / Extra Charges")').click();
  await page.waitForTimeout(300);
  await page.screenshot({
    path: 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f/cabs_exclusions_tab_desktop.png',
    fullPage: false,
  });

  // 3. Homepage State-by-State Popular Routes Tabs (Uttarakhand)
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  const widget = page.locator('#popular-routes-tabs');
  await widget.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({
    path: 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f/popular_routes_isolated_uk_tabs.png',
    fullPage: false,
  });

  // 4. Click Rajasthan Tab and screenshot
  await widget.locator('button:has-text("Rajasthan")').click();
  await page.waitForTimeout(300);
  await page.screenshot({
    path: 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f/popular_routes_isolated_rj_tabs.png',
    fullPage: false,
  });
});
