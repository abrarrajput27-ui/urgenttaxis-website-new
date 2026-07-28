-- 017_storage_buckets.sql
-- Urgent Taxis Platform - Migration 017: Supabase Storage Buckets & Access Policies

INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('vehicle-catalog', 'vehicle-catalog', true),
  ('fleet-documents', 'fleet-documents', false),
  ('invoices', 'invoices', false),
  ('cms-media', 'cms-media', true)
ON CONFLICT (id) DO NOTHING;

-- Public Storage Access Policies
CREATE POLICY "Public read on vehicle-catalog" ON storage.objects FOR SELECT USING (bucket_id = 'vehicle-catalog');
CREATE POLICY "Public read on cms-media" ON storage.objects FOR SELECT USING (bucket_id = 'cms-media');

-- Authenticated Staff Storage Policies
CREATE POLICY "Staff full control vehicle-catalog" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'vehicle-catalog');
CREATE POLICY "Staff full control fleet-documents" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'fleet-documents');
CREATE POLICY "Staff full control invoices" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'invoices');
CREATE POLICY "Staff full control cms-media" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'cms-media');
