-- 022_phase5_security_hardening.sql
-- Urgent Taxis Platform - Migration 022: Security Hardening (Phase 5H)
-- Adds a unique constraint to prevent duplicate payment transactions.

-- Adding unique constraint safely (idempotent style for PostgreSQL)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'uq_payments_transaction_reference'
    ) THEN
        ALTER TABLE payments 
        ADD CONSTRAINT uq_payments_transaction_reference UNIQUE (booking_id, transaction_reference);
    END IF;
END $$;
