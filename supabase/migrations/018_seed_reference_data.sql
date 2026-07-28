-- 018_seed_reference_data.sql
-- Urgent Taxis Platform - Migration 018: Seed Initial System Reference Data

-- Seed Roles
INSERT INTO roles (role_code, description) VALUES
  ('super_admin', 'System Super Administrator with full access'),
  ('admin', 'Operations Administrator'),
  ('fleet_manager', 'Fleet and Vehicle Manager'),
  ('dispatcher', 'Booking and Dispatch Operator'),
  ('billing_clerk', 'Invoicing and Accounting Clerk'),
  ('content_manager', 'CMS and SEO Content Editor')
ON CONFLICT (role_code) DO NOTHING;

-- Seed Vehicle Categories
INSERT INTO vehicle_categories (name, slug, description, display_order) VALUES
  ('Sedan', 'sedan', 'Comfortable 4-seater sedans ideal for corporate travel and small families.', 1),
  ('SUV / MUV', 'suv-muv', 'Spacious 6 to 7-seater vehicles perfect for family outstation trips and hilly terrain.', 2),
  ('Executive SUV', 'executive-suv', 'Premium luxury SUVs offering top-tier comfort and style.', 3),
  ('Hatchback', 'hatchback', 'Compact and economical cars ideal for quick city rides and short trips.', 4)
ON CONFLICT (name) DO NOTHING;

-- Seed Amenities
INSERT INTO amenities (name, icon_name) VALUES
  ('Air Conditioner (AC)', 'ac'),
  ('Music System / Bluetooth', 'music'),
  ('Mobile Charging Point', 'charging'),
  ('Water Bottle Holder', 'bottle'),
  ('Ample Luggage Space', 'luggage'),
  ('Clean & Comfortable Seats', 'seats')
ON CONFLICT (name) DO NOTHING;
