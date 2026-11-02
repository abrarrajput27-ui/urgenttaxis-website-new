# URGENT TAXIS — VISIBILITY & ACCESSIBILITY AUDIT BASELINE

**Target Domain:** [https://www.urgenttaxis.in](https://www.urgenttaxis.in)  
**Branch:** `fix/pricing-hero-visibility`  
**Standard:** WCAG 2.1 Level AA (Contrast 4.5:1 minimum for normal text, 3:1 for large text 24px+ or 18.66px bold)  
**Screen Viewports Audited:**
- Mobile Small: 360 × 800
- Mobile Standard: 390 × 844
- Tablet: 768 × 1024
- Desktop: 1280 × 800
- Widescreen: 1920 × 1080

---

## 1. Scope of Audit

The audit covers all public page templates:
1. Homepage (`/`)
2. Routes Directory (`/routes`)
3. Dynamic Route Pages (`/routes/[slug]`)
4. Locality Pages (`/taxi-service/[locality]`)
5. Airport Corridor Pages (`/airport-transfers/[slug]`)
6. Local Hourly Rentals (`/local-rentals`)
7. Fleet Directory (`/fleet`)
8. Contact Page (`/contact`)
9. Reviews Page (`/reviews`)

---

## 2. Issues to Track & Measure (To be populated in Phase 5)

| Page | Viewport | Element / Selector | Observed Color / Contrast | Target Contrast | Issue Type (Contrast / Clipped Text / Truncate) | Resolution |
|---|---|---|---|---|---|---|
| *To be measured in Phase 5 via Playwright & axe-core* | | | | | | |

---

## 3. Rules for Fixes
1. Body and meta text 14px or larger on mobile; form inputs 16px to prevent mobile iOS zoom; buttons minimum 44px height.
2. Contrast 4.5:1 minimum on all readable text nodes.
3. No `text-white/60` on light backgrounds; no text opacity below 0.8.
4. Never clip prices, car names, routes or button labels (use `min-h`, wrapping, `break-words`).
5. Safe area bottom padding for sticky bar: `padding-bottom = height of sticky bar + env(safe-area-inset-bottom)`.
