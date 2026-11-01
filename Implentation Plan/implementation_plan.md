# Urgent Taxis Master Implementation Plan

This document outlines the execution strategy for completing the Urgent Taxis platform to production scale across 13 phases, per the Master Architecture and user requirements. 

## User Review Required
> [!WARNING]
> This is a massive, multi-phase undertaking. As per my system safety rules for large-scale changes, I am presenting this implementation plan for your formal approval before I begin rewriting core components and adding significant architecture. 
> 
> **Once you click "Proceed", I will begin executing Phase 1.** I will follow your instruction to automatically proceed between phases as long as no blockers are encountered.

## Open Questions
- **External Services**: For Phase 11 (Notifications), do you have a preferred WhatsApp API provider (e.g., Twilio, Meta Cloud API) and Email provider (e.g., Resend, SendGrid)?
- **Payments**: For Phase 3/5/9, which payment gateway (Razorpay, Stripe, PayU) should we model the data structures against?

---

## Proposed Phases & Changes

### Phase 1: Security Hardening
- Complete missing RLS policies on Supabase tables (bookings, fleet).
- Add JWT validation and strict Role permissions to Next.js middleware and API routes.
- Implement API Rate Limiting for public endpoints to prevent abuse.
- Add security headers and strict Zod input validation.

### Phase 2: Admin Dashboard
- Complete operational dashboard UI (`/admin/dashboard`).
- Build metric widgets (Live counters, Booking Status graphs).
- Implement quick-actions for pending, cancelled, and completed orders.

### Phase 3: Booking Management
- Build Admin Booking CRUD (`/admin/bookings`).
- Implement timeline, status update logic (Pending -> Confirmed -> Assigned -> Completed).
- Build the manual "Assign Driver" and "Assign Vehicle" workflows.

### Phase 4: Driver Module
- Implement Driver profile CRUD (`/admin/drivers`).
- Add fields for License, Expiry, Availability tracking (Online/Offline).
- Track Salary, Commissions, Trips, and Ratings.

### Phase 5: Vendor Module
- Implement Vendor/Partner CRUD (`/admin/vendors`).
- Manage Vendor Fleet, Vendor Drivers, and Settlement tracking.

### Phase 6: Fleet Module (Operations)
- Build Availability Engine to prevent double-booking.
- Add Vehicle Calendar and Maintenance/Insurance/Fitness/Permit tracking.

### Phase 7: Customer Module
- Build Customer Portal (auth, profiles, booking history).
- Add Wallet and basic Invoice/Document history.

### Phase 8: Pricing Engine
- Complete dynamic fare engine logic (`/admin/pricing/surge`).
- Add Peak pricing, Night pricing, and Promo Code/Coupon management.

### Phase 9: Invoice & PDF
- Integrate PDF generation for Professional Quotations, GST Invoices, Driver Sheets, and Trip Vouchers.

### Phase 10: CMS
- Build Admin CMS (`/admin/cms`) for Blog, Routes, FAQs, and Landing Pages to drive SEO.

### Phase 11: Notifications
- Build webhook triggers for Booking/Payment/Driver updates via WhatsApp/SMS/Email.

### Phase 12: Performance
- Next.js Image optimization, API response caching, and query optimization.
- Add composite database indexes for high-read scenarios.

### Phase 13: Testing
- Comprehensive Unit, Integration, API, and Browser responsive tests.

---

## Verification Plan

### Automated Tests
- `npm run build` executed after every major module.
- ESLint and TypeScript checks resolved continuously.
- Supabase migrations tested against local or staging DB.

### Manual Verification
- Visual inspection of the Admin Dashboard UI.
- E2E testing of the booking flow (search -> calculate -> book -> admin assign -> complete).
