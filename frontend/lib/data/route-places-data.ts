export interface RoutePlace {
  name: string;
  category: 'restaurant' | 'petrol' | 'cng' | 'attraction';
  location: string;
  distanceFromStartKm: number;
  highlight?: string;
  gmapsQuery?: string;
}

export interface CorridorPlaces {
  corridorName: string;
  highways: string[];
  places: RoutePlace[];
}

// Curated highway waypoints and popular traveler stops across major North India expressways
export const CORRIDOR_DATABASE: Record<string, RoutePlace[]> = {
  // 1. Delhi NCR to Agra / Mathura (Yamuna Expressway & NH19)
  'delhi-agra': [
    {
      name: 'Yamuna Expressway Mile 65 Food Court & Starbucks',
      category: 'restaurant',
      location: 'Yamuna Expressway KM 65, Jewar Toll Plaza',
      distanceFromStartKm: 65,
      highlight: 'Multi-cuisine food court, washrooms, Costa Coffee & Haldiram',
      gmapsQuery: 'Yamuna Expressway Jewar Food Plaza',
    },
    {
      name: 'Indian Oil & CNG Station (Mile 68 Rest Stop)',
      category: 'cng',
      location: 'Yamuna Expressway KM 68',
      distanceFromStartKm: 68,
      highlight: 'CNG and Diesel dispenser with vehicle air check facility',
      gmapsQuery: 'Indian Oil CNG Yamuna Expressway Jewar',
    },
    {
      name: 'Brijwasi Mithai & Restaurant (Mathura Cut)',
      category: 'restaurant',
      location: 'Near Mathura Toll Exit, Yamuna Expressway',
      distanceFromStartKm: 110,
      highlight: 'Mathura peda, pure vegetarian thali & snacks',
      gmapsQuery: 'Brijwasi Yamuna Expressway Mathura',
    },
    {
      name: 'Shree Krishna Janmabhoomi Temple Complex',
      category: 'attraction',
      location: 'Mathura (5 km detour from expressway)',
      distanceFromStartKm: 120,
      highlight: 'Historic birthplace of Lord Krishna with heritage temple complex',
      gmapsQuery: 'Krishna Janmabhoomi Mathura',
    },
    {
      name: 'BPCL Petrol & CNG Highway Pump (Khandauli)',
      category: 'petrol',
      location: 'Yamuna Expressway KM 155, Near Khandauli Toll',
      distanceFromStartKm: 155,
      highlight: 'Fuel dispenser, rest facilities & puncture repair',
      gmapsQuery: 'BPCL Petrol Pump Khandauli Agra',
    },
    {
      name: 'Taj Mahal & Agra Fort',
      category: 'attraction',
      location: 'Dharmapuri, Forest Colony, Tajganj, Agra',
      distanceFromStartKm: 210,
      highlight: 'UNESCO World Heritage monument and Mughal architectural citadel',
      gmapsQuery: 'Taj Mahal Agra',
    },
  ],

  // 2. Delhi NCR to Dehradun / Haridwar / Rishikesh (Delhi-Meerut Expressway & NH334)
  'delhi-dehradun': [
    {
      name: 'Cheetal Grand Dhaba & Restaurant (Khatauli)',
      category: 'restaurant',
      location: 'NH 58 / NH 334, Khatauli Bypass, Muzaffarnagar',
      distanceFromStartKm: 98,
      highlight: 'Established highway stopover with dining lawns and snack counters',
      gmapsQuery: 'Cheetal Grand Khatauli NH58',
    },
    {
      name: 'HPCL Auto LPG & CNG Station (Meerut Outer)',
      category: 'cng',
      location: 'Delhi-Meerut Expressway Section 4, Partapur',
      distanceFromStartKm: 52,
      highlight: 'CNG queue, electronic air tower and restrooms',
      gmapsQuery: 'HPCL CNG Petrol Pump Partapur Meerut',
    },
    {
      name: 'Namaste Midway & Food Plaza (Mansurpur)',
      category: 'restaurant',
      location: 'NH 334, Mansurpur, Uttar Pradesh',
      distanceFromStartKm: 115,
      highlight: 'Highway food plaza featuring Subway, Haldiram, Costa Coffee & rest areas',
      gmapsQuery: 'Namaste Midway Mansurpur NH58',
    },
    {
      name: 'Indian Oil COCO Fuel Station (Purkaji Border)',
      category: 'petrol',
      location: 'UP-Uttarakhand Border, Purkaji, NH334',
      distanceFromStartKm: 152,
      highlight: 'Company-operated fuel retail point before entering Uttarakhand',
      gmapsQuery: 'Indian Oil COCO Purkaji',
    },
    {
      name: 'Har Ki Pauri Ghat',
      category: 'attraction',
      location: 'Harkipauri, Haridwar',
      distanceFromStartKm: 215,
      highlight: 'Sacred Ganga ghat renowned for the daily evening Ganga Aarti',
      gmapsQuery: 'Har Ki Pauri Haridwar',
    },
    {
      name: 'Ram Jhula & Laxman Jhula Corridor',
      category: 'attraction',
      location: 'Tapovan / Swarg Ashram, Rishikesh',
      distanceFromStartKm: 242,
      highlight: 'Suspension bridges over the river Ganga and gateway to the Himalayas',
      gmapsQuery: 'Ram Jhula Rishikesh',
    },
  ],

  // 3. Delhi NCR to Jaipur (NH48 / Delhi-Jaipur Highway)
  'delhi-jaipur': [
    {
      name: 'Old Rao Hotel & Dhaba (Dharuhera)',
      category: 'restaurant',
      location: 'NH 48, Dharuhera, Haryana',
      distanceFromStartKm: 65,
      highlight: 'Highway dhaba known for tandoori paranthas, tea, and meals',
      gmapsQuery: 'Old Rao Hotel Dharuhera NH48',
    },
    {
      name: 'The Highway King (Shahpura)',
      category: 'restaurant',
      location: 'NH 48, Shahpura, Rajasthan',
      distanceFromStartKm: 170,
      highlight: 'Family highway complex with dining hall, Rajasthani thali & sweets',
      gmapsQuery: 'The Highway King Shahpura NH48',
    },
    {
      name: 'Indian Oil CNG Station (Neemrana)',
      category: 'cng',
      location: 'Near Neemrana Japanese Zone, NH48',
      distanceFromStartKm: 118,
      highlight: 'Commercial CNG station along the Delhi-Jaipur highway',
      gmapsQuery: 'Indian Oil CNG Pump Neemrana NH48',
    },
    {
      name: 'Neemrana Fort-Palace',
      category: 'attraction',
      location: 'Neemrana, Rajasthan',
      distanceFromStartKm: 122,
      highlight: '15th-century heritage palace overlooking the Aravalli range',
      gmapsQuery: 'Neemrana Fort Palace',
    },
    {
      name: 'BPCL Fuel Oasis (Kotputli)',
      category: 'petrol',
      location: 'NH 48 KM 152, Kotputli, Rajasthan',
      distanceFromStartKm: 152,
      highlight: 'Rest stop with fuel station and convenience store',
      gmapsQuery: 'BPCL Petrol Pump Kotputli',
    },
    {
      name: 'Amber Fort & Hawa Mahal',
      category: 'attraction',
      location: 'Jaipur, Rajasthan',
      distanceFromStartKm: 275,
      highlight: 'Historic Rajput architecture and royal courtyards in the Pink City',
      gmapsQuery: 'Amber Palace Jaipur',
    },
  ],

  // 4. Delhi NCR to Chandigarh / Shimla / Manali (NH44 / Grand Trunk Road)
  'delhi-chandigarh': [
    {
      name: 'Amrik Sukhdev Dhaba (Murthal)',
      category: 'restaurant',
      location: 'NH 44, Murthal, Sonipat, Haryana',
      distanceFromStartKm: 52,
      highlight: 'Highway food landmark known for tandoori paranthas and traditional snacks',
      gmapsQuery: 'Amrik Sukhdev Dhaba Murthal',
    },
    {
      name: 'Indian Oil CNG Station (Murthal-Gannaur)',
      category: 'cng',
      location: 'NH 44 KM 62, Near Gannaur Cut',
      distanceFromStartKm: 62,
      highlight: 'Green corridor CNG refueling station along NH44',
      gmapsQuery: 'CNG Station Murthal NH44',
    },
    {
      name: 'Haveli Heritage Dhaba (Karnal)',
      category: 'restaurant',
      location: 'NH 44, Karnal Bypass, Haryana',
      distanceFromStartKm: 128,
      highlight: 'Punjabi themed restaurant serving north Indian food and refreshments',
      gmapsQuery: 'Haveli Karnal NH44',
    },
    {
      name: 'BPCL COCO Fuel Station (Ambala Bypass)',
      category: 'petrol',
      location: 'NH 44 KM 200, Near Ambala Cantt',
      distanceFromStartKm: 200,
      highlight: 'Company-operated fuel stop with restrooms and ATM',
      gmapsQuery: 'BPCL COCO Ambala NH44',
    },
    {
      name: 'Rock Garden & Sukhna Lake',
      category: 'attraction',
      location: 'Sector 1, Chandigarh',
      distanceFromStartKm: 248,
      highlight: 'Sculpture garden and lake promenade near the Shivalik foothills',
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
      highlight: 'Highway stopover with vegetarian meals, snacks, and sweets',
      gmapsQuery: 'Bikanervala Gajraula NH9',
    },
    {
      name: 'Indian Oil & CNG Station (Moradabad Bypass)',
      category: 'cng',
      location: 'Moradabad Bypass KM 160',
      distanceFromStartKm: 160,
      highlight: 'CNG refueling stop before entering the Terai region',
      gmapsQuery: 'Indian Oil CNG Moradabad Bypass',
    },
    {
      name: 'Udupiwala Restaurant (Kathgodam / Rampur Road)',
      category: 'restaurant',
      location: 'Rampur-Kathgodam Highway, Near Rudrapur',
      distanceFromStartKm: 235,
      highlight: 'Pure vegetarian restaurant serving south and north Indian dishes',
      gmapsQuery: 'Udupiwala Restaurant Rudrapur',
    },
    {
      name: 'HPCL Petrol Pump (Kaladhungi Road)',
      category: 'petrol',
      location: 'Kaladhungi-Nainital Road',
      distanceFromStartKm: 260,
      highlight: 'Plains-level fuel station before the hill climb to Nainital',
      gmapsQuery: 'HPCL Petrol Pump Kaladhungi',
    },
    {
      name: 'Naini Lake & Mall Road Promenade',
      category: 'attraction',
      location: 'Nainital, Uttarakhand',
      distanceFromStartKm: 295,
      highlight: 'Mountain lake surrounded by forested peaks and scenic walking promenade',
      gmapsQuery: 'Naini Lake Nainital',
    },
  ],
};

/**
 * Resolves curated traveler stops for a route based on destination keywords.
 */
export function getPlacesForRoute(destination: string, distanceKm: number): RoutePlace[] {
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

  // Generic guidance based on approximate corridor distance
  const halfDist = Math.round(distanceKm / 2);
  const quarterDist = Math.round(distanceKm / 4);
  const threeQuarterDist = Math.round((distanceKm * 3) / 4);

  return [
    {
      name: 'Highway Food Plaza & Family Dhaba',
      category: 'restaurant',
      location: `Corridor Sector (~${quarterDist} km)`,
      distanceFromStartKm: quarterDist,
      highlight: 'Highway food stop offering tea, meals, and rest facilities',
      gmapsQuery: `${destination} highway food plaza`,
    },
    {
      name: 'CNG Dispensing Station',
      category: 'cng',
      location: `Midway Highway Corridor (~${quarterDist + 20} km)`,
      distanceFromStartKm: quarterDist + 20,
      highlight: 'Commercial green corridor CNG dispensing unit',
      gmapsQuery: `${destination} CNG station`,
    },
    {
      name: 'Highway Fuel Station & Rest Stop',
      category: 'petrol',
      location: `Midway Corridor Sector (~${halfDist} km)`,
      distanceFromStartKm: halfDist,
      highlight: 'Refueling station with automated air dispenser and basic amenities',
      gmapsQuery: `${destination} highway petrol pump`,
    },
    {
      name: `${destination} City Entry Landmark`,
      category: 'attraction',
      location: `Approaching ${destination} (~${threeQuarterDist} km)`,
      distanceFromStartKm: threeQuarterDist,
      highlight: `Prominent landmark and scenic area on arrival approach to ${destination}`,
      gmapsQuery: `${destination} tourist places`,
    },
  ];
}
