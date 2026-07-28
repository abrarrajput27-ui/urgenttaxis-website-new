-- 004_vendors_drivers_and_fleet.sql
-- Urgent Taxis Platform - Migration 004: Vendors, Drivers and Actual Fleet

CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL UNIQUE,
  license_number VARCHAR(100) NOT NULL UNIQUE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE actual_fleet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES vehicle_variants(id) ON DELETE RESTRICT,
  registration_number VARCHAR(50), -- OPTIONAL / NULLABLE per core business rules
  chassis_number VARCHAR(100),
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  default_driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  status fleet_status_enum NOT NULL DEFAULT 'available',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_actual_fleet_variant ON actual_fleet(variant_id);
CREATE INDEX idx_actual_fleet_vendor ON actual_fleet(vendor_id);
CREATE INDEX idx_drivers_vendor ON drivers(vendor_id);
