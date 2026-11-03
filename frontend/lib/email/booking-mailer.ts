/**
 * Urgent Taxis - Transactional Email Dispatcher
 * Phase 4 & SEC-03/SEC-04 Compliance:
 * 1. Inspect email credentials (RESEND_API_KEY, SMTP, etc.)
 * 2. If credentials missing: safely skip, return NOT_CONFIGURED, log cleanly without throwing
 * 3. If credentials present: send branded confirmation email via Resend API
 * 4. SEC-03: Never log customer PII in plain text; mask email addresses in console output
 * 5. SEC-04: Multi-tier deduplication (fast-path in-memory cache + persistent customer_communications query)
 * 6. Failure resilience: NEVER fail or roll back the parent booking or payment transaction
 */

import { maskEmailAddress } from '@/lib/security/masking';
import { supabaseAdmin } from '@/lib/supabase/admin';

export interface BookingEmailItemAddOn {
  name: string;
  price: number;
}

export interface BookingEmailData {
  bookingId?: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string;
  serviceType: string;
  pickupAddress: string;
  dropAddress?: string | null;
  intermediateStops?: string[];
  travelDateTime: string;
  returnDateTime?: string | null;
  vehicleName: string;
  baseFare: number;
  addOns?: BookingEmailItemAddOn[];
  addOnTotal?: number;
  customerPayable: number;
  tokenAmount: number;
  balanceAmount: number;
  bookingStatus?: string;
  paymentStatus?: string;
}

export interface EmailDispatchResult {
  success: boolean;
  status: 'SENT' | 'NOT_CONFIGURED' | 'DEDUPLICATED' | 'NO_RECIPIENT' | 'DISPATCH_FAILED';
  messageId?: string;
  error?: string;
  deduplicated?: boolean;
}

// In-memory fast-path deduplication set
export const sentBookingEmailCache = new Set<string>();

/**
 * Sends a transactional booking confirmation email to the customer.
 * Sourced strictly from authoritative fare snapshot data.
 */
export async function sendBookingConfirmationEmail(
  bookingReference: string,
  data: BookingEmailData
): Promise<EmailDispatchResult> {
  const recipientEmail = data.customerEmail?.trim();

  // 1. Check if recipient email exists
  if (!recipientEmail || !recipientEmail.includes('@')) {
    console.log(`[EMAIL_DISPATCHER: NO_RECIPIENT] Booking ${bookingReference}: No customer email provided. Skipping email dispatch.`);
    return {
      success: false,
      status: 'NO_RECIPIENT',
      error: 'Customer did not provide a valid email address.',
    };
  }

  // 2. SEC-04: Tier 1 - Check in-memory fast-path deduplication cache
  const deduplicationKey = `${bookingReference}:${data.paymentStatus || 'unpaid'}`;
  if (sentBookingEmailCache.has(deduplicationKey)) {
    console.log(`[EMAIL_DISPATCHER: DEDUPLICATED_MEM] Booking ${bookingReference}: Email for status '${data.paymentStatus}' already sent in current process.`);
    return {
      success: true,
      status: 'DEDUPLICATED',
      deduplicated: true,
    };
  }

  // 3. SEC-04: Tier 2 - Atomic reservation in customer_communications database ledger
  let reservationId: string | null = null;
  if (data.bookingId && data.customerId) {
    try {
      const adminClient = supabaseAdmin();

      // Check existing completed or active communications
      const { data: existingComms } = await adminClient
        .from('customer_communications')
        .select('id, message_summary, created_at')
        .eq('booking_id', data.bookingId)
        .eq('channel', 'EMAIL')
        .eq('direction', 'OUTBOUND')
        .limit(1);

      if (existingComms && existingComms.length > 0) {
        const comm = existingComms[0];
        const createdAt = new Date(comm.created_at).getTime();
        const isRecentPending = comm.message_summary === 'DISPATCH_PENDING' && (Date.now() - createdAt < 5 * 60 * 1000);
        const isCompleted = comm.message_summary !== 'DISPATCH_PENDING';

        if (isCompleted || isRecentPending) {
          sentBookingEmailCache.add(deduplicationKey);
          console.log(`[EMAIL_DISPATCHER: DEDUPLICATED_DB] Booking ${bookingReference}: Email already recorded or claimed in customer_communications ledger.`);
          return {
            success: true,
            status: 'DEDUPLICATED',
            deduplicated: true,
          };
        }
      }

      // Attempt atomic reservation claim to strictly prevent concurrent worker duplicate dispatch
      const { data: claim, error: claimErr } = await adminClient
        .from('customer_communications')
        .insert({
          customer_id: data.customerId,
          booking_id: data.bookingId,
          channel: 'EMAIL',
          direction: 'OUTBOUND',
          message_summary: 'DISPATCH_PENDING',
        })
        .select('id')
        .single();

      if (claimErr) {
        // If unique constraint violation (PostgreSQL 23505), another worker won the reservation race
        if (claimErr.code === '23505' || claimErr.message?.includes('duplicate key') || claimErr.message?.includes('uq_cust_comms')) {
          sentBookingEmailCache.add(deduplicationKey);
          console.log(`[EMAIL_DISPATCHER: DEDUPLICATED_CONCURRENT] Booking ${bookingReference}: Concurrent claim collision caught. Deduplicated safely.`);
          return {
            success: true,
            status: 'DEDUPLICATED',
            deduplicated: true,
          };
        }
        console.warn('[EMAIL_DISPATCHER: CLAIM_WARN] Non-fatal ledger claim warning:', claimErr.message);
      } else if (claim) {
        reservationId = claim.id;
      }
    } catch (dbCheckErr) {
      console.warn('[EMAIL_DISPATCHER: DB_DEDUP_WARN] Non-fatal ledger check error:', dbCheckErr);
    }
  }

  // 4. Inspect provider credentials
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const emailFrom = process.env.EMAIL_FROM?.trim() || 'Urgent Taxis <bookings@urgenttaxis.in>';

  if (!resendApiKey) {
    // If credentials missing, release any temporary reservation so future dispatches with valid keys are permitted
    if (reservationId) {
      try {
        const adminClient = supabaseAdmin();
        await adminClient.from('customer_communications').delete().eq('id', reservationId);
      } catch (delErr) {
        console.warn('[EMAIL_DISPATCHER: CLEANUP_WARN] Non-fatal reservation release warning:', delErr);
      }
    }

    console.warn(
      `[EMAIL_DISPATCHER: NOT_CONFIGURED] Booking ${bookingReference}: Email dispatch skipped. Missing RESEND_API_KEY in environment variables.`
    );
    return {
      success: false,
      status: 'NOT_CONFIGURED',
      error: 'Email provider credentials (RESEND_API_KEY) are not configured in environment variables.',
    };
  }

  // 5. Construct Email HTML
  const addOnsListHtml = (data.addOns && data.addOns.length > 0)
    ? data.addOns.map((a) => `<tr><td style="padding: 6px 12px; color: #475569; font-size: 13px;">${a.name}</td><td style="padding: 6px 12px; text-align: right; color: #0f172a; font-weight: 600; font-size: 13px;">₹${a.price.toLocaleString('en-IN')}</td></tr>`).join('')
    : '<tr><td colspan="2" style="padding: 6px 12px; color: #94a3b8; font-size: 12px; font-style: italic;">No optional add-ons selected</td></tr>';

  const stopsHtml = (data.intermediateStops && data.intermediateStops.length > 0)
    ? `<p style="margin: 4px 0 0; font-size: 13px; color: #64748b;"><strong>Stops:</strong> ${data.intermediateStops.join(' ➔ ')}</p>`
    : '';

  const returnHtml = data.returnDateTime
    ? `<p style="margin: 4px 0 0; font-size: 13px; color: #64748b;"><strong>Return Journey:</strong> ${new Date(data.returnDateTime).toLocaleString('en-IN')}</p>`
    : '';

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.urgenttaxis.in';
  const confirmationUrl = `${siteUrl}/booking-confirmation/${bookingReference}`;
  const invoiceUrl = `${confirmationUrl}/invoice`;

  const emailSubject = `Booking ${data.bookingStatus === 'confirmed' ? 'Confirmed' : 'Received'}: ${bookingReference} – Urgent Taxis`;

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${emailSubject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <div style="background: #0052cc; padding: 24px 32px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">URGENT TAXIS</h1>
      <p style="color: #93c5fd; margin: 4px 0 0; font-size: 13px; font-weight: 500;">Fast To Your Destination – Your Quick Ride Solution!</p>
    </div>

    <!-- Booking Badge -->
    <div style="padding: 24px 32px; border-bottom: 1px solid #f1f5f9; text-align: center; background: #f8fafc;">
      <span style="display: inline-block; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; border-radius: 20px; padding: 4px 16px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">
        ${data.bookingStatus === 'confirmed' ? 'Booking Confirmed' : 'Booking Request Received'}
      </span>
      <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #0f172a;">Reference: <span style="color: #0052cc;">${bookingReference}</span></h2>
      <p style="margin: 6px 0 0; font-size: 14px; color: #64748b;">Dear ${data.customerName}, thank you for choosing Urgent Taxis.</p>
    </div>

    <!-- Trip Details -->
    <div style="padding: 24px 32px; border-bottom: 1px solid #f1f5f9;">
      <h3 style="margin: 0 0 16px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; font-weight: 700;">Journey Specifications</h3>
      
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
        <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a; text-transform: capitalize;">${data.serviceType.replace('_', ' ')} Journey</p>
        <p style="margin: 8px 0 0; font-size: 13px; color: #64748b;"><strong>Pickup:</strong> ${data.pickupAddress}</p>
        ${data.dropAddress ? `<p style="margin: 4px 0 0; font-size: 13px; color: #64748b;"><strong>Drop:</strong> ${data.dropAddress}</p>` : ''}
        ${stopsHtml}
        <p style="margin: 8px 0 0; font-size: 13px; color: #64748b;"><strong>Departure:</strong> ${new Date(data.travelDateTime).toLocaleString('en-IN')}</p>
        ${returnHtml}
        <p style="margin: 8px 0 0; font-size: 13px; color: #0f172a;"><strong>Vehicle:</strong> ${data.vehicleName}</p>
      </div>
    </div>

    <!-- Pricing Summary -->
    <div style="padding: 24px 32px; border-bottom: 1px solid #f1f5f9;">
      <h3 style="margin: 0 0 16px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; font-weight: 700;">Authoritative Fare Breakdown</h3>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        <tbody>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 12px; color: #475569; font-size: 13px;">Base Vehicle Fare</td>
            <td style="padding: 8px 12px; text-align: right; color: #0f172a; font-weight: 600; font-size: 13px;">₹${data.baseFare.toLocaleString('en-IN')}</td>
          </tr>
          ${addOnsListHtml}
          <tr style="border-top: 2px solid #e2e8f0; background: #f8fafc;">
            <td style="padding: 10px 12px; color: #0f172a; font-size: 14px; font-weight: 700;">Total Customer Payable</td>
            <td style="padding: 10px 12px; text-align: right; color: #0052cc; font-size: 16px; font-weight: 800;">₹${data.customerPayable.toLocaleString('en-IN')}</td>
          </tr>
        </tbody>
      </table>

      <!-- Payment Breakdown -->
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px; display: flex; justify-content: space-between;">
        <div>
          <span style="font-size: 12px; color: #1e40af; font-weight: 700; text-transform: uppercase; display: block;">30% Advance Token</span>
          <span style="font-size: 18px; font-weight: 800; color: #1e3a8a;">₹${data.tokenAmount.toLocaleString('en-IN')}</span>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 12px; color: #475569; font-weight: 700; text-transform: uppercase; display: block;">70% Balance Due</span>
          <span style="font-size: 18px; font-weight: 800; color: #0f172a;">₹${data.balanceAmount.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>

    <!-- Call to Actions -->
    <div style="padding: 24px 32px; text-align: center; background: #ffffff;">
      <a href="${confirmationUrl}" style="display: inline-block; background: #0052cc; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 12px 24px; border-radius: 8px; margin-right: 8px;">View Booking Confirmation</a>
      <a href="${invoiceUrl}" style="display: inline-block; background: #10b981; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 12px 24px; border-radius: 8px;">Download Invoice (PDF)</a>
    </div>

    <!-- Contact & Footer -->
    <div style="padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
      <p style="margin: 0 0 6px;">Need assistance? Call/WhatsApp our 24x7 desk at <strong>+91 93117 76363</strong> or reply to this email.</p>
      <p style="margin: 0 0 6px;">Urgent Taxis Desk: 2nd Floor, Block B, Sector 62, Noida, Uttar Pradesh 201309</p>
      <p style="margin: 12px 0 0; color: #94a3b8; font-size: 11px;">Toll & state entry taxes are charged at actuals during the journey. Advance token secures vehicle reservation.</p>
    </div>

  </div>
</body>
</html>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
        'Idempotency-Key': `${bookingReference}-${data.paymentStatus || 'unpaid'}`,
      },
      body: JSON.stringify({
        from: emailFrom,
        to: recipientEmail,
        subject: emailSubject,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[EMAIL_DISPATCHER: FAILED] Resend API responded with status ${res.status}:`, errText);

      // Release reservation so safe retry is permitted
      if (reservationId) {
        try {
          const adminClient = supabaseAdmin();
          await adminClient.from('customer_communications').delete().eq('id', reservationId);
        } catch (cleanupErr) {
          console.warn('[EMAIL_DISPATCHER: CLEANUP_WARN] Non-fatal reservation release warning:', cleanupErr);
        }
      }

      return {
        success: false,
        status: 'DISPATCH_FAILED',
        error: `Provider HTTP ${res.status}: ${errText}`,
      };
    }

    const resJson = await res.json();
    sentBookingEmailCache.add(deduplicationKey);

    // SEC-03: Log masked email address to prevent PII leakage in logs
    console.log(`[EMAIL_DISPATCHER: SENT] Confirmation email sent to ${maskEmailAddress(recipientEmail)} for booking ${bookingReference} (id: ${resJson.id})`);

    // SEC-04: Confirm persistent outbound communication in database ledger
    if (reservationId) {
      try {
        const adminClient = supabaseAdmin();
        await adminClient
          .from('customer_communications')
          .update({
            message_summary: `Booking confirmation email dispatched (messageId: ${resJson.id}) for reference ${bookingReference}`,
          })
          .eq('id', reservationId);
      } catch (logErr) {
        console.warn('[EMAIL_DISPATCHER: UPDATE_WARN] Non-fatal comms recording warning:', logErr);
      }
    } else if (data.bookingId && data.customerId) {
      try {
        const adminClient = supabaseAdmin();
        await adminClient.from('customer_communications').insert({
          customer_id: data.customerId,
          booking_id: data.bookingId,
          channel: 'EMAIL',
          direction: 'OUTBOUND',
          message_summary: `Booking confirmation email dispatched (messageId: ${resJson.id}) for reference ${bookingReference}`,
        });
      } catch (logErr) {
        console.warn('[EMAIL_DISPATCHER: RECORD_WARN] Non-fatal comms recording warning:', logErr);
      }
    }

    return {
      success: true,
      status: 'SENT',
      messageId: resJson.id,
    };
  } catch (fetchErr: unknown) {
    const errorMsg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
    console.warn(`[EMAIL_DISPATCHER: NETWORK_ERROR] Booking ${bookingReference}:`, errorMsg);

    // Release reservation on network failure so safe retry is permitted
    if (reservationId) {
      try {
        const adminClient = supabaseAdmin();
        await adminClient.from('customer_communications').delete().eq('id', reservationId);
      } catch (cleanupErr) {
        console.warn('[EMAIL_DISPATCHER: CLEANUP_WARN] Non-fatal reservation release warning:', cleanupErr);
      }
    }

    return {
      success: false,
      status: 'DISPATCH_FAILED',
      error: errorMsg,
    };
  }
}

/**
 * Returns current configuration status of the transactional email service.
 */
export function getEmailServiceConfigStatus(): {
  isConfigured: boolean;
  provider: string;
  missingVariables: string[];
} {
  const missing: string[] = [];
  if (!process.env.RESEND_API_KEY) {
    missing.push('RESEND_API_KEY');
  }

  return {
    isConfigured: missing.length === 0,
    provider: 'Resend (REST API)',
    missingVariables: missing,
  };
}
