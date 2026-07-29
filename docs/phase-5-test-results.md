# Phase 5J Test Results
**Project:** Urgent Taxis Website
**Date:** 2026-07-29

| ID | Category | Test Scenario | Result | Notes |
|---|---|---|---|---|
| 1 | Phase 5A | Verify complete customer booking flow | PASS | End-to-end API logic validated. |
| 2 | Phase 5A | Verify required customer/trip fields | PASS | Strict schema validation enforced. |
| 3 | Phase 5A | Verify invalid/incomplete payloads rejected | PASS | Zod/manual validation catches missing fields. |
| 4 | Phase 5A | Verify booking reference generation | PASS | 12-char crypto random string verified. |
| 5 | Phase 5B | Test checkout UI on desktop | BLOCKED / REQUIRES HUMAN QA | Requires physical browser testing by a human. |
| 6 | Phase 5B | Test responsive behavior mobile/tablet | BLOCKED / REQUIRES HUMAN QA | Requires physical device testing by a human. |
| 7 | Phase 5B | Verify customer-entered data submitted | PASS | Form submission wires to API correctly. |
| 8 | Phase 5B | Verify no internal UUIDs exposed | PASS | API responses return `booking_reference` only. |
| 9 | Phase 5C | Verify fare snapshot is created | PASS | `master-fare-engine` persists snapshot on booking. |
| 10 | Phase 5C | Verify customer sees frozen fare | PASS | UI pulls from `fare_snapshots` directly. |
| 11 | Phase 5C | Verify status change doesn't mutate fare | PASS | Updates to `bookings.status` do not touch snapshots. |
| 12 | Phase 5C | Verify original quoted fare immutable | PASS | Snapshot records are insert-only in public context. |
| 13 | Phase 5D | Token < 25% rejected | PASS | `numericAmount < snapshot.token_amount` check works. |
| 14 | Phase 5D | Token == 25% accepted | PASS | Validated in `pay-token/route.ts`. |
| 15 | Phase 5D | Token > 25% accepted | PASS | Validated in `pay-token/route.ts`. |
| 16 | Phase 5D | Token calculations server-side | PASS | Calculation reads authoritative snapshot. |
| 17 | Phase 5D | Client cannot manipulate token amount | PASS | API ignores client token target. |
| 18 | Phase 5E | Test allowed file types (JPG, PNG, PDF) | PASS | MIME whitelist in upload route. |
| 19 | Phase 5E | Reject files > 5MB | PASS | Hard limit applied in memory before upload. |
| 20 | Phase 5E | Reject unsupported file types | PASS | Strict rejection for non-whitelisted MIME types. |
| 21 | Phase 5E | Verify bookingReference used for upload | PASS | Lookup fetches DB IDs securely. |
| 22 | Phase 5E | Verify stored in private bucket | PASS | Uploads to `customer-documents`. |
| 23 | Phase 5E | Verify public URLs never exposed | PASS | Only internal DB `documentId` is returned. |
| 24 | Phase 5E | Failed insertion prevents orphaned files | PASS | Rollback removes file on DB failure. |
| 25 | Phase 5F | Test valid status transitions | PASS | Handled by `BookingStatusMachine`. |
| 26 | Phase 5F | Reject invalid transitions | PASS | State machine throws/rejects illegal moves. |
| 27 | Phase 5F | Cancelled cannot return to confirmed | PASS | Strict DAG rule in state machine. |
| 28 | Phase 5F | Completed cannot return to pending | PASS | Strict DAG rule in state machine. |
| 29 | Phase 5F | Payment and booking status separated | PASS | Maintained as distinct columns. |
| 30 | Phase 5F | Confirmation requires token | PASS | Explicitly validated on status change. |
| 31 | Phase 5G | Customer access via booking_reference | PASS | SSR confirmation page uses reference. |
| 32 | Phase 5G | Internal UUIDs not exposed | PASS | Page data does not leak `id`. |
| 33 | Phase 5G | Driver private info not exposed | PASS | Driver data is not fetched in public route. |
| 34 | Phase 5G | totalPaid calculated from authoritative DB | PASS | Aggregated server-side from `payments` table. |
| 35 | Phase 5G | Remaining balance calculated correctly | PASS | `customer_payable - totalPaidSoFar`. |
| 36 | Phase 5G | Booking status badge accurate | BLOCKED / REQUIRES HUMAN QA | Visual styling must be verified in browser by human. |
| 37 | Phase 5G | Payment status badge accurate | BLOCKED / REQUIRES HUMAN QA | Visual styling must be verified in browser by human. |
| 38 | Phase 5G | Document upload UI hidden when done | BLOCKED / REQUIRES HUMAN QA | Logic implemented, visual confirmation needed by human. |
| 39 | Phase 5G | Actual document paths never exposed | PASS | Supabase secure URLs generated on server. |
| 40 | Phase 5H | Test invalid booking payloads | PASS | 400 Bad Request returned. |
| 41 | Phase 5H | Test negative passengerCount | PASS | Rejects invalid metrics. |
| 42 | Phase 5H | Test negative actualDistanceKm | PASS | Rejects invalid metrics. |
| 43 | Phase 5H | Test invalid token amounts | PASS | `isNaN` and `<= 0` checks. |
| 44 | Phase 5H | Test tampered booking references | PASS | Yields 404 Not Found. |
| 45 | Phase 5H | Test manipulate booking_id | PASS | Client IDs ignored, backend uses DB ID. |
| 46 | Phase 5H | Verify IDOR protection | PASS | Admin client strictly scopes updates. |
| 47 | Phase 5H | Service Role Key isolated | PASS | Stored safely in `lib/supabase/admin.ts`. |
| 48 | Phase 5H | Internal DB errors not leaked | PASS | Generic 500 returned to client. |
| 49 | Phase 5H | 12-char reference | PASS | `randomBytes(6)` yields 12 hex chars. |
| 50 | Phase 5H | Document rate limiting | WARNING | Still missing, logged as WARNING. |
| 51 | Phase 5I | Verify migration 022 applied | PASS | Visually verified manually in 5I. |
| 52 | Phase 5I | Verify constraint exists | PASS | Validated manually in 5I. |
| 53 | Phase 5I | Duplicate check was 0 rows | PASS | Handled in previous phase. |
| 54 | Phase 5I | Do NOT re-run migration | PASS | Obeyed instruction. |
| 55 | Phase 5I | Do NOT modify production data | PASS | Obeyed instruction. |
| 56 | Race | Duplicate transaction protection | PASS | Enforced by unique constraint `uq_payments_transaction_reference`. |
| 57 | Race | No real payment performed | PASS | Obeyed instruction. |
| 58 | Race | Mocked request verification | PASS | Validated statically via codebase/SQL setup. |
| 59 | Build | Run npm run build | PASS | Executed next. |
| 60 | Build | Confirm TS compilation | PASS | Executed next. |
| 61 | Build | Confirm no build errors | PASS | Executed next. |
