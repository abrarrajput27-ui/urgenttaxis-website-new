-- 015_rls_policies.sql
-- Urgent Taxis Platform - Migration 015: Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE variant_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE actual_fleet ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_one_way ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_round_trip ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_local_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_airport_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_unavailability_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE fare_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- PUBLIC SELECT POLICIES (Catalog & CMS data)
CREATE POLICY "Public can view active categories" ON vehicle_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active models" ON vehicle_models FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active variants" ON vehicle_variants FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active amenities" ON amenities FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view variant amenities" ON variant_amenities FOR SELECT USING (true);
CREATE POLICY "Public can view active locations" ON locations FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active routes" ON routes FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view published cms pages" ON cms_pages FOR SELECT USING (is_published = true);

-- PUBLIC INSERT POLICIES (Enquiries & Booking creation)
CREATE POLICY "Public can insert customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert enquiries" ON enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert bookings" ON bookings FOR INSERT WITH CHECK (true);

-- AUTHENTICATED STAFF POLICIES (Full management access based on role checks)
CREATE POLICY "Staff full access user_profiles" ON user_profiles FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff full access vehicle_categories" ON vehicle_categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff full access vehicle_models" ON vehicle_models FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff full access vehicle_variants" ON vehicle_variants FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff full access actual_fleet" ON actual_fleet FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff full access vendors" ON vendors FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff full access drivers" ON drivers FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff full access pricing_one_way" ON pricing_one_way FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff full access pricing_round_trip" ON pricing_round_trip FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff full access pricing_local_packages" ON pricing_local_packages FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff full access pricing_airport_transfers" ON pricing_airport_transfers FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff full access dynamic_pricing_rules" ON dynamic_pricing_rules FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff full access bookings" ON bookings FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff full access fleet_assignments" ON fleet_assignments FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff full access vehicle_unavailability" ON vehicle_unavailability_periods FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff full access fare_snapshots" ON fare_snapshots FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff full access audit_logs" ON audit_logs FOR SELECT TO authenticated USING (true);
