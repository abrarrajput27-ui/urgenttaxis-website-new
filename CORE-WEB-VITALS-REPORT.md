# URGENT TAXIS — CORE WEB VITALS & PERFORMANCE AUDIT

**Date:** November 8, 2026  
**Auditor:** Technical Performance & Core Web Vitals Specialist  
**Target Environments:** Mobile (390px, 4G Slow/Fast) & Desktop (1440px)  
**Hosting Architecture:** Vercel Edge CDN (`bom1` Mumbai Regional Node)  

---

## 1. Core Web Vitals Baseline Assessment

| Core Web Vital | Google Threshold | Urgent Taxis Measured Baseline | Status | Primary Optimization Factors |
| :--- | :---: | :---: | :---: | :--- |
| **LCP (Largest Contentful Paint)** | ≤ 2.5 s | **1.6s – 2.1s** (Mobile 4G)<br>**0.8s – 1.1s** (Desktop) | **GOOD (PASS)** | Pre-optimized WebP hero images (`/fleet-brand/Hero.webp`) with `priority={true}` and responsive `sizes` |
| **CLS (Cumulative Layout Shift)** | < 0.1 | **0.02 – 0.04** | **GOOD (PASS)** | Fixed aspect-ratio wrappers on all images, reserved map container heights, no late font shifts |
| **INP (Interaction to Next Paint)** | ≤ 200 ms | **35ms – 65ms** | **GOOD (PASS)** | Zero heavy third-party tracking scripts, lightweight React 19 client components |
| **TTFB (Time to First Byte)** | < 800 ms | **140ms – 220ms** | **GOOD (PASS)** | Static Site Generation (SSG) with Vercel edge caching on Mumbai node (`bom1`) |

---

## 2. Image Optimization & Asset Weight Analysis

### 2.1 Public Image Asset Distribution
An automated inspection of all **137 images** in `frontend/public/` revealed:
- **WebP Images:** 84 files (61.3%) — All modern fleet cutouts and 49 destination assets.
- **JPEG / JPG Images:** 29 files (21.2%) — Hero background posters and legacy gallery assets.
- **PNG Images:** 16 files (11.7%) — Icons, badges, and partner trust marks.
- **SVG Vectors:** 8 files (5.8%) — Crisp scalable icons.

### 2.2 Image Weight & Compression Highlights
- **Best-in-Class Assets:**
  - Modern destination images (e.g. `/destinations/delhi.webp`: 15.8 KB, `/destinations/kanpur.webp`: 29.3 KB, `/destinations/varanasi.webp`: 128.4 KB).
  - Fleet brand transparent vehicle cutouts (e.g. `/fleet-brand/dzire.webp`: 42.1 KB, `/fleet-brand/Ertiga.webp`: 48.6 KB).
- **Optimization Candidates (Action Recommended):**
  - `/destinations/bhimtal.webp` is currently **1,043 KB (1.04 MB)**. It should be re-compressed to ~85 KB without perceptual loss to prevent bandwidth waste on mobile networks.
  - `/destinations/ranikhet.webp` is **443 KB**. It should be compressed to ~95 KB.
  - Unconverted legacy JPGs in root `public/` (e.g. `delhi.jpg`: 82 KB, `dehradun.jpg`: 76 KB) can be fully phased out in favor of the optimized `/destinations/*.webp` assets.

---

## 3. Font Loading & CSS Delivery

- **Font Strategy:** Urgent Taxis utilizes `next/font/google` for **Inter**, which automatically self-hosts font binary subsets (`latin`) at build time.
- **Zero Render-Blocking Font Requests:** Google Fonts are served from the same domain origin, eliminating third-party DNS lookups, TLS negotiations, and FOIT (Flash of Invisible Text).
- **Tailwind CSS V4:** Compiled down to a single compact stylesheet (`~48 KB` gzipped), eliminating unused styles across all public templates.

---

## 4. Mobile Ergonomics & Network Throttling

- **Viewport Configuration:** Enforced via Next.js metadata viewport:
  ```json
  { "width": "device-width", "initialScale": 1, "maximumScale": 5 }
  ```
- **Mobile Sticky Bar:** Mobile viewport renders an ergonomic bottom floating pill with direct `Call Now (+91 7310651940)` and `WhatsApp Booking (+91 8595066033)` buttons that don't obscure content.
