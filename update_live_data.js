lconst { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase credentials in frontend/.env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const NEW_CATEGORIES = [
  { name: '12 Seater Traveller', slug: '12-seater-traveller', image_url: '/fleet-brand/Tempo Traveller.png', description: 'Force Traveller 1x1', base_price_per_km: 24, minimum_distance_per_day: 250, seating_capacity: 12, bag_capacity: 10, is_active: true, display_order: 10, ac_available: true },
  { name: '16 Seater Traveller', slug: '16-seater-traveller', image_url: '/fleet-brand/Tempo Traveller.png', description: 'Force Traveller 2x1', base_price_per_km: 26, minimum_distance_per_day: 250, seating_capacity: 16, bag_capacity: 12, is_active: true, display_order: 11, ac_available: true },
  { name: '12 Seater Urbania', slug: '12-seater-urbania', image_url: '/fleet-brand/Urbania.png', description: 'Force Urbania Premium', base_price_per_km: 30, minimum_distance_per_day: 250, seating_capacity: 12, bag_capacity: 10, is_active: true, display_order: 12, ac_available: true },
  { name: '27 Seater Bus', slug: '27-seater-bus', image_url: '/fleet-brand/Bus.png', description: 'Luxury AC Bus', base_price_per_km: 45, minimum_distance_per_day: 250, seating_capacity: 27, bag_capacity: 27, is_active: true, display_order: 13, ac_available: true },
  { name: '45 Seater Bus', slug: '45-seater-bus', image_url: '/fleet-brand/volvo bus.png', description: 'Luxury Volvo Bus', base_price_per_km: 55, minimum_distance_per_day: 250, seating_capacity: 45, bag_capacity: 45, is_active: true, display_order: 14, ac_available: true },
];

async function updateLiveData() {
  console.log("Updating live Supabase database...");

  // 1. Insert new fleet categories
  console.log("Inserting new Tempo Traveller and Bus fleet categories...");
  for (const cat of NEW_CATEGORIES) {
    const { data, error } = await supabase
      .from('vehicle_categories')
      .upsert({ ...cat }, { onConflict: 'slug' });

    if (error) {
      console.error(`Error inserting ${cat.name}:`, error.message);
    } else {
      console.log(`Successfully added/updated: ${cat.name}`);
    }
  }

  // 2. You can also insert the 1000+ massive routes here.
  // Due to API constraints, generating 10,000 accurate distance calculations 
  // requires a Google Maps / OSRM API key. 
  // I have pre-written the generation logic in `generate_massive_routes.js`.

  console.log("Live Database Update Complete!");
}

updateLiveData();
