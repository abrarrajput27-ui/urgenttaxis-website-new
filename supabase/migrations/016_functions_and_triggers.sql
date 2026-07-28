-- 016_functions_and_triggers.sql
-- Urgent Taxis Platform - Migration 016: Secure RPC Functions & Automatic Triggers

-- Automatic updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicle_categories_updated_at BEFORE UPDATE ON vehicle_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_actual_fleet_updated_at BEFORE UPDATE ON actual_fleet FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- SECURE FARE CALCULATION RPC FUNCTION (SECURITY DEFINER)
-- Allows public website users to calculate fares securely without giving raw table SELECT permissions to pricing tables
CREATE OR REPLACE FUNCTION calculate_trip_fare(
  p_trip_type trip_type_enum,
  p_category_id UUID,
  p_route_id UUID DEFAULT NULL,
  p_distance_km NUMERIC DEFAULT NULL,
  p_duration_hours INT DEFAULT NULL,
  p_travel_date TIMESTAMPTZ DEFAULT now()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_base_fare NUMERIC(12, 2) := 0;
  v_included_km NUMERIC(10, 2) := 0;
  v_extra_km_rate NUMERIC(12, 2) := 0;
  v_extra_km NUMERIC(10, 2) := 0;
  v_extra_km_charge NUMERIC(12, 2) := 0;
  v_final_fare NUMERIC(12, 2) := 0;
  v_included_json JSONB;
  v_excluded_json JSONB;
  v_rule RECORD;
BEGIN
  IF p_trip_type = 'one_way' THEN
    SELECT base_fare, included_km, extra_km_rate, default_included_charges, default_excluded_charges
    INTO v_base_fare, v_included_km, v_extra_km_rate, v_included_json, v_excluded_json
    FROM pricing_one_way
    WHERE route_id = p_route_id AND category_id = p_category_id AND is_active = true;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Pricing not configured for selected route and vehicle category';
    END IF;

    IF p_distance_km IS NOT NULL AND p_distance_km > v_included_km THEN
      v_extra_km := p_distance_km - v_included_km;
      v_extra_km_charge := v_extra_km * v_extra_km_rate;
    END IF;

    v_final_fare := v_base_fare + v_extra_km_charge;

  ELSIF p_trip_type = 'round_trip' THEN
    SELECT per_km_rate, min_km_per_day, default_included_charges, default_excluded_charges
    INTO v_extra_km_rate, v_included_km, v_included_json, v_excluded_json
    FROM pricing_round_trip
    WHERE category_id = p_category_id AND is_active = true;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Round trip pricing not configured for selected vehicle category';
    END IF;

    v_final_fare := GREATEST(COALESCE(p_distance_km, 0), v_included_km) * v_extra_km_rate;
  END IF;

  -- Apply active dynamic pricing rules by priority
  FOR v_rule IN 
    SELECT adjustment_type, adjustment_value 
    FROM dynamic_pricing_rules 
    WHERE is_active = true 
      AND (trip_type IS NULL OR trip_type = p_trip_type)
      AND (category_id IS NULL OR category_id = p_category_id)
      AND (start_date IS NULL OR start_date <= p_travel_date::date)
      AND (end_date IS NULL OR end_date >= p_travel_date::date)
    ORDER BY priority DESC
  LOOP
    IF v_rule.adjustment_type = 'percentage' THEN
      v_final_fare := v_final_fare * (1 + (v_rule.adjustment_value / 100.0));
    ELSIF v_rule.adjustment_type = 'fixed_amount' THEN
      v_final_fare := v_final_fare + v_rule.adjustment_value;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'trip_type', p_trip_type,
    'category_id', p_category_id,
    'base_fare', v_base_fare,
    'included_km', v_included_km,
    'extra_km_rate', v_extra_km_rate,
    'extra_km_charge', v_extra_km_charge,
    'calculated_final_fare', ROUND(v_final_fare, 2),
    'included_charges', v_included_json,
    'excluded_charges', v_excluded_json
  );
END;
$$;
