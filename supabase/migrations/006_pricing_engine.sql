-- 006_pricing_engine.sql
-- Urgent Taxis Platform - Migration 006: Core Pricing Engine

CREATE TABLE pricing_one_way (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES vehicle_categories(id) ON DELETE CASCADE,
  base_fare NUMERIC(12, 2) NOT NULL CHECK (base_fare >= 0),
  included_km NUMERIC(10, 2) NOT NULL CHECK (included_km >= 0),
  extra_km_rate NUMERIC(12, 2) NOT NULL CHECK (extra_km_rate >= 0),
  driver_allowance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  default_included_charges JSONB NOT NULL DEFAULT '["Fuel", "Driver Allowance"]'::jsonb,
  default_excluded_charges JSONB NOT NULL DEFAULT '["Toll Tax", "State Border Tax", "Parking"]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pricing_oneway_unique UNIQUE (route_id, category_id)
);

CREATE TABLE pricing_round_trip (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES vehicle_categories(id) ON DELETE CASCADE,
  min_km_per_day NUMERIC(10, 2) NOT NULL DEFAULT 250.00 CHECK (min_km_per_day > 0),
  per_km_rate NUMERIC(12, 2) NOT NULL CHECK (per_km_rate >= 0),
  driver_allowance_per_day NUMERIC(12, 2) NOT NULL CHECK (driver_allowance_per_day >= 0),
  night_halt_charge NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  default_included_charges JSONB NOT NULL DEFAULT '["Fuel", "Driver Allowance"]'::jsonb,
  default_excluded_charges JSONB NOT NULL DEFAULT '["Toll Tax", "State Border Tax", "Parking", "Night Halt"]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pricing_roundtrip_unique UNIQUE (category_id)
);

CREATE TABLE pricing_local_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES vehicle_categories(id) ON DELETE CASCADE,
  package_name VARCHAR(100) NOT NULL,
  included_hours INT NOT NULL CHECK (included_hours > 0),
  included_km NUMERIC(10, 2) NOT NULL CHECK (included_km > 0),
  package_price NUMERIC(12, 2) NOT NULL CHECK (package_price >= 0),
  extra_hour_rate NUMERIC(12, 2) NOT NULL CHECK (extra_hour_rate >= 0),
  extra_km_rate NUMERIC(12, 2) NOT NULL CHECK (extra_km_rate >= 0),
  default_included_charges JSONB NOT NULL DEFAULT '["Fuel", "Driver Allowance"]'::jsonb,
  default_excluded_charges JSONB NOT NULL DEFAULT '["Toll Tax", "Parking"]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pricing_airport_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  airport_location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  city_zone_location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES vehicle_categories(id) ON DELETE CASCADE,
  base_fare NUMERIC(12, 2) NOT NULL CHECK (base_fare >= 0),
  included_km NUMERIC(10, 2) NOT NULL CHECK (included_km >= 0),
  extra_km_rate NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (extra_km_rate >= 0),
  default_included_charges JSONB NOT NULL DEFAULT '["Fuel", "Driver Allowance", "Airport Entry Fee"]'::jsonb,
  default_excluded_charges JSONB NOT NULL DEFAULT '["Parking Fee"]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pricing_oneway_route ON pricing_one_way(route_id);
CREATE INDEX idx_pricing_oneway_cat ON pricing_one_way(category_id);
CREATE INDEX idx_pricing_round_cat ON pricing_round_trip(category_id);
CREATE INDEX idx_pricing_local_cat ON pricing_local_packages(category_id);
CREATE INDEX idx_pricing_airport_cat ON pricing_airport_transfers(category_id);
