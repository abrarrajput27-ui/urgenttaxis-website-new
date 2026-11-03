import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, checkLookupRateLimit, recordFailedLookup } from '@/lib/security/rate-limiter';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params;
  const cleanRef = reference?.trim();

  // SEC-02: Rate limit check
  const clientIp = getClientIp(req.headers);
  const rateLimitStatus = await checkLookupRateLimit(clientIp);

  if (!rateLimitStatus.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: rateLimitStatus.error || 'Too many lookup requests. Please retry later.',
        retryAfter: rateLimitStatus.retryAfterSeconds,
      },
      { status: 429, headers: { 'Retry-After': String(rateLimitStatus.retryAfterSeconds) } }
    );
  }

  if (!cleanRef || !/^UT-[A-Za-z0-9_-]+$/i.test(cleanRef)) {
    await recordFailedLookup(clientIp);
    return NextResponse.json({ success: false, message: 'Invalid booking reference format' }, { status: 400 });
  }

  // Redirect client to the print-optimized invoice view
  const url = new URL(`/booking-confirmation/${cleanRef}/invoice`, req.url);
  return NextResponse.redirect(url, 307);
}
