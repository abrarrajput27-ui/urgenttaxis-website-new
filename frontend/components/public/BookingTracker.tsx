'use client';

import { useEffect } from 'react';
import { trackBookingCompleted } from '@/lib/analytics';

interface BookingTrackerProps {
  reference: string; // Used strictly for local in-browser sessionStorage deduplication (NEVER sent to GA4)
  vehicleCategory: string;
  estimatedFareInr: number;
  tripType: string;
  originCity?: string;
  destinationCity?: string;
}

export default function BookingTracker({
  reference,
  vehicleCategory,
  estimatedFareInr,
  tripType,
  originCity,
  destinationCity,
}: BookingTrackerProps) {
  useEffect(() => {
    if (!reference) return;
    const trackedKey = `ga4_tracked_${reference}`;
    if (typeof window !== 'undefined' && sessionStorage.getItem(trackedKey)) {
      return;
    }

    trackBookingCompleted(
      vehicleCategory,
      estimatedFareInr,
      tripType,
      originCity,
      destinationCity
    );
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(trackedKey, 'true');
    }
  }, [reference, vehicleCategory, estimatedFareInr, tripType, originCity, destinationCity]);

  return null;
}
