import { test, expect } from '@playwright/test';
import {
  calculateAdvanceToken,
  calculateRoundTripFare,
  calculateLocalRentalFare,
  resolveOneWayFare,
  resolveAirportFare,
  buildWhatsAppBookingLink,
  findVerifiedMasterRoute,
  getVerifiedRouteCorridorFare,
  validateAndNormalizeVehicleCategory,
  resolveCanonicalPlace,
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
    // Base = 440 * 14 = 6160. Driver allowance = 400. Total = 6560.
    const rt = calculateRoundTripFare(220, 1, 'sedan');
    expect(rt.billableKm).toBe(440);
    expect(rt.baseFare).toBe(6160);
    expect(rt.totalDriverAllowance).toBe(400);
    expect(rt.totalFare).toBe(6560);
    expect(rt.tokenAmount).toBe(1970); // 6560 * 0.30 = 1968 -> 1970
    expect(rt.workingExplanation).toContain('440 billable KM × ₹14/km + Driver Allowance ₹400');
  });

  test('Round Trip: Minimum Daily Guarantee Applied (100 km one-way, 2 days, Sedan)', () => {
    // Total km = 200. Guaranteed = 250 * 2 = 500 km. Billable = 500 km.
    // Base = 500 * 14 = 7000. Driver allowance = 800. Total = 7800.
    const rt = calculateRoundTripFare(100, 2, 'sedan');
    expect(rt.billableKm).toBe(500);
    expect(rt.totalFare).toBe(7800);
    expect(rt.tokenAmount).toBe(2340); // 7800 * 0.30 = 2340
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

  test('Universal Address Fare: Calculates dynamic distance-based fare for unmapped route', () => {
    const q = resolveOneWayFare('UnmappedCityA', 'UnmappedCityB', 180);
    expect(q).not.toBeNull();
    expect(q!.requiresWhatsAppQuote).toBe(false);
    expect(q!.sedanFare).toBeGreaterThan(0);
    expect(q!.distanceKm).toBe(180);
  });

  test('WhatsApp Link Generation: Bold, stylish, sectioned formatting with emojis', () => {
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
    expect(decoded.startsWith('https://wa.me/918595066033?text=')).toBe(true);
    expect(decoded).toContain('URGENT TAXIS');
    expect(decoded).toContain('TRIP DETAILS');
    expect(decoded).toContain('Ghaziabad');
    expect(decoded).toContain('Haridwar');
    expect(decoded).toContain('₹3,499');
    expect(decoded).toContain('+91 7310651940');
  });

  test('Phase 2.9: Reverse Route Policy - Forward matches but unseeded reverse falls back to generic', () => {
    // Delhi -> Mukteshwar exists forward
    const forward = findVerifiedMasterRoute(undefined, 'Delhi', 'Mukteshwar');
    expect(forward).not.toBeNull();

    // Mukteshwar -> Delhi has no explicit reverse record -> returns null
    const reverse = findVerifiedMasterRoute(undefined, 'Mukteshwar', 'Delhi');
    expect(reverse).toBeNull();

    // Client submitting forward routeId on reverse route is rejected
    const forcedForward = findVerifiedMasterRoute('delhi-to-mukteshwar-taxi', 'Mukteshwar', 'Delhi');
    expect(forcedForward).toBeNull();

    // Explicit directional pair preserves different fares
    const ddnForward = findVerifiedMasterRoute(undefined, 'Delhi', 'Dehradun');
    const ddnReverse = findVerifiedMasterRoute(undefined, 'Dehradun', 'Delhi');
    expect(ddnForward).not.toBeNull();
    expect(ddnReverse).not.toBeNull();
    expect(ddnForward!.sedanFare).toBe(3999);
    expect(ddnReverse!.sedanFare).toBe(3899);
  });

  test('Phase 2.9: Location Matching Security - Greater Noida and Noida strictly distinct', () => {
    expect(resolveCanonicalPlace('Greater Noida')).toBe('Greater Noida');
    expect(resolveCanonicalPlace('Pari Chowk, Greater Noida West')).toBe('Greater Noida');
    expect(resolveCanonicalPlace('Sector 62, Noida')).toBe('Noida');
    expect(resolveCanonicalPlace('Near Greater Noida Expressway, Sector 62, Noida')).toBe('AMBIGUOUS');

    // Noida to Agra matches corridor; Greater Noida to Agra must NOT match
    const noidaAgra = findVerifiedMasterRoute(undefined, 'Noida', 'Agra');
    expect(noidaAgra).not.toBeNull();
    expect(noidaAgra!.id).toBe('master-route-299');

    const grNoidaAgra = findVerifiedMasterRoute(undefined, 'Greater Noida', 'Agra');
    expect(grNoidaAgra).toBeNull();

    // Ambiguous address returns null
    const ambMatch = findVerifiedMasterRoute(undefined, 'Near Greater Noida Expressway, Sector 62, Noida', 'Agra');
    expect(ambMatch).toBeNull();
  });

  test('Phase 2.9: Strict Vehicle Category Validation - Reject invalid categories and enforce approved rates', () => {
    // Invalid categories
    expect(validateAndNormalizeVehicleCategory(undefined).isValid).toBe(false);
    expect(validateAndNormalizeVehicleCategory('').isValid).toBe(false);
    expect(validateAndNormalizeVehicleCategory('helicopter').isValid).toBe(false);
    expect(validateAndNormalizeVehicleCategory('rocket').isValid).toBe(false);

    // Approved rates
    expect(validateAndNormalizeVehicleCategory('hatchback').perKmRate).toBe(12);
    expect(validateAndNormalizeVehicleCategory('sedan').perKmRate).toBe(14);
    expect(validateAndNormalizeVehicleCategory('suv-muv').perKmRate).toBe(16);
    expect(validateAndNormalizeVehicleCategory('innova').perKmRate).toBe(20);
    expect(validateAndNormalizeVehicleCategory('executive-suv').perKmRate).toBe(24);
    expect(validateAndNormalizeVehicleCategory('tempo').perKmRate).toBe(26);
    expect(validateAndNormalizeVehicleCategory('urbania').perKmRate).toBe(32);
    expect(validateAndNormalizeVehicleCategory('bus').perKmRate).toBe(48);

    // Unsupported vehicle does NOT default to Sedan in corridor calculation
    const route = findVerifiedMasterRoute(undefined, 'Delhi', 'Haldwani')!;
    const badCorridor = getVerifiedRouteCorridorFare(route, 'helicopter');
    expect(badCorridor.isVerified).toBe(false);
    expect(badCorridor.fare).toBe(0);

    // Valid vehicle classes get their distinct fares
    const sedanCorridor = getVerifiedRouteCorridorFare(route, 'sedan');
    expect(sedanCorridor.isVerified).toBe(true);
    expect(sedanCorridor.fare).toBe(3999);

    const ertigaCorridor = getVerifiedRouteCorridorFare(route, 'suv-muv');
    expect(ertigaCorridor.isVerified).toBe(true);
    expect(ertigaCorridor.fare).toBe(4999);
  });
});