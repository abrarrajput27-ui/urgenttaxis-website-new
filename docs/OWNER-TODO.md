# Urgent Taxis — Owner Action Checklist (Plain & Simple)

Welcome! This is your clear, step-by-step checklist of things that **only you as the business owner** can set up or provide. 

Everything else in the code, website structure, speed, security, and search engine optimization has already been built and tested for you.

---

## 1. Google Business Profile (Top Local Ranking Factor)
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

## 2. Google Search Console & Bing Webmaster Verification
- [ ] Go to [search.google.com/search-console](https://search.google.com/search-console).
- [ ] Add property: `https://www.urgenttaxis.in`.
- [ ] The verification tag `gmiuOYv-8DEgSTJdyAa9-uNXHyO8PdwcK94l-mgFjTM` is already embedded in your website layout. Simply click **Verify**.
- [ ] Once verified, click **Sitemaps** in the left menu.
- [ ] Submit `sitemap.xml` (your website automatically generates this at `https://www.urgenttaxis.in/sitemap.xml` with all 540+ pages).

---

## 3. Official Social Media Profiles
When you create your official social media pages, add the exact URLs to `frontend/lib/config.ts` under `socialProfiles`:
- [ ] Facebook page URL (e.g. `https://facebook.com/urgenttaxis`)
- [ ] Instagram profile URL (e.g. `https://instagram.com/urgenttaxis`)
- [ ] YouTube channel URL (if you create video walkthroughs)
*(Note: Until you provide these URLs, the website automatically keeps social icons hidden so visitors never click on dead links).*

---

## 4. Real Customer Reviews
Never buy fake reviews. To rank higher in local search:
- [ ] After every completed outstation trip or airport drop, send a polite WhatsApp message to the passenger asking:  
  *"Thank you for traveling with Urgent Taxis! If you enjoyed your ride, could you take 30 seconds to give us a 5-star review on Google?"*
- [ ] Once your Google Business Profile is live, Google gives you a short review link (e.g., `https://g.page/r/your-id/review`). Copy that link and save it in `frontend/lib/config.ts`.

---

## 5. Real Fleet Photos
- [ ] Replace temporary placeholder car graphics with crisp photos of your actual commercial vehicles (Maruti Dzire, Maruti Ertiga, Toyota Innova Crysta).
- [ ] Take photos in broad daylight showing the clean exterior and spotless interior seats.
- [ ] Save photos in `.webp` format and place them in `frontend/public/fleet-brand/`.

---

## 6. Official WhatsApp Business Account
- [ ] Download **WhatsApp Business** on the phone holding number **+91 8595066033**.
- [ ] Set your display name to **Urgent Taxis**.
- [ ] Add your logo (`logo.jpg`), business address (Masuri, Ghaziabad), opening hours (24/7), and website (`https://www.urgenttaxis.in`).
- [ ] Enable automated quick replies (e.g. Greeting message when a customer inquires for fares).
