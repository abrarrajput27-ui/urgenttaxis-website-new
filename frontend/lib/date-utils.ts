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
