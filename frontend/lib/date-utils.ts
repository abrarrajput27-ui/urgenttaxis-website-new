/**
 * Universal Date and Time Formatting Utilities for Urgent Taxis.
 * Ensures consistent 12-hour AM/PM format, readable dates without timezone skew,
 * and standard multi-day round-trip day calculations.
 */

/**
 * Formats a time string or ISO datetime to clean 12-hour AM/PM format (e.g. "09:00 AM", "02:30 PM").
 * Handles:
 * - 24-hr times: "09:00" -> "09:00 AM", "14:30" -> "02:30 PM", "14:30:00" -> "02:30 PM"
 * - Already 12-hr: "9:00 am" -> "09:00 AM", "02:15 PM" -> "02:15 PM"
 * - ISO string: "2026-11-09T14:30:00.000Z" -> "02:30 PM" (or local)
 * - Empty / null -> fallback "09:00 AM"
 */
export function formatTime12Hour(timeStr?: string | null): string {
  if (!timeStr) return '09:00 AM';
  const clean = String(timeStr).trim();

  // If already like "9:00 AM" or "09:30 PM"
  const ampmMatch = clean.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
  if (ampmMatch) {
    const hh = String(Number(ampmMatch[1])).padStart(2, '0');
    const mm = ampmMatch[2];
    const ampm = ampmMatch[3].toUpperCase();
    return `${hh}:${mm} ${ampm}`;
  }

  // 24-hour format like "14:30" or "09:00" or "14:30:00"
  const match24 = clean.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (match24) {
    const h = Number(match24[1]);
    const mm = match24[2];
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${String(hour12).padStart(2, '0')}:${mm} ${ampm}`;
  }

  // ISO Date string containing 'T'
  if (clean.includes('T')) {
    try {
      const dt = new Date(clean);
      if (!isNaN(dt.getTime())) {
        return dt.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
      }
    } catch {
      // fallback
    }
  }

  return clean;
}

/**
 * Formats a date string cleanly to "Weekday, D Mon YYYY" (e.g. "Mon, 9 Nov 2026").
 * Avoids UTC timezone shifts for YYYY-MM-DD input.
 */
export function formatDateReadable(dateStr?: string | null): string {
  if (!dateStr) {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  const clean = String(dateStr).trim();

  // Handle YYYY-MM-DD explicitly to prevent UTC timezone skew
  const ymdMatch = clean.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (ymdMatch) {
    const [, y, m, d] = ymdMatch;
    const dt = new Date(Number(y), Number(m) - 1, Number(d));
    return dt.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  try {
    const dt = new Date(clean);
    if (!isNaN(dt.getTime())) {
      return dt.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  } catch {
    // fallback
  }

  return clean;
}

/**
 * Formats a full datetime into a readable string: "Mon, 9 Nov 2026 at 09:00 AM".
 */
export function formatDateTimeReadable(dateOrIso?: string | Date | null): string {
  if (!dateOrIso) return 'Immediate / Flexible';
  try {
    const dt = typeof dateOrIso === 'string' ? new Date(dateOrIso) : dateOrIso;
    if (isNaN(dt.getTime())) {
      return String(dateOrIso);
    }
    const datePart = dt.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const timePart = dt.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${datePart} at ${timePart}`;
  } catch {
    return String(dateOrIso);
  }
}

/**
 * Calculates number of calendar days between two dates for round-trip cab billing.
 * Same day = 1 Day. Next day = 2 Days.
 */
export function calculateRoundTripDays(startDate?: string | null, endDate?: string | null): number {
  if (!startDate || !endDate) return 1;
  try {
    const s = String(startDate).split('T')[0];
    const e = String(endDate).split('T')[0];
    const d1 = new Date(s);
    const d2 = new Date(e);
    const diffTime = d2.getTime() - d1.getTime();
    if (diffTime < 0) return 1;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diffDays);
  } catch {
    return 1;
  }
}

export interface ReturnTimelineInput {
  pickupDate?: string | null;
  pickupTime?: string | null;
  returnDate?: string | null;
  returnTime?: string | null;
  returnDistanceKm?: number;
}

export interface ReturnTimelineResult {
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  returnDurationMinutes: number;
  returnDurationText: string;
  finalArrivalDate: string;
  finalArrivalTime: string;
  finalArrivalDateTimeIso: string;
  readableFinalArrival: string;
  tripDays: number;
  totalNights: number;
}

/**
 * Calculates the complete return journey timeline and inclusive trip calendar days.
 * Return Journey Time = vehicle departure time from destination.
 * Final Arrival Time = arrival at final drop location after actual road duration.
 * Trip Days = calendar days from pickup date to calculated final arrival date (inclusive).
 */
export function calculateReturnTimeline(input: ReturnTimelineInput): ReturnTimelineResult {
  const today = new Date().toISOString().split('T')[0];
  const pDate = input.pickupDate ? String(input.pickupDate).split('T')[0] : today;
  const pTime = input.pickupTime ? String(input.pickupTime).trim() : '09:00';
  const rDate = input.returnDate ? String(input.returnDate).split('T')[0] : pDate;
  // Recommended default return time: 23:59 (11:59 PM)
  const rTime = input.returnTime ? String(input.returnTime).trim() : '23:59';

  const returnDist = Math.max(20, Number(input.returnDistanceKm) || 200);
  // Average commercial outstation highway pace: ~50 km/h including short halts
  const returnDurationMinutes = Math.max(45, Math.round((returnDist / 50) * 60));
  const hrs = Math.floor(returnDurationMinutes / 60);
  const mins = returnDurationMinutes % 60;
  const returnDurationText = mins > 0 ? `${hrs}h ${mins}m` : `${hrs} hrs`;

  // Parse return departure datetime
  let rYear = 2026;
  let rMonth = 11;
  let rDay = 14;
  const rDateParts = rDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (rDateParts) {
    rYear = Number(rDateParts[1]);
    rMonth = Number(rDateParts[2]);
    rDay = Number(rDateParts[3]);
  }

  let rH = 23;
  let rM = 59;
  const rTimeParts = rTime.match(/^(\d{1,2}):(\d{2})/);
  if (rTimeParts) {
    rH = Number(rTimeParts[1]);
    rM = Number(rTimeParts[2]);
  }

  // Calculate final arrival by adding return travel duration
  const departureDt = new Date(rYear, rMonth - 1, rDay, rH, rM, 0);
  const arrivalDt = new Date(departureDt.getTime() + returnDurationMinutes * 60 * 1000);

  const arrY = arrivalDt.getFullYear();
  const arrM = String(arrivalDt.getMonth() + 1).padStart(2, '0');
  const arrD = String(arrivalDt.getDate()).padStart(2, '0');
  const finalArrivalDate = `${arrY}-${arrM}-${arrD}`;

  const arrH = String(arrivalDt.getHours()).padStart(2, '0');
  const arrMin = String(arrivalDt.getMinutes()).padStart(2, '0');
  const finalArrivalTime = `${arrH}:${arrMin}`;

  // Parse pickup date for calendar day difference
  let pYear = rYear;
  let pMonth = rMonth;
  let pDay = rDay;
  const pDateParts = pDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (pDateParts) {
    pYear = Number(pDateParts[1]);
    pMonth = Number(pDateParts[2]);
    pDay = Number(pDateParts[3]);
  }

  const startDateObj = new Date(pYear, pMonth - 1, pDay);
  const endDateObj = new Date(arrY, Number(arrM) - 1, Number(arrD));
  const diffTime = endDateObj.getTime() - startDateObj.getTime();
  const daySpan = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const tripDays = Math.max(1, daySpan);
  const totalNights = Math.max(0, tripDays - 1);

  const readableFinalArrival = `${formatDateReadable(finalArrivalDate)} at ${formatTime12Hour(finalArrivalTime)}`;

  return {
    pickupDate: pDate,
    pickupTime: pTime,
    returnDate: rDate,
    returnTime: rTime,
    returnDurationMinutes,
    returnDurationText,
    finalArrivalDate,
    finalArrivalTime,
    finalArrivalDateTimeIso: arrivalDt.toISOString(),
    readableFinalArrival,
    tripDays,
    totalNights,
  };
}
