-- 007_dynamic_pricing.sql
-- Urgent Taxis Platform - Migration 007: Dynamic Pricing Engine

CREATE TABLE dynamic_pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name VARCHAR(150) NOT NULL,
  trip_type trip_type_enum, -- NULL means applies to all trip types
  category_id UUID REFERENCES vehicle_categories(id) ON DELETE CASCADE, -- NULL means applies to all categories
  start_date DATE,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  adjustment_type adjustment_type_enum NOT NULL,
  adjustment_value NUMERIC(10, 2) NOT NULL,
  priority INT NOT NULL DEFAULT 10, -- Higher number means higher priority resolution
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dynamic_pricing_dates ON dynamic_pricing_rules(start_date, end_date);
CREATE INDEX idx_dynamic_pricing_trip ON dynamic_pricing_rules(trip_type);
