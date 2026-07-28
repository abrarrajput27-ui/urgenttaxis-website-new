-- 010_availability_engine.sql
-- Urgent Taxis Platform - Migration 010: Fleet Availability and Double-Booking Prevention

CREATE TABLE vehicle_unavailability_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fleet_id UUID NOT NULL REFERENCES actual_fleet(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL CHECK (end_time > start_time),
  reason VARCHAR(100) NOT NULL CHECK (reason IN ('booking', 'maintenance', 'admin_block', 'other')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Prevent overlapping unavailability range per vehicle
  EXCLUDE USING GIST (
    fleet_id WITH =,
    tstzrange(start_time, end_time, '[)') WITH &&
  )
);

CREATE INDEX idx_unavailability_fleet ON vehicle_unavailability_periods(fleet_id);
CREATE INDEX idx_unavailability_range ON vehicle_unavailability_periods USING GIST (tstzrange(start_time, end_time, '[)'));
