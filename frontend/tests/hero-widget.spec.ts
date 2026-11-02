import { test, expect } from '@playwright/test';
import {
  resolveOneWayFare,
  calculateRoundTripFare,
  calculateLocalRentalFare,
  resolveAirportFare,
  calculateAdvanceToken,
  buildWhatsAppBookingLink,
} from '../lib/pricing';

test.describe('Phase 2: Hero Booking Widget Engine & Quote Resolution', () => {

  test('Pickup & Drop Empty Default Rule: Resolves null when either field is missing', () => {
    // When pickup or drop is empty, hero widget does not show premature vehicle cards
    const emptyOrigin = resolveOneWayFare('', 'Haridwar', 0);
    expect(emptyOrigin).toBeNull();

    const emptyDest = resolveOneWayFare('Ghaziabad', '', 0);
    expect(emptyDest).toBeNull();
  });

  test('Instant One-Way Fare Calculation: Ghaziabad to Haridwar returns fixed master fare', () => {
    const quote = resolveOneWayFare('Ghaziabad', 'Haridwar');
    expect(quote).not.toBeNull();
    expect(quote!.isFixed).toBe(true);
    expect(quote!.sedanFare).toBe(3499);
    
    // 30% Advance Token & 70% Balance
    const token = calculateAdvanceToken(quote!.sedanFare, 30);
    const balance = quote!.sedanFare - token;
    expect(token).toBe(1050);
    expect(balance).toBe(2449);

    // Toll estimated separately
    expect(quote!.estimatedToll).toBeGreaterThan(0);
  });

  test('Instant Round-Trip Fare: Ghaziabad to Jaipur (300 km one-way, 2 days)', () => {
    // Billable KM = max(300*2 = 600, 250*2 = 500) = 600 KM
    const rtSedan = calculateRoundTripFare(300, 2, 'sedan');
    expect(rtSedan.billableKm).toBe(600);
    expect(rtSedan.ratePerKm).toBe(11);
    // 600 * 11 + 400 * 2 = 6600 + 800 = 7400
    expect(rtSedan.totalFare).toBe(7400);
    expect(rtSedan.tokenAmount).toBe(2220); // 7400 * 0.30 = 2220
    expect(rtSedan.balanceAmount).toBe(5180);
  });

  test('Instant Local Rental: 8h/80km and 12h/120km packages are instant, never "On Request"', () => {
    const pkg8h = calculateLocalRentalFare('8h80km', 'sedan');
    expect(pkg8h.basePrice).toBe(1500);
    expect(pkg8h.tokenAmount).toBe(450);

    const pkg12h = calculateLocalRentalFare('12h120km', 'sedan');
    expect(pkg12h.basePrice).toBe(2660);
    expect(pkg12h.tokenAmount).toBe(800);
  });

  test('Instant Airport Transfer: Ghaziabad to IGI Airport', () => {
    const airportQuote = resolveAirportFare('Delhi IGI Airport', 'Ghaziabad');
    expect(airportQuote).not.toBeNull();
    expect(airportQuote!.sedanFare).toBeGreaterThanOrEqual(1199);
    expect(airportQuote!.isFixed).toBe(true);
  });

  test('Custom Unmapped Corridor: Returns transparent distance & WhatsApp quote flag, never "Price on request"', () => {
    const custom = resolveOneWayFare('RandomVillageX', 'RandomVillageY', 350);
    expect(custom).not.toBeNull();
    expect(custom!.requiresWhatsAppQuote).toBe(true);
    expect(custom!.distanceKm).toBe(350);
  });

  test('Clean WhatsApp Link Formatting for Booking Card', () => {
    const waUrl = buildWhatsAppBookingLink({
      serviceType: 'One-way',
      vehicleName: 'Sedan',
      origin: 'Ghaziabad',
      destination: 'Haridwar',
      travelDate: '2026-11-15',
      travelTime: '06:00',
      estimatedFare: 3499,
      pageUrl: 'https://www.urgenttaxis.in',
    });
    const decoded = decodeURIComponent(waUrl);
    expect(decoded).toContain('https://wa.me/917310651940?text=Hello Urgent Taxis, I want to book a Sedan.');
    expect(decoded).toContain('Trip: One-way, Ghaziabad to Haridwar');
    expect(decoded).toContain('Estimated fare: Rs 3,499 (toll and parking extra)');
    expect(decoded.match(/Hello Urgent Taxis/g)?.length).toBe(1);
  });
});
