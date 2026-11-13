import { BUSINESS_CONFIG } from './config';
import { formatTime12Hour, formatDateReadable } from './date-utils';

export interface WhatsAppMessageParams {
  bookingReference?: string;
  invoiceUrl?: string;
  customerName?: string;
  customerPhone?: string;
  passengerCount?: number;

  pickup?: string;
  drop?: string;
  destination?: string;
  finalDropLocation?: string;
  stops?: string[];
  tripType?: 'One Way' | 'Round Trip' | 'Airport Transfer' | 'Local Rental' | 'Corporate' | 'Tempo Traveller' | 'Bus' | 'Tour Package' | string;
  journeyDate?: string;
  pickupTime?: string;
  returnDate?: string;
  returnTime?: string;
  durationDays?: number | string;
  distance?: number | string;
  outboundKm?: number;
  returnKm?: number;
  actualKm?: number;
  billableKm?: number;
  estimatedFinalArrival?: string;

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
 * • 🚗 *Service:* One-way / Round-trip
 * • 📍 *Pickup:* Ghaziabad
 * • 🏁 *Drop:* Jim Corbett
 * • 🛣️ *Distance:* ~260 km (or Total Distance: ~520 km (Round-trip))
 * • 📅 *Date:* Mon, Nov 9, 2026 at 09:00 AM
 * • 🔄 *Return Date / Duration:* Wed, Nov 11, 2026 (3 Days)
 * 🚘 *VEHICLE SELECTION*
 * • 🚗 *Vehicle:* *Sedan*
 * • 💺 *Models:* Maruti Dzire, Toyota Etios
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

    const rawType = String(params.tripType || '').toLowerCase();
    const isRoundTrip = rawType.includes('round') || Boolean(params.returnDate);

    if (isRoundTrip) {
      lines.push('• 🚗 *Service:* Round-trip');
      if (params.pickup) lines.push(`• 📍 *Pickup:* ${params.pickup}`);
      if (params.stops && params.stops.length > 0) {
        lines.push(`• 🛑 *Via Stops:* ${params.stops.join(' ➔ ')}`);
      }
      if (params.drop) lines.push(`• 🏁 *Destination:* ${params.drop}`);
      if (params.finalDropLocation && params.pickup && params.finalDropLocation.trim().toLowerCase() !== params.pickup.trim().toLowerCase()) {
        lines.push(`• 🔁 *Final Return Drop:* ${params.finalDropLocation}`);
      }
      if (params.outboundKm && params.returnKm) {
        lines.push(`• 🛣️ *Outbound:* ~${params.outboundKm} km | *Return:* ~${params.returnKm} km`);
      }
      if (params.actualKm && params.actualKm > 0) {
        lines.push(`• 🛣️ *Actual Total Distance:* ~${params.actualKm} km`);
      }
      if (params.billableKm && params.billableKm > 0) {
        lines.push(`• 📏 *Billable Distance:* ~${params.billableKm} km (via 250 km/day daily quota)`);
      } else if (params.distance) {
        lines.push(`• 🛣️ *Total Distance:* ~${params.distance} km (Round-trip)`);
      }
      const depDate = params.journeyDate ? formatDateReadable(params.journeyDate) : 'Immediate / Flexible';
      const depTime = params.pickupTime ? ` at ${formatTime12Hour(params.pickupTime)}` : '';
      lines.push(`• 📅 *Departure Date:* ${depDate}${depTime}`);

      if (params.returnDate) {
        const retDate = formatDateReadable(params.returnDate);
        const retTime = params.returnTime ? ` at ${formatTime12Hour(params.returnTime)}` : '';
        const daysLabel = params.durationDays
          ? ` (${params.durationDays} ${Number(params.durationDays) === 1 ? 'Day' : 'Days'})`
          : '';
        lines.push(`• 🔄 *Return Date / Duration:* ${retDate}${retTime}${daysLabel}`);
      } else if (params.durationDays) {
        lines.push(`• ⏱️ *Trip Duration:* ${params.durationDays} ${Number(params.durationDays) === 1 ? 'Day' : 'Days'}`);
      }
      if (params.estimatedFinalArrival) {
        lines.push(`• 🏁 *Est. Final Arrival:* ${params.estimatedFinalArrival}`);
      }

      if (params.customerName) {
        const phoneSuffix = params.customerPhone ? ` (${params.customerPhone})` : '';
        lines.push(`• 👤 *Passenger:* ${params.customerName}${phoneSuffix}`);
      }
      if (params.passengerCount) {
        lines.push(`• 👥 *Passengers:* ${params.passengerCount} Persons`);
      }
    } else {
      // One-way or other service types
      const serviceLabel = params.tripType || 'One-way';
      lines.push(`• 🚗 *Service:* ${serviceLabel}`);
      if (params.pickup) lines.push(`• 📍 *Pickup:* ${params.pickup}`);
      if (params.stops && params.stops.length > 0) {
        lines.push(`• 🛑 *Via Stops:* ${params.stops.join(' ➔ ')}`);
      }
      if (params.drop) lines.push(`• 🏁 *Drop:* ${params.drop}`);
      if (params.distance && params.distance > 0) {
        lines.push(`• 🛣️ *Distance:* ~${params.distance} km`);
      }
      const travelDate = params.journeyDate ? formatDateReadable(params.journeyDate) : 'Immediate / Flexible';
      const travelTime = params.pickupTime ? ` at ${formatTime12Hour(params.pickupTime)}` : '';
      lines.push(`• 📅 *Date:* ${travelDate}${travelTime}`);

      if (params.customerName) {
        const phoneSuffix = params.customerPhone ? ` (${params.customerPhone})` : '';
        lines.push(`• 👤 *Passenger:* ${params.customerName}${phoneSuffix}`);
      }
      if (params.passengerCount) {
        lines.push(`• 👥 *Passengers:* ${params.passengerCount} Persons`);
      }
    }
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
    
    const rawType = String(params.tripType || '').toLowerCase();
    const isOneWayOrAirport = rawType.includes('one') || rawType.includes('airport');

    if (params.estimatedToll && params.estimatedToll > 0) {
      lines.push(
        isOneWayOrAirport
          ? `• 🛣️ *Highway Toll Taxes:* ₹${params.estimatedToll.toLocaleString('en-IN')} (Included in Total Fare)`
          : `• 🛣️ *Estimated Highway Tolls:* ~₹${params.estimatedToll.toLocaleString('en-IN')} (Payable at actuals)`
      );
    }
    if (params.estimatedStateTax && params.estimatedStateTax > 0) {
      lines.push(
        isOneWayOrAirport
          ? `• 🏛️ *State Border Passenger Tax:* ₹${params.estimatedStateTax.toLocaleString('en-IN')} (Included in Total Fare)`
          : `• 🏛️ *Estimated State Border Tax:* ~₹${params.estimatedStateTax.toLocaleString('en-IN')} (Payable at actuals)`
      );
    }
    if (params.nightCharges && params.nightCharges > 0) {
      lines.push(`• 🌙 *Driver Night Allowance (10 PM - 6 AM):* ₹${params.nightCharges.toLocaleString('en-IN')} (Included in Total Fare)`);
    }
    if (params.gst && params.gst > 0) {
      lines.push(`• 🧾 *Statutory GST (5%):* ₹${params.gst.toLocaleString('en-IN')} (Included in Total Fare)`);
    }
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
  lines.push(
    isConfirmed
      ? 'Please share UPI payment details / QR code to dispatch cab! ✨'
      : 'Please confirm cab availability & driver assignment! ✨'
  );

  const text = lines.join('\n');
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
}
