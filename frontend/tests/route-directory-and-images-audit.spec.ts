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
      'Haryana',
      'Delhi NCR',
      'Uttar Pradesh',
      'Madhya Pradesh',
      'Jammu & Kashmir',
      'Punjab',
      'Himachal Pradesh',
      'Uttarakhand',
      'Rajasthan',
      'Other States'
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

    // User asked for minimum 1500 villages and cities
    expect(totalDestinations).toBeGreaterThanOrEqual(1500);
  });

  test('Test 2: Haridwar is Included in Popular Origin Chips', () => {
    const content = fs.readFileSync('frontend/components/public/RoutesTabWidget.tsx', 'utf8');
    expect(content).toContain('"Haridwar"');
    expect(content).toMatch(/const ORIGIN_CHIPS\s*=\s*\[[\s\S]*?"Haridwar"[\s\S]*?\];/);
  });

  test('Test 3: Image Isolation - Haridwar vs Rishikesh vs Nainital vs Haldwani vs Agra', () => {
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
});
