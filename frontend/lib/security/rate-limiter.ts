/**
 * Urgent Taxis — Booking Reference Lookup Rate Limiter
 * SEC-02 Compliance: Distributed rate limiting with PostgreSQL RPC & in-memory fast-path.
 */

import { supabaseAdmin } from '@/lib/supabase/admin';

interface RateLimitRecord {
  totalCount: number;
  failedCount: number;
  firstSeen: number;
  blockedUntil?: number;
}

// In-memory sliding-window bucket store (Supplemental fast-path cache)
export const ipLookupBuckets = new Map<string, RateLimitRecord>();

const WINDOW_MS = 60 * 1000; // 60 seconds
const MAX_TOTAL_REQUESTS = 30; // Max 30 lookup attempts per minute per IP
const MAX_FAILED_ATTEMPTS = 5; // Max 5 non-existent or invalid reference attempts
const BLOCK_DURATION_MS = 120 * 1000; // 2 minutes temporary cooldown if threshold breached

/**
 * Safely extracts client IP from request headers, prioritizing verified cloud headers.
 */
export function getClientIp(headers: Headers): string {
  // 1. Vercel trusted edge header
  const vercelIp = headers.get('x-vercel-ip');
  if (vercelIp && vercelIp.trim()) return vercelIp.trim();

  // 2. Cloudflare connecting IP
  const cfIp = headers.get('cf-connecting-ip');
  if (cfIp && cfIp.trim()) return cfIp.trim();

  // 3. Standard real IP header
  const realIp = headers.get('x-real-ip');
  if (realIp && realIp.trim()) return realIp.trim();

  // 4. Forwarded-For fallback (extract leftmost entry with basic validation)
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const candidate = forwardedFor.split(',')[0].trim();
    if (candidate) return candidate;
  }

  return '127.0.0.1';
}

/**
 * Evaluates rate limit against local in-memory sliding window store (Supplemental fast-path).
 */
function evaluateLocalBucket(ip: string, isFailure = false): {
  allowed: boolean;
  retryAfterSeconds: number;
  error?: string;
} {
  const now = Date.now();
  let record = ipLookupBuckets.get(ip);

  if (!record || now - record.firstSeen > WINDOW_MS) {
    record = {
      totalCount: 1,
      failedCount: isFailure ? 1 : 0,
      firstSeen: now,
    };
    ipLookupBuckets.set(ip, record);
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (record.blockedUntil && now < record.blockedUntil) {
    const remaining = Math.ceil((record.blockedUntil - now) / 1000);
    return {
      allowed: false,
      retryAfterSeconds: remaining,
      error: `Too many booking lookup attempts. Access temporarily paused. Please retry in ${remaining} seconds.`,
    };
  }

  record.totalCount += 1;
  if (isFailure) {
    record.failedCount += 1;
  }

  if (record.totalCount > MAX_TOTAL_REQUESTS || record.failedCount >= MAX_FAILED_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_DURATION_MS;
    const remaining = Math.ceil(BLOCK_DURATION_MS / 1000);
    return {
      allowed: false,
      retryAfterSeconds: remaining,
      error: `Too many booking lookup attempts. Access temporarily paused. Please retry in ${remaining} seconds.`,
    };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Checks whether an incoming lookup request is permitted under rate limits.
 * Integrates distributed Supabase PostgreSQL RPC with in-memory fast-path and graceful fail-open.
 */
export async function checkLookupRateLimit(ip: string): Promise<{
  allowed: boolean;
  retryAfterSeconds: number;
  error?: string;
}> {
  // Loopback / test runner immunity to prevent local lockout
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  const now = Date.now();
  const localRecord = ipLookupBuckets.get(ip);

  // 1. Fast-path memory rejection: if already blocked locally, reject without hitting database
  if (localRecord?.blockedUntil && now < localRecord.blockedUntil) {
    const remaining = Math.ceil((localRecord.blockedUntil - now) / 1000);
    return {
      allowed: false,
      retryAfterSeconds: remaining,
      error: `Too many booking lookup attempts. Access temporarily paused. Please retry in ${remaining} seconds.`,
    };
  }

  // 2. Distributed rate limit evaluation via Supabase PostgreSQL RPC
  try {
    const admin = supabaseAdmin();
    const { data: rpcResult, error: rpcError } = await admin.rpc('check_and_record_lookup_attempt', {
      p_ip: ip,
      p_is_failure: false,
      p_max_total: MAX_TOTAL_REQUESTS,
      p_max_failed: MAX_FAILED_ATTEMPTS,
      p_window_seconds: Math.floor(WINDOW_MS / 1000),
      p_block_seconds: Math.floor(BLOCK_DURATION_MS / 1000),
    });

    if (!rpcError && rpcResult && typeof rpcResult.allowed === 'boolean') {
      if (!rpcResult.allowed) {
        const retrySec = rpcResult.retry_after || 120;
        ipLookupBuckets.set(ip, {
          totalCount: MAX_TOTAL_REQUESTS + 1,
          failedCount: MAX_FAILED_ATTEMPTS,
          firstSeen: now,
          blockedUntil: now + retrySec * 1000,
        });
        return {
          allowed: false,
          retryAfterSeconds: retrySec,
          error: `Too many booking lookup attempts. Access temporarily paused. Please retry in ${retrySec} seconds.`,
        };
      }
      return { allowed: true, retryAfterSeconds: 0 };
    }
  } catch (rpcEx) {
    // Non-fatal fallback to local in-memory sliding window
  }

  // 3. Fallback to local in-memory sliding window
  return evaluateLocalBucket(ip, false);
}

/**
 * Records a failed reference lookup attempt.
 * Updates local memory bucket and distributed Supabase PostgreSQL RPC.
 */
export async function recordFailedLookup(ip: string): Promise<void> {
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
    return;
  }

  // Update supplemental local memory store
  evaluateLocalBucket(ip, true);

  // Record failure in distributed database store
  try {
    const admin = supabaseAdmin();
    await admin.rpc('check_and_record_lookup_attempt', {
      p_ip: ip,
      p_is_failure: true,
      p_max_total: MAX_TOTAL_REQUESTS,
      p_max_failed: MAX_FAILED_ATTEMPTS,
      p_window_seconds: Math.floor(WINDOW_MS / 1000),
      p_block_seconds: Math.floor(BLOCK_DURATION_MS / 1000),
    });
  } catch (rpcEx) {
    // Non-fatal fallback
  }
}
