export interface VehicleProfile {
  id: string;
  category: string;
  title: string;
  models: string;
  seats: string;
  bags: string;
  image: string;
  tag: string;
  features: string[];
}

export function getVehicleProfile(categoryNameOrSlug?: string): VehicleProfile {
  const k = String(categoryNameOrSlug || '').toLowerCase();

  if (k.includes('crysta') || k.includes('hycross') || k.includes('executive')) {
    return {
      id: 'innova-crysta',
      category: 'Innova Crysta',
      title: 'Toyota Innova Crysta / Hycross',
      models: 'Innova Crysta 2.4 VX/ZX, Hycross Hybrid',
      seats: '6/7 Passengers',
      bags: '5 Large Bags',
      image: '/fleet-brand/Innova Crysta.webp',
      tag: 'Premium Luxury SUV',
      features: [
        'Rear Reclining Captain Seats',
        'Dual Climate Control AC',
        'Highway Hill Driving Mode',
        'Commercial Yellow Plate',
      ],
    };
  }

  if (k.includes('urbania')) {
    return {
      id: 'urbania',
      category: 'Force Urbania',
      title: 'Force Urbania Luxury Van',
      models: 'Force Urbania 12 / 16 Seater Luxury Van',
      seats: '12-16 Passengers',
      bags: '14 Large Bags',
      image: '/fleet-brand/Urbania.webp',
      tag: 'Executive Corporate Van',
      features: [
        'Individual AC Vents & USB Ports',
        'Pushback Plush Recliner Seats',
        'High Ceiling Walkthrough',
        'Commercial Tourist Permit',
      ],
    };
  }

  if (k.includes('tempo')) {
    return {
      id: 'tempo',
      category: 'Tempo Traveller',
      title: 'Force Tempo Traveller',
      models: 'Force Traveller 12 / 17 / 26 Seater AC',
      seats: '12-26 Passengers',
      bags: '15 Large Bags',
      image: '/fleet-brand/Tempo Traveller.webp',
      tag: 'Group & Pilgrimage Travel',
      features: [
        'Air Suspended Comfortable Ride',
        'Separate Luggage Boot Space',
        'Microphone & Music System',
        'All-India Tourist Permit',
      ],
    };
  }

  if (k.includes('bus') || k.includes('coach') || k.includes('volvo')) {
    return {
      id: 'bus',
      category: 'Luxury Coach Bus',
      title: 'Volvo / BharatBenz Luxury Bus',
      models: '27-Seater Mini Coach / 45-Seater Multi-Axle Volvo',
      seats: '27-45 Passengers',
      bags: '45 Bags (Underbelly Cargo)',
      image: '/fleet-brand/volvo bus.webp',
      tag: 'Corporate & Large Group Tours',
      features: [
        'Dual Zone AC Cooling',
        'Pushback Ergonomic Seats',
        'Dedicated Attendant / Dual Driver',
        'National Tourist Permit',
      ],
    };
  }

  if (k.includes('ertiga')) {
    return {
      id: 'ertiga',
      category: 'Maruti Ertiga',
      title: 'Maruti Suzuki Ertiga AC',
      models: 'Maruti Ertiga 6-Seater Dual AC',
      seats: '6 Passengers',
      bags: '3-4 Bags',
      image: '/fleet-brand/Ertiga.webp',
      tag: 'Family 6-Seater MUV',
      features: [
        'Spacious 3-Row Seating',
        'Roof Mounted AC Blowers',
        'Fuel Efficient Clean Ride',
        'Commercial Yellow Plate',
      ],
    };
  }

  if (k.includes('suv') || k.includes('muv') || k.includes('triber') || k.includes('carens')) {
    return {
      id: 'suv-muv',
      category: 'SUV / MUV',
      title: 'Kia Carens / Renault Triber / Bolero',
      models: 'Compact 6/7 Seater Utility Vehicle',
      seats: '6-7 Passengers',
      bags: '4 Bags',
      image: '/fleet-brand/Ertiga.webp',
      tag: 'Multi-Utility SUV',
      features: [
        'Foldable Rear Luggage Seats',
        'Powerful High Clearance Engine',
        'High Roof Comfort',
        'Commercial Yellow Plate',
      ],
    };
  }

  if (k.includes('innova')) {
    return {
      id: 'innova',
      category: 'Toyota Innova',
      title: 'Toyota Innova 7-Seater Classic',
      models: 'Toyota Innova 2.5 Classic Diesel AC',
      seats: '7 Passengers',
      bags: '5 Bags',
      image: '/fleet-brand/Innova Crysta.webp',
      tag: 'Legendary Highway Comfort',
      features: [
        'Legendary Long-Distance Comfort',
        'High Ground Clearance',
        'Dual AC with Roof Blowers',
        'Commercial Yellow Plate',
      ],
    };
  }

  if (k.includes('hatchback') || k.includes('wagonr') || k.includes('swift') || k.includes('celerio')) {
    return {
      id: 'hatchback',
      category: 'Hatchback',
      title: 'Maruti WagonR / Swift / Celerio',
      models: 'Maruti WagonR / Celerio 1.0 CNG/Petrol AC',
      seats: '4 Passengers',
      bags: '2 Bags',
      image: '/fleet-brand/Hatchback.webp',
      tag: 'Budget Economy Cab',
      features: [
        'Chilled AC Cabin',
        'Compact Easy Highway Nav',
        'Maximum Fuel Efficiency',
        'Commercial Yellow Plate',
      ],
    };
  }

  // Default: Sedan
  return {
    id: 'sedan',
    category: 'Sedan',
    title: 'Maruti Dzire / Toyota Etios / Honda Amaze',
    models: 'Maruti Dzire 1.2 / Toyota Etios Platinum',
    seats: '4 Passengers',
    bags: '3 Bags (Spacious Boot)',
    image: '/fleet-brand/dzire.webp',
    tag: 'Most Popular Outstation Sedan',
    features: [
      'Dedicated Boot Space (350L+)',
      'Chilled AC Cabin',
      'Smooth Highway Shock Absorbers',
      'Commercial Yellow Plate',
    ],
  };
}
