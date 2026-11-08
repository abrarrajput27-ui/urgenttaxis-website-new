import { getDestinationImage } from '../destination-images';

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
  category: 'restaurant' | 'hotel' | 'petrol' | 'cng' | 'attraction';
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
    hotels?: RoutePlaceItem[];
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
  // Delhi / NCR to Nainital / Haldwani / Jim Corbett / Almora / Kainchi Dham
  'delhi-nainital': {
    highway: 'via Delhi-Meerut Expressway & NH9',
    routeChain: 'Delhi / NCR → Hapur Bypass → Gajraula → Moradabad Bypass → Rampur → Rudrapur → Haldwani → Nainital',
    roadType: 'Delhi-Meerut Expressway, 4-Lane NH9 & Scenic Hill Ghats',
    weather: {
      temp: '20°C',
      condition: 'Pleasant Hill Climate & Misty Breezes',
      feelsLike: '19°C',
    },
    travelTips: [
      'Start early by 5:00 - 6:00 AM to cross Delhi-Meerut Expressway seamlessly and reach Haldwani for early lunch.',
      'Gajraula Midway (Km 105) is the most popular highway breakfast hub featuring Bikanervala, Tadka Punjab Ka & Shiva Dhaba.',
      'Hill climb from Kathgodam to Nainital takes around 1.5 hours of scenic winding curves.',
      'Visit Neem Karoli Baba Ashram at Kainchi Dham (approx. 18 km past Nainital/Bhowali).',
      'All Urgent Taxis vehicles are commercial yellow-plate cars driven by verified mountain highway chauffeurs.',
    ],
    milestones: [
      { town: 'Delhi / NCR', km: 0, timeText: '0 hr', description: 'Start via Delhi-Meerut Expressway & NH9' },
      { town: 'Hapur Bypass', km: 55, timeText: '45 mins', description: 'Smooth toll expressway merge towards Moradabad' },
      { town: 'Gajraula Food Plaza', km: 105, timeText: '1.5 - 2 hr', description: 'Top highway hub with 24x7 dhabas & clean family rest stops' },
      { town: 'Moradabad Bypass', km: 160, timeText: '2.5 - 3 hr', description: 'Bypass brass city onto Rampur-Rudrapur highway' },
      { town: 'Rudrapur', km: 225, timeText: '4 - 4.5 hr', description: 'Commercial gateway to Kumaon foothills' },
      { town: 'Haldwani / Kathgodam', km: 265, timeText: '5 hr', description: 'Base town before picturesque hill ascent' },
      { town: 'Nainital', km: 298, timeText: '6 - 6.5 hr', description: 'Arrive at Naini Lake, Mall Road & hilltop viewpoints' },
    ],
    places: {
      restaurants: [
        { name: 'Bikanervala Highway Food Court', category: 'restaurant', location: 'Gajraula, UP (NH9)', distanceKm: 105, image: '/destinations/food-plaza.webp', highlight: 'Pure Veg & Clean Restrooms' },
        { name: 'Shiva Tourist Dhaba', category: 'restaurant', location: 'Babugarh Bypass, UP', distanceKm: 65, image: '/destinations/food-plaza.webp', highlight: 'Famous Stuffed Parathas & Kulhad Chai' },
        { name: 'Tadka Punjab Ka Family Dhaba', category: 'restaurant', location: 'Gajraula Midway, UP', distanceKm: 108, image: '/destinations/food-plaza.webp', highlight: 'Authentic Dal Makhani' },
        { name: 'Zaika Highway Restaurant', category: 'restaurant', location: 'Moradabad Bypass, UP', distanceKm: 158, image: '/destinations/food-plaza.webp', highlight: 'Multi-Cuisine & Fast Service' },
        { name: 'Udupi Shri Krishna Grand', category: 'restaurant', location: 'Rudrapur Highway, UK', distanceKm: 218, image: '/destinations/food-plaza.webp', highlight: 'South Indian & North Indian Meals' },
        { name: 'Machan Restaurant & Cafe', category: 'restaurant', location: 'Mall Road, Nainital', distanceKm: 298, image: '/destinations/nainital.webp', highlight: 'Lakeside Dining Experience' },
      ],
      hotels: [
        { name: 'The Manu Maharani Resort', category: 'hotel', location: 'Grassmere Estate, Nainital', distanceKm: 300, image: '/destinations/hotel-resort.webp', highlight: 'Luxury Lake View Resort' },
        { name: 'Radisson Blu Hotel', category: 'hotel', location: 'Rudrapur Commercial Hub', distanceKm: 220, image: '/destinations/hotel-resort.webp', highlight: 'Premium Business & Transit Hotel' },
        { name: 'Naini Retreat Heritage Hotel', category: 'hotel', location: 'Ayarpatta Slopes, Nainital', distanceKm: 299, image: '/destinations/hotel-resort.webp', highlight: 'Historic Colonial Palace Hotel' },
      ],
      petrolPumps: [
        { name: 'Indian Oil COCO Fuel Center', category: 'petrol', location: 'Gajraula Highway (NH9)', distanceKm: 104 },
        { name: 'Bharat Petroleum Highway Hub', category: 'petrol', location: 'Moradabad Bypass, UP', distanceKm: 156 },
        { name: 'HP Petrol Pump Swagat Point', category: 'petrol', location: 'Rudrapur Highway, UK', distanceKm: 222 },
        { name: 'Reliance Petroleum Fuel Point', category: 'petrol', location: 'Haldwani Bypass, UK', distanceKm: 262 },
      ],
      cngPumps: [
        { name: 'Torrent Gas Highway CNG', category: 'cng', location: 'Gajraula Bypass, UP', distanceKm: 102 },
        { name: 'Green Gas CNG Station', category: 'cng', location: 'Moradabad Bypass, UP', distanceKm: 154 },
        { name: 'Adani Total Gas CNG', category: 'cng', location: 'Rampur Bypass, UP', distanceKm: 190 },
        { name: 'Green Gas CNG Station', category: 'cng', location: 'Rudrapur Industrial Area, UK', distanceKm: 224 },
      ],
      attractions: [
        { name: 'Naini Lake & Boating', category: 'attraction', location: 'Nainital Town Center', distanceKm: 298, image: '/destinations/nainital.webp', highlight: 'Iconic Emerald Eye-Shaped Lake' },
        { name: 'Kainchi Dham Ashram', category: 'attraction', location: 'Bhowali-Almora Highway, UK', distanceKm: 316, image: '/destinations/kainchi-dham.webp', highlight: 'Sacred Neem Karoli Baba Shrine' },
        { name: 'Bhimtal Lake & Island Cafe', category: 'attraction', location: 'Bhimtal, Uttarakhand', distanceKm: 318, image: '/destinations/bhimtal.webp', highlight: 'Scenic Lake with Central Aquarium' },
        { name: 'Snow View Point (Ropeway)', category: 'attraction', location: 'Mallital, Nainital', distanceKm: 300, image: '/destinations/nainital.webp', highlight: 'Panoramic Himalayan Snow Peaks' },
        { name: 'Naina Devi Temple', category: 'attraction', location: 'North Shore, Naini Lake', distanceKm: 298, image: '/destinations/nainital.webp', highlight: 'Historic 51 Shaktipeeth Temple' },
      ],
    },
    gallery: [
      { src: '/destinations/nainital.webp', caption: 'Naini Lake Vista', alt: 'Nainital scenic mountain lake view' },
      { src: '/destinations/kainchi-dham.webp', caption: 'Kainchi Dham Temple', alt: 'Sacred Neem Karoli Baba Ashram near Nainital' },
      { src: '/destinations/bhimtal.webp', caption: 'Bhimtal Island Lake', alt: 'Bhimtal lake and hill drive' },
      { src: '/destinations/haldwani.webp', caption: 'Haldwani Gateway', alt: 'Haldwani base town approaching Nainital' },
      { src: '/destinations/ramnagar.webp', caption: 'Corbett Foothills', alt: 'Jim Corbett foothill highway drive' },
    ],
  },

  // Delhi / NCR to Dehradun / Mussoorie / Rishikesh / Haridwar
  'delhi-dehradun': {
    highway: 'via Delhi-Meerut Expressway & NH334 (4-Lane)',
    routeChain: 'Delhi / NCR → Meerut Expressway → Khatauli → Muzaffarnagar → Roorkee → Mohand Ghats → Dehradun',
    roadType: 'High-Speed Delhi-Meerut Expressway & Smooth 4-Lane NH334',
    weather: {
      temp: '22°C',
      condition: 'Pleasant Valley Breezes',
      feelsLike: '21°C',
    },
    travelTips: [
      'Delhi-Meerut Expressway saves 50+ minutes over the older highway route.',
      'Cheetal Grand at Khatauli Bypass (Km 98) and Namaste Midway (Km 112) are top recommended pitstops.',
      'For Mussoorie, continue 34 km uphill from Dehradun via Rajpur Road.',
      'Check in advance for weekend pilgrim rush during Kumbh / Shravan / Char Dham season.',
      'Cabs equipped with AC and experienced hill drivers guarantee smooth ride across Mohand Ghats.',
    ],
    milestones: [
      { town: 'Delhi / NCR', km: 0, timeText: '0 hr', description: 'Depart via Akshardham Delhi-Meerut Expressway' },
      { town: 'Meerut Outer Bypass', km: 58, timeText: '40 mins', description: 'Cross Meerut expressway toll gate onto NH334' },
      { town: 'Khatauli (Cheetal Grand)', km: 98, timeText: '1.5 hr', description: 'Premier highway rest plaza & restaurants' },
      { town: 'Muzaffarnagar Bypass', km: 128, timeText: '2 - 2.5 hr', description: 'Smooth elevated bypass with fuel stations' },
      { town: 'Roorkee Canal', km: 175, timeText: '3 hr', description: 'Historic Ganga Canal & engineering university town' },
      { town: 'Mohand Hill Pass', km: 215, timeText: '3.5 - 4 hr', description: 'Scenic Shivalik forest tunnel & mountain curves' },
      { town: 'Dehradun ISBT', km: 248, timeText: '4 - 4.5 hr', description: 'Arrive in Dehradun capital valley' },
    ],
    places: {
      restaurants: [
        { name: 'Cheetal Grand Food Court', category: 'restaurant', location: 'Khatauli Bypass, UP', distanceKm: 98, image: '/destinations/food-plaza.webp', highlight: 'Iconic Highway Breakfast & Green Gardens' },
        { name: 'Namaste Midway Food Complex', category: 'restaurant', location: 'Mansurpur (NH334)', distanceKm: 112, image: '/destinations/food-plaza.webp', highlight: 'Haldirams, Starbucks, Subway & Clean Restrooms' },
        { name: 'Pandit Ji Da Dhaba', category: 'restaurant', location: 'Roorkee Highway, UK', distanceKm: 172, image: '/destinations/food-plaza.webp', highlight: 'Authentic Tandoori & Dal Tadka' },
        { name: 'Bikanervala Meerut Expressway', category: 'restaurant', location: 'Meerut Bypass, UP', distanceKm: 58, image: '/destinations/food-plaza.webp', highlight: 'Quick Highway Snacks & Chai' },
        { name: 'Kalsang Asian Restaurant', category: 'restaurant', location: 'Rajpur Road, Dehradun', distanceKm: 252, image: '/destinations/dehradun.webp', highlight: 'Famous Tibetan & Chinese Delicacies' },
      ],
      hotels: [
        { name: 'Hyatt Regency Dehradun Resort', category: 'hotel', location: 'Malsi Forest, Dehradun', distanceKm: 258, image: '/destinations/hotel-resort.webp', highlight: 'Luxury Hill Foothill Resort' },
        { name: 'Lemon Tree Premier', category: 'hotel', location: 'Pacific Mall Road, Dehradun', distanceKm: 250, image: '/destinations/hotel-resort.webp', highlight: 'Comfortable Modern Valley Stay' },
        { name: 'JW Marriott Walnut Grove', category: 'hotel', location: 'Barlowganj, Mussoorie', distanceKm: 282, image: '/destinations/hotel-resort.webp', highlight: 'Ultra-Luxury Himalayan Retreat' },
      ],
      petrolPumps: [
        { name: 'Indian Oil COCO Fuel Center', category: 'petrol', location: 'Khatauli Bypass (NH334)', distanceKm: 99 },
        { name: 'Bharat Petroleum Highway Center', category: 'petrol', location: 'Meerut Expressway Exit', distanceKm: 54 },
        { name: 'HPCL Auto Care Centre', category: 'petrol', location: 'Roorkee Bypass, UK', distanceKm: 174 },
        { name: 'Reliance Petroleum Fuel Point', category: 'petrol', location: 'Dehradun Road, UK', distanceKm: 222 },
      ],
      cngPumps: [
        { name: 'Indraprastha Gas (IGL) CNG', category: 'cng', location: 'Delhi-Meerut Expressway', distanceKm: 52 },
        { name: 'Torrent Gas CNG Station', category: 'cng', location: 'Khatauli Bypass, UP', distanceKm: 96 },
        { name: 'Green Gas CNG Station', category: 'cng', location: 'Roorkee Highway, UK', distanceKm: 170 },
        { name: 'GAIL Gas CNG Pump', category: 'cng', location: 'Dehradun ISBT Road, UK', distanceKm: 242 },
      ],
      attractions: [
        { name: 'Robbers Cave (Guchhupani)', category: 'attraction', location: 'Anarwala, Dehradun', distanceKm: 252, image: '/destinations/dehradun.webp', highlight: 'Natural Cave Stream Walk' },
        { name: 'Sahastradhara Natural Spring', category: 'attraction', location: 'Timilimanjri, Dehradun', distanceKm: 256, image: '/destinations/dehradun.webp', highlight: 'Sulphur Waterfall & Ropeway' },
        { name: 'Kempty Falls (Mussoorie)', category: 'attraction', location: 'Chakrata Road, Mussoorie', distanceKm: 285, image: '/destinations/mussoorie.webp', highlight: 'Famous Cascading Waterfall' },
        { name: 'Mindrolling Buddha Temple', category: 'attraction', location: 'Clement Town, Dehradun', distanceKm: 246, image: '/destinations/dehradun.webp', highlight: 'Grand Stupa & Serene Gardens' },
        { name: 'Forest Research Institute (FRI)', category: 'attraction', location: 'Chakrata Road, Dehradun', distanceKm: 249, image: '/destinations/dehradun.webp', highlight: 'Greco-Roman Heritage Architecture' },
      ],
    },
    gallery: [
      { src: '/destinations/dehradun.webp', caption: 'Dehradun Valley Scenery', alt: 'Scenic valley of Dehradun' },
      { src: '/destinations/mussoorie.webp', caption: 'Mussoorie Queen of Hills', alt: 'Mussoorie mountain skyline' },
      { src: '/destinations/rishikesh.webp', caption: 'Rishikesh Ganga Ghat', alt: 'Rishikesh Holy River Ganga' },
      { src: '/destinations/haridwar.webp', caption: 'Har Ki Pauri Haridwar', alt: 'Haridwar sacred Ganga Aarti' },
      { src: '/destinations/dhanaulti.webp', caption: 'Dhanaulti Pine Forests', alt: 'Dhanaulti Himalayan forest view' },
    ],
  },

  // Delhi / NCR to Agra / Mathura / Vrindavan
  'delhi-agra': {
    highway: 'via Yamuna Expressway (6-Lane Controlled-Access)',
    routeChain: 'Delhi / NCR → Greater Noida (Pari Chowk) → Jewar (Noida Airport) → Mathura Toll → Vrindavan Cut → Agra',
    roadType: 'World-Class 6-Lane Concrete Yamuna Expressway',
    weather: {
      temp: '26°C',
      condition: 'Clear Skies & Sunny Horizon',
      feelsLike: '25°C',
    },
    travelTips: [
      'Yamuna Expressway speed limit is strictly 100 km/h for cars; our cabs strictly follow highway safety regulations.',
      'Stop at the Jewar or Mathura Midway food plaza for clean restrooms and refreshments.',
      'Taj Mahal is closed on Fridays; plan your trip accordingly.',
      'Combine your Agra trip with a spiritual stopover at Mathura Shri Krishna Janmabhoomi & Vrindavan Prem Mandir.',
      'Advance token booking assures dedicated doorstep pickup anytime from Delhi NCR.',
    ],
    milestones: [
      { town: 'Delhi / Noida', km: 0, timeText: '0 hr', description: 'Start via Noida-Greater Noida Expressway' },
      { town: 'Greater Noida (Pari Chowk)', km: 35, timeText: '30 mins', description: 'Enter Yamuna Expressway Zero Point' },
      { town: 'Jewar (Noida Airport)', km: 68, timeText: '50 mins', description: 'First major expressway food plaza & fuel hub' },
      { town: 'Mathura / Vrindavan Exit', km: 145, timeText: '1.5 - 2 hr', description: 'Exit for Banke Bihari & Prem Mandir' },
      { town: 'Agra Toll Plaza', km: 198, timeText: '2.5 - 3 hr', description: 'Exit onto Agra Ring Road' },
      { town: 'Agra (Taj Mahal)', km: 215, timeText: '3 - 3.5 hr', description: 'Doorstep drop at your hotel or Taj Mahal East Gate' },
    ],
    places: {
      restaurants: [
        { name: 'Haldiram\'s Yamuna Expressway Plaza', category: 'restaurant', location: 'Toll Km 65 (Jewar)', distanceKm: 65, image: '/destinations/food-plaza.webp', highlight: 'Clean Express Highway Dining' },
        { name: 'Costa Coffee & Starbucks Plaza', category: 'restaurant', location: 'Expressway Milestone 105', distanceKm: 105, image: '/destinations/food-plaza.webp', highlight: 'Premium Coffee & Fresh Snacks' },
        { name: 'Bhajan Cafe & Bikanervala', category: 'restaurant', location: 'Mathura-Vrindavan Cut', distanceKm: 142, image: '/destinations/food-plaza.webp', highlight: 'Pure Vegetarian Satvik Delicacies' },
        { name: 'Pinch of Spice Restaurant', category: 'restaurant', location: 'Fatehabad Road, Agra', distanceKm: 212, image: '/destinations/agra.webp', highlight: 'Top Rated North Indian Fine Dining' },
        { name: 'Peshawri (ITC Mughal)', category: 'restaurant', location: 'Taj Ganj, Agra', distanceKm: 214, image: '/destinations/agra.webp', highlight: 'World Famous Mughlai Dining' },
      ],
      hotels: [
        { name: 'The Oberoi Amarvilas', category: 'hotel', location: 'Taj East Gate Road, Agra', distanceKm: 214, image: '/destinations/hotel-resort.webp', highlight: 'Unobstructed Taj Mahal Views' },
        { name: 'ITC Mughal Luxury Collection', category: 'hotel', location: 'Fatehabad Road, Agra', distanceKm: 213, image: '/destinations/hotel-resort.webp', highlight: 'Mughal Heritage Architecture & Spa' },
        { name: 'Radisson Hotel Agra', category: 'hotel', location: 'Taj Nagari, Agra', distanceKm: 212, image: '/destinations/hotel-resort.webp', highlight: 'Rooftop Pool & Taj Views' },
      ],
      petrolPumps: [
        { name: 'Indian Oil Expressway Mega Hub', category: 'petrol', location: 'Yamuna Expressway Km 65', distanceKm: 65 },
        { name: 'Bharat Petroleum Swagat Plaza', category: 'petrol', location: 'Yamuna Expressway Km 105', distanceKm: 105 },
        { name: 'HPCL Auto Care Centre', category: 'petrol', location: 'Mathura Toll Exit', distanceKm: 145 },
        { name: 'Reliance Petroleum Center', category: 'petrol', location: 'Agra Ring Road Exit', distanceKm: 200 },
      ],
      cngPumps: [
        { name: 'Indraprastha Gas (IGL) CNG', category: 'cng', location: 'Greater Noida Expressway', distanceKm: 32 },
        { name: 'Torrent Gas Expressway CNG', category: 'cng', location: 'Yamuna Expressway Km 65', distanceKm: 65 },
        { name: 'Green Gas CNG Station', category: 'cng', location: 'Agra Ring Road Exit', distanceKm: 202 },
      ],
      attractions: [
        { name: 'Taj Mahal (UNESCO World Heritage)', category: 'attraction', location: 'Dharmapuri, Agra', distanceKm: 215, image: '/destinations/agra.webp', highlight: 'Wonder of the World White Marble Monument' },
        { name: 'Agra Fort (Red Sandstone Citadel)', category: 'attraction', location: 'Rakabganj, Agra', distanceKm: 213, image: '/destinations/agra.webp', highlight: 'Historic Mughal Empire Imperial Residence' },
        { name: 'Prem Mandir (Vrindavan)', category: 'attraction', location: 'Chatikara Road, Vrindavan', distanceKm: 148, image: '/destinations/vrindavan.webp', highlight: 'Magnificent White Italian Marble Temple' },
        { name: 'Shri Krishna Janmabhoomi', category: 'attraction', location: 'Mathura City', distanceKm: 152, image: '/destinations/mathura.webp', highlight: 'Sacred Birthplace of Lord Krishna' },
        { name: 'Fatehpur Sikri', category: 'attraction', location: 'Sikri, Agra District', distanceKm: 242, image: '/destinations/agra.webp', highlight: 'Historic Buland Darwaza & Tomb' },
      ],
    },
    gallery: [
      { src: '/destinations/agra.webp', caption: 'The Iconic Taj Mahal', alt: 'Taj Mahal marble dome reflecting in the Yamuna River' },
      { src: '/destinations/vrindavan.webp', caption: 'Prem Mandir Vrindavan', alt: 'Prem Mandir illuminated temple in Vrindavan' },
      { src: '/destinations/mathura.webp', caption: 'Mathura Sacred Ghats', alt: 'Holy river ghats in Mathura' },
      { src: '/destinations/goverdhan.webp', caption: 'Goverdhan Parikrama', alt: 'Holy Govardhan Hill temple' },
      { src: '/destinations/firozabad.webp', caption: 'Firozabad Glass City', alt: 'Firozabad nearby heritage' },
    ],
  },

  // Delhi / NCR to Jaipur / Ajmer / Pushkar / Khatu Shyam Ji
  'delhi-jaipur': {
    highway: 'via Delhi-Mumbai Expressway (NE4) & NH48',
    routeChain: 'Delhi / NCR → Gurugram → Sohna (NE4 Entry) → Dausa Interchange → Jaipur (Pink City)',
    roadType: 'High-Speed 8-Lane Delhi-Mumbai Expressway (NE4)',
    weather: {
      temp: '27°C',
      condition: 'Sunny & Warm Royal Desert Skies',
      feelsLike: '26°C',
    },
    travelTips: [
      'Delhi-Mumbai Expressway (NE4) accessed via Sohna elevated corridor reduces Delhi to Jaipur driving time to under 4 hours.',
      'Old Rao Hotel (Dharuhera) and Highway King (Shahpura) on NH48 are classic food stopovers.',
      'Book online tickets for Amber Fort and City Palace to skip long ticket counter queues.',
      'If visiting Khatu Shyam Ji or Salasar Balaji, request direct route customization with your driver.',
      'Urgent Taxis provides comfortable AC Sedan, Ertiga & Innova Crysta cabs with 24/7 support.',
    ],
    milestones: [
      { town: 'Delhi / NCR', km: 0, timeText: '0 hr', description: 'Depart via Rajiv Chowk Gurugram or Sohna NE4 Entry' },
      { town: 'Dharuhera / Sohna', km: 62, timeText: '50 mins', description: 'Cruise onto multi-lane expressway corridor' },
      { town: 'Neemrana Fort', km: 122, timeText: '1.5 - 2 hr', description: 'Historic heritage palace midpoint' },
      { town: 'Behror Food Plaza', km: 142, timeText: '2.5 hr', description: 'Midway family dining & clean restrooms' },
      { town: 'Kotputli / Shahpura', km: 195, timeText: '3 hr', description: 'Aravalli mountain ranges view' },
      { town: 'Amer Fort Entrance', km: 260, timeText: '3.5 - 4 hr', description: 'Historic Amber town approaching Jaipur' },
      { town: 'Jaipur (Pink City)', km: 275, timeText: '4 - 4.5 hr', description: 'Arrive at destination in Jaipur' },
    ],
    places: {
      restaurants: [
        { name: 'Old Rao Hotel', category: 'restaurant', location: 'Dharuhera (NH48)', distanceKm: 68, image: '/destinations/food-plaza.webp', highlight: 'Famous Highway Thali & Paneer Dishes' },
        { name: 'Hotel Highway King', category: 'restaurant', location: 'Shahpura, RJ', distanceKm: 198, image: '/destinations/food-plaza.webp', highlight: 'Premier Family Rest Stop & Food Court' },
        { name: 'Mannat Dhaba', category: 'restaurant', location: 'Neemrana, RJ', distanceKm: 124, image: '/destinations/food-plaza.webp', highlight: '24x7 North Indian & Chai' },
        { name: 'Rawat Mishthan Bhandar', category: 'restaurant', location: 'Station Road, Jaipur', distanceKm: 272, image: '/destinations/jaipur.webp', highlight: 'World Famous Pyaaz Kachori & Sweets' },
        { name: 'Laxmi Misthan Bhandar (LMB)', category: 'restaurant', location: 'Johari Bazaar, Jaipur', distanceKm: 274, image: '/destinations/jaipur.webp', highlight: 'Royal Rajasthani Thali' },
      ],
      hotels: [
        { name: 'Rambagh Palace (Taj)', category: 'hotel', location: 'Bhawani Singh Road, Jaipur', distanceKm: 275, image: '/destinations/hotel-resort.webp', highlight: 'Living Royal Maharaja Palace Hotel' },
        { name: 'Neemrana Fort Palace', category: 'hotel', location: 'Neemrana Village, Rajasthan', distanceKm: 122, image: '/destinations/neemrana.webp', highlight: '15th Century Heritage Fort Hotel' },
        { name: 'The Leela Palace Jaipur', category: 'hotel', location: 'Amer Road, Jaipur', distanceKm: 262, image: '/destinations/hotel-resort.webp', highlight: 'Luxury Palace Facing Aravalli Hills' },
      ],
      petrolPumps: [
        { name: 'Indian Oil Swagat COCO Hub', category: 'petrol', location: 'Shahpura, RJ', distanceKm: 200 },
        { name: 'Bharat Petroleum Highway Center', category: 'petrol', location: 'Dharuhera, HR', distanceKm: 66 },
        { name: 'HPCL Auto Care Centre', category: 'petrol', location: 'Neemrana, RJ', distanceKm: 126 },
        { name: 'Shell Highway Petrol Pump', category: 'petrol', location: 'Kotputli, RJ', distanceKm: 170 },
      ],
      cngPumps: [
        { name: 'Haryana City Gas CNG', category: 'cng', location: 'Dharuhera, HR', distanceKm: 64 },
        { name: 'Rajasthan State Gas CNG', category: 'cng', location: 'Neemrana, RJ', distanceKm: 122 },
        { name: 'Torrent Gas CNG Station', category: 'cng', location: 'Shahpura, RJ', distanceKm: 196 },
        { name: 'GAIL Gas CNG Station', category: 'cng', location: 'Jaipur Bypass, RJ', distanceKm: 268 },
      ],
      attractions: [
        { name: 'Hawa Mahal (Palace of Winds)', category: 'attraction', location: 'Badi Choupad, Jaipur', distanceKm: 274, image: '/destinations/jaipur.webp', highlight: '953 Intricate Pink Sandstone Windows' },
        { name: 'Amber Fort & Maota Lake', category: 'attraction', location: 'Amer, Jaipur', distanceKm: 260, image: '/destinations/jaipur.webp', highlight: 'Magnificent Hilltop Rajput Palace' },
        { name: 'Jal Mahal (Water Palace)', category: 'attraction', location: 'Man Sagar Lake, Jaipur', distanceKm: 266, image: '/destinations/jaipur.webp', highlight: 'Historic Palace Floating on Water' },
        { name: 'Khatu Shyam Ji Temple', category: 'attraction', location: 'Sikar District, Rajasthan', distanceKm: 295, image: '/destinations/khatu-shyam-ji.webp', highlight: 'Sacred Barbarika Temple Shrine' },
        { name: 'City Palace & Museum', category: 'attraction', location: 'Old City, Jaipur', distanceKm: 273, image: '/destinations/jaipur.webp', highlight: 'Royal Court & Chandra Mahal' },
      ],
    },
    gallery: [
      { src: '/destinations/jaipur.webp', caption: 'Hawa Mahal Jaipur', alt: 'Pink sandstone Hawa Mahal facade' },
      { src: '/destinations/neemrana.webp', caption: 'Neemrana Fort Palace', alt: 'Historic Neemrana Fort midway between Delhi and Jaipur' },
      { src: '/destinations/khatu-shyam-ji.webp', caption: 'Khatu Shyam Ji Shrine', alt: 'Sacred Khatu Shyam Ji temple in Rajasthan' },
      { src: '/destinations/salasar-balaji.webp', caption: 'Salasar Balaji Temple', alt: 'Salasar Balaji shrine in Rajasthan' },
      { src: '/destinations/pushkar.webp', caption: 'Holy Lake Pushkar', alt: 'Pushkar holy lake and desert landscape' },
    ],
  },
};

/**
 * Universal dynamic corridor resolver for any route across India
 */
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

  // Check key matches by destination
  if (normDest.includes('nainital') || normDest.includes('haldwani') || normDest.includes('bhimtal') || normDest.includes('kainchi') || normDest.includes('ramnagar') || normDest.includes('corbett') || normDest.includes('almora') || normDest.includes('ranikhet')) {
    return KNOWN_CORRIDORS['delhi-nainital'];
  }
  if (normDest.includes('dehradun') || normDest.includes('mussoorie') || normDest.includes('rishikesh') || normDest.includes('haridwar') || normDest.includes('roorkee')) {
    return KNOWN_CORRIDORS['delhi-dehradun'];
  }
  if (normDest.includes('agra') || normDest.includes('mathura') || normDest.includes('vrindavan') || normDest.includes('firozabad')) {
    return KNOWN_CORRIDORS['delhi-agra'];
  }
  if (normDest.includes('jaipur') || normDest.includes('ajmer') || normDest.includes('pushkar') || normDest.includes('khatu') || normDest.includes('salasar') || normDest.includes('alwar')) {
    return KNOWN_CORRIDORS['delhi-jaipur'];
  }

  // Dynamic corridor generator for any city in India
  const isHill = ['shimla', 'manali', 'dharamshala', 'kullu', 'ranikhet', 'almora', 'kausani', 'auli', 'badrinath', 'kedarnath', 'chopta', 'kasol', 'dalhousie'].some((h) => normDest.includes(h));
  const highwayName = isHill ? 'via National Expressway & Mountain Highway' : 'via 4-Lane Access-Controlled Highway';
  const midpoint = Math.max(30, Math.round(distanceKm / 2));
  const quarter1 = Math.max(15, Math.round(distanceKm / 4));
  const quarter3 = Math.max(45, Math.round((distanceKm * 3) / 4));

  return {
    highway: highwayName,
    routeChain: `${originName} → Highway Expressway → Midway Food Plaza (${midpoint} km) → Regional Toll Bypass → ${destName}`,
    roadType: isHill ? 'Access-Controlled Expressway & Well-Maintained Hill Roads' : 'Multi-Lane Fast Highway with Dedicated Bypass & Toll Plazas',
    weather: {
      temp: isHill ? '18°C' : '25°C',
      condition: isHill ? 'Pleasant Hill Breezes' : 'Clear Highway Skies',
      feelsLike: isHill ? '17°C' : '24°C',
    },
    travelTips: [
      `Start early from ${originName} to enjoy seamless highway driving without city congestion.`,
      `Stay refreshed with breaks every 100-150 km at verified family dhabas and food courts.`,
      `All Urgent Taxis vehicles carry verified FASTag for instant toll booth clearance.`,
      `Doorstep pickup and drop is available 24/7 across all residential sectors and hotels.`,
      `Transparent per-KM rates guarantee no hidden surcharges at the end of your trip.`,
    ],
    milestones: [
      { town: `${originName} Departure`, km: 0, timeText: '0 hr', description: `Doorstep pickup in ${originName}` },
      { town: 'Highway Bypass', km: quarter1, timeText: '1 - 1.5 hr', description: 'Smooth cruising onto main national highway corridor' },
      { town: 'Midway Food Hub', km: midpoint, timeText: '2 - 3 hr', description: 'Recommended stop for refreshments, clean washrooms & fuel' },
      { town: 'Regional Toll Gate', km: quarter3, timeText: '3.5 - 4.5 hr', description: `Approaching ${destName} regional boundary` },
      { town: `${destName} Destination`, km: distanceKm, timeText: `${Math.round(distanceKm / 50)} hr`, description: `Comfortable doorstep drop in ${destName}` },
    ],
    places: {
      restaurants: [
        { name: 'Highway Treat Food Court', category: 'restaurant', location: `Highway Corridor near ${originName}`, distanceKm: quarter1, image: '/destinations/food-plaza.webp', highlight: 'Clean Family Rest Stop' },
        { name: 'Shiva Dhaba & Multi-Cuisine Plaza', category: 'restaurant', location: 'Midway Highway Corridor', distanceKm: midpoint, image: '/destinations/food-plaza.webp', highlight: 'Fresh Meals & 24x7 Service' },
        { name: 'Bikanervala Express Food Plaza', category: 'restaurant', location: `Highway Toll Approach to ${destName}`, distanceKm: quarter3, image: '/destinations/food-plaza.webp', highlight: 'Pure Vegetarian Snacks & Sweets' },
        { name: 'Grand Highway Family Restaurant', category: 'restaurant', location: 'Midway Fuel Plaza', distanceKm: midpoint + 20, image: '/destinations/food-plaza.webp', highlight: 'Comfortable Dining & Restrooms' },
      ],
      hotels: [
        { name: `${destName} Landmark Hotel`, category: 'hotel', location: `${destName} City Center`, distanceKm: distanceKm, image: '/destinations/hotel-resort.webp', highlight: 'Premium Doorstep Accommodation' },
        { name: 'Highway Transit Inn & Resort', category: 'hotel', location: 'Midway Toll Plaza', distanceKm: midpoint, image: '/destinations/hotel-resort.webp', highlight: 'Clean Highway Rest Stopover' },
      ],
      petrolPumps: [
        { name: 'Indian Oil COCO Fuel Station', category: 'petrol', location: 'Highway Km ' + quarter1, distanceKm: quarter1 },
        { name: 'Bharat Petroleum Highway Center', category: 'petrol', location: 'Midway Toll Plaza', distanceKm: midpoint },
        { name: 'HPCL Auto Care Centre', category: 'petrol', location: 'Highway Km ' + quarter3, distanceKm: quarter3 },
      ],
      cngPumps: [
        { name: 'IOCL / Torrent Gas CNG', category: 'cng', location: 'Highway Km ' + (quarter1 - 5), distanceKm: quarter1 - 5 },
        { name: 'Highway CNG Station', category: 'cng', location: 'Midway Junction', distanceKm: midpoint },
        { name: 'City Entrance CNG Station', category: 'cng', location: 'City Highway Approach', distanceKm: quarter3 },
      ],
      attractions: [
        { name: `${destName} Central Landmark`, category: 'attraction', location: `${destName} City Center`, distanceKm: distanceKm, image: getDestinationImage(destName), highlight: 'Must-Visit Primary Destination Sight' },
        { name: `${destName} Scenic Viewpoint`, category: 'attraction', location: `${destName} Panorama Point`, distanceKm: distanceKm + 3, image: getDestinationImage(destName), highlight: 'Top Photography & Leisure Spot' },
        { name: `${destName} Historic Heritage Shrine`, category: 'attraction', location: `${destName} Cultural Zone`, distanceKm: distanceKm + 2, image: getDestinationImage(destName), highlight: 'Cultural & Spiritual Experience' },
      ],
    },
    gallery: [
      { src: getDestinationImage(originName), caption: `${originName} Departure`, alt: `${originName} city and highway landscape` },
      { src: '/destinations/food-plaza.webp', caption: 'Highway Food Plaza', alt: 'Highway refreshment rest stop' },
      { src: '/destinations/hotel-resort.webp', caption: 'Transit Resort & Hospitality', alt: 'Comfortable transit accommodation' },
      { src: getDestinationImage(destName), caption: `Arrival in ${destName}`, alt: `Arriving in ${destName}` },
      { src: getDestinationImage(destName), caption: `${destName} Landmark View`, alt: `${destName} prominent destination view` },
    ],
  };
}
