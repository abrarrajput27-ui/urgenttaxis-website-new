import { supabase } from '@/lib/supabase/client';
import { CalculateFareResult } from './calculator';
import { FareSnapshot } from '@/types/database';
import { logClientAudit } from '@/lib/audit';

export interface CreateSnapshotInput {
  bookingId: string;
  calculationResult: CalculateFareResult;
  manualOverrideFare?: number;
  overrideReason?: string;
  userId?: string;
}

export interface CreateSnapshotResult {
  success: boolean;
  snapshot?: FareSnapshot;
  error?: string;
}

/**
 * Pure Server-Side Fare Snapshot & Override Engine
 * 
 * Rules:
 * 1. Store automatic_fare from calculator.
 * 2. If manualOverrideFare is supplied, overrideReason is MANDATORY.
 * 3. final_fare = manualOverrideFare ?? automaticFare.
 * 4. Snapshots are IMMUTABLE. Once written for a booking_id, they can NEVER be updated or overwritten.
 * 5. Audit logs are created for every fare snapshot and override mutation.
 */
export async function createFareSnapshot(
  input: CreateSnapshotInput
): Promise<CreateSnapshotResult> {
  const { bookingId, calculationResult, manualOverrideFare, overrideReason, userId } = input;

  if (!bookingId || bookingId.trim() === '') {
    return { success: false, error: 'Booking ID is required to record a fare snapshot.' };
  }

  if (!calculationResult || typeof calculationResult.automaticFare !== 'number') {
    return { success: false, error: 'Valid calculation result is required to record a fare snapshot.' };
  }

  const isOverrideApplied = manualOverrideFare !== undefined && manualOverrideFare !== null;

  if (isOverrideApplied) {
    if (typeof manualOverrideFare !== 'number' || isNaN(manualOverrideFare) || manualOverrideFare < 0) {
      return { success: false, error: 'Manual override fare must be a valid non-negative number.' };
    }
    if (!overrideReason || overrideReason.trim() === '') {
      return {
        success: false,
        error: 'Mandatory override reason must be provided when manually overriding a fare fare.',
      };
    }
  }

  const finalFare = isOverrideApplied ? manualOverrideFare! : calculationResult.automaticFare;

  try {
    // 1. Immutability Check: Ensure snapshot does not already exist
    const { data: existingSnapshot } = await supabase
      .from('fare_snapshots')
      .select('id')
      .eq('booking_id', bookingId)
      .single();

    if (existingSnapshot) {
      return {
        success: false,
        error: `Fare snapshot already exists for Booking ID "${bookingId}". Fare snapshots are strictly immutable.`,
      };
    }

    // 2. Prepare Snapshot Payload
    const payload = {
      booking_id: bookingId,
      automatic_fare: calculationResult.automaticFare,
      manual_override_fare: isOverrideApplied ? manualOverrideFare : null,
      final_fare: finalFare,
      override_reason: isOverrideApplied ? overrideReason?.trim() : null,
      overridden_by_user_id: isOverrideApplied ? userId || null : null,
      breakdown_json: JSON.parse(JSON.stringify(calculationResult)),
    };

    // 3. Database Insert
    const { data: snapshot, error: insertError } = await supabase
      .from('fare_snapshots')
      .insert(payload)
      .select('*')
      .single();

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    // 4. Audit Log Entry (Ensure NO secrets or tokens logged)
    const auditAction = isOverrideApplied ? 'MANUAL_FARE_OVERRIDE' : 'AUTOMATIC_FARE_SNAPSHOT';
    await logClientAudit(
      auditAction,
      'fare_snapshots',
      snapshot.id,
      null,
      {
        booking_id: bookingId,
        automatic_fare: calculationResult.automaticFare,
        manual_override_fare: snapshot.manual_override_fare,
        final_fare: snapshot.final_fare,
        override_reason: snapshot.override_reason,
        overridden_by_user_id: snapshot.overridden_by_user_id,
        calculated_at: calculationResult.calculatedAt,
      }
    );

    return { success: true, snapshot };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to record fare snapshot.';
    return { success: false, error: msg };
  }
}
