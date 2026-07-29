# PHASE 3 PRE-MIGRATION VALIDATION REPORT

This document satisfies the final 12-point pre-migration validation required before applying any Phase 3 database changes.

## 1. EXISTING TABLE VERIFICATION
I have audited the exact production schema via migrations `001` through `018`.
- **Auth/RBAC (`user_profiles`, `roles`, `permissions`, `user_roles`, `role_permissions`, `audit_logs`)**: Fully mapped. Primary keys are UUIDs. Foreign keys strictly cascade. RLS is currently set to `authenticated USING (true)`. **Will NOT alter existing tables**, but will add a new `staff_attendance` table.
- **Fleet & Partners (`vendors`, `drivers`, `actual_fleet`)**: Basic profiles exist. No document storage structure exists. **Will NOT alter existing rows.**
- **CRM (`customers`, `enquiries`, `quotations`)**: `customers` tracks name/phone/email. `enquiries` tracks trip details. **Will EXTEND `enquiries` additively.**
- **Operations (`bookings`, `fleet_assignments`, `fare_snapshots`, `invoices`, `payments`)**: `bookings` uses `booking_status_enum`. `fare_snapshots` uses `breakdown_json`. **Will EXTEND additively.**
- **Core Production Fares/Routes (`pricing_*`, `locations`, `routes`, `vehicle_*`)**: Production critical. **[D. DO NOT TOUCH]**

## 2. DRIVER DOCUMENTS — IMPORTANT
**Audit Finding**: The `drivers` table currently only has a `license_number` (VARCHAR). `actual_fleet` has `registration_number` and `chassis_number`. There is a storage bucket `fleet-documents`, but no table links files to drivers/vehicles with expiry tracking.
**Why a New Table is Required**: A single driver has multiple documents (DL, Police Verification, Badge). A single vehicle has multiple documents (RC, Insurance, Permit, Fitness, PUC). Since each document has an independent `expiry_date`, a normalized `driver_documents` and `vehicle_documents` table is structurally superior to adding 10-15 nullable columns to `drivers` and `actual_fleet`. It prevents schema bloat and allows automated expiry notifications.

## 3. CUSTOMER DOCUMENTS
**Audit Finding**: No existing table or storage bucket supports customer documents (Aadhaar/PAN).
**Proposal**: Create a new private Supabase Storage bucket named `customer-documents`. Ensure strict RLS where public cannot read. Create a `customer_documents` table to map file UUIDs to `customer_id`. 

## 4. RLS VALIDATION
**Existing RLS**: The current `015_rls_policies.sql` grants full access to `authenticated` users via `USING (true)`.
**Phase 3 RLS**: We will NOT break existing staff access, but for the **new CRM and Finance tables**, we will use strict role-based policies. Example: Only `role_code = 'ACCOUNTS'` or `'SUPER_ADMIN'` can access `vendor_payouts` and `expenses`. Public users will strictly be denied access to all new CRM tables.

## 5. EXISTING PUBLIC FUNCTIONALITY
**Validation**: The `PublicFareWidget`, route lookup, and pricing APIs rely on `pricing_*`, `routes`, `locations`, and `vehicle_*` tables, which have public `SELECT` policies. 
**Action**: We will NOT touch these tables or their RLS policies. The public functionality is 100% insulated.

## 6. BOOKING TABLE VALIDATION
**Existing Enum**: `booking_status_enum` = ('pending', 'confirmed', 'assigned', 'on_trip', 'completed', 'cancelled').
**Validation**: This enum fully supports the required operational lifecycle. We do NOT need to alter the enum.
**Extensions**: We will safely ADD `return_datetime`, `special_instructions`, `internal_notes`, `lead_source`, and `booking_source` as NULLABLE columns to `bookings`. Backward compatibility is guaranteed.

## 7. FARE SNAPSHOT VALIDATION
**Existing Structure**: `fare_snapshots` heavily relies on `breakdown_json`.
**Validation**: We will NOT replace or drop `breakdown_json` as the frontend likely depends on it. 
**Extensions**: We will ADDITIVELY add `base_fare`, `included_km`, `extra_km_rate`, `toll_tax`, `state_tax`, `token_amount`, `balance_amount` as NULLABLE `NUMERIC(12,2)` columns. This preserves backward compatibility while fulfilling the new finance tracking requirements.

## 8. MIGRATION ORDER
1. Add new tables (`lead_activities`, `customer_communications`, `reminders`, `expenses`, `vendor_payouts`, `driver_payouts`, `refunds`, `driver_documents`, `vehicle_documents`, `customer_documents`, `staff_attendance`, `notifications`).
2. Add nullable columns to existing tables (`enquiries`, `bookings`, `fare_snapshots`, `payments`).
3. Add foreign keys and indexes.
4. Configure Storage bucket (`customer-documents`).
5. Apply granular RLS policies on the *new* tables.

## 9. ROLLBACK PLAN
- **Reversible**: All `CREATE TABLE` and `ALTER TABLE ADD COLUMN` statements are fully reversible via `DROP TABLE` and `ALTER TABLE DROP COLUMN`.
- **Irreversible**: None. We are not modifying or deleting any existing rows.

## 10. FINAL MIGRATION PREVIEW
**A. CREATE TABLES**: `lead_activities`, `customer_communications`, `reminders`, `expenses`, `vendor_payouts`, `driver_payouts`, `refunds`, `driver_documents`, `vehicle_documents`, `customer_documents`, `staff_attendance`, `notifications`.
**B. ALTER TABLES**: `enquiries`, `bookings`, `fare_snapshots`, `payments`.
**C. ADD COLUMNS**: 
  - `enquiries`: `lead_source`, `assigned_to`, `expected_conversion_value`.
  - `bookings`: `return_datetime`, `special_instructions`, `internal_notes`, `lead_source`, `booking_source`.
  - `fare_snapshots`: `base_fare`, `included_km`, `extra_km_rate`, etc.
  - `payments`: `payment_method` (expanded enum if needed, or varchar mapping), `payment_type` (token, balance).
**D. CREATE BUCKET**: `customer-documents`.
**E. DO NOT TOUCH**: `pricing_*`, `routes`, `locations`, `vehicle_categories`, `vehicle_variants`, `actual_fleet`.

## 11. PRODUCTION SAFETY CHECK
- [x] No existing production rows will be deleted.
- [x] No existing production pricing will be changed.
- [x] No existing vehicle data will be changed.
- [x] No existing route/location data will be changed.
- [x] No existing PublicFareWidget logic will be broken.
- [x] No existing public website functionality will be removed.
- [x] No Vercel deployment configuration will be changed.
- [x] No GitHub repository configuration will be changed.

## 12. STOP CONDITION
**Status**: PHASE 3A — DATABASE AUDIT & MIGRATION DESIGN: COMPLETED
**Status**: PHASE 3B — DATABASE MIGRATION EXECUTION: PENDING APPROVAL

Awaiting explicit approval: "APPROVE PHASE 3 MIGRATION".
