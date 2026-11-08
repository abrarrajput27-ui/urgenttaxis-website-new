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
    metaDescription: 'Pre-book your Delhi Airport to Ghaziabad taxi with flight delay tracking. Fares from ₹1,199 quoted upfront before booking, verified driver waits at arrival pillar.',
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
      'Arriving at Delhi IGI Airport and heading to Noida? Urgent Taxis offers pre-booked arrival transfers with transparent upfront fares, free flight delay tracking, and doorstep drop-off across all sectors in Noida.',
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
  'delhi-to-igi-airport': {
  slug: "delhi-to-igi-airport",
  title: "Delhi NCR to Delhi IGI Airport (T1, T2, T3) Taxi",
  h1: "Delhi to IGI Airport Taxi — 24/7 Punctual Airport Cabs",
  metaTitle: "Delhi to IGI Airport Taxi | 24/7 Doorstep Pickup to T1, T2, T3",
  metaDescription: "Book reliable taxi service from anywhere in Delhi NCR to Indira Gandhi International Airport (T1, T2, T3). Verified drivers, fixed rates, on-time guarantee.",
  origin: "Delhi",
  destination: "Indira Gandhi International Airport (IGI)",
  distanceKm: 22,
  durationText: "40 - 50 mins",
  peakDurationText: "60 - 75 mins",
  sedanFare: 899,
  ertigaFare: 1299,
  crystaFare: 2199,
  expresswayCorridor: "Ring Road / Outer Ring Road → NH-48 Airport Expressway → Terminal Approaches",
  overview: [
    "Catching an early-morning domestic connection or international red-eye flight from Indira Gandhi International Airport? Urgent Taxis provides 24/7 doorstep pickup across all localities of Central, South, West, North, and East Delhi.",
    "Our drivers track flight schedules and ensure your cab arrives 10 minutes ahead of departure. Choose between comfortable sedans or spacious MPVs capable of carrying multiple luggage pieces.",
    "All airport cabs operate on official commercial permits with yellow plates and functional AC. Book with our transparent 30% advance policy and pay the remaining 70% balance directly on the trip."
  ],
  terminals: [
    {
      terminal: "Terminal 1 (T1)",
      details: "Dedicated domestic departures for IndiGo and SpiceJet.",
      airlines: "IndiGo, SpiceJet"
    },
    {
      terminal: "Terminal 2 (T2)",
      details: "Domestic flights operations.",
      airlines: "Air India Express, Akasa Air"
    },
    {
      terminal: "Terminal 3 (T3)",
      details: "All international flights and full-service domestic operations.",
      airlines: "Air India, Vistara, International Carriers"
    }
  ],
  pickupDropProcess: [
    {
      title: "Step 1: 24/7 Online Booking",
      step: "Select your Delhi locality, terminal destination, and departure time."
    },
    {
      title: "Step 2: Chauffeur Details",
      step: "Receive driver name, phone number, and vehicle registration well before departure."
    },
    {
      title: "Step 3: Doorstep Pickup & Drop",
      step: "Travel comfortably directly to the departure ramp of your chosen terminal."
    }
  ],
  faqs: [
    {
      question: "How much does a cab from Delhi to IGI Airport cost?",
      answer: "Fares start from ₹899 for a clean AC Sedan. MPV options such as Maruti Ertiga are available from ₹1,299."
    },
    {
      question: "Which IGI airport terminals do you serve?",
      answer: "We drop directly at the departure gates of Terminal 1, Terminal 2, and Terminal 3."
    },
    {
      question: "How is the booking confirmed?",
      answer: "A 30% advance token secures your booking, and the remaining 70% is payable to the chauffeur during your ride."
    }
  ]
},
  'delhi-to-jaipur-airport': {
  slug: "delhi-to-jaipur-airport",
  title: "Delhi NCR to Jaipur International Airport (JAI) Taxi",
  h1: "Delhi NCR to Jaipur Airport Taxi — Express Highway Transfers",
  metaTitle: "Delhi to Jaipur Airport Taxi | Direct Intercity Cabs to JAI",
  metaDescription: "Book direct outstation taxi from Delhi, Gurgaon & Noida to Jaipur International Airport (JAI). Fixed fares from ₹3,499. Verified highway drivers.",
  origin: "Delhi NCR",
  destination: "Jaipur International Airport (JAI)",
  distanceKm: 275,
  durationText: "4 hr 45 min",
  peakDurationText: "5 hr 30 min",
  sedanFare: 3499,
  ertigaFare: 4699,
  crystaFare: 8999,
  expresswayCorridor: "Delhi-Jaipur Expressway (NH-48) → Jaipur Bypass → Sanganer Airport Road",
  overview: [
    "Need direct door-to-terminal transport from Delhi NCR to Jaipur International Airport (JAI) in Sanganer? Urgent Taxis provides private, nonstop highway cabs tailored for travelers connecting with regional flights or returning to Rajasthan.",
    "Travel with experienced highway chauffeurs who navigate the NH-48 expressway safely. Avoid the stress of trains and bus schedules with a private vehicle dedicated to your family and luggage.",
    "Our commercial vehicles are equipped with active air-conditioning and spacious boots. Fares feature clear per-km billing, a 30% advance token, and 70% trip balance collection."
  ],
  terminals: [
    {
      terminal: "Terminal 2 (T2)",
      details: "Main integrated terminal handling both domestic and international operations.",
      airlines: "All Domestic & Gulf Carriers"
    }
  ],
  pickupDropProcess: [
    {
      title: "Doorstep Departure",
      step: "Chauffeur arrives at your Delhi NCR home or hotel at the scheduled hour."
    },
    {
      title: "Expressway Transit",
      step: "Smooth journey via NH-48 with optional hygienic refreshment stop."
    },
    {
      title: "Terminal 2 Drop",
      step: "Direct drop at the passenger departure concourse of Jaipur Airport."
    }
  ],
  faqs: [
    {
      question: "What is the fare from Delhi to Jaipur Airport?",
      answer: "One-way AC Sedan fares start from ₹3,499. Ertiga SUVs are ₹4,699."
    },
    {
      question: "Are highway tolls included?",
      answer: "Highway tolls and parking fees are paid at actuals at physical booths."
    },
    {
      question: "What is the advance payment policy?",
      answer: "A 30% advance token confirms your ride; the remaining 70% is paid to your driver."
    }
  ]
},
  'delhi-to-chandigarh-airport': {
  slug: "delhi-to-chandigarh-airport",
  title: "Delhi NCR to Chandigarh International Airport (IXC) Taxi",
  h1: "Delhi NCR to Chandigarh Airport Taxi — 24/7 Highway Cabs",
  metaTitle: "Delhi to Chandigarh Airport Taxi | Direct Highway Cabs to IXC",
  metaDescription: "Book punctual taxi transfer from Delhi NCR to Shaheed Bhagat Singh Chandigarh International Airport (IXC). Transparent rates, verified drivers.",
  origin: "Delhi NCR",
  destination: "Chandigarh International Airport (IXC)",
  distanceKm: 260,
  durationText: "4 hr 30 min",
  peakDurationText: "5 hr 15 min",
  sedanFare: 3499,
  ertigaFare: 4699,
  crystaFare: 8999,
  expresswayCorridor: "Grand Trunk Road (NH-44) → Ambala-Chandigarh Expressway → Airport Road Mohali",
  overview: [
    "Urgent Taxis provides comfortable, 24/7 direct cab transfers from Delhi NCR to Shaheed Bhagat Singh Chandigarh International Airport (IXC) in Mohali.",
    "Enjoy a relaxed journey along the modern 8-lane NH-44 highway with licensed highway chauffeurs. Doorstep pickup is available across Delhi, Ghaziabad, Noida, and Gurgaon.",
    "Choose between economical sedans or spacious SUVs. All bookings are confirmed with our official 30% advance policy and transparent distance pricing."
  ],
  terminals: [
    {
      terminal: "Integrated Terminal",
      details: "Eco-friendly integrated passenger terminal handling domestic and international flights.",
      airlines: "All Carriers"
    }
  ],
  pickupDropProcess: [
    {
      title: "Scheduled Pickup",
      step: "Prompt doorstep pickup anywhere in Delhi NCR."
    },
    {
      title: "Express Highway Drive",
      step: "Fast travel along NH-44 through Murthal, Panipat, and Karnal."
    },
    {
      title: "Direct Mohali Drop",
      step: "Seamless drop right at the departure porch of Chandigarh Airport."
    }
  ],
  faqs: [
    {
      question: "How much time does it take to reach Chandigarh Airport from Delhi?",
      answer: "Average driving time via NH-44 is approximately 4.5 hours under typical conditions."
    },
    {
      question: "What vehicle types are available?",
      answer: "We offer AC Sedans (Dzire/Etios), 6-seater Ertiga SUVs, and premium Innova Crystas."
    },
    {
      question: "How do I pay for the booking?",
      answer: "Pay a 30% advance token to book, with the remaining 70% paid to your driver during the journey."
    }
  ]
},
  'delhi-to-dehradun-airport': {
  slug: "delhi-to-dehradun-airport",
  title: "Delhi NCR to Dehradun Jolly Grant Airport (DED) Taxi",
  h1: "Delhi NCR to Dehradun Airport Taxi — Jolly Grant Transfers",
  metaTitle: "Delhi to Dehradun Airport Taxi | Direct Cabs to Jolly Grant (DED)",
  metaDescription: "Book direct taxi from Delhi NCR to Dehradun Jolly Grant Airport (DED). Punctual doorstep pickup, verified drivers & fixed transparent pricing.",
  origin: "Delhi NCR",
  destination: "Dehradun Jolly Grant Airport (DED)",
  distanceKm: 250,
  durationText: "4 hr 45 min",
  peakDurationText: "5 hr 30 min",
  sedanFare: 3899,
  ertigaFare: 5199,
  crystaFare: 9499,
  expresswayCorridor: "Delhi-Meerut Expressway (NE-3) → NH-334 → Haridwar Bypass → Jolly Grant Airport Corridor",
  overview: [
    "Catching a flight from Jolly Grant Airport (DED) Dehradun or connecting to Rishikesh and Mussoorie? Urgent Taxis provides dedicated 24/7 outstation transfers from Delhi NCR.",
    "Our experienced chauffeurs ensure a smooth ride via the Delhi-Meerut Expressway and NH-334, dropping you right at the departure gates of Jolly Grant Airport.",
    "Transparent distance-based fares, 30% advance token confirmation, and 70% balance collection directly during the ride."
  ],
  terminals: [
    {
      terminal: "Domestic Terminal",
      details: "Modern integrated terminal serving flights to Delhi, Mumbai, Bengaluru, and Himalayan sectors.",
      airlines: "All Domestic Airlines"
    }
  ],
  pickupDropProcess: [
    {
      title: "Doorstep Departure",
      step: "Chauffeur arrives at your Delhi NCR residence or office."
    },
    {
      title: "Smooth Transit",
      step: "Travel via DME NE-3 and scenic Uttarakhand foothills."
    },
    {
      title: "Terminal Arrival",
      step: "Punctual drop at Dehradun Airport departure concourse."
    }
  ],
  faqs: [
    {
      question: "What is the taxi fare from Delhi to Jolly Grant Airport?",
      answer: "Sedan fares start from ₹3,899, while Ertiga SUVs are ₹5,199."
    },
    {
      question: "Can you drop at Rishikesh or Haridwar after the airport?",
      answer: "Yes, multi-stop and round-trip bookings can be scheduled with our dispatch team."
    },
    {
      question: "What payment terms apply?",
      answer: "Confirm with 30% advance; pay the 70% balance directly to the driver on the trip."
    }
  ]
},
  'delhi-to-amritsar-airport': {
  slug: "delhi-to-amritsar-airport",
  title: "Delhi NCR to Amritsar International Airport (ATQ) Taxi",
  h1: "Delhi to Amritsar Airport Taxi — Sri Guru Ram Dass Jee Cabs",
  metaTitle: "Delhi to Amritsar Airport Taxi | Direct Outstation Cabs to ATQ",
  metaDescription: "Book private outstation taxi from Delhi NCR to Sri Guru Ram Dass Jee International Airport (ATQ) Amritsar. Clean AC sedans & SUVs, verified drivers.",
  origin: "Delhi NCR",
  destination: "Amritsar Sri Guru Ram Dass Jee Airport (ATQ)",
  distanceKm: 470,
  durationText: "8 hr 00 min",
  peakDurationText: "9 hr 15 min",
  sedanFare: 6499,
  ertigaFare: 8499,
  crystaFare: 15499,
  expresswayCorridor: "NH-44 Grand Trunk Road → Ludhiana Bypass → Jalandhar → Amritsar Raja Sansi Airport Road",
  overview: [
    "Connecting to international flights to the UK, Canada, or Gulf countries via Sri Guru Ram Dass Jee International Airport (ATQ) Amritsar? Urgent Taxis offers premium long-distance cab transfers.",
    "Our seasoned highway drivers manage the 470 km NH-44 drive safely with comfortable vehicle setups and spacious luggage capacity.",
    "Enjoy upfront quotes, an official 30% advance confirmation policy, and 70% balance payable during your journey."
  ],
  terminals: [
    {
      terminal: "Integrated Terminal",
      details: "Full-service international and domestic terminal at Raja Sansi.",
      airlines: "Air India, Qatar Airways, Scoot, IndiGo"
    }
  ],
  pickupDropProcess: [
    {
      title: "Doorstep Pickup",
      step: "Direct departure from anywhere in Delhi NCR."
    },
    {
      title: "Comfortable Highway Drive",
      step: "Smooth travel across Punjab along NH-44 with flexible food stops."
    },
    {
      title: "Airport Porch Drop",
      step: "Drop right at Raja Sansi International Airport departures."
    }
  ],
  faqs: [
    {
      question: "How long does the journey to Amritsar Airport take?",
      answer: "The highway drive via NH-44 takes approximately 8 hours."
    },
    {
      question: "Are extra luggage carriers available?",
      answer: "Yes, our Ertiga and Innova MPVs are equipped to handle extensive luggage."
    },
    {
      question: "How is the payment handled?",
      answer: "Pay 30% advance token to book; remaining 70% is collected by the driver during travel."
    }
  ]
},
  'delhi-to-lucknow-airport': {
  slug: "delhi-to-lucknow-airport",
  title: "Delhi NCR to Lucknow Airport (Amausi LKO) Taxi",
  h1: "Delhi NCR to Lucknow Airport Taxi — Expressway Transfers",
  metaTitle: "Delhi to Lucknow Airport Taxi | Direct Cabs to Amausi (LKO)",
  metaDescription: "Book express taxi from Delhi NCR to Chaudhary Charan Singh Lucknow Airport (LKO) via Agra-Lucknow Expressway. Clean AC cabs, verified drivers.",
  origin: "Delhi NCR",
  destination: "Chaudhary Charan Singh International Airport (LKO)",
  distanceKm: 530,
  durationText: "7 hr 30 min",
  peakDurationText: "8 hr 30 min",
  sedanFare: 6999,
  ertigaFare: 9299,
  crystaFare: 16999,
  expresswayCorridor: "Yamuna Expressway → Agra-Lucknow Expressway (ALE) → Amar Shaheed Path → Amausi Airport",
  overview: [
    "Travel seamlessly from Delhi NCR to Chaudhary Charan Singh International Airport (LKO) in Lucknow via India's premier high-speed expressways.",
    "Urgent Taxis provides comfortable, air-conditioned sedans and MPVs driven by expressway-certified chauffeurs. Experience nonstop comfort with total luggage security.",
    "Clear transparent fares, 30% advance token booking, and 70% balance collection directly on the trip."
  ],
  terminals: [
    {
      terminal: "Terminal 3 (T3)",
      details: "State-of-the-art modern terminal handling all major international and domestic operations.",
      airlines: "All Major Airlines"
    }
  ],
  pickupDropProcess: [
    {
      title: "Doorstep Pickup",
      step: "Prompt departure from your Delhi, Noida, or Ghaziabad address."
    },
    {
      title: "6-Lane Expressway Drive",
      step: "Fast, smooth cruising on the Yamuna and Agra-Lucknow Expressways."
    },
    {
      title: "Terminal Drop",
      step: "Direct arrival at Amausi Airport departure ramp."
    }
  ],
  faqs: [
    {
      question: "What is the fare to Lucknow Airport?",
      answer: "One-way Sedan fares start from ₹6,999. Ertiga SUVs are ₹9,299."
    },
    {
      question: "Are expressway tolls included?",
      answer: "Tolls are payable at actuals at physical plazas."
    },
    {
      question: "What is the payment rule?",
      answer: "A 30% advance token confirms your ride; 70% is paid to your driver."
    }
  ]
},
  'delhi-to-pantnagar-airport': {
  slug: "delhi-to-pantnagar-airport",
  title: "Delhi NCR to Pantnagar Airport (PGH) Taxi",
  h1: "Delhi NCR to Pantnagar Airport Taxi — Kumaon Air Gateway",
  metaTitle: "Delhi to Pantnagar Airport Taxi | Direct Cabs to PGH Airport",
  metaDescription: "Book direct taxi from Delhi NCR to Pantnagar Airport (PGH) Kumaon. Punctual doorstep pickup, verified drivers & transparent distance rates.",
  origin: "Delhi NCR",
  destination: "Pantnagar Airport (PGH)",
  distanceKm: 260,
  durationText: "5 hr 00 min",
  peakDurationText: "5 hr 45 min",
  sedanFare: 3999,
  ertigaFare: 5299,
  crystaFare: 9699,
  expresswayCorridor: "Delhi-Meerut Expressway (NE-3) → NH-9 Moradabad Bypass → Rampur → Pantnagar Highway",
  overview: [
    "Pantnagar Airport (PGH) is the vital regional air link for Nainital, Jim Corbett, and the Kumaon region. Urgent Taxis provides dedicated 24/7 transfers from Delhi NCR.",
    "Our drivers ensure timely arrival for regional Alliance Air and IndiGo flights with comfortable, sanitized AC cabs.",
    "Transparent per-km billing, official 30% advance token, and 70% trip balance collection."
  ],
  terminals: [
    {
      terminal: "Passenger Terminal",
      details: "Single integrated passenger terminal serving flights to Delhi and Dehradun.",
      airlines: "Alliance Air, IndiGo"
    }
  ],
  pickupDropProcess: [
    {
      title: "Doorstep Departure",
      step: "Chauffeur arrives at your Delhi NCR doorstep on schedule."
    },
    {
      title: "Highway Transit",
      step: "Smooth drive via Delhi-Meerut Expressway and NH-9 Moradabad corridor."
    },
    {
      title: "Pantnagar Drop",
      step: "Direct drop at the terminal gate of Pantnagar Airport."
    }
  ],
  faqs: [
    {
      question: "How much time does it take to reach Pantnagar Airport from Delhi?",
      answer: "The driving time is approximately 5 hours under normal conditions."
    },
    {
      question: "What cars are available?",
      answer: "We offer clean Sedans (Dzire) and spacious MPVs (Ertiga, Crysta)."
    },
    {
      question: "How do I confirm the booking?",
      answer: "Pay a 30% advance token online; the 70% balance is paid to your driver."
    }
  ]
},
  'delhi-to-bareilly-airport': {
  slug: "delhi-to-bareilly-airport",
  title: "Delhi NCR to Bareilly Airport (BEK) Taxi",
  h1: "Delhi NCR to Bareilly Airport Taxi — 24/7 Doorstep Cabs",
  metaTitle: "Delhi to Bareilly Airport Taxi | Direct Cabs to BEK Airport",
  metaDescription: "Book reliable taxi service from Delhi NCR to Bareilly Airport (Trishul Air Base BEK). Fixed transparent rates, verified drivers.",
  origin: "Delhi NCR",
  destination: "Bareilly Airport (BEK)",
  distanceKm: 260,
  durationText: "5 hr 00 min",
  peakDurationText: "5 hr 45 min",
  sedanFare: 3799,
  ertigaFare: 4999,
  crystaFare: 9299,
  expresswayCorridor: "Delhi-Meerut Expressway (NE-3) → NH-9 Moradabad Bypass → NH-530 Bareilly Corridor",
  overview: [
    "Flying out of Bareilly Airport (BEK) Trishul Air Base? Urgent Taxis provides 24/7 private outstation cabs connecting Delhi NCR directly with Bareilly.",
    "Our verified chauffeurs ensure a punctual, relaxed journey with licensed commercial vehicles and working air-conditioning.",
    "Book easily with upfront pricing, a 30% advance confirmation token, and 70% remaining balance on the trip."
  ],
  terminals: [
    {
      terminal: "Civil Enclave",
      details: "Civil passenger terminal connected to Trishul Air Force Base.",
      airlines: "IndiGo, Alliance Air"
    }
  ],
  pickupDropProcess: [
    {
      title: "Scheduled Pickup",
      step: "Chauffeur arrives at your home address in Delhi NCR."
    },
    {
      title: "Highway Cruise",
      step: "Travel via DME and NH-9 smoothly."
    },
    {
      title: "Terminal Drop",
      step: "Drop at Bareilly Civil Airport departure gates."
    }
  ],
  faqs: [
    {
      question: "What is the fare from Delhi to Bareilly Airport?",
      answer: "Sedan fares start from ₹3,799, and Ertiga SUVs from ₹4,999."
    },
    {
      question: "Are highway tolls included?",
      answer: "Highway tolls are paid at actuals at physical booths."
    },
    {
      question: "What payment policy is used?",
      answer: "30% advance token confirms your ride; 70% balance is paid to the driver."
    }
  ]
},
};
