-- 020_phase3_rls_and_storage.sql
-- Urgent Taxis Platform - Migration 020: CRM RLS Policies and Secure Storage

-- 1. SECURE STORAGE BUCKET --
INSERT INTO storage.buckets (id, name, public) 
VALUES ('customer-documents', 'customer-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for customer-documents
CREATE POLICY "Staff full control customer-documents" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'customer-documents');
-- Customers can insert their own documents (via signed URL logic normally handled by API layer authenticated context)
CREATE POLICY "Customers can insert own documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'customer-documents');


-- 2. ROW LEVEL SECURITY (RLS) ENABLEMENT --
ALTER TABLE staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;


-- 3. RLS POLICIES --

-- For now, to ensure the admin panel functions seamlessly before strict role integration is mapped in Phase 6, 
-- we allow authenticated users (staff) to manage CRM data.
-- Public (anon) is strictly blocked from reading or writing these tables.

CREATE POLICY "Staff access staff_attendance" ON staff_attendance FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff access lead_activities" ON lead_activities FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff access customer_communications" ON customer_communications FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff access reminders" ON reminders FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff access expenses" ON expenses FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff access vendor_payouts" ON vendor_payouts FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff access driver_payouts" ON driver_payouts FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff access refunds" ON refunds FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff access driver_documents" ON driver_documents FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff access vehicle_documents" ON vehicle_documents FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff access customer_documents" ON customer_documents FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff access notifications" ON notifications FOR ALL TO authenticated USING (true);
