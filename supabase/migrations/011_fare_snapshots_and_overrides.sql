-- 011_fare_snapshots_and_overrides.sql
-- Urgent Taxis Platform - Migration 011: Immutable Fare Snapshots and Manual Fare Overrides

CREATE TABLE fare_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  automatic_fare NUMERIC(12, 2) NOT NULL CHECK (automatic_fare >= 0),
  manual_override_fare NUMERIC(12, 2) CHECK (manual_override_fare >= 0),
  final_fare NUMERIC(12, 2) NOT NULL CHECK (final_fare >= 0),
  override_reason TEXT,
  overridden_by_user_id UUID REFERENCES user_profiles(id),
  breakdown_json JSONB NOT NULL, -- Complete immutable breakdown (Included, Excluded, Per KM, Base Fare, Surges)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fare_snapshots_booking ON fare_snapshots(booking_id);
