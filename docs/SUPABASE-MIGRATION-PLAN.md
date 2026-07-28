# Urgent Taxis Platform - Supabase Migration Plan

**Version:** 1.0.0  
**Status:** Approved Migration Blueprint  
**Target Platform:** Supabase / PostgreSQL 15+  

---

## 1. Migration Overview & Sequential Order

The database migrations are organized into 18 sequential SQL files located in `supabase/migrations/`:

| Migration File | Description | Dependencies |
| :--- | :--- | :--- |
| `001_extensions_and_enums.sql` | Enables PostgreSQL extensions (`uuid-ossp`, `btree_gist`) and creates all domain ENUMs (`fuel_type_enum`, `fleet_status_enum`, `display_mode_enum`, `trip_type_enum`, `booking_status_enum`, `payment_status_enum`, `payment_mode_enum`, `location_type_enum`, `adjustment_type_enum`). | None |
| `002_core_users_and_rbac.sql` | Creates `user_profiles`, `roles`, `permissions`, `role_permissions`, and `user_roles` for system RBAC. | `001` |
| `003_vehicle_master_catalog.sql` | Defines `vehicle_categories`, `vehicle_models`, `vehicle_variants`, `amenities`, and `variant_amenities`. | `001`, `002` |
| `004_vendors_drivers_and_fleet.sql` | Defines `vendors`, `drivers`, and `actual_fleet` (`registration_number` is explicitly `NULLABLE`). | `001`, `003` |
| `005_locations_and_routes.sql` | Defines `locations` (cities, airports) and `routes` (origin-destination outstation corridors). | `001` |
| `006_pricing_engine.sql` | Defines 4-tier pricing structures: `pricing_one_way`, `pricing_round_trip`, `pricing_local_packages`, and `pricing_airport_transfers`. Includes default inclusion/exclusion arrays. | `001`, `003`, `005` |
| `007_dynamic_pricing.sql` | Defines `dynamic_pricing_rules` for surge, peak season, and holiday modifiers with priority resolution. | `001`, `003` |
| `008_customers_and_enquiries.sql` | Defines `customers` and `enquiries` for lead pipeline tracking. | `001` |
| `009_bookings_and_assignments.sql` | Defines `bookings` and `fleet_assignments` (includes operational driver allowance & vendor settlement payout fields). | `001`, `003`, `004`, `008` |
| `010_availability_engine.sql` | Defines `vehicle_unavailability_periods` with PostgreSQL `EXCLUDE USING GIST` temporal range constraints to prevent vehicle double-booking. | `001`, `004`, `009` |
| `011_fare_snapshots_and_overrides.sql` | Defines `fare_snapshots` (`automatic_fare`, `manual_override_fare`, `final_fare`, `override_reason`, and `breakdown_json`). | `001`, `009` |
| `012_quotations_invoices_and_payments.sql` | Defines `quotations`, `invoices`, and `payments` transaction ledger. | `001`, `008`, `009` |
| `013_cms_media_and_seo.sql` | Defines `cms_pages` and `media_assets` for dynamic SEO landing pages and promotional banners. | `001` |
| `014_audit_logs_and_settings.sql` | Defines `system_settings` and immutable `audit_logs` for administrative activity tracking. | `001`, `002` |
| `015_rls_policies.sql` | Enables RLS on all 33 tables and creates granular SELECT/INSERT policies for public users and full management access for staff. | `001`-`014` |
| `016_functions_and_triggers.sql` | Defines automatic `updated_at` triggers and the `calculate_trip_fare(...)` `SECURITY DEFINER` RPC function for secure website quotes. | `001`-`015` |
| `017_storage_buckets.sql` | Registers Supabase Storage buckets (`vehicle-catalog`, `fleet-documents`, `invoices`, `cms-media`) and sets access policies. | `001` |
| `018_seed_reference_data.sql` | Seeds initial reference data (Roles, Categories, Amenities). Zero fake operational data. | `001`-`003` |

---

## 2. RLS & Security Guardrails Summary

* **Public Users**: Granted `SELECT` access to `vehicle_categories`, `vehicle_models`, `vehicle_variants`, `amenities`, `locations`, `routes`, and `cms_pages`. Granted `INSERT` access to `customers`, `enquiries`, and `bookings`.
* **Public Fare Calculation**: Restricted from reading raw pricing tables directly. Public quotes are generated via `calculate_trip_fare(...)`, a PostgreSQL `SECURITY DEFINER` function with strict input validation and search path isolation (`SET search_path = public, pg_temp`).
* **Authenticated Staff**: Fully authorized via RLS policies checking user authenticated status for administrative operations.

---

## 3. Storage Architecture

* `vehicle-catalog`: Public Read (Promotional catalog vehicle images)
* `cms-media`: Public Read (Website banners, destination photos)
* `fleet-documents`: Private Admin (Driver licenses, RC documents, insurance copies)
* `invoices`: Private Auth (Generated PDF receipts)

---

## 4. How to Apply Migrations

When ready to execute against Supabase:
```bash
npx supabase db push
```
or via the Supabase SQL Editor by executing files `001` through `018` in exact numerical sequence.
