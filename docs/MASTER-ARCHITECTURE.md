# Urgent Taxis Platform - Master Architecture Document

**Version:** 1.0.0  
**Status:** Approved Architectural Blueprint  
**Target Stack:** Next.js (App Router), TypeScript, Supabase (PostgreSQL, Auth, Storage, RLS), Tailwind CSS  
**Primary Principle:** Modular isolation — changes in one domain (e.g. vehicle images, pricing rules, marketing content) must NEVER break or alter unrelated domains.

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Project Goals](#2-project-goals)
3. [Core System Architecture](#3-core-system-architecture)
4. [System Modules](#4-system-modules)
5. [Domain Model & Relationships](#5-domain-model--relationships)
6. [Vehicle Master Architecture](#6-vehicle-master-architecture)
7. [Actual Fleet Architecture](#7-actual-fleet-architecture)
8. [Availability & Scheduling Architecture](#8-availability--scheduling-architecture)
9. [Pricing & Fare Engine Architecture](#9-pricing--fare-engine-architecture)
10. [One Way Pricing Domain](#10-one-way-pricing-domain)
11. [Round Trip Pricing Domain](#11-round-trip-pricing-domain)
12. [Local Rental Pricing Domain](#12-local-rental-pricing-domain)
13. [Airport Transfer Pricing Domain](#13-airport-transfer-pricing-domain)
14. [Included and Excluded Charges Framework](#14-included-and-excluded-charges-framework)
15. [Dynamic Pricing Engine](#15-dynamic-pricing-engine)
16. [Manual Fare Override Architecture](#16-manual-fare-override-architecture)
17. [Booking Engine Architecture](#17-booking-engine-architecture)
18. [Admin Panel Architecture](#18-admin-panel-architecture)
19. [Public Website Architecture](#19-public-website-architecture)
20. [Supabase Infrastructure Architecture](#20-supabase-infrastructure-architecture)
21. [Authentication System](#21-authentication-system)
22. [Authorization and Row Level Security (RLS)](#22-authorization-and-row-level-security-rls)
23. [Storage Architecture](#23-storage-architecture)
24. [Database Design Principles](#24-database-design-principles)
25. [Security Architecture](#25-security-architecture)
26. [Audit Logging System](#26-audit-logging-system)
27. [Change Control & Domain Boundaries](#27-change-control--domain-boundaries)
28. [Future Scalability & Extension Points](#28-future-scalability--extension-points)
29. [Implementation Roadmap](#29-implementation-roadmap)
30. [Recommended Build Order](#30-recommended-build-order)
31. [Risks and Mitigations](#31-risks-and-mitigations)
32. [Final Architecture Rules](#32-final-architecture-rules)

---

## 1. Executive Summary

The Urgent Taxis platform is a commercial outstation, local, and airport taxi booking platform engineered for high reliability, dynamic pricing flexibility, and complete administrative control. This document establishes the master architectural contract for the system.

The core architecture strictly separates **Master Catalog Data** (vehicle models, categories, amenities, base pricing rules) from **Operational Data** (actual physical vehicles with registration numbers, assigned drivers, active bookings, real-time availability). This ensures that customer-facing availability, route discovery, and instant quote generation operate smoothly without needing physical vehicle assignments up front.

---

## 2. Project Goals

The goal is to build a complete Urgent Taxis business platform consisting of:

1. **Public Customer Website** (Instant quotes, route discovery, booking requests)
2. **Admin Panel** (Comprehensive management dashboard)
3. **Fleet Management** (Physical vehicles, registration numbers, maintenance)
4. **Vehicle Availability Management** (Calendar schedules, conflict prevention)
5. **Driver Management** (Driver profiles, licenses, assignments)
6. **Vendor/Partner Management** (Partner fleet onboarding, commissions)
7. **Fare & Pricing Management** (Base rates, slab rules, fees)
8. **Dynamic Pricing Engine** (Surge, peak season, weekend adjustments)
9. **Booking Management** (Lifecycle tracking, state transitions)
10. **Customer Management** (Histories, contacts, preferences)
11. **Enquiry Management** (Leads, custom inquiries, follow-ups)
12. **Quotation Management** (Proforma quotes, PDF generation)
13. **Invoice Management** (Final tax invoices, receipts)
14. **Payment Management** (Payment collection status, transaction logs)
15. **Website Content Management** (Dynamic pages, dynamic text, FAQs)
16. **Media Management** (Banners, vehicle master images, gallery)
17. **SEO Management** (Dynamic metadata, canonical URLs, dynamic routes)
18. **Role-Based Admin Access** (Super Admin, Fleet Manager, Dispatcher)
19. **Supabase Database** (Normalized relational model with constraints)
20. **Supabase Storage** (Public asset buckets & private document storage)
21. **Supabase Authentication** (Secure JWT auth & custom role claims)

The architecture is strictly modular and maintainable. **A change in one module must not unnecessarily break or alter unrelated modules.**

---

## 3. Core System Architecture

The system uses a modern 3-Tier Headless Architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                            │
│  ┌──────────────────────────────┐    ┌──────────────────────────────┐  │
│  │    Public Customer Portal    │    │      Admin Dashboard         │  │
│  │   (Next.js App Router)       │    │    (Next.js Server/Client)   │  │
│  └──────────────┬───────────────┘    └──────────────┬───────────────┘  │
└─────────────────┼───────────────────────────────────┼──────────────────┘
                  │                                   │
┌─────────────────┼───────────────────────────────────┼──────────────────┐
│                 ▼        BUSINESS LOGIC LAYER       ▼                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Next.js Server Actions & API Routes                             │  │
│  │  ├── Booking Engine            ├── Dynamic Pricing Calculator    │  │
│  │  ├── Fare Override Handler    ├── Availability Resolver          │  │
│  │  └── Media/Storage Handler    └── Audit & Security Middleware   │  │
│  └──────────────┬───────────────────────────────────┘  │
└─────────────────┼──────────────────────────────────────┘
                                  │
┌─────────────────┼──────────────────────────────────────┐
│                 ▼        DATA LAYER                    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Supabase Platform                                               │  │
│  │  ├── PostgreSQL Database (Normalized Schemas & Views)            │  │
│  │  ├── Supabase Auth (JWT & Role-Based Claims)                     │  │
│  │  ├── Supabase Storage (Public & Private Buckets)                 │  │
│  │  └── Row Level Security (RLS Engine)                             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. System Modules

| Module ID | Module Name | Scope & Responsibilities |
| :--- | :--- | :--- |
| **MOD-01** | Public Website | Landing pages, route search, vehicle selection, fare breakdown, customer booking form. |
| **MOD-02** | Admin Panel | Secure UI for managing catalog, pricing rules, bookings, fleet, and site settings. |
| **MOD-03** | Vehicle Master | Categories, Models, Variants, Fuel types, Amenities, and Catalog Images. |
| **MOD-04** | Fleet & Operations | Physical vehicles (Registration No.), Drivers, Vendors, Maintenance, Allocation. |
| **MOD-05** | Availability Engine | Date/time blocking, vehicle status checks, conflict prevention. |
| **MOD-06** | Pricing Engine | Base fares, distance slab rules, package definitions, dynamic surge modifiers. |
| **MOD-07** | Booking Engine | Order state machine (Pending -> Confirmed -> Assigned -> Completed / Cancelled). |
| **MOD-08** | Quotation & Invoicing| Invoice PDF generation, quote estimation sheets, manual fare adjustment tracking. |
| **MOD-09** | CMS & SEO | Dynamic route pages, FAQs, blog articles, meta tags, hero banners. |
| **MOD-10** | Security & Audit | RLS policies, RBAC access checks, immutable system logs. |

---

## 5. Domain Model & Relationships

```
┌─────────────────────┐       1:N       ┌─────────────────────┐
│  vehicle_categories ├─────────────────<│   vehicle_models    │
└─────────────────────┘                 └──────────┬──────────┘
                                                   │ 1:N
                                                   ▼
┌─────────────────────┐       1:N       ┌─────────────────────┐
│   actual_fleet      ├─────────────────<│  vehicle_variants   │
└──────────┬──────────┘                 └─────────────────────┘
           │ 1:N
           ▼
┌─────────────────────┐       1:N       ┌─────────────────────┐
│   fleet_assignments ├─────────────────<│      bookings       │
└─────────────────────┘                 └──────────┬──────────┘
                                                   │ 1:1
                                                   ▼
                                        ┌─────────────────────┐
                                        │  fare_computations  │
                                        └─────────────────────┘
```

### Domain Summaries & Coupling Constraints

1. **Admin & Staff**: Manages user profiles, role assignments (Super Admin, Fleet Manager, Booking Agent).  
   *Coupling Constraint:* Admin profiles must link to Supabase Auth UUIDs, but business logic must not depend directly on Auth metadata tables.
2. **Vehicle Master**: Definitive catalog of categories, models, fuel types, and amenities.  
   *Coupling Constraint:* Changes in amenity tags or master images must not alter physical fleet registration data or pricing tables.
3. **Actual Fleet**: Physical assets (Registration Numbers, Chassis, RC details, Vendor ties).  
   *Coupling Constraint:* Registration numbers must be optional. Operational fleet status must not mutate Master catalog definitions.
4. **Availability & Scheduling**: Tracks vehicle calendar blocks and driver shifts.  
   *Coupling Constraint:* Availability resolution reads from bookings and maintenance logs; it does not hardcode vehicle IDs.
5. **Pricing Rules**: Base rates, package tariffs, surge adjustments, and included/excluded rules.  
   *Coupling Constraint:* Pricing functions must accept route and vehicle parameters and return pure JSON fare structures without mutating booking state.
6. **Bookings & Transactions**: Customer orders, payment receipts, manual fare overrides, and audit trails.  
   *Coupling Constraint:* Booking records must store a snapshot of the calculated fare breakdown to ensure historical integrity even if pricing rules change later.

---

## 6. Vehicle Master Architecture

The system enforces a strict hierarchy for vehicle master data:

```
Category (e.g. Sedan)
   └── Model (e.g. Maruti Dzire)
         └── Variant (e.g. Dzire VXI CNG)
               ├── Fuel Type (CNG)
               ├── Seating Capacity (4+1)
               ├── Amenities (AC, Music System, Charging)
               └── Master Catalog Image (Public facing)
```

### Key Business Rule: Registration Number Optionality
* Customer-facing displays depend exclusively on **Category / Model / Variant Master Data**.
* Registration numbers (`registration_number`) live strictly in `actual_fleet` records and are optional (`NULLABLE`).
* A vehicle model (e.g. "Maruti Dzire or Similar") can be published, searched, and booked even if zero physical registration numbers exist in the database.

---

## 7. Actual Fleet Architecture

`actual_fleet` represents physical vehicles on the road.

### Key Fields & Attributes
* `id` (UUID, Primary Key)
* `variant_id` (Foreign Key to `vehicle_variants`)
* `registration_number` (VARCHAR, Optional / NULLABLE)
* `vendor_id` (Foreign Key to `vendors`, Optional)
* `assigned_driver_id` (Foreign Key to `drivers`, Optional)
* `status` (ENUM: `available`, `booked`, `on_trip`, `maintenance`, `blocked`, `inactive`)
* `is_active` (BOOLEAN, default `true`)

---

## 8. Availability & Scheduling Architecture

Vehicle availability is resolved dynamically across historical, real-time, and future time windows.

### Fleet Status Types
* `AVAILABLE`: Ready for instant dispatch or scheduling.
* `BOOKED`: Assigned to an upcoming confirmed booking.
* `ON_TRIP`: Currently executing an active ride.
* `MAINTENANCE`: Under repair or servicing.
* `BLOCKED`: Temporarily held by admin.
* `INACTIVE`: Decommissioned or off-boarded.

### Double-Booking Prevention Rule
Before any booking confirmation or manual vehicle assignment occurs, the system executes an availability check:

$$\text{Conflict} = \exists \, B \in \text{Bookings} : \left( B.\text{fleet\_id} = V.\text{id} \land B.\text{status} \notin \{\text{cancelled}, \text{completed}\} \land \max(B.\text{start}, T.\text{start}) < \min(B.\text{end}, T.\text{end}) \right)$$

---

## 9. Pricing & Fare Engine Architecture

The pricing engine is modular and supports 4 primary trip types:
1. **One-Way Outstation**
2. **Round-Trip Outstation**
3. **Local Rental Package**
4. **Airport Transfer**

---

## 10. One Way Pricing Domain

Calculated based on point-to-point routes or distance slabs.

* **Base Fare**: Minimum guaranteed price for the route.
* **Included KM**: Distance covered in the base fare.
* **Extra KM Rate**: Per-kilometer price beyond included KM.
* **Itemized Charges**: Toll, State Tax, Driver Allowance, Night Charge, Parking.

---

## 11. Round Trip Pricing Domain

Calculated based on daily minimum billing rules.

* **Daily Minimum Billing**: E.g., $250\text{ km/day} \times \text{Days}$.
* **Total Chargeable Distance**: $\max(\text{Actual Distance}, \text{Total Minimum Billing KM})$.
* **Driver Allowance**: Per-day fee for driver expenses.
* **Night Halt**: Charge applied when the trip spans between 10:00 PM and 6:00 AM.

---

## 12. Local Rental Pricing Domain

Configurable hourly/kilometer packages managed strictly from Admin:

| Package Name | Included Hours | Included KM | Extra Hour Rate | Extra KM Rate |
| :--- | :--- | :--- | :--- | :--- |
| **Half Day** | 4 Hours | 40 KM | Configurable | Configurable |
| **Standard Day** | 8 Hours | 80 KM | Configurable | Configurable |
| **Full Day** | 12 Hours | 120 KM | Configurable | Configurable |

---

## 13. Airport Transfer Pricing Domain

Zone-to-Airport or Airport-to-Zone fixed/slab pricing.

* **Airport Entry Fee**: Configurable as Included or Excluded.
* **Waiting Time Allowance**: E.g., 45 minutes free after flight arrival.
* **Extra Waiting Rate**: Per-30-minute block thereafter.

---

## 14. Included and Excluded Charges Framework

Every generated quote outputs explicit JSON arrays for transparency:

```json
{
  "included_charges": [
    "Fuel Charges",
    "Driver Allowance",
    "Ganga Expressway Toll"
  ],
  "excluded_charges": [
    "State Entry Tax (Payable at border)",
    "Airport Parking (As per actual receipt)"
  ]
}
```

---

## 15. Dynamic Pricing Engine

Dynamic pricing applies rules based on priority and validity windows:

$$\text{Final Rate} = \text{Base Rate} \times \left(1 + \sum \text{Percentage Modifiers}\right) + \sum \text{Fixed Additions}$$

### Rule Types
* Peak Season / Holiday Surge
* Weekend Surcharge
* Night Time Surcharge (10 PM - 6 AM)
* High-Demand / Last-Minute Adjustment

---

## 16. Manual Fare Override Architecture

Admin operators can manually override calculated fares.

### Audit Requirement
When `manual_fare` is set, the system records:
1. `original_calculated_fare` (Numeric)
2. `final_manual_fare` (Numeric)
3. `override_reason` (Text, Mandatory)
4. `overridden_by_user_id` (UUID, Foreign Key)
5. `overridden_at` (Timestamp)

---

## 17. Booking Engine Architecture

```
Search -> Select Category -> Calculate Fare -> Enter Details -> Create Booking (Pending)
                                                                      │
                                                                      ▼
Completed <- Complete Trip <- Assign Driver/Vehicle <- Confirm Booking
```

---

## 18. Admin Panel Architecture

The Admin Panel provides complete management across all domains:
* Dashboard & Analytics
* Fleet & Vehicle Catalog Management
* Driver & Vendor Portals
* Fare & Pricing Rule Builder
* Booking Dispatch & Manual Overrides
* Invoice Generation & PDF Exporter
* CMS, Banners, and SEO Meta Management
* System Settings, Role Management, and Audit Logs

---

## 19. Public Website Architecture

* Built using Next.js App Router for maximal SEO performance.
* Server-side rendering (SSR) for dynamic route landing pages (e.g. `/cab-booking/delhi-to-rishikesh`).
* Client-side interactive widget for fare estimation without page reloads.

---

## 20. Supabase Infrastructure Architecture

* **Database Engine**: PostgreSQL 15+ with custom schemas.
* **Auth**: Supabase Auth using JWT with custom user role claims.
* **Storage**: Buckets for catalog vehicle images, driver documents, and invoice PDFs.

---

## 21. Authentication System

* Support for Email/Password and OTP authentication for Admin staff and customers.
* Roles attached via `user_roles` table and synchronized to JWT app_metadata.

---

## 22. Authorization and Row Level Security (RLS)

* **Public Users**: `SELECT` access to active vehicle categories, published routes, and active pricing packages. `INSERT` access to `enquiries` and `bookings`.
* **Authenticated Staff**: Access restricted by role (`admin`, `fleet_manager`, `billing_clerk`) checked via RLS policies:
  ```sql
  CREATE POLICY "Admin full access on pricing" 
  ON pricing_rules FOR ALL 
  TO authenticated 
  USING ( (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' );
  ```

---

## 23. Storage Architecture

| Bucket Name | Access Level | Description |
| :--- | :--- | :--- |
| `vehicle-catalog` | Public Read | Vehicle model and category promotional images. |
| `fleet-documents` | Private Admin | Driver licenses, RC copies, insurance policies. |
| `invoices` | Authenticated | Generated PDF receipts and customer invoices. |
| `cms-media` | Public Read | Website banners, destination photos, blog assets. |

---

## 24. Database Design Principles

* **Primary Keys**: UUID v4 for all primary identifiers.
* **Timestamps**: `created_at` and `updated_at` (TIMESTAMPTZ) on all tables.
* **Soft Deletes**: `is_deleted` or `deleted_at` fields on master catalog records to prevent breaking historical bookings.
* **Financial Precision**: All monetary amounts stored as `NUMERIC(12, 2)`.

---

## 25. Security Architecture

* Zero service-role keys in frontend code.
* Strict API route input validation using Zod schemas.
* OWASP-compliant headers, CORS policies, and rate-limiting on booking submission endpoints.

---

## 26. Audit Logging System

Every sensitive mutation (fare override, status change, role assignment, vehicle deletion) inserts an immutable record into `audit_logs`:
* `id`, `user_id`, `action`, `entity_name`, `entity_id`, `old_values` (JSONB), `new_values` (JSONB), `ip_address`, `timestamp`.

---

## 27. Change Control & Domain Boundaries

```
┌─────────────────┐       Does NOT modify       ┌─────────────────┐
│ Vehicle Images  ├────────────────────────────>│  Pricing Rules  │
└─────────────────┘                             └─────────────────┘
┌─────────────────┐       Does NOT modify       ┌─────────────────┐
│ Pricing Rules   ├────────────────────────────>│ Master Vehicles │
└─────────────────┘                             └─────────────────┘
┌─────────────────┐       Does NOT modify       ┌─────────────────┐
│ CMS Content     ├────────────────────────────>│ Booking Records │
└─────────────────┘                             └─────────────────┘
```

---

## 28. Future Scalability & Extension Points

* **Multi-City Support**: Prepared for multi-hub operations.
* **Partner API**: Webhook endpoints for third-party travel aggregators.
* **Customer Portal**: Account history, loyalty points, and automated WhatsApp updates.

---

## 29. Implementation Roadmap

```
Phase 1: Foundation Setup
Phase 2: Database Schema & RLS Policies
Phase 3: Admin Auth & Role System
Phase 4: Vehicle Master & Fleet Module
Phase 5: Availability & Scheduling Module
Phase 6: Pricing Engine & Rule Builder
Phase 7: Booking & Dispatch System
Phase 8: Quotations & Invoicing System
Phase 9: Public Customer Portal
Phase 10: CMS & SEO Integration
Phase 11: End-to-End Testing & Auditing
Phase 12: Production Deployment
```

---

## 30. Recommended Build Order

1. Core Database Schemas & Migrations (Phase 2)
2. Supabase Auth & RLS Guardrails (Phase 3)
3. Admin Vehicle Master & Fleet Portal (Phase 4)
4. Admin Pricing Rule Builder (Phase 6)
5. Public Route Search & Booking Widget (Phase 9)
6. Admin Booking Management & Fare Override UI (Phase 7)

---

## 31. Risks and Mitigations

| Risk Factor | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| Complex Pricing Rule Conflicts | High | Priority ranking on rules + automated simulation test runner. |
| Double Booking during Peak Hours | Critical | Atomic transactions in PostgreSQL RPC function for vehicle locks. |
| Exposed Service Role Keys | Critical | Secret scanner in CI/CD pipeline; server-only instantiation. |

---

## 32. Final Architecture Rules

1. **Master vs Fleet Distinction**: Registration numbers must remain optional. Public site displays Category/Model master data.
2. **Pricing Transparency**: Always store a full JSON breakdown of included/excluded charges in every booking snapshot.
3. **No Hardcoded Rates**: All fares, surges, packages, and minimum billings must be managed via Admin tables.
4. **Audit Integrity**: Manual fare overrides require mandatory justification notes and logged operator IDs.
5. **Domain Isolation**: Code modules must communicate through clearly typed TypeScript interfaces and API handlers.
