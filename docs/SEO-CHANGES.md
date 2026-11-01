# Urgent Taxis — Technical SEO, Content & Conversion Overhaul Report

**Website:** [https://www.urgenttaxis.in](https://www.urgenttaxis.in)  
**Registered Head Office:** Shop No. 09, S. R. Complex, Railway Station Road, Masuri, Ghaziabad, Uttar Pradesh 201302  
**Primary Contact:** +91 7310651940 | WhatsApp: +91 8595066033  
**Branch:** `seo-overhaul` (All changes isolated and verified locally; NOT pushed to production)

---

## 1. Executive Summary (In Plain English)

Your website previously had several technical errors that stopped search engines like Google from ranking it at the top, along with missing pages that competitors were using to attract customers. 

We have completely overhauled your website without breaking any of your existing 490 outstation routes, your brand identity, or your existing booking workflows. 

### Key Improvements Made:
1. **Brand Name Title Bug Fixed:** Google was seeing duplicate titles like `Delhi to Agra Taxi | Urgent Taxis | Urgent Taxis`. We fixed the code so each page now has a clean, professional title.
2. **Broken Rupee Symbol Fixed:** Across your route data files, the Indian Rupee symbol `₹` was broken and displaying as weird characters (`Γé╣ 2,889`). We cleaned all 218 instances across the entire website.
3. **20 Dedicated Locality Pages Created:** We created high-ranking local landing pages for Ghaziabad and 19 key areas (Indirapuram, Vaishali, Vasundhara, Raj Nagar, Noida, Greater Noida, Delhi, etc.) with real local landmarks, expressway routes, and live outstation fares.
4. **5 Dedicated Airport Transfer Pages:** New pages for IGI Airport Terminal 1, 2, and 3 pickups from Ghaziabad, Noida, and Greater Noida with fixed pricing from ₹1,199.
5. **15 In-Depth Travel & Route Guides:** We created 15 detailed blog articles (covering Haridwar, Nainital, Agra, Dehradun, Jaipur, Ayodhya, Kainchi Dham, etc.) with rich reading content and internal booking links.
6. **Mobile Quick-Call & WhatsApp Sticky Bar:** Added a thumb-friendly bottom bar on mobile phones so customers can tap to Call or WhatsApp your team with one tap.
7. **Transparent Fare & Cancellation Policy Page:** Created `/booking-policy` detailing how per-km rates, night allowances, and tolls work.
8. **Removed Fabricated / Risky Claims:** Removed unverified customer counts ("10,000+ Happy Customers") and trademarked aggregator logos (MakeMyTrip, Savaari) to protect your brand reputation.

---

## 2. Detailed Technical SEO Fixes

### A. Title & Meta Description Cleanup
- **Problem:** Next.js `layout.tsx` was configured with a title template `%s | Urgent Taxis`, but individual pages were also manually adding `| Urgent Taxis`. This resulted in ugly, unprofessional double-branded titles in Google search results.
- **Fix:** We updated `frontend/lib/seo.ts` to cleanly format titles without duplication, enforced a strict 155-character limit on meta descriptions, and ensured every page has its canonical URL pointing to `https://www.urgenttaxis.in/...`.

### B. Character Encoding & Rupee Sign Corruption
- **Problem:** A file encoding issue had corrupted the rupee sign into mojibake (`Γé╣`) in `processed-master-routes.json` and `master-routes.json`.
- **Fix:** Systematically replaced all 218 corrupted occurrences with proper UTF-8 `₹`. Added `<meta charSet="utf-8" />` and `<html lang="en-IN">` in the root layout to ensure flawless rendering on all international browsers and mobile devices.

### C. OpenStreetMap Route Embeds
- **Problem:** The route detail page had a placeholder labeled "Live Route Map" which was displaying a static logo image instead of a real map.
- **Fix:** Replaced with a keyless OpenStreetMap interactive embed and a direct button linking to Google Maps driving directions between the origin and destination.

### D. Single Source of Truth (`frontend/lib/config.ts`)
- **Problem:** Phone numbers, addresses, rates, and policies were scattered and hardcoded across different files, making updates error-prone.
- **Fix:** Built `frontend/lib/config.ts` holding:
  - Phone: `+91 7310651940` (Primary), `+91 8595066033` (WhatsApp)
  - Registered Head Office: S. R. Complex, Railway Station Road, Masuri, Ghaziabad 201302
  - Standardized rates: Hatchback ₹10/km, Sedan ₹11/km, Ertiga ₹15/km, Innova Crysta ₹20/km
  - Minimum round trip baseline: 250 km/day
  - Driver night allowance: ₹300 (10 PM - 6 AM)

### E. Modern Structured Data (JSON-LD Schemas)
Search engines can now read structured data directly from your code:
- `TaxiService` Schema on all route and locality pages.
- `FAQPage` Schema with question-answer accordions for Google rich snippets.
- `BlogPosting` Schema on all 15 blog guides with author, published date, and keywords.
- `BreadcrumbList` Schema on all pages for clean navigation trails in Google SERPs.

---

## 3. Brand & Quality Guarantees Verified

- **Permanent Designer Credit:** In `frontend/components/public/Footer.tsx`, the credit:
  ```html
  <div className="footer-designer-credit">
    <span>Designed by </span>
    <strong>Mantsha Khan</strong>
  </div>
  ```
  remains 100% intact, protected, and fully visible across the entire website.
- **Brand Colors:** Maintained navy blue (`#1a419c` / `#0b101e`) and brand green (`#00a859`).
- **Official Logo:** Uses `/logo.jpg` consistently across desktop and mobile.
- **Tagline:** Preserved "Fast To Your Destination — Your Quick Ride Solution!" and Hindi tagline "हमेशा आपके साथ!".
