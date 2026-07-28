# Urgent Taxis Platform - Database Schema Blueprint

**Version:** 1.0.0  
**Status:** Approved Database Architecture Blueprint  
**Target Platform:** Supabase / PostgreSQL 15+  
**Primary Architecture Principle:** Strict separation of Master Data, Operational Data, and Immutable Transactional Snapshots.

---

## Table of Contents
1. [Executive Summary & Database Principles](#1-executive-summary--database-principles)
2. [ERD Relationship Map](#2-erd-relationship-map)
3. [Domain 1: Users, Roles & Permissions](#domain-1-users-roles--permissions)
4. [Domain 2: Vehicle Master Catalog](#domain-2-vehicle-master-catalog)
5. [Domain 3: Actual Fleet & Operations](#domain-3-actual-fleet--operations)
6. [Domain 4: Availability & Scheduling Engine](#domain-4-availability--scheduling-engine)
7. [Domain 5: Drivers & Vendors](#domain-5-drivers--vendors)
8. [Domain 6: Locations & Routes](#domain-6-locations--routes)
9. [Domain 7: Core Pricing Engine](#domain-7-core-pricing-engine)
10. [Domain 8: Dynamic Pricing Rules](#domain-8-dynamic-pricing-rules)
11. [Domain 9: Customers & Enquiries](#domain-9-customers--enquiries)
12. [Domain 10: Bookings & Vehicle Assignments](#domain-10-bookings--vehicle-assignments)
13. [Domain 11: Immutable Fare Snapshots & Manual Overrides](#domain-11-immutable-fare-snapshots--manual-overrides)
14. [Domain 12: Quotations, Invoices & Payments](#domain-12-quotations-invoices--payments)
15. [Domain 13: CMS, Media & SEO](#domain-13-cms-media--seo)
16. [Domain 14: Audit Logging & System Settings](#domain-14-audit-logging--system-settings)
17. [Supabase Storage Buckets Architecture](#17-supabase-storage-buckets-architecture)
18. [Row Level Security (RLS) Matrix](#18-row-level-security-rls-matrix)
19. [Recommended Sequential Migration Plan](#19-recommended-sequential-migration-plan)

---

## 1. Executive Summary & Database Principles

This document defines the complete PostgreSQL database schema for the Urgent Taxis platform. It translates the rules of `docs/MASTER-ARCHITECTURE.md` into concrete, normalized, and performant relational schemas.

### Core Database Rules
1. **Separation of Master Catalog & Operational Fleet**: Vehicle models, categories, amenities, and catalog images are decoupled from physical registration numbers. Registration numbers (`registration_number`) are optional (`NULLABLE`) in `actual_fleet`.
2. **Immutable Transactional Fares**: Every booking generates an immutable JSON snapshot of its calculated fare breakdown, preventing future pricing updates from altering historical orders.
3. **Double-Booking Protection**: Enforced using PostgreSQL `EXCLUSION CONSTRAINTS` with `tsrange` across active fleet schedules and confirmed bookings.
4. **UUID Primary Keys**: All tables use `UUID v4` generated via `gen_random_uuid()`.
5. **Precision Standards**: All financial amounts use `NUMERIC(12, 2)`. Distances use `NUMERIC(10, 2)`. Timestamps use `TIMESTAMPTZ`.

---

## 2. ERD Relationship Map

```
┌──────────────────┐       1:N      ┌──────────────────┐       1:N      ┌──────────────────┐
│vehicle_categories├───────────────<│  vehicle_models  ├───────────────<│ vehicle_variants │
└──────────────────┘                └──────────────────┘                └────────┬─────────┘
                                                                                 │ 1:N
                                                                                 ▼
┌──────────────────┐       1:N      ┌──────────────────┐       1:N      ┌──────────────────┐
│     vendors      ├───────────────<│   actual_fleet   ├───────────────<│ fleet_assignments│
└──────────────────┘                └────────┬─────────┘                └────────┬─────────┘
                                             │ 1:N                               │
                                             ▼                                   │
┌──────────────────┐                ┌──────────────────┐                         │ 1:N
│     drivers      ├───────────────<│vehicle_unavail_  │                         │
└──────────────────┘       1:N      │     periods      │                         │
                                    └──────────────────┘                         ▼
┌──────────────────┐       1:N      ┌──────────────────┐       1:1      ┌──────────────────┐
│    customers     ├───────────────<│     bookings     ├───────────────<│  fare_snapshots  │
└────────┬─────────┘                └────────┬─────────┘                └──────────────────┘
         │ 1:N                               │ 1:1
         ▼                                   ▼
┌──────────────────┐                ┌──────────────────┐       1:N      ┌──────────────────┐
│    enquiries     │                │     invoices     ├───────────────<│     payments     │
└──────────────────┘                └──────────────────┘                └──────────────────┘
```

---

## Domain 1: Users, Roles & Permissions

### Table 1.1: `user_profiles`
Extends `auth.users` with administrative profile attributes.

| Column | Type | Nullable | Default | Constraints / References |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | No | - | PK, FK to `auth.users(id)` ON DELETE CASCADE |
| `full_name` | VARCHAR(255) | No | - | - |
| `email` | VARCHAR(255) | No | - | Unique |
| `phone` | VARCHAR(50) | Yes | NULL | - |
| `is_active` | BOOLEAN | No | `true` | - |
| `created_at` | TIMESTAMPTZ | No | `now()` | - |
| `updated_at` | TIMESTAMPTZ | No | `now()` | - |

### Table 1.2: `roles`
System roles for RBAC control.

| Column | Type | Nullable | Default | Constraints / References |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | No | `gen_random_uuid()` | PK |
| `role_code` | VARCHAR(50) | No | - | Unique (e.g. `super_admin`, `fleet_manager`, `dispatcher`, `billing_clerk`, `content_manager`) |
| `description` | TEXT | Yes | NULL | - |
| `created_at` | TIMESTAMPTZ | No | `now()` | - |

### Table 1.3: `user_roles`
Junction mapping users to system roles.

| Column | Type | Nullable | Default | Constraints / References |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | No | `gen_random_uuid()` | PK |
| `user_id` | UUID | No | - | FK to `user_profiles(id)` ON DELETE CASCADE |
| `role_id` | UUID | No | - | FK to `roles(id)` ON DELETE CASCADE |
| `created_at` | TIMESTAMPTZ | No | `now()` | Unique(`user_id`, `role_id`) |

---

## Domain 2: Vehicle Master Catalog

### Table 2.1: `vehicle_categories`
High-level vehicle classification (e.g., Sedan, SUV, Hatchback, Executive).

| Column | Type | Nullable | Default | Constraints / References |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | No | `gen_random_uuid()` | PK |
| `name` | VARCHAR(100) | No | - | Unique |
| `slug` | VARCHAR(100) | No | - | Unique |
| `description` | TEXT | Yes | NULL | - |
| `display_order` | INT | No | `0` | - |
| `is_active` | BOOLEAN | No | `true` | - |
| `created_at` | TIMESTAMPTZ | No | `now()` | - |
| `updated_at` | TIMESTAMPTZ | No | `now()` | - |

### Table 2.2: `vehicle_models`
Make & Model definitions (e.g., Maruti Dzire, Toyota Innova Crysta).

| Column | Type | Nullable | Default | Constraints / References |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | No | `gen_random_uuid()` | PK |
| `category_id` | UUID | No | - | FK to `vehicle_categories(id)` ON DELETE RESTRICT |
| `brand_name` | VARCHAR(100) | No | - | - |
| `model_name` | VARCHAR(100) | No | - | Unique(`brand_name`, `model_name`) |
| `slug` | VARCHAR(120) | No | - | Unique |
| `master_image_url` | TEXT | Yes | NULL | - |
| `is_active` | BOOLEAN | No | `true` | - |
| `created_at` | TIMESTAMPTZ | No | `now()` | - |

### Table 2.3: `vehicle_variants`
Specific trim/configuration including capacity and fuel type.

| Column | Type | Nullable | Default | Constraints / References |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | No | `gen_random_uuid()` | PK |
| `model_id` | UUID | No | - | FK to `vehicle_models(id)` ON DELETE RESTRICT |
| `variant_name` | VARCHAR(100) | No | - | - |
| `fuel_type` | VARCHAR(50) | No | - | CHECK (`fuel_type` IN ('Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid', 'Other')) |
| `seating_capacity` | INT | No | `4` | CHECK (`seating_capacity` > 0) |
| `luggage_capacity_large` | INT | No | `2` | CHECK (`luggage_capacity_large` >= 0) |
| `is_active` | BOOLEAN | No | `true` | - |
| `created_at` | TIMESTAMPTZ | No | `now()` | - |

### Table 2.4: `amenities`
Manageable vehicle features (e.g., AC, Music System, Charging Port).

| Column | Type | Nullable | Default | Constraints / References |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | No | `gen_random_uuid()` | PK |
| `name` | VARCHAR(100) | No | - | Unique |
| `icon_name` | VARCHAR(50) | Yes | NULL | - |
| `is_active` | BOOLEAN | No | `true` | - |

### Table 2.5: `variant_amenities`
Junction table linking variants to amenities.

| Column | Type | Nullable | Default | Constraints / References |
| :--- | :--- | :--- | :--- | :--- |
| `variant_id` | UUID | No | - | FK to `vehicle_variants(id)` ON DELETE CASCADE |
| `amenity_id` | UUID | No | - | FK to `amenities(id)` ON DELETE CASCADE |
| Primary Key | - | - | - | PK (`variant_id`, `amenity_id`) |

---

## Domain 3: Actual Fleet & Operations

### Table 3.1: `actual_fleet`
Physical operational vehicles on the road.

| Column | Type | Nullable | Default | Constraints / References |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | No | `gen_random_uuid()` | PK |
| `variant_id` | UUID | No | - | FK to `vehicle_variants(id)` ON DELETE RESTRICT |
| `registration_number` | VARCHAR(50) | **Yes** | **NULL** | **Optional per core business rules** |
| `chassis_number` | VARCHAR(100) | Yes | NULL | - |
| `vendor_id` | UUID | Yes | NULL | FK to `vendors(id)` ON DELETE SET NULL |
| `status` | VARCHAR(50) | No | `'available'` | CHECK (`status` IN ('available', 'booked', 'on_trip', 'maintenance', 'blocked', 'inactive')) |
| `is_active` | BOOLEAN | No | `true` | - |
| `created_at` | TIMESTAMPTZ | No | `now()` | - |
| `updated_at` | TIMESTAMPTZ | No | `now()` | - |

---

## Domain 4: Availability & Scheduling Engine

### Table 4.1: `vehicle_unavailability_periods`
Tracks maintenance, blocked windows, and trip schedules to prevent double-booking.

| Column | Type | Nullable | Default | Constraints / References |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | No | `gen_random_uuid()` | PK |
| `fleet_id` | UUID | No | - | FK to `actual_fleet(id)` ON DELETE CASCADE |
| `booking_id` | UUID | Yes | NULL | FK to `bookings(id)` ON DELETE CASCADE |
| `start_time` | TIMESTAMPTZ | No | - | - |
| `end_time` | TIMESTAMPTZ | No | - | CHECK (`end_time` > `start_time`) |
| `reason` | VARCHAR(100) | No | - | CHECK (`reason` IN ('booking', 'maintenance', 'admin_block', 'other')) |
| `notes` | TEXT | Yes | NULL | - |
| `created_at` | TIMESTAMPTZ | No | `now()` | - |

---

## Domain 5: Drivers & Vendors

### Table 5.1: `drivers`
Driver operational profiles.

| Column | Type | Nullable | Default | Constraints / References |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | No | `gen_random_uuid()` | PK |
| `full_name` | VARCHAR(255) | No | - | - |
| `phone` | VARCHAR(50) | No | - | Unique |
| `license_number` | VARCHAR(100) | No | - | Unique |
| `is_active` | BOOLEAN | No | `true` | - |
| `created_at` | TIMESTAMPTZ | No | `now()` | - |

### Table 5.2: `vendors`
Partner fleet providers.

| Column | Type | Nullable | Default | Constraints / References |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | No | `gen_random_uuid()` | PK |
| `company_name` | VARCHAR(255) | No | - | - |
| `contact_person` | VARCHAR(255) | No | - | - |
| `phone` | VARCHAR(50) | No | - | Unique |
| `is_active` | BOOLEAN | No | `true` | - |

---

## Domain 6: Locations & Routes

### Table 6.1: `locations`
Cities, airports, and major hubs.

| Column | Type | Nullable | Default | Constraints / References |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | No | `gen_random_uuid()` | PK |
| `name` | VARCHAR(150) | No | - | - |
| `city` | VARCHAR(100) | No | - | - |
| `state` | VARCHAR(100) | No | - | - |
| `location_type` | VARCHAR(50) | No | `'city'` | CHECK (`location_type` IN ('city', 'airport', 'railway_station', 'hub')) |
| `is_active` | BOOLEAN | No | `true` | - |

### Table 6.2: `routes`
Predefined point-to-point outstation corridors.

| Column | Type | Nullable | Default | Constraints / References |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | No | `gen_random_uuid()` | PK |
| `origin_location_id` | UUID | No | - | FK to `locations(id)` ON DELETE RESTRICT |
| `destination_location_id` | UUID | No | - | FK to `locations(id)` ON DELETE RESTRICT |
| `estimated_distance_km` | NUMERIC(10, 2) | No | - | CHECK (`estimated_distance_km` > 0) |
| `estimated_duration_minutes` | INT | Yes | NULL | - |
| `is_active` | BOOLEAN | No | `true` | Unique(`origin_location_id`, `destination_location_id`) |

---

## Domain 7: Core Pricing Engine

### Table 7.1: `pricing_one_way`
One-way tariff matrices.

| Column | Type | Nullable | Default | Constraints / References |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | No | `gen_random_uuid()` | PK |
| `route_id` | UUID | No | - | FK to `routes(id)` ON DELETE CASCADE |
| `category_id` | UUID | No | - | FK to `vehicle_categories(id)` ON DELETE CASCADE |
| `base_fare` | NUMERIC(12, 2) | No | - | CHECK (`base_fare` >= 0) |
| `included_km` | NUMERIC(10, 2) | No | - | CHECK (`included_km` >= 0) |
| `extra_km_rate` | NUMERIC(12, 2) | No | - | CHECK (`extra_km_rate` >= 0) |
| `driver_allowance` | NUMERIC(12, 2) | No | `0.00` | - |
| `is_active` | BOOLEAN | No | `true` | Unique(`route_id`, `category_id`) |

### Table 7.2: `pricing_round_trip`
Round-trip daily tariff rules.

| Column | Type | Nullable | Default | Constraints / References |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | No | `gen_random_uuid()` | PK |
| `category_id` | UUID | No | - | FK to `vehicle_categories(id)` ON DELETE CASCADE |
| `min_km_per_day` | NUMERIC(10, 2) | No | `250.00` | CHECK (`min_km_per_day` > 0) |
| `per_km_rate` | NUMERIC(12, 2) | No | - | CHECK (`per_km_rate` >= 0) |
| `driver_allowance_per_day` | NUMERIC(12, 2) | No | - | CHECK (`driver_allowance_per_day` >= 0) |
| `night_halt_charge` | NUMERIC(12, 2) | No | `0.00` | - |
| `is_active` | BOOLEAN | No | `true` | Unique(`category_id`) |

### Table 7.3: `pricing_local_packages`
Hourly & kilometer local rental slabs.

| Column | Type | Nullable | Default | Constraints / References |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | No | `gen_random_uuid()` | PK |
| `category_id` | UUID | No | - | FK to `vehicle_categories(id)` ON DELETE CASCADE |
| `package_name` | VARCHAR(100) | No | - | E.g. "8 Hours / 80 KM" |
| `included_hours` | INT | No | - | CHECK (`included_hours` > 0) |
| `included_km` | NUMERIC(10, 2) | No | - | CHECK (`included_km` > 0) |
| `package_price` | NUMERIC(12, 2) | No | - | CHECK (`package_price` >= 0) |
| `extra_hour_rate` | NUMERIC(12, 2) | No | - | CHECK (`extra_hour_rate` >= 0) |
| `extra_km_rate` | NUMERIC(12, 2) | No | - | CHECK (`extra_km_rate` >= 0) |
| `is_active` | BOOLEAN | No | `true` | - |

### Table 7.4: `pricing_airport_transfers`
Airport pickup/drop fixed tariffs.

| Column | Type | Nullable | Default | Constraints / References |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | No | `gen_random_uuid()` | PK |
| `airport_location_id` | UUID | No | - | FK to `locations(id)` ON DELETE CASCADE |
| `city_zone_location_id` | UUID | No | - | FK to `locations(id)` ON DELETE CASCADE |
| `category_id` | UUID | No | - | FK to `vehicle_categories(id)` ON DELETE CASCADE |
| `base_fare` | NUMERIC(12, 2) | No | - | CHECK (`base_fare` >= 0) |
| `included_km` | NUMERIC(10, 2) | No | - | - |
| `is_active` | BOOLEAN | No | `true` | - |

---

## Domain 8: Dynamic Pricing Rules

### Table 8.1: `dynamic_pricing_rules`
Surge, holiday, and demand pricing modifiers.

| Column | Type | Nullable | Default | Constraints / References |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | No | `gen_random_uuid()` | PK |
| `rule_name` | VARCHAR(150) | No | - | - |
| `trip_type` | VARCHAR(50) | Yes | NULL | CHECK (`trip_type` IN ('one_way', 'round_trip', 'local', 'airport', 'all')) |
| `start_date` | DATE | Yes | NULL | - |
| `end_date` | DATE | Yes | NULL | - |
| `adjustment_type` | VARCHAR(50) | No | - | CHECK (`adjustment_type` IN ('percentage', 'fixed_amount')) |
| `adjustment_value` | NUMERIC(10, 2) | No | - | - |
| `priority` | INT | No | `10` | Higher values resolved first |
| `is_active` | BOOLEAN | No | `true` | - |

---

## Domain 9: Customers & Enquiries

### Table 9.1: `customers`
Registered or guest customer identities.

| Column | Type | Nullable | Default | Constraints / References |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | No | `gen_random_uuid()` | PK |
| `full_name` | VARCHAR(255) | No | - | - |
| `phone` | VARCHAR(50) | No | - | Unique |
| `email` | VARCHAR(255) | Yes | NULL | - |
| `created_at` | TIMESTAMPTZ | No | `now()` | - |

### Table 9.2: `enquiries`
Lead tracking before booking conversion.

| Column | Type | Nullable | Default | Constraints / References |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | No | `gen_random_uuid()` | PK |
| `customer_id` | UUID | Yes | NULL | FK to `customers(id)` ON DELETE SET NULL |
| `trip_type` | VARCHAR(50) | No | - | - |
| `pickup_address` | TEXT | No | - | - |
| `drop_address` | TEXT | Yes | NULL | - |
| `travel_date` | TIMESTAMPTZ | No | - | - |
| `status` | VARCHAR(50) | No | `'new'` | CHECK (`status` IN ('new', 'contacted', 'converted', 'closed')) |
| `created_at` | TIMESTAMPTZ | No | `now()` | - |

---

## Domain 10: Bookings & Vehicle Assignments

### Table 10.1: `bookings`
Core customer orders.

| Column | Type | Nullable | Default | Constraints / References |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | No | `gen_random_uuid()` | PK |
| `booking_reference` | VARCHAR(50) | No | - | Unique (e.g. `UT-2026-8941`) |
| `customer_id` | UUID | No | - | FK to `customers(id)` ON DELETE RESTRICT |
| `category_id` | UUID | No | - | FK to `vehicle_categories(id)` ON DELETE RESTRICT |
| `trip_type` | VARCHAR(50) | No | - | CHECK (`trip_type` IN ('one_way', 'round_trip', 'local', 'airport')) |
| `pickup_address` | TEXT | No | - | - |
| `drop_address` | TEXT | Yes | NULL | - |
| `pickup_datetime` | TIMESTAMPTZ | No | - | - |
| `passenger_count` | INT | No | `1` | - |
| `status` | VARCHAR(50) | No | `'pending'` | CHECK (`status` IN ('pending', 'confirmed', 'assigned', 'on_trip', 'completed', 'cancelled')) |
| `payment_status` | VARCHAR(50) | No | `'unpaid'` | CHECK (`payment_status` IN ('unpaid', 'partially_paid', 'paid', 'refunded')) |
| `created_at` | TIMESTAMPTZ | No | `now()` | - |
| `updated_at` | TIMESTAMPTZ | No | `now()` | - |

### Table 10.2: `fleet_assignments`
Maps actual physical vehicles and drivers to a booking.

| Column | Type | Nullable | Default | Constraints / References |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | No | `gen_random_uuid()` | PK |
| `booking_id` | UUID | No | - | FK to `bookings(id)` ON DELETE CASCADE |
| `fleet_id` | UUID | No | - | FK to `actual_fleet(id)` ON DELETE RESTRICT |
| `driver_id` | UUID | No | - | FK to `drivers(id)` ON DELETE RESTRICT |
| `assigned_at` | TIMESTAMPTZ | No | `now()` | - |

---

## Domain 11: Immutable Fare Snapshots & Manual Overrides

### Table 11.1: `fare_snapshots`
Immutable fare details frozen at booking creation.

| Column | Type | Nullable | Default | Constraints / References |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | No | `gen_random_uuid()` | PK |
| `booking_id` | UUID | No | - | Unique, FK to `bookings(id)` ON DELETE CASCADE |
| `automatic_fare` | NUMERIC(12, 2) | No | - | Calculated rate |
| `manual_override_fare` | NUMERIC(12, 2) | Yes | NULL | Operator rate |
| `final_fare` | NUMERIC(12, 2) | No | - | Billed rate |
| `override_reason` | TEXT | Yes | NULL | Mandatory if overridden |
| `overridden_by_user_id` | UUID | Yes | NULL | FK to `user_profiles(id)` |
| `breakdown_json` | JSONB | No | - | Complete breakdown |
| `created_at` | TIMESTAMPTZ | No | `now()` | - |

---

## Domain 12: Quotations, Invoices & Payments

### Table 12.1: `quotations`
Customer price quotes.

| Column | Type | Nullable | Default | Constraints / References |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | No | `gen_random_uuid()` | PK |
| `quote_number` | VARCHAR(50) | No | - | Unique |
| `customer_id` | UUID | No | - | FK to `customers(id)` |
| `quoted_fare` | NUMERIC(12, 2) | No | - | - |
| `valid_until` | TIMESTAMPTZ | No | - | - |
| `created_at` | TIMESTAMPTZ | No | `now()` | - |

### Table 12.2: `invoices`
Formal billing invoices.

| Column | Type | Nullable | Default | Constraints / References |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | No | `gen_random_uuid()` | PK |
| `invoice_number` | VARCHAR(50) | No | - | Unique |
| `booking_id` | UUID | No | - | Unique, FK to `bookings(id)` |
| `total_amount` | NUMERIC(12, 2) | No | - | - |
| `issued_at` | TIMESTAMPTZ | No | `now()` | - |

### Table 12.3: `payments`
Transaction ledger.

| Column | Type | Nullable | Default | Constraints / References |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | No | `gen_random_uuid()` | PK |
| `booking_id` | UUID | No | - | FK to `bookings(id)` |
| `amount` | NUMERIC(12, 2) | No | - | - |
| `payment_mode` | VARCHAR(50) | No | - | CHECK (`payment_mode` IN ('cash', 'upi', 'card', 'bank_transfer')) |
| `transaction_reference` | VARCHAR(100) | Yes | NULL | - |
| `status` | VARCHAR(50) | No | `'success'` | - |
| `created_at` | TIMESTAMPTZ | No | `now()` | - |

---

## Domain 13: CMS, Media & SEO

### Table 13.1: `cms_pages`
Dynamic content landing pages.

| Column | Type | Nullable | Default | Constraints / References |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | No | `gen_random_uuid()` | PK |
| `slug` | VARCHAR(255) | No | - | Unique |
| `title` | VARCHAR(255) | No | - | - |
| `content_markdown` | TEXT | Yes | NULL | - |
| `meta_title` | VARCHAR(255) | Yes | NULL | - |
| `meta_description` | TEXT | Yes | NULL | - |
| `is_published` | BOOLEAN | No | `true` | - |

---

## Domain 14: Audit Logging & System Settings

### Table 14.1: `audit_logs`
Immutable administrative activity ledger.

| Column | Type | Nullable | Default | Constraints / References |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | No | `gen_random_uuid()` | PK |
| `user_id` | UUID | Yes | NULL | FK to `user_profiles(id)` |
| `action` | VARCHAR(100) | No | - | E.g. `MANUAL_FARE_OVERRIDE` |
| `entity_name` | VARCHAR(100) | No | - | E.g. `bookings` |
| `entity_id` | UUID | Yes | NULL | Target ID |
| `old_values` | JSONB | Yes | NULL | - |
| `new_values` | JSONB | Yes | NULL | - |
| `created_at` | TIMESTAMPTZ | No | `now()` | - |

---

## 17. Supabase Storage Buckets Architecture

| Bucket Name | Security Level | MIME Restrictions | Usage |
| :--- | :--- | :--- | :--- |
| `vehicle-catalog` | Public Read | `image/jpeg, image/png, image/webp` | Master catalog display images |
| `fleet-documents` | Private Admin | `image/jpeg, image/png, application/pdf` | Driver licenses, RC documents |
| `invoices` | Private Auth | `application/pdf` | Generated customer billing PDFs |
| `cms-media` | Public Read | `image/*, video/*` | Promotional banners, destination images |

---

## 18. Row Level Security (RLS) Matrix

```
┌───────────────────────────┬──────────────┬───────────────────┬──────────────────┐
│ Table Domain              │ Public Access│ Authenticated Staff│ Owner Customer   │
├───────────────────────────┼──────────────┼───────────────────┼──────────────────┤
│ vehicle_categories/models │ SELECT       │ ALL               │ SELECT           │
│ actual_fleet / drivers    │ NONE         │ ALL               │ NONE             │
│ pricing_* tables          │ SELECT (RPC) │ ALL               │ NONE             │
│ bookings                  │ INSERT       │ ALL               │ SELECT (Own ID)  │
│ fare_snapshots            │ NONE         │ ALL               │ SELECT (Own ID)  │
│ audit_logs                │ NONE         │ SELECT (SuperAdmin│ NONE             │
└───────────────────────────┴──────────────┴───────────────────┴──────────────────┘
```

---

## 19. Recommended Sequential Migration Plan

```
Migration 001: Extensions & Base Types (UUID, Triggers)
Migration 002: User Profiles, Roles & RBAC (user_profiles, roles, user_roles)
Migration 003: Vehicle Master Catalog (categories, models, variants, amenities)
Migration 004: Operations & Fleet (vendors, drivers, actual_fleet)
Migration 005: Availability & Scheduling (vehicle_unavailability_periods)
Migration 006: Locations & Outstation Routes (locations, routes)
Migration 007: Pricing Engine (one_way, round_trip, local, airport)
Migration 008: Dynamic Pricing Engine (dynamic_pricing_rules)
Migration 009: Customers & Enquiry System (customers, enquiries)
Migration 010: Core Booking & Fleet Assignment (bookings, fleet_assignments)
Migration 011: Fare Snapshots & Manual Overrides (fare_snapshots)
Migration 012: Invoicing & Payment Ledger (quotations, invoices, payments)
Migration 013: CMS, Banners & SEO (cms_pages)
Migration 014: Immutable Audit Trail (audit_logs)
Migration 015: Comprehensive RLS Guardrails & Storage Policies
```
