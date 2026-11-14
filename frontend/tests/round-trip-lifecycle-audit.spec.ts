import { test, expect } from '@playwright/test';
import { calculateRoundTripFare } from '../lib/pricing';
import { calculateReturnTimeline } from '../lib/date-utils';
import { generateWhatsAppLink } from '../lib/whatsapp';

test.describe('Phase 13: Complete Round-Trip Booking, Duration & Fare Test Suite', () => {

  // ---------------------------------------------------------------------------
  // Test A: Same-Day Round Trip
  // Pickup: 14 November, 8:00 AM; Return: 14 November, 6:00 PM
  // Expected: 1 Day, 1 × 250 = 250 KM minimum allowance
  // ---------------------------------------------------------------------------
  test('Test A: Same-Day Round Trip (Pickup 8:00 AM, Return 6:00 PM -> 1 Day, 250 KM min)', () => {
    const timeline = calculateReturnTimeline({
      pickupDate: '2026-11-14',
      pickupTime: '08:00',
      returnDate: '2026-11-14',
      returnTime: '18:00',
      returnDistanceKm: 80, // ~1 hr 36 min return -> arrives ~19:36 on Nov 14
    });

    expect(timeline.tripDays).toBe(1);
    expect(timeline.totalNights).toBe(0);

    const quote = calculateRoundTripFare({
      pickupDate: '2026-11-14',
      pickupTime: '08:00',
      returnDate: '2026-11-14',
      returnTime: '18:00',
      outboundDistanceKm: 80,
      returnDistanceKm: 80,
      actualTotalDistanceKm: 160,
      numberOfDays: timeline.tripDays,
      vehicleCategory: 'sedan',
    });

    expect(quote.tripDays).toBe(1);
    expect(quote.dailyKmAllowance).toBe(250);
    expect(quote.totalMinimumKm).toBe(250);
    expect(quote.actualTotalDistanceKm).toBe(160);
    expect(quote.billableKm).toBe(250); // MAX(160, 250) = 250
    expect(quote.distanceFare).toBe(250 * 14); // 3500
    expect(quote.baseFare).toBe(3500);
    expect(quote.totalDriverAllowance).toBe(400); // 1 day
    expect(quote.totalFare).toBe(3900); // 3500 + 400
  });

  // ---------------------------------------------------------------------------
  // Test B: Three-Day Round Trip
  // Pickup: 14 November, Return: 16 November, Actual total KM: 600
  // Expected: 3 Days, Minimum KM: 750, Billable KM: 750
  // ---------------------------------------------------------------------------
  test('Test B: Three-Day Round Trip (Pickup 14 Nov, Return 16 Nov, 600 actual -> 3 Days, 750 billable)', () => {
    const timeline = calculateReturnTimeline({
      pickupDate: '2026-11-14',
      pickupTime: '09:00',
      returnDate: '2026-11-16',
      returnTime: '15:00',
      returnDistanceKm: 300, // ~6 hrs return -> arrives ~21:00 on Nov 16
    });

    expect(timeline.tripDays).toBe(3); // Nov 14, 15, 16

    const quote = calculateRoundTripFare({
      pickupDate: '2026-11-14',
      pickupTime: '09:00',
      returnDate: '2026-11-16',
      returnTime: '15:00',
      outboundDistanceKm: 300,
      returnDistanceKm: 300,
      actualTotalDistanceKm: 600,
      numberOfDays: timeline.tripDays,
      vehicleCategory: 'sedan',
      vehicleRate: 15, // Test with ₹15/km from example
    });

    expect(quote.tripDays).toBe(3);
    expect(quote.actualTotalDistanceKm).toBe(600);
    expect(quote.totalMinimumKm).toBe(750); // 3 * 250 = 750
    expect(quote.billableKm).toBe(750); // MAX(600, 750) = 750
    expect(quote.distanceFare).toBe(750 * 15); // 11,250
    expect(quote.baseFare).toBe(11250);
    expect(quote.totalDriverAllowance).toBe(400 * 3); // 1200
    expect(quote.totalFare).toBe(11250 + 1200); // 12,450
  });

  // ---------------------------------------------------------------------------
  // Test C: Four-Day Round Trip
  // Pickup: 14 November, Return: 17 November, Actual total KM: 600
  // Expected: 4 Days, Minimum KM: 1,000, Billable KM: 1,000
  // ---------------------------------------------------------------------------
  test('Test C: Four-Day Round Trip (Pickup 14 Nov, Return 17 Nov, 600 actual -> 4 Days, 1000 billable)', () => {
    const timeline = calculateReturnTimeline({
      pickupDate: '2026-11-14',
      pickupTime: '08:00',
      returnDate: '2026-11-17',
      returnTime: '14:00',
      returnDistanceKm: 300, // arrives on Nov 17
    });

    expect(timeline.tripDays).toBe(4); // Nov 14, 15, 16, 17

    const quote = calculateRoundTripFare({
      pickupDate: '2026-11-14',
      pickupTime: '08:00',
      returnDate: '2026-11-17',
      returnTime: '14:00',
      outboundDistanceKm: 300,
      returnDistanceKm: 300,
      actualTotalDistanceKm: 600,
      numberOfDays: timeline.tripDays,
      vehicleCategory: 'sedan',
    });

    expect(quote.tripDays).toBe(4);
    expect(quote.totalMinimumKm).toBe(1000); // 4 * 250
    expect(quote.billableKm).toBe(1000); // MAX(600, 1000) = 1000
    expect(quote.distanceFare).toBe(1000 * 14); // 14,000
    expect(quote.totalDriverAllowance).toBe(400 * 4); // 1,600
    expect(quote.totalFare).toBe(14000 + 1600); // 15,600
  });

  // ---------------------------------------------------------------------------
  // Test D: Actual Distance Higher
  // Pickup: 14 November, Return: 16 November, Actual total KM: 900
  // Expected: 3 Days, Minimum KM: 750, Billable KM: 900
  // ---------------------------------------------------------------------------
  test('Test D: Actual Distance Higher than Minimum (900 actual > 750 min -> 900 billable)', () => {
    const quote = calculateRoundTripFare({
      pickupDate: '2026-11-14',
      pickupTime: '06:00',
      returnDate: '2026-11-16',
      returnTime: '16:00',
      outboundDistanceKm: 450,
      returnDistanceKm: 450,
      actualTotalDistanceKm: 900,
      numberOfDays: 3,
      vehicleCategory: 'sedan',
    });

    expect(quote.tripDays).toBe(3);
    expect(quote.actualTotalDistanceKm).toBe(900);
    expect(quote.totalMinimumKm).toBe(750);
    expect(quote.billableKm).toBe(900); // MAX(900, 750) = 900 (actual KM wins)
    expect(quote.distanceFare).toBe(900 * 14); // 12,600
    expect(quote.totalDriverAllowance).toBe(1200);
    expect(quote.totalFare).toBe(12600 + 1200); // 13,800
  });

  // ---------------------------------------------------------------------------
  // Test E: Different Return Destination
  // Outbound: Delhi → Nainital, Return: Nainital → Ghaziabad
  // Expected: Outbound and return computed separately, sum of actuals, 250/day min, Ghaziabad as final drop
  // ---------------------------------------------------------------------------
  test('Test E: Different Return Destination (Delhi -> Nainital -> Ghaziabad)', () => {
    const outboundKm = 310;
    const returnKm = 290;
    const actualTotalKm = outboundKm + returnKm; // 600 KM
    const tripDays = 3;

    const quote = calculateRoundTripFare({
      pickupLocation: 'Delhi',
      destinationLocation: 'Nainital',
      finalDropLocation: 'Ghaziabad',
      outboundDistanceKm: outboundKm,
      returnDistanceKm: returnKm,
      actualTotalDistanceKm: actualTotalKm,
      numberOfDays: tripDays,
      vehicleCategory: 'sedan',
    });

    expect(quote.pickupLocation).toBe('Delhi');
    expect(quote.destinationLocation).toBe('Nainital');
    expect(quote.finalDropLocation).toBe('Ghaziabad');
    expect(quote.outboundDistanceKm).toBe(310);
    expect(quote.returnDistanceKm).toBe(290);
    expect(quote.actualTotalDistanceKm).toBe(600);
    expect(quote.totalMinimumKm).toBe(750); // 3 * 250
    expect(quote.billableKm).toBe(750);
    expect(quote.distanceFare).toBe(750 * 14);
  });

  // ---------------------------------------------------------------------------
  // Test F: Pickup Time and Return Time Independence
  // Pickup: 8:00 AM, Return: 7:00 PM
  // Expected: Neither field overwrites the other, final arrival calculated separately
  // ---------------------------------------------------------------------------
  test('Test F: Pickup Time and Return Time Independence (8:00 AM pickup, 7:00 PM return)', () => {
    const timeline = calculateReturnTimeline({
      pickupDate: '2026-11-14',
      pickupTime: '08:00',
      returnDate: '2026-11-16',
      returnTime: '19:00',
      returnDistanceKm: 300, // ~6 hours return -> 19:00 + 6h = 01:00 AM next day (Nov 17)
    });

    expect(timeline.pickupTime).toBe('08:00');
    expect(timeline.returnTime).toBe('19:00');
    // Departs 19:00 on Nov 16 with 6 hours drive -> arrives Nov 17 at 01:00 AM
    expect(timeline.finalArrivalDate).toBe('2026-11-17');
    expect(timeline.finalArrivalTime).toBe('01:00');
    // Inclusive days: Nov 14, 15, 16, 17 = 4 calendar days
    expect(timeline.tripDays).toBe(4);
    expect(timeline.totalNights).toBe(3);
  });

  // ---------------------------------------------------------------------------
  // Test G: Full Booking-to-Invoice Consistency
  // Verify calculateRoundTripFare generates consistent data across booking, snapshot, invoice, and WhatsApp
  // ---------------------------------------------------------------------------
  test('Test G: Full Booking-to-Invoice Consistency across all touchpoints', () => {
    const quote = calculateRoundTripFare({
      pickupLocation: 'Delhi',
      destinationLocation: 'Nainital',
      finalDropLocation: 'Delhi',
      pickupDate: '2026-11-14',
      pickupTime: '09:00',
      returnDate: '2026-11-16',
      returnTime: '16:00',
      outboundDistanceKm: 310,
      returnDistanceKm: 310,
      actualTotalDistanceKm: 620,
      vehicleCategory: 'sedan',
      vehicleRate: 12,
    });

    // 1. Core Fare Math Verification
    expect(quote.tripDays).toBe(3);
    expect(quote.actualTotalDistanceKm).toBe(620);
    expect(quote.totalMinimumKm).toBe(750);
    expect(quote.billableKm).toBe(750);
    expect(quote.distanceFare).toBe(750 * 12); // 9,000
    expect(quote.totalDriverAllowance).toBe(400 * 3); // 1,200
    expect(quote.totalFare).toBe(9000 + 1200); // 10,200
    expect(quote.tokenAmount).toBe(3060); // 30% of 10,200 = 3060
    expect(quote.balanceAmount).toBe(7140); // 70% of 10,200 = 7140

    // 2. WhatsApp Message Generation Consistency
    const waLink = generateWhatsAppLink({
      customerName: 'Rahul Sharma',
      pickup: 'Delhi',
      drop: 'Nainital',
      finalDropLocation: 'Delhi',
      tripType: 'Round Trip',
      vehicleCategory: 'Sedan',
      journeyDate: '2026-11-14',
      pickupTime: '09:00',
      returnDate: '2026-11-16',
      durationDays: 3,
      outboundKm: 310,
      returnKm: 310,
      actualKm: 620,
      billableKm: 750,
      totalFare: quote.totalFare,
      tokenAmount: quote.tokenAmount,
      balanceAmount: quote.balanceAmount,
      estimatedFinalArrival: quote.estimatedFinalArrival.readableDateTime,
    });

    const decodedWa = decodeURIComponent(waLink);
    expect(decodedWa).toContain('*Outbound:* ~310 km | *Return:* ~310 km');
    expect(decodedWa).toContain('*Actual Total Distance:* ~620 km');
    expect(decodedWa).toContain('*Billable Distance:* ~750 km (via 250 km/day daily quota)');
    expect(decodedWa).toContain('3 Days');
    expect(decodedWa).toContain('*Estimated Total Fare:* *₹10,200*');
    expect(decodedWa).toContain('*30% Advance Token:* *₹3,060*');
    expect(decodedWa).toContain('*70% Driver Balance:* *₹7,140*');
  });

});
