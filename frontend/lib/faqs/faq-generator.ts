/**
 * Reusable FAQ Generator for Urgent Taxis
 * Strictly adheres to verified business rules:
 * - 30% advance token / 70% remaining balance
 * - Fuel, AC car, and verified commercial chauffeur included in base fare
 * - Toll taxes, state border entry permits, and parking payable at actuals
 * - Booking via online portal, 24/7 phone, or WhatsApp
 * - No fake or unverified guarantees
 */

import { BUSINESS_CONFIG } from '@/lib/config';

export interface FAQItem {
  question: string;
  answer: string;
}

export function getCommonBookingFAQs(): FAQItem[] {
  return [
    {
      question: 'How can I book a taxi with Urgent Taxis?',
      answer: `You can book a cab online in under a minute via our website (urgenttaxis.in), call our 24/7 dispatch desk at ${BUSINESS_CONFIG.phone.display}, or message us on WhatsApp at ${BUSINESS_CONFIG.phone.whatsapp || BUSINESS_CONFIG.phone.display}. Simply select your pickup locality, destination, travel date, and preferred vehicle category.`,
    },
    {
      question: 'What payment options are available?',
      answer: 'We accept all major digital payment methods for your 30% advance token, including UPI (Google Pay, PhonePe, Paytm), Credit Cards, Debit Cards, and Net Banking. The remaining 70% trip balance is payable directly to your chauffeur during the journey via cash or UPI.',
    },
    {
      question: 'How is the fare calculated?',
      answer: 'Outstation one-way trips are priced on actual point-to-point highway distance using transparent per-kilometer rates. Round-trip journeys follow an industry-standard daily minimum distance allowance of 250 km. Local rental packages feature clear hourly and kilometer allowances.',
    },
    {
      question: 'What is included in the fare?',
      answer: 'The base quotation includes the dedicated commercial AC vehicle, verified licensed driver service, vehicle fuel for the booked itinerary, and driver daily allowance where applicable.',
    },
    {
      question: 'Which additional charges may apply?',
      answer: `Highway toll plaza charges, state border passenger entry taxes, parking fees, and night driving allowance (₹${BUSINESS_CONFIG.policies.driverNightAllowance.amount} when driving between ${BUSINESS_CONFIG.policies.driverNightAllowance.startTime} and ${BUSINESS_CONFIG.policies.driverNightAllowance.endTime}) are payable at actuals unless explicitly quoted as an all-inclusive package.`,
    },
    {
      question: 'How does the 30% advance payment work?',
      answer: 'To guarantee vehicle allocation and chauffeur dispatch, a 30% advance token is collected at the time of booking. The remaining 70% balance is payable directly to your driver during the journey.',
    },
    {
      question: 'How can I contact Urgent Taxis?',
      answer: `Our Ghaziabad operational dispatch desk is available 24 hours a day, 7 days a week. You can call us directly at ${BUSINESS_CONFIG.phone.display}, WhatsApp us at ${BUSINESS_CONFIG.phone.whatsapp || BUSINESS_CONFIG.phone.display}, or email ${BUSINESS_CONFIG.phone.email}.`,
    },
  ];
}

export function getRouteSpecificFAQs(
  origin: string,
  destination: string,
  distanceKm: number,
  sedanFare?: number,
  ertigaFare?: number
): FAQItem[] {
  const fareSnippet = sedanFare
    ? ` Fares for a comfortable AC Sedan start from approximately ₹${sedanFare.toLocaleString('en-IN')}${ertigaFare ? `, and Ertiga SUVs from ₹${ertigaFare.toLocaleString('en-IN')}` : ''}.`
    : '';

  return [
    {
      question: `How can I book a taxi from ${origin} to ${destination}?`,
      answer: `You can book your ${origin} to ${destination} taxi online using our instant booking form, or connect with our dispatch supervisors on WhatsApp or phone at ${BUSINESS_CONFIG.phone.display}. Doorstep pickup is provided at your specified address in ${origin}.`,
    },
    {
      question: `What is the approximate road distance between ${origin} and ${destination}?`,
      answer: `The road driving distance between ${origin} and ${destination} is approximately ${distanceKm} km. Travel time varies depending on highway corridor conditions, weather, and toll checkpoints.${fareSnippet}`,
    },
    {
      question: `Which vehicle categories are available for ${origin} to ${destination}?`,
      answer: `We provide clean, well-maintained commercial yellow-plate vehicles including 4-passenger AC Sedans (Maruti Dzire, Toyota Etios), 6-seater family MPVs (Maruti Ertiga), and luxury 6-7 passenger Toyota Innova Crystas.`,
    },
    {
      question: `Is a one-way taxi available from ${origin} to ${destination}?`,
      answer: `Yes, Urgent Taxis offers dedicated one-way drops from ${origin} to ${destination}. You only pay for the one-way distance with zero return fare charges.`,
    },
    {
      question: `Is a round-trip taxi available between ${origin} and ${destination}?`,
      answer: `Yes, round-trip cabs are available with flexible same-day or multi-day itineraries. Round-trip bookings carry an industry-standard daily minimum distance allowance of 250 km.`,
    },
    {
      question: `What charges may apply during this journey from ${origin} to ${destination}?`,
      answer: `In addition to the base taxi fare (which covers the cab, fuel, and chauffeur), highway tolls, state border commercial passenger taxes, and parking fees (if applicable) are payable at actual physical booths along the route.`,
    },
  ];
}

export function getCitySpecificFAQs(
  cityName: string,
  nearbyLocations?: string[]
): FAQItem[] {
  const nearbyText = nearbyLocations && nearbyLocations.length > 0
    ? ` We also serve neighboring hubs including ${nearbyLocations.slice(0, 4).join(', ')}.`
    : '';

  return [
    {
      question: `Which taxi services are available in ${cityName}?`,
      answer: `In ${cityName}, Urgent Taxis provides 24/7 outstation one-way drops, round-trip intercity cabs, hourly local rental packages (8h/80km, 12h/120km), and dedicated airport transfer services with verified licensed chauffeurs.`,
    },
    {
      question: `Can I book an airport transfer from ${cityName}?`,
      answer: `Yes, we operate round-the-clock airport transfers between ${cityName} and major regional airports including Delhi IGI Airport (T1, T2, T3) and nearby civil air terminals with guaranteed on-time doorstep pickup.`,
    },
    {
      question: `Which nearby locations are served from ${cityName}?`,
      answer: `Our fleet provides doorstep pickups across all residential sectors, commercial complexes, and railway stations in ${cityName}.${nearbyText}`,
    },
    {
      question: `How can I book a local or outstation taxi in ${cityName}?`,
      answer: `Booking is straightforward: enter your pickup address and destination into our website fare calculator, call our 24/7 desk at ${BUSINESS_CONFIG.phone.display}, or message our operations team on WhatsApp. Confirm with a 30% advance token and pay the 70% balance during your ride.`,
    },
  ];
}

export function getAirportSpecificFAQs(
  airportName: string,
  originOrCity?: string
): FAQItem[] {
  const locationText = originOrCity ? ` to/from ${originOrCity}` : '';

  return [
    {
      question: `How can I book a taxi${locationText} for ${airportName}?`,
      answer: `You can schedule your airport cab online at urgenttaxis.in or reach our dispatch desk on WhatsApp or phone at ${BUSINESS_CONFIG.phone.display}. Provide your flight timing and pickup address for synchronized departure.`,
    },
    {
      question: `Which pickup locations are supported for ${airportName}?`,
      answer: `We provide 24/7 doorstep pickup across all residential colonies, corporate hubs, and hotels in Delhi NCR (Ghaziabad, Noida, Greater Noida, Delhi, Gurugram, Faridabad) as well as connecting outstation cities.`,
    },
    {
      question: `How can I arrange airport arrival pickup at ${airportName}?`,
      answer: `For arriving flights, our chauffeur coordinates with you prior to landing and meets you at the designated airport passenger pickup lane or multi-level parking concourse with luggage assistance.`,
    },
    {
      question: `What information is required for an airport booking?`,
      answer: `We simply need your pickup or drop address, flight number, scheduled departure/arrival time, terminal (e.g. T1, T2, or T3), passenger count, and preferred vehicle category (Sedan or MPV).`,
    },
  ];
}
