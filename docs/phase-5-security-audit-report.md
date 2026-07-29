# Phase 5H Security Audit Report
**Project:** Urgent Taxis Website
**Date:** 2026-07-29

## A. Executive Summary
A comprehensive security audit of the public customer booking APIs was performed. Several critical issues related to Row Level Security (RLS) policies blocking server-side operations using the anon key were discovered and fixed by implementing a secure server-only `supabaseAdmin` client. Booking reference entropy was increased to prevent brute-forcing, and race conditions in payments were mitigated.

## B. Scope
- `POST /api/public/book`
- `POST /api/public/pay-token`
- `POST /api/public/upload-document`
- Booking confirmation flow

## C. APIs Audited
- `/api/public/calculate-fare` (PASS - No sensitive PII or DB updates)
- `/api/public/book` (FIXED - Increased reference entropy, strict numeric validation, switched to `supabaseAdmin`)
- `/api/public/pay-token` (FIXED - Switched to `supabaseAdmin` to allow fetching booking details safely, added unique constraint for double-payment race conditions)
- `/api/public/upload-document` (FIXED - Switched to `supabaseAdmin` to query DB and insert securely)

## D. Security Findings
1. **RLS Bypass for Backend Operations (FIXED):** The public anon key was used for backend updates which would fail due to missing public SELECT/UPDATE policies on `bookings` and `payments`. We created `admin.ts` to perform these operations using `SUPABASE_SERVICE_ROLE_KEY`.
2. **Booking Reference Entropy (FIXED):** References were only 6 hex chars (e.g. `UT-A1B2C3`), making them susceptible to enumeration. Fixed by increasing to 12 hex chars (`UT-` + `randomBytes(6)`).
3. **Double Payment Race Condition (FIXED):** Implemented a non-destructive database migration (`022_phase5_security_hardening.sql`) to add a unique constraint on `(booking_id, transaction_reference)` preventing duplicate payments.
4. **Input Validation (FIXED):** Added strict server-side validation for `passengerCount` and `actualDistanceKm` in `/api/public/book`.

## E. Supabase/RLS Findings
The existing RLS correctly prevented public reads of sensitive data (PASS). By using `supabaseAdmin`, we adhered to the architecture without weakening RLS.

## F. Service Role Security
(PASS) - `admin.ts` was securely created as a server-only utility. The key `SUPABASE_SERVICE_ROLE_KEY` is not exposed in `NEXT_PUBLIC_*` variables.

## G. Booking Reference Security
(FIXED) - Entropy increased from 16 million possibilities to 281 trillion possibilities (6 bytes), making brute-forcing statistically impossible within reasonable rate limits.

## H. Payment Security
(FIXED) - Token validation is strictly enforced server-side. Duplicate payment protection is applied via unique constraint.

## I. Document Upload Security
(PASS) - MIME types are validated, files are strictly partitioned by `customer_id/booking_id/uniqueFileName`, and no public URLs are returned.

## J. IDOR Protection
(PASS) - Access to booking actions via public API requires an unguessable booking reference. Arbitrary `booking_id` manipulation in payloads is ignored by the server.

## K. Error Handling
(PASS) - Internal Supabase errors are console logged on the server and generic messages are returned to the client.

## L. Rate Limiting
(WARNING / HARDENING RECOMMENDED) - The system currently lacks API rate limiting (e.g., via Upstash Redis or Vercel Edge rate limiters) on `/api/public/book` and `/api/public/pay-token`. This should be implemented before full production deployment to prevent abuse.

## M. Database Migration
Created `022_phase5_security_hardening.sql` safely using an idempotent `DO $$` block to add `uq_payments_transaction_reference`.

## N. Remaining Recommendations
- Implement IP-based rate limiting on all public API routes.

## O. Final Phase 5H Security Status
**COMPLETED.** All blocking issues have been resolved.
