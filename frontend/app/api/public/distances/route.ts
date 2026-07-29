import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || '';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin');
  const destinationsParam = searchParams.get('destinations'); // Comma separated

  if (!origin || !destinationsParam) {
    return NextResponse.json({ error: 'Origin and destinations are required' }, { status: 400 });
  }

  const destinations = destinationsParam.split(',').map(d => d.trim()).filter(Boolean);

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // 1. Check cache first
    const { data: cachedRoutes } = await supabase
      .from('route_cache')
      .select('*')
      .eq('origin_city', origin)
      .in('destination_city', destinations);
      
    const cachedMap = new Map(cachedRoutes?.map(r => [r.destination_city, r]) || []);
    
    const missingDestinations = destinations.filter(d => !cachedMap.has(d));
    
    // 2. Fetch missing from Google Maps
    if (missingDestinations.length > 0 && googleMapsApiKey) {
      const gmapsUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${missingDestinations.map(encodeURIComponent).join('|')}&key=${googleMapsApiKey}`;
      
      const response = await fetch(gmapsUrl);
      const data = await response.json();
      
      if (data.status === 'OK') {
        const newCacheEntries = [];
        
        missingDestinations.forEach((dest, index) => {
          const element = data.rows[0].elements[index];
          if (element.status === 'OK') {
            const distanceKm = Math.round(element.distance.value / 1000);
            const durationMins = Math.round(element.duration.value / 60);
            
            const newEntry = {
              origin_city: origin,
              destination_city: dest,
              distance_km: distanceKm,
              duration_mins: durationMins,
            };
            
            newCacheEntries.push(newEntry);
            cachedMap.set(dest, newEntry);
          }
        });
        
        // Save to cache
        if (newCacheEntries.length > 0) {
          await supabase.from('route_cache').insert(newCacheEntries).select();
        }
      }
    }

    // 3. Construct response
    const results = destinations.map(dest => {
      const cached = cachedMap.get(dest);
      if (cached) {
        return {
          destination: dest,
          distance: cached.distance_km,
          price: (cached.distance_km * 11) + 200, // Example generic base logic, UI can calculate proper fare
        };
      }
      return { destination: dest, distance: null, price: null };
    });

    return NextResponse.json({ routes: results });

  } catch (error: any) {
    console.error('Error fetching distances:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
