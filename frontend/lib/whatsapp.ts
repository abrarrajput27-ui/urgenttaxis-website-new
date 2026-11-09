import { BUSINESS_CONFIG } from './config';

export interface WhatsAppMessageParams {
  bookingReference?: string;
  invoiceUrl?: string;
  customerName?: string;
  passengerCount?: number;

  pickup?: string;
  drop?: string;
  stops?: string[];
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
 * Strictly adheres to the official Urgent Taxis booking inquiry format:
 * 
 * 🚖 *URGENT TAXIS — CAB BOOKING INQUIRY*
 * ━━━━━━━━━━━━━━━━━━━━
 * ✨ *Fast To Your Destination – Your Quick Ride Solution!*
 * 📋 *TRIP DETAILS*
 * • 🚗 *Service:* One-way
 * • 📍 *Pickup:* Ghaziabad
 * • 🏁 *Drop:* Jim Corbett
 * • 📅 *Date:* Immediate / Flexible
 * 🚘 *VEHICLE SELECTION*
 * • 🚗 *Vehicle:* *Sedan*
 * 💰 *FARE & PAYMENT BREAKDOWN*
 * • 💳 *Estimated Total Fare:* *₹3,499*
 * • 🟢 *30% Advance Token:* *₹1,050* (To Confirm)
 * • ⚪ *70% Driver Balance:* *₹2,449* (At Pickup)
 * 🌐 *Website:* https://www.urgenttaxis.in/...
 * 📞 *24x7 Helpline:* +91 7310651940 | Masuri, Ghaziabad
 * 💬 *WhatsApp Desk:* +91 8595066033
 * Please confirm cab availability & driver assignment! ✨
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

  const isConfirmed = Boolean(params.bookingReference);

  const lines: string[] = [
    isConfirmed
      ? '🚖 *URGENT TAXIS — CAB BOOKING CONFIRMATION*'
      : '🚖 *URGENT TAXIS — CAB BOOKING INQUIRY*',
    '━━━━━━━━━━━━━━━━━━━━',
    '✨ *Fast To Your Destination – Your Quick Ride Solution!*',
  ];

  // Optional Booking Reference
  if (params.bookingReference) {
    lines.push(`🔖 *Booking Ref:* *${params.bookingReference}*`);
  }

  // Custom Message / Note (if any)
  if (params.customMessage?.trim()) {
    lines.push(`📝 *Note:* ${params.customMessage.trim()}`);
  }

  const hasTripDetails = Boolean(params.pickup || params.drop || params.tripType || params.journeyDate);

  if (hasTripDetails) {
    lines.push('📋 *TRIP DETAILS*');
    if (params.tripType) lines.push(`• 🚗 *Service:* ${params.tripType}`);
    if (params.pickup) lines.push(`• 📍 *Pickup:* ${params.pickup}`);
    if (params.stops && params.stops.length > 0) {
      lines.push(`• 🛑 *Via Stops:* ${params.stops.join(' ➔ ')}`);
    }
    if (params.drop) lines.push(`• 🏁 *Drop:* ${params.drop}`);
    lines.push(`• 📅 *Date:* ${params.journeyDate || 'Immediate / Flexible'}${params.pickupTime ? ` at ${params.pickupTime}` : ''}`);
    if (params.distance) lines.push(`• 🛣️ *Distance:* ~${params.distance} km`);
    if (params.customerName) lines.push(`• 👤 *Passenger:* ${params.customerName}`);
    if (params.passengerCount) lines.push(`• 👥 *Passengers:* ${params.passengerCount} Persons`);
  } else {
    // General structured inquiry
    lines.push('📋 *TRIP INQUIRY REQUIREMENTS*');
    lines.push('• 🚗 *Service:* [One-Way / Round-Trip / Airport Transfer / Local Rental]');
    lines.push('• 📍 *Pickup:* [Your Pickup Address / City]');
    lines.push('• 🏁 *Drop:* [Your Destination City]');
    lines.push('• 📅 *Date:* [Travel Date & Pickup Time]');
  }

  // Vehicle Selection
  lines.push('🚘 *VEHICLE SELECTION*');
  const vehicleName = params.vehicleCategory || params.vehicleModel || 'Sedan';
  lines.push(`• 🚗 *Vehicle:* *${vehicleName}*`);
  if (params.vehicleModel && params.vehicleModel !== vehicleName) {
    lines.push(`• 💺 *Models:* ${params.vehicleModel}`);
  }
  if (params.capacity) {
    lines.push(`• 👥 *Capacity:* ${params.capacity}`);
  }

  // Fare & Payment Breakdown
  const effectiveTotal = params.totalFare || params.baseFare;
  if (effectiveTotal && effectiveTotal > 0) {
    const token = params.tokenAmount || Math.round(effectiveTotal * 0.3);
    const balance = params.balanceAmount || Math.max(0, effectiveTotal - token);

    lines.push('💰 *FARE & PAYMENT BREAKDOWN*');
    lines.push(`• 💳 *Estimated Total Fare:* *₹${effectiveTotal.toLocaleString('en-IN')}*`);
    lines.push(`• 🟢 *30% Advance Token:* *₹${token.toLocaleString('en-IN')}* (To Confirm)`);
    lines.push(`• ⚪ *70% Driver Balance:* *₹${balance.toLocaleString('en-IN')}* (At Pickup)`);
  } else if (!hasTripDetails) {
    lines.push('💰 *FARE & PAYMENT BREAKDOWN*');
    lines.push('• 🏷️ Guaranteed Lowest Direct-Operator Rates');
    lines.push('• 🟢 Only 30% Advance Token to Confirm');
    lines.push('• ⚪ 70% Driver Balance on Pickup');
  }

  // Digital Invoice / Receipt Link (if present)
  if (params.invoiceUrl) {
    lines.push('🧾 *DIGITAL INVOICE & RECEIPT:*');
    lines.push(params.invoiceUrl);
  } else if (params.bookingReference) {
    lines.push('🧾 *DIGITAL INVOICE & RECEIPT:*');
    lines.push(`https://www.urgenttaxis.in/booking-confirmation/${params.bookingReference}/invoice`);
  }

  // Website, 24x7 Helpline & WhatsApp Desk
  lines.push(`🌐 *Website:* ${params.pageUrl || 'https://www.urgenttaxis.in'}`);
  lines.push('📞 *24x7 Helpline:* +91 7310651940 | Masuri, Ghaziabad');
  lines.push('💬 *WhatsApp Desk:* +91 8595066033');
  lines.push(isConfirmed ? 'Please share UPI payment details / QR code to dispatch cab! ✨' : 'Please confirm cab availability & driver assignment! ✨');

  const text = lines.join('\n');
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
}
