# Phase 5A: Booking Engine & Flow Audit

## 1. Existing Public Booking Flow
- **Current State:** The current public booking flow is entirely manual and WhatsApp-based. The `PublicFareWidget` calculates the fare via the backend but redirects the user to a WhatsApp link to manually request the booking from the admin.
- **Frontend Pages:** There is no dedicated `/checkout` or `/book` page in the `(public)` directory.
- **APIs:** The `frontend/app/api/public` directory only contains `calculate-fare`. There are zero existing public APIs for creating bookings, customers, or processing payments.

## 2. Existing Database Relationships
All required database tables were previously provisioned up to Migration 020 (Phase 3). 
- **`customers`**: Stores `full_name`, `phone`, `email`.
- **`enquiries`**: Tracks lead generation (unused publicly so far).
- **`bookings`**: Stores core booking logic (`booking_reference`, `customer_id`, `category_id`, `trip_type`, `pickup_datetime`, `status`, `payment_status`). Extended in Phase 3 with `return_datetime`, `special_instructions`, `internal_notes`, etc.
- **`fare_snapshots`**: Records the frozen quotation (extended in Phase 3 with all strict numerical fields like `base_fare`, `toll_tax`, `customer_payable`, `token_amount`, `balance_amount`).
- **`payments`**: Tracks multiple payments against a booking (`payment_type` added in Phase 3: token, partial, balance).
- **`customer_documents`**: Safely stores document uploads (Aadhaar, PAN) tied to `customer_id`.

## 3. Existing Enums & Statuses
- **`booking_status_enum`**: Supports 'pending', 'confirmed', 'assigned', 'completed', 'cancelled'.
- **`payment_status_enum`**: Supports 'unpaid', 'partial', 'paid', 'refunded'.

## 4. Missing Functionality (To Build in Phase 5)
1. **Checkout UI (`/checkout`)**: A multi-step form to collect passenger details, contact info, and show the exact Master Fare Result.
2. **Document Upload UI**: Secure UI to upload Aadhaar/PAN mapping to Supabase Storage `customer-documents`.
3. **Public Booking API (`/api/public/book`)**: Server-side endpoint to:
   - Validate input.
   - Re-run `engine.ts` calculation to ensure the fare was not spoofed.
   - Insert `customers` record (or match existing by phone).
   - Insert `bookings` record.
   - Insert `fare_snapshots` record freezing the state.
4. **Booking Confirmation UI (`/booking-confirmation`)**: Displays reference number and immutable snapshot details.

## 5. Potential Conflicts & Backward Compatibility
- **PublicFareWidget**: The widget currently relies on the WhatsApp link. This must be refactored to route to the new `/checkout` page with the calculation parameters in URL search params or a temporary session store.
- **Admin Panel**: The admin panel currently relies on the same database tables. The new public booking API must map status strings exactly to the existing `booking_status_enum` so Admin dashboards instantly see public bookings.
- **File Storage RLS**: The `customer-documents` bucket has RLS. The API must handle uploading via a Service Role or securely authenticated session, since public users are anonymous.

## 6. Audit Conclusion
The database foundation is perfectly robust and ready. No destructive migrations are needed. The entire gap lies in building the Next.js UI (`/checkout`) and the Next.js API endpoints to safely orchestrate inserts across `customers`, `bookings`, and `fare_snapshots`.
