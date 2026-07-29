const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: './.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runMigration() {
  const sql = `
  CREATE TABLE IF NOT EXISTS public.route_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    origin_city TEXT NOT NULL,
    destination_city TEXT NOT NULL,
    distance_km NUMERIC NOT NULL,
    duration_mins NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(origin_city, destination_city)
  );
  ALTER TABLE public.route_cache ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Allow public read access to route cache" ON public.route_cache FOR SELECT USING (true);
  CREATE POLICY "Allow service role insert on route cache" ON public.route_cache FOR INSERT WITH CHECK (true);
  CREATE POLICY "Allow service role update on route cache" ON public.route_cache FOR UPDATE USING (true);
  CREATE INDEX IF NOT EXISTS idx_route_cache_origin_dest ON public.route_cache(origin_city, destination_city);
  `;
  
  // Note: Supabase JS client doesn't support raw SQL natively without Postgres extension or RPC. 
  // Let's create an RPC if missing or just inform the user they must run it via Supabase Studio.
  // Actually, since this is a managed Supabase project, I will print instructions.
  console.log("Migration script generated. Please run the contents of supabase/migrations/023_route_cache.sql in your Supabase SQL Editor.");
}

runMigration();
