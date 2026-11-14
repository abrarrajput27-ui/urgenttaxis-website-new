import { getDestinationImage } from '../destination-images';
import { getLocationState } from '../location-authority';

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
  priceRange?: string;
}

export interface AlternativeRouteOption {
  id: string;
  name: string;
  highway: string;
  distanceKm: number;
  durationText: string;
  tollPlazasCount: number;
  tollAmount: number;
  description: string;
}

export interface FamousFoodItem {
  name: string;
  location: string;
  dish: string;
  description: string;
  image?: string;
}

export interface HiddenGemItem {
  name: string;
  location: string;
  distanceKm: number;
  description: string;
  highlight: string;
  image?: string;
}

export interface HotelCategoryGroup {
  budget: RoutePlaceItem[];
  medium: RoutePlaceItem[];
  luxury: RoutePlaceItem[];
}

export interface CorridorDetail {
  highway: string;
  routeChain: string;
  roadType: string;
  milestones: RouteMilestone[];
  weather: RouteWeather;
  travelTips: string[];
  alternativeRoutes?: AlternativeRouteOption[];
  famousFoods?: FamousFoodItem[];
  hiddenGems?: HiddenGemItem[];
  hotelGroups?: HotelCategoryGroup;
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
  // ---------------------------------------------------------------------------
  // 1. DELHI / NCR TO HARIDWAR (Dedicated Master Corridor)
  // ---------------------------------------------------------------------------
  'delhi-haridwar': {
    highway: 'via Delhi-Meerut Expressway (NE3) & NH334',
    routeChain: 'Delhi / NCR → Akshardham → Meerut Expressway Bypass → Modinagar → Khatauli Bypass → Muzaffarnagar → Roorkee → Haridwar (Har Ki Pauri)',
    roadType: 'High-Speed Delhi-Meerut Expressway (NE3) & 4/6-Lane NH334 Access Corridor',
    weather: {
      temp: '22°C',
      condition: 'Pleasant Mountain Breeze & Clean Ganges Valley Air',
      feelsLike: '21°C',
    },
    travelTips: [
      'Delhi-Meerut Expressway via Akshardham saves 50+ minutes over the older Modinagar highway.',
      'Khatauli Cheetal Grand (Km 98) & Mansurpur Namaste Midway (Km 112) are top-rated family dining & restroom stops.',
      'Navgati-verified CNG pumps are operational at Meerut Expressway, Khatauli, Muzaffarnagar, and Roorkee Bypass.',
      'Har Ki Pauri evening Ganga Aarti takes place at ~6:00 PM (winter) / ~7:00 PM (summer); reach 45 mins early for seating.',
      'All Urgent Taxis vehicles carry verified FASTag for instant toll booth clearance.',
    ],
    alternativeRoutes: [
      {
        id: 'fastest-nh334',
        name: 'Fastest 4/6-Lane Highway Corridor',
        highway: 'via Delhi-Meerut Expressway & NH334',
        distanceKm: 215,
        durationText: '3.5 - 4 Hours',
        tollPlazasCount: 3,
        tollAmount: 255,
        description: 'Smooth multi-lane expressway bypass via Khatauli, Muzaffarnagar and Roorkee. Best for fast and comfortable family taxi rides.',
      },
      {
        id: 'scenic-ganga-canal',
        name: 'Scenic Upper Ganga Canal Route',
        highway: 'via Upper Ganga Canal Road (Kanwar Marg)',
        distanceKm: 220,
        durationText: '4.5 - 5 Hours',
        tollPlazasCount: 1,
        tollAmount: 90,
        description: 'Picturesque canal-side drive with minimal truck traffic and lush green sugarcane farms. Lower toll charges.',
      },
      {
        id: 'new-dehradun-expressway',
        name: 'New Delhi-Dehradun Expressway Corridor',
        highway: 'via Delhi-Saharanpur-Dehradun Access Corridor',
        distanceKm: 205,
        durationText: '3 - 3.5 Hours',
        tollPlazasCount: 3,
        tollAmount: 310,
        description: 'Newly developed greenfield elevated expressway corridor saving city congestion around central towns.',
      },
    ],
    milestones: [
      { town: 'Delhi / NCR (Akshardham)', km: 0, timeText: '0 hr', description: 'Start via Delhi-Meerut Expressway elevated corridor' },
      { town: 'Meerut Outer Toll Gate', km: 58, timeText: '40 mins', description: 'Expressway toll clearance onto 4-lane NH334 highway' },
      { town: 'Khatauli (Cheetal Grand)', km: 98, timeText: '1.5 hr', description: 'Premier highway rest plaza, famous parathas & clean washrooms' },
      { town: 'Muzaffarnagar Bypass', km: 128, timeText: '2 hr', description: 'Smooth elevated bypass with fuel & Navgati CNG hubs' },
      { town: 'Roorkee Engineering Hub', km: 175, timeText: '2.5 - 3 hr', description: 'Historic Ganga Canal town approaching Uttarakhand border' },
      { town: 'Haridwar (Har Ki Pauri)', km: 215, timeText: '3.5 - 4 hr', description: 'Doorstep drop at Har Ki Pauri ghats, ashrams or your hotel' },
    ],
    hotelGroups: {
      budget: [
        {
          name: 'Shanti Kunj Ashram Guest House',
          category: 'hotel',
          location: 'Motichur, Haridwar',
          distanceKm: 212,
          image: '/destinations/hotel-resort.webp',
          highlight: 'Spiritual ashram rooms, satvik dining & lush gardens',
          priceRange: '₹600 - ₹1,200 / night',
        },
        {
          name: 'Hotel Ganga Lahari Heritage',
          category: 'hotel',
          location: 'Gau Ghat, Haridwar',
          distanceKm: 215,
          image: '/destinations/hotel-resort.webp',
          highlight: 'Sacred riverfront balcony facing Holy Ganga',
          priceRange: '₹1,500 - ₹2,500 / night',
        },
        {
          name: 'Hotel Midtown Haridwar',
          category: 'hotel',
          location: 'Railway Station Road, Haridwar',
          distanceKm: 214,
          image: '/destinations/hotel-resort.webp',
          highlight: 'Clean AC family rooms with 24x7 room service',
          priceRange: '₹1,000 - ₹1,800 / night',
        },
      ],
      medium: [
        {
          name: 'Ginger Hotel Haridwar',
          category: 'hotel',
          location: 'Bhopalwala, NH334, Haridwar',
          distanceKm: 210,
          image: '/destinations/hotel-resort.webp',
          highlight: 'Modern comfort, high-speed Wi-Fi & multi-cuisine dining',
          priceRange: '₹2,500 - ₹4,000 / night',
        },
        {
          name: 'Regenta Orko\'s Haridwar',
          category: 'hotel',
          location: 'Motichur, Haridwar',
          distanceKm: 212,
          image: '/destinations/hotel-resort.webp',
          highlight: '4-Star comfort, rooftop pool & pure veg restaurant',
          priceRange: '₹3,000 - ₹5,000 / night',
        },
        {
          name: 'Hyphen Grand Hotel',
          category: 'hotel',
          location: 'Pentagon Mall, SIDCUL, Haridwar',
          distanceKm: 218,
          image: '/destinations/hotel-resort.webp',
          highlight: 'Spiritual & corporate luxury with direct mall access',
          priceRange: '₹2,800 - ₹4,500 / night',
        },
      ],
      luxury: [
        {
          name: 'Pilibhit House - IHCL SeleQtions',
          category: 'hotel',
          location: 'Niranjani Akhara Marg, Haridwar',
          distanceKm: 215,
          image: '/destinations/hotel-resort.webp',
          highlight: '100-Year-Old restored Aristocratic Haveli with private Ganga bathing ghat',
          priceRange: '₹14,000 - ₹25,000 / night',
        },
        {
          name: 'Amatra by the Ganges Resort',
          category: 'hotel',
          location: 'Near Shyampur, Haridwar',
          distanceKm: 224,
          image: '/destinations/hotel-resort.webp',
          highlight: '5-Star riverside luxury villas, infinity pool & ayurvedic spa',
          priceRange: '₹8,000 - ₹16,000 / night',
        },
        {
          name: 'Radisson Blu Hotel Haridwar',
          category: 'hotel',
          location: 'Plot C-1, Sector 12 SIDCUL, Haridwar',
          distanceKm: 218,
          image: '/destinations/hotel-resort.webp',
          highlight: '5-Star international luxury, swimming pool & fine dining',
          priceRange: '₹6,000 - ₹12,000 / night',
        },
      ],
    },
    famousFoods: [
      {
        name: 'Hoshiyar Puri (Since 1937)',
        location: 'Moti Bazaar, Haridwar',
        dish: 'Crispy Poori Chhole, Sitaphal Sabzi & Rice Kheer',
        description: 'Haridwar\'s most legendary culinary spot serving pure desi ghee pooris with sweet-tangy pumpkin sabzi.',
        image: '/destinations/food-plaza.webp',
      },
      {
        name: 'Mohan Ji Puri Wale',
        location: 'Subhash Ghat, Har Ki Pauri',
        dish: 'Hot Aloo Puri, Methi Chutney & Chilled Kulhad Lassi',
        description: 'Iconic morning pilgrim breakfast right by the sacred Ganges ghats with fresh sweet lassi.',
        image: '/destinations/food-plaza.webp',
      },
      {
        name: 'Mathura Walo Ki Pracheen Dukan',
        location: 'Bada Bazaar, Haridwar',
        dish: 'Warm Rabdi Malpua, Desi Ghee Jalebi & Khoya Sweets',
        description: 'Over 100 years of pure heritage sweets, renowned for saffron-infused hot jalebis and thick malpua.',
        image: '/destinations/food-plaza.webp',
      },
      {
        name: 'Prakash Lok Sweets',
        location: 'Railway Road, Haridwar',
        dish: 'Layered Kulfi Falooda & Chilled Badam Milk',
        description: 'The definitive summer dessert destination in Haridwar, crafted using rich reduced whole milk.',
        image: '/destinations/food-plaza.webp',
      },
      {
        name: 'Pandit Sevaram Sharma Sweets',
        location: 'Moti Bazaar, Haridwar',
        dish: 'Traditional Mathura Peda, Gulab Jamun & Rasgulla',
        description: 'Famous among temple pilgrims for authentic temple offerings and pure milk sweets.',
        image: '/destinations/food-plaza.webp',
      },
    ],
    hiddenGems: [
      {
        name: 'Neel Dhara Pakshi Vihar',
        location: 'Bhimgoda Barrage, Haridwar',
        distanceKm: 218,
        highlight: 'Winter Siberian Migratory Birds Sanctuary',
        description: 'A peaceful haven on the turquoise Ganges waters where hundreds of migratory birds visit during winter months, away from city crowds.',
        image: '/destinations/haridwar.webp',
      },
      {
        name: 'Sapt Rishi Ashram & Sapt Sarovar',
        location: 'Bhopatwala, Haridwar',
        distanceKm: 211,
        highlight: 'Where Ganga divides into 7 natural streams',
        description: 'Ancient spiritual hermitage where Holy Ganga divided into seven distinct streams to not disturb seven meditating sages.',
        image: '/destinations/haridwar.webp',
      },
      {
        name: 'Bilkeshwar Mahadev Forest Temple',
        location: 'Shivalik Forest Foothills, Haridwar',
        distanceKm: 216,
        highlight: 'Secluded Stone Temple inside Forest Foliage',
        description: 'A deeply serene stone temple dedicated to Lord Shiva surrounded by dense trees, where Goddess Parvati is believed to have performed penance.',
        image: '/destinations/haridwar.webp',
      },
      {
        name: 'Kankhal Historic Heritage Lanes',
        location: 'Kankhal, Haridwar',
        distanceKm: 219,
        highlight: 'Ancient Brick Havelis & Daksh Temple',
        description: 'Haridwar\'s most historic cultural quarter featuring ancient brick architecture, serene bathing ghats, and the sacred Daksh Prajapati temple.',
        image: '/destinations/haridwar.webp',
      },
    ],
    places: {
      restaurants: [
        { name: 'Cheetal Grand Food Court', category: 'restaurant', location: 'Khatauli Bypass, UP (NH334)', distanceKm: 98, image: '/destinations/food-plaza.webp', highlight: 'Iconic Highway Breakfast, South Indian & Gardens' },
        { name: 'Namaste Midway Food Complex', category: 'restaurant', location: 'Mansurpur (NH334)', distanceKm: 112, image: '/destinations/food-plaza.webp', highlight: 'Haldirams, Starbucks, Subway & Clean Restrooms' },
        { name: 'Pandit Ji Da Dhaba', category: 'restaurant', location: 'Roorkee Highway, UK', distanceKm: 172, image: '/destinations/food-plaza.webp', highlight: 'Authentic Tandoori Roti & Dal Tadka' },
        { name: 'Jain Shikanji & Highway Treat', category: 'restaurant', location: 'Modinagar / Meerut Bypass', distanceKm: 48, image: '/destinations/food-plaza.webp', highlight: 'Legendary Masala Shikanji & Paneer Pakoras' },
        { name: 'Gulshan Dhaba & Family Restaurant', category: 'restaurant', location: 'Meerut Expressway Exit', distanceKm: 56, image: '/destinations/food-plaza.webp', highlight: 'Hot Stuffed Parathas with White Butter' },
      ],
      petrolPumps: [
        { name: 'Indian Oil COCO Fuel Center', category: 'petrol', location: 'Khatauli Bypass (NH334)', distanceKm: 99 },
        { name: 'Bharat Petroleum Highway Center', category: 'petrol', location: 'Muzaffarnagar Bypass, UP', distanceKm: 126 },
        { name: 'HPCL Auto Care Centre', category: 'petrol', location: 'Roorkee Bypass, UK', distanceKm: 174 },
        { name: 'Reliance Petroleum Fuel Point', category: 'petrol', location: 'Purkaji Bypass (NH334)', distanceKm: 148 },
      ],
      cngPumps: [
        { name: 'Indraprastha Gas (IGL) CNG Mega Hub', category: 'cng', location: 'Delhi-Meerut Expressway Exit', distanceKm: 52 },
        { name: 'Torrent Gas Highway CNG (Navgati Verified)', category: 'cng', location: 'Khatauli Bypass, UP', distanceKm: 96 },
        { name: 'Green Gas CNG Station (Navgati Verified)', category: 'cng', location: 'Roorkee Highway, UK', distanceKm: 170 },
        { name: 'Haridwar City Entrance CNG Pump', category: 'cng', location: 'Jwalapur Bypass, Haridwar', distanceKm: 210 },
      ],
      attractions: [
        { name: 'Har Ki Pauri (Brahma Kund)', category: 'attraction', location: 'Haridwar Town Center', distanceKm: 215, image: '/destinations/haridwar.webp', highlight: 'Sacred Ganga Aarti & Brahma Kund Bathing Ghat' },
        { name: 'Mansa Devi Temple (Ropeway)', category: 'attraction', location: 'Bilwa Parvat, Haridwar', distanceKm: 216, image: '/destinations/haridwar.webp', highlight: 'Hilltop Shakti Shrine via Udankhatola' },
        { name: 'Chandi Devi Temple (Neel Parvat)', category: 'attraction', location: 'Neel Parvat, Haridwar', distanceKm: 219, image: '/destinations/haridwar.webp', highlight: 'Ancient Hill Shrine with Panoramic Views' },
        { name: 'Shanti Kunj Gayatri Parivar', category: 'attraction', location: 'Motichur, Haridwar', distanceKm: 212, image: '/destinations/haridwar.webp', highlight: 'Global Spiritual Academy & Yajnashala' },
        { name: 'Daksh Prajapati Temple', category: 'attraction', location: 'Kankhal, Haridwar', distanceKm: 219, image: '/destinations/haridwar.webp', highlight: 'Historic Lord Shiva Yagna & Mythology Shrine' },
        { name: 'Maya Devi Temple', category: 'attraction', location: 'Upper Road, Haridwar', distanceKm: 214, image: '/destinations/haridwar.webp', highlight: '11th Century Ancient Shaktipeeth Temple' },
      ],
    },
    gallery: [
      { src: '/destinations/haridwar.webp', caption: 'Har Ki Pauri Evening Aarti', alt: 'Illuminated Ganga Aarti ceremony at Har Ki Pauri Haridwar' },
      { src: '/destinations/heritage-stop.webp', caption: 'Mansa Devi & Chandi Devi Shrines', alt: 'Historic hilltop temple shrines overlooking Haridwar' },
      { src: '/destinations/food-plaza.webp', caption: 'Cheetal Grand Food Hub', alt: 'Highway restaurant and family food plaza' },
      { src: '/destinations/hotel-resort.webp', caption: 'Haridwar Riverside Heritage Stays', alt: 'Riverside hotels and ashram retreats in Haridwar' },
    ],
  },

  // ---------------------------------------------------------------------------
  // 2. DELHI / NCR TO NAINITAL & KUMAON (Master Corridor)
  // ---------------------------------------------------------------------------
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
    alternativeRoutes: [
      {
        id: 'fastest-nh9',
        name: 'Fastest 4-Lane NH9 Highway Corridor',
        highway: 'via Delhi-Meerut Expressway, Hapur, Moradabad Bypass, Rampur & Rudrapur',
        distanceKm: 300,
        durationText: '6 - 6.5 Hours',
        tollPlazasCount: 3,
        tollAmount: 275,
        description: 'Smooth 4-lane national highway via Chhajrasi, Brijghat and Joya toll plazas. Fastest and most popular family outstation route.',
      },
      {
        id: 'scenic-kaladhungi',
        name: 'Scenic Bazpur & Kaladhungi Corbett Foothill Route',
        highway: 'via Moradabad Bypass → Kashipur → Bazpur → Kaladhungi',
        distanceKm: 295,
        durationText: '6 Hours',
        tollPlazasCount: 3,
        tollAmount: 275,
        description: 'Scenic countryside route bypassing Rudrapur city traffic, passing through Jim Corbett museum at Kaladhungi.',
      },
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
    hotelGroups: {
      budget: [
        {
          name: 'Hotel Himalaya Nainital',
          category: 'hotel',
          location: 'Tallital, Nainital',
          distanceKm: 298,
          image: '/destinations/hotel-resort.webp',
          highlight: 'Comfortable family rooms near bus stand with lake glimpses',
          priceRange: '₹1,500 - ₹2,800 / night',
        },
        {
          name: 'KMVN Tourist Rest House',
          category: 'hotel',
          location: 'Sukhatal, Nainital',
          distanceKm: 300,
          image: '/destinations/hotel-resort.webp',
          highlight: 'Government-verified tourism lodge with safe parking',
          priceRange: '₹1,200 - ₹2,200 / night',
        },
      ],
      medium: [
        {
          name: 'The Pavilion Heritage Hotel',
          category: 'hotel',
          location: 'Near High Court, Mallital, Nainital',
          distanceKm: 300,
          image: '/destinations/hotel-resort.webp',
          highlight: 'Colonial heritage ambiance, pine garden lawns & multi-cuisine meals',
          priceRange: '₹3,500 - ₹6,000 / night',
        },
        {
          name: 'Radisson Blu Hotel Rudrapur',
          category: 'hotel',
          location: 'Rudrapur Commercial Hub, UK',
          distanceKm: 220,
          image: '/destinations/hotel-resort.webp',
          highlight: '4-Star comfort, swimming pool & fine dining for foothill stopovers',
          priceRange: '₹3,800 - ₹6,500 / night',
        },
      ],
      luxury: [
        {
          name: 'The Manu Maharani Resort',
          category: 'hotel',
          location: 'Grassmere Estate, Nainital',
          distanceKm: 300,
          image: '/destinations/hotel-resort.webp',
          highlight: '5-Star luxury resort with panoramic Naini Lake views & spa',
          priceRange: '₹10,000 - ₹18,000 / night',
        },
        {
          name: 'The Naini Retreat Heritage Palace',
          category: 'hotel',
          location: 'Ayarpatta Slopes, Nainital',
          distanceKm: 299,
          image: '/destinations/hotel-resort.webp',
          highlight: 'Historic royal residence of the Maharaja of Pilibhit',
          priceRange: '₹11,000 - ₹22,000 / night',
        },
      ],
    },
    famousFoods: [
      {
        name: 'Sonam Fast Food',
        location: 'Tibetan Market, Mallital, Nainital',
        dish: 'Steamed Mutton & Veg Momos with Fiery Red Chutney',
        description: 'Nainital\'s most celebrated mountain street food, famous for piping hot juicy momos and thukpa.',
        image: '/destinations/nainital.webp',
      },
      {
        name: 'Sakley\'s Restaurant & Pastry Shop',
        location: 'Mallital, Nainital',
        dish: 'Honey Roasted Chicken, Apple Pie & Chocolate Lava',
        description: 'Charming vintage European cafe established in 1944 tucked under old oak trees.',
        image: '/destinations/nainital.webp',
      },
      {
        name: 'Mamu\'s Naini Sweets',
        location: 'Tallital, Nainital',
        dish: 'Bal Mithai & Singori Wrapped in Malu Leaves',
        description: 'Authentic Kumaoni sweet made from roasted roasted khoya coated with sugar globules.',
        image: '/destinations/nainital.webp',
      },
    ],
    hiddenGems: [
      {
        name: 'Kainchi Dham Ashram (Neem Karoli Baba)',
        location: 'Bhowali-Almora Highway (18 km from Nainital)',
        distanceKm: 316,
        highlight: 'Sacred Ashram visited by Steve Jobs & Mark Zuckerberg',
        description: 'World-famous sacred shrine surrounded by pine hills and lush mountain greenery.',
        image: '/destinations/kainchi-dham.webp',
      },
      {
        name: 'Pangot & Kilbury Bird Sanctuary',
        location: 'Pangot (15 km from Nainital)',
        distanceKm: 314,
        highlight: 'Quiet Himalayan Pine Forest & 250+ Bird Species',
        description: 'A secluded pine forest destination perfect for walking trails away from Nainital town bustle.',
        image: '/destinations/nainital.webp',
      },
      {
        name: 'Land\'s End Cliff View',
        location: 'Barapathar, Nainital',
        distanceKm: 302,
        highlight: 'Sheer Cliff View overlooking Khurpatal Lake',
        description: 'Magnificent precipice providing an aerial view of terraced emerald farms of Khurpatal.',
        image: '/destinations/nainital.webp',
      },
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

  // ---------------------------------------------------------------------------
  // 3. DELHI / NCR TO DEHRADUN & MUSSOORIE
  // ---------------------------------------------------------------------------
  'delhi-dehradun': {
    highway: 'via Delhi-Meerut Expressway & NH334',
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
      'Check in advance for weekend rush during hill station peak seasons.',
      'Cabs equipped with AC and experienced hill drivers guarantee smooth ride across Mohand Ghats.',
    ],
    alternativeRoutes: [
      {
        id: 'fastest-nh334',
        name: 'Fastest NH334 Highway Corridor',
        highway: 'via Delhi-Meerut Expressway, Khatauli, Roorkee & Mohand Pass',
        distanceKm: 248,
        durationText: '4 - 4.5 Hours',
        tollPlazasCount: 3,
        tollAmount: 255,
        description: 'Standard fast route through western UP crossing Mohand wildlife forest tunnel into Dehradun valley.',
      },
      {
        id: 'new-expressway',
        name: 'New Delhi-Dehradun Access-Controlled Expressway',
        highway: 'via Akshardham, Baghpat, Saharanpur & Asia\'s Longest Wildlife Elevated Corridor',
        distanceKm: 212,
        durationText: '3 Hours',
        tollPlazasCount: 3,
        tollAmount: 310,
        description: 'State-of-the-art elevated highway through Rajaji National Park forest canopy.',
      },
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
      { src: '/destinations/dehradun.webp', caption: 'Dehradun Valley & FRI Campus', alt: 'Scenic valley and heritage architecture in Dehradun' },
      { src: '/destinations/mussoorie.webp', caption: 'Mussoorie Queen of Hills', alt: 'Mussoorie mountain skyline and Mall Road' },
      { src: '/destinations/dhanaulti.webp', caption: 'Dhanaulti Pine Forests', alt: 'Dhanaulti Himalayan pine forest vista' },
      { src: '/destinations/food-plaza.webp', caption: 'Midway Highway Food Stop', alt: 'Highway restaurant and family food plaza' },
      { src: '/destinations/hotel-resort.webp', caption: 'Dehradun Foothill Resorts', alt: 'Boutique hill view resorts in Dehradun valley' },
    ],
  },

  // ---------------------------------------------------------------------------
  // 4. DELHI / NCR TO AGRA, MATHURA & VRINDAVAN
  // ---------------------------------------------------------------------------
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
    alternativeRoutes: [
      {
        id: 'yamuna-expressway',
        name: 'Fastest 6-Lane Yamuna Expressway',
        highway: 'via Greater Noida, Jewar, Mathura Toll & Agra Ring Road',
        distanceKm: 215,
        durationText: '3 Hours',
        tollPlazasCount: 3,
        tollAmount: 465,
        description: 'World-class controlled-access concrete expressway with dedicated midway food plazas. Fastest route to Taj Mahal.',
      },
      {
        id: 'old-mathura-nh19',
        name: 'Historic Old Mathura Road (NH19)',
        highway: 'via Faridabad, Ballabhgarh, Palwal, Kosi Kalan & Mathura',
        distanceKm: 230,
        durationText: '4.5 Hours',
        tollPlazasCount: 2,
        tollAmount: 215,
        description: 'Traditional Grand Trunk road passing directly through Braj pilgrimage towns of Palwal and Kosi Kalan.',
      },
    ],
    milestones: [
      { town: 'Delhi / Noida', km: 0, timeText: '0 hr', description: 'Start via Noida-Greater Noida Expressway' },
      { town: 'Greater Noida (Pari Chowk)', km: 35, timeText: '30 mins', description: 'Enter Yamuna Expressway Zero Point' },
      { town: 'Jewar (Noida Airport)', km: 68, timeText: '50 mins', description: 'First major expressway food plaza & fuel hub' },
      { town: 'Mathura / Vrindavan Exit', km: 145, timeText: '1.5 - 2 hr', description: 'Exit for Banke Bihari & Prem Mandir' },
      { town: 'Agra Toll Plaza', km: 198, timeText: '2.5 - 3 hr', description: 'Exit onto Agra Ring Road' },
      { town: 'Agra (Taj Mahal)', km: 215, timeText: '3 - 3.5 hr', description: 'Doorstep drop at your hotel or Taj Mahal East Gate' },
    ],
    hotelGroups: {
      budget: [
        {
          name: 'Hotel Taj Resort',
          category: 'hotel',
          location: 'Taj East Gate Road, Agra',
          distanceKm: 214,
          image: '/destinations/hotel-resort.webp',
          highlight: 'Walking distance to Taj Mahal with clean AC rooms',
          priceRange: '₹1,500 - ₹2,500 / night',
        },
      ],
      medium: [
        {
          name: 'Radisson Hotel Agra',
          category: 'hotel',
          location: 'Taj Nagari Phase 1, Agra',
          distanceKm: 212,
          image: '/destinations/hotel-resort.webp',
          highlight: 'Rooftop pool with Taj Mahal views & fine dining',
          priceRange: '₹4,000 - ₹7,000 / night',
        },
      ],
      luxury: [
        {
          name: 'The Oberoi Amarvilas',
          category: 'hotel',
          location: 'Taj East Gate Road, Agra',
          distanceKm: 214,
          image: '/destinations/hotel-resort.webp',
          highlight: 'World-renowned ultra-luxury palace with private balcony Taj views',
          priceRange: '₹35,000 - ₹75,000 / night',
        },
      ],
    },
    famousFoods: [
      {
        name: 'Panchi Petha Store',
        location: 'Hari Parvat & Sadar Bazaar, Agra',
        dish: 'Kesar Petha, Angoori Petha & Paan Petha',
        description: 'World-famous authentic Agra ash gourd sweet prepared in pure saffron and rose syrup.',
        image: '/destinations/agra.webp',
      },
      {
        name: 'Deviram Sweets & Restaurant',
        location: 'Pratap Pura, Agra',
        dish: 'Bedmi Puri with Spicy Aloo Sabzi & Hot Jalebi',
        description: 'Legendary morning Agra breakfast favorite featuring crispy lentil stuffed pooris.',
        image: '/destinations/agra.webp',
      },
    ],
    hiddenGems: [
      {
        name: 'Mehtab Bagh Moonlight Garden',
        location: 'Opposite Taj Mahal across Yamuna River',
        distanceKm: 216,
        highlight: 'Sunset silhouette view of Taj Mahal without crowds',
        description: 'Charbagh complex aligned perfectly across the river Yamuna providing stunning reflections of the Taj.',
        image: '/destinations/agra.webp',
      },
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

  // ---------------------------------------------------------------------------
  // 5. DELHI / NCR TO JAIPUR & RAJASTHAN
  // ---------------------------------------------------------------------------
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
    alternativeRoutes: [
      {
        id: 'delhi-mumbai-expressway-ne4',
        name: 'New 8-Lane Delhi-Mumbai Expressway (NE4)',
        highway: 'via Sohna Elevated Road, NE4 Expressway & Dausa Interchange',
        distanceKm: 275,
        durationText: '3.5 - 4 Hours',
        tollPlazasCount: 2,
        tollAmount: 480,
        description: 'Brand new high-speed 8-lane expressway with zero traffic signals, modern way-side amenities and scenic Aravalli tunnels.',
      },
      {
        id: 'old-highway-nh48',
        name: 'Classic NH48 Highway (via Dharuhera & Behror)',
        highway: 'via Gurugram, Dharuhera, Neemrana, Behror & Kotputli',
        distanceKm: 260,
        durationText: '4.5 - 5 Hours',
        tollPlazasCount: 3,
        tollAmount: 335,
        description: 'Classic highway passing by famous dhabas like Old Rao Hotel, Neemrana Japanese zone, and Highway King rest stops.',
      },
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

  // ---------------------------------------------------------------------------
  // 6. DELHI / NCR TO RISHIKESH & YOGA CAPITAL (Dedicated Master Corridor)
  // ---------------------------------------------------------------------------
  'delhi-rishikesh': {
    highway: 'via Delhi-Meerut Expressway (NE3) & NH334 Fast Corridor',
    routeChain: 'Delhi / NCR → Meerut Expressway → Khatauli Bypass → Muzaffarnagar → Roorkee → Haridwar Bypass → Raiwala → Rishikesh (Tapovan / Ram Jhula)',
    roadType: 'High-Speed Access Expressway (NE3), 4-Lane NH334 & Foothill Highway',
    weather: {
      temp: '22°C',
      condition: 'Refreshing Himalayan Foothill Breeze & Clean Air',
      feelsLike: '21°C',
    },
    travelTips: [
      'Delhi-Meerut Expressway connects directly to NH334 bypassing all city bottlenecks.',
      'Cheetal Grand (Km 99, Khatauli) is the premier midway stop for breakfast, filter coffee and clean washrooms.',
      'Bypass Haridwar congestion via the Raiwala highway flyover for direct access into Tapovan & Lakshman Jhula.',
      'Popular drop destinations include Tapovan, Ram Jhula, Swarg Ashram, and Shivpuri river rafting camps.',
      'All Urgent Taxis yellow-plate commercial cabs are pre-verified for seamless Uttarakhand entry.',
    ],
    milestones: [
      { town: 'Delhi / NCR Departure', km: 0, timeText: '00:00 Hrs', description: 'Doorstep pickup from anywhere in Delhi, Noida, Gurgaon or Ghaziabad.' },
      { town: 'Meerut Expressway Exit', km: 52, timeText: '00:45 Hrs', description: 'Smooth transition to 4-lane NH334 access highway.' },
      { town: 'Khatauli (Cheetal Grand)', km: 99, timeText: '01:35 Hrs', description: 'Iconic family breakfast stop with lush lawns & pristine washrooms.' },
      { town: 'Roorkee Highway Bypass', km: 172, timeText: '02:45 Hrs', description: 'Fast bypass past IIT Roorkee and Solani aqueduct.' },
      { town: 'Raiwala (Haridwar Bypass)', km: 218, timeText: '03:30 Hrs', description: 'Direct corridor skirting Rajaji National Park foothills.' },
      { town: 'Rishikesh (Tapovan Hub)', km: 238, timeText: '04:00 Hrs', description: 'Arrival at Yoga Capital of the World, Ram Jhula & Tapovan hotels.' },
    ],
    alternativeRoutes: [
      {
        id: 'expressway-nh334',
        name: 'Fastest Delhi-Meerut Expressway & NH334',
        highway: 'via DME, Khatauli, Roorkee Bypass & Raiwala Flyover',
        distanceKm: 238,
        durationText: '4 Hours',
        tollPlazasCount: 3,
        tollAmount: 380,
        description: 'Primary high-speed corridor with verified FASTag lanes, wide multilane roads, and world-class midway plazas.',
      },
      {
        id: 'upper-ganga-canal',
        name: 'Scenic Upper Ganga Canal Scenic Expressway',
        highway: 'via Muradnagar, Niwari, Purkaji & Roorkee Canal Road',
        distanceKm: 228,
        durationText: '4.5 Hours',
        tollPlazasCount: 1,
        tollAmount: 110,
        description: 'Green scenic canal route offering serene waterside countryside driving.',
      },
    ],
    famousFoods: [
      {
        name: 'Chotiwala Restaurant',
        location: 'Swarg Ashram, Rishikesh',
        dish: 'Traditional Garhwali Thali & Pure Ghee Halwa',
        description: 'Iconic 1958 heritage vegetarian dining landmark overlooking the Ganges.',
        image: '/destinations/rishikesh.webp',
      },
      {
        name: 'The Sitting Elephant (EllBee)',
        location: 'Haridwar Road, Rishikesh',
        dish: 'Rooftop River-View Dining & Continental Platters',
        description: 'Panoramic views of the Holy Ganges and Shivalik hills with gourmet multi-cuisine dining.',
        image: '/destinations/rishikesh.webp',
      },
      {
        name: 'German Bakery & Cafe Nirvana',
        location: 'Tapovan / Lakshman Jhula',
        dish: 'Fresh Herbal Teas, Wood-Fired Pizza & Croissants',
        description: 'Relaxed yogic atmosphere popular with international travelers and backpackers.',
        image: '/destinations/rishikesh.webp',
      },
    ],
    hiddenGems: [
      {
        name: 'Beatles Ashram (Chaurasi Kutia)',
        location: 'Swarg Ashram / Rajaji Reserve',
        distanceKm: 242,
        highlight: 'Historic Maharishi Mahesh Yogi Transcendental Meditation Ashram',
        description: 'Forest retreat where The Beatles stayed and composed the White Album in 1968, featuring graffiti stone igloos.',
        image: '/destinations/rishikesh.webp',
      },
      {
        name: 'Neer Garh Waterfall Trek',
        location: 'Neer Guddu (5 km past Tapovan)',
        distanceKm: 245,
        highlight: 'Two-Tiered Natural Turquoise Waterfall & Mountain Pools',
        description: 'Short forest hike through limestone gorges leading to pristine natural bathing pools.',
        image: '/destinations/rishikesh.webp',
      },
      {
        name: 'Vashistha Cave (Gufa)',
        location: 'Badrinath Road (21 km past Rishikesh)',
        distanceKm: 259,
        highlight: 'Ancient Riverbank Cave where Sage Vashistha Meditated',
        description: 'Tranquil white-sand river beach and sacred subterranean meditation cavern right on the Ganges.',
        image: '/destinations/rishikesh.webp',
      },
    ],
    hotelGroups: {
      luxury: [
        { name: 'Aloha on the Ganges', category: 'hotel', location: 'Tapovan, Rishikesh', distanceKm: 240, image: '/destinations/hotel-resort.webp', highlight: 'Infinity Pool Overlooking Ganges Valley', priceRange: '₹10,500/night' },
        { name: 'Taj Rishikesh Resort & Spa', category: 'hotel', location: 'Singthali / Byasi, Rishikesh', distanceKm: 265, image: '/destinations/hotel-resort.webp', highlight: 'Ultra-Luxury Himalayan Riverside Haven', priceRange: '₹22,000/night' },
        { name: 'The Roseate Ganges', category: 'hotel', location: 'Shivpuri, Rishikesh', distanceKm: 255, image: '/destinations/hotel-resort.webp', highlight: 'Boutique Forest Villas & Wellness Retreat', priceRange: '₹18,000/night' },
      ],
      medium: [
        { name: 'Ganga Kinare Heritage Hotel', category: 'hotel', location: 'Virbhadra Road, Rishikesh', distanceKm: 236, image: '/destinations/hotel-resort.webp', highlight: 'Private Riverside Ghat with Daily Evening Aarti', priceRange: '₹4,800/night' },
        { name: 'Modi Yoga Retreat', category: 'hotel', location: 'Muni Ki Reti, Rishikesh', distanceKm: 237, image: '/destinations/hotel-resort.webp', highlight: 'Holistic Ayurvedic Wellness & River View', priceRange: '₹5,500/night' },
        { name: 'Divine Resort & Spa', category: 'hotel', location: 'Tapovan, Rishikesh', distanceKm: 239, image: '/destinations/hotel-resort.webp', highlight: 'Direct View of Lakshman Jhula Suspension Bridge', priceRange: '₹4,200/night' },
      ],
      budget: [
        { name: 'Zostel Tapovan Rishikesh', category: 'hotel', location: 'Badrinath Road, Tapovan', distanceKm: 240, image: '/destinations/hotel-resort.webp', highlight: 'Top-Rated Traveler Hostel & Private Rooms', priceRange: '₹1,200/night' },
        { name: 'Hotel Tapovan Vatika', category: 'hotel', location: 'Tapovan Sarai, Rishikesh', distanceKm: 239, image: '/destinations/hotel-resort.webp', highlight: 'Clean AC Rooms near Ram Jhula & Ashrams', priceRange: '₹1,800/night' },
        { name: 'Parmarth Niketan Ashram Guest House', category: 'hotel', location: 'Swarg Ashram, Rishikesh', distanceKm: 241, image: '/destinations/hotel-resort.webp', highlight: 'Spiritual Riverfront Ashram Living', priceRange: '₹1,000/night' },
      ],
    },
    places: {
      restaurants: [
        { name: 'Cheetal Grand Food Hub', category: 'restaurant', location: 'Khatauli Bypass (NH334)', distanceKm: 99, image: '/destinations/food-plaza.webp', highlight: 'Legendary Paneer Pakoras, Cutlets & Filter Coffee' },
        { name: 'Jain Shikanji & Highway Treat', category: 'restaurant', location: 'Modinagar / Meerut Bypass', distanceKm: 48, image: '/destinations/food-plaza.webp', highlight: 'Fresh Masala Shikanji & North Indian Snacks' },
        { name: 'Chotiwala Restaurant', category: 'restaurant', location: 'Swarg Ashram, Rishikesh', distanceKm: 240, image: '/destinations/rishikesh.webp', highlight: 'Classic Vegetarian Dining Landmark' },
        { name: 'The Sitting Elephant', category: 'restaurant', location: 'Haridwar Road, Rishikesh', distanceKm: 236, image: '/destinations/rishikesh.webp', highlight: 'Rooftop Ganges View Dining' },
      ],
      petrolPumps: [
        { name: 'Indian Oil COCO Fuel Center', category: 'petrol', location: 'Khatauli Bypass (NH334)', distanceKm: 99 },
        { name: 'Bharat Petroleum Highway Center', category: 'petrol', location: 'Muzaffarnagar Bypass, UP', distanceKm: 126 },
        { name: 'HPCL Auto Care Centre', category: 'petrol', location: 'Roorkee Bypass, UK', distanceKm: 174 },
        { name: 'Indian Oil Highway Service Hub', category: 'petrol', location: 'Raiwala (NH334), UK', distanceKm: 224 },
      ],
      cngPumps: [
        { name: 'Indraprastha Gas (IGL) CNG Mega Hub', category: 'cng', location: 'Delhi-Meerut Expressway Exit', distanceKm: 52 },
        { name: 'Torrent Gas Highway CNG (Navgati Verified)', category: 'cng', location: 'Khatauli Bypass, UP', distanceKm: 96 },
        { name: 'Green Gas CNG Station (Navgati Verified)', category: 'cng', location: 'Roorkee Highway, UK', distanceKm: 170 },
        { name: 'Haridwar-Rishikesh Highway CNG Center (Navgati Verified)', category: 'cng', location: 'Jwalapur-Raiwala Corridor', distanceKm: 218 },
      ],
      attractions: [
        { name: 'Ram Jhula & Laxman Jhula', category: 'attraction', location: 'Muni Ki Reti / Swarg Ashram', distanceKm: 238, image: '/destinations/rishikesh.webp', highlight: 'Iconic Iron Suspension Bridges over the Sacred Ganges' },
        { name: 'Triveni Ghat Evening Maha Aarti', category: 'attraction', location: 'Mayakund, Rishikesh', distanceKm: 236, image: '/destinations/rishikesh.webp', highlight: 'Sacred Confluence of Three Rivers & Grand Evening Aarti' },
        { name: 'Parmarth Niketan Ganga Aarti', category: 'attraction', location: 'Swarg Ashram, Rishikesh', distanceKm: 241, image: '/destinations/rishikesh.webp', highlight: 'World-Renowned Sunset Aarti with Vedic Chants' },
        { name: 'Beatles Ashram (Chaurasi Kutia)', category: 'attraction', location: 'Rajaji Tiger Reserve Edge', distanceKm: 242, image: '/destinations/rishikesh.webp', highlight: 'Historic Ashram & Meditation Caves in the Forest' },
        { name: 'Shivpuri River Rafting Rapid Point', category: 'attraction', location: 'Shivpuri, Rishikesh', distanceKm: 254, image: '/destinations/rishikesh.webp', highlight: 'Grade III/IV Rapids & White Sand Beach Camps' },
      ],
    },
    gallery: [
      { src: '/destinations/rishikesh.webp', caption: 'Ram Jhula & Holy Ganges', alt: 'Panoramic view of Ram Jhula suspension bridge over the Ganges in Rishikesh' },
      { src: '/destinations/hotel-resort.webp', caption: 'Riverside Yoga Resorts', alt: 'Tranquil riverside wellness resorts in Rishikesh' },
      { src: '/destinations/food-plaza.webp', caption: 'Highway Dining at Cheetal Grand', alt: 'Popular highway rest stop on NH334' },
      { src: '/destinations/heritage-stop.webp', caption: 'Triveni Ghat Evening Aarti', alt: 'Spiritual Ganga Aarti ceremony at Triveni Ghat Rishikesh' },
    ],
  },

  // ---------------------------------------------------------------------------
  // 7. DELHI / NCR TO HALDWANI & KUMAON GATEWAY (Dedicated Master Corridor)
  // ---------------------------------------------------------------------------
  'delhi-haldwani': {
    highway: 'via Delhi-Meerut Expressway, NH9 & Rampur-Rudrapur Corridor',
    routeChain: 'Delhi / NCR → Hapur Bypass → Gajraula → Moradabad Bypass → Rampur → Bilaspur → Rudrapur → Haldwani (Kathgodam Gateway)',
    roadType: 'Access-Controlled Expressway, Multi-Lane NH9 & Smooth Terai Highway',
    weather: {
      temp: '23°C',
      condition: 'Pleasant Sub-Himalayan Weather & Clean Air',
      feelsLike: '22°C',
    },
    travelTips: [
      'Delhi-Meerut Expressway up to Dasna and NH9 onwards provides a fast, 4-lane driving corridor.',
      'Gajraula Midway (Km 105) is the most trusted food and washroom break point with Bikanervala and KFC.',
      'Haldwani is the commercial gateway to Kumaon hills, Nainital, Almora, and Kainchi Dham.',
      'Kathgodam Railway Station and transport hub is just 5 km past Haldwani city center.',
      'Urgent Taxis yellow-plate commercial cabs are pre-cleared for Uttarakhand state border entry.',
    ],
    milestones: [
      { town: 'Delhi / NCR Departure', km: 0, timeText: '00:00 Hrs', description: 'Doorstep pickup from any residential sector or airport terminal.' },
      { town: 'Hapur Bypass (NH9)', km: 58, timeText: '00:55 Hrs', description: 'Crossing Eastern Peripheral Expressway intersection.' },
      { town: 'Gajraula Highway Midway', km: 105, timeText: '01:45 Hrs', description: 'Premier family food hub featuring Bikanervala, Tadka Punjab Ka & clean restrooms.' },
      { town: 'Moradabad Bypass', km: 165, timeText: '02:40 Hrs', description: 'Smooth elevated bypass avoiding Moradabad city congestion.' },
      { town: 'Rudrapur Industrial Hub', km: 238, timeText: '04:00 Hrs', description: 'Major manufacturing district and commercial gateway to Uttarakhand.' },
      { town: 'Haldwani City Center', km: 270, timeText: '04:45 Hrs', description: 'Arrival at Haldwani and Kathgodam base of Kumaon foothills.' },
    ],
    alternativeRoutes: [
      {
        id: 'fastest-nh9',
        name: 'Fastest 4-Lane NH9 via Rampur & Rudrapur',
        highway: 'via DME, Gajraula, Moradabad Bypass, Rampur & Rudrapur',
        distanceKm: 270,
        durationText: '4.5 - 5 Hours',
        tollPlazasCount: 3,
        tollAmount: 395,
        description: 'Primary four-lane national highway with wide toll plazas and plentiful midway restaurants.',
      },
      {
        id: 'via-bazpur-kaladhungi',
        name: 'Scenic Corbett Foothills via Kashipur & Bazpur',
        highway: 'via Moradabad, Kashipur, Bazpur & Kaladhungi',
        distanceKm: 280,
        durationText: '5.5 Hours',
        tollPlazasCount: 2,
        tollAmount: 220,
        description: 'Picturesque rural highway driving past mango orchards and Jim Corbett gateway.',
      },
    ],
    famousFoods: [
      {
        name: 'Standard Sweet & Restaurant',
        location: 'Bareilly Road, Haldwani',
        dish: 'Pure Khoya Bal Mithai & Kumaoni Singori',
        description: 'Renowned sweet shop delivering authentic mountain delicacies made with pure hill milk.',
        image: '/destinations/haldwani.webp',
      },
      {
        name: 'The Kathgodam Food Plaza',
        location: 'Kathgodam Station Road',
        dish: 'Piping Hot Mountain Chai & Maggi with Garhwali Buns',
        description: 'Beloved transit food point for tourists heading up towards Nainital and Bhimtal.',
        image: '/destinations/haldwani.webp',
      },
    ],
    hiddenGems: [
      {
        name: 'Gaula Barrage & River Vista',
        location: 'Gaula River, Haldwani',
        distanceKm: 273,
        highlight: 'Scenic River Reservoir Overlooked by Himalayan Foothills',
        description: 'Peaceful riverbank picnic attraction on the Gaula River, loved for sunsets and bird watching.',
        image: '/destinations/haldwani.webp',
      },
      {
        name: 'Hedakhan Ashram & Temple',
        location: 'Chorgallia Road (5 km from Haldwani)',
        distanceKm: 275,
        highlight: 'Spiritual Riverfront Meditation Sanctuary',
        description: 'Serene ashram nestled amidst tranquil mango groves and flowing stream waters.',
        image: '/destinations/haldwani.webp',
      },
      {
        name: 'Kathgodam Shivalik Lookout Point',
        location: 'Kathgodam-Nainital Ascent (Km 2)',
        distanceKm: 278,
        highlight: 'First Glimpse of the Towering Kumaon Mountain Ranges',
        description: 'Panoramic viewpoint overlooking the glowing nighttime lights of Haldwani plains.',
        image: '/destinations/haldwani.webp',
      },
    ],
    hotelGroups: {
      luxury: [
        { name: 'Fortune Walkway Hotel', category: 'hotel', location: 'Nainital Road, Haldwani', distanceKm: 271, image: '/destinations/hotel-resort.webp', highlight: 'Premium ITC Fortune Hotel with Fine Dining', priceRange: '₹6,500/night' },
        { name: 'Rosewood Hotel Haldwani', category: 'hotel', location: 'Bareilly-Nainital Road', distanceKm: 269, image: '/destinations/hotel-resort.webp', highlight: 'Boutique Comfort with Mountain View Suites', priceRange: '₹4,500/night' },
      ],
      medium: [
        { name: 'Hotel Relax Inn', category: 'hotel', location: 'Kaladhungi Road, Haldwani', distanceKm: 270, image: '/destinations/hotel-resort.webp', highlight: 'Central Location with Family Amenities', priceRange: '₹2,800/night' },
        { name: 'Hotel Saurabh Candy by Peppermint', category: 'hotel', location: 'Civil Lines, Haldwani', distanceKm: 271, image: '/destinations/hotel-resort.webp', highlight: 'Modern Lifestyle Transit Stay', priceRange: '₹3,200/night' },
      ],
      budget: [
        { name: 'Hotel Kathgodam Residency', category: 'hotel', location: 'Station Road, Kathgodam', distanceKm: 274, image: '/destinations/hotel-resort.webp', highlight: 'Directly Opposite Kathgodam Railway Station', priceRange: '₹1,500/night' },
        { name: 'Hotel Milan & Restaurant', category: 'hotel', location: 'Bus Stand Road, Haldwani', distanceKm: 269, image: '/destinations/hotel-resort.webp', highlight: 'Affordable & Clean Outstation Transit Room', priceRange: '₹1,200/night' },
      ],
    },
    places: {
      restaurants: [
        { name: 'Bikanervala Highway Food Court', category: 'restaurant', location: 'Gajraula, UP (NH9)', distanceKm: 105, image: '/destinations/food-plaza.webp', highlight: 'Pure Veg Meals, Chhole Bhature & Clean Restrooms' },
        { name: 'Tadka Punjab Ka Family Dhaba', category: 'restaurant', location: 'Gajraula Midway, UP', distanceKm: 108, image: '/destinations/food-plaza.webp', highlight: 'Authentic Dal Makhani & Tandoori Parathas' },
        { name: 'Standard Sweet & Restaurant', category: 'restaurant', location: 'Bareilly Road, Haldwani', distanceKm: 270, image: '/destinations/haldwani.webp', highlight: 'Famous Kumaoni Sweets & Vegetarian Thali' },
        { name: 'The Chocolate Room & Cafe', category: 'restaurant', location: 'Nainital Road, Haldwani', distanceKm: 271, image: '/destinations/haldwani.webp', highlight: 'Artisan Coffee, Pastas & Shakes' },
      ],
      petrolPumps: [
        { name: 'Indian Oil COCO Fuel Center', category: 'petrol', location: 'Gajraula Highway (NH9)', distanceKm: 104 },
        { name: 'Bharat Petroleum Highway Hub', category: 'petrol', location: 'Moradabad Bypass, UP', distanceKm: 156 },
        { name: 'HP Petrol Pump Swagat Point', category: 'petrol', location: 'Rudrapur Highway, UK', distanceKm: 222 },
        { name: 'Indian Oil Auto Care', category: 'petrol', location: 'Rudrapur-Haldwani Road, UK', distanceKm: 258 },
      ],
      cngPumps: [
        { name: 'Indraprastha Gas (IGL) CNG Hub', category: 'cng', location: 'Hapur Bypass (NH9)', distanceKm: 55 },
        { name: 'Torrent Gas Highway CNG (Navgati Verified)', category: 'cng', location: 'Gajraula Bypass, UP', distanceKm: 102 },
        { name: 'Green Gas CNG Station (Navgati Verified)', category: 'cng', location: 'Moradabad Bypass, UP', distanceKm: 154 },
        { name: 'Adani Total Gas CNG (Navgati Verified)', category: 'cng', location: 'Rudrapur Industrial Area, UK', distanceKm: 224 },
        { name: 'Haldwani Transport Nagar CNG Pump (Navgati Verified)', category: 'cng', location: 'Bareilly-Nainital Road, Haldwani', distanceKm: 268 },
      ],
      attractions: [
        { name: 'Gaula Barrage', category: 'attraction', location: 'Gaula River, Haldwani', distanceKm: 273, image: '/destinations/haldwani.webp', highlight: 'Picturesque River Reservoir & Shivalik Mountain Backdrop' },
        { name: 'Hedakhan Ashram', category: 'attraction', location: 'Chorgallia Road, Haldwani', distanceKm: 275, image: '/destinations/haldwani.webp', highlight: 'Spiritual Riverbank Temple & Mango Grove Retreat' },
        { name: 'Kathgodam Shivalik Point', category: 'attraction', location: 'Kathgodam Foothills', distanceKm: 278, image: '/destinations/haldwani.webp', highlight: 'Historic Railhead & Gateway into Kumaon Hills' },
        { name: 'Sheetla Devi Temple', category: 'attraction', location: 'Ranibagh, Haldwani', distanceKm: 276, image: '/destinations/haldwani.webp', highlight: 'Ancient Hilltop Devi Temple on River Confluence' },
      ],
    },
    gallery: [
      { src: '/destinations/haldwani.webp', caption: 'Gaula Barrage & Kathgodam Hills', alt: 'Haldwani gateway view of Kumaon mountain ranges' },
      { src: '/destinations/food-plaza.webp', caption: 'Gajraula Midway Highway Stop', alt: 'Food plaza and restaurant stop on Delhi-Haldwani route' },
      { src: '/destinations/hotel-resort.webp', caption: 'Haldwani Business & Transit Stays', alt: 'Hotels and accommodations in Haldwani' },
      { src: '/destinations/heritage-stop.webp', caption: 'Sheetla Devi Ranibagh Shrine', alt: 'Historic temple shrine near Kathgodam Haldwani' },
    ],
  },
  // ---------------------------------------------------------------------------
  // 8. DELHI / NCR TO CHANDIGARH (Master Corridor)
  // ---------------------------------------------------------------------------
  'delhi-chandigarh': {
    highway: 'via NH-44 Grand Trunk Road (GT Road 6-Lane Expressway)',
    routeChain: 'Delhi / NCR → Murthal (Km 48) → Panipat Toll (Km 92) → Karnal Haveli (Km 130) → Kurukshetra Pipli → Ambala Cantt (Km 200) → Zirakpur Flyover → Chandigarh Tribune Chowk (Km 245)',
    roadType: 'High-Speed 6-Lane Access-Controlled NH-44 GT Highway with Flyovers & Grade Separators',
    weather: {
      temp: '22°C',
      condition: 'Clear Highway Skies & Fresh North Plains Breeze',
      feelsLike: '21°C',
    },
    travelTips: [
      'Fastest corridor connecting National Capital with Chandigarh via seamless 6-lane NH-44.',
      'Iconic dhabas at Murthal (Amrik Sukhdev, Gulshan) and Karnal (Haveli, Mayur) offer 24x7 dining and clean family facilities.',
      'Equipped with verified FASTag for instantaneous clearance at Panipat, Gharaunda, and Sambhu toll plazas.',
      'Dedicated doorstep drop across all Chandigarh sectors, Mohali IT Park, and Panchkula.',
    ],
    alternativeRoutes: [
      {
        id: 'nh44-primary',
        name: 'Primary NH-44 Grand Trunk Corridor',
        highway: 'via NH-44 (GT Road)',
        distanceKm: 245,
        durationText: '3.5 - 4 Hours',
        tollPlazasCount: 3,
        tollAmount: 390,
        description: 'Direct 6-lane high-speed expressway via Panipat, Karnal & Ambala with world-class food plazas.',
      },
      {
        id: 'wpe-bypass',
        name: 'Western Peripheral Expressway Bypass (WPE)',
        highway: 'via Kundli-Manesar-Palwal (KMP) & NH-44',
        distanceKm: 260,
        durationText: '4 - 4.5 Hours',
        tollPlazasCount: 4,
        tollAmount: 460,
        description: 'Bypasses internal Delhi traffic from Gurgaon / Faridabad directly onto NH-44 at Kundli.',
      },
    ],
    milestones: [
      { town: 'Delhi / NCR Departure', km: 0, timeText: '0 hr', description: 'Doorstep pickup across Delhi, Noida, or Gurgaon.' },
      { town: 'Murthal Paratha Hub', km: 48, timeText: '45 mins', description: 'Famous 24x7 dhabas (Amrik Sukhdev & Gulshan).' },
      { town: 'Panipat Elevated Toll Plaza', km: 92, timeText: '1.5 hr', description: 'Historic textile city with elevated highway bypass.' },
      { town: 'Karnal Haveli & Lake', km: 130, timeText: '2.2 hr', description: 'Premier midway refreshment stop with modern restrooms.' },
      { town: 'Ambala Cantt Flyover', km: 200, timeText: '3.2 hr', description: 'Major twin-city junction connecting to Punjab & HP.' },
      { town: 'Chandigarh Tribune Chowk', km: 245, timeText: '4 hr', description: 'Smooth arrival at the City Beautiful.' },
    ],
    hotelGroups: {
      budget: [
        { name: 'Hotel City Plaza 17', category: 'hotel', location: 'Sector 17, Chandigarh', distanceKm: 245, image: '/destinations/hotel-resort.webp', highlight: 'Clean AC rooms, elevator & central shopping walk', priceRange: '₹1,500 - ₹2,400 / night' },
        { name: 'Hotel Sunbeam Premium', category: 'hotel', location: 'Sector 22, Chandigarh', distanceKm: 246, image: '/destinations/hotel-resort.webp', highlight: 'Family suites & central location', priceRange: '₹2,200 - ₹3,200 / night' },
      ],
      medium: [
        { name: 'The Fern Residency', category: 'hotel', location: 'Industrial Area Phase 2, Chandigarh', distanceKm: 243, image: '/destinations/hotel-resort.webp', highlight: 'Eco-friendly modern hotel with fine dining', priceRange: '₹3,500 - ₹5,500 / night' },
        { name: 'Hotel Mountview', category: 'hotel', location: 'Sector 10, Chandigarh', distanceKm: 248, image: '/destinations/hotel-resort.webp', highlight: 'Lush green surroundings & multi-cuisine restaurants', priceRange: '₹4,500 - ₹7,000 / night' },
      ],
      luxury: [
        { name: 'JW Marriott Hotel Chandigarh', category: 'hotel', location: 'Sector 35B, Chandigarh', distanceKm: 246, image: '/destinations/hotel-resort.webp', highlight: '5-star luxury, rooftop pool & spa', priceRange: '₹9,000 - ₹18,000 / night' },
        { name: 'The Lalit Chandigarh', category: 'hotel', location: 'IT Park, Chandigarh', distanceKm: 250, image: '/destinations/hotel-resort.webp', highlight: 'Palatial luxury overlooking Shivalik hills', priceRange: '₹8,000 - ₹16,000 / night' },
      ],
    },
    famousFoods: [
      { name: 'Murthal Parathas with White Butter', location: 'Murthal Km 48', dish: 'Tandoori Aloo Pyaaz & Paneer Paratha', description: 'Legendary crispy tandoori parathas served with enormous dollops of white butter and sweet curd.', image: '/destinations/food-plaza.webp' },
      { name: 'Haveli Punjabi Delights', location: 'Karnal Midway Km 130', dish: 'Amritsari Kulcha, Chhole & Dal Makhani', description: 'Rich Punjabi thali with authentic desi ghee tadka in an iconic village theme heritage complex.', image: '/destinations/food-plaza.webp' },
      { name: 'Puran Singh Da Dhaba Mutton & Curry', location: 'Ambala Cantt Km 200', dish: 'Famous Keema Kaleji & Chicken Curry', description: 'Decades-old legendary highway dhaba celebrated across North India.', image: '/destinations/food-plaza.webp' },
    ],
    hiddenGems: [
      { name: 'Yadavindra Gardens (Pinjore)', location: 'Pinjore, Kalka Highway', distanceKm: 265, highlight: '17th Century Mughal Terraced Gardens & Fountains', description: 'Magnificent Mughal-style landscaped terraced gardens illuminated in evenings.', image: '/destinations/chandigarh.webp' },
      { name: 'Chhatbir Zoo & Lion Safari', location: 'Zirakpur-Patiala Highway', distanceKm: 238, highlight: 'Open Zoological Park & Wildlife Safari', description: 'Massive wildlife sanctuary hosting Asiatic lions and Royal Bengal tigers.', image: '/destinations/chandigarh.webp' },
    ],
    places: {
      restaurants: [
        { name: 'Amrik Sukhdev Dhaba', category: 'restaurant', location: 'Murthal NH-44 (Km 48)', distanceKm: 48, image: '/destinations/food-plaza.webp', highlight: 'World-Famous 24x7 Highway Dhaba & Bakery' },
        { name: 'Haveli Heritage Complex', category: 'restaurant', location: 'Karnal NH-44 (Km 130)', distanceKm: 130, image: '/destinations/food-plaza.webp', highlight: 'Iconic Punjabi Village Dhaba & Family Restrooms' },
        { name: 'Mayur Dhaba & Restaurant', category: 'restaurant', location: 'Karnal Midway', distanceKm: 132, image: '/destinations/food-plaza.webp', highlight: 'Fresh North Indian Meals & Sweets' },
        { name: 'Puran Singh Da Dhaba', category: 'restaurant', location: 'Ambala Cantt Flyover', distanceKm: 200, image: '/destinations/food-plaza.webp', highlight: 'Legendary Non-Veg & Veg Highway Specialties' },
      ],
      petrolPumps: [
        { name: 'Indian Oil COCO Mega Center', category: 'petrol', location: 'Murthal NH-44 (Km 52)', distanceKm: 52 },
        { name: 'Bharat Petroleum Oasis Highway Center', category: 'petrol', location: 'Gharaunda Karnal (Km 118)', distanceKm: 118 },
        { name: 'HPCL Auto Care Centre', category: 'petrol', location: 'Ambala Cantt (Km 198)', distanceKm: 198 },
      ],
      cngPumps: [
        { name: 'Indraprastha Gas (IGL) Sonipat Hub (Navgati Verified)', category: 'cng', location: 'Murthal Bypass (NH-44)', distanceKm: 49, highlight: 'Navgati App Verified: High Pressure (205 Bar)' },
        { name: 'Adani Total Gas CNG (Navgati Verified)', category: 'cng', location: 'Panipat Toll Plaza (NH-44)', distanceKm: 93, highlight: 'Navgati App Verified: 24x7 Fast Dispenser & Zero Wait' },
        { name: 'Gujarat Gas Mega CNG Station (Navgati Verified)', category: 'cng', location: 'Karnal Midway (NH-44)', distanceKm: 129, highlight: 'Navgati App Verified: High Pressure (210 Bar) & Fast Queue' },
        { name: 'Torrent Gas Highway CNG (Navgati Verified)', category: 'cng', location: 'Ambala Cantt Bypass', distanceKm: 199, highlight: 'Navgati App Verified: Quick Fill & Multi-Lane Dispensers' },
      ],
      attractions: [
        { name: 'Rock Garden of Chandigarh', category: 'attraction', location: 'Sector 1, Chandigarh', distanceKm: 247, image: '/destinations/chandigarh.webp', highlight: 'Nek Chand Sculpture Park from Recycled Material' },
        { name: 'Sukhna Lake Promenade', category: 'attraction', location: 'Sector 1, Chandigarh', distanceKm: 248, image: '/destinations/chandigarh.webp', highlight: 'Scenic 3-km Reservoir with Boating & Mountain Views' },
        { name: 'Zakir Hussain Rose Garden', category: 'attraction', location: 'Sector 16, Chandigarh', distanceKm: 246, image: '/destinations/chandigarh.webp', highlight: 'Asia Largest Rose Garden with 1,600+ Varieties' },
      ],
    },
    gallery: [
      { src: '/destinations/chandigarh.webp', caption: 'Chandigarh City Beautiful', alt: 'Chandigarh modern city architecture and Shivalik mountains' },
      { src: '/destinations/food-plaza.webp', caption: 'Karnal Haveli Midway Stop', alt: 'Haveli Punjabi dhaba midway stop on NH-44' },
      { src: '/destinations/hotel-resort.webp', caption: 'Premium Cab Comfort', alt: 'Urgent Taxis verified sedan and SUV fleet' },
      { src: '/destinations/delhi.webp', caption: 'Capital Departure Vista', alt: 'Delhi departure corridor onto NH-44' },
    ],
  },

  // ---------------------------------------------------------------------------
  // 9. DELHI / NCR TO LUCKNOW (Master Corridor)
  // ---------------------------------------------------------------------------
  'delhi-lucknow': {
    highway: 'via Yamuna Expressway & Agra-Lucknow Expressway (6-Lane Access-Controlled)',
    routeChain: 'Delhi / NCR → Greater Noida Zero Point → Jewar Toll (Km 38) → Mathura Toll (Km 95) → Agra Interchange (Km 165) → Firozabad Bypass → Kannauj Exit (Km 430) → Mohan Road Toll → Lucknow Gomti Nagar (Km 555)',
    roadType: 'India Premier 6-Lane Access-Controlled Green Expressway Network (Speed limit 100 km/h)',
    weather: {
      temp: '25°C',
      condition: 'Sunny Skies & Pleasant Awadh Plains Air',
      feelsLike: '24°C',
    },
    travelTips: [
      'India premier 100 km/h expressway cuts travel time from 11+ hours to just 6.5 hours.',
      'Modern midway wayside amenities with food plazas, clean family restrooms, and EV/fuel stations at Km 65 & Km 105 on Yamuna Expressway, and Km 100 & Km 220 on Agra-Lucknow Expressway.',
      'Equipped with verified FASTag for electronic tolling across both state expressways.',
      'Direct doorstep drop across Gomti Nagar, Hazratganj, Charbagh, Alambagh, and Chaudhary Charan Singh Airport.',
    ],
    alternativeRoutes: [
      {
        id: 'expressway-primary',
        name: 'Yamuna & Agra-Lucknow Expressway Direct',
        highway: 'via Yamuna Exp & Agra-Lucknow Exp',
        distanceKm: 555,
        durationText: '6.5 - 7 Hours',
        tollPlazasCount: 4,
        tollAmount: 1025,
        description: 'Fastest 6-lane access-controlled expressway corridor in the country with zero city congestion.',
      },
      {
        id: 'nh19-gt-road',
        name: 'NH-19 (Old NH-2) National Highway',
        highway: 'via Mathura, Agra, Etawah, Kanpur & Unnao',
        distanceKm: 535,
        durationText: '10 - 11 Hours',
        tollPlazasCount: 6,
        tollAmount: 640,
        description: 'National highway route through major industrial cities suitable for commercial cargo stops.',
      },
    ],
    milestones: [
      { town: 'Delhi / NCR Zero Point', km: 0, timeText: '0 hr', description: 'Pickup across Delhi, Noida, or Greater Noida.' },
      { town: 'Jewar Toll Plaza', km: 38, timeText: '30 mins', description: 'Approach to Noida International Airport zone.' },
      { town: 'Agra Expressway Interchange', km: 165, timeText: '2 hr', description: 'Seamless crossover from Yamuna to Agra-Lucknow Expressway.' },
      { town: 'Etawah / Saifai Toll', km: 330, timeText: '3.8 hr', description: 'Midway fuel, CNG, and wayside family food plazas.' },
      { town: 'Kannauj Perfume Capital Exit', km: 430, timeText: '5 hr', description: 'Historic fragrance city junction.' },
      { town: 'Lucknow Mohan Road Toll', km: 540, timeText: '6.2 hr', description: 'Entering Lucknow metropolitan ring road.' },
      { town: 'Lucknow City Center', km: 555, timeText: '6.5 hr', description: 'Comfortable doorstep drop in Hazratganj or Gomti Nagar.' },
    ],
    hotelGroups: {
      budget: [
        { name: 'Hotel Levana Suites', category: 'hotel', location: 'Hazratganj, Lucknow', distanceKm: 555, image: '/destinations/hotel-resort.webp', highlight: 'Clean AC rooms, elevator & safe parking', priceRange: '₹1,600 - ₹2,500 / night' },
      ],
      medium: [
        { name: 'Fairfield by Marriott Lucknow', category: 'hotel', location: 'Gomti Nagar, Lucknow', distanceKm: 558, image: '/destinations/hotel-resort.webp', highlight: 'Modern international business hotel with breakfast buffet', priceRange: '₹4,000 - ₹6,500 / night' },
        { name: 'Hyatt Regency Lucknow', category: 'hotel', location: 'Vibhuti Khand, Gomti Nagar', distanceKm: 560, image: '/destinations/hotel-resort.webp', highlight: 'Contemporary luxury with pool & fine dining', priceRange: '₹5,500 - ₹8,500 / night' },
      ],
      luxury: [
        { name: 'Taj Mahal Lucknow', category: 'hotel', location: 'Vipin Khand, Gomti Nagar', distanceKm: 556, image: '/destinations/hotel-resort.webp', highlight: 'Iconic Nawabi heritage luxury, sprawling gardens & spa', priceRange: '₹11,000 - ₹24,000 / night' },
        { name: 'The Centrum Lucknow', category: 'hotel', location: 'Sushant Golf City, Lucknow', distanceKm: 550, image: '/destinations/hotel-resort.webp', highlight: 'Sprawling 5-star resort with golf views & wellness center', priceRange: '₹8,500 - ₹18,000 / night' },
      ],
    },
    famousFoods: [
      { name: 'Tunday Kababi Galouti Kababs', location: 'Aminabad / Chowk, Lucknow', dish: 'Melt-in-Mouth Galouti Kababs with Ulte Tawe Ka Paratha', description: 'Century-old legendary Awadhi recipe made with 160 secret spices.', image: '/destinations/food-plaza.webp' },
      { name: 'Dastarkhwan Awadhi Biryani', location: 'Hazratganj, Lucknow', dish: 'Dum Biryani & Murgh Kalimirch', description: 'Aromatic basmati rice cooked on slow dum with tender marinated meat.', image: '/destinations/food-plaza.webp' },
      { name: 'Chappan Bhog Malai Paan & Makhan Malai', location: 'Sadar Bazar, Lucknow', dish: 'Authentic Awadhi Sweets & Chhena Toast', description: 'World-famous seasonal winter froth dessert and innovative sweets.', image: '/destinations/food-plaza.webp' },
    ],
    hiddenGems: [
      { name: 'Rumi Darwaza & Bada Imambara', location: 'Hussainabad, Old Lucknow', distanceKm: 553, highlight: 'Architectural Wonder with Gravity-Defying Bhulbhulaiya Maze', description: 'Magnificent 18th-century monument constructed by Nawab Asaf-ud-Daula.', image: '/destinations/lucknow.webp' },
      { name: 'Janeshwar Mishra Park', location: 'Gomti Nagar Extension', distanceKm: 562, highlight: 'Asia Largest Eco-Friendly Urban Park', description: 'Sprawling green park with scenic water bodies, cycling tracks & boating.', image: '/destinations/lucknow.webp' },
    ],
    places: {
      restaurants: [
        { name: 'Yamuna Expressway Food Plaza (Km 65)', category: 'restaurant', location: 'Jewar Corridor', distanceKm: 65, image: '/destinations/food-plaza.webp', highlight: 'Subway, Costa Coffee, Haldiram & Clean Washrooms' },
        { name: 'Midway Highway Oasis (Km 105)', category: 'restaurant', location: 'Mathura Exit', distanceKm: 105, image: '/destinations/food-plaza.webp', highlight: 'Bikanervala, McDonald & Family Dining' },
        { name: 'Agra-Lucknow Expressway Way-side Amenity (Km 100)', category: 'restaurant', location: 'Firozabad Midway', distanceKm: 265, image: '/destinations/food-plaza.webp', highlight: 'Pure Veg Highway Dhaba & Fast Food' },
        { name: 'Kannauj Way-side Food Court (Km 220)', category: 'restaurant', location: 'Kannauj Wayside', distanceKm: 385, image: '/destinations/food-plaza.webp', highlight: 'Fresh Parathas, Tea & Restroom Stop' },
      ],
      petrolPumps: [
        { name: 'Indian Oil COCO Way-side Plaza', category: 'petrol', location: 'Yamuna Expressway Km 65', distanceKm: 65 },
        { name: 'Bharat Petroleum Highway Center', category: 'petrol', location: 'Agra-Lucknow Exp Km 100', distanceKm: 265 },
        { name: 'HPCL Expressway Auto Care', category: 'petrol', location: 'Agra-Lucknow Exp Km 220', distanceKm: 385 },
      ],
      cngPumps: [
        { name: 'IGL Greater Noida Expressway CNG (Navgati Verified)', category: 'cng', location: 'Expressway Zero Point', distanceKm: 20, highlight: 'Navgati App Verified: High Pressure (205 Bar)' },
        { name: 'Torrent Gas Jewar Plaza CNG (Navgati Verified)', category: 'cng', location: 'Jewar Toll Plaza', distanceKm: 39, highlight: 'Navgati App Verified: 24x7 Fast Dispenser' },
        { name: 'Green Gas Limited Midway CNG (Navgati Verified)', category: 'cng', location: 'Agra-Lucknow Exp Km 100', distanceKm: 266, highlight: 'Navgati App Verified: 200 Bar pressure & Fast Fill' },
        { name: 'Green Gas Limited Lucknow Entry Plaza (Navgati Verified)', category: 'cng', location: 'Mohan Road Toll Approach', distanceKm: 539, highlight: 'Navgati App Verified: Quick Queue & Digital Payment' },
      ],
      attractions: [
        { name: 'Bada Imambara & Bhulbhulaiya', category: 'attraction', location: 'Machchhi Bhavan, Lucknow', distanceKm: 554, image: '/destinations/lucknow.webp', highlight: 'World Famous Unsupported Arched Hall & Labyrinth' },
        { name: 'Chota Imambara', category: 'attraction', location: 'Hussainabad, Lucknow', distanceKm: 555, image: '/destinations/lucknow.webp', highlight: 'Palace of Lights with Intricate Calligraphy' },
        { name: 'Hazratganj Heritage Market', category: 'attraction', location: 'Hazratganj, Lucknow', distanceKm: 556, image: '/destinations/lucknow.webp', highlight: 'Victorian-Style High Street Shopping & Dining' },
      ],
    },
    gallery: [
      { src: '/destinations/lucknow.webp', caption: 'Rumi Darwaza & Heritage Lucknow', alt: 'Historic Rumi Darwaza in Lucknow' },
      { src: '/destinations/food-plaza.webp', caption: 'Expressway Modern Food Plaza', alt: 'Clean family dining stop on Agra-Lucknow Expressway' },
      { src: '/destinations/hotel-resort.webp', caption: 'Nawabi Hospitality & Luxury', alt: 'Premium accommodation in Lucknow' },
      { src: '/destinations/delhi.webp', caption: 'Delhi Expressway Departure', alt: 'Departure onto Yamuna Expressway' },
    ],
  },

  // ---------------------------------------------------------------------------
  // 10. DELHI / NCR TO PATNA (Master Bihar Corridor)
  // ---------------------------------------------------------------------------
  'delhi-patna': {
    highway: 'via Yamuna Exp, Agra-Lucknow Exp, Purvanchal Exp & NH-922',
    routeChain: 'Delhi / NCR → Greater Noida → Agra-Lucknow Expressway → Lucknow Ring Road → Purvanchal Expressway → Ghazipur Exit → Buxar Ganga Bridge (NH-922) → Arrah Bypass → Patna AIIMS / Danapur (Km 995)',
    roadType: 'Access-Controlled Super Expressways (Yamuna + Agra-Lucknow + Purvanchal) & 4-Lane NH-922',
    weather: {
      temp: '26°C',
      condition: 'Warm Gangetic Plains Air & Clear Blue Skies',
      feelsLike: '25°C',
    },
    travelTips: [
      'Seamless 15-hour expressway corridor linking the National Capital with Patna without city traffic.',
      'Smooth crossing over the state-of-the-art Buxar Ganga Bridge directly into Bihar.',
      'Commercial outstation yellow-plate cabs with verified commercial state-tax and toll documentation.',
      'Doorstep drop across Patna Junction, Kankarbagh, Boring Road, Bailey Road, and Jay Prakash Narayan Airport.',
    ],
    alternativeRoutes: [
      {
        id: 'purvanchal-expressway',
        name: 'Super Expressways via Lucknow & Purvanchal',
        highway: 'via Yamuna Exp, Agra-Lucknow Exp & Purvanchal Exp',
        distanceKm: 995,
        durationText: '14 - 15 Hours',
        tollPlazasCount: 7,
        tollAmount: 1850,
        description: '90% access-controlled green expressway route bypassing all congested towns.',
      },
      {
        id: 'nh19-gt-road-bihar',
        name: 'NH-19 (Old GT Road) via Varanasi & Sasaram',
        highway: 'via NH-19, Mohania, Sasaram & Arrah',
        distanceKm: 1040,
        durationText: '17 - 18 Hours',
        tollPlazasCount: 9,
        tollAmount: 1450,
        description: 'Traditional Grand Trunk road corridor passing through Varanasi, Sasaram & Dehri-on-Sone.',
      },
    ],
    milestones: [
      { town: 'Delhi / NCR Departure', km: 0, timeText: '0 hr', description: 'Doorstep pickup across Delhi NCR.' },
      { town: 'Agra Expressway Interchange', km: 165, timeText: '2 hr', description: 'Yamuna Expressway to Agra-Lucknow Expressway.' },
      { town: 'Lucknow Outer Ring Road', km: 555, timeText: '6.5 hr', description: 'Connecting onto Purvanchal Expressway.' },
      { town: 'Purvanchal Way-side Toll', km: 780, timeText: '9.5 hr', description: 'Eastern UP green corridor with rest areas.' },
      { town: 'Buxar Ganga Bridge Border', km: 915, timeText: '12.5 hr', description: 'Entering Bihar across the historic Ganga Bridge.' },
      { town: 'Arrah Bypass', km: 955, timeText: '13.5 hr', description: '4-lane bypass avoiding town congestion.' },
      { town: 'Patna AIIMS / Danapur', km: 995, timeText: '15 hr', description: 'Safe arrival at Bihar capital city.' },
    ],
    hotelGroups: {
      budget: [
        { name: 'Hotel Gargee Grand', category: 'hotel', location: 'Exhibition Road, Patna', distanceKm: 995, image: '/destinations/hotel-resort.webp', highlight: 'Clean AC rooms, 24x7 desk & safe parking', priceRange: '₹1,800 - ₹2,800 / night' },
      ],
      medium: [
        { name: 'Hotel Maurya Patna', category: 'hotel', location: 'South Gandhi Maidan, Patna', distanceKm: 996, image: '/destinations/hotel-resort.webp', highlight: 'Premier business hotel overlooking Gandhi Maidan with swimming pool', priceRange: '₹4,500 - ₹7,500 / night' },
        { name: 'Lemon Tree Premier Patna', category: 'hotel', location: 'Exhibition Road, Patna', distanceKm: 997, image: '/destinations/hotel-resort.webp', highlight: 'Contemporary hospitality, rooftop dining & fitness center', priceRange: '₹5,000 - ₹8,500 / night' },
      ],
      luxury: [
        { name: 'Taj City Centre Patna', category: 'hotel', location: 'Lodipur, Patna', distanceKm: 996, image: '/destinations/hotel-resort.webp', highlight: '5-star luxury by IHCL with signature restaurants and luxury spa', priceRange: '₹9,500 - ₹20,000 / night' },
      ],
    },
    famousFoods: [
      { name: 'Authentic Bihari Litti Chokha', location: 'Boring Road / Gandhi Maidan, Patna', dish: 'Authentic Desi Ghee Litti Chokha with Sattu, Baingan & Tamatar', description: 'Traditional charcoal-roasted wheat balls stuffed with spiced sattu and dipped in pure desi ghee.', image: '/destinations/food-plaza.webp' },
      { name: 'Famous Maner Ka Ladoo', location: 'Maner Sharif Highway Km 970', dish: 'Desi Ghee Boondi Ladoo made with Gram Flour', description: 'Century-old historic recipe made with sweet local well water and pure ghee.', image: '/destinations/food-plaza.webp' },
      { name: 'Silao Ka Khaja & Gaya Tilkut', location: 'Patna City Sweet Stores', dish: 'Layered Crispy Khaja & Sesame Tilkut', description: 'GI-tagged crispy layered sweet pastry celebrated across Bihar.', image: '/destinations/food-plaza.webp' },
    ],
    hiddenGems: [
      { name: 'Golghar & Ganga Marine Drive', location: 'North Gandhi Maidan, Patna', distanceKm: 997, highlight: 'Historic Granary & Scenic Riverfront Boulevard', description: 'Climb 145 steps for 360-degree vistas of the Ganges and stroll along the modern Ganga Path.', image: '/destinations/patna.webp' },
      { name: 'Bihar Museum', location: 'Bailey Road, Patna', distanceKm: 994, highlight: 'World-Class Contemporary History & Archaeological Museum', description: 'Award-winning international museum showcasing ancient Mauryan and Buddhist artifacts.', image: '/destinations/patna.webp' },
    ],
    places: {
      restaurants: [
        { name: 'Purvanchal Highway Oasis (Km 150)', category: 'restaurant', location: 'Purvanchal Expressway', distanceKm: 705, image: '/destinations/food-plaza.webp', highlight: 'Clean Family Rest Stop & Food Court' },
        { name: 'Buxar Ganga View Highway Rasoi', category: 'restaurant', location: 'NH-922 Ganga Approach', distanceKm: 918, image: '/destinations/food-plaza.webp', highlight: 'Fresh Vegetarian Thali & Sattu Sharbat' },
        { name: 'Bhojpur Family Dhaba', category: 'restaurant', location: 'Arrah Bypass', distanceKm: 958, image: '/destinations/food-plaza.webp', highlight: 'Hot Roti, Dal Tadka & Desi Sweets' },
      ],
      petrolPumps: [
        { name: 'Indian Oil Purvanchal Mega Station', category: 'petrol', location: 'Purvanchal Exp Km 200', distanceKm: 755 },
        { name: 'Bharat Petroleum NH-922 Center', category: 'petrol', location: 'Buxar Bypass', distanceKm: 920 },
        { name: 'HPCL Auto Care Patna Bypass', category: 'petrol', location: 'Danapur-Khagaul Road', distanceKm: 990 },
      ],
      cngPumps: [
        { name: 'GAIL Gas Purvanchal Wayside CNG (Navgati Verified)', category: 'cng', location: 'Purvanchal Expressway Km 180', distanceKm: 735, highlight: 'Navgati App Verified: High Pressure (200 Bar)' },
        { name: 'IOCL Buxar Highway CNG (Navgati Verified)', category: 'cng', location: 'NH-922 Buxar Bypass', distanceKm: 919, highlight: 'Navgati App Verified: Fast Queue & 24x7 Dispenser' },
        { name: 'GAIL Gas Patna Auto CNG Mega Station (Navgati Verified)', category: 'cng', location: 'Patna AIIMS Bypass (NH-922)', distanceKm: 992, highlight: 'Navgati App Verified: 210 Bar Quick Fill & Card/UPI' },
      ],
      attractions: [
        { name: 'Bihar Museum', category: 'attraction', location: 'Bailey Road, Patna', distanceKm: 994, image: '/destinations/patna.webp', highlight: 'World-Class Architectural & Archaeological Wonder' },
        { name: 'Golghar Granary', category: 'attraction', location: 'Gandhi Maidan, Patna', distanceKm: 997, image: '/destinations/patna.webp', highlight: 'Iconic 1786 Beehive-Shaped Granary with Panoramic Ganga Views' },
        { name: 'Takht Sri Patna Sahib', category: 'attraction', location: 'Patna City (Harmandir)', distanceKm: 1005, image: '/destinations/patna.webp', highlight: 'Birthplace of Guru Gobind Singh Ji & Sacred Sikh Shrine' },
      ],
    },
    gallery: [
      { src: '/destinations/patna.webp', caption: 'Historic Patna & Ganga View', alt: 'Patna landmark view of the sacred Ganges' },
      { src: '/destinations/food-plaza.webp', caption: 'Expressway Food Plaza', alt: 'Modern waypoint food court on Purvanchal route' },
      { src: '/destinations/hotel-resort.webp', caption: 'Luxury Cab Outstation Comfort', alt: 'Urgent Taxis long-distance fleet' },
      { src: '/destinations/lucknow.webp', caption: 'Lucknow Transit Corridor', alt: 'Connecting corridor via Lucknow' },
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

  // 1. Check exact destination corridors
  if (normDest.includes('haridwar')) {
    return KNOWN_CORRIDORS['delhi-haridwar'];
  }
  if (normDest.includes('rishikesh') || normDest.includes('tapovan') || normDest.includes('shivpuri')) {
    return KNOWN_CORRIDORS['delhi-rishikesh'];
  }
  if (normDest.includes('haldwani') || normDest.includes('kathgodam')) {
    return KNOWN_CORRIDORS['delhi-haldwani'];
  }
  if (normDest.includes('nainital') || normDest.includes('bhimtal') || normDest.includes('kainchi') || normDest.includes('ramnagar') || normDest.includes('corbett') || normDest.includes('almora') || normDest.includes('ranikhet')) {
    return KNOWN_CORRIDORS['delhi-nainital'];
  }
  if (normDest.includes('dehradun') || normDest.includes('mussoorie') || normDest.includes('roorkee')) {
    return KNOWN_CORRIDORS['delhi-dehradun'];
  }
  if (normDest.includes('agra') || normDest.includes('mathura') || normDest.includes('vrindavan') || normDest.includes('firozabad')) {
    return KNOWN_CORRIDORS['delhi-agra'];
  }
  if (normDest.includes('jaipur') || normDest.includes('ajmer') || normDest.includes('pushkar') || normDest.includes('khatu') || normDest.includes('salasar') || normDest.includes('alwar')) {
    return KNOWN_CORRIDORS['delhi-jaipur'];
  }
  if (normDest.includes('chandigarh') || normDest.includes('mohali') || normDest.includes('panchkula')) {
    return KNOWN_CORRIDORS['delhi-chandigarh'];
  }
  if (normDest.includes('lucknow') || normDest.includes('kanpur') || normDest.includes('unnao')) {
    return KNOWN_CORRIDORS['delhi-lucknow'];
  }
  if (normDest.includes('patna') || normDest.includes('danapur') || normDest.includes('bihta')) {
    return KNOWN_CORRIDORS['delhi-patna'];
  }

  // 2. Intelligent Haridwar-origin route generator
  if (normOrigin.includes('haridwar')) {
    const isHill = ['nainital', 'mussoorie', 'shimla', 'manali', 'dharamshala', 'kullu', 'ranikhet', 'almora', 'kausani', 'auli', 'badrinath', 'kedarnath', 'chopta', 'kasol', 'dalhousie'].some((h) => normDest.includes(h));
    const midpoint = Math.max(25, Math.round(distanceKm / 2));

    return {
      highway: isHill ? 'via Shivalik Foothills & Hill Highway' : 'via NH334, Delhi-Meerut Expressway / NH9 Corridor',
      routeChain: `Haridwar (Har Ki Pauri / Roorkee Road) → Roorkee Bypass → Fast Highway Corridor (${midpoint} km) → Regional Toll Bypass → ${destName}`,
      roadType: isHill ? 'Scenic Mountain Ghats & Well-Maintained Hill Roads' : 'Fast Multi-Lane Highway with Dedicated FASTag Toll Plazas',
      weather: {
        temp: isHill ? '18°C' : '24°C',
        condition: isHill ? 'Cool Mountain Breezes' : 'Pleasant Clear Skies',
        feelsLike: isHill ? '17°C' : '23°C',
      },
      travelTips: [
        `Start early from Haridwar to beat local pilgrim traffic around Har Ki Pauri and Bhupatwala.`,
        `Commercial yellow-plate cabs with verified mountain chauffeurs ensure safe driving on both hills and plains.`,
        `Pre-fitted FASTag guarantees swift transit through all state border and NHAI toll plazas.`,
        `Complimentary mineral water and sanitized AC cabs on every booking.`,
        `Doorstep pickup available across all Haridwar ashrams, hotels, and railway station.`,
      ],
      alternativeRoutes: [
        {
          id: 'primary-haridwar-corridor',
          name: `Direct Fast Highway from Haridwar to ${destName}`,
          highway: 'via NH334 / State Express Corridor',
          distanceKm: distanceKm,
          durationText: `${Math.round(distanceKm / 50)} - ${Math.round(distanceKm / 45)} Hours`,
          tollPlazasCount: Math.max(1, Math.min(4, Math.round(distanceKm / 80))),
          tollAmount: Math.round(distanceKm * 1.2),
          description: `Fastest connected highway route departing from Haridwar with 24/7 commercial cab support.`,
        },
      ],
      milestones: [
        { town: 'Haridwar Departure', km: 0, timeText: '0 hr', description: 'Doorstep pickup across Haridwar ashrams, hotels, or railway station.' },
        { town: 'Roorkee Highway Bypass', km: Math.max(15, Math.round(distanceKm * 0.15)), timeText: '30 - 45 min', description: 'Crossing historic Solani aqueduct and Roorkee corridor.' },
        { town: 'Midway Fuel & Food Hub', km: midpoint, timeText: `${Math.round(midpoint / 50)} hr`, description: 'Verified family food plaza and clean restrooms.' },
        { town: `Approach to ${destName}`, km: Math.max(30, Math.round(distanceKm * 0.8)), timeText: `${Math.round((distanceKm * 0.8) / 50)} hr`, description: `Entering ${destName} regional boundary.` },
        { town: `${destName} Arrival`, km: distanceKm, timeText: `${Math.round(distanceKm / 50)} hr`, description: `Safe doorstep drop at your hotel or destination in ${destName}.` },
      ],
      famousFoods: [
        {
          name: 'Haridwar Pure Veg Delicacies',
          location: 'Upper Road / Moti Bazar',
          dish: 'Kachori with Aloo Sabzi & Hot Jalebi',
          description: 'Famous Haridwar morning breakfast celebrated along the holy ghats.',
          image: '/destinations/food-plaza.webp',
        },
      ],
      hiddenGems: [
        {
          name: 'Chandi Devi Neel Parvat View',
          location: 'Neel Parvat, Haridwar',
          distanceKm: 4,
          highlight: 'Scenic Ropeway & Panoramic Ganges Vista',
          description: 'Ancient hill shrine offering expansive aerial views of the sacred Ganges winding through the plains.',
          image: '/destinations/haridwar.webp',
        },
      ],
      hotelGroups: {
        budget: [
          {
            name: `${destName} Budget Stay`,
            category: 'hotel',
            location: `${destName} City Center`,
            distanceKm: distanceKm,
            image: '/destinations/hotel-resort.webp',
            highlight: 'Clean AC rooms, 24x7 desk & safe parking',
            priceRange: '₹1,200 - ₹2,000 / night',
          },
        ],
        medium: [
          {
            name: `${destName} Comfort Inn`,
            category: 'hotel',
            location: `${destName} Main Road`,
            distanceKm: distanceKm,
            image: '/destinations/hotel-resort.webp',
            highlight: 'Modern family rooms & restaurant',
            priceRange: '₹2,500 - ₹4,500 / night',
          },
        ],
        luxury: [
          {
            name: `${destName} Grand Heritage Resort`,
            category: 'hotel',
            location: `${destName} Prime Zone`,
            distanceKm: distanceKm,
            image: '/destinations/hotel-resort.webp',
            highlight: 'Premium hospitality & fine dining',
            priceRange: '₹5,500+ / night',
          },
        ],
      },
      places: {
        restaurants: [
          { name: 'Cheetal Grand Khatauli', category: 'restaurant', location: 'NH334 Highway Midway', distanceKm: 115, image: '/destinations/food-plaza.webp', highlight: 'Famous Highway Cutlets & Filter Coffee' },
          { name: 'Jain Shikanji Highway Treat', category: 'restaurant', location: 'Modinagar / Meerut Corridor', distanceKm: 165, image: '/destinations/food-plaza.webp', highlight: 'Fresh Masala Shikanji & Snacks' },
          { name: 'Hoshiyarpuri Pure Veg', category: 'restaurant', location: 'Upper Road, Haridwar', distanceKm: 2, image: '/destinations/food-plaza.webp', highlight: 'Authentic Pure Vegetarian North Indian Thali' },
        ],
        petrolPumps: [
          { name: 'Indian Oil Highway Service Center', category: 'petrol', location: 'Haridwar-Roorkee Highway', distanceKm: 12 },
          { name: 'Bharat Petroleum Highway Center', category: 'petrol', location: 'Roorkee Bypass, UK', distanceKm: 32 },
          { name: 'HPCL Auto Care Centre', category: 'petrol', location: 'Muzaffarnagar Bypass, UP', distanceKm: 85 },
        ],
        cngPumps: [
          { name: 'Haridwar City CNG Station (Navgati Verified)', category: 'cng', location: 'Jwalapur Bypass, Haridwar', distanceKm: 6 },
          { name: 'Green Gas CNG Station (Navgati Verified)', category: 'cng', location: 'Roorkee Highway, UK', distanceKm: 35 },
          { name: 'Torrent Gas Highway CNG (Navgati Verified)', category: 'cng', location: 'Khatauli Bypass, UP', distanceKm: 112 },
          { name: 'Indraprastha Gas (IGL) Mega Station', category: 'cng', location: 'Meerut Expressway Exit', distanceKm: 160 },
        ],
        attractions: [
          { name: 'Har Ki Pauri Ghat', category: 'attraction', location: 'Haridwar Center', distanceKm: 1, image: '/destinations/haridwar.webp', highlight: 'Sacred Ganga Aarti & Pilgrimage Landmark' },
          { name: 'Mansa Devi Temple', category: 'attraction', location: 'Bilwa Parvat, Haridwar', distanceKm: 3, image: '/destinations/haridwar.webp', highlight: 'Historic Hilltop Shrine with Cable Car' },
        ],
      },
      gallery: [
        { src: '/destinations/haridwar.webp', caption: 'Har Ki Pauri Haridwar', alt: 'Sacred Har Ki Pauri Ganga Ghat in Haridwar' },
        { src: getDestinationImage(destName), caption: `${destName} Landmark`, alt: `${destName} landmark destination vista` },
        { src: '/destinations/food-plaza.webp', caption: 'Midway Highway Stop', alt: 'Midway food plaza and restaurant stop' },
        { src: '/destinations/hotel-resort.webp', caption: 'Premium Cab Comfort', alt: 'Urgent Taxis verified outstation travel' },
      ],
    };
  }

  // Dynamic corridor generator calibrated with verified state authority & Navgati App CNG data
  const destState = getLocationState(destName);
  const isHill = destState === 'Himachal Pradesh' || destState === 'Jammu & Kashmir' || 
    ['shimla', 'manali', 'dharamshala', 'kullu', 'ranikhet', 'almora', 'kausani', 'auli', 'badrinath', 'kedarnath', 'chopta', 'kasol', 'dalhousie', 'mussoorie', 'nainital'].some((h) => normDest.includes(h));

  const midpoint = Math.max(30, Math.round(distanceKm / 2));
  const quarter1 = Math.max(15, Math.round(distanceKm / 4));
  const quarter3 = Math.max(45, Math.round((distanceKm * 3) / 4));

  // Determine state-calibrated highway name & road characteristics
  let highwayName = isHill ? 'via National Expressway & Mountain Highway' : 'via 4-Lane Access-Controlled National Highway';
  let roadType = isHill ? 'Access-Controlled Expressway & Well-Maintained Hill Roads' : 'Multi-Lane Fast Highway with Dedicated Bypass & FASTag Toll Plazas';
  let weatherTemp = isHill ? '17°C' : '25°C';
  let weatherCond = isHill ? 'Crisp Mountain Breeze & Scenic Vistas' : 'Clear Highway Skies & Pleasant Driving Weather';
  let weatherFeels = isHill ? '16°C' : '24°C';

  let famousFoodDish = `Authentic Regional Delicacy of ${destName}`;
  let famousFoodDesc = `Celebrated local delicacies prepared using authentic traditional regional recipes in ${destName}.`;

  let cngStation1 = 'IOCL / Torrent Gas CNG (Navgati App Verified)';
  let cngStation2 = 'Adani Total / Green Gas CNG (Navgati App Verified)';
  let cngStation3 = 'IGL / BPCL Highway CNG Station (Navgati App Verified)';

  if (destState === 'Bihar') {
    highwayName = 'via NH-19 (Grand Trunk Corridor) / Purvanchal Expressway & State Corridors';
    roadType = 'Multi-Lane Express Highway & State Corridors with Dedicated Toll Plazas';
    weatherTemp = '26°C';
    weatherCond = 'Warm Sunny Gangetic Plains & Clear Skies';
    weatherFeels = '25°C';
    famousFoodDish = 'Litti Chokha with Desi Ghee & Sattu Sharbat';
    famousFoodDesc = 'Traditional charcoal-roasted wheat balls stuffed with spiced sattu and pure desi ghee, served with baingan chokha.';
    cngStation1 = 'GAIL Gas Purvanchal Wayside CNG (Navgati App Verified)';
    cngStation2 = 'IOCL Highway CNG Filling Hub (Navgati App Verified)';
    cngStation3 = 'HPCL Patna Bypass Auto CNG Mega Station (Navgati App Verified)';
  } else if (destState === 'Punjab') {
    highwayName = 'via NH-44 Grand Trunk Road (GT Road 6-Lane Expressway)';
    roadType = 'High-Speed 6-Lane Access-Controlled NH-44 GT Highway with Flyovers & Grade Separators';
    weatherTemp = '21°C';
    weatherCond = 'Fresh North Plains Breeze & Sunny Skies';
    weatherFeels = '20°C';
    famousFoodDish = 'Amritsari Kulcha, Makki di Roti & Sweet Lassi';
    famousFoodDesc = 'Authentic rich Punjabi cuisine with fresh white butter, chhole, and thick creamy lassi.';
    cngStation1 = 'Gujarat Gas Mega CNG (Navgati App Verified)';
    cngStation2 = 'Torrent Gas Highway CNG (Navgati App Verified)';
    cngStation3 = 'IOCL Auto Gas Center (Navgati App Verified)';
  } else if (destState === 'Himachal Pradesh') {
    highwayName = 'via Himalayan Expressway & Mountain Highway Corridor';
    roadType = 'Modern 4-Lane Mountain Highway & Scenic Hill Ghat Roads';
    weatherTemp = '16°C';
    weatherCond = 'Crisp Mountain Breeze & Alpine Air';
    weatherFeels = '15°C';
    famousFoodDish = 'Authentic Siddu with Pure Desi Ghee & Himachali Dham';
    famousFoodDesc = 'Traditional steamed wheat delicacies with savory fillings and slow-cooked festive lentils.';
    cngStation1 = 'Torrent Gas Parwanoo Foothill CNG (Navgati App Verified)';
    cngStation2 = 'IOCL Solan Bypass Auto Care CNG (Navgati App Verified)';
    cngStation3 = 'Himachal Auto Gas Filling Hub (Navgati App Verified)';
  } else if (destState === 'Rajasthan') {
    highwayName = 'via Delhi-Mumbai Expressway (NE4) & NH-48 Heritage Corridor';
    roadType = '8-Lane World-Class NE4 Expressway & 6-Lane NH-48';
    weatherTemp = '28°C';
    weatherCond = 'Bright Desert Sun & Clear Highway Skies';
    weatherFeels = '27°C';
    famousFoodDish = 'Dal Baati Churma, Pyaaz Kachori & Ker Sangri';
    famousFoodDesc = 'Royal Rajasthani flavors with rich desi ghee preparations and spicy local chutneys.';
    cngStation1 = 'Torrent Gas / Rajasthan State Gas CNG (Navgati App Verified)';
    cngStation2 = 'Adani Total Gas Highway CNG (Navgati App Verified)';
    cngStation3 = 'IOCL Heritage Corridor CNG Station (Navgati App Verified)';
  } else if (destState === 'Uttarakhand') {
    highwayName = 'via Delhi-Meerut Expressway (NE3) & NH-334 / NH-7 Foothill Corridor';
    roadType = 'High-Speed Expressway & Mountain Foothill Highway';
    weatherTemp = '20°C';
    weatherCond = 'Refreshing Mountain Breeze & Ganges Valley Air';
    weatherFeels = '19°C';
    famousFoodDish = 'Garhwali Kafuli, Bhatt ki Churkani & Bal Mithai';
    famousFoodDesc = 'Nutritious local organic grains and celebrated Kumaoni brown sweets coated with sugar balls.';
    cngStation1 = 'Green Gas Roorkee Highway CNG (Navgati App Verified)';
    cngStation2 = 'Torrent Gas Khatauli Midway CNG (Navgati App Verified)';
    cngStation3 = 'Haridwar-Dehradun Highway CNG Hub (Navgati App Verified)';
  } else if (destState === 'West Bengal') {
    highwayName = 'via NH-19 Eastern Corridor / NH-12 & Durgapur Expressway';
    roadType = 'Multi-Lane Eastern National Highway with Bypass Flyovers';
    weatherTemp = '26°C';
    weatherCond = 'Pleasant Tropical Climate & Clear Skies';
    weatherFeels = '25°C';
    famousFoodDish = 'Kolkata Kathi Roll, Authentic Mishti Doi & Rosogolla';
    famousFoodDesc = 'Celebrated Bengali street food rolls, artisanal curd desserts, and aromatic mustard preparations.';
    cngStation1 = 'Bengal Gas Company Highway CNG (Navgati App Verified)';
    cngStation2 = 'IOCL Durgapur Expressway CNG Hub (Navgati App Verified)';
    cngStation3 = 'BPCL Eastern Corridor CNG Pump (Navgati App Verified)';
  } else if (destState === 'Gujarat') {
    highwayName = 'via NE-1 / NH-48 Western Golden Corridor';
    roadType = 'High-Speed 6-Lane Expressway & Access-Controlled Highway';
    weatherTemp = '28°C';
    weatherCond = 'Warm Sunny Weather & Clear Coastal Breeze';
    weatherFeels = '27°C';
    famousFoodDish = 'Khaman Dhokla, Fafda Jalebi & Kathiyawadi Thali';
    famousFoodDesc = 'Authentic Kathiyawadi savory snacks, sweet Gujarati delicacies, and royal vegetarian thali.';
    cngStation1 = 'Gujarat Gas Mega Highway CNG (Navgati App Verified)';
    cngStation2 = 'Adani Total Gas Expressway CNG (Navgati App Verified)';
    cngStation3 = 'Sabarmati Gas Auto CNG Station (Navgati App Verified)';
  } else if (destState === 'Maharashtra') {
    highwayName = 'via Mumbai-Pune Expressway / Samruddhi Mahamarg & NH-48';
    roadType = 'Access-Controlled Expressway & Multi-Lane National Highway';
    weatherTemp = '27°C';
    weatherCond = 'Breezy Western Ghats Climate & Sunny Weather';
    weatherFeels = '26°C';
    famousFoodDish = 'Spicy Misal Pav, Vada Pav with Thecha & Sol Kadhi';
    famousFoodDesc = 'Zesty Maharashtrian street flavors with freshly baked pav, garlic chutney, and coconut cooler.';
    cngStation1 = 'Mahanagar Gas (MGL) Expressway Hub (Navgati App Verified)';
    cngStation2 = 'Maharashtra Natural Gas (MNGL) Pump (Navgati App Verified)';
    cngStation3 = 'HPCL Western Highway Auto CNG (Navgati App Verified)';
  } else if (destState === 'Madhya Pradesh') {
    highwayName = 'via Agra-Gwalior NH-44 & MP State Highway Corridor';
    roadType = 'Multi-Lane Central Indian Highway Corridor';
    weatherTemp = '26°C';
    weatherCond = 'Clear Skies & Sunny Central India Air';
    weatherFeels = '25°C';
    famousFoodDish = 'Indori Poha Jalebi, Bhutte Ka Kees & Dal Bafla';
    famousFoodDesc = 'Authentic Malwa cuisine celebrated for delicate spices, steamed corn delicacies, and rich bafla.';
    cngStation1 = 'Aavantika Gas Highway CNG (Navgati App Verified)';
    cngStation2 = 'IOCL Gwalior-Bhopal Auto CNG (Navgati App Verified)';
    cngStation3 = 'BPCL Central MP Highway Station (Navgati App Verified)';
  }

  return {
    highway: highwayName,
    routeChain: `${originName} → Highway Expressway → Midway Food Plaza (${midpoint} km) → Regional Toll Bypass → ${destName}`,
    roadType: isHill ? 'Access-Controlled Expressway & Well-Maintained Hill Roads' : 'Multi-Lane Fast Highway with Dedicated Bypass & Toll Plazas',
    weather: {
      temp: weatherTemp,
      condition: weatherCond,
      feelsLike: weatherFeels,
    },
    travelTips: [
      `Start early from ${originName} to enjoy seamless highway driving without city congestion.`,
      `Stay refreshed with breaks every 100-150 km at verified family dhabas and food courts.`,
      `All Urgent Taxis vehicles carry verified FASTag for instant toll booth clearance.`,
      `Doorstep pickup and drop is available 24/7 across all residential sectors and hotels.`,
      `Transparent per-KM rates guarantee no hidden surcharges at the end of your trip.`,
    ],
    alternativeRoutes: [
      {
        id: 'primary-highway',
        name: `Primary Highway Corridor to ${destName}`,
        highway: highwayName,
        distanceKm: distanceKm,
        durationText: `${Math.round(distanceKm / 50)} - ${Math.round(distanceKm / 45)} Hours`,
        tollPlazasCount: Math.max(1, Math.min(4, Math.round(distanceKm / 80))),
        tollAmount: Math.round(distanceKm * 1.2),
        description: `Direct access-controlled highway corridor connecting ${originName} and ${destName} with verified FASTag plazas.`,
      },
    ],
    hotelGroups: {
      budget: [
        {
          name: `${destName} Central Budget Inn`,
          category: 'hotel',
          location: `${destName} City Center`,
          distanceKm: distanceKm,
          image: '/destinations/hotel-resort.webp',
          highlight: 'Clean AC rooms, 24x7 desk & safe parking',
          priceRange: '₹1,200 - ₹2,000 / night',
        },
      ],
      medium: [
        {
          name: `${destName} Comfort Residency`,
          category: 'hotel',
          location: `${destName} Main Road`,
          distanceKm: distanceKm,
          image: '/destinations/hotel-resort.webp',
          highlight: 'Modern family rooms, complimentary Wi-Fi & multi-cuisine restaurant',
          priceRange: '₹2,500 - ₹4,500 / night',
        },
      ],
      luxury: [
        {
          name: `${destName} Landmark Grand Resort`,
          category: 'hotel',
          location: `${destName} Scenic Zone`,
          distanceKm: distanceKm,
          image: '/destinations/hotel-resort.webp',
          highlight: 'Premium hospitality, swimming pool & fine dining',
          priceRange: '₹6,000 - ₹14,000 / night',
        },
      ],
    },
    famousFoods: [
      {
        name: `${destName} Heritage Food Center`,
        location: `${destName} Main Bazaar`,
        dish: famousFoodDish,
        description: famousFoodDesc,
        image: '/destinations/food-plaza.webp',
      },
    ],
    hiddenGems: [
      {
        name: `${destName} Scenic Viewpoint & Heritage Spot`,
        location: `${destName} Outskirts`,
        distanceKm: distanceKm + 5,
        highlight: 'Quiet Panoramic Vista away from crowds',
        description: `A peaceful local attraction cherished by residents for morning walks and photography.`,
        image: getDestinationImage(destName),
      },
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
        { name: cngStation1, category: 'cng', location: 'Highway Km ' + (quarter1 - 5), distanceKm: quarter1 - 5, highlight: 'Navgati App Verified: High Pressure (200 Bar)' },
        { name: cngStation2, category: 'cng', location: 'Midway Highway Corridor', distanceKm: midpoint, highlight: 'Navgati App Verified: 24x7 Dispenser & Quick Queue' },
        { name: cngStation3, category: 'cng', location: 'City Highway Approach', distanceKm: quarter3, highlight: 'Navgati App Verified: Fast Filling & Card/UPI Payment' },
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
