import { test } from '@playwright/test';

test('Capture Screenshots of MakeMyTrip Checkout Details Page', async ({ page }) => {
  // 1. Desktop Checkout View
  await page.setViewportSize({ width: 1440, height: 900 });
  const pickup = encodeURIComponent('Shop 9, SR Complex, Masuri, Ghaziabad');
  const drop = encodeURIComponent('Mall Road, Nainital, Uttarakhand');
  await page.goto(`http://localhost:3000/checkout?pickup=${pickup}&drop=${drop}&serviceType=one_way&categoryId=sedan&km=310&date=2026-11-08&time=09:00`, {
    waitUntil: 'networkidle',
  });
  await page.screenshot({
    path: 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f/checkout_mmt_desktop_verified.png',
    fullPage: false,
  });

  // 2. Mobile Checkout View
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`http://localhost:3000/checkout?pickup=${pickup}&drop=${drop}&serviceType=one_way&categoryId=sedan&km=310&date=2026-11-08&time=09:00`, {
    waitUntil: 'networkidle',
  });
  await page.screenshot({
    path: 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f/checkout_mmt_mobile_verified.png',
    fullPage: false,
  });
});
