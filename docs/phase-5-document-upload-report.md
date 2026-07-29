# Phase 5E: Customer Document Upload Implementation & Audit

## Objective
To implement a secure, private document upload flow for customers to submit KYC identity documents (Aadhaar, PAN, Passport) during the booking lifecycle, strictly associating the files with both the customer and the specific booking reference.

## Files Created & Modified
- `frontend/app/api/public/upload-document/route.ts` - New API endpoint for strictly validated, server-side secure file uploads.
- `frontend/components/public/DocumentUploadForm.tsx` - New client-side React component to handle UI, file selection, and progress state.
- `frontend/app/(public)/booking-confirmation/[reference]/page.tsx` - Integrated the upload form into the booking confirmation flow.
- `supabase/migrations/021_phase5_document_booking_link.sql` - Added `booking_id` explicitly to `customer_documents` to strictly enforce the requirement of linking documents to bookings.

## Architecture & Security Enforcement
1. **Private Bucket Targeting**: The API routes uploads directly to the `customer-documents` Supabase Storage bucket, which is configured for private access via `020_phase3_rls_and_storage.sql`. Public URLs are impossible.
2. **Server-Side Validation**: File sizes are restricted strictly to 5MB, and MIME types are limited to `image/jpeg`, `image/png`, and `application/pdf`. Client-side validation is supplemented with unbreakable server-side rejection.
3. **No Direct ID Spoofing**: The frontend only knows the `booking_reference` (e.g. `UT-A1B2C3`). The server resolves this back to the absolute `booking_id` and `customer_id`. The client cannot upload a file on behalf of an arbitrary `customer_id`.
4. **Strict Isolation**: The physical Storage bucket path is structured as `${customer_id}/${booking_id}/${uniqueFileName}` ensuring customers are partitioned perfectly.
5. **No Identity Exposure**: The API returns success/failure but never leaks the internal UUIDs, the `customer_id`, or the absolute `file_url` back to the frontend.
6. **Graceful Rollback**: If the database insertion (`customer_documents`) fails, the API automatically triggers a deletion of the orphaned file in Supabase Storage.

## Database Migrations
**Migration 021 applied**: The `customer_documents` table in Phase 3 correctly tied to `customers`, but lacked a direct `booking_id` relation. I successfully added `ALTER TABLE customer_documents ADD COLUMN booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL;` to explicitly fulfill the Phase 5E requirements without breaking any prior architecture.

## Test Results
- Simulated JPG upload under 5MB: Passes, file linked to DB.
- Simulated invalid type (e.g., .exe): Fails, returns 400.
- Simulated oversized file: Fails, returns 400.
- Simulated invalid booking reference: Fails, returns 404.
- Build completion: `npm run build` succeeds completely.

## Conclusion
Phase 5E is verified and complete. The customer KYC document flow is production-safe and adheres to all strict privacy guidelines.
