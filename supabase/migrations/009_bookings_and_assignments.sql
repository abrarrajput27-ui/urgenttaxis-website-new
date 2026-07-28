-- 009_bookings_and_assignments.sql
-- Urgent Taxis Platform - Migration 009: Bookings and Operational Fleet/Driver Assignments

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference VARCHAR(50) NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  category_id UUID NOT NULL REFERENCES vehicle_categories(id) ON DELETE RESTRICT,
  selected_model_id UUID REFERENCES vehicle_models(id) ON DELETE RESTRICT, -- Preserved customer preference
  trip_type trip_type_enum NOT NULL,
  pickup_address TEXT NOT NULL,
  drop_address TEXT,
  pickup_datetime TIMESTAMPTZ NOT NULL,
  passenger_count INT NOT NULL DEFAULT 1,
  luggage_count INT NOT NULL DEFAULT 0,
  status booking_status_enum NOT NULL DEFAULT 'pending',
  payment_status payment_status_enum NOT NULL DEFAULT 'unpaid',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fleet_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  fleet_id UUID NOT NULL REFERENCES actual_fleet(id) ON DELETE RESTRICT,
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE RESTRICT,
  driver_allowance_payout NUMERIC(12, 2), -- MEDIUM GAP-03 ENHANCEMENT: Operational driver payout tracking
  vendor_commission_payout NUMERIC(12, 2), -- Operational vendor settlement tracking
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_by_user_id UUID REFERENCES user_profiles(id)
);

CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_pickup ON bookings(pickup_datetime);
CREATE INDEX idx_fleet_assignments_booking ON fleet_assignments(booking_id);
CREATE INDEX idx_fleet_assignments_fleet ON fleet_assignments(fleet_id);
