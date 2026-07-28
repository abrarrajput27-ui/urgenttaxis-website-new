-- 003_vehicle_master_catalog.sql
-- Urgent Taxis Platform - Migration 003: Vehicle Master Catalog

CREATE TABLE vehicle_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE vehicle_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES vehicle_categories(id) ON DELETE RESTRICT,
  brand_name VARCHAR(100) NOT NULL,
  model_name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  master_image_url TEXT,
  display_mode display_mode_enum NOT NULL DEFAULT 'model_or_similar',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT brand_model_unique UNIQUE (brand_name, model_name)
);

CREATE TABLE vehicle_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES vehicle_models(id) ON DELETE RESTRICT,
  variant_name VARCHAR(100) NOT NULL,
  fuel_type fuel_type_enum NOT NULL,
  seating_capacity INT NOT NULL DEFAULT 4 CHECK (seating_capacity > 0),
  luggage_capacity_large INT NOT NULL DEFAULT 2 CHECK (luggage_capacity_large >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  icon_name VARCHAR(50),
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE variant_amenities (
  variant_id UUID NOT NULL REFERENCES vehicle_variants(id) ON DELETE CASCADE,
  amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (variant_id, amenity_id)
);

CREATE INDEX idx_vehicle_models_category ON vehicle_models(category_id);
CREATE INDEX idx_vehicle_variants_model ON vehicle_variants(model_id);
