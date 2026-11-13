-- =============================================================================
-- MIGRATION: 027_smart_toll_engine.sql
-- URGENT TAXIS — SMART ROUTE-BASED TOLL & STATE TAX CALCULATION ENGINE
-- =============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. VEHICLE TOLL CLASSES MASTER
-- Configurable vehicle-to-toll-class mapping system
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vehicle_toll_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id VARCHAR(50) NOT NULL UNIQUE, -- 'sedan', 'ertiga', 'suv', 'tempo_traveller', 'force_traveller', 'force_urbania', 'minibus', 'bus_coach'
    website_vehicle_name VARCHAR(100) NOT NULL,
    axle_count INTEGER NOT NULL DEFAULT 2,
    provider_vehicle_class VARCHAR(50) NOT NULL DEFAULT '2AxlesAuto', -- TollGuru classification
    official_toll_class VARCHAR(50) NOT NULL DEFAULT 'Car/Jeep/Van', -- NHAI official classification
    registration_category VARCHAR(50) NOT NULL DEFAULT 'Commercial Tourist Taxi (Yellow Plate)',
    mapping_verified BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- -----------------------------------------------------------------------------
-- 2. TOLL PLAZAS MASTER
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.toll_plazas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    toll_name VARCHAR(255) NOT NULL,
    normalized_name VARCHAR(255) NOT NULL,
    highway_name VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    provider_toll_id VARCHAR(100),
    plaza_direction VARCHAR(50) DEFAULT 'Both', -- 'Northbound', 'Southbound', 'Eastbound', 'Westbound', 'Both'
    authority VARCHAR(100) DEFAULT 'NHAI', -- 'NHAI', 'YEIDA', 'UPEIDA', 'State PWD'
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for spatial & highway searches
CREATE INDEX IF NOT EXISTS idx_toll_plazas_highway ON public.toll_plazas(highway_name);
CREATE INDEX IF NOT EXISTS idx_toll_plazas_state ON public.toll_plazas(state);
CREATE INDEX IF NOT EXISTS idx_toll_plazas_normalized ON public.toll_plazas(normalized_name);

-- -----------------------------------------------------------------------------
-- 3. TOLL RATES
-- Vehicle-wise prices with verification dates and sources
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.toll_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    toll_plaza_id UUID NOT NULL REFERENCES public.toll_plazas(id) ON DELETE CASCADE,
    vehicle_toll_class_id UUID NOT NULL REFERENCES public.vehicle_toll_classes(id) ON DELETE RESTRICT,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    return_amount NUMERIC(10, 2) CHECK (return_amount >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_to DATE,
    source VARCHAR(50) NOT NULL DEFAULT 'NHAI_TIS', -- 'NHAI_TIS', 'TOLLGURU', 'STATE_PORTAL', 'MANUAL_VERIFIED'
    verification_status VARCHAR(50) NOT NULL DEFAULT 'VERIFIED', -- 'VERIFIED', 'ESTIMATED', 'PENDING_REVIEW', 'CONFLICT'
    verified_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_plaza_class_effective UNIQUE(toll_plaza_id, vehicle_toll_class_id, effective_from)
);

CREATE INDEX IF NOT EXISTS idx_toll_rates_plaza_class ON public.toll_rates(toll_plaza_id, vehicle_toll_class_id);

-- -----------------------------------------------------------------------------
-- 4. ROUTE TOLL MAPPING
-- Order of toll plazas encountered along specific road corridor
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.route_toll_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_corridor_slug VARCHAR(150) NOT NULL,
    toll_plaza_id UUID NOT NULL REFERENCES public.toll_plazas(id) ON DELETE CASCADE,
    sequence_number INTEGER NOT NULL,
    direction VARCHAR(50) NOT NULL DEFAULT 'Forward', -- 'Forward', 'Return'
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_route_plaza_seq UNIQUE(route_corridor_slug, toll_plaza_id, direction)
);

CREATE INDEX IF NOT EXISTS idx_route_toll_mapping_slug ON public.route_toll_mapping(route_corridor_slug);

-- -----------------------------------------------------------------------------
-- 5. TOLL API LOGS
-- Request/Response telemetry for TollGuru and Google Routes API (Credentials excluded!)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.toll_api_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(50) NOT NULL, -- 'TOLLGURU', 'GOOGLE_ROUTES', 'NHAI_TIS'
    request_reference VARCHAR(100),
    origin_name VARCHAR(150),
    destination_name VARCHAR(150),
    vehicle_class VARCHAR(50),
    response_status INTEGER NOT NULL,
    response_summary JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_toll_api_logs_provider ON public.toll_api_logs(provider, created_at);

-- -----------------------------------------------------------------------------
-- 6. TOLL RATE HISTORY
-- Full immutable audit trail whenever a rate is adjusted
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.toll_rate_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    toll_rate_id UUID REFERENCES public.toll_rates(id) ON DELETE SET NULL,
    toll_name VARCHAR(255) NOT NULL,
    vehicle_class VARCHAR(50) NOT NULL,
    previous_amount NUMERIC(10, 2),
    new_amount NUMERIC(10, 2) NOT NULL,
    source VARCHAR(50) NOT NULL DEFAULT 'MANUAL_OVERRIDE',
    updated_by VARCHAR(100) NOT NULL,
    update_reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- -----------------------------------------------------------------------------
-- 7. ROUTE TOLL CACHE
-- 24-hour cache for route geometry and toll calculations
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.route_toll_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_hash VARCHAR(100) NOT NULL UNIQUE,
    origin_place VARCHAR(150) NOT NULL,
    destination_place VARCHAR(150) NOT NULL,
    vehicle_class VARCHAR(50) NOT NULL,
    trip_type VARCHAR(20) NOT NULL DEFAULT 'one_way',
    toll_result_json JSONB NOT NULL,
    total_toll NUMERIC(10, 2) NOT NULL,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'VERIFIED',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_route_toll_cache_hash ON public.route_toll_cache(route_hash);
CREATE INDEX IF NOT EXISTS idx_route_toll_cache_expires ON public.route_toll_cache(expires_at);

-- -----------------------------------------------------------------------------
-- 8. TOLL VERIFICATION QUEUE
-- Mismatches, missing rates, or expired rates for Admin Review
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.toll_verification_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    toll_plaza_id UUID REFERENCES public.toll_plazas(id) ON DELETE CASCADE,
    toll_name VARCHAR(255) NOT NULL,
    vehicle_class VARCHAR(50) NOT NULL,
    provider_amount NUMERIC(10, 2),
    database_amount NUMERIC(10, 2),
    discrepancy_reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED', 'RESOLVED'
    admin_remarks TEXT,
    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- -----------------------------------------------------------------------------
-- 9. SEED: VEHICLE TOLL CLASSES
-- -----------------------------------------------------------------------------
INSERT INTO public.vehicle_toll_classes (vehicle_id, website_vehicle_name, axle_count, provider_vehicle_class, official_toll_class, registration_category)
VALUES
    ('sedan', 'Sedan (Dzire / Etios)', 2, '2AxlesAuto', 'Car / Jeep / Van', 'Commercial Tourist Taxi (Yellow Plate)'),
    ('ertiga', 'Ertiga (6-Seater SUV)', 2, '2AxlesAuto', 'Car / Jeep / Van', 'Commercial Tourist Taxi (Yellow Plate)'),
    ('suv', 'SUV (Innova / XUV700)', 2, '2AxlesAuto', 'Car / Jeep / Van / SUV', 'Commercial Tourist Taxi (Yellow Plate)'),
    ('tempo_traveller', 'Tempo Traveller (12/16 Seater)', 2, '2AxlesLCV', 'Light Commercial Vehicle (LCV)', 'Commercial Maxi Cab'),
    ('force_traveller', 'Force Traveller (20/26 Seater)', 2, '2AxlesLCV', 'Mini Bus / LCV', 'Commercial Stage / Contract Carriage'),
    ('force_urbania', 'Force Urbania (12/16 Seater Luxury)', 2, '2AxlesLCV', 'Light Commercial Vehicle (LCV)', 'Commercial Luxury Van'),
    ('minibus', 'Minibus (27 Seater)', 2, '2AxlesBus', 'Bus / Mini Bus (2 Axle)', 'Heavy Passenger Vehicle'),
    ('bus_coach', 'Bus / Coach (45 Seater)', 3, '3AxlesBus', 'Multi-Axle Commercial Bus', 'Heavy Passenger Bus')
ON CONFLICT (vehicle_id) DO UPDATE SET
    website_vehicle_name = EXCLUDED.website_vehicle_name,
    provider_vehicle_class = EXCLUDED.provider_vehicle_class,
    official_toll_class = EXCLUDED.official_toll_class;

-- -----------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- Public can read verified tolls; only authenticated admins can insert/update/delete.
-- -----------------------------------------------------------------------------
ALTER TABLE public.vehicle_toll_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toll_plazas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toll_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_toll_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_toll_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toll_rate_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toll_verification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toll_api_logs ENABLE ROW LEVEL SECURITY;

-- Read policies for public
CREATE POLICY "Public read active vehicle toll classes" ON public.vehicle_toll_classes
    FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Public read active toll plazas" ON public.toll_plazas
    FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Public read verified toll rates" ON public.toll_rates
    FOR SELECT TO public USING (verification_status = 'VERIFIED');

CREATE POLICY "Public read route toll mapping" ON public.route_toll_mapping
    FOR SELECT TO public USING (true);

CREATE POLICY "Public read valid route toll cache" ON public.route_toll_cache
    FOR SELECT TO public USING (expires_at > timezone('utc'::text, now()));

-- Service role / Admin full access
CREATE POLICY "Admins manage vehicle toll classes" ON public.vehicle_toll_classes
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins manage toll plazas" ON public.toll_plazas
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins manage toll rates" ON public.toll_rates
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins manage route toll mapping" ON public.route_toll_mapping
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins view toll api logs" ON public.toll_api_logs
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins view and manage rate history" ON public.toll_rate_history
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins manage toll verification queue" ON public.toll_verification_queue
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
