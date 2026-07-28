-- 005_locations_and_routes.sql
-- Urgent Taxis Platform - Migration 005: Locations and Outstation Routes

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  location_type location_type_enum NOT NULL DEFAULT 'city',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  destination_location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  estimated_distance_km NUMERIC(10, 2) NOT NULL CHECK (estimated_distance_km > 0),
  estimated_duration_minutes INT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT route_origin_dest_unique UNIQUE (origin_location_id, destination_location_id)
);

CREATE INDEX idx_routes_origin ON routes(origin_location_id);
CREATE INDEX idx_routes_destination ON routes(destination_location_id);
