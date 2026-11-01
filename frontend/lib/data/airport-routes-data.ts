/**
 * Master Airport Routes Dataset for Urgent Taxis
 * Single source of truth for dedicated airport transfer pages.
 */

export interface AirportRouteData {
  slug: string;
  title: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  origin: string;
  destination: string;
  distanceKm: number;
  durationText: string;
  peakDurationText: string;
  sedanFare: number;
  ertigaFare: number;
  crystaFare: number;
  expresswayCorridor: string;
  overview: string[];
  terminals: {
    terminal: string;
    details: string;
    airlines: string;
  }[];
  pickupDropProcess: {
    title: string;
    step: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

export const AIRPORT_ROUTES_DATA: Record<string, AirportRouteData> = {
  'ghaziabad-to-delhi-airport': {
    slug: 'ghaziabad-to-delhi-airport',
    title: 'Ghaziabad to Delhi Airport (IGI T1, T2, T3) Taxi',
    h1: 'Ghaziabad to Delhi Airport Taxi — 24/7 Punctual IGI Cabs',
    metaTitle: 'Ghaziabad to Delhi Airport Taxi | Doorstep Pickup to IGI T1, T2, T3',
    metaDescription: 'Book 24/7 Ghaziabad to Delhi IGI Airport taxi transfer. Fixed transparent fares from ₹1,199. Doorstep pickup across all sectors, verified drivers & on-time guarantee.',
    origin: 'Ghaziabad',
    destination: 'Indira Gandhi International Airport (IGI)',
    distanceKm: 46,
    durationText: '70 - 80 mins',
    peakDurationText: '90 - 110 mins',
    sedanFare: 1199,
    ertigaFare: 1699,
    crystaFare: 2799,
    expresswayCorridor: 'Hindon Elevated Road → Delhi-Meerut Expressway (NE-3) → Barapullah Flyover → Ring Road → Dhaula Kuan → NH-48 Airport Expressway',
    overview: [
      'Need an early morning or late night cab from Ghaziabad to Indira Gandhi International Airport (IGI)? Urgent Taxis provides dedicated 24/7 airport transfer services across all Ghaziabad localities, including Raj Nagar, Kavi Nagar, RDC, Mohan Nagar, Old Bus Stand, Crossing Republik, and Masuri.',
      'Our chauffeurs track your flight schedules, arrive at your doorstep 10 minutes before the scheduled departure time, and assist with luggage loading. With seamless access to the 14-lane Delhi-Meerut Expressway and Hindon Elevated Road, we bypass congested arterial roads to get you to Terminal 1, Terminal 2, or Terminal 3 safely and on schedule.',
      'All airport cabs operate on commercial yellow plates with AC and valid fitness certificates. Choose between comfortable sedans (Maruti Dzire) for solo or couple travelers, or spacious 6-7 seater MPVs (Maruti Ertiga, Innova Crysta) for families traveling with multiple heavy luggage pieces.',
    ],
    terminals: [
      {
        terminal: 'Terminal 3 (T3)',
        details: 'Handles all international flights and domestic departures for Air India, Vistara, and select IndiGo flights. Direct flyover access to Departures ramp.',
        airlines: 'International flights, Air India, Vistara, IndiGo',
      },
      {
        terminal: 'Terminal 1 (T1)',
        details: 'Modern domestic terminal primarily serving low-cost domestic departures and arrivals. Accessible via Aerocity spine road.',
        airlines: 'IndiGo domestic, SpiceJet domestic',
      },
      {
        terminal: 'Terminal 2 (T2)',
        details: 'Dedicated domestic operations terminal adjacent to T3 with shared multi-level parking facilities.',
        airlines: 'IndiGo select domestic flights',
      },
    ],
    pickupDropProcess: [
      {
        title: 'Step 1: Doorstep Pickup',
        step: 'Our driver reaches your exact residential address or society gate in Ghaziabad 10 minutes prior to trip time.',
      },
      {
        title: 'Step 2: Expressway Travel',
        step: 'Smooth navigation via Delhi-Meerut Expressway and signal-free flyovers to avoid central Delhi congestion.',
      },
      {
        title: 'Step 3: Direct Departure Drop',
        step: 'Driver drops you right at your specific terminal departure gate (T1, T2, or T3) with complete baggage unload assistance.',
      },
    ],
    faqs: [
      {
        question: 'Ghaziabad se Delhi Airport ke liye cab kitne time pehle book karni chahiye?',
        answer: 'Domestic flight ke liye scheduled departure se kam se kam 3.5 ghante pehle aur international flight ke liye 4.5 ghante pehle Ghaziabad se cab schedule karni chahiye, taaki peak traffic me bhi koi rush na ho.',
      },
      {
        question: 'What is the taxi fare from Ghaziabad to Delhi Airport?',
        answer: 'Our one-way taxi fare from Ghaziabad to Delhi IGI Airport starts at ₹1,199 for an AC Sedan (Dzire/Etios) and ₹1,699 for an AC Ertiga 6-Seater SUV. Toll and parking are charged at actuals.',
      },
      {
        question: 'Does the driver assist with luggage?',
        answer: 'Yes, our verified chauffeurs assist with loading your luggage at your doorstep in Ghaziabad and safely unloading it at your airport departure gate.',
      },
      {
        question: 'Are night pickups available in Ghaziabad for early morning flights?',
        answer: 'Yes, Urgent Taxis operates 24/7. We frequently handle midnight (1:00 AM - 4:00 AM) pickups for international and red-eye domestic flights with 100% on-time reliability.',
      },
    ],
  },

  'noida-to-delhi-airport': {
    slug: 'noida-to-delhi-airport',
    title: 'Noida to Delhi Airport (IGI T1, T2, T3) Taxi',
    h1: 'Noida to Delhi Airport Taxi — Reliable 24/7 Doorstep Transfers',
    metaTitle: 'Noida to Delhi Airport Taxi | Doorstep Cabs to IGI T1, T2, T3',
    metaDescription: 'Book reliable 24/7 Noida to Delhi IGI Airport taxi. Sedan from ₹1,199, SUV from ₹1,699. Doorstep pickup across all Noida sectors, on-time guarantee & clean AC cabs.',
    origin: 'Noida',
    destination: 'Indira Gandhi International Airport (IGI)',
    distanceKm: 42,
    durationText: '60 - 75 mins',
    peakDurationText: '80 - 100 mins',
    sedanFare: 1199,
    ertigaFare: 1699,
    crystaFare: 2799,
    expresswayCorridor: 'Noida-Greater Noida Expressway → DND Flyway / Kalindi Kunj → Barapullah Flyover → AIIMS → Dhaula Kuan → IGI Airport',
    overview: [
      'Traveling from Noida to Indira Gandhi International Airport (IGI)? Urgent Taxis offers fast, dependable airport taxi transfers from every residential sector in Noida, including Sector 15, Sector 18, Sector 50, Sector 62, Sector 76, Sector 128, and Sector 137.',
      'Avoid the uncertainty of last-minute app cab cancellations. When you pre-book with Urgent Taxis, your assigned commercial car and chauffeur details are locked in advance. Our drivers know optimal routes via DND Flyway, Kalindi Kunj, or Barapullah corridor to avoid south Delhi bottlenecks.',
      'Whether catching a 6:00 AM domestic flight from Terminal 1 or an overseas departure from Terminal 3, our sanitized commercial sedans and SUVs guarantee a smooth, hassle-free ride.',
    ],
    terminals: [
      {
        terminal: 'Terminal 3 (T3)',
        details: 'Handles international operations and full-service domestic flights. Departures accessible directly from the terminal ramp.',
        airlines: 'All international airlines, Air India, Vistara',
      },
      {
        terminal: 'Terminal 1 (T1)',
        details: 'Modern dedicated low-cost domestic terminal with separate arrival and departure ramps.',
        airlines: 'IndiGo, SpiceJet domestic',
      },
      {
        terminal: 'Terminal 2 (T2)',
        details: 'Domestic terminal adjacent to Terminal 3.',
        airlines: 'IndiGo domestic flights',
      },
    ],
    pickupDropProcess: [
      {
        title: 'Step 1: Punctual Doorstep Pickup',
        step: 'Driver reaches your apartment complex gate or residential sector in Noida well before trip time.',
      },
      {
        title: 'Step 2: Smooth Flyover Transit',
        step: 'Optimal navigation via DND / Kalindi Kunj and Barapullah signal-free corridors.',
      },
      {
        title: 'Step 3: Direct Gate Drop',
        step: 'Hassle-free drop at your exact airline departure terminal pillar.',
      },
    ],
    faqs: [
      {
        question: 'How much does a cab from Noida to Delhi Airport cost?',
        answer: 'Our transparent fixed fare starts from ₹1,199 for an AC Sedan (Maruti Dzire) and ₹1,699 for an AC Ertiga 6-Seater SUV. Toll and parking are paid at actuals.',
      },
      {
        question: 'Noida se airport pahunchne me kitna time lagta hai?',
        answer: 'Normal traffic me Noida se Delhi Airport approx 60 se 75 minute lagte hain. Peak office hours (8:30 AM to 10:30 AM & 6:00 PM to 8:30 PM) me 85 se 100 minute lag sakte hain.',
      },
      {
        question: 'Can I book a cab for a 3 AM pickup in Noida?',
        answer: 'Yes! Urgent Taxis operates around the clock. Night pickups for early morning flights are our specialty with verified, alert chauffeurs.',
      },
    ],
  },

  'greater-noida-to-delhi-airport': {
    slug: 'greater-noida-to-delhi-airport',
    title: 'Greater Noida to Delhi Airport (IGI T1, T2, T3) Taxi',
    h1: 'Greater Noida to Delhi Airport Taxi — Fast 24/7 IGI Cabs',
    metaTitle: 'Greater Noida to Delhi Airport Taxi | Pari Chowk to IGI Cabs',
    metaDescription: 'Book reliable taxi from Greater Noida / Pari Chowk to Delhi IGI Airport. Fixed fares from ₹1,499. Doorstep pickup across Alpha, Beta, Gamma, Omega & Gaur City.',
    origin: 'Greater Noida',
    destination: 'Indira Gandhi International Airport (IGI)',
    distanceKm: 62,
    durationText: '80 - 95 mins',
    peakDurationText: '105 - 125 mins',
    sedanFare: 1499,
    ertigaFare: 2099,
    crystaFare: 3299,
    expresswayCorridor: 'Noida-Greater Noida Expressway → DND Flyway → Barapullah Elevated Road → Dhaula Kuan → NH-48 Airport Highway',
    overview: [
      'Urgent Taxis provides comfortable, prompt taxi service from Greater Noida, Pari Chowk, Knowledge Park, Alpha, Beta, Gamma, Delta, Chi, Pi, Omega, and Greater Noida West (Gaur City) to Indira Gandhi International Airport (IGI).',
      'Covering a distance of approximately 60 to 65 kilometers, our vehicles cruise smoothly along the 6-lane Noida-Greater Noida Expressway, connecting directly to Delhi’s elevated highway network for a stress-free airport arrival.',
      'Never worry about missing a flight due to driver cancellations. We provide pre-confirmed booking with dedicated chauffeurs who assist with heavy luggage.',
    ],
    terminals: [
      {
        terminal: 'Terminal 3 (T3)',
        details: 'Serves all international and major domestic full-service carriers.',
        airlines: 'All International, Air India, Vistara',
      },
      {
        terminal: 'Terminal 1 & 2',
        details: 'Serving domestic routes with quick curbside baggage drop.',
        airlines: 'IndiGo, SpiceJet',
      },
    ],
    pickupDropProcess: [
      {
        title: 'Step 1: Doorstep Pickup',
        step: 'Cab arrives at your society in Greater Noida or Gaur City on time.',
      },
      {
        title: 'Step 2: Expressway Run',
        step: 'Smooth high-speed transit via Noida Expressway without city signals.',
      },
      {
        title: 'Step 3: Terminal Ramp Drop',
        step: 'Direct drop at your terminal gate.',
      },
    ],
    faqs: [
      {
        question: 'Greater Noida se Delhi Airport ka taxi fare kitna hai?',
        answer: 'Greater Noida to Delhi Airport taxi fare starts at ₹1,499 for AC Sedan (Dzire) and ₹2,099 for AC Ertiga (6-Seater).',
      },
      {
        question: 'Kitne time pehle cab start karni chahiye Greater Noida se?',
        answer: 'Greater Noida se Delhi Airport ke liye domestic flight se kam se kam 4 ghante pehle aur international flight se 5 ghante pehle nikalna best rehta hai.',
      },
    ],
  },

  'delhi-airport-to-ghaziabad': {
    slug: 'delhi-airport-to-ghaziabad',
    title: 'Delhi Airport to Ghaziabad Taxi — Pre-Booked IGI Pickup',
    h1: 'Delhi Airport to Ghaziabad Taxi — Pre-Booked Arrival Pickups',
    metaTitle: 'Delhi Airport to Ghaziabad Taxi | IGI T1, T2, T3 Arrival Cabs',
    metaDescription: 'Pre-book your Delhi Airport to Ghaziabad taxi with flight delay tracking. Fixed fares from ₹1,199. No surge pricing, verified driver waits at arrival pillar.',
    origin: 'Indira Gandhi International Airport (IGI)',
    destination: 'Ghaziabad',
    distanceKm: 46,
    durationText: '70 - 80 mins',
    peakDurationText: '90 - 110 mins',
    sedanFare: 1199,
    ertigaFare: 1699,
    crystaFare: 2799,
    expresswayCorridor: 'NH-48 → Dhaula Kuan → Barapullah Corridor → Delhi-Meerut Expressway (NE-3) → Hindon Elevated Road → Ghaziabad',
    overview: [
      'Landing at Delhi Airport (IGI) after a long flight and need a dependable cab home to Ghaziabad? Skip the chaotic taxi queues, surge pricing, and bargaining. Pre-book an Urgent Taxis arrival cab and have your driver waiting for you at the airport pickup point.',
      'We monitor flight arrival times in real-time. Even if your flight is delayed, your booking is protected with free waiting time. Once you land, your driver will contact you and guide you to the designated terminal pillar.',
      'Enjoy a clean, air-conditioned ride directly to your doorstep in Ghaziabad, Raj Nagar, Indirapuram, Vaishali, or Vasundhara via the signal-free Delhi-Meerut Expressway.',
    ],
    terminals: [
      {
        terminal: 'Terminal 3 Arrivals',
        details: 'Driver coordinates pickup at Multi-Level Car Parking (MLCP) or designated pillar outside Arrivals.',
        airlines: 'International & Domestic arrivals',
      },
      {
        terminal: 'Terminal 1 Arrivals',
        details: 'Pickup at designated commercial cab pickup bays outside T1 arrival concourse.',
        airlines: 'IndiGo and SpiceJet domestic arrivals',
      },
      {
        terminal: 'Terminal 2 Arrivals',
        details: 'Pickup coordinated at MLCP bridge or passenger pickup zone.',
        airlines: 'Domestic arrivals',
      },
    ],
    pickupDropProcess: [
      {
        title: 'Step 1: Flight Tracking',
        step: 'We track your incoming flight number so your cab is stationed upon landing.',
      },
      {
        title: 'Step 2: Arrival Coordination',
        step: 'Driver calls or WhatsApps you as soon as you clear baggage reclaim.',
      },
      {
        title: 'Step 3: Direct Doorstep Drop',
        step: 'Smooth, comfortable ride back home to Ghaziabad.',
      },
    ],
    faqs: [
      {
        question: 'Agar meri flight delay ho jaye toh kya extra charge lagega?',
        answer: 'Nahi! Hum flight number track karte hain aur flight delay hone par cab automatically rescheduled ho jati hai bina kisi extra cancellation ya waiting charge ke.',
      },
      {
        question: 'Where will the driver meet me at Delhi Airport T3?',
        answer: 'At T3, our driver coordinates at the designated pickup bay in the Multi-Level Car Parking (MLCP) building, connected directly to the arrivals hall.',
      },
    ],
  },

  'delhi-airport-to-noida': {
    slug: 'delhi-airport-to-noida',
    title: 'Delhi Airport to Noida Taxi — Pre-Booked Arrival Transfers',
    h1: 'Delhi Airport to Noida Taxi — Fixed Fare Arrival Cabs',
    metaTitle: 'Delhi Airport to Noida Taxi | IGI Airport Pickup to All Sectors',
    metaDescription: 'Book reliable Delhi Airport to Noida taxi with flight delay tracking. Fixed fares from ₹1,199. Doorstep drop to all Noida sectors, 24/7 verified chauffeurs.',
    origin: 'Indira Gandhi International Airport (IGI)',
    destination: 'Noida',
    distanceKm: 42,
    durationText: '60 - 75 mins',
    peakDurationText: '80 - 100 mins',
    sedanFare: 1199,
    ertigaFare: 1699,
    crystaFare: 2799,
    expresswayCorridor: 'NH-48 → Dhaula Kuan → AIIMS → Barapullah Flyover → DND Flyway → Noida All Sectors',
    overview: [
      'Arriving at Delhi IGI Airport and heading to Noida? Urgent Taxis offers pre-booked arrival transfers with zero surge pricing, free flight delay tracking, and doorstep drop-off across all sectors in Noida.',
      'After collecting your luggage, simply connect with your assigned chauffeur who will be waiting at the designated airport pickup zone. Avoid long airport taxi lines and ride in comfort.',
      'Our clean commercial fleet includes sedans (Dzire, Etios) and SUVs (Ertiga, Innova Crysta), accommodating individual business travelers, couples, and large families.',
    ],
    terminals: [
      {
        terminal: 'T1, T2 & T3 Pickup',
        details: 'Seamless pickup coordination at all three IGI airport terminals.',
        airlines: 'All domestic & international flights',
      },
    ],
    pickupDropProcess: [
      {
        title: 'Step 1: Real-time Flight Monitoring',
        step: 'Driver is dispatched according to actual touchdown time.',
      },
      {
        title: 'Step 2: Convenient Meet & Greet',
        step: 'Driver assists at pickup pillar and helps load luggage.',
      },
      {
        title: 'Step 3: Fast Drop in Noida',
        step: 'Direct drop to your sector or society gate.',
      },
    ],
    faqs: [
      {
        question: 'What is the taxi fare from Delhi Airport to Noida?',
        answer: 'Our fixed one-way fare from Delhi Airport to Noida starts at ₹1,199 for an AC Sedan and ₹1,699 for an AC Ertiga 6-Seater SUV.',
      },
      {
        question: 'How do I locate my driver at IGI Airport?',
        answer: 'Your driver details (name, phone number, vehicle number) are sent via SMS/WhatsApp prior to landing. The driver will contact you to confirm the exact pillar number.',
      },
    ],
  },
};
