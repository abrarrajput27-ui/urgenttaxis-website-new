import { BUSINESS_CONFIG } from './config';

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

  pageUrl?: string;
  customMessage?: string;
}

/**
 * Generates a clean, polite, human-readable WhatsApp inquiry message.
 * Formatted without markdown links, divider lines, or confusing header markers.
 */
export function generateWhatsAppLink(
  phoneOrParams: string | WhatsAppMessageParams,
  maybeParams?: WhatsAppMessageParams
): string {
  let targetPhone = BUSINESS_CONFIG.phone.whatsappRaw;
  let params: WhatsAppMessageParams = {};

  if (typeof phoneOrParams === 'string') {
    // If phone string is passed, extract raw digits or fall back to default
    const digits = phoneOrParams.replace(/[^0-9]/g, '');
    if (digits.length >= 10) targetPhone = digits;
    if (maybeParams) params = maybeParams;
  } else if (typeof phoneOrParams === 'object') {
    params = phoneOrParams;
  }

  const lines: string[] = [];

  // 1. Warm Greeting
  lines.push('Hello Urgent Taxis!');
  lines.push('');

  // 2. Custom Message (if provided)
  if (params.customMessage) {
    lines.push(params.customMessage.trim());
    lines.push('');
  } else {
    lines.push('I would like to inquire about booking a taxi.');
    lines.push('');
  }

  // 3. Trip & Route Details
  const tripDetails: string[] = [];
  if (params.tripType) tripDetails.push(`• Service: ${params.tripType}`);
  if (params.pickup && params.drop) {
    tripDetails.push(`• Route: ${params.pickup} to ${params.drop}`);
  } else if (params.pickup) {
    tripDetails.push(`• Pickup Location: ${params.pickup}`);
  } else if (params.drop) {
    tripDetails.push(`• Drop Location: ${params.drop}`);
  }
  if (params.journeyDate) tripDetails.push(`• Travel Date: ${params.journeyDate}`);
  if (params.pickupTime) tripDetails.push(`• Pickup Time: ${params.pickupTime}`);
  if (params.distance) tripDetails.push(`• Distance: ~${params.distance} km`);

  if (tripDetails.length > 0) {
    lines.push('Trip Details:');
    tripDetails.forEach((detail) => lines.push(detail));
    lines.push('');
  }

  // 4. Vehicle Selection
  const vehicleDetails: string[] = [];
  if (params.vehicleCategory) vehicleDetails.push(`• Vehicle: ${params.vehicleCategory}`);
  if (params.vehicleModel) vehicleDetails.push(`• Preferred Car: ${params.vehicleModel}`);

  if (vehicleDetails.length > 0) {
    lines.push('Vehicle Details:');
    vehicleDetails.forEach((detail) => lines.push(detail));
    lines.push('');
  }

  // 5. Estimated Fare (if available)
  if (params.totalFare || params.baseFare) {
    lines.push('Quotation:');
    if (params.baseFare) lines.push(`• Base Fare: ₹${params.baseFare.toLocaleString('en-IN')}`);
    if (params.estimatedToll) lines.push(`• Est. Toll: ₹${params.estimatedToll.toLocaleString('en-IN')}`);
    if (params.estimatedStateTax) lines.push(`• Est. State Tax: ₹${params.estimatedStateTax.toLocaleString('en-IN')}`);
    if (params.totalFare) lines.push(`• Estimated Total: ₹${params.totalFare.toLocaleString('en-IN')}`);
    lines.push('');
  }

  // 6. Page Context URL (https)
  const websiteUrl = params.pageUrl || BUSINESS_CONFIG.canonicalDomain;
  lines.push(`Reference Page: ${websiteUrl}`);
  lines.push('');

  // 7. Clear Call to Action as required
  lines.push('Please confirm availability, final fare and driver details.');

  const text = lines.join('\n');
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
}
