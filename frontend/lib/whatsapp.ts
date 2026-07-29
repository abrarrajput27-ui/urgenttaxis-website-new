export interface WhatsAppMessageParams {
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
  totalFare?: number;

  inclusions?: string[];
  exclusions?: string[];

  customMessage?: string; // For simple inquiries
}

export function generateWhatsAppLink(phone: string, params: WhatsAppMessageParams): string {
  const parts: string[] = [];

  parts.push('✨ *URGENT TAXIS - TRIP BOOKING REQUEST* ✨');

  // If it's just a custom message (like from Header/Footer), we can prepend it or just use the template
  if (params.customMessage) {
    parts.push('');
    parts.push(params.customMessage);
  }

  const hasServiceDetails = params.pickup || params.drop || params.tripType || params.journeyDate || params.pickupTime || params.distance;
  if (hasServiceDetails) {
    parts.push('');
    parts.push('---');
    parts.push('');
    parts.push('SERVICE DETAILS');
    parts.push('');
    
    if (params.pickup && params.drop) {
      parts.push(`📍 *Route/City:* ${params.pickup} → ${params.drop}`);
    } else if (params.pickup) {
      parts.push(`📍 *Pickup:* ${params.pickup}`);
    } else if (params.drop) {
      parts.push(`🏁 *Drop:* ${params.drop}`);
    }

    if (params.tripType) parts.push(`🔄 *Trip Type:* ${params.tripType}`);
    if (params.journeyDate) parts.push(`📅 *Journey Date:* ${params.journeyDate}`);
    if (params.pickupTime) parts.push(`🕒 *Pickup Time:* ${params.pickupTime}`);
    if (params.distance) parts.push(`📏 *Distance:* ~${params.distance} km`);
  }

  const hasVehicleDetails = params.vehicleCategory || params.vehicleModel || params.capacity || params.luggageCapacity;
  if (hasVehicleDetails) {
    parts.push('');
    parts.push('---');
    parts.push('');
    parts.push('VEHICLE DETAILS');
    parts.push('');
    
    if (params.vehicleCategory) parts.push(`🚗 *Vehicle Category:* ${params.vehicleCategory}`);
    if (params.vehicleModel) parts.push(`🚙 *Vehicle Model:* ${params.vehicleModel}`);
    if (params.capacity) parts.push(`👥 *Capacity:* ${params.capacity}`);
    if (params.luggageCapacity) parts.push(`🧳 *Luggage Capacity:* ${params.luggageCapacity}`);
    
    if (params.includedFeatures && params.includedFeatures.length > 0) {
      parts.push('');
      parts.push('✨ *Included Features*');
      params.includedFeatures.forEach(feature => parts.push(`✔️ ${feature}`));
    } else if (hasVehicleDetails) {
      parts.push('');
      parts.push('✨ *Included Features*');
      parts.push('✔️ AC');
      parts.push('✔️ Music System');
      parts.push('✔️ Clean Vehicle');
      parts.push('✔️ Professional Driver');
      parts.push('✔️ Same Category Guaranteed');
    }
  }

  const hasFareDetails = params.totalFare !== undefined || params.baseFare !== undefined;
  if (hasFareDetails) {
    parts.push('');
    parts.push('---');
    parts.push('');
    parts.push('FARE BREAKDOWN');
    parts.push('');
    parts.push('---');
    parts.push('');
    
    const formatMoney = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

    if (params.baseFare) parts.push(`💰 *Base Fare:* ${formatMoney(params.baseFare)}`);
    if (params.promoDiscount) parts.push(`🎁 *Promo Discount:* ${formatMoney(params.promoDiscount)}`);
    if (params.estimatedToll) parts.push(`🛣️ *Estimated Toll:* ${formatMoney(params.estimatedToll)}`);
    if (params.estimatedStateTax) parts.push(`🏢 *Estimated State Tax:* ${formatMoney(params.estimatedStateTax)}`);
    if (params.parking) parts.push(`🅿️ *Parking:* ${formatMoney(params.parking)}`);
    if (params.nightCharges) parts.push(`🌙 *Night Charges:* ${formatMoney(params.nightCharges)}`);
    if (params.platformFee) parts.push(`📱 *Platform Fee:* ${formatMoney(params.platformFee)}`);
    if (params.gst) parts.push(`🧾 *GST:* ${formatMoney(params.gst)}`);
    
    parts.push('');
    parts.push('---');
    parts.push('');
    if (params.totalFare) parts.push(`💵 *TOTAL FARE:* ${formatMoney(params.totalFare)}`);
    parts.push('');
    parts.push('---');
  }

  const hasInclusions = params.inclusions && params.inclusions.length > 0;
  if (hasInclusions || hasFareDetails) {
    parts.push('');
    parts.push('INCLUSIONS');
    parts.push('');
    parts.push('✅ Included');
    if (hasInclusions) {
      params.inclusions?.forEach(inc => parts.push(inc));
    } else {
      parts.push('Driver Charges');
      parts.push('Fuel (Applicable Distance)');
      parts.push('AC');
      parts.push('Toll (if included)');
      parts.push('State Tax (if included)');
    }
  }

  const hasExclusions = params.exclusions && params.exclusions.length > 0;
  if (hasExclusions || hasFareDetails) {
    parts.push('');
    parts.push('---');
    parts.push('');
    parts.push('EXCLUSIONS');
    parts.push('');
    if (hasExclusions) {
      params.exclusions?.forEach(exc => parts.push(`❌ ${exc}`));
    } else {
      parts.push('❌ Parking');
      parts.push('❌ Waiting');
      parts.push('❌ Extra KM');
      parts.push('❌ Night Charges');
    }
  }

  parts.push('');
  parts.push('---');
  parts.push('');
  parts.push('CUSTOMER REQUEST');
  parts.push('');
  parts.push('📌');
  parts.push('');
  parts.push('Please confirm:');
  parts.push('');
  parts.push('✅ Vehicle Availability');
  parts.push('');
  parts.push('✅ Final Fare');
  parts.push('');
  parts.push('✅ Driver Assignment');
  
  parts.push('');
  parts.push('---');
  parts.push('');
  parts.push('FOOTER');
  parts.push('');
  parts.push('Thank you for choosing');
  parts.push('');
  parts.push('🚖 *Urgent Taxis*');
  parts.push('');
  parts.push('🌐 [www.urgenttaxis.com](http://www.urgenttaxis.com)');

  const text = parts.join('\n');
  return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
}
