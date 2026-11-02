export interface RouteMilestone {
  town: string;
  km: number;
  timeText: string;
  description: string;
}

export interface RouteWeather {
  temp: string;
  condition: string;
  feelsLike: string;
}

export interface RoutePlaceItem {
  name: string;
  category: 'restaurant' | 'petrol' | 'cng' | 'attraction';
  location: string;
  distanceKm: number;
  image?: string;
  highlight?: string;
}

export interface CorridorDetail {
  highway: string;
  routeChain: string;
  roadType: string;
  milestones: RouteMilestone[];
  weather: RouteWeather;
  travelTips: string[];
  places: {
    restaurants: RoutePlaceItem[];
    petrolPumps: RoutePlaceItem[];
    cngPumps: RoutePlaceItem[];
    attractions: RoutePlaceItem[];
  };
  gallery: {
    src: string;
    caption: string;
    alt: string;
  }[];
}

export const KNOWN_CORRIDORS: Record<string, CorridorDetail> = {
  // Delhi to Nainital / Haldwani / Jim Corbett
  'delhi-nainital': {
    highway: 'via NH9',
    routeChain: 'Delhi → Hapur → Gajraula → Moradabad → Rudrapur → Haldwani → Nainital',
    roadType: 'National Highway (NH9) & Well Maintained Hill Roads',
    weather: {
      temp: '22°C',
      condition: 'Partly Cloudy',
      feelsLike: '20°C',
    },
    travelTips: [
      'Start early to avoid city traffic and enjoy pleasant morning highway drive.',
      'Carry light woollen clothes as mountain weather can be cool even in summer.',
      'Keep some cash for small highway dhabas and toll plazas if required.',
      'Plan stops at recommended food plazas like Gajraula Midway for fresh meals.',
      'Book your return cab in advance during weekend peak rush for assured availability.',
    ],
    milestones: [
      { town: 'Delhi', km: 0, timeText: '0 hr', description: 'Start from Delhi via NH9 towards Hapur' },
      { town: 'Hapur', km: 60, timeText: '1 - 1.5 hr', description: 'Continue on NH9 towards Gajraula' },
      { town: 'Moradabad', km: 155, timeText: '2 - 2.5 hr', description: 'Pass through Moradabad bypass, good stops available' },
      { town: 'Rudrapur', km: 220, timeText: '4.5 - 5 hr', description: 'Reach Rudrapur, major commercial hub before hills' },
      { town: 'Haldwani', km: 260, timeText: '5 - 6 hr', description: 'Enter Haldwani, gateway base city for Nainital' },
      { town: 'Nainital', km: 300, timeText: '6 - 7 hr', description: 'Reach Nainital, enjoy the beautiful hill station & Naini Lake' },
    ],
    places: {
      restaurants: [
        { name: 'Haveli Restaurant', category: 'restaurant', location: 'Hapur, UP', distanceKm: 45, image: '/destinations/chandigarh.jpg' },
        { name: 'Zaika Family Restaurant', category: 'restaurant', location: 'Moradabad, UP', distanceKm: 110, image: '/destinations/amritsar.jpg' },
        { name: 'Midway Treat', category: 'restaurant', location: 'Rudrapur, UK', distanceKm: 210, image: '/destinations/lucknow.jpg' },
        { name: 'Shiva Tourist Dhaba', category: 'restaurant', location: 'Babugarh Bypass, UP', distanceKm: 65, image: '/destinations/chandigarh.jpg' },
        { name: 'Bikanervala Highway Food Court', category: 'restaurant', location: 'Gajraula, UP', distanceKm: 105, image: '/destinations/agra.jpg' },
        { name: 'Tadka Punjab Ka Dhaba', category: 'restaurant', location: 'Rampur Bypass, UP', distanceKm: 185, image: '/destinations/amritsar.jpg' },
      ],
      petrolPumps: [
        { name: 'Indian Oil Petrol Pump', category: 'petrol', location: 'Hapur, UP', distanceKm: 52 },
        { name: 'Bharat Petroleum', category: 'petrol', location: 'Moradabad, UP', distanceKm: 118 },
        { name: 'HP Petrol Pump', category: 'petrol', location: 'Rudrapur, UK', distanceKm: 218 },
        { name: 'Reliance Petroleum Highway Station', category: 'petrol', location: 'Gajraula, UP', distanceKm: 102 },
        { name: 'Indian Oil COCO Fuel Center', category: 'petrol', location: 'Rampur, UP', distanceKm: 180 },
      ],
      cngPumps: [
        { name: 'IOCL CNG Station', category: 'cng', location: 'Hapur, UP', distanceKm: 50 },
        { name: 'Mahanagar Gas CNG', category: 'cng', location: 'Moradabad, UP', distanceKm: 128 },
        { name: 'Green Gas CNG', category: 'cng', location: 'Rudrapur, UK', distanceKm: 235 },
        { name: 'Torrent Gas CNG Station', category: 'cng', location: 'Gajraula, UP', distanceKm: 98 },
        { name: 'Adani Total Gas CNG', category: 'cng', location: 'Rampur, UP', distanceKm: 175 },
      ],
      attractions: [
        { name: 'Naini Lake', category: 'attraction', location: 'Nainital, Uttarakhand', distanceKm: 300, image: '/destinations/nainital.webp' },
        { name: 'Naina Devi Temple', category: 'attraction', location: 'Nainital, Uttarakhand', distanceKm: 300, image: '/destinations/haridwar.webp' },
        { name: 'Snow View Point', category: 'attraction', location: 'Nainital, Uttarakhand', distanceKm: 302, image: '/destinations/mussoorie.webp' },
        { name: 'Tiffin Top (Dorothy\'s Seat)', category: 'attraction', location: 'Ayapatta Hill, Nainital', distanceKm: 304, image: '/destinations/nainital.webp' },
        { name: 'Eco Cave Gardens', category: 'attraction', location: 'Sukhatal, Nainital', distanceKm: 301, image: '/destinations/ramnagar.webp' },
        { name: 'Bhimtal Lake & Island', category: 'attraction', location: 'Bhimtal, Uttarakhand', distanceKm: 322, image: '/destinations/nainital.webp' },
      ],
    },
    gallery: [
      { src: '/destinations/nainital.webp', caption: 'NH9 Highway View', alt: 'NH9 Highway Corridor View from Delhi to Nainital' },
      { src: '/destinations/ramnagar.webp', caption: 'Corbett National Park', alt: 'Jim Corbett National Park and scenic foothill drive' },
      { src: '/destinations/dehradun.webp', caption: 'Haldwani City View', alt: 'Haldwani base town approaching Nainital hills' },
      { src: '/destinations/nainital.webp', caption: 'Naini Lake', alt: 'Naini Lake surrounded by green mountain peaks' },
      { src: '/destinations/haridwar.webp', caption: 'Naina Devi Temple', alt: 'Historic Naina Devi Temple on northern shore of Naini Lake' },
    ],
  },

  // Delhi to Dehradun / Mussoorie / Rishikesh
  'delhi-dehradun': {
    highway: 'via Delhi-Meerut Expressway & NH334',
    routeChain: 'Delhi → Ghaziabad → Meerut → Muzaffarnagar → Roorkee → Dehradun',
    roadType: 'Delhi-Meerut Expressway & Smooth 4-Lane NH334',
    weather: {
      temp: '24°C',
      condition: 'Pleasant & Breezy',
      feelsLike: '23°C',
    },
    travelTips: [
      'Delhi-Meerut Expressway saves over 45 minutes on the initial highway stretch.',
      'Cheetal Grand at Khatauli Bypass is the legendary breakfast and snack stopover.',
      'When visiting Dehradun, plan day trips to nearby Sahastradhara and Robber\'s Cave.',
      'Hill climb from Dehradun to Mussoorie takes around 1 - 1.5 hours on scenic ghats.',
      'Cabs are fully equipped with luggage carriers and trained mountain drivers.',
    ],
    milestones: [
      { town: 'Delhi', km: 0, timeText: '0 hr', description: 'Depart Delhi via Akshardham Delhi-Meerut Expressway' },
      { town: 'Meerut Outer', km: 55, timeText: '45 mins', description: 'Bypass Meerut and merge smoothly onto NH334' },
      { town: 'Khatauli (Cheetal)', km: 98, timeText: '1.5 - 2 hr', description: 'Cheetal Grand and highway food plazas' },
      { town: 'Muzaffarnagar', km: 125, timeText: '2.5 hr', description: 'Smooth bypass around Muzaffarnagar city' },
      { town: 'Roorkee', km: 175, timeText: '3.5 hr', description: 'Historic IIT Roorkee town near Ganga Canal' },
      { town: 'Dehradun', km: 245, timeText: '4.5 - 5 hr', description: 'Arrive at Dehradun valley, capital of Uttarakhand' },
    ],
    places: {
      restaurants: [
        { name: 'Cheetal Grand', category: 'restaurant', location: 'Khatauli Bypass, UP', distanceKm: 98, image: '/destinations/chandigarh.jpg' },
        { name: 'Namaste Midway Food Court', category: 'restaurant', location: 'Mansurpur, UP', distanceKm: 112, image: '/destinations/agra.jpg' },
        { name: 'Pandit Ji Da Dhaba', category: 'restaurant', location: 'Roorkee Highway, UK', distanceKm: 170, image: '/destinations/amritsar.jpg' },
        { name: 'Haldiram\'s Express Food Plaza', category: 'restaurant', location: 'Meerut Bypass, UP', distanceKm: 58, image: '/destinations/chandigarh.jpg' },
        { name: 'Bikanerwala Expressway', category: 'restaurant', location: 'Muzaffarnagar Bypass, UP', distanceKm: 126, image: '/destinations/lucknow.jpg' },
        { name: 'Shiva Dhaba & Tea Point', category: 'restaurant', location: 'Mohand Ghats, UK', distanceKm: 215, image: '/destinations/amritsar.jpg' },
      ],
      petrolPumps: [
        { name: 'Indian Oil COCO Fuel Station', category: 'petrol', location: 'Khatauli, UP', distanceKm: 99 },
        { name: 'Bharat Petroleum Highway Center', category: 'petrol', location: 'Meerut Bypass, UP', distanceKm: 54 },
        { name: 'HPCL Auto Care Centre', category: 'petrol', location: 'Roorkee Bypass, UK', distanceKm: 172 },
        { name: 'Reliance Petroleum Fuel Point', category: 'petrol', location: 'Muzaffarnagar, UP', distanceKm: 128 },
        { name: 'Indian Oil Swagat Fuel Center', category: 'petrol', location: 'Dehradun Road, UK', distanceKm: 220 },
      ],
      cngPumps: [
        { name: 'Indraprastha Gas (IGL) CNG', category: 'cng', location: 'Meerut Expressway, UP', distanceKm: 52 },
        { name: 'Torrent Gas CNG Station', category: 'cng', location: 'Khatauli, UP', distanceKm: 96 },
        { name: 'Green Gas CNG Station', category: 'cng', location: 'Roorkee, UK', distanceKm: 168 },
        { name: 'Adani Total CNG Station', category: 'cng', location: 'Muzaffarnagar, UP', distanceKm: 122 },
        { name: 'GAIL Gas CNG Pump', category: 'cng', location: 'Dehradun ISBT Road, UK', distanceKm: 240 },
      ],
      attractions: [
        { name: 'Robber\'s Cave (Guchhupani)', category: 'attraction', location: 'Anarwala, Dehradun', distanceKm: 248, image: '/destinations/dehradun.webp' },
        { name: 'Sahastradhara Natural Spring', category: 'attraction', location: 'Timilimanjri, Dehradun', distanceKm: 252, image: '/destinations/dehradun.webp' },
        { name: 'Mindrolling Buddha Temple', category: 'attraction', location: 'Clement Town, Dehradun', distanceKm: 246, image: '/destinations/haridwar.webp' },
        { name: 'Forest Research Institute (FRI)', category: 'attraction', location: 'Chakrata Road, Dehradun', distanceKm: 247, image: '/destinations/chandigarh.jpg' },
        { name: 'Tapkeshwar Mahadev Temple', category: 'attraction', location: 'Garhi Cantt, Dehradun', distanceKm: 249, image: '/destinations/haridwar.webp' },
        { name: 'Malsi Deer Park (Zoo)', category: 'attraction', location: 'Mussoorie Road, Dehradun', distanceKm: 254, image: '/destinations/mussoorie.webp' },
      ],
    },
    gallery: [
      { src: '/destinations/chandigarh.jpg', caption: 'Delhi-Meerut Expressway View', alt: 'Delhi-Meerut Expressway Highway View' },
      { src: '/destinations/dehradun.webp', caption: 'Rajaji National Park Foothills', alt: 'Rajaji forest foothills approaching Dehradun' },
      { src: '/destinations/dehradun.webp', caption: 'Dehradun Valley City View', alt: 'Dehradun valley city view' },
      { src: '/destinations/dehradun.webp', caption: 'Robber\'s Cave (Guchhupani)', alt: 'Robbers Cave natural limestone stream in Dehradun' },
      { src: '/destinations/dehradun.webp', caption: 'Sahastradhara Thousandfold Spring', alt: 'Sahastradhara natural waterfall and spring' },
    ],
  },

  // Delhi to Jaipur
  'delhi-jaipur': {
    highway: 'via Delhi-Jaipur Expressway (NH48 / NE4)',
    routeChain: 'Delhi → Gurugram → Dharuhera → Neemrana → Behror → Kotputli → Shahpura → Jaipur',
    roadType: 'Delhi-Mumbai Expressway (NE4) & 6-Lane NH48',
    weather: {
      temp: '28°C',
      condition: 'Sunny & Clear',
      feelsLike: '27°C',
    },
    travelTips: [
      'Delhi-Mumbai Expressway (NE4) offers the fastest driving time between Delhi and Jaipur.',
      'Old Rao Hotel at Dharuhera & Hotel Highway King at Shahpura are top food plazas.',
      'Keep FASTag charged for smooth passing across Kherki Daula & Shahjahanpur toll plazas.',
      'City palace and Amber Fort entry tickets can be booked online to skip long tourist queues.',
      'Urgent Taxis provides comfortable AC Sedan and Innova Crysta cabs for doorstep pickup.',
    ],
    milestones: [
      { town: 'Delhi (Dhaula Kuan)', km: 0, timeText: '0 hr', description: 'Depart Delhi via NH48 towards Gurugram' },
      { town: 'Manesar / Dharuhera', km: 65, timeText: '1 - 1.5 hr', description: 'Cross NCR industrial corridor onto open highway' },
      { town: 'Neemrana', km: 120, timeText: '2 - 2.5 hr', description: 'Famous heritage fort palace midway stopover' },
      { town: 'Behror', km: 140, timeText: '3 hr', description: 'Midway point with popular family restaurants' },
      { town: 'Shahpura', km: 210, timeText: '4 hr', description: 'Approaching Rajasthan Aravalli hill views' },
      { town: 'Jaipur (Pink City)', km: 270, timeText: '4.5 - 5 hr', description: 'Arrive at the capital city of Rajasthan' },
    ],
    places: {
      restaurants: [
        { name: 'Old Rao Hotel', category: 'restaurant', location: 'Dharuhera, Haryana', distanceKm: 70, image: '/destinations/jaipur.webp' },
        { name: 'Hotel Highway King', category: 'restaurant', location: 'Shahpura, Rajasthan', distanceKm: 205, image: '/destinations/chandigarh.jpg' },
        { name: 'Mannat Dhaba', category: 'restaurant', location: 'Neemrana, Rajasthan', distanceKm: 122, image: '/destinations/amritsar.jpg' },
        { name: 'McDonald\'s & CCD Midway', category: 'restaurant', location: 'Behror, Rajasthan', distanceKm: 138, image: '/destinations/agra.jpg' },
        { name: 'Haldiram\'s Expressway Plaza', category: 'restaurant', location: 'Kotputli, Rajasthan', distanceKm: 162, image: '/destinations/lucknow.jpg' },
        { name: 'Rawat Mishthan Bhandar', category: 'restaurant', location: 'Station Road, Jaipur', distanceKm: 272, image: '/destinations/jaipur.webp' },
      ],
      petrolPumps: [
        { name: 'Indian Oil Swagat COCO', category: 'petrol', location: 'Shahpura, RJ', distanceKm: 208 },
        { name: 'Bharat Petroleum Highway Hub', category: 'petrol', location: 'Dharuhera, HR', distanceKm: 68 },
        { name: 'HPCL Auto Care Centre', category: 'petrol', location: 'Neemrana, RJ', distanceKm: 124 },
        { name: 'Shell Highway Petrol Pump', category: 'petrol', location: 'Kotputli, RJ', distanceKm: 165 },
        { name: 'Reliance Petroleum Fuel Point', category: 'petrol', location: 'Behror, RJ', distanceKm: 142 },
      ],
      cngPumps: [
        { name: 'Haryana City Gas CNG', category: 'cng', location: 'Dharuhera, HR', distanceKm: 66 },
        { name: 'Rajasthan State Gas CNG', category: 'cng', location: 'Neemrana, RJ', distanceKm: 120 },
        { name: 'Torrent Gas CNG Station', category: 'cng', location: 'Shahpura, RJ', distanceKm: 202 },
        { name: 'IGL CNG Highway Station', category: 'cng', location: 'Bilaspur, HR', distanceKm: 55 },
        { name: 'GAIL Gas CNG Station', category: 'cng', location: 'Jaipur Bypass, RJ', distanceKm: 265 },
      ],
      attractions: [
        { name: 'Hawa Mahal (Palace of Winds)', category: 'attraction', location: 'Badi Choupad, Jaipur', distanceKm: 272, image: '/destinations/jaipur.webp' },
        { name: 'Amber Fort & Palace', category: 'attraction', location: 'Amer, Jaipur', distanceKm: 260, image: '/destinations/jaipur.webp' },
        { name: 'Jal Mahal (Water Palace)', category: 'attraction', location: 'Amer Road, Jaipur', distanceKm: 265, image: '/destinations/jaipur.webp' },
        { name: 'City Palace Jaipur', category: 'attraction', location: 'Old City, Jaipur', distanceKm: 271, image: '/destinations/agra.jpg' },
        { name: 'Nahargarh Fort Viewpoint', category: 'attraction', location: 'Aravalli Hills, Jaipur', distanceKm: 275, image: '/destinations/jaipur.webp' },
        { name: 'Jantar Mantar Observatory', category: 'attraction', location: 'Gangori Bazaar, Jaipur', distanceKm: 271, image: '/destinations/jaipur.webp' },
      ],
    },
    gallery: [
      { src: '/destinations/jaipur.webp', caption: 'Delhi-Mumbai Expressway', alt: 'Delhi Mumbai Expressway driving view' },
      { src: '/destinations/jaipur.webp', caption: 'Neemrana Fort Palace', alt: 'Neemrana heritage fort midway stop' },
      { src: '/destinations/jaipur.webp', caption: 'Amber Fort Jaipur', alt: 'Amber fort overlooking the lake' },
      { src: '/destinations/jaipur.webp', caption: 'Hawa Mahal Pink City', alt: 'Historic Hawa Mahal in Jaipur' },
      { src: '/destinations/jaipur.webp', caption: 'Jal Mahal Scenic View', alt: 'Jal Mahal floating in Man Sagar Lake' },
    ],
  },
};

export function getRouteCorridorDetails(
  originName: string,
  destName: string,
  distanceKm: number
): CorridorDetail {
  const normOrigin = originName.toLowerCase().trim();
  const normDest = destName.toLowerCase().trim();
  const key = `${normOrigin}-${normDest}`;

  if (KNOWN_CORRIDORS[key]) {
    return KNOWN_CORRIDORS[key];
  }

  // Check partial key matches
  if (normDest.includes('nainital') || normDest.includes('haldwani') || normDest.includes('ramnagar') || normDest.includes('corbett')) {
    return KNOWN_CORRIDORS['delhi-nainital'];
  }
  if (normDest.includes('dehradun') || normDest.includes('mussoorie') || normDest.includes('rishikesh') || normDest.includes('haridwar')) {
    return KNOWN_CORRIDORS['delhi-dehradun'];
  }
  if (normDest.includes('jaipur') || normDest.includes('ajmer') || normDest.includes('pushkar') || normDest.includes('jodhpur')) {
    return KNOWN_CORRIDORS['delhi-jaipur'];
  }

  // Dynamic corridor generator for any other city
  const isHill = ['shimla', 'manali', 'dharamshala', 'kullu', 'ranikhet', 'almora', 'kausani'].some((h) => normDest.includes(h));
  const highwayName = isHill ? 'via National Expressway & Hill Highway' : 'via 4-Lane National Highway';
  const midpoint = Math.round(distanceKm / 2);
  const quarter1 = Math.round(distanceKm / 4);
  const quarter3 = Math.round((distanceKm * 3) / 4);

  return {
    highway: highwayName,
    routeChain: `${originName} → Highway Corridor → Midway Food Plaza (${midpoint} km) → ${destName}`,
    roadType: isHill ? 'Expressway & Well-Maintained Hill Ghats' : 'Multi-Lane Toll Highway & Fast Bypass',
    weather: {
      temp: isHill ? '19°C' : '26°C',
      condition: isHill ? 'Pleasant Hill Climate' : 'Clear & Sunny',
      feelsLike: isHill ? '18°C' : '25°C',
    },
    travelTips: [
      `Start early from ${originName} to enjoy seamless highway cruising without traffic.`,
      `Stay hydrated and take refreshing stops every 100-150 km at clean food plazas.`,
      `All Urgent Taxis vehicles carry active FASTag for instant toll clearances.`,
      `Doorstep pickup is available 24/7 across all residential and business localities.`,
      `Transparent pricing guarantees no hidden surprise costs at journey end.`,
    ],
    milestones: [
      { town: `${originName} Origin`, km: 0, timeText: '0 hr', description: `Doorstep pickup in ${originName}` },
      { town: 'Highway Bypass', km: quarter1, timeText: '1 - 1.5 hr', description: 'Smooth highway cruising onto major toll corridor' },
      { town: 'Midway Plaza', km: midpoint, timeText: '2.5 - 3 hr', description: 'Recommended stop for refreshments, fuel and rest' },
      { town: 'Outer City Gate', km: quarter3, timeText: '4 hr', description: `Approaching ${destName} regional boundary` },
      { town: `${destName} City`, km: distanceKm, timeText: `${Math.round(distanceKm / 50)} hr`, description: `Comfortable doorstep arrival in ${destName}` },
    ],
    places: {
      restaurants: [
        { name: 'Highway Food Plaza', category: 'restaurant', location: `Midway Near ${originName}`, distanceKm: quarter1, image: '/destinations/chandigarh.jpg' },
        { name: 'Shiva Dhaba & Family Restaurant', category: 'restaurant', location: 'Midway Corridor', distanceKm: midpoint, image: '/destinations/amritsar.jpg' },
        { name: 'Bikanervala Highway Court', category: 'restaurant', location: `Approaching ${destName}`, distanceKm: quarter3, image: '/destinations/agra.jpg' },
        { name: 'Haldiram\'s Express Food Plaza', category: 'restaurant', location: 'Highway Toll Bypass', distanceKm: midpoint + 25, image: '/destinations/lucknow.jpg' },
        { name: 'Old Rao Highway Dhaba', category: 'restaurant', location: 'National Highway Plaza', distanceKm: quarter1 + 30, image: '/destinations/chandigarh.jpg' },
      ],
      petrolPumps: [
        { name: 'Indian Oil COCO Fuel Station', category: 'petrol', location: 'Highway Km ' + quarter1, distanceKm: quarter1 },
        { name: 'Bharat Petroleum Highway Hub', category: 'petrol', location: 'Midway Toll Plaza', distanceKm: midpoint },
        { name: 'HPCL Auto Care Centre', category: 'petrol', location: 'Highway Km ' + quarter3, distanceKm: quarter3 },
        { name: 'Reliance Petroleum Fuel Point', category: 'petrol', location: 'Highway Toll Exit', distanceKm: midpoint + 40 },
      ],
      cngPumps: [
        { name: 'IOCL CNG Station', category: 'cng', location: 'Highway Km ' + (quarter1 - 5), distanceKm: quarter1 - 5 },
        { name: 'Torrent Gas / IGL CNG', category: 'cng', location: 'Midway Junction', distanceKm: midpoint },
        { name: 'Green Gas CNG Station', category: 'cng', location: 'City Highway Approach', distanceKm: quarter3 },
      ],
      attractions: [
        { name: `${destName} Central Landmark`, category: 'attraction', location: `${destName} City Center`, distanceKm: distanceKm, image: '/destinations/nainital.webp' },
        { name: `${destName} Heritage Viewpoint`, category: 'attraction', location: `${destName} Regional Hills`, distanceKm: distanceKm + 4, image: '/destinations/jaipur.webp' },
        { name: `${destName} Prominent Temple`, category: 'attraction', location: `${destName} Old Town`, distanceKm: distanceKm + 2, image: '/destinations/haridwar.webp' },
      ],
    },
    gallery: [
      { src: '/destinations/chandigarh.jpg', caption: `${originName} Expressway Corridor`, alt: `${originName} Expressway view` },
      { src: '/destinations/jaipur.webp', caption: 'Highway Midway Plaza', alt: 'Highway midway stopover' },
      { src: '/destinations/dehradun.webp', caption: `${destName} Approach Drive`, alt: `Scenic road entering ${destName}` },
      { src: '/destinations/nainital.webp', caption: `${destName} Panorama`, alt: `${destName} panoramic landmark` },
      { src: '/destinations/haridwar.webp', caption: `${destName} Sightseeing`, alt: `${destName} sightseeing destination` },
    ],
  };
}
