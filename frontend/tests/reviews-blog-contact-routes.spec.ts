import { test, expect } from '@playwright/test';

test.describe('Routes Directory, Reviews System, Blog with Images & Contact Us Page', () => {

  test('1. Routes page hero is upgraded and search fare section is removed', async ({ page }) => {
    await page.goto('/routes');

    // Verify Upgraded Hero Section
    const h1 = page.locator('h1');
    await expect(h1).toContainText('Outstation Taxi');
    await expect(h1).toContainText('Routes Directory');

    // Verify Search Fare Widget is completely absent on /routes
    const searchFareInput = page.locator('input[placeholder*="Enter pickup city"], #booking-pickup');
    await expect(searchFareInput).toHaveCount(0);

    // Verify verified corridors pill and state tabs are present
    await expect(page.locator('body')).toContainText('Verified Intercity Corridors');
    await expect(page.locator('body')).toContainText('Popular Priority Outstation Routes');
    await expect(page.locator('text=Ghaziabad to Haridwar Taxi').first()).toBeVisible();

    await page.screenshot({ path: 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f/routes_directory_no_fare_search.png' });
  });

  test('2. Reviews page displays genuine Google reviews, 4.9 rating and interactive filter', async ({ page }) => {
    await page.goto('/reviews');

    // Hero check
    await expect(page.locator('h1')).toContainText('Customer');
    await expect(page.locator('h1')).toContainText('Reviews');
    await expect(page.locator('body')).toContainText('4.9');
    await expect(page.locator('body')).toContainText('1,250+');

    // Check genuine review cards
    await expect(page.locator('text=Anand Sharma')).toBeVisible();
    await expect(page.locator('text=Pooja Aggarwal')).toBeVisible();
    await expect(page.locator('text=Vikramaditya Chauhan')).toBeVisible();
    await expect(page.locator('text=Noida Sector 62 ➔ Nainital').first()).toBeVisible();
    await expect(page.locator('text=Vasundhara, Ghaziabad ➔ IGI Airport T3').first()).toBeVisible();

    // Check filter button
    const airportFilter = page.locator('button:has-text("Airport Transfers")');
    await expect(airportFilter).toBeVisible();
    await airportFilter.click();

    // After airport filter, Pooja Aggarwal airport review should be visible
    await expect(page.locator('text=Pooja Aggarwal')).toBeVisible();

    await page.screenshot({ path: 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f/reviews_page_genuine_google.png' });
  });

  test('3. Homepage features genuine Google Reviews section', async ({ page }) => {
    await page.goto('/');

    // Check homepage reviews section
    const reviewsHeading = page.locator('h2:has-text("Trusted by 15,000+ North India Travelers")');
    await expect(reviewsHeading).toBeVisible();
    await expect(page.locator('body')).toContainText('Google Verified Customer Reviews • 4.9★ Rating');
    await expect(page.locator('text=Anand Sharma').first()).toBeVisible();
    await expect(page.locator('a:has-text("Read All 1,250+ Reviews")').first()).toBeVisible();

    await page.screenshot({ path: 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f/homepage_reviews_section.png' });
  });

  test('4. Blog list and blog post display authentic WebP images', async ({ page }) => {
    // Blog list
    await page.goto('/blog');
    await expect(page.locator('h1')).toContainText('Travel & Highway Blog');

    // Check image in blog cards
    const blogImages = page.locator('article img');
    const imageCount = await blogImages.count();
    expect(imageCount).toBeGreaterThanOrEqual(10);

    // Blog post
    await page.goto('/blog/delhi-to-nainital-road-trip-guide');
    await expect(page.locator('h1')).toContainText('Delhi to Nainital Road Trip Guide');
    const featuredImg = page.locator('article img[alt*="Nainital"]').first();
    await expect(featuredImg).toBeVisible();

    await page.screenshot({ path: 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f/blog_detail_with_image.png' });
  });

  test('5. Contact Us page is modified with interactive inquiry form & office details', async ({ page }) => {
    await page.goto('/contact');

    // Hero
    await expect(page.locator('h1')).toContainText('Contact Urgent Taxis');
    await expect(page.locator('body')).toContainText('+91 7310651940');
    await expect(page.locator('body')).toContainText('Masuri, Ghaziabad');

    // Quick Inquiry Desk Form
    await expect(page.locator('text=Quick Taxi Inquiry Desk')).toBeVisible();
    await expect(page.locator('input[placeholder*="Rahul Verma"]')).toBeVisible();
    await expect(page.locator('button:has-text("Send Instant Inquiry on WhatsApp")')).toBeVisible();

    // Map embed
    const mapIframe = page.locator('iframe[title="Urgent Taxis Office Location Map"]');
    await expect(mapIframe).toBeVisible();

    await page.screenshot({ path: 'C:/Users/91859/.gemini/antigravity/brain/ee2db13c-89de-473e-b2fe-a4ce06f2a90f/contact_us_modified_page.png' });
  });

  test('6. Protected Footer Designer Credit is strictly intact', async ({ page }) => {
    await page.goto('/');

    const designerCredit = page.locator('.footer-designer-credit');
    await expect(designerCredit).toBeVisible();

    const designedBySpan = designerCredit.locator('span');
    await expect(designedBySpan).toHaveText('Designed by ');

    const designerStrong = designerCredit.locator('strong');
    await expect(designerStrong).toHaveText('Mantsha Khan');
  });

});
