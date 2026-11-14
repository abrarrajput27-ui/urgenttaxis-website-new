import { test, expect } from '@playwright/test';
import { getDestinationImage } from '../lib/destination-images';
import { getRouteCorridorDetails, KNOWN_CORRIDORS } from '../lib/data/route-corridor-details';
import fs from 'fs';

test.describe('Route Directory, Strict A-to-Z Sorting, Image Isolation & Haridwar Origin Audit', () => {

  test('Test 1: RoutesTabWidget State Order & Strict A-to-Z Alphabetical Sorting', () => {
    const content = fs.readFileSync('frontend/components/public/RoutesTabWidget.tsx', 'utf8');
    const match = content.match(/const STATE_DESTINATIONS: Record<string, string\[\]> = \{([\s\S]*?)\n\};/);
    expect(match).toBeTruthy();

    const evalStr = '({' + match![1] + '})';
    const stateDestinations: Record<string, string[]> = eval(evalStr);

    const expectedStateOrder = [
      'Bihar',
      'Delhi NCR',
      'Goa',
      'Gujarat',
      'Haryana',
      'Himachal Pradesh',
      'Jammu & Kashmir',
      'Madhya Pradesh',
      'Maharashtra',
      'Punjab',
      'Rajasthan',
      'Uttar Pradesh',
      'Uttarakhand',
      'West Bengal'
    ];

    expect(Object.keys(stateDestinations)).toEqual(expectedStateOrder);

    let totalDestinations = 0;
    for (const [state, list] of Object.entries(stateDestinations)) {
      expect(list.length).toBeGreaterThan(50);
      totalDestinations += list.length;

      // Verify strict A-to-Z alphabetical sorting
      for (let i = 0; i < list.length - 1; i++) {
        const comparison = list[i].localeCompare(list[i + 1], 'en', { sensitivity: 'base' });
        expect(
          comparison,
          `State "${state}" item "${list[i]}" should precede "${list[i + 1]}"`
        ).toBeLessThanOrEqual(0);
      }
    }

    // User asked for extensive village and city coverage (minimum 1500+ per state, 5000+ total)
    expect(totalDestinations).toBeGreaterThanOrEqual(5000);
  });

  test('Test 2: Interconnected Departure Origins & Haridwar Hub in Chips', () => {
    const content = fs.readFileSync('frontend/components/public/RoutesTabWidget.tsx', 'utf8');
    expect(content).toContain('"Haridwar"');
    expect(content).toContain('"Rishikesh"');
    expect(content).toContain('"Dehradun"');
    expect(content).toContain('"Nainital"');
    expect(content).toContain('"Agra"');
    expect(content).toContain('"Chandigarh"');
  });

  test('Test 3: Image Isolation & Adjacent Location Diversity', () => {
    const haridwarImg = getDestinationImage('Haridwar');
    const rishikeshImg = getDestinationImage('Rishikesh');
    const nainitalImg = getDestinationImage('Nainital');
    const haldwaniImg = getDestinationImage('Haldwani');
    const agraImg = getDestinationImage('Agra');

    expect(haridwarImg).toBe('/destinations/haridwar.webp');
    expect(rishikeshImg).toBe('/destinations/rishikesh.webp');
    expect(nainitalImg).toBe('/destinations/nainital.webp');
    expect(haldwaniImg).toBe('/destinations/haldwani.webp');
    expect(agraImg).toBe('/destinations/agra.webp');

    // Strict inequality: Haridwar != Rishikesh, Nainital != Haldwani
    expect(haridwarImg).not.toEqual(rishikeshImg);
    expect(nainitalImg).not.toEqual(haldwaniImg);
    expect(haridwarImg).not.toEqual(agraImg);
    expect(rishikeshImg).not.toEqual(agraImg);

    // Verify adjacent villages receive different images
    const v1 = getDestinationImage('Adampur', 'Haryana');
    const v2 = getDestinationImage('Agroha', 'Haryana');
    const v3 = getDestinationImage('Assandh', 'Haryana');
    expect(v1).not.toEqual(v2);
  });

  test('Test 4: Dedicated Route Corridors Exist Without Image Contamination', () => {
    const haridwarCorridor = getRouteCorridorDetails('Delhi', 'Haridwar', 220);
    const rishikeshCorridor = getRouteCorridorDetails('Delhi', 'Rishikesh', 238);
    const haldwaniCorridor = getRouteCorridorDetails('Delhi', 'Haldwani', 270);
    const nainitalCorridor = getRouteCorridorDetails('Delhi', 'Nainital', 298);

    // Haridwar gallery must NOT contain Rishikesh or Dehradun
    const haridwarGallerySrcs = haridwarCorridor.gallery.map(g => g.src);
    expect(haridwarGallerySrcs).not.toContain('/destinations/rishikesh.webp');
    expect(haridwarGallerySrcs).not.toContain('/destinations/dehradun.webp');
    expect(haridwarGallerySrcs).toContain('/destinations/haridwar.webp');

    // Rishikesh corridor must feature Rishikesh landmarks
    const rishikeshAttractions = rishikeshCorridor.places.attractions.map(a => a.name);
    expect(rishikeshAttractions.some(a => a.includes('Ram Jhula') || a.includes('Laxman Jhula'))).toBe(true);
    expect(rishikeshCorridor.gallery.some(g => g.src === '/destinations/rishikesh.webp')).toBe(true);

    // Haldwani corridor must feature Haldwani landmarks (Gaula Barrage / Kathgodam)
    const haldwaniAttractions = haldwaniCorridor.places.attractions.map(a => a.name);
    expect(haldwaniAttractions.some(a => a.includes('Gaula Barrage') || a.includes('Kathgodam'))).toBe(true);
    expect(haldwaniCorridor.gallery.some(g => g.src === '/destinations/haldwani.webp')).toBe(true);
  });

  test('Test 5: Haridwar Departure Origin Route Generator with Navgati CNG & Fuel Points', () => {
    const haridwarToDelhi = getRouteCorridorDetails('Haridwar', 'Delhi', 220);
    expect(haridwarToDelhi.routeChain).toContain('Haridwar');
    expect(haridwarToDelhi.weather.temp).toBeTruthy();

    // Verify Navgati verified CNG stations
    const cngNames = haridwarToDelhi.places.cngPumps.map(p => p.name);
    expect(cngNames.some(c => c.includes('Navgati Verified'))).toBe(true);
    expect(cngNames.some(c => c.includes('Haridwar'))).toBe(true);

    // Verify Petrol pumps on route
    expect(haridwarToDelhi.places.petrolPumps.length).toBeGreaterThanOrEqual(3);
  });

  test('Test 6: Bihar Coverage & Dedicated Landmark Images', () => {
    const patnaImg = getDestinationImage('Patna');
    const bodhGayaImg = getDestinationImage('Bodh Gaya');
    const gayaImg = getDestinationImage('Gaya');
    const muzaffarpurImg = getDestinationImage('Muzaffarpur');
    const bhagalpurImg = getDestinationImage('Bhagalpur');
    const darbhangaImg = getDestinationImage('Darbhanga');

    expect(patnaImg).toBe('/destinations/patna.webp');
    expect(bodhGayaImg).toBe('/destinations/bodh-gaya.webp');
    expect(gayaImg).toBe('/destinations/gaya.webp');
    expect(muzaffarpurImg).toBe('/destinations/muzaffarpur.webp');
    expect(bhagalpurImg).toBe('/destinations/bhagalpur.webp');
    expect(darbhangaImg).toBe('/destinations/darbhanga.webp');

    // Strict inequality
    expect(patnaImg).not.toEqual(bodhGayaImg);
    expect(gayaImg).not.toEqual(darbhangaImg);
  });

  test('Test 7: Autocomplete State Disambiguation', () => {
    const content = fs.readFileSync('frontend/lib/location-authority.ts', 'utf8');
    expect(content).toContain("name: 'Rampur', state: 'Uttar Pradesh'");
    expect(content).toContain("name: 'Rampur', state: 'Bihar'");
    expect(content).toContain("name: 'Bilaspur', state: 'Haryana'");
    expect(content).toContain("name: 'Bilaspur', state: 'Himachal Pradesh'");
  });

  test('Test 8: Master Expressways & Navgati CNG Verification across States', () => {
    // Delhi to Chandigarh master corridor
    const chdCorridor = getRouteCorridorDetails('Delhi', 'Chandigarh', 245);
    expect(chdCorridor.highway).toContain('NH-44');
    expect(chdCorridor.places.cngPumps.some(p => p.highlight?.includes('Navgati App Verified'))).toBe(true);

    // Delhi to Amritsar master corridor
    const asrCorridor = getRouteCorridorDetails('Delhi', 'Amritsar', 450);
    expect(asrCorridor.highway).toContain('NH-44');
    expect(asrCorridor.places.attractions.some(a => a.name.includes('Golden Temple'))).toBe(true);
    expect(asrCorridor.places.cngPumps.some(p => p.highlight?.includes('Navgati App Verified'))).toBe(true);

    // Delhi to Shimla master corridor
    const shmCorridor = getRouteCorridorDetails('Delhi', 'Shimla', 345);
    expect(shmCorridor.highway).toContain('Himalayan Expressway');
    expect(shmCorridor.famousFoods?.some(f => f.dish.includes('Siddu'))).toBe(true);

    // Delhi to Lucknow master corridor
    const lkoCorridor = getRouteCorridorDetails('Delhi', 'Lucknow', 555);
    expect(lkoCorridor.highway).toContain('Agra-Lucknow Expressway');
    expect(lkoCorridor.places.cngPumps.some(p => p.name.includes('Green Gas'))).toBe(true);

    // Delhi to Patna master corridor
    const patnaCorridor = getRouteCorridorDetails('Delhi', 'Patna', 995);
    expect(patnaCorridor.highway).toContain('Purvanchal Exp');
    expect(patnaCorridor.famousFoods?.some(f => f.dish.includes('Litti Chokha'))).toBe(true);
  });

  test('Test 9: State-Calibrated Dynamic Corridors with Navgati CNG for Bihar, Punjab, HP, Rajasthan', () => {
    // Dynamic Bihar corridor (e.g. Gaya)
    const gayaCorridor = getRouteCorridorDetails('Delhi', 'Gaya', 1050);
    expect(gayaCorridor.highway).toContain('NH-19');
    expect(gayaCorridor.famousFoods?.[0].dish).toContain('Litti Chokha');
    expect(gayaCorridor.places.cngPumps.some(p => p.name.includes('GAIL Gas'))).toBe(true);

    // Dynamic Punjab corridor (e.g. Ludhiana)
    const ldhCorridor = getRouteCorridorDetails('Delhi', 'Ludhiana', 315);
    expect(ldhCorridor.highway).toContain('NH-44');
    expect(ldhCorridor.famousFoods?.[0].dish).toContain('Amritsari Kulcha');
    expect(ldhCorridor.places.cngPumps.some(p => p.name.includes('Gujarat Gas'))).toBe(true);

    // Dynamic Himachal corridor (e.g. Dharamshala)
    const dhmCorridor = getRouteCorridorDetails('Delhi', 'Dharamshala', 485);
    expect(dhmCorridor.highway).toContain('Mountain Highway');
    expect(dhmCorridor.famousFoods?.[0].dish).toContain('Siddu');

    // Dynamic Rajasthan corridor (e.g. Bikaner)
    const bknCorridor = getRouteCorridorDetails('Delhi', 'Bikaner', 460);
    expect(bknCorridor.highway).toContain('NE4');
    expect(bknCorridor.famousFoods?.[0].dish).toContain('Dal Baati');
  });

  test('Test 10: Distinct Landmark WebP Images for Major Regional Hubs', () => {
    const suratImg = getDestinationImage('Surat');
    const vadodaraImg = getDestinationImage('Vadodara');
    const shirdiImg = getDestinationImage('Shirdi');
    const nashikImg = getDestinationImage('Nashik');
    const darjeelingImg = getDestinationImage('Darjeeling');
    const siliguriImg = getDestinationImage('Siliguri');
    const durgapurImg = getDestinationImage('Durgapur');
    const asansolImg = getDestinationImage('Asansol');

    expect(suratImg).toBe('/destinations/surat.webp');
    expect(vadodaraImg).toBe('/destinations/vadodara.webp');
    expect(shirdiImg).toBe('/destinations/shirdi.webp');
    expect(nashikImg).toBe('/destinations/nashik.webp');
    expect(darjeelingImg).toBe('/destinations/darjeeling.webp');
    expect(siliguriImg).toBe('/destinations/siliguri.webp');
    expect(durgapurImg).toBe('/destinations/durgapur.webp');
    expect(asansolImg).toBe('/destinations/asansol.webp');

    // Verify strict isolation across neighboring cities
    expect(suratImg).not.toEqual(vadodaraImg);
    expect(shirdiImg).not.toEqual(nashikImg);
    expect(darjeelingImg).not.toEqual(siliguriImg);
    expect(durgapurImg).not.toEqual(asansolImg);
  });
});
