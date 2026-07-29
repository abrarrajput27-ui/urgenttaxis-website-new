# Phase 5F: Booking Status Flow Implementation & Audit

## Objective
To strictly define, codify, and enforce a clear booking lifecycle based on the existing `booking_status_enum` without inventing new schemas. The system must prevent invalid state transitions, explicitly separate payment statuses from booking statuses, and securely govern transitions strictly server-side.

## Files Created & Modified
- `frontend/lib/booking/status-machine.ts` - New finite state machine (FSM) class.
- `frontend/app/api/public/pay-token/route.ts` - Integrated the FSM to govern payment and booking status upgrades.

## Architecture & Lifecycle Rules
1. **Existing Enums Used**:
   - `BookingStatus`: `pending`, `confirmed`, `assigned`, `on_trip`, `completed`, `cancelled`.
   - `PaymentStatus`: `unpaid`, `partially_paid`, `paid`, `refunded`.
2. **Server-Side FSM**:
   - The `BookingStatusMachine` enforces structural directed graphs.
   - Example Blocks: It is mathematically impossible to transition `completed -> in_progress` or `cancelled -> confirmed` because the FSM strictly returns `false` and the API halts the transaction with `400 Bad Request`.
3. **Decoupled Yet Dependent**:
   - Booking and Payment statuses are explicitly separate variables.
   - However, the server evaluates the 25% token rule dynamically: a booking *can only* transition from `pending -> confirmed` if `BookingStatusMachine.validateTokenRequirementForConfirmation` mathematically verifies the payment covers the frozen `token_amount`. 
   - A booking *never* becomes confirmed simply because the database row exists.
4. **Immutable Fare Preservation**:
   - `fare_snapshots` is left strictly untouched during any of these status lifecycle events.

## Database Migrations
**None.** The existing Phase 1 (`001_extensions_and_enums.sql`) Enums were perfectly adequate. No destructive DB operations were needed.

## Test Results
- Simulated valid transition (`pending -> confirmed` upon 25% token pay): Passes.
- Simulated invalid transition (`cancelled -> confirmed`): Blocked securely by FSM API.
- Re-tested NextJS Build: `npm run build` succeeds completely.

## Conclusion
Phase 5F is complete. The operational lifecycle is now mathematically constrained and secure, preventing any ambiguous states from emerging.
