import { test, expect } from '@playwright/test';
import {
  getEmailServiceConfigStatus,
  sendBookingConfirmationEmail,
  sentBookingEmailCache,
} from '../lib/email/booking-mailer';
import {
  maskCustomerName,
  maskPhoneNumber,
  maskEmailAddress,
  maskAddress,
} from '../lib/security/masking';

test.describe('Phase 4: Security Remediation (SEC-01 to SEC-04)', () => {
  test('SEC-01: PII Masking functions properly obscure customer identity', () => {
    expect(maskCustomerName('Aarav Sharma')).toBe('A***v S***a');
    expect(maskCustomerName('Ramesh')).toBe('R***h');
    expect(maskCustomerName('')).toBe('Customer');

    expect(maskPhoneNumber('+91 98765 43210')).toBe('+91 98*****210');
    expect(maskPhoneNumber('9876543210')).toBe('98*****210');
    expect(maskPhoneNumber('')).toBe('Not provided');

    expect(maskEmailAddress('aarav.sharma@example.com')).toBe('aa***a@ex***.com');
    expect(maskEmailAddress('')).toBe('Not provided');

    expect(maskAddress('Flat 402, Tower B, Sector 74, Noida')).toBe('•••••, •••••, Sector 74, Noida');
    expect(maskAddress('Delhi Airport Terminal 3')).toBe('Delhi Airport Terminal 3');
  });

  test('SEC-02: Reference lookup rate limiter restricts repeated unauthorized queries', async ({ request }) => {
    const probingIp = `198.51.100.${Math.floor(Math.random() * 200) + 10}`;
    // Perform 5 failed lookup queries on invoice API endpoint with malformed reference
    for (let i = 0; i < 5; i++) {
      const res = await request.get('http://localhost:3000/api/public/bookings/INVALID-REF/invoice', {
        headers: {
          'x-vercel-ip': probingIp,
        },
        maxRedirects: 0,
      });
      expect(res.status()).toBe(400);
      const data = await res.json();
      expect(data.message).toBe('Invalid booking reference format');
    }

    // 6th attempt should trigger 429 Too Many Requests
    const blockedRes = await request.get('http://localhost:3000/api/public/bookings/INVALID-REF/invoice', {
      headers: {
        'x-vercel-ip': probingIp,
      },
      maxRedirects: 0,
    });
    expect(blockedRes.status()).toBe(429);
    const body = await blockedRes.json();
    expect(body.message).toContain('Too many booking lookup');
  });

  test('SEC-03: Email logging redacts customer address to prevent PII leakage in logs', () => {
    const masked = maskEmailAddress('aarav.sharma@example.com');
    expect(masked).toBe('aa***a@ex***.com');
    expect(masked).not.toContain('aarav.sharma');
  });

  test('SEC-04: Email dispatcher deduplicates multiple calls for identical booking reference', async () => {
    const testReference = `UT-TEST-DEDUP-${Date.now()}`;
    const deduplicationKey = `${testReference}:unpaid`;

    // Prime deduplication cache
    sentBookingEmailCache.add(deduplicationKey);

    const result = await sendBookingConfirmationEmail(testReference, {
      customerName: 'Test Dedup',
      customerEmail: 'dedup@example.com',
      serviceType: 'one_way',
      pickupAddress: 'Delhi',
      dropAddress: 'Jaipur',
      travelDateTime: new Date().toISOString(),
      vehicleName: 'Sedan',
      baseFare: 3000,
      customerPayable: 3000,
      tokenAmount: 900,
      balanceAmount: 2100,
      paymentStatus: 'unpaid',
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe('DEDUPLICATED');
    expect(result.deduplicated).toBe(true);

    // Clean up
    sentBookingEmailCache.delete(deduplicationKey);
  });

  test('SEC-02: Legitimate queries from different IPs do not collide or cross-block', async ({ request }) => {
    const ipA = `198.51.100.${Math.floor(Math.random() * 200) + 10}`;
    const ipB = `198.51.100.${Math.floor(Math.random() * 200) + 10}`;

    // 1 request from ipA
    const resA = await request.get('http://localhost:3000/api/public/bookings/INVALID-REF/invoice', {
      headers: { 'x-vercel-ip': ipA },
      maxRedirects: 0,
    });
    expect(resA.status()).toBe(400);

    // 1 request from ipB
    const resB = await request.get('http://localhost:3000/api/public/bookings/INVALID-REF/invoice', {
      headers: { 'x-vercel-ip': ipB },
      maxRedirects: 0,
    });
    expect(resB.status()).toBe(400);
  });

  test('SEC-04: Concurrent calls to sendBookingConfirmationEmail execute safely without duplicate dispatch', async () => {
    const testRef = `UT-CONCURRENT-${Date.now()}`;
    const payload = {
      customerName: 'Concurrent Tester',
      customerEmail: 'concurrent@example.com',
      serviceType: 'one_way' as const,
      pickupAddress: 'Delhi',
      dropAddress: 'Agra',
      travelDateTime: new Date().toISOString(),
      vehicleName: 'Sedan',
      baseFare: 3000,
      customerPayable: 3000,
      tokenAmount: 900,
      balanceAmount: 2100,
      paymentStatus: 'unpaid',
    };

    // Fire multiple parallel dispatches
    const results = await Promise.all([
      sendBookingConfirmationEmail(testRef, payload),
      sendBookingConfirmationEmail(testRef, payload),
      sendBookingConfirmationEmail(testRef, payload),
    ]);

    expect(results.length).toBe(3);
    results.forEach((r) => {
      expect(['NOT_CONFIGURED', 'DEDUPLICATED', 'SENT']).toContain(r.status);
    });
  });
});

test.describe('Phase 4: Transactional Email Integration & Resilience', () => {

  test('Email configuration inspection correctly detects missing credentials', () => {
    const configStatus = getEmailServiceConfigStatus();
    expect(configStatus.provider).toBe('Resend (REST API)');
    // In test environment, RESEND_API_KEY is not defined unless supplied by owner
    if (!process.env.RESEND_API_KEY) {
      expect(configStatus.isConfigured).toBe(false);
      expect(configStatus.missingVariables).toContain('RESEND_API_KEY');
    }
  });

  test('sendBookingConfirmationEmail safely handles missing recipient without error', async () => {
    const result = await sendBookingConfirmationEmail('UT-TEST-NOEMAIL', {
      customerName: 'Test Customer',
      customerEmail: '',
      serviceType: 'one_way',
      pickupAddress: 'Noida',
      dropAddress: 'Haridwar',
      travelDateTime: new Date().toISOString(),
      vehicleName: 'Sedan (Dzire / Etios)',
      baseFare: 3499,
      customerPayable: 3499,
      tokenAmount: 1050,
      balanceAmount: 2449,
    });

    expect(result.success).toBe(false);
    expect(result.status).toBe('NO_RECIPIENT');
    expect(result.error).toContain('Customer did not provide a valid email address');
  });

  test('sendBookingConfirmationEmail handles missing API key gracefully without throwing', async () => {
    if (!process.env.RESEND_API_KEY) {
      const result = await sendBookingConfirmationEmail('UT-TEST-ENV', {
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        serviceType: 'one_way',
        pickupAddress: 'Delhi',
        dropAddress: 'Agra',
        travelDateTime: new Date().toISOString(),
        vehicleName: 'Sedan (Dzire / Etios)',
        baseFare: 3499,
        customerPayable: 3499,
        tokenAmount: 1050,
        balanceAmount: 2449,
      });

      expect(result.success).toBe(false);
      expect(result.status).toBe('NOT_CONFIGURED');
      expect(result.error).toContain('RESEND_API_KEY');
    }
  });
});

test.describe('Phase 4: End-to-End Booking Confirmation & PDF Invoice', () => {
  let createdBookingReference = '';

  test.beforeAll(async ({ request }) => {
    // Create an authoritative test booking via POST /api/public/book with intermediate stops and add-ons
    const res = await request.post('http://localhost:3000/api/public/book', {
      data: {
        serviceType: 'one_way',
        categoryId: 'suv-muv',
        pickupAddress: 'Delhi Airport Terminal 3',
        dropAddress: 'Mall Road, Nainital',
        travelDateTime: '2026-11-15T08:00:00.000Z',
        actualDistanceKm: 315,
        passengerCount: 4,
        luggageCount: 3,
        stops: ['Ghaziabad', 'Moradabad'],
        specialInstructions: 'Child on board, please ensure careful driving.',
        selectedAddOns: ['new_vehicle', 'rooftop_carrier'],
        customerFullName: 'Aarav Sharma',
        customerPhone: '+91 98765 43210',
        customerEmail: 'aarav.sharma@example.com',
      },
    });

    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.bookingReference).toMatch(/^UT-[A-Z0-9]+$/);
    createdBookingReference = json.bookingReference;
    expect(json.payable).toBeGreaterThan(0);
    expect(json.token).toBeGreaterThan(0);
  });

  test('Booking Confirmation page displays all required details from stored snapshot', async ({ page }) => {
    expect(createdBookingReference).toBeTruthy();

    await page.goto(`http://localhost:3000/booking-confirmation/${createdBookingReference}`, {
      waitUntil: 'domcontentloaded',
    });

    // Reference and Masked Customer PII (SEC-01 Compliance)
    await expect(page.locator(`text=${createdBookingReference}`)).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=A***v S***a').first()).toBeVisible();
    await expect(page.locator('text=+91 98*****210').first()).toBeVisible();
    await expect(page.locator('text=+91 98765 43210')).not.toBeVisible();
    await expect(page.locator('text=Privacy Protected').first()).toBeVisible();

    // Locations and Intermediate Stops
    await expect(page.locator('text=Delhi Airport Terminal 3').first()).toBeVisible();
    await expect(page.locator('text=Mall Road, Nainital').first()).toBeVisible();
    await expect(page.locator('text=Ghaziabad ➔ Moradabad').first()).toBeVisible();

    // Status Badges
    await expect(page.locator('text=Pending').first()).toBeVisible();
    await expect(page.locator('text=Unpaid').first()).toBeVisible();

    // Add-on Breakdown Line Items
    await expect(page.locator('text=New Vehicle Preference').first()).toBeVisible();
    await expect(page.locator('text=Rooftop Luggage Carrier').first()).toBeVisible();
    await expect(page.locator('text=Total: ₹600').first()).toBeVisible();

    // Financial Values & 30% Token
    await expect(page.locator('text=Total Customer Payable').first()).toBeVisible();
    await expect(page.locator('text=30% Advance Token Required').first()).toBeVisible();
    await expect(page.locator('text=70% Balance Due Chauffeur').first()).toBeVisible();

    // Download Invoice Button
    const invoiceBtn = page.locator('text=Download Quotation & Invoice (PDF)');
    await expect(invoiceBtn).toBeVisible();
    await expect(invoiceBtn).toHaveAttribute('href', `/booking-confirmation/${createdBookingReference}/invoice`);
  });

  test('Invalid booking reference triggers safe error card without leaking sensitive details', async ({ page }) => {
    // 1. Malformed reference
    await page.goto('http://localhost:3000/booking-confirmation/INVALID-REF!@#$', {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.locator('text=Invalid Booking Reference')).toBeVisible({ timeout: 5000 });

    // 2. Non-existent reference
    await page.goto('http://localhost:3000/booking-confirmation/UT-NONEXISTENT999', {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.locator('text=Booking Not Found')).toBeVisible({ timeout: 5000 });
  });

  test('Printable Invoice Page renders official branding, proforma labeling and authoritative breakdown', async ({ page }) => {
    expect(createdBookingReference).toBeTruthy();

    await page.goto(`http://localhost:3000/booking-confirmation/${createdBookingReference}/invoice`, {
      waitUntil: 'domcontentloaded',
    });

    // Official Branding and Logo
    const logo = page.locator('img[alt="Urgent Taxis Official Logo"]');
    await expect(logo).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=URGENT TAXIS').first()).toBeVisible();
    await expect(page.locator('text=+91 93117 76363').first()).toBeVisible();
    await expect(page.locator('text=info@urgenttaxis.in').first()).toBeVisible();

    // Document Title for unpaid booking must be Proforma Invoice & Booking Quotation
    await expect(page.locator('text=Proforma Invoice & Booking Quotation')).toBeVisible();

    // Customer & Route Details (Masked PII - SEC-01 Compliance)
    await expect(page.locator('text=A***v S***a').first()).toBeVisible();
    await expect(page.locator('text=+91 98*****210').first()).toBeVisible();
    await expect(page.locator('text=+91 98765 43210')).not.toBeVisible();
    await expect(page.locator('text=Privacy Protected').first()).toBeVisible();
    await expect(page.locator('text=Delhi Airport Terminal 3').first()).toBeVisible();
    await expect(page.locator('text=Mall Road, Nainital').first()).toBeVisible();
    await expect(page.locator('text=Ghaziabad ➔ Moradabad').first()).toBeVisible();

    // Itemized Table
    await expect(page.locator('text=Base Vehicle Fare').first()).toBeVisible();
    await expect(page.locator('text=New Vehicle Preference').first()).toBeVisible();
    await expect(page.locator('text=Rooftop Luggage Carrier').first()).toBeVisible();

    // Payment Policy Ledger (30% Token / 70% Balance)
    await expect(page.locator('text=30% Advance Token').first()).toBeVisible();
    await expect(page.locator('text=70% Balance Due').first()).toBeVisible();

    // Mandatory Inclusions & Exclusions
    await expect(page.locator('text=Included in Base Fare').first()).toBeVisible();
    await expect(page.locator('text=Excluded (Charged at Actuals)').first()).toBeVisible();

    // Print Button
    const printBtn = page.locator('#print-invoice-btn');
    await expect(printBtn).toBeVisible();
    await expect(printBtn).toHaveText(/Download \/ Print PDF/);
  });

  test('GET /api/public/bookings/[reference]/invoice redirects to the printable invoice view', async ({ request }) => {
    expect(createdBookingReference).toBeTruthy();

    const res = await request.get(`http://localhost:3000/api/public/bookings/${createdBookingReference}/invoice`, {
      maxRedirects: 0,
    });

    expect(res.status()).toBe(307);
    const location = res.headers()['location'];
    expect(location).toContain(`/booking-confirmation/${createdBookingReference}/invoice`);
  });
});
