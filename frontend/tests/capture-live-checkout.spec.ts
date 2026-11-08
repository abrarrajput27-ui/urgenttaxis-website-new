import { test } from '@playwright/test';

test('Capture Live Production MakeMyTrip Checkout Details Page', async ({ page }) => {
  const pickup = encodeURIComponent('Shop 9, SR Complex, Masuri, Ghaziabad');
  const drop = encodeURIComponent('Mall Road, Nainital, Uttarakhand');
  const liveUrl = `https://www.urgenttaxis.in/checkout?pickup=${pickup}&drop=${drop}&serviceType=one_way&categoryId=sedan&km=310&date=2026-11-08&time=09:00`;

  // 1. Desktop Live View
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(liveUrl, { waitUntil: 'networkidle' });
  await page.screenshot({
    path: 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f/production_checkout_mmt_desktop.png',
    fullPage: false,
  });

  // 2. Mobile Live View
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(liveUrl, { waitUntil: 'networkidle' });
  await page.screenshot({
    path: 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f/production_checkout_mmt_mobile.png',
    fullPage: false,
  });
});
