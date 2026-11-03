-- 026_distributed_security.sql
-- Urgent Taxis: SEC-02 Distributed Rate Limiting & SEC-04 Atomic Email Deduplication
-- Target: Local / Staging Database Only (Do not apply to production without owner signoff)

-- ============================================================================
-- 1. SEC-04: ATOMIC EMAIL DEDUPLICATION CONSTRAINT
-- ============================================================================

-- Partial unique index ensuring strictly one outbound confirmation email per booking
CREATE UNIQUE INDEX IF NOT EXISTS uq_cust_comms_booking_outbound_email
ON customer_communications (booking_id, channel, direction)
WHERE channel = 'EMAIL' AND direction = 'OUTBOUND' AND booking_id IS NOT NULL;

-- ============================================================================
-- 2. SEC-02: DISTRIBUTED RATE LIMITING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS security_rate_limits (
  client_ip VARCHAR(64) PRIMARY KEY,
  total_count INT NOT NULL DEFAULT 1,
  failed_count INT NOT NULL DEFAULT 0,
  first_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  blocked_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for maintenance cleanup of expired sliding windows
CREATE INDEX IF NOT EXISTS idx_rate_limits_updated ON security_rate_limits(updated_at);

-- Enable Row Level Security (RLS) on rate limits table
ALTER TABLE security_rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow service_role complete administrative control
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Service role manages rate limits' AND tablename = 'security_rate_limits'
  ) THEN
    CREATE POLICY "Service role manages rate limits"
    ON security_rate_limits FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;

-- ============================================================================
-- 3. SEC-02: ATOMIC RATE LIMITER RPC FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION check_and_record_lookup_attempt(
  p_ip VARCHAR(64),
  p_is_failure BOOLEAN DEFAULT false,
  p_max_total INT DEFAULT 30,
  p_max_failed INT DEFAULT 5,
  p_window_seconds INT DEFAULT 60,
  p_block_seconds INT DEFAULT 120
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_now TIMESTAMPTZ := now();
  v_record security_rate_limits%ROWTYPE;
  v_remaining_block INT;
BEGIN
  -- Loopback / development immunity
  IF p_ip IN ('127.0.0.1', '::1', 'localhost') THEN
    RETURN jsonb_build_object('allowed', true, 'retry_after', 0);
  END IF;

  -- Lock row for update to eliminate concurrency race conditions
  SELECT * INTO v_record
  FROM security_rate_limits
  WHERE client_ip = p_ip
  FOR UPDATE;

  -- Check if currently blocked
  IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > v_now THEN
    v_remaining_block := CEIL(EXTRACT(EPOCH FROM (v_record.blocked_until - v_now)));
    RETURN jsonb_build_object('allowed', false, 'retry_after', v_remaining_block);
  END IF;

  -- Window expired or initial request: reset or initialize bucket
  IF v_record.client_ip IS NULL OR (v_now - v_record.first_seen) > (p_window_seconds * interval '1 second') THEN
    INSERT INTO security_rate_limits (client_ip, total_count, failed_count, first_seen, blocked_until, updated_at)
    VALUES (
      p_ip,
      1,
      CASE WHEN p_is_failure THEN 1 ELSE 0 END,
      v_now,
      NULL,
      v_now
    )
    ON CONFLICT (client_ip) DO UPDATE SET
      total_count = 1,
      failed_count = CASE WHEN p_is_failure THEN 1 ELSE 0 END,
      first_seen = v_now,
      blocked_until = NULL,
      updated_at = v_now;

    RETURN jsonb_build_object('allowed', true, 'retry_after', 0);
  END IF;

  -- Window active: increment attempt counters
  v_record.total_count := v_record.total_count + 1;
  IF p_is_failure THEN
    v_record.failed_count := v_record.failed_count + 1;
  END IF;

  -- Check if rate threshold exceeded
  IF v_record.total_count > p_max_total OR v_record.failed_count >= p_max_failed THEN
    v_record.blocked_until := v_now + (p_block_seconds * interval '1 second');
    
    UPDATE security_rate_limits
    SET total_count = v_record.total_count,
        failed_count = v_record.failed_count,
        blocked_until = v_record.blocked_until,
        updated_at = v_now
    WHERE client_ip = p_ip;

    RETURN jsonb_build_object('allowed', false, 'retry_after', p_block_seconds);
  END IF;

  -- Within normal limits: update and allow
  UPDATE security_rate_limits
  SET total_count = v_record.total_count,
      failed_count = v_record.failed_count,
      updated_at = v_now
  WHERE client_ip = p_ip;

  RETURN jsonb_build_object('allowed', true, 'retry_after', 0);
END;
$$;

-- Restrict RPC execution permissions strictly to service_role
REVOKE ALL ON FUNCTION check_and_record_lookup_attempt(VARCHAR, BOOLEAN, INT, INT, INT, INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION check_and_record_lookup_attempt(VARCHAR, BOOLEAN, INT, INT, INT, INT) FROM anon;
REVOKE ALL ON FUNCTION check_and_record_lookup_attempt(VARCHAR, BOOLEAN, INT, INT, INT, INT) FROM authenticated;
GRANT EXECUTE ON FUNCTION check_and_record_lookup_attempt(VARCHAR, BOOLEAN, INT, INT, INT, INT) TO service_role;
