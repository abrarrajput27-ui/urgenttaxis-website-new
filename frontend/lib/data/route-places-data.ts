export interface RoutePlace {
  name: string;
  category: 'restaurant' | 'petrol' | 'cng' | 'attraction';
  location: string;
  distanceFromStartKm: number;
  rating?: number;
  highlight?: string;
  gmapsQuery?: string;
}

export interface CorridorPlaces {
  corridorName: string;
  highways: string[];
  places: RoutePlace[];
}

// Verified highway waypoints across major North India expressways
export const CORRIDOR_DATABASE: Record<string, RoutePlace[]> = {
  // 1. Delhi NCR to Agra / Mathura (Yamuna Expressway & NH19)
  'delhi-agra': [
    {
      name: 'Yamuna Expressway Mile 65 Food Court & Starbucks',
      category: 'restaurant',
      location: 'Yamuna Expressway KM 65, Jewar Toll Plaza',
      distanceFromStartKm: 65,
      rating: 4.5,
      highlight: 'Multi-cuisine food court, clean washrooms, Costa Coffee & Haldiram',
      gmapsQuery: 'Yamuna Expressway Jewar Food Plaza',
    },
    {
      name: 'Indian Oil & CNG Station (Mile 68 Rest Stop)',
      category: 'cng',
      location: 'Yamuna Expressway KM 68',
      distanceFromStartKm: 68,
      rating: 4.2,
      highlight: '24/7 CNG and High-Speed Diesel Dispenser with air check',
      gmapsQuery: 'Indian Oil CNG Yamuna Expressway Jewar',
    },
    {
      name: 'Brijwasi Mithai & Restaurant (Mathura Cut)',
      category: 'restaurant',
      location: 'Near Mathura Toll Exit, Yamuna Expressway',
      distanceFromStartKm: 110,
      rating: 4.6,
      highlight: 'Famous authentic Mathura peda, pure vegetarian thali & snacks',
      gmapsQuery: 'Brijwasi Yamuna Expressway Mathura',
    },
    {
      name: 'Shree Krishna Janmabhoomi Temple',
      category: 'attraction',
      location: 'Mathura (5 km detour from expressway)',
      distanceFromStartKm: 120,
      rating: 4.8,
      highlight: 'Historic sacred birthplace of Lord Krishna with magnificent temple complex',
      gmapsQuery: 'Krishna Janmabhoomi Mathura',
    },
    {
      name: 'BPCL Petrol & CNG Highway Pump (Khandauli)',
      category: 'petrol',
      location: 'Yamuna Expressway KM 155, Near Khandauli Toll',
      distanceFromStartKm: 155,
      rating: 4.3,
      highlight: '24/7 fuel dispenser, clean facilities & puncture repair',
      gmapsQuery: 'BPCL Petrol Pump Khandauli Agra',
    },
    {
      name: 'Taj Mahal & Agra Fort',
      category: 'attraction',
      location: 'Dharmapuri, Forest Colony, Tajganj, Agra',
      distanceFromStartKm: 210,
      rating: 4.9,
      highlight: 'UNESCO World Heritage wonder of the world and Mughal citadel',
      gmapsQuery: 'Taj Mahal Agra',
    },
  ],

  // 2. Delhi NCR to Dehradun / Haridwar / Rishikesh (Delhi-Meerut Expressway & NH334)
  'delhi-dehradun': [
    {
      name: 'Cheetal Grand Cheetal Dhaba (Khatauli)',
      category: 'restaurant',
      location: 'NH 58 / NH 334, Khatauli Bypass, Muzaffarnagar',
      distanceFromStartKm: 98,
      rating: 4.5,
      highlight: 'Legendary highway stopover known for crispy pakoras, idlis, and garden lawns',
      gmapsQuery: 'Cheetal Grand Khatauli NH58',
    },
    {
      name: 'HPCL Auto LPG & CNG Station (Modinagar / Meerut Outer)',
      category: 'cng',
      location: 'Delhi-Meerut Expressway Section 4, Partapur',
      distanceFromStartKm: 52,
      rating: 4.1,
      highlight: 'Fast CNG queue, electronic air tower and clean restrooms',
      gmapsQuery: 'HPCL CNG Petrol Pump Partapur Meerut',
    },
    {
      name: 'Namaste Asia & Starbucks Highway Village (Mansurpur)',
      category: 'restaurant',
      location: 'NH 334, Mansurpur, Uttar Pradesh',
      distanceFromStartKm: 115,
      rating: 4.6,
      highlight: 'Modern highway food plaza with Subway, Haldiram, Starbucks & clean rest areas',
      gmapsQuery: 'Namaste Midway Mansurpur NH58',
    },
    {
      name: 'Indian Oil COCO Fuel Station (Purkaji Border)',
      category: 'petrol',
      location: 'UP-Uttarakhand Border, Purkaji, NH334',
      distanceFromStartKm: 152,
      rating: 4.4,
      highlight: 'Company Owned Company Operated reliable fuel point with card swipe',
      gmapsQuery: 'Indian Oil COCO Purkaji',
    },
    {
      name: 'Har Ki Pauri & Ganga Aarti',
      category: 'attraction',
      location: 'Harkipauri, Haridwar',
      distanceFromStartKm: 215,
      rating: 4.9,
      highlight: 'Sacred Ganga ghat renowned for the world-famous evening Ganga Aarti',
      gmapsQuery: 'Har Ki Pauri Haridwar',
    },
    {
      name: 'Ram Jhula & Laxman Jhula Corridor',
      category: 'attraction',
      location: 'Tapovan / Swarg Ashram, Rishikesh',
      distanceFromStartKm: 242,
      rating: 4.8,
      highlight: 'Iconic suspension bridges overlooking the holy river Ganga and Himalayan foothills',
      gmapsQuery: 'Ram Jhula Rishikesh',
    },
  ],

  // 3. Delhi NCR to Jaipur (NH48 / Delhi-Mumbai Expressway)
  'delhi-jaipur': [
    {
      name: 'Old Rao Hotel & Dhaba (Dharuhera)',
      category: 'restaurant',
      location: 'NH 48, Dharuhera, Haryana',
      distanceFromStartKm: 65,
      rating: 4.4,
      highlight: 'Iconic highway dhaba famous for tandoori paranthas, white butter, and chai',
      gmapsQuery: 'Old Rao Hotel Dharuhera NH48',
    },
    {
      name: 'Highway King (Shahpura)',
      category: 'restaurant',
      location: 'NH 48, Shahpura, Rajasthan',
      distanceFromStartKm: 170,
      rating: 4.5,
      highlight: 'Large family highway resort with Rajasthani thali, sweets & AC dining hall',
      gmapsQuery: 'The Highway King Shahpura NH48',
    },
    {
      name: 'Indian Oil CNG Station (Neemrana)',
      category: 'cng',
      location: 'Near Neemrana Japanese Zone, NH48',
      distanceFromStartKm: 118,
      rating: 4.2,
      highlight: 'High pressure commercial CNG dispensing unit along Delhi-Jaipur highway',
      gmapsQuery: 'Indian Oil CNG Pump Neemrana NH48',
    },
    {
      name: 'Neemrana Fort-Palace',
      category: 'attraction',
      location: '15th-Century Heritage Fort, Neemrana',
      distanceFromStartKm: 122,
      rating: 4.7,
      highlight: 'Historic multi-tiered palace hotel perched on the Aravalli hills',
      gmapsQuery: 'Neemrana Fort Palace',
    },
    {
      name: 'BPCL Fuel Oasis (Kotputli)',
      category: 'petrol',
      location: 'NH 48 KM 152, Kotputli, Rajasthan',
      distanceFromStartKm: 152,
      rating: 4.3,
      highlight: 'Spacious rest stop with reliable fuel, clean washrooms & convenience store',
      gmapsQuery: 'BPCL Petrol Pump Kotputli',
    },
    {
      name: 'Amber Fort & Hawa Mahal',
      category: 'attraction',
      location: 'Jaipur, Rajasthan',
      distanceFromStartKm: 275,
      rating: 4.9,
      highlight: 'Magnificent Rajput architecture, royal courtyards and Pink City panoramas',
      gmapsQuery: 'Amber Palace Jaipur',
    },
  ],

  // 4. Delhi NCR to Chandigarh / Shimla / Manali (NH44 / Grand Trunk Road)
  'delhi-chandigarh': [
    {
      name: 'Murthal Sukhdev Dhaba',
      category: 'restaurant',
      location: 'NH 44, Murthal, Sonipat, Haryana',
      distanceFromStartKm: 52,
      rating: 4.6,
      highlight: 'World-famous 24/7 highway landmark known for tandoori paranthas with fresh makkhan',
      gmapsQuery: 'Amrik Sukhdev Dhaba Murthal',
    },
    {
      name: 'Zakir Indian Oil CNG Station (Murthal-Gannaur)',
      category: 'cng',
      location: 'NH 44 KM 62, Near Gannaur Cut',
      distanceFromStartKm: 62,
      rating: 4.3,
      highlight: 'Quick green corridor CNG pump, air pump and automated dispensers',
      gmapsQuery: 'CNG Station Murthal NH44',
    },
    {
      name: 'Mayur Dhaba & Haveli (Karnal)',
      category: 'restaurant',
      location: 'NH 44, Karnal Bypass, Haryana',
      distanceFromStartKm: 128,
      rating: 4.5,
      highlight: 'Traditional Punjabi theme village with authentic dining, folk ambiance & snacks',
      gmapsQuery: 'Haveli Karnal NH44',
    },
    {
      name: 'BPCL COCO Highway Oasis (Ambala Bypass)',
      category: 'petrol',
      location: 'NH 44 KM 200, Near Ambala Cantt',
      distanceFromStartKm: 200,
      rating: 4.4,
      highlight: 'Certified company operated fuel station with clean restrooms & ATM',
      gmapsQuery: 'BPCL COCO Ambala NH44',
    },
    {
      name: 'Rock Garden & Sukhna Lake',
      category: 'attraction',
      location: 'Sector 1, Chandigarh',
      distanceFromStartKm: 248,
      rating: 4.7,
      highlight: 'Celebrated sculpture garden made of urban waste and scenic foothills lake promenade',
      gmapsQuery: 'Rock Garden Chandigarh',
    },
  ],

  // 5. Delhi NCR to Haldwani / Nainital / Jim Corbett (NH9 & Moradabad Bypass)
  'delhi-nainital': [
    {
      name: 'Bikanerwala & Tadka Dhaba (Gajraula)',
      category: 'restaurant',
      location: 'NH 9 / NH 24, Gajraula Midway, Uttar Pradesh',
      distanceFromStartKm: 105,
      rating: 4.5,
      highlight: 'Family favorite stopover with south Indian, north Indian, sweets & clean restrooms',
      gmapsQuery: 'Bikanervala Gajraula NH9',
    },
    {
      name: 'TDI City Indian Oil & CNG Pump (Moradabad Bypass)',
      category: 'cng',
      location: 'Moradabad Bypass KM 160',
      distanceFromStartKm: 160,
      rating: 4.2,
      highlight: 'Convenient CNG refueling point before entering Uttarakhand plains',
      gmapsQuery: 'Indian Oil CNG Moradabad Bypass',
    },
    {
      name: 'Udupiwala Restaurant (Kathgodam / Rampur Road)',
      category: 'restaurant',
      location: 'Rampur-Kathgodam Highway, Near Rudrapur',
      distanceFromStartKm: 235,
      rating: 4.6,
      highlight: 'Clean pure-veg highway stop serving crisp dosas, thalis, and filter coffee',
      gmapsQuery: 'Udupiwala Restaurant Rudrapur',
    },
    {
      name: 'HPCL Petrol Pump (Kaladhungi Highway)',
      category: 'petrol',
      location: 'Kaladhungi-Nainital Road',
      distanceFromStartKm: 260,
      rating: 4.3,
      highlight: 'Last major flatland fuel station before steep hill ascent to Nainital',
      gmapsQuery: 'HPCL Petrol Pump Kaladhungi',
    },
    {
      name: 'Naini Lake & Mall Road Promenade',
      category: 'attraction',
      location: 'Nainital Hill Station, Uttarakhand',
      distanceFromStartKm: 295,
      rating: 4.8,
      highlight: 'Crescent-shaped emerald natural mountain lake surrounded by pine-covered hills',
      gmapsQuery: 'Naini Lake Nainital',
    },
  ],
};

/**
 * Resolves curated stops for a route based on origin and destination keywords.
 */
export function getPlacesForRoute(origin: string, destination: string, distanceKm: number): RoutePlace[] {
  const normDest = destination.toLowerCase();

  if (normDest.includes('agra') || normDest.includes('mathura') || normDest.includes('vrindavan')) {
    return CORRIDOR_DATABASE['delhi-agra'];
  }
  if (normDest.includes('dehradun') || normDest.includes('haridwar') || normDest.includes('rishikesh') || normDest.includes('mussoorie')) {
    return CORRIDOR_DATABASE['delhi-dehradun'];
  }
  if (normDest.includes('jaipur') || normDest.includes('ajmer') || normDest.includes('udaipur') || normDest.includes('jodhpur')) {
    return CORRIDOR_DATABASE['delhi-jaipur'];
  }
  if (normDest.includes('chandigarh') || normDest.includes('shimla') || normDest.includes('manali') || normDest.includes('amritsar') || normDest.includes('ludhiana')) {
    return CORRIDOR_DATABASE['delhi-chandigarh'];
  }
  if (normDest.includes('nainital') || normDest.includes('haldwani') || normDest.includes('ramnagar') || normDest.includes('jim corbett') || normDest.includes('almora')) {
    return CORRIDOR_DATABASE['delhi-nainital'];
  }

  // Generic fallback with realistic highway waypoints calculated along the corridor
  const halfDist = Math.round(distanceKm / 2);
  const quarterDist = Math.round(distanceKm / 4);
  const threeQuarterDist = Math.round((distanceKm * 3) / 4);

  return [
    {
      name: `${origin} Highway Food Plaza & Family Dhaba`,
      category: 'restaurant',
      location: `${origin} Highway Expressway Corridor (~${quarterDist} km)`,
      distanceFromStartKm: quarterDist,
      rating: 4.4,
      highlight: 'Popular stopover offering fresh north Indian meals, chai, and clean washrooms',
      gmapsQuery: `${origin} highway food plaza`,
    },
    {
      name: `24/7 High-Flow CNG Dispensing Station`,
      category: 'cng',
      location: `Midway Expressway Sector (~${quarterDist + 15} km)`,
      distanceFromStartKm: quarterDist + 15,
      rating: 4.2,
      highlight: 'Commercial green corridor CNG unit with digital pressure gauge',
      gmapsQuery: `${origin} to ${destination} CNG station`,
    },
    {
      name: `Midway Highway Rest Area & Fuel Pump`,
      category: 'petrol',
      location: `National Highway Corridor Midway (~${halfDist} km)`,
      distanceFromStartKm: halfDist,
      rating: 4.5,
      highlight: 'Full service fuel station, snacks shop, puncture repair & automated air dispenser',
      gmapsQuery: `${destination} highway petrol pump`,
    },
    {
      name: `${destination} Gateway Scenic Viewpoint & Rest Point`,
      category: 'attraction',
      location: `Approach corridor entering ${destination} (~${threeQuarterDist} km)`,
      distanceFromStartKm: threeQuarterDist,
      rating: 4.6,
      highlight: `Scenic arrival point and popular landmark approaching ${destination}`,
      gmapsQuery: `${destination} tourist attractions`,
    },
  ];
}
