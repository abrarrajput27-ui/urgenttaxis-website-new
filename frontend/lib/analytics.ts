/**
 * Type-Safe, Privacy-Preserving Google Analytics 4 (GA4) Conversion Tracking Module
 * 
 * Strict Compliance:
 * 1. Digital Personal Data Protection Act (DPDPA 2023)
 * 2. Google Analytics Terms of Service
 * 
 * STRICT PROHIBITIONS:
 * - NO customer names
 * - NO customer phone numbers
 * - NO customer email addresses
 * - NO residential street-level addresses
 * - NO customer-linkable booking reference IDs (e.g. UT-XXXXXX)
 * 
 * ALLOWED AGGREGATE PARAMETERS:
 * - click_location
 * - page_type
 * - trip_type
 * - vehicle_category
 * - origin_city
 * - destination_city
 * - estimated_fare_inr
 */

type GTagEvent = {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  [key: string]: any;
};

/**
 * Safe event dispatcher that checks window.gtag existence before firing.
 */
export const trackEvent = ({ action, category, label, value, ...customParams }: GTagEvent) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    try {
      (window as any).gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
        ...customParams,
      });
    } catch (err) {
      console.warn('[Analytics] Failed to dispatch event:', action, err);
    }
  }
};

/**
 * 1. Phone Call Click Conversion
 * Aggregate parameters only: click_location, page_type
 */
export const trackPhoneCall = (clickLocation: string, pageType?: string) => {
  trackEvent({
    action: 'phone_call_click',
    category: 'Engagement',
    click_location: clickLocation,
    page_type: pageType || 'general',
  });
};

/**
 * 2. WhatsApp Click Conversion
 * Aggregate parameters only: click_location, page_type
 */
export const trackWhatsAppClick = (clickLocation: string, pageType?: string) => {
  trackEvent({
    action: 'whatsapp_click',
    category: 'Engagement',
    click_location: clickLocation,
    page_type: pageType || 'general',
  });
};

/**
 * 3. Fare Search Completed
 * Aggregate parameters only: trip_type, origin_city, destination_city, estimated_fare_inr
 */
export const trackFareSearchCompleted = (
  tripType: string,
  originCity: string,
  destinationCity: string,
  estimatedFareInr?: number
) => {
  trackEvent({
    action: 'fare_search_completed',
    category: 'Booking Funnel',
    trip_type: tripType,
    origin_city: originCity || 'unknown',
    destination_city: destinationCity || 'unknown',
    estimated_fare_inr: estimatedFareInr || 0,
  });
};

/**
 * 4. Booking Completed
 * Core revenue conversion: Reservation request confirmed by backend API
 * Purely aggregate parameters: vehicle_category, estimated_fare_inr, trip_type, origin_city, destination_city
 * STRICTLY EXCLUDES BOOKING REFERENCE IDS AND ALL CUSTOMER-LINKABLE IDENTIFIERS.
 */
export const trackBookingCompleted = (
  vehicleCategory: string,
  estimatedFareInr: number,
  tripType: string,
  originCity?: string,
  destinationCity?: string
) => {
  trackEvent({
    action: 'booking_completed',
    category: 'Conversion',
    value: estimatedFareInr,
    currency: 'INR',
    vehicle_category: vehicleCategory,
    estimated_fare_inr: estimatedFareInr,
    trip_type: tripType,
    origin_city: originCity || 'unknown',
    destination_city: destinationCity || 'unknown',
  });
};
