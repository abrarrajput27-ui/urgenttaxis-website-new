# Phase 4: Fare Engine Test Matrix

This matrix guarantees all pricing rules, inclusions, overrides, and engine math behave deterministically across the 4 core service types.

## 1. One Way Tests
| Test Case ID | Scenario | Expected Outcome |
|---|---|---|
| OW-01 | Basic route within included KM | Fare = base_fare. Extra KM = 0. Token = 25%. |
| OW-02 | Route exceeds included KM | Fare = base_fare + (Extra KM * extra_km_rate). |
| OW-03 | Toll Included | Toll amount is part of `customer_payable`. Listed in `includedCharges`. |
| OW-04 | State Tax Excluded | State tax listed in `excludedCharges`. Not in `customer_payable`. |

## 2. Round Trip Tests
| Test Case ID | Scenario | Expected Outcome |
|---|---|---|
| RT-01 | 1-Day Trip, Actual < 250 KM | Billable = 250 KM. Driver allowance applied (1 day). |
| RT-02 | 1-Day Trip, Actual = 300 KM | Billable = 300 KM. Driver allowance applied (1 day). |
| RT-03 | 2-Day Trip, Actual = 400 KM | Billable = 500 KM (250*2). Driver allowance * 2. Night Halt * 1. |
| RT-04 | 3-Day Trip, Actual = 900 KM | Billable = 900 KM. Driver allowance * 3. Night Halt * 2. |

## 3. Local Rental Tests
| Test Case ID | Scenario | Expected Outcome |
|---|---|---|
| LR-01 | 4Hr/40KM used exactly | Fare = package_price. No extra charges. |
| LR-02 | 4Hr/40KM used 5Hr/40KM | Fare = package_price + (1 * extra_hour_rate). |
| LR-03 | 8Hr/80KM used 8Hr/100KM | Fare = package_price + (20 * extra_km_rate). |
| LR-04 | 12Hr/120KM used 13Hr/150KM | Fare = package_price + (1 * extra_hr) + (30 * extra_km). |

## 4. Airport Transfer Tests
| Test Case ID | Scenario | Expected Outcome |
|---|---|---|
| AT-01 | Standard City Zone to Airport | Fare = base_fare. Airport Entry Fee included. |
| AT-02 | Airport to Outskirts (Exceeds included KM) | Fare = base_fare + (Extra KM * extra_km_rate). |

## 5. Constraint & Configuration Tests
| Test Case ID | Scenario | Expected Outcome |
|---|---|---|
| CC-01 | Fuel Restriction: Diesel Only selected | Only Diesel compatible vehicles quoted. |
| CC-02 | Capacity Constraint > 4 passengers | Hatchback/Sedan filtered out, Innova quoted. |
| CC-03 | Night Charge Applicability (11 PM - 5 AM)| Night charge added to subtotal automatically. |
| CC-04 | 25% Token Calculation | Token exactly 25% of final `customer_payable`. Balance = 75%. |

## 6. Manual Override Tests
| Test Case ID | Scenario | Expected Outcome |
|---|---|---|
| MO-01 | Admin overrides One-Way fare | `customer_payable` = override fare. Original auto fare logged. Token = 25% of override. |
| MO-02 | Admin disabled override | System strictly returns `automaticFare`. |
