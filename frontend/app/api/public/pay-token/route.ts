import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { BookingStatusMachine } from '@/lib/booking/status-machine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { booking_reference, amount, payment_mode = 'upi', transaction_reference = 'SIMULATED' } = body;

    if (!booking_reference || !amount) {
      return NextResponse.json({ success: false, message: 'Missing booking_reference or amount' }, { status: 400 });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ success: false, message: 'Invalid payment amount' }, { status: 400 });
    }

    const adminClient = supabaseAdmin();

    // 1. Fetch Booking and Fare Snapshot (Server-Authoritative)
    const { data: booking, error: bookingError } = await adminClient
      .from('bookings')
      .select(`
        id, 
        status, 
        payment_status,
        fare_snapshots (
          customer_payable,
          token_amount,
          balance_amount
        )
      `)
      .eq('booking_reference', booking_reference)
      .single();

    if (bookingError || !booking || !booking.fare_snapshots || booking.fare_snapshots.length === 0) {
      return NextResponse.json({ success: false, message: 'Booking or authoritative fare not found' }, { status: 404 });
    }

    const snapshot = booking.fare_snapshots[0];

    // 2. Fetch existing successful payments to calculate true remaining balance
    const { data: existingPayments } = await adminClient
      .from('payments')
      .select('amount')
      .eq('booking_id', booking.id)
      .eq('status', 'success');

    const totalPaidSoFar = (existingPayments || []).reduce((sum, p) => sum + Number(p.amount), 0);
    const trueRemainingBalance = snapshot.customer_payable - totalPaidSoFar;

    // 3. Validation Rule 1: Token must meet minimum 25% if this is the first payment
    if (totalPaidSoFar === 0 && numericAmount < snapshot.token_amount) {
      return NextResponse.json({ 
        success: false, 
        message: `Insufficient token. Minimum 25% required: Rs. ${snapshot.token_amount}` 
      }, { status: 400 });
    }

    // 4. Validation Rule 2: Payment cannot exceed remaining balance
    if (numericAmount > trueRemainingBalance) {
      return NextResponse.json({ 
        success: false, 
        message: `Payment exceeds remaining balance. Maximum allowed: Rs. ${trueRemainingBalance}` 
      }, { status: 400 });
    }

    // 5. Determine Payment Type & New Booking Statuses
    const isFirstPayment = totalPaidSoFar === 0;
    const isFullPayment = (totalPaidSoFar + numericAmount) >= snapshot.customer_payable;
    
    let paymentType = 'balance';
    if (isFirstPayment) {
      paymentType = isFullPayment ? 'full' : 'token';
    } else if (!isFullPayment) {
      paymentType = 'partial';
    }

    const newPaymentStatus = isFullPayment ? 'paid' : 'partially_paid';
    
    // Check if token rule is met for confirmation
    const isTokenMet = BookingStatusMachine.validateTokenRequirementForConfirmation(
      totalPaidSoFar + numericAmount, 
      snapshot.token_amount
    );

    let newBookingStatus = booking.status;
    if (booking.status === 'pending' && isTokenMet) {
      newBookingStatus = 'confirmed';
    }

    // Verify FSM Transition
    if (!BookingStatusMachine.canTransitionBooking(booking.status, newBookingStatus)) {
      return NextResponse.json({ success: false, message: `Invalid booking status transition from ${booking.status} to ${newBookingStatus}` }, { status: 400 });
    }
    if (!BookingStatusMachine.canTransitionPayment(booking.payment_status, newPaymentStatus)) {
      return NextResponse.json({ success: false, message: `Invalid payment status transition from ${booking.payment_status} to ${newPaymentStatus}` }, { status: 400 });
    }

    // 6. Execute Transaction (Insert Payment & Update Booking)
    // Supabase JS doesn't have true transactions, but we can sequence carefully or use RPC. 
    // Since Phase 5D requires no DB migrations, we'll do sequence and rollback if needed.
    
    const { data: paymentRecord, error: paymentError } = await adminClient.from('payments').insert({
      booking_id: booking.id,
      amount: numericAmount,
      payment_mode,
      transaction_reference,
      status: 'success',
      payment_type: paymentType
    }).select('id').single();

    if (paymentError || !paymentRecord) {
      if (paymentError?.code === '23505') {
        return NextResponse.json({ success: false, message: 'Duplicate payment detected' }, { status: 400 });
      }
      return NextResponse.json({ success: false, message: 'Failed to record payment.' }, { status: 500 });
    }

    const { error: updateError } = await adminClient.from('bookings').update({
      payment_status: newPaymentStatus,
      status: newBookingStatus,
      updated_at: new Date().toISOString()
    }).eq('id', booking.id);

    if (updateError) {
      // Rollback payment if booking update fails to prevent inconsistent state
      await adminClient.from('payments').delete().eq('id', paymentRecord.id);
      return NextResponse.json({ success: false, message: 'Failed to update booking status. Payment aborted.' }, { status: 500 });
    }

    // Return true calculated balance, NEVER trust frontend
    const newRemainingBalance = trueRemainingBalance - numericAmount;

    return NextResponse.json({
      success: true,
      message: 'Token validated and payment recorded successfully',
      paymentId: paymentRecord.id,
      newBookingStatus,
      newPaymentStatus,
      amountPaid: numericAmount,
      remainingBalance: newRemainingBalance
    });

  } catch (error: unknown) {
    console.error('Token Validation Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
