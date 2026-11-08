import { BUSINESS_CONFIG } from './config';

export interface WhatsAppMessageParams {
  bookingReference?: string;
  invoiceUrl?: string;
  customerName?: string;
  passengerCount?: number;

  pickup?: string;
  drop?: string;
  tripType?: 'One Way' | 'Round Trip' | 'Airport Transfer' | 'Local Rental' | 'Corporate' | 'Tempo Traveller' | 'Bus' | 'Tour Package' | string;
  journeyDate?: string;
  pickupTime?: string;
  distance?: number;

  vehicleCategory?: string;
  vehicleModel?: string;
  capacity?: string;
  luggageCapacity?: string;
  includedFeatures?: string[];

  baseFare?: number;
  promoDiscount?: number;
  estimatedToll?: number;
  estimatedStateTax?: number;
  parking?: number;
  nightCharges?: number;
  platformFee?: number;
  gst?: number;
  addOnTotal?: number;
  totalFare?: number;
  tokenAmount?: number;
  balanceAmount?: number;

  inclusions?: string[];
  exclusions?: string[];

  pageUrl?: string;
  customMessage?: string;
}

/**
 * Generates an authoritative, bold, sectioned, emoji-rich WhatsApp message.
 * Formatted with clear dividers, bold headers, full trip details,
 * itemized fare breakdown, and attached digital invoice / receipt link.
 */
export function generateWhatsAppLink(
  phoneOrParams?: string | WhatsAppMessageParams,
  maybeParams?: WhatsAppMessageParams
): string {
  let targetPhone = BUSINESS_CONFIG.phone.whatsappRaw || '918595066033';
  let params: WhatsAppMessageParams = {};

  if (typeof phoneOrParams === 'string') {
    const digits = phoneOrParams.replace(/[^0-9]/g, '');
    if (digits.length >= 10) targetPhone = digits;
    if (maybeParams) params = maybeParams;
  } else if (typeof phoneOrParams === 'object' && phoneOrParams !== null) {
    params = phoneOrParams;
  }

  const lines: string[] = [
    '🚖 *URGENT TAXIS — OFFICIAL BOOKING & DISPATCH DESK*',
    '━━━━━━━━━━━━━━━━━━━━',
    '✨ *Fast To Your Destination – Your Quick Ride Solution!*',
    '',
  ];

  // Custom Message / Note (if any)
  if (params.customMessage?.trim()) {
    lines.push(`💬 *Customer Note:* ${params.customMessage.trim()}`);
    lines.push('');
  }

  // Booking Reference (if available)
  if (params.bookingReference) {
    lines.push(`🔖 *Booking Reference:* *${params.bookingReference}*`);
    lines.push('');
  }

  const hasTripDetails = Boolean(params.pickup || params.drop || params.tripType || params.journeyDate);

  if (hasTripDetails) {
    // Trip & Route Details
    lines.push('📋 *TRIP & ROUTE DETAILS*');
    if (params.tripType) lines.push(`• 🚗 *Service:* ${params.tripType}`);
    if (params.pickup && params.drop) {
      lines.push(`• 📍 *Pickup:* ${params.pickup}`);
      lines.push(`• 🏁 *Drop:* ${params.drop}`);
    } else if (params.pickup) {
      lines.push(`• 📍 *Pickup Location:* ${params.pickup}`);
    } else if (params.drop) {
      lines.push(`• 🏁 *Drop Location:* ${params.drop}`);
    }
    if (params.distance) lines.push(`• 🛣️ *Distance:* ~${params.distance} km`);
    if (params.journeyDate) lines.push(`• 📅 *Travel Date:* ${params.journeyDate}`);
    if (params.pickupTime) lines.push(`• ⏰ *Pickup Time:* ${params.pickupTime}`);
    if (params.customerName) lines.push(`• 👤 *Passenger:* ${params.customerName}`);
    if (params.passengerCount) lines.push(`• 👥 *Passengers:* ${params.passengerCount} Persons`);
    lines.push('');
  } else {
    // General Inquiry Structured Template
    lines.push('👋 *Hello Dispatch Desk!*');
    lines.push('I want to check cab availability and instant fare quote with Urgent Taxis.');
    lines.push('');
    lines.push('📋 *MY TRIP REQUIREMENTS:*');
    lines.push('• 🚗 *Service Type:* [One-Way / Round-Trip / Airport / Local Rental]');
    lines.push('• 🚘 *Vehicle Choice:* [Sedan Dzire / Ertiga / Innova Crysta / Tempo]');
    lines.push('• 📍 *Pickup City/Address:* ');
    lines.push('• 🏁 *Drop City/Destination:* ');
    lines.push('• 📅 *Date & Time:* ');
    lines.push('');
  }

  // Assigned Vehicle Details
  if (params.vehicleCategory || params.vehicleModel) {
    lines.push('🚘 *VEHICLE SPECIFICATIONS*');
    if (params.vehicleCategory) lines.push(`• 🚗 *Category:* *${params.vehicleCategory}*`);
    if (params.vehicleModel) lines.push(`• 💺 *Models:* ${params.vehicleModel}`);
    if (params.capacity) lines.push(`• 👥 *Capacity:* ${params.capacity}`);
    if (params.luggageCapacity) lines.push(`• 🧳 *Luggage:* ${params.luggageCapacity}`);
    lines.push('• ❄️ *Dual AC:* Chilled Climate Control');
    lines.push('• 🚕 *Permit:* Commercial Yellow Plate (All-India)');
    lines.push('');
  }

  // Fare & Payment Breakdown
  if (params.totalFare || params.baseFare) {
    lines.push('💰 *FARE & PAYMENT BREAKDOWN*');
    if (params.baseFare) lines.push(`• 💵 *Base Cab Rental:* ₹${params.baseFare.toLocaleString('en-IN')}`);
    if (params.estimatedToll) lines.push(`• 🛣️ *Highway Tolls:* ₹${params.estimatedToll.toLocaleString('en-IN')}`);
    if (params.estimatedStateTax) lines.push(`• 🏛️ *State Border Tax:* ₹${params.estimatedStateTax.toLocaleString('en-IN')}`);
    if (params.addOnTotal && params.addOnTotal > 0) lines.push(`• ➕ *Selected Add-ons:* +₹${params.addOnTotal.toLocaleString('en-IN')}`);
    lines.push('────────────────────');
    if (params.totalFare) lines.push(`• 💳 *TOTAL FARE:* *₹${params.totalFare.toLocaleString('en-IN')}*`);
    if (params.tokenAmount) lines.push(`• 🟢 *30% Advance Token:* *₹${params.tokenAmount.toLocaleString('en-IN')}* (To Confirm)`);
    if (params.balanceAmount) lines.push(`• ⚪ *70% Driver Balance:* *₹${params.balanceAmount.toLocaleString('en-IN')}* (At Pickup)`);
    lines.push('');
  } else if (!hasTripDetails) {
    lines.push('💰 *DIRECT OPERATOR ADVANTAGES:*');
    lines.push('• 🏷️ Guaranteed Transparent Matrix (Zero Surge)');
    lines.push('• 🛡️ 100% Verified Chauffeurs & Clean Cabs');
    lines.push('• 🟢 Only 30% Token • 70% Balance at Destination');
    lines.push('');
  }

  // Attached Digital Invoice Link
  if (params.invoiceUrl) {
    lines.push('🧾 *DIGITAL INVOICE & RECEIPT:*');
    lines.push(params.invoiceUrl);
    lines.push('');
  } else if (params.bookingReference) {
    lines.push('🧾 *DIGITAL INVOICE & RECEIPT:*');
    lines.push(`https://www.urgenttaxis.in/booking-confirmation/${params.bookingReference}/invoice`);
    lines.push('');
  }

  // Official Helpline & Context
  lines.push('📞 *24x7 Helpline:* +91 7310651940 | Masuri, Ghaziabad');
  lines.push('💬 *WhatsApp Desk:* +91 8595066033');
  lines.push(`🌐 *Website:* ${params.pageUrl || 'https://www.urgenttaxis.in'}`);
  lines.push('');
  lines.push('Please confirm cab availability & dispatch quote! ✨');

  const text = lines.join('\n');
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
}
