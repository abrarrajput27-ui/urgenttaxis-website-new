# Urgent Taxis Platform - Database Implementation Map

| Architecture Requirement | Database Table(s) | Migration File | RLS Policy / Storage | Functions / Triggers |
| :--- | :--- | :--- | :--- | :--- |
| **Master vs Fleet Isolation** | `vehicle_models`, `actual_fleet` | `003`, `004` | `015_rls_policies.sql` | `registration_number` NULLABLE |
| **Vehicle Display Modes** | `vehicle_models.display_mode` | `003` | `015_rls_policies.sql` | `display_mode_enum` |
| **Double-Booking Prevention** | `vehicle_unavailability_periods` | `010` | `015_rls_policies.sql` | `EXCLUDE USING GIST (tstzrange)` |
| **One-Way Outstation Pricing** | `pricing_one_way` | `006` | `015_rls_policies.sql` | `calculate_trip_fare(...)` |
| **Round-Trip Outstation Pricing** | `pricing_round_trip` | `006` | `015_rls_policies.sql` | `calculate_trip_fare(...)` |
| **Local Rental Packages** | `pricing_local_packages` | `006` | `015_rls_policies.sql` | Package tariffs |
| **Airport Transfer Pricing** | `pricing_airport_transfers` | `006` | `015_rls_policies.sql` | Zone-to-Airport tariffs |
| **Dynamic Surge Pricing** | `dynamic_pricing_rules` | `007` | `015_rls_policies.sql` | `calculate_trip_fare(...)` |
| **Immutable Fare Snapshots** | `fare_snapshots` | `011` | `015_rls_policies.sql` | `breakdown_json` JSONB |
| **Manual Fare Overrides** | `fare_snapshots` | `011` | `015_rls_policies.sql` | `override_reason` & user ID |
| **Driver Allowance Payouts** | `fleet_assignments` | `009` | `015_rls_policies.sql` | `driver_allowance_payout` field |
| **Role-Based Access Control** | `user_profiles`, `roles`, `user_roles` | `002` | `015_rls_policies.sql` | RBAC roles |
| **Immutable Audit Logging** | `audit_logs` | `014` | `015_rls_policies.sql` | Activity logging |
| **Secure Public Quote Calculator**| `pricing_*` tables | `016` | `015_rls_policies.sql` | `SECURITY DEFINER calculate_trip_fare(...)` |
| **Media & Asset Storage** | `storage.buckets`, `storage.objects`| `017` | `017_storage_buckets.sql` | Public & Private storage policies |
