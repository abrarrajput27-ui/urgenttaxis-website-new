# Phase 4: Fare Engine Audit

## 1. Existing Fare Architecture
The current fare engine operates on a pure server-side architecture located in `frontend/lib/pricing/calculator.ts`, accessed via the API route `frontend/app/api/public/calculate-fare/route.ts`. The public interface is driven by `frontend/components/public/PublicFareWidget.tsx`.

## 2. Existing Pricing Tables
The current Supabase schema (`006_pricing_engine.sql` and `007_dynamic_pricing.sql`) handles four distinct service types:
- **`pricing_one_way`**: Unique per `route_id` + `category_id`. Includes `base_fare`, `included_km`, `extra_km_rate`, `driver_allowance`.
- **`pricing_round_trip`**: Unique per `category_id`. Includes `min_km_per_day`, `per_km_rate`, `driver_allowance_per_day`, `night_halt_charge`.
- **`pricing_local_packages`**: Based on `category_id` and package definitions (e.g., 4h/40km, 8h/80km).
- **`pricing_airport_transfers`**: Based on `airport_location_id`, `city_zone_location_id`, and `category_id`.
- **`dynamic_pricing_rules`**: Surge pricing (percentage/flat) based on priority, date ranges, and time windows.

## 3. Existing Calculation Flow
1. User selects inputs on `PublicFareWidget` (Route/Package, Category, Dates).
2. Widget sends an AJAX POST to `/api/public/calculate-fare`.
3. API fetches all active rules matching the criteria.
4. Engine calculates base costs, applies dynamic surge via `resolveDynamicPricingRule()`, and aggregates included/excluded JSONB lists.
5. Returns a sanitized `PublicQuotationDTO` (zero DB raw rows exposed).

## 4. Current Limitations & Risks
- **Included/Excluded Charges:** Handled as plain JSONB string arrays (e.g., `["Fuel", "Toll Tax"]`). They are not robust relational entities that can hold specific numerical values (e.g., Toll Tax = ₹300).
- **Fuel/Vehicle Constraints:** Completely missing. The engine calculates purely based on `category_id` without checking if a specific fuel type is available or requested.
- **Manual Override:** The engine strictly returns `automaticFare`. There is no mechanism for an Admin to manually override a fare for a specific quotation and record who changed it.
- **Internal Commission/Profitability:** The system only calculates the customer-facing quotation. Vendor costs, driver payouts, and company margins are not part of the `CalculateFareResult`.
- **Token Logic:** `PublicFareWidget` and the API do not calculate or return a 25% token amount or balance.
- **Hardcoded Widget State:** `PublicFareWidget` has hardcoded defaults for distance (`210` km) and days (`2`) for round trips, which needs to be properly dynamic based on actual route mapping or user input.
