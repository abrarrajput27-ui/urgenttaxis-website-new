-- 025_seed_pricing_rules.sql
-- Urgent Taxis Platform - Migration 025: Authoritative Pricing Rules & Public Access Policies
-- NOTE: For Owner Approval prior to applying to production database.

-- 1. Ensure public can read active pricing configurations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pricing_one_way' AND policyname = 'Public can view active pricing_one_way'
  ) THEN
    CREATE POLICY "Public can view active pricing_one_way" ON pricing_one_way FOR SELECT USING (is_active = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pricing_round_trip' AND policyname = 'Public can view active pricing_round_trip'
  ) THEN
    CREATE POLICY "Public can view active pricing_round_trip" ON pricing_round_trip FOR SELECT USING (is_active = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pricing_local_packages' AND policyname = 'Public can view active pricing_local_packages'
  ) THEN
    CREATE POLICY "Public can view active pricing_local_packages" ON pricing_local_packages FOR SELECT USING (is_active = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pricing_airport_transfers' AND policyname = 'Public can view active pricing_airport_transfers'
  ) THEN
    CREATE POLICY "Public can view active pricing_airport_transfers" ON pricing_airport_transfers FOR SELECT USING (is_active = true);
  END IF;
END $$;

-- 2. Populate Round-Trip Pricing Rules for Active Vehicle Categories
INSERT INTO pricing_round_trip (category_id, min_km_per_day, per_km_rate, driver_allowance_per_day, night_halt_charge, default_included_charges, default_excluded_charges, is_active)
SELECT 
  id AS category_id,
  CASE 
    WHEN slug = 'executive-suv' THEN 300.00
    ELSE 250.00
  END AS min_km_per_day,
  CASE 
    WHEN slug = 'sedan' THEN 11.00
    WHEN slug = 'suv-muv' THEN 15.00
    WHEN slug = 'executive-suv' THEN 20.00
    WHEN slug = 'hatchback' THEN 9.00
    ELSE 11.00
  END AS per_km_rate,
  CASE 
    WHEN slug = 'executive-suv' THEN 500.00
    WHEN slug = 'hatchback' THEN 300.00
    ELSE 400.00
  END AS driver_allowance_per_day,
  300.00 AS night_halt_charge,
  '["Fuel", "Vehicle Rent"]'::jsonb AS default_included_charges,
  '["Toll Tax", "State Tax", "Parking", "Driver Night Allowance"]'::jsonb AS default_excluded_charges,
  true AS is_active
FROM vehicle_categories
WHERE is_active = true
ON CONFLICT (category_id) DO UPDATE SET
  min_km_per_day = EXCLUDED.min_km_per_day,
  per_km_rate = EXCLUDED.per_km_rate,
  driver_allowance_per_day = EXCLUDED.driver_allowance_per_day,
  night_halt_charge = EXCLUDED.night_halt_charge,
  is_active = true;
