-- 001_extensions_and_enums.sql
-- Urgent Taxis Platform - Migration 001: Extensions and Base Enums

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Fuel Type Enum
CREATE TYPE fuel_type_enum AS ENUM (
  'Petrol',
  'Diesel',
  'CNG',
  'Electric',
  'Hybrid',
  'Other'
);

-- Fleet Status Enum
CREATE TYPE fleet_status_enum AS ENUM (
  'available',
  'booked',
  'on_trip',
  'maintenance',
  'blocked',
  'inactive'
);

-- Vehicle Display Mode Enum
CREATE TYPE display_mode_enum AS ENUM (
  'exact_vehicle',
  'vehicle_model',
  'model_or_similar',
  'category_or_similar'
);

-- Trip Type Enum
CREATE TYPE trip_type_enum AS ENUM (
  'one_way',
  'round_trip',
  'local',
  'airport'
);

-- Booking Status Enum
CREATE TYPE booking_status_enum AS ENUM (
  'pending',
  'confirmed',
  'assigned',
  'on_trip',
  'completed',
  'cancelled'
);

-- Payment Status Enum
CREATE TYPE payment_status_enum AS ENUM (
  'unpaid',
  'partially_paid',
  'paid',
  'refunded'
);

-- Payment Mode Enum
CREATE TYPE payment_mode_enum AS ENUM (
  'cash',
  'upi',
  'card',
  'bank_transfer'
);

-- Location Type Enum
CREATE TYPE location_type_enum AS ENUM (
  'city',
  'airport',
  'railway_station',
  'hub'
);

-- Dynamic Adjustment Type Enum
CREATE TYPE adjustment_type_enum AS ENUM (
  'percentage',
  'fixed_amount'
);
