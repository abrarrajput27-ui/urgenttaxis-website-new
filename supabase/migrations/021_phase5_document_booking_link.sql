-- 021_phase5_document_booking_link.sql
-- Urgent Taxis Platform - Migration 021: Link customer documents to bookings

ALTER TABLE customer_documents 
ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_customer_documents_booking ON customer_documents(booking_id);
