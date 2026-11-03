-- 024_phase1_security_hardening.sql
-- Urgent Taxis Platform - Migration 024: Security Hardening

-- Ensure bookings cannot be modified by anonymous users.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE policyname = 'Admin can manage all bookings' AND tablename = 'bookings'
    ) THEN
        CREATE POLICY "Admin can manage all bookings"
        ON bookings FOR ALL
        TO authenticated
        USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
    END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_actual_fleet_status ON actual_fleet(status);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);

-- Prevent unauthenticated access to actual_fleet
ALTER TABLE actual_fleet ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE policyname = 'Admin can manage fleet' AND tablename = 'actual_fleet'
    ) THEN
        CREATE POLICY "Admin can manage fleet"
        ON actual_fleet FOR ALL
        TO authenticated
        USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
    END IF;
END $$;
