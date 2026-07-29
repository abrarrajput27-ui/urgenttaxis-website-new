export type BookingStatus = 'pending' | 'confirmed' | 'assigned' | 'on_trip' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid' | 'refunded';

/**
 * Valid transitions for Booking Status.
 * Key = Current Status
 * Value = Array of allowed Next Statuses
 */
const BOOKING_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['assigned', 'cancelled'],
  assigned: ['on_trip', 'cancelled'],
  on_trip: ['completed', 'cancelled'], // Cancelled during trip might be rare but structurally possible
  completed: [], // Terminal state
  cancelled: [], // Terminal state
};

/**
 * Valid transitions for Payment Status.
 */
const PAYMENT_STATUS_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  unpaid: ['partially_paid', 'paid'],
  partially_paid: ['paid', 'refunded'],
  paid: ['refunded'],
  refunded: [], // Terminal state
};

export class BookingStatusMachine {
  
  /**
   * Check if a booking status transition is valid
   */
  static canTransitionBooking(currentStatus: BookingStatus, nextStatus: BookingStatus): boolean {
    if (currentStatus === nextStatus) return true; // No-op is always valid
    const allowed = BOOKING_STATUS_TRANSITIONS[currentStatus];
    return allowed ? allowed.includes(nextStatus) : false;
  }

  /**
   * Check if a payment status transition is valid
   */
  static canTransitionPayment(currentStatus: PaymentStatus, nextStatus: PaymentStatus): boolean {
    if (currentStatus === nextStatus) return true;
    const allowed = PAYMENT_STATUS_TRANSITIONS[currentStatus];
    return allowed ? allowed.includes(nextStatus) : false;
  }

  /**
   * Enforces the rule that a booking can only be confirmed if the 25% token is met.
   * This is a server-side only validation rule.
   */
  static validateTokenRequirementForConfirmation(totalPaid: number, requiredToken: number): boolean {
    return totalPaid >= requiredToken;
  }
}
