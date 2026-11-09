import { test, expect } from '@playwright/test';
import { generateWhatsAppLink } from '../lib/whatsapp';
import { buildWhatsAppBookingLink } from '../lib/pricing';
import { BUSINESS_CONFIG } from '../lib/config';
import { SITE_CONFIG } from '../lib/seo';
import { buildAirportWhatsAppMessage } from '../app/(public)/airport-transfers/[slug]/page';

test.describe('Phase 3: WhatsApp Integration & Consistency Verification', () => {
  // ---------------------------------------------------------------------------
  // 1. Generator Unit Tests
  // ---------------------------------------------------------------------------
  test('generateWhatsAppLink: default destination is official WhatsApp 918595066033', () => {
    const link = generateWhatsAppLink({});
    expect(link.startsWith('https://wa.me/918595066033?text=')).toBe(true);
  });

  test('generateWhatsAppLink: prevents double greeting when customMessage has greeting', () => {
    const link = generateWhatsAppLink({
      customMessage: 'Hello Urgent Taxis! 👋\n\nI would like to make an inquiry. ✨',
    });
    const decoded = decodeURIComponent(link);
    const greetingMatches = decoded.match(/Hello\s+Urgent\s+Taxis/gi);
    expect(greetingMatches?.length).toBe(1);
    expect(decoded).toContain('Hello Urgent Taxis! 👋');
  });

  test('generateWhatsAppLink: adds customer note when customMessage is provided', () => {
    const link = generateWhatsAppLink({
      customMessage: 'I need a cab for tomorrow morning.',
    });
    const decoded = decodeURIComponent(link);
    expect(decoded).toContain('URGENT TAXIS');
    expect(decoded).toContain('I need a cab for tomorrow morning.');
  });

  test('generateWhatsAppLink: formats currency using ₹ and avoids customer PII', () => {
    const link = generateWhatsAppLink({
      tripType: 'One Way',
      pickup: 'Ghaziabad',
      drop: 'Haridwar',
      baseFare: 3000,
      totalFare: 3500,
      tokenAmount: 1050,
      balanceAmount: 2450,
    });
    const decoded = decodeURIComponent(link);
    expect(decoded).toContain('₹3,500');
    expect(decoded).toContain('₹1,050');
    expect(decoded).toContain('₹2,450');
    // Ensure no PII placeholders
    expect(decoded).not.toMatch(/@/);
  });

  test('buildWhatsAppBookingLink: routes strictly to 918595066033 with ₹ currency', () => {
    const link = buildWhatsAppBookingLink({
      serviceType: 'One-way',
      vehicleName: 'Sedan',
      origin: 'Masuri, Ghaziabad',
      destination: 'IGI Airport T3',
      travelDate: '15 Nov 2026',
      travelTime: '10:00 AM',
      estimatedFare: 1800,
      pageUrl: 'https://www.urgenttaxis.in',
    });
    const decoded = decodeURIComponent(link);
    expect(decoded.startsWith('https://wa.me/918595066033?text=')).toBe(true);
    expect(decoded).toContain('₹1,800');
    expect(decoded).not.toContain('917310651940');
    expect(decoded).toContain('URGENT TAXIS');
  });

  test('Airport Message Generator: Scenario 1 - All details supplied (flight and date/time)', () => {
    const msg = buildAirportWhatsAppMessage({
      vehicleName: 'AC Sedan (Dzire / Etios)',
      origin: 'Ghaziabad',
      destination: 'Delhi IGI Airport',
      fare: 1300,
      capacity: 'Up to 4 passengers',
      flightDetails: 'AI-102 (Terminal 3)',
      travelDate: '15 Nov 2026',
      travelTime: '06:00 AM',
    });
    expect(msg).toContain('• Flight / Terminal: AI-102 (Terminal 3)');
    expect(msg).toContain('• Travel Date & Time: 15 Nov 2026, 06:00 AM');
    expect(msg).toContain('Please confirm cab availability and driver assignment.');
    expect(msg).not.toContain('[');
    expect(msg).not.toContain(']');
  });

  test('Airport Message Generator: Scenario 2 - Flight details missing', () => {
    const msg = buildAirportWhatsAppMessage({
      vehicleName: 'Maruti Ertiga',
      origin: 'Ghaziabad',
      destination: 'Delhi IGI Airport',
      fare: 1800,
      capacity: 'Up to 6 passengers',
      travelDate: '15 Nov 2026',
      travelTime: '06:00 AM',
    });
    expect(msg).not.toContain('• Flight / Terminal:');
    expect(msg).toContain('• Travel Date & Time: 15 Nov 2026, 06:00 AM');
    expect(msg).toContain('Please let me know cab availability. I will provide my flight number and terminal (T1/T2/T3).');
    expect(msg).not.toContain('[');
    expect(msg).not.toContain(']');
  });

  test('Airport Message Generator: Scenario 3 - Travel date/time missing', () => {
    const msg = buildAirportWhatsAppMessage({
      vehicleName: 'Toyota Innova Crysta',
      origin: 'Ghaziabad',
      destination: 'Delhi IGI Airport',
      fare: 2500,
      capacity: 'Up to 7 passengers',
      flightDetails: '6E-204 (T2)',
    });
    expect(msg).toContain('• Flight / Terminal: 6E-204 (T2)');
    expect(msg).not.toContain('• Travel Date & Time:');
    expect(msg).toContain('Please let me know cab availability. I will provide my pickup date and time.');
    expect(msg).not.toContain('[');
    expect(msg).not.toContain(']');
  });

  test('Airport Message Generator: Scenario 4 - All optional details missing', () => {
    const msg = buildAirportWhatsAppMessage({
      vehicleName: 'AC Sedan (Dzire / Etios)',
      origin: 'Ghaziabad',
      destination: 'Delhi IGI Airport',
      fare: 1300,
      capacity: 'Up to 4 passengers',
    });
    expect(msg).not.toContain('• Flight / Terminal:');
    expect(msg).not.toContain('• Travel Date & Time:');
    expect(msg).toContain('Please let me know cab availability. I will provide my flight number, terminal (T1/T2/T3), and pickup time.');
    expect(msg).not.toContain('[');
    expect(msg).not.toContain(']');
  });

  // ---------------------------------------------------------------------------
  // 2. Integration / DOM Tests on Key Pages
  // ---------------------------------------------------------------------------
  test('Homepage: All WhatsApp links route to 918595066033 and Call buttons route to 7310651940', async ({ page }) => {
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });

    // Check all WhatsApp links on page
    const whatsappLinks = await page.locator('a[href*="wa.me"]').all();
    expect(whatsappLinks.length).toBeGreaterThan(0);

    for (const link of whatsappLinks) {
      const href = await link.getAttribute('href');
      expect(href).toContain('wa.me/918595066033');
      expect(href).not.toContain('wa.me/917310651940');

      const decoded = decodeURIComponent(href || '');
      const greetings = decoded.match(/Hello\s+Urgent\s+Taxis/gi);
      if (greetings) {
        expect(greetings.length).toBeLessThanOrEqual(1);
      }
    }

    // Check all Phone/Call buttons
    const telLinks = await page.locator('a[href^="tel:"]').all();
    expect(telLinks.length).toBeGreaterThan(0);
    for (const tel of telLinks) {
      const href = await tel.getAttribute('href');
      expect(href).toContain('7310651940');
      expect(href).not.toContain('8595066033');
    }
  });

  test('Contact Page: WhatsApp button routes to 918595066033 and Phone helpline routes to 7310651940', async ({ page }) => {
    await page.goto('http://localhost:3000/contact', { waitUntil: 'domcontentloaded' });

    const whatsappLink = page.locator('a[href*="wa.me"]').first();
    const waHref = await whatsappLink.getAttribute('href');
    expect(waHref).toContain('wa.me/918595066033');
    expect(waHref).not.toContain('917310651940');

    const phoneLink = page.locator('a[href^="tel:"]').first();
    const telHref = await phoneLink.getAttribute('href');
    expect(telHref).toContain('7310651940');
  });

  test('Fleet Page: Vehicle cards include enriched context (vehicle name, seating, rates)', async ({ page }) => {
    await page.goto('http://localhost:3000/fleet', { waitUntil: 'domcontentloaded' });

    // Target WhatsApp buttons inside vehicle cards (excluding header/footer)
    const cardWhatsAppLinks = await page.locator('main .grid a[href*="wa.me"]').all();
    expect(cardWhatsAppLinks.length).toBeGreaterThan(4);

    for (const link of cardWhatsAppLinks) {
      const href = await link.getAttribute('href');
      expect(href).toContain('wa.me/918595066033');
      const decoded = decodeURIComponent(href || '');
      const greetings = decoded.match(/Hello\s+Urgent\s+Taxis/gi);
      if (greetings) {
        expect(greetings.length).toBe(1);
      }
      expect(decoded).toContain('Seating Capacity:');
      expect(decoded).toContain('Outstation Rate:');
    }
  });

  test('Fleet Category Page: CTA contains category, seating, and published rate', async ({ page }) => {
    await page.goto('http://localhost:3000/fleet/sedan', { waitUntil: 'domcontentloaded' });

    const ctaWaLink = page.locator('section a[href*="wa.me"]').last();
    const href = await ctaWaLink.getAttribute('href');
    expect(href).toContain('wa.me/918595066033');
    const decoded = decodeURIComponent(href || '');
    expect(decoded).toContain('Sedan');
    expect(decoded).toContain('4 Seats');
    expect(decoded).toContain('₹12/km');
  });

  test('Airport Transfer Page: Vehicle cards render clean natural message without literal bracket placeholders', async ({ page }) => {
    await page.goto('http://localhost:3000/airport-transfers/delhi-airport-to-ghaziabad', { waitUntil: 'domcontentloaded' });

    // Target the 3 fixed fare vehicle cards in the rates grid
    const fixedRateCards = await page.locator('a:has-text("Book Sedan"), a:has-text("Book Ertiga"), a:has-text("Book Innova Crysta")').all();
    expect(fixedRateCards.length).toBe(3);

    for (const link of fixedRateCards) {
      const href = await link.getAttribute('href');
      expect(href).toContain('wa.me/918595066033');
      const decoded = decodeURIComponent(href || '');
      expect(decoded).toContain('Please let me know cab availability. I will provide my flight number, terminal (T1/T2/T3), and pickup time.');
      expect(decoded).toContain('Fixed Fare: ₹');
      // Assert zero literal square bracket placeholders appear in generated message
      expect(decoded).not.toContain('[Specify');
      expect(decoded).not.toContain('[Specify date & time]');
      const greetings = decoded.match(/Hello\s+Urgent\s+Taxis/gi);
      if (greetings) {
        expect(greetings.length).toBe(1);
      }
    }
  });

  test('MobileStickyBar: WhatsApp button points to 918595066033 and Call points to 7310651940', async ({ page }) => {
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });

    const mobileCall = page.locator('#mobile-call-button');
    const callHref = await mobileCall.getAttribute('href');
    expect(callHref).toBe('tel:+917310651940');

    const mobileWa = page.locator('#mobile-whatsapp-button');
    const waHref = await mobileWa.getAttribute('href');
    expect(waHref).toContain('https://wa.me/918595066033');
  });
});
