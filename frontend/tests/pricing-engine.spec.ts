import { test, expect } from '@playwright/test';
import {
  calculateAdvanceToken,
  calculateRoundTripFare,
  calculateLocalRentalFare,
  resolveOneWayFare,
  resolveAirportFare,
  buildWhatsAppBookingLink,
} from '../lib/pricing';

test.describe('Phase 1: Master Pricing Engine Unit Tests', () => {

  test('Advance Token Calculation: Ghaziabad to Haridwar Sedan (Rs 3,499)', () => {
    const token = calculateAdvanceToken(3499, 30);
    // 3499 * 0.30 = 1049.7 -> rounded to nearest 10 is 1050
    expect(token).toBe(1050);
  });

  test('Advance Token Calculation: Delhi to Haridwar Sedan (Rs 3,999)', () => {
    const token = calculateAdvanceToken(3999, 30);
    // 3999 * 0.30 = 1199.7 -> rounded to nearest 10 is 1200
    expect(token).toBe(1200);
  });

  test('Local Rental Derived: Sedan 12h/120km (1500 + 40*11 + 4*180 = Rs 2,660)', () => {
    const rental = calculateLocalRentalFare('12h120km', 'sedan');
    expect(rental.basePrice).toBe(2660);
    expect(rental.extraKmRate).toBe(11);
    expect(rental.extraHourRate).toBe(180);
    expect(rental.tokenAmount).toBe(800); // 2660 * 0.30 = 798 -> 800
    expect(rental.balanceAmount).toBe(1860);
  });

  test('Local Rental: Sedan 8h/80km is Rs 1,500 with 30% advance', () => {
    const rental = calculateLocalRentalFare('8h80km', 'sedan');
    expect(rental.basePrice).toBe(1500);
    expect(rental.tokenAmount).toBe(450);
    expect(rental.balanceAmount).toBe(1050);
  });

  test('Local Rental: SUV 8h/80km is Rs 2,000 and 12h/120km is Rs 3,480', () => {
    const rental8h = calculateLocalRentalFare('8h80km', 'suv-muv');
    expect(rental8h.basePrice).toBe(2000);
    expect(rental8h.tokenAmount).toBe(600);

    const rental12h = calculateLocalRentalFare('12h120km', 'suv-muv');
    expect(rental12h.basePrice).toBe(3480);
    expect(rental12h.tokenAmount).toBe(1040); // 3480 * 0.30 = 1044 -> 1040
  });

  test('Round Trip: Delhi to Agra (220 km one-way, 1 day, Sedan)', () => {
    // 220 km * 2 = 440 km round trip. Guaranteed min km = 250 km. Billable = 440 km.
    // Base = 440 * 11 = 4840. Driver allowance = 400. Total = 5240.
    const rt = calculateRoundTripFare(220, 1, 'sedan');
    expect(rt.billableKm).toBe(440);
    expect(rt.baseFare).toBe(4840);
    expect(rt.totalDriverAllowance).toBe(400);
    expect(rt.totalFare).toBe(5240);
    expect(rt.tokenAmount).toBe(1570); // 5240 * 0.30 = 1572 -> 1570
    expect(rt.workingExplanation).toContain('Billable 440 km × ₹11/km + Driver Allowance ₹400');
  });

  test('Round Trip: Minimum Daily Guarantee Applied (100 km one-way, 2 days, Sedan)', () => {
    // Total km = 200. Guaranteed = 250 * 2 = 500 km. Billable = 500 km.
    // Base = 500 * 11 = 5500. Driver allowance = 800. Total = 6300.
    const rt = calculateRoundTripFare(100, 2, 'sedan');
    expect(rt.billableKm).toBe(500);
    expect(rt.totalFare).toBe(6300);
    expect(rt.tokenAmount).toBe(1890); // 6300 * 0.30 = 1890
  });

  test('Master Route Resolution: Ghaziabad to Haridwar', () => {
    const q = resolveOneWayFare('Ghaziabad', 'Haridwar');
    expect(q).not.toBeNull();
    expect(q!.sedanFare).toBe(3499);
    expect(q!.ertigaFare).toBe(4499);
    expect(q!.crystaFare).toBe(8999);
    expect(q!.startsAt).toBe(3499);
    expect(q!.isFixed).toBe(true);
  });

  test('Master Route Resolution: Delhi to Haridwar', () => {
    const q = resolveOneWayFare('Delhi', 'Haridwar');
    expect(q).not.toBeNull();
    expect(q!.sedanFare).toBe(3999);
    expect(q!.startsAt).toBe(3999);
  });

  test('Airport Route Resolution: Delhi to IGI Airport', () => {
    const q = resolveAirportFare('delhi-to-igi-airport');
    expect(q).not.toBeNull();
    expect(q!.sedanFare).toBeGreaterThan(0);
    expect(q!.startsAt).toBe(q!.sedanFare);
  });

  test('Unmapped Route: Never returns "Price on request"', () => {
    const q = resolveOneWayFare('UnmappedCityA', 'UnmappedCityB', 180);
    expect(q).not.toBeNull();
    expect(q!.requiresWhatsAppQuote).toBe(true);
    expect(q!.sedanFare).toBe(0);
  });

  test('WhatsApp Link Generation: Clean formatting without duplicate greeting', () => {
    const url = buildWhatsAppBookingLink({
      serviceType: 'One-way',
      vehicleName: 'Sedan',
      origin: 'Ghaziabad',
      destination: 'Haridwar',
      travelDate: '12 Nov 2026',
      travelTime: '06:00 AM',
      estimatedFare: 3499,
      pageUrl: 'https://www.urgenttaxis.in/routes/ghaziabad-to-haridwar-taxi'
    });
    const decoded = decodeURIComponent(url);
    expect(decoded.startsWith('https://wa.me/917310651940?text=Hello Urgent Taxis, I want to book a Sedan.')).toBe(true);
    expect(decoded).toContain('Trip: One-way, Ghaziabad to Haridwar');
    expect(decoded).toContain('Estimated fare: Rs 3,499 (toll and parking extra)');
    expect(decoded).toContain('Please confirm availability, final fare and driver details.');
    const greetingMatches = decoded.match(/Hello Urgent Taxis/g);
    expect(greetingMatches?.length).toBe(1);
  });
});
