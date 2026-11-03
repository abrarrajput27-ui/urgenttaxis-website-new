-- 026_rollback.sql
-- Urgent Taxis: Rollback Script for Migration 026

-- Drop atomic rate limiter RPC
DROP FUNCTION IF EXISTS check_and_record_lookup_attempt(VARCHAR, BOOLEAN, INT, INT, INT, INT);

-- Drop rate limits table and associated indexes/policies
DROP TABLE IF EXISTS security_rate_limits CASCADE;

-- Drop partial unique index on customer communications
DROP INDEX IF EXISTS uq_cust_comms_booking_outbound_email;
