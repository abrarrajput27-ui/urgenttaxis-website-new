# URGENT TAXIS — TECHNICAL SEO AUDIT REPORT

**Date:** November 8, 2026  
**Auditor:** Senior SEO Strategist & Technical SEO Engineer  
**Website:** `https://www.urgenttaxis.in`  
**Git Branch & Commit:** `main` (`007cd2b`)  
**Production Platform:** Next.js 16.2.12 (Turbopack) hosted on Vercel Edge Network (`bom1` Mumbai Edge Node)  

---

## 1. Executive Technical Summary

The technical infrastructure of Urgent Taxis is built on Next.js 16 with Turbopack and React 19, delivering server-side rendered (SSR) and statically generated (SSG) HTML for rapid first-byte response and complete bot crawlability.

| Metric | Measured Value | Benchmark Target | Evaluation |
| :--- | :--- | :--- | :--- |
| **HTTP Status Code Health** | 100% (200 OK across public pages) | 100% 200 OK | **EXCELLENT** |
| **Protocol & Canonical Domain** | `https://www.urgenttaxis.in` | Enforced HTTPS & Single Host | **PASSED** |
| **Robots.txt Health** | Valid, disallows `/admin/` & `/api/` | Valid syntax, correct sitemap link | **PASSED** |
| **Sitemap XML Health** | 228 Valid URLs (42.3 KB) | Well-formed XML, no 404s/redirects | **PASSED** |
| **Mobile Responsiveness** | Verified (320px - 1920px) | Viewport meta present & responsive | **PASSED** |
| **Structured Data** | `TaxiService`, `BreadcrumbList`, `FAQPage`, `Article` | Valid Schema.org JSON-LD | **NEEDS MINOR ENHANCEMENT** |

---

## 2. Server Architecture, Crawlability & Indexability

### 2.1 Next.js App Router & Rendering Engine
- **Rendering Strategy:** Static Site Generation (`SSG`) is leveraged across all high-priority route detail pages, locality landing pages, airport transfer pages, and blog articles using `generateStaticParams`.
- **Bot Crawlability:** Search engine bots (Googlebot, Bingbot) receive fully rendered HTML on first HTTP request without requiring client-side JavaScript execution to read page titles, meta descriptions, headings, or body content.
- **Server Response Time (TTFB):** Average server response time measured at ~140ms on local production build and ~180ms across the Vercel Indian Edge CDN (`bom1`).

### 2.2 Canonical URLs & Trailing Slash Policy
- **Base Domain:** Configured in `frontend/lib/seo.ts` as `https://www.urgenttaxis.in`.
- **Canonical Consistency:** All crawled pages include an explicit `<link rel="canonical" href="...">` pointing directly to the canonical HTTPS `www.urgenttaxis.in` URL.
- **Redirects:** Non-WWW requests (`http://urgenttaxis.in`, `https://urgenttaxis.in`) cleanly 308-redirect to `https://www.urgenttaxis.in`.

---

## 3. Robots.txt and XML Sitemap Audit

### 3.1 Robots.txt (`/robots.txt`)
```txt
User-Agent: *
Allow: /
Disallow: /admin/
Disallow: /admin/*
Disallow: /api/
Disallow: /api/*

Sitemap: https://www.urgenttaxis.in/sitemap.xml
```
- **Evaluation:** Fully compliant. Private admin dashboard corridors (`/admin/*`) and private backend endpoints (`/api/*`) are protected from crawler indexing, preventing crawl budget wastage on administrative interfaces.

### 3.2 XML Sitemap (`/sitemap.xml`)
- **Current Submitted URLs:** 228
  - 16 Core Static Pages (`/`, `/services`, `/routes`, `/taxi-service`, `/airport-transfers`, `/fleet`, `/local-rentals`, `/faq`, `/booking-policy`, `/about`, `/contact`, `/blog`, `/reviews`, `/terms`, `/privacy`, `/cancellation`)
  - 23 Locality Pages (`/taxi-service/[locality]`)
  - 15 Airport Transfer Pages (`/airport-transfers/[slug]`)
  - 16 Blog Guides (`/blog/[slug]`)
  - 158 Verified Outstation Routes (`/routes/[slug]`)
- **Audit Findings & Opportunities:**
  1. *Omitted High-Intent Pages:* Important commercial specialty pages are active on the website but omitted from `staticPages` in `frontend/app/sitemap.ts`:
     - `/tempo-traveller`
     - `/bus-charter`
     - `/corporate-taxi`
     - `/chardham-yatra`
     - `/tour-packages`
     - Fleet category pages: `/fleet/hatchback`, `/fleet/sedan`, `/fleet/suv-muv`, `/fleet/executive-suv`
  2. *Selective Route Strategy:* Out of 511 total master routes, 158 verified routes are submitted to the sitemap. This is a deliberate, technically sound strategy preventing Googlebot from indexing unverified or thin routes before full editorial vetting.

---

## 4. Heading & Metadata Architecture

### 4.1 Page Title Audit
- **Length Benchmark:** 50 - 65 characters.
- **Current Structure:** All public templates incorporate descriptive titles using the format `[Primary Keyword] | Urgent Taxis`.
- **Finding:** A small subset of blog article titles and airport transfer titles exceed 65 characters (e.g. 72–78 characters) and risk desktop SERP truncation with ellipsis (`...`).
- **Recommendation:** Refine titles exceeding 65 characters to place the primary target city and intent within the first 50 characters.

### 4.2 Meta Description Audit
- **Length Benchmark:** 120 - 155 characters.
- **Current Status:** All audited public templates feature hand-crafted, keyword-aligned descriptions containing the official phone number (+91 7310651940) or service scope.
- **Finding:** In `frontend/lib/seo.ts`, the `constructMetadata` utility truncates descriptions at 155 characters. However, a few locality descriptions are slightly shorter (85–95 characters), missing an opportunity to mention 24/7 Masuri/Ghaziabad dispatch.

### 4.3 Heading Hierarchy (H1, H2, H3)
- **Single H1 Rule:** 100% of analyzed pages feature exactly one semantic `<h1>` tag containing the primary page subject.
- **H2 Semantic Flow:** Pages follow a clean logical sequence:
  - Route Pages: `H1: [Origin] to [Destination] Taxi` → `H2: Route Overview` → `H2: Cab Options & Fare` → `H2: Route Map` → `H2: Route Highlights` → `H2: Places on Route` → `H2: Frequently Asked Questions`.
  - Locality Pages: `H1: Taxi Service in [Locality]` → `H2: Cab Fares` → `H2: Available Fleet` → `H2: Airport Connectivity` → `H2: Local FAQs`.

---

## 5. Structured Data (JSON-LD) Technical Review

### 5.1 Active Schemas on Production
1. **`TaxiService` Schema:**
   - Active on Homepage (`/`), Locality Pages (`/taxi-service/[locality]`), and Route Pages (`/routes/[slug]`).
   - Contains exact official office address in Masuri, Ghaziabad, contact numbers (`+917310651940`), 24/7 opening hours, and `areaServed` array.
2. **`BreadcrumbList` Schema:**
   - Active on Route pages and Blog detail pages.
3. **`Article` / `BlogPosting` Schema:**
   - Active on all 16 blog posts in `frontend/app/(public)/blog/[slug]/page.tsx`.
4. **`FAQPage` Schema:**
   - Active on Route pages, Homepage, and Locality pages.

### 5.2 Critical Schema Insight (Next.js `<Script>` vs Server-Rendered JSON-LD)
- **Issue Discovered:** In `frontend/components/public/PageFAQSection.tsx`, the FAQ schema is rendered via Next.js `next/script` (`<Script id="..." type="application/ld+json">`). In some Next.js configurations, `next/script` defaults to client-side injection during hydration rather than immediate inclusion in the initial raw SSR HTML stream.
- **Solution:** Migrate `PageFAQSection` to use direct standard `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />`. This guarantees that Googlebot sees the `FAQPage` schema on the initial HTML fetch without relying on headless JS execution.

---

## 6. Mobile Usability & Viewports

All pages pass automated viewport rendering across the full spectrum:
- **Small Mobile:** 320px, 360px, 375px (iPhone SE, Galaxy S)
- **Modern Smartphone:** 390px, 430px (iPhone 14/15/16 Pro, Pixel 8)
- **Tablet / Foldable:** 768px, 1024px (iPad Mini, iPad Pro)
- **Desktop / Laptop:** 1366px, 1440px, 1920px (MacBook, Full HD monitors)
- **Touch Targets:** All primary buttons (`Call Now`, `WhatsApp`, `Search Cabs`, `Book Online`) maintain minimum 48px height and generous touch padding.
