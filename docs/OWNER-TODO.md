# Urgent Taxis — Owner Action Checklist (Plain & Simple)

Welcome! This is your clear, step-by-step checklist of things that **only you as the business owner** can set up, decide, or approve.

Everything else in the code, website structure, speed, security, and search engine optimization has already been built and tested for you.

---

## 0. PHASE 1 PRICING RECONCILIATIONS & RATE CONFIRMATIONS

During our comprehensive Phase 1 pricing audit across the website, we eliminated all pricing conflicts and implemented `frontend/lib/pricing.ts` as the single source of truth:

### A. Route Price Conflicts Resolved
1. **Ghaziabad to Haridwar:** Previous directory showed ₹2,970, old route page showed ₹3,999 (due to adding toll). We locked the single master fare at **₹3,499** (30% token: ₹1,050; driver balance: ₹2,449). Tolls and parking are now shown separately as "estimated at actuals".
2. **Delhi to Haridwar:** Master fixed fare is **₹3,999** (30% token: ₹1,200; driver balance: ₹2,799).
3. **Delhi to Agra:** Master fixed fare is **₹3,499** (30% token: ₹1,050; driver balance: ₹2,449).
4. **Delhi to Jaipur:** Master fixed fare is **₹4,499** (30% token: ₹1,350; driver balance: ₹3,149).
5. **Delhi to Dehradun:** Master fixed fare is **₹4,299** (30% token: ₹1,290; driver balance: ₹3,009).
6. **Delhi to Chandigarh:** Master fixed fare is **₹4,199** (30% token: ₹1,260; driver balance: ₹2,939).

### B. Confirmed Local Rental Rates (8h/80km) & Derived 12h/120km Rates
Formula for 12h/120km: `8h Base Price + (40 km × extra_km_rate) + (4 hr × extra_hour_rate)`
- **Hatchback:** 8h/80km: ₹1,200 | 12h/120km: ₹2,200 (extra ₹10/km, ₹150/hr)
- **Sedan:** 8h/80km: ₹1,500 | 12h/120km: ₹2,660 (extra ₹11/km, ₹180/hr)
- **SUV/MPV (Ertiga):** 8h/80km: ₹2,000 | 12h/120km: ₹3,480 (extra ₹15/km, ₹220/hr)
- **Innova Crysta:** 8h/80km: ₹2,500 | 12h/120km: ₹4,300 (extra ₹20/km, ₹250/hr)
- **Tempo 12:** 8h/80km: ₹3,500 | 12h/120km: ₹5,660 (extra ₹24/km, ₹300/hr)
- **Tempo 16:** 8h/80km: ₹4,500 | 12h/120km: ₹6,940 (extra ₹26/km, ₹350/hr)
- **Tempo 20:** 8h/80km: ₹5,500 | 12h/120km: ₹8,220 (extra ₹28/km, ₹400/hr)
- **Tempo 26:** 8h/80km: ₹6,500 | 12h/120km: ₹9,580 (extra ₹32/km, ₹450/hr)
- **Force Urbania 12:** 8h/80km: ₹5,000 | 12h/120km: ₹7,600 (extra ₹30/km, ₹350/hr)
- **Force Urbania 16:** 8h/80km: ₹6,000 | 12h/120km: ₹8,960 (extra ₹34/km, ₹400/hr)
- **Mini Bus 27:** 8h/80km: ₹8,000 | 12h/120km: ₹12,000 (extra ₹45/km, ₹550/hr)
- **Bus 45:** 8h/80km: ₹12,000 | 12h/120km: ₹17,200 (extra ₹55/km, ₹750/hr)

*Review item:* If you prefer round figures for 12h/120km (e.g. ₹2,500 flat for Sedan), you can update us anytime.

---

## 1. Questions Requiring Your Immediate Clarification

### A. Official Business Email
The website currently displays **`info@urgenttaxis.in`** as the single unified contact email across the Header, Footer, and Google schema.
- [ ] **Question:** Is `info@urgenttaxis.in` already set up with active email hosting / MX records to receive incoming emails from customers, or would you like customer inquiries routed to an alternate email address (e.g. a business Gmail)?

### B. Extra-Km Rate Conflicts (Local Package Pricing)
We unified all extra km rates across outstation and local packages based on your confirmed inputs:
- Sedan extra km: **₹11/km**
- Ertiga SUV extra km: **₹15/km**
- Innova Crysta extra km: **₹20/km**

### C. Airport Transfer Fares & Flight Delay Policy Approval
The dedicated IGI Airport transfer pages (`/airport-transfers/...`) display the following starting fares:
- **Ghaziabad to IGI Airport (46 km):** Sedan: **₹1,199** | Ertiga (6-Seater): **₹1,699** | Crysta: **₹2,799**
- **Noida to IGI Airport (42 km):** Sedan: **₹1,199** | Ertiga (6-Seater): **₹1,699** | Crysta: **₹2,799**
- **Greater Noida to IGI Airport (62 km):** Sedan: **₹1,499** | Ertiga (6-Seater): **₹2,099** | Crysta: **₹3,299**
- **Flight Delay Waiting Policy:** Stated as free waiting if the customer's incoming flight is delayed.
- [ ] **Decision Required:** Please review and confirm these exact fare figures and waiting policies for your live fleet operations.

---

## 2. Google Business Profile (Top Local Ranking Factor)
Google needs to verify that Urgent Taxis is a real, registered transport service at your Masuri address.
- [ ] Go to [google.com/business](https://www.google.com/business/) and sign in with your business Gmail.
- [ ] Add your exact business name: **Urgent Taxis**
- [ ] Set business category to: **Taxi Service** (Secondary: *Airport Shuttle Service*, *Tour Operator*)
- [ ] Enter your exact registered address:  
  **Shop No. 09, S. R. Complex, Railway Station Road, Masuri, Ghaziabad, Uttar Pradesh 201302**
- [ ] Enter phone number: **+91 7310651940**
- [ ] Enter website URL: **https://www.urgenttaxis.in**
- [ ] Select Service Areas: Ghaziabad, Masuri, Indirapuram, Vaishali, Vasundhara, Raj Nagar, Noida, Greater Noida, East Delhi.
- [ ] Upload real photos of your office, sign board, and clean cars with commercial yellow number plates.

---

## 3. Google Search Console & Bing Webmaster Verification
- [ ] Go to [search.google.com/search-console](https://search.google.com/search-console).
- [ ] Add property: `https://www.urgenttaxis.in`.
- [ ] The verification tag `gmiuOYv-8DEgSTJdyAa9-uNXHyO8PdwcK94l-mgFjTM` is already embedded in your website layout. Simply click **Verify**.
- [ ] Once verified, click **Sitemaps** in the left menu.
- [ ] Submit `sitemap.xml` (your website automatically generates this at `https://www.urgenttaxis.in/sitemap.xml` with all 560+ canonical pages).

---

## 4. Official Social Media Profiles
When you create your official social media pages, add the exact URLs to `frontend/lib/config.ts` under `socialProfiles`:
- [ ] Facebook page URL (e.g. `https://facebook.com/urgenttaxis`)
- [ ] Instagram profile URL (e.g. `https://instagram.com/urgenttaxis`)
- [ ] YouTube channel URL (if you create video walkthroughs)
*(Note: Until you provide these URLs, the website automatically keeps social icons hidden so visitors never click on dead links).*

---

## 5. Real Customer Reviews
Never buy fake reviews. To rank higher in local search:
- [ ] After every completed outstation trip or airport drop, send a polite WhatsApp message to the passenger asking:  
  *"Thank you for traveling with Urgent Taxis! If you enjoyed your ride, could you take 30 seconds to give us a 5-star review on Google?"*
- [ ] Once your Google Business Profile is live, Google gives you a short review link (e.g., `https://g.page/r/your-id/review`). Copy that link and save it in `frontend/lib/config.ts`.

---

## 6. Real Fleet Photos
- [ ] Replace temporary placeholder car graphics with crisp photos of your actual commercial vehicles (Maruti Dzire, Maruti Ertiga, Toyota Innova Crysta).
- [ ] Take photos in broad daylight showing the clean exterior and spotless interior seats.
- [ ] Save photos in `.webp` format and place them in `frontend/public/fleet-brand/`.

---

## 7. Official WhatsApp Business Account
- [ ] Download **WhatsApp Business** on the phone holding number **+91 73106 51940**.
- [ ] Set your display name to **Urgent Taxis**.
- [ ] Add your logo (`logo.jpg`), business address (Masuri, Ghaziabad), opening hours (24/7), and website (`https://www.urgenttaxis.in`).
- [ ] Enable automated quick replies (e.g. Greeting message when a customer inquires for fares).
