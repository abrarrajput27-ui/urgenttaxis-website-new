# How to Add or Update a Taxi Route in Urgent Taxis (Beginner's Guide)

Adding new outstation routes helps your website capture more customers searching for specific city-to-city trips. This simple guide shows you how to add a route without writing code.

---

## 1. Where Routes Are Stored
All 490 outstation routes on the website are maintained in this data file:
`frontend/lib/data/processed-master-routes.json`

*(A backup is also kept in `frontend/lib/data/master-routes.json`)*.

---

## 2. Route Structure Explained
Every route entry in the file looks like this:

```json
{
  "id": "delhi-to-nainital",
  "name": "Delhi to Nainital Taxi",
  "slug": "delhi-to-nainital-taxi",
  "origin": "Delhi",
  "destination": "Nainital",
  "distanceKm": 295,
  "durationText": "6 hr 30 min",
  "popular": true,
  "pickupPoints": ["Delhi Airport (T3)", "New Delhi Railway Station", "Anand Vihar ISBT", "Ghaziabad"],
  "dropPoints": ["Mall Road", "Tallital", "Mallital", "Bhimtal"],
  "highlights": ["Scenic hill views", "Naini Lake", "Comfortable mountain-ready cabs"],
  "faqs": [
    {
      "q": "What is the cab fare from Delhi to Nainital?",
      "a": "One-way taxi fare starts at ₹4,299 for Sedan and ₹5,699 for Ertiga SUV."
    }
  ]
}
```

---

## 3. Important Rules for New Routes

1. **The Slug Must End in `-taxi`:**
   - Correct: `"delhi-to-ayodhya-taxi"`
   - Wrong: `"delhi-to-ayodhya"`
   *(Our system automatically protects this and redirects any old URL to the `-taxi` version).*
2. **Never Guess Distances or Fares:**
   - Check standard road distances using Google Maps.
   - Use our standard commercial pricing matrix:
     - Sedan: ₹11 / km
     - Ertiga SUV (6-Seater): ₹15 / km
     - Innova Crysta (7-Seater): ₹20 / km
3. **Use the Rupee Symbol `₹`:**
   - Always write `₹` and never type broken or alternative characters.
4. **Always Test After Saving:**
   - Run `npm run build --prefix frontend` to make sure your JSON syntax has no missing commas or brackets.

---

## 4. Automatic Features on Route Pages
When you add a route to `processed-master-routes.json`:
- The website automatically creates a new page at `/routes/[your-slug]`.
- An interactive OpenStreetMap live route map is automatically embedded.
- Full fare breakdown (Base Fare, Est. Toll, Est. State Tax, Final Fare) is automatically calculated.
- The new URL is automatically included in `https://www.urgenttaxis.in/sitemap.xml` for Google to index.
