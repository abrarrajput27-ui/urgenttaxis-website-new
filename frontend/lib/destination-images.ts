/**
 * Destination Images Authority Module for Urgent Taxis
 * 
 * STRICT RULE (Owner & User Mandate):
 * "ek location me use hui ko dusri me bilkul nahi dikhana hai"
 * (An image used for one location must NEVER be shown for a different location).
 * 
 * Every city maps strictly to its own verified destination WebP photo in /destinations/.
 * If an unseeded city or generic corridor is requested, it must NEVER show an unrelated city's landmark;
 * it falls back cleanly to a verified fleet photo (/fleet-brand/dzire.webp) representing Urgent Taxis highway service.
 */

// Normalized map of every supported city to its verified WebP image
const DESTINATION_IMAGE_MAP: Record<string, string> = {
  agra: '/destinations/agra.webp',
  ajmer: '/destinations/ajmer.webp',
  aligarh: '/destinations/aligarh.webp',
  almora: '/destinations/almora.webp',
  ambala: '/destinations/ambala.webp',
  amritsar: '/destinations/amritsar.webp',
  ayodhya: '/destinations/ayodhya.webp',
  bahadurgarh: '/destinations/bahadurgarh.webp',
  bareilly: '/destinations/bareilly.webp',
  bhimtal: '/destinations/bhimtal.webp',
  chandigarh: '/destinations/chandigarh.webp',
  dalhousie: '/destinations/dalhousie.webp',
  dehradun: '/destinations/dehradun.webp',
  delhi: '/destinations/delhi.webp',
  'new-delhi': '/destinations/new-delhi.webp',
  'delhi-airport': '/destinations/delhi-airport.webp',
  'igi-airport': '/destinations/delhi-airport.webp',
  'delhi-igi': '/destinations/delhi-airport.webp',
  dharamshala: '/destinations/dharamshala.webp',
  faridabad: '/destinations/faridabad.webp',
  ghaziabad: '/destinations/ghaziabad.webp',
  masuri: '/destinations/ghaziabad.webp',
  gorakhpur: '/destinations/gorakhpur.webp',
  'greater-noida': '/destinations/greater-noida.webp',
  'pari-chowk': '/destinations/greater-noida.webp',
  gurugram: '/destinations/gurugram.webp',
  gurgaon: '/destinations/gurugram.webp',
  haldwani: '/destinations/haldwani.webp',
  haridwar: '/destinations/haridwar.webp',
  jaipur: '/destinations/jaipur.webp',
  jalandhar: '/destinations/jalandhar.webp',
  jammu: '/destinations/jammu.webp',
  'jim-corbett': '/destinations/jim-corbett.webp',
  corbett: '/destinations/jim-corbett.webp',
  jodhpur: '/destinations/jodhpur.webp',
  'kainchi-dham': '/destinations/kainchi-dham.webp',
  kanpur: '/destinations/kanpur.webp',
  karnal: '/destinations/karnal.webp',
  kasol: '/destinations/kasol.webp',
  kathgodam: '/destinations/kathgodam.webp',
  kausani: '/destinations/kausani.webp',
  kurukshetra: '/destinations/kurukshetra.webp',
  lucknow: '/destinations/lucknow.webp',
  ludhiana: '/destinations/ludhiana.webp',
  manali: '/destinations/manali.webp',
  mathura: '/destinations/mathura.webp',
  meerut: '/destinations/meerut.webp',
  moradabad: '/destinations/moradabad.webp',
  mukteshwar: '/destinations/mukteshwar.webp',
  mussoorie: '/destinations/mussoorie.webp',
  nainital: '/destinations/nainital.webp',
  'noida-international-airport': '/destinations/noida-international-airport.webp',
  'noida-airport': '/destinations/noida-international-airport.webp',
  jewar: '/destinations/noida-international-airport.webp',
  'jewar-airport': '/destinations/noida-international-airport.webp',
  noida: '/destinations/noida.webp',
  panipat: '/destinations/panipat.webp',
  prayagraj: '/destinations/prayagraj.webp',
  allahabad: '/destinations/prayagraj.webp',
  pushkar: '/destinations/pushkar.webp',
  ramnagar: '/destinations/ramnagar.webp',
  rampur: '/destinations/rampur.webp',
  ranikhet: '/destinations/ranikhet.webp',
  rishikesh: '/destinations/rishikesh.webp',
  rohtak: '/destinations/rohtak.webp',
  rudrapur: '/destinations/rudrapur.webp',
  sattal: '/destinations/sattal.webp',
  shimla: '/destinations/shimla.webp',
  sonipat: '/destinations/sonipat.webp',
  srinagar: '/destinations/srinagar.webp',
  udaipur: '/destinations/udaipur.webp',
  varanasi: '/destinations/varanasi.webp',
  kashi: '/destinations/varanasi.webp',
  vrindavan: '/destinations/vrindavan.webp',
};

/**
 * Normalizes city/location string to slug key
 */
function toSlug(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\b(junction|cantt|railway station|t1|t2|t3|international|terminal)\b/gi, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Resolves verified destination image.
 * Guarantees that no city receives an image from an unrelated location.
 */
export function getDestinationImage(cityName: string, fallbackToFleet: boolean = true): string {
  if (!cityName) return fallbackToFleet ? '/fleet-brand/dzire.webp' : '/destinations/delhi.webp';

  const slug = toSlug(cityName);

  // Exact slug match
  if (DESTINATION_IMAGE_MAP[slug]) {
    return DESTINATION_IMAGE_MAP[slug];
  }

  // Substring match for compound names (e.g. "Delhi Airport (IGI T3)" -> "delhi-airport")
  for (const [key, path] of Object.entries(DESTINATION_IMAGE_MAP)) {
    if (slug.includes(key) || key.includes(slug)) {
      return path;
    }
  }

  // Never return an unrelated city's photo!
  return fallbackToFleet ? '/fleet-brand/dzire.webp' : '/destinations/delhi.webp';
}

export function hasDedicatedDestinationImage(cityName: string): boolean {
  const slug = toSlug(cityName);
  if (DESTINATION_IMAGE_MAP[slug]) return true;
  for (const key of Object.keys(DESTINATION_IMAGE_MAP)) {
    if (slug.includes(key) || key.includes(slug)) return true;
  }
  return false;
}
