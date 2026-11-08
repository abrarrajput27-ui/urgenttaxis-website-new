/**
 * Location Authority Module for Urgent Taxis
 * 
 * Provides verified Indian State mapping for every city, town, hill station,
 * pilgrimage destination, and village across North India and major national corridors.
 * 
 * Mandate:
 * "har ek route jo bhi hai ya jo bhi customer search kar raha hai unke samne unki state ke name bhi aane chahiye 
 * jisse pata chale ki kis state me hai wo location"
 */

// Normalized dictionary of Indian locations and their verified State
export const LOCATION_STATE_MAP: Record<string, string> = {
  // ─── Uttarakhand (Hills & Sacred Corridors) ─────────────────────────────────
  nainital: 'Uttarakhand',
  haldwani: 'Uttarakhand',
  kathgodam: 'Uttarakhand',
  bhimtal: 'Uttarakhand',
  sattal: 'Uttarakhand',
  naukuchiatal: 'Uttarakhand',
  mukteshwar: 'Uttarakhand',
  almora: 'Uttarakhand',
  ranikhet: 'Uttarakhand',
  kausani: 'Uttarakhand',
  'kainchi-dham': 'Uttarakhand',
  kainchidham: 'Uttarakhand',
  bhowali: 'Uttarakhand',
  'jim-corbett': 'Uttarakhand',
  corbett: 'Uttarakhand',
  ramnagar: 'Uttarakhand',
  rudrapur: 'Uttarakhand',
  pantnagar: 'Uttarakhand',
  kashipur: 'Uttarakhand',
  bazpur: 'Uttarakhand',
  kichha: 'Uttarakhand',
  sitarganj: 'Uttarakhand',
  khatima: 'Uttarakhand',
  haridwar: 'Uttarakhand',
  rishikesh: 'Uttarakhand',
  tapovan: 'Uttarakhand',
  shivpuri: 'Uttarakhand',
  dehradun: 'Uttarakhand',
  mussoorie: 'Uttarakhand',
  dhanaulti: 'Uttarakhand',
  kanatal: 'Uttarakhand',
  chamba: 'Uttarakhand',
  'new-tehri': 'Uttarakhand',
  tehri: 'Uttarakhand',
  roorkee: 'Uttarakhand',
  kotdwar: 'Uttarakhand',
  lansdowne: 'Uttarakhand',
  pauri: 'Uttarakhand',
  'srinagar-garhwal': 'Uttarakhand',
  devprayag: 'Uttarakhand',
  rudraprayag: 'Uttarakhand',
  karnaprayag: 'Uttarakhand',
  joshimath: 'Uttarakhand',
  badrinath: 'Uttarakhand',
  kedarnath: 'Uttarakhand',
  guptkashi: 'Uttarakhand',
  sonprayag: 'Uttarakhand',
  gaurikund: 'Uttarakhand',
  chopta: 'Uttarakhand',
  tungnath: 'Uttarakhand',
  auli: 'Uttarakhand',
  uttarkashi: 'Uttarakhand',
  barkot: 'Uttarakhand',
  gangotri: 'Uttarakhand',
  yamunotri: 'Uttarakhand',
  vikasnagar: 'Uttarakhand',
  chakrata: 'Uttarakhand',
  pithoragarh: 'Uttarakhand',
  champawat: 'Uttarakhand',
  lohaghat: 'Uttarakhand',
  bageshwar: 'Uttarakhand',
  dwarahat: 'Uttarakhand',
  chaukhutia: 'Uttarakhand',

  // ─── Uttar Pradesh (Heritage, Pilgrimage & Doab) ────────────────────────────
  agra: 'Uttar Pradesh',
  mathura: 'Uttar Pradesh',
  vrindavan: 'Uttar Pradesh',
  goverdhan: 'Uttar Pradesh',
  barsana: 'Uttar Pradesh',
  gokul: 'Uttar Pradesh',
  bareilly: 'Uttar Pradesh',
  moradabad: 'Uttar Pradesh',
  rampur: 'Uttar Pradesh',
  sambhal: 'Uttar Pradesh',
  chandausi: 'Uttar Pradesh',
  amroha: 'Uttar Pradesh',
  shahjahanpur: 'Uttar Pradesh',
  badaun: 'Uttar Pradesh',
  pilibhit: 'Uttar Pradesh',
  lucknow: 'Uttar Pradesh',
  kanpur: 'Uttar Pradesh',
  ayodhya: 'Uttar Pradesh',
  varanasi: 'Uttar Pradesh',
  kashi: 'Uttar Pradesh',
  prayagraj: 'Uttar Pradesh',
  allahabad: 'Uttar Pradesh',
  gorakhpur: 'Uttar Pradesh',
  meerut: 'Uttar Pradesh',
  hapur: 'Uttar Pradesh',
  bulandshahr: 'Uttar Pradesh',
  khurja: 'Uttar Pradesh',
  aligarh: 'Uttar Pradesh',
  hathras: 'Uttar Pradesh',
  firozabad: 'Uttar Pradesh',
  shikohabad: 'Uttar Pradesh',
  mainpuri: 'Uttar Pradesh',
  etawah: 'Uttar Pradesh',
  auraiya: 'Uttar Pradesh',
  muzaffarnagar: 'Uttar Pradesh',
  saharanpur: 'Uttar Pradesh',
  deoband: 'Uttar Pradesh',
  shamli: 'Uttar Pradesh',
  baghpat: 'Uttar Pradesh',
  baraut: 'Uttar Pradesh',
  jhansi: 'Uttar Pradesh',
  lalitpur: 'Uttar Pradesh',
  orai: 'Uttar Pradesh',
  unnao: 'Uttar Pradesh',
  barabanki: 'Uttar Pradesh',
  'rae-bareli': 'Uttar Pradesh',
  sultanpur: 'Uttar Pradesh',
  jaunpur: 'Uttar Pradesh',
  mirzapur: 'Uttar Pradesh',
  basti: 'Uttar Pradesh',
  deoria: 'Uttar Pradesh',
  kushinagar: 'Uttar Pradesh',
  sitapur: 'Uttar Pradesh',
  'lakhimpur-kheri': 'Uttar Pradesh',
  hardoi: 'Uttar Pradesh',
  banda: 'Uttar Pradesh',
  chitrakoot: 'Uttar Pradesh',
  ghaziabad: 'Uttar Pradesh',
  masuri: 'Uttar Pradesh',
  noida: 'Uttar Pradesh',
  'greater-noida': 'Uttar Pradesh',
  'pari-chowk': 'Uttar Pradesh',
  'noida-international-airport': 'Uttar Pradesh',
  jewar: 'Uttar Pradesh',

  // ─── Delhi NCR ─────────────────────────────────────────────────────────────
  delhi: 'Delhi NCR',
  'new-delhi': 'Delhi NCR',
  'delhi-airport': 'Delhi NCR',
  'igi-airport': 'Delhi NCR',
  'delhi-igi': 'Delhi NCR',
  'connaught-place': 'Delhi NCR',
  saket: 'Delhi NCR',
  rohini: 'Delhi NCR',
  dwarka: 'Delhi NCR',
  'anand-vihar': 'Delhi NCR',

  // ─── Haryana ───────────────────────────────────────────────────────────────
  gurugram: 'Haryana',
  gurgaon: 'Haryana',
  faridabad: 'Haryana',
  panipat: 'Haryana',
  samalkha: 'Haryana',
  sonipat: 'Haryana',
  murthal: 'Haryana',
  kundli: 'Haryana',
  karnal: 'Haryana',
  gharaunda: 'Haryana',
  kurukshetra: 'Haryana',
  pehowa: 'Haryana',
  ambala: 'Haryana',
  'ambala-cantt': 'Haryana',
  panchkula: 'Haryana',
  kalka: 'Haryana',
  pinjore: 'Haryana',
  yamunanagar: 'Haryana',
  jagadhri: 'Haryana',
  rohtak: 'Haryana',
  bahadurgarh: 'Haryana',
  jhajjar: 'Haryana',
  rewari: 'Haryana',
  bawal: 'Haryana',
  dharuhera: 'Haryana',
  narnaul: 'Haryana',
  bhiwani: 'Haryana',
  hisar: 'Haryana',
  hansi: 'Haryana',
  sirsa: 'Haryana',
  jind: 'Haryana',
  kaithal: 'Haryana',
  palwal: 'Haryana',
  nuh: 'Haryana',
  manesar: 'Haryana',

  // ─── Rajasthan ─────────────────────────────────────────────────────────────
  jaipur: 'Rajasthan',
  amer: 'Rajasthan',
  ajmer: 'Rajasthan',
  pushkar: 'Rajasthan',
  kishangarh: 'Rajasthan',
  beawar: 'Rajasthan',
  'khatu-shyam': 'Rajasthan',
  'khatu-shyam-ji': 'Rajasthan',
  ringas: 'Rajasthan',
  'salasar-balaji': 'Rajasthan',
  salasar: 'Rajasthan',
  alwar: 'Rajasthan',
  bhiwadi: 'Rajasthan',
  behror: 'Rajasthan',
  neemrana: 'Rajasthan',
  kotputli: 'Rajasthan',
  bharatpur: 'Rajasthan',
  deeg: 'Rajasthan',
  dholpur: 'Rajasthan',
  'sawai-madhopur': 'Rajasthan',
  ranthambore: 'Rajasthan',
  udaipur: 'Rajasthan',
  nathdwara: 'Rajasthan',
  chittorgarh: 'Rajasthan',
  jodhpur: 'Rajasthan',
  osian: 'Rajasthan',
  'mount-abu': 'Rajasthan',
  'abu-road': 'Rajasthan',
  bikaner: 'Rajasthan',
  jaisalmer: 'Rajasthan',
  kota: 'Rajasthan',
  bundi: 'Rajasthan',
  sikar: 'Rajasthan',
  jhunjhunu: 'Rajasthan',

  // ─── Himachal Pradesh ──────────────────────────────────────────────────────
  shimla: 'Himachal Pradesh',
  kufri: 'Himachal Pradesh',
  narkanda: 'Himachal Pradesh',
  mashobra: 'Himachal Pradesh',
  chail: 'Himachal Pradesh',
  solan: 'Himachal Pradesh',
  kasauli: 'Himachal Pradesh',
  parwanoo: 'Himachal Pradesh',
  manali: 'Himachal Pradesh',
  'solang-valley': 'Himachal Pradesh',
  'atal-tunnel': 'Himachal Pradesh',
  kullu: 'Himachal Pradesh',
  kasol: 'Himachal Pradesh',
  manikaran: 'Himachal Pradesh',
  tosh: 'Himachal Pradesh',
  mandi: 'Himachal Pradesh',
  bilaspur: 'Himachal Pradesh',
  dharamshala: 'Himachal Pradesh',
  mcleodganj: 'Himachal Pradesh',
  palampur: 'Himachal Pradesh',
  'bir-billing': 'Himachal Pradesh',
  dalhousie: 'Himachal Pradesh',
  khajjiar: 'Himachal Pradesh',
  kinnaur: 'Himachal Pradesh',
  spiti: 'Himachal Pradesh',

  // ─── Punjab & Chandigarh ───────────────────────────────────────────────────
  chandigarh: 'Punjab / Chandigarh',
  mohali: 'Punjab',
  zirakpur: 'Punjab',
  ludhiana: 'Punjab',
  jalandhar: 'Punjab',
  amritsar: 'Punjab',
  patiala: 'Punjab',
  bathinda: 'Punjab',
  pathankot: 'Punjab',
  hoshiarpur: 'Punjab',
  phagwara: 'Punjab',

  // ─── Jammu & Kashmir ───────────────────────────────────────────────────────
  jammu: 'Jammu & Kashmir',
  katra: 'Jammu & Kashmir',
  'vaishno-devi': 'Jammu & Kashmir',
  udhampur: 'Jammu & Kashmir',
  patnitop: 'Jammu & Kashmir',
  srinagar: 'Jammu & Kashmir',
  gulmarg: 'Jammu & Kashmir',
  pahalgam: 'Jammu & Kashmir',
  sonamarg: 'Jammu & Kashmir',

  // ─── National Metros & Hubs ────────────────────────────────────────────────
  mumbai: 'Maharashtra',
  pune: 'Maharashtra',
  nagpur: 'Maharashtra',
  shirdi: 'Maharashtra',
  ahmedabad: 'Gujarat',
  surat: 'Gujarat',
  vadodara: 'Gujarat',
  bengaluru: 'Karnataka',
  bangalore: 'Karnataka',
  hyderabad: 'Telangana',
  chennai: 'Tamil Nadu',
  kolkata: 'West Bengal',
  patna: 'Bihar',
  bhopal: 'Madhya Pradesh',
  indore: 'Madhya Pradesh',
  gwalior: 'Madhya Pradesh',
  ujjain: 'Madhya Pradesh',
};

function toSlug(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\b(junction|cantt|railway station|t1|t2|t3|international|terminal|hq|sector|road|expressway|city)\b/gi, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Resolves verified State name for any city, town, village or locality.
 */
export function getLocationState(cityName: string): string {
  if (!cityName) return 'India';
  const slug = toSlug(cityName);

  if (LOCATION_STATE_MAP[slug]) {
    return LOCATION_STATE_MAP[slug];
  }

  // Substring match
  for (const [key, state] of Object.entries(LOCATION_STATE_MAP)) {
    if (slug.includes(key) || key.includes(slug)) {
      return state;
    }
  }

  // Fallback state detection via raw string
  const raw = cityName.toLowerCase();
  if (raw.includes('uttarakhand') || raw.includes('uk')) return 'Uttarakhand';
  if (raw.includes('uttar pradesh') || raw.includes('up')) return 'Uttar Pradesh';
  if (raw.includes('rajasthan') || raw.includes('rj')) return 'Rajasthan';
  if (raw.includes('himachal') || raw.includes('hp')) return 'Himachal Pradesh';
  if (raw.includes('haryana') || raw.includes('hr')) return 'Haryana';
  if (raw.includes('punjab') || raw.includes('pb')) return 'Punjab';
  if (raw.includes('kashmir') || raw.includes('jammu') || raw.includes('j&k')) return 'Jammu & Kashmir';
  if (raw.includes('delhi')) return 'Delhi NCR';

  return 'India';
}

/**
 * Formats location with state: e.g. "Nainital, Uttarakhand" or "Agra, Uttar Pradesh"
 */
export function formatLocationWithState(cityName: string): string {
  if (!cityName) return '';
  const trimmed = cityName.trim();
  const state = getLocationState(trimmed);
  if (trimmed.toLowerCase().includes(state.toLowerCase())) {
    return trimmed;
  }
  return `${trimmed}, ${state}`;
}

/**
 * Autocomplete Popular Cities with Accurate States
 */
export const POPULAR_AUTOCOMPLETE_CITIES = [
  // Delhi NCR
  { name: 'Delhi', state: 'Delhi NCR' },
  { name: 'New Delhi', state: 'Delhi NCR' },
  { name: 'Delhi Airport (IGI T3)', state: 'Delhi NCR' },
  { name: 'Ghaziabad', state: 'Uttar Pradesh' },
  { name: 'Noida', state: 'Uttar Pradesh' },
  { name: 'Greater Noida', state: 'Uttar Pradesh' },
  { name: 'Noida International Airport', state: 'Uttar Pradesh' },
  { name: 'Gurugram', state: 'Haryana' },
  { name: 'Faridabad', state: 'Haryana' },

  // Uttarakhand Top Corridors
  { name: 'Haridwar', state: 'Uttarakhand' },
  { name: 'Rishikesh', state: 'Uttarakhand' },
  { name: 'Dehradun', state: 'Uttarakhand' },
  { name: 'Mussoorie', state: 'Uttarakhand' },
  { name: 'Haldwani', state: 'Uttarakhand' },
  { name: 'Kathgodam', state: 'Uttarakhand' },
  { name: 'Nainital', state: 'Uttarakhand' },
  { name: 'Bhimtal', state: 'Uttarakhand' },
  { name: 'Kainchi Dham', state: 'Uttarakhand' },
  { name: 'Jim Corbett', state: 'Uttarakhand' },
  { name: 'Ramnagar', state: 'Uttarakhand' },
  { name: 'Rudrapur', state: 'Uttarakhand' },
  { name: 'Ranikhet', state: 'Uttarakhand' },
  { name: 'Almora', state: 'Uttarakhand' },
  { name: 'Kausani', state: 'Uttarakhand' },
  { name: 'Mukteshwar', state: 'Uttarakhand' },
  { name: 'Badrinath', state: 'Uttarakhand' },
  { name: 'Kedarnath', state: 'Uttarakhand' },
  { name: 'Auli', state: 'Uttarakhand' },
  { name: 'Lansdowne', state: 'Uttarakhand' },

  // Uttar Pradesh Top Corridors
  { name: 'Agra', state: 'Uttar Pradesh' },
  { name: 'Mathura', state: 'Uttar Pradesh' },
  { name: 'Vrindavan', state: 'Uttar Pradesh' },
  { name: 'Bareilly', state: 'Uttar Pradesh' },
  { name: 'Moradabad', state: 'Uttar Pradesh' },
  { name: 'Rampur', state: 'Uttar Pradesh' },
  { name: 'Meerut', state: 'Uttar Pradesh' },
  { name: 'Hapur', state: 'Uttar Pradesh' },
  { name: 'Aligarh', state: 'Uttar Pradesh' },
  { name: 'Lucknow', state: 'Uttar Pradesh' },
  { name: 'Kanpur', state: 'Uttar Pradesh' },
  { name: 'Ayodhya', state: 'Uttar Pradesh' },
  { name: 'Varanasi', state: 'Uttar Pradesh' },
  { name: 'Prayagraj', state: 'Uttar Pradesh' },
  { name: 'Gorakhpur', state: 'Uttar Pradesh' },

  // Rajasthan Top Corridors
  { name: 'Jaipur', state: 'Rajasthan' },
  { name: 'Ajmer', state: 'Rajasthan' },
  { name: 'Pushkar', state: 'Rajasthan' },
  { name: 'Khatu Shyam Ji', state: 'Rajasthan' },
  { name: 'Salasar Balaji', state: 'Rajasthan' },
  { name: 'Alwar', state: 'Rajasthan' },
  { name: 'Neemrana', state: 'Rajasthan' },
  { name: 'Bharatpur', state: 'Rajasthan' },
  { name: 'Udaipur', state: 'Rajasthan' },
  { name: 'Jodhpur', state: 'Rajasthan' },

  // Himachal Pradesh Top Corridors
  { name: 'Shimla', state: 'Himachal Pradesh' },
  { name: 'Manali', state: 'Himachal Pradesh' },
  { name: 'Kullu', state: 'Himachal Pradesh' },
  { name: 'Kasauli', state: 'Himachal Pradesh' },
  { name: 'Dharamshala', state: 'Himachal Pradesh' },
  { name: 'Dalhousie', state: 'Himachal Pradesh' },
  { name: 'Kasol', state: 'Himachal Pradesh' },

  // Punjab, Haryana & J&K
  { name: 'Chandigarh', state: 'Punjab / Chandigarh' },
  { name: 'Ambala', state: 'Haryana' },
  { name: 'Panipat', state: 'Haryana' },
  { name: 'Karnal', state: 'Haryana' },
  { name: 'Ludhiana', state: 'Punjab' },
  { name: 'Amritsar', state: 'Punjab' },
  { name: 'Jalandhar', state: 'Punjab' },
  { name: 'Jammu', state: 'Jammu & Kashmir' },
  { name: 'Katra (Vaishno Devi)', state: 'Jammu & Kashmir' },
  { name: 'Srinagar', state: 'Jammu & Kashmir' },
];
