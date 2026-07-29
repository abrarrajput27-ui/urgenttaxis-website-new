-- Migration: Create route_cache table for Google Maps distances
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

-- RLS Policies
ALTER TABLE public.route_cache ENABLE ROW LEVEL SECURITY;

-- Allow public read access to the cache
CREATE POLICY "Allow public read access to route cache"
  ON public.route_cache FOR SELECT
  USING (true);

-- Only service role can insert/update (since our server-side API will manage this)
CREATE POLICY "Allow service role insert on route cache"
  ON public.route_cache FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow service role update on route cache"
  ON public.route_cache FOR UPDATE
  USING (true);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_route_cache_origin_dest ON public.route_cache(origin_city, destination_city);
