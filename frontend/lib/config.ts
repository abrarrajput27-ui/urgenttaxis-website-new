/**
 * Master Business Configuration & Source of Truth for Urgent Taxis
 * Single source of truth for all contact details, addresses, rates, hours, policies, and links.
 * Hardcoding these values in any component or page is strictly forbidden.
 */

export interface VehicleRateCard {
  category: string;
  name: string;
  models: string;
  seats: number;
  bags: number;
  ac: boolean;
  music: boolean;
  outstationRatePerKm: number;
  extraKmRate: number;
  localPackages: {
    '8hr80km': number;
    '12hr120km': number;
    extraHourRate: number;
    extraKmRate: number;
  };
  image: string;
}

export const BUSINESS_CONFIG = {
  // Brand & Identity
  brandName: 'Urgent Taxis',
  legalName: 'Urgent Taxis Transport Services',
  tagline: 'Fast To Your Destination — Your Quick Ride Solution!',
  taglineHindi: 'हमेशा आपके साथ!',
  canonicalDomain: 'https://www.urgenttaxis.in',
  siteUrl: 'https://www.urgenttaxis.in',
  logoUrl: '/logo.jpg',
  ogImageUrl: '/og-image.jpg',

  // Contact Details (Strict Source of Truth)
  phone: {
    primary: '+91 7310651940',
    primaryRaw: '+917310651940',
    display: '+91 73106 51940',
    whatsapp: '+91 8595066033',
    whatsappRaw: '918595066033',
    email: 'info@urgenttaxis.in',
  },

  // Physical Location & Service Areas
  headOffice: {
    name: 'Urgent Taxis Head Office',
    shopNumber: 'Shop No. 09',
    building: 'S. R. Complex',
    street: 'Railway Station Road',
    locality: 'Masuri',
    city: 'Ghaziabad',
    state: 'Uttar Pradesh',
    stateCode: 'UP',
    postalCode: '201302',
    country: 'IN',
    countryName: 'India',
    formattedAddress: 'Shop No. 09, S. R. Complex, Railway Station Road, Masuri, Ghaziabad, Uttar Pradesh 201302',
    // GPS Coordinates (set to null until officially verified by owner; listed in OWNER-TODO.md)
    latitude: null as number | null,
    longitude: null as number | null,
    googleMapsUrl: null as string | null,
  },

  // Operating Hours
  operatingHours: {
    display: 'Open 24 Hours / 7 Days a Week',
    is24x7: true,
    opens: '00:00',
    closes: '23:59',
  },

  // Coverage Scope
  primaryCoverage: 'Ghaziabad, Delhi NCR, Noida, Greater Noida & North India',
  serviceAreas: [
    'Ghaziabad',
    'Masuri',
    'Indirapuram',
    'Vaishali',
    'Vasundhara',
    'Raj Nagar',
    'Raj Nagar Extension',
    'Kaushambi',
    'Sahibabad',
    'Crossings Republik',
    'Loni',
    'Modinagar',
    'Muradnagar',
    'Hapur',
    'Meerut',
    'Noida',
    'Greater Noida',
    'Delhi',
    'Faridabad',
    'Gurugram',
  ],

  // Social Profiles (Null until verified URLs provided by owner; icons hidden when null)
  socialProfiles: {
    facebook: null as string | null,
    instagram: null as string | null,
    youtube: null as string | null,
    twitter: null as string | null,
    linkedin: null as string | null,
  },

  // Core Service Policies
  policies: {
    roundTripMinKmPerDay: 250,
    tollTaxPolicy: 'Toll, state border entry taxes, and parking fees are paid at actuals unless explicitly specified in your confirmed booking quotation.',
    driverNightAllowance: {
      startTime: '22:00',
      endTime: '06:00',
      amount: 300,
      description: 'Night driver allowance of ₹300 applicable for travel between 10:00 PM and 06:00 AM.',
    },
    cancellationPolicy: 'Free cancellation up to 6 hours before scheduled departure. Instant refund for advance token amounts.',
    bookingConfirmationPolicy: 'Instant booking assistance via phone or WhatsApp. Car and chauffeur details dispatched 2 hours before trip start.',
  },

  // Local Rental Packages Master Definitions
  localRentalPackages: [
    {
      id: '8hr80km',
      name: 'Half Day Rental (8 Hr / 80 Km)',
      hours: 8,
      km: 80,
      description: 'Ideal for city errands, business meetings, and shopping in Ghaziabad & Delhi NCR.',
    },
    {
      id: '12hr120km',
      name: 'Full Day Rental (12 Hr / 120 Km)',
      hours: 12,
      km: 120,
      description: 'Perfect for full-day city sightseeing, multi-stop family events, or client visits across NCR.',
    },
  ],

  // Fleet Rate Matrix (Source of truth for fleet cards, route cards, pricing)
  fleet: {
    hatchback: {
      category: 'hatchback',
      name: 'Hatchback',
      models: 'WagonR, Swift, Celerio',
      seats: 4,
      bags: 2,
      ac: true,
      music: true,
      outstationRatePerKm: 11,
      extraKmRate: 11,
      localPackages: {
        '8hr80km': 1200,
        '12hr120km': 2200,
        extraHourRate: 150,
        extraKmRate: 10,
      },
      image: '/fleet-brand/Hatchback.webp',
    },
    sedan: {
      category: 'sedan',
      name: 'Sedan',
      models: 'Dzire, Etios, Amaze',
      seats: 4,
      bags: 2,
      ac: true,
      music: true,
      outstationRatePerKm: 12,
      extraKmRate: 12,
      localPackages: {
        '8hr80km': 1500,
        '12hr120km': 2660,
        extraHourRate: 180,
        extraKmRate: 11,
      },
      image: '/fleet-brand/dzire.webp',
    },
    suv: {
      category: 'suv-muv',
      name: 'SUV / MPV',
      models: 'Ertiga, Carens, Triber',
      seats: 6,
      bags: 4,
      ac: true,
      music: true,
      outstationRatePerKm: 15,
      extraKmRate: 15,
      localPackages: {
        '8hr80km': 2000,
        '12hr120km': 3480,
        extraHourRate: 220,
        extraKmRate: 15,
      },
      image: '/fleet-brand/Ertiga.webp',
    },
    executiveSuv: {
      category: 'executive-suv',
      name: 'Premium SUV',
      models: 'Innova Crysta, Hycross',
      seats: 7,
      bags: 4,
      ac: true,
      music: true,
      outstationRatePerKm: 22,
      extraKmRate: 22,
      localPackages: {
        '8hr80km': 2500,
        '12hr120km': 4500,
        extraHourRate: 300,
        extraKmRate: 20,
      },
      image: '/fleet-brand/Innova Crysta.webp',
    },
    tempo12: {
      category: 'tempo-traveller-12',
      name: '12 Seater Tempo Traveller',
      models: 'Force Traveller 1x1 Luxury',
      seats: 12,
      bags: 10,
      ac: true,
      music: true,
      outstationRatePerKm: 24,
      extraKmRate: 24,
      localPackages: {
        '8hr80km': 4200,
        '12hr120km': 5500,
        extraHourRate: 350,
        extraKmRate: 24,
      },
      image: '/fleet-brand/Tempo Traveller.webp',
    },
    tempo16: {
      category: 'tempo-traveller-16',
      name: '16 Seater Tempo Traveller',
      models: 'Force Traveller 2x1 Deluxe',
      seats: 16,
      bags: 14,
      ac: true,
      music: true,
      outstationRatePerKm: 26,
      extraKmRate: 26,
      localPackages: {
        '8hr80km': 4800,
        '12hr120km': 6500,
        extraHourRate: 400,
        extraKmRate: 26,
      },
      image: '/fleet-brand/Tempo Traveller.webp',
    },
    tempo20: {
      category: 'tempo-traveller-20',
      name: '20 Seater Tempo Traveller',
      models: 'Force Traveller 2x1 Modified',
      seats: 20,
      bags: 16,
      ac: true,
      music: true,
      outstationRatePerKm: 28,
      extraKmRate: 28,
      localPackages: {
        '8hr80km': 5500,
        '12hr120km': 7500,
        extraHourRate: 450,
        extraKmRate: 28,
      },
      image: '/fleet-brand/Tempo Traveller.webp',
    },
    tempo26: {
      category: 'tempo-traveller-26',
      name: '26 Seater Tempo Traveller',
      models: 'Force Traveller 2x2 Maharaja',
      seats: 26,
      bags: 20,
      ac: true,
      music: true,
      outstationRatePerKm: 32,
      extraKmRate: 32,
      localPackages: {
        '8hr80km': 6500,
        '12hr120km': 8800,
        extraHourRate: 500,
        extraKmRate: 32,
      },
      image: '/fleet-brand/Tempo Traveller.webp',
    },
    urbania12: {
      category: 'urbania-12',
      name: '12 Seater Urbania',
      models: 'Force Urbania Premium Luxury',
      seats: 12,
      bags: 10,
      ac: true,
      music: true,
      outstationRatePerKm: 30,
      extraKmRate: 30,
      localPackages: {
        '8hr80km': 5500,
        '12hr120km': 7500,
        extraHourRate: 450,
        extraKmRate: 30,
      },
      image: '/fleet-brand/Urbania.webp',
    },
    urbania16: {
      category: 'urbania-16',
      name: '16 Seater Urbania',
      models: 'Force Urbania Executive',
      seats: 16,
      bags: 14,
      ac: true,
      music: true,
      outstationRatePerKm: 34,
      extraKmRate: 34,
      localPackages: {
        '8hr80km': 6500,
        '12hr120km': 8800,
        extraHourRate: 500,
        extraKmRate: 34,
      },
      image: '/fleet-brand/Urbania.webp',
    },
    bus27: {
      category: 'bus-27',
      name: '27 Seater Mini Bus',
      models: 'Tata / Eicher Deluxe AC Coach',
      seats: 27,
      bags: 25,
      ac: true,
      music: true,
      outstationRatePerKm: 45,
      extraKmRate: 45,
      localPackages: {
        '8hr80km': 8000,
        '12hr120km': 11000,
        extraHourRate: 700,
        extraKmRate: 45,
      },
      image: '/fleet-brand/Bus.webp',
    },
    bus45: {
      category: 'bus-45',
      name: '45 Seater Volvo / Scania Bus',
      models: 'Multi-Axle Luxury AC Bus',
      seats: 45,
      bags: 45,
      ac: true,
      music: true,
      outstationRatePerKm: 55,
      extraKmRate: 55,
      localPackages: {
        '8hr80km': 11000,
        '12hr120km': 15000,
        extraHourRate: 900,
        extraKmRate: 55,
      },
      image: '/fleet-brand/volvo bus.webp',
    },
  } as Record<string, VehicleRateCard>,
};
