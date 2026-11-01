'use client';

import React from 'react';
import UnifiedBookingWidget, { BookingServiceType } from './UnifiedBookingWidget';
import { PricingLocalPackage, VehicleCategory, Route, Location } from '@/types/database';

export interface PublicFareWidgetProps {
  localPackages?: PricingLocalPackage[];
  categories?: VehicleCategory[];
  routes?: Route[];
  locations?: Location[];
  initialServiceType?: BookingServiceType;
  defaultOrigin?: string;
  defaultDestination?: string;
  defaultDistanceKm?: number;
  routeId?: string;
  className?: string;
}

/**
 * PublicFareWidget adapter.
 * Strict Requirement: Pickup and Drop fields must remain blank by default.
 * Locations must be selected manually by the customer.
 */
export default function PublicFareWidget({
  initialServiceType = 'one_way',
  className = '',
}: PublicFareWidgetProps) {
  return (
    <UnifiedBookingWidget
      initialServiceType={initialServiceType}
      defaultOrigin=""
      defaultDestination=""
      defaultDistanceKm={0}
      routeId=""
      className={className}
    />
  );
}
