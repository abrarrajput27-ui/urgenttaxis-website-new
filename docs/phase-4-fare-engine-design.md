# Phase 4: Fare Engine Design

## 1. Centralized Master Fare Engine Architecture
The new Master Fare Engine will completely centralize pricing rules across all service types. It will remain a pure server-side engine but will incorporate new database tables for modular charges, manual overrides, and fuel constraints.

## 2. Fuel & Vehicle Constraints
A new mapping table `vehicle_fuel_compatibility` or extensions to `vehicle_models` will be created to enforce allowed fuel types per category/model.
The Master Fare Engine will accept `fuelType` and filter pricing calculations accordingly. Only vehicles that support the required fuel type and capacity will be presented in `PublicFareWidget`.

## 3. Database Interaction Design
We will introduce new SQL extensions non-destructively:
- **`fare_charge_items`**: A lookup table of all possible charges (Toll Tax, State Border Tax, Parking, Airport Entry, Driver Allowance, Fuel Surcharge). 
- **Included/Excluded Schema Shift**: Deprecate the old `JSONB` array of strings. Transition to a junction table or a structured JSON array `[{ "chargeName": "Toll Tax", "isIncluded": true, "amount": 300 }]`.

## 4. Automatic Pricing Flow
1. API receives `serviceType`, `categoryId`, `routeId`/`packageId`/`distance`, and `fuelType`.
2. Master engine evaluates the base config (e.g. `pricing_one_way`).
3. Aggregates all `included` charge items.
4. Aggregates all `excluded` charge items (for display as "payable at actuals").
5. Applies active `dynamic_pricing_rules`.
6. Generates `automaticFare`.

## 5. Manual Override Flow
Admins (via the internal dashboard) can create a quotation and input an override.
- **Fields**: `is_manual_override`, `manual_override_amount`, `manual_override_reason`, `override_by_user_id`.
- The `calculate-fare` engine returns `overrideFare` (if enabled). The UI uses this value instead of `automaticFare` while still storing `automaticFare` for audit purposes.

## 6. Fare Snapshot Strategy (Phase 5 Prep)
Whenever a user proceeds from `PublicFareWidget` to Booking/Quotation, the exact `CalculateFareResult` JSON is dumped into the `fare_snapshots` table (which was securely extended in Phase 3).
- **Snapshot fields**: `base_fare`, `extra_km_rate`, `toll_tax`, `state_tax`, `night_charge`, `customer_payable`, `token_amount`, `balance_amount`.
- Future admin changes to `pricing_one_way` will never mutate existing `fare_snapshots`.

## 7. 25% Token Logic
The engine will compute:
- `customer_payable` = (Override ? `overrideFare` : `automaticFare`)
- `token_amount` = `customer_payable` * 0.25 (Rounded to nearest whole number).
- `balance_amount` = `customer_payable` - `token_amount`.

## 8. Business Profit / Commission Support
Internal engine logic will output (but `calculate-fare` API will hide from the public):
- `vendor_cost`
- `driver_payout`
- `company_gross_margin`

## 9. PublicFareWidget & Backward Compatibility Strategy
The `PublicFareWidget` will be refactored to:
- Dynamically fetch route distances rather than hardcoding `210` km.
- Show the 25% Token Amount.
- Pass `fuelType` and `capacity` preferences if required.
- Continue calling `/api/public/calculate-fare`. The API will parse the new structured response into the exact DTO the widget already expects, guaranteeing zero downtime.

## 10. Rollback Strategy
All database structural changes will be purely additive (new tables or nullable columns). If the new logic fails, the API route can be rolled back to the Vercel commit before Phase 4, and the database will perfectly support the old JSONB format.
