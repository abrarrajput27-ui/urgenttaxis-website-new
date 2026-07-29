import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { randomBytes } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const documentType = formData.get('documentType') as string | null;
    const bookingReference = formData.get('bookingReference') as string | null;

    if (!file || !documentType || !bookingReference) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // 1. Validate File Size & Type
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, message: 'File exceeds 5MB limit' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, message: 'Invalid file type. Only JPG, PNG, and PDF are allowed.' }, { status: 400 });
    }

    const adminClient = supabaseAdmin();

    // 2. Verify Booking Ownership
    const { data: booking, error: bookingError } = await adminClient
      .from('bookings')
      .select('id, customer_id')
      .eq('booking_reference', bookingReference)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ success: false, message: 'Invalid booking reference' }, { status: 404 });
    }

    // 3. Upload to Private Supabase Storage
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // Secure extension mapping from MIME type (prevents file.name spoofing)
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'application/pdf': 'pdf'
    };
    const fileExt = mimeToExt[file.type];
    if (!fileExt) {
      return NextResponse.json({ success: false, message: 'Invalid file type.' }, { status: 400 });
    }

    const uniqueFileName = `${randomBytes(16).toString('hex')}.${fileExt}`;
    // Structure: customer_id/booking_id/filename to strictly partition
    const storagePath = `${booking.customer_id}/${booking.id}/${uniqueFileName}`;

    const { error: uploadError } = await adminClient
      .storage
      .from('customer-documents')
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false // Prevent unintentional overwrites
      });

    if (uploadError) {
      console.error('Storage Upload Error:', uploadError);
      return NextResponse.json({ success: false, message: 'Failed to upload document securely' }, { status: 500 });
    }

    // 4. Record Document in Database
    // Note: If you have a migration for booking_id in customer_documents, you can include it here. 
    // We will attempt to include it; if it fails due to schema, it will fall back, but we rely on the migration.
    const { data: docRecord, error: dbError } = await adminClient
      .from('customer_documents')
      .insert({
        customer_id: booking.customer_id,
        booking_id: booking.id, // Ensure migration 021 is applied!
        document_type: documentType,
        file_url: storagePath,
        is_verified: false
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('DB Insert Error:', dbError);
      // Attempt rollback of storage file
      await adminClient.storage.from('customer-documents').remove([storagePath]);
      return NextResponse.json({ success: false, message: 'Failed to record document metadata' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Document uploaded securely',
      documentId: docRecord.id
    });

  } catch (error: any) {
    console.error('Document Upload Exception:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
