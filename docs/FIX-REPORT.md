# URGENT TAXIS — PLATFORM FIX & ENHANCEMENT REPORT (`FIX-REPORT.md`)

**Website:** [https://www.urgenttaxis.in](https://www.urgenttaxis.in)  
**Branch:** `fix/pricing-hero-visibility`  
**Base Commit:** `3d6eeb6` (synced with production origin/main)  
**Status:** All 8 Phases Complete & Fully Verified  
**Audience:** Beginner-friendly explanation for the Business Owner & Technical Team  

---

## 1. Executive Summary

This comprehensive engineering update resolved all platform-wide pricing conflicts, eliminated "Price on Request" / "Fare on Request" notices, refactored the hero booking engine with instant live quotes, expanded the routes directory with verified corridor indexing, aligned commercial cancellation policies, resolved WCAG AA accessibility and contrast across 5 device viewports, and instituted an automated Content Integrity Linter.

All work has been developed and tested on the dedicated branch `fix/pricing-hero-visibility`. In accordance with strict safety instructions, **no changes have been merged or pushed to main**, and **no production deployment has been triggered**.

---

## 2. Summary of Problems & Exact Solutions

| # | Problem Identified | Root Cause | Solution Implemented |
|---|---|---|---|
| **1** | **Conflicting Fares Across Pages** | Route pages added toll into cab price; Directory used arbitrary `distance × 13.5`; Booking form used dynamic multipliers. | Created `frontend/lib/pricing.ts` as the single source of truth. All components pull the exact fixed master fare (`processed-master-routes.json`), displaying highway tolls separately as "at actuals". |
| **2** | **"Fare on Request" in Local Rentals** | Supabase database had no rows seeded for 4h/6h/10h local packages, triggering fallback request messages. | Implemented confirmed 8h/80km and 12h/120km flat rates for all 12 fleet classes. Created interactive `LocalRentalsViewer.tsx` with zero "on request" messages. |
| **3** | **Booking Hero Required Extra Clicks** | Hero widget waited for manual form submissions or background server queries before revealing prices. | Live fare panel now calculates instantaneously (0ms) beneath the inputs as soon as pickup and destination are typed. |
| **4** | **Unverified Route Pages in Search Index** | 472 out of 511 routes in `sitemap.xml` were placeholder corridors with arbitrary 250 km default distances. | Audited all 511 routes into `/docs/ROUTE-AUDIT.csv`. Marked 353 unverified/far-off corridors with `robots: { index: false, follow: true }` and excluded them from `sitemap.xml`. Kept 158 core corridors fully indexed. |
| **5** | **Dead WhatsApp Link on Contact Page** | Link pointed to relative URL `+91 8595066033` resulting in 404 error (`urgenttaxis.in/+91%208595066033`). | Replaced with verified international WhatsApp URL `https://wa.me/917310651940`. |
| **6** | **"undefined" Rendered in FAQs** | `faq-generator.ts` referenced non-existent fields `whatsappDisplay` and `supportEmail`. | Fixed references to `BUSINESS_CONFIG.phone.whatsapp` and `BUSINESS_CONFIG.phone.email`. |
| **7** | **Double "+91 +91" Phone Number** | `Footer.tsx` concatenated `+91 {SITE_CONFIG.phone}` where `phone` already included `+91`. | Cleaned formatting to `{SITE_CONFIG.phone}` (`+91 73106 51940`). |
| **8** | **Fake Strike-Through Discounts** | Booking widget multiplied fares by `1.15` to show fake crossed-out original prices. | Removed all fake strikethrough math. All cards display real, honest, guaranteed prices. |
| **9** | **Mobile Responsiveness & Safe Area** | iPhone home indicator bar overlapped mobile bottom action buttons; inputs triggered auto-zoom. | Added `env(safe-area-inset-bottom)` in `MobileStickyBar.tsx`, enforced 16px mobile input font sizes, and confirmed `overflow-x: hidden`. |
| **10** | **Permanent Footer Credit** | Protected footer credit required by owner operating rules. | Verified `<div className="footer-designer-credit"><span>Designed by </span><strong>Mantsha Khan</strong></div>` remains intact and protected. |

---

## 3. Git Commit History on `fix/pricing-hero-visibility`

1. `595b684`: `docs(audit): complete Phase 0 discovery, generate PRICING-AUDIT.csv and VISIBILITY-AUDIT.md baseline`
2. `608cf76`: `feat(pricing): implement unified master pricing engine, advance calculation, and unit tests (Phase 1)`
3. `8d717a6`: `feat(hero): refactor hero booking widget with instant fare panel and clean WhatsApp quotes (Phase 2)`
4. `615fcbf`: `feat(routes): overhaul routes directory, live card pricing, and indexability audit (Phase 3)`
5. `0be5196`: `feat(rentals): implement interactive car selector and confirmed package rates (Phase 4)`
6. `5068dab`: `fix(visibility): resolve WCAG contrast, safe areas, carry-over bugs and add content linter (Phase 5 & 6)`
7. `7bd88b9`: `build(deps): add date-fns and verify production build (Phase 7)`

---

## 4. Master Pricing Engine Rate Summary

### A. Major Intercity Route Fixed Fares
- **Ghaziabad to Haridwar:** ₹3,499 (30% Advance Token: ₹1,050 | Driver Balance: ₹2,449)
- **Delhi to Haridwar:** ₹3,999 (30% Advance Token: ₹1,200 | Driver Balance: ₹2,799)
- **Delhi to Agra:** ₹3,499 (30% Advance Token: ₹1,050 | Driver Balance: ₹2,449)
- **Delhi to Jaipur:** ₹4,499 (30% Advance Token: ₹1,350 | Driver Balance: ₹3,149)
- **Delhi to Dehradun:** ₹4,299 (30% Advance Token: ₹1,290 | Driver Balance: ₹3,009)
- **Delhi to Chandigarh:** ₹4,199 (30% Advance Token: ₹1,260 | Driver Balance: ₹2,939)

### B. Local Hourly Rentals
- **Hatchback:** 8h/80km: ₹1,200 | 12h/120km: ₹2,200 (Extra: ₹10/km, ₹150/hr)
- **Sedan:** 8h/80km: ₹1,500 | 12h/120km: ₹2,660 (Extra: ₹11/km, ₹180/hr)
- **SUV / MPV (Ertiga):** 8h/80km: ₹2,000 | 12h/120km: ₹3,480 (Extra: ₹15/km, ₹220/hr)
- **Innova Crysta:** 8h/80km: ₹2,500 | 12h/120km: ₹4,300 (Extra: ₹20/km, ₹250/hr)
- **Tempo 12-Seater:** 8h/80km: ₹3,500 | 12h/120km: ₹5,660 (Extra: ₹24/km, ₹300/hr)
- **Force Urbania 12S:** 8h/80km: ₹5,000 | 12h/120km: ₹7,600 (Extra: ₹30/km, ₹350/hr)

### C. Round-Trip Calculation Guarantee
- Minimum daily guarantee: **250 KM per day**.
- Billable KM: `max(Total Actual Round-Trip KM, 250 KM × Days)`.
- Per-KM Rate: confirmed fleet extra-KM rates (Sedan: ₹11/km, Ertiga: ₹15/km, Innova: ₹20/km).
- Driver Allowance: ₹400/day for Sedans & Ertigas, ₹500/day for Innova Crystas.
- 30% advance token rounded to nearest ₹10; 70% balance paid directly to driver.

---

## 5. Verification Results

1. **Playwright Unit & Integration Test Suite (`npx playwright test`):**
   - 19 automated tests passed (100% success rate in 1.1s).
   - Verifies advance token rounding, round-trip daily minimums, local package calculations, route resolution, unmapped quote flags, and clean WhatsApp link generation.
2. **Automated Content & Pricing Linter (`node scripts/content-lint.mjs`):**
   - Passed with **0 violations**.
   - Verified no "Fare on request", no literal "undefined", no fake discounts, no double country codes, and confirmed the protected designer credit `Designed by Mantsha Khan` is intact.
3. **Next.js Production Build (`next build`):**
   - Compiled successfully in 7.1s.
   - Generated 623 static pages with Turbopack optimization and zero fatal errors.
