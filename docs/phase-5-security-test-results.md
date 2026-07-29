# Phase 5H Security Test Results
**Project:** Urgent Taxis Website
**Date:** 2026-07-29

| Test Case | Scenario | Expected Behavior | Actual Behavior | Result | Fix/Reference |
| --- | --- | --- | --- | --- | --- |
| **TEST 1** | Attempt booking lookup with invalid/nonexistent booking reference. | No private booking data returned. | Returns "Booking Not Found" UI. | PASS | Handled in `booking-confirmation/[reference]/page.tsx` |
| **TEST 2** | Attempt booking lookup using another booking reference. | Only data permitted by public confirmation flow is returned. | Cannot access private fields without authentication; RLS policies are enforced on customer data. | PASS | RLS Policies |
| **TEST 3** | Submit tampered frontend fare. | Server ignores frontend price and uses `MasterFareEngine`. | `book/route.ts` recalculates fare strictly server-side using rule IDs. | PASS | `book/route.ts` |
| **TEST 4** | Submit negative payment amount. | Rejected. | Validation in `pay-token/route.ts` explicitly rejects amounts <= 0. | PASS | `pay-token/route.ts` |
| **TEST 5** | Submit zero payment amount. | Rejected. | Validation in `pay-token/route.ts` rejects. | PASS | `pay-token/route.ts` |
| **TEST 6** | Submit payment greater than remaining balance. | Rejected. | Validation ensures `numericAmount <= trueRemainingBalance`. | PASS | `pay-token/route.ts` |
| **TEST 7** | Submit first payment below 25% token requirement. | Rejected. | Rejects if `totalPaidSoFar === 0` and `numericAmount < snapshot.token_amount`. | PASS | `pay-token/route.ts` |
| **TEST 8** | Submit duplicate `transaction_reference` for same booking. | Rejected by application/database protection. | Migration `022` unique constraint throws code `23505`, API returns 'Duplicate payment detected'. | PASS | `022_phase5_security_hardening.sql` |
| **TEST 9** | Attempt to submit arbitrary `booking_id`. | Ignored/rejected. | The API creates the booking entirely server-side and does not accept `booking_id` as an input payload. | PASS | `book/route.ts` |
| **TEST 10** | Attempt to submit arbitrary `customer_id`. | Ignored/rejected. | The API resolves customer by phone or creates a new one, ignoring any passed `customer_id`. | PASS | `book/route.ts` |
| **TEST 11** | Upload unsupported file type. | Rejected. | MIME type checked; strictly limits to JPG, PNG, PDF. | PASS | `upload-document/route.ts` |
| **TEST 12** | Upload file larger than 5 MB. | Rejected. | Size validated against `5 * 1024 * 1024`. | PASS | `upload-document/route.ts` |
| **TEST 13** | Attempt document upload against another booking. | Rejected. | Must provide valid `bookingReference` linked to the correct `booking_id`. | PASS | `upload-document/route.ts` |
| **TEST 14** | Verify private storage URLs are not exposed. | No public permanent URL returned. | Only returns `documentId` from `customer_documents` DB table. | PASS | `upload-document/route.ts` |
| **TEST 15** | Verify service role key is not included in client bundle. | No `SUPABASE_SERVICE_ROLE_KEY` exposed to browser/client bundle. | Handled via strictly isolated `lib/supabase/admin.ts` file without `NEXT_PUBLIC_` prefix. | PASS | `admin.ts` |
| **TEST 16** | Run `npm run build`. | Zero errors. | Build runs successfully. | PASS | Terminal |
