'use client';

import React from 'react';
import UnifiedBookingWidget from './UnifiedBookingWidget';

export interface RouteBookingWidgetProps {
  defaultOrigin?: string;
  defaultDestination?: string;
  defaultDistanceKm?: number;
  routeId?: string;
  className?: string;
}

/**
 * RouteBookingWidget adapter.
 * Strict Requirement: Pickup and Drop fields must remain blank by default.
 * Route pages display route title and informational content, but booking form
 * leaves pickup and drop blank for manual customer selection.
 */
export default function RouteBookingWidget({
  defaultOrigin = '',
  defaultDestination = '',
  defaultDistanceKm = 0,
  routeId = '',
  className = '',
}: RouteBookingWidgetProps) {
  return (
    <UnifiedBookingWidget
      initialServiceType="one_way"
      defaultOrigin=""
      defaultDestination=""
      defaultDistanceKm={defaultDistanceKm}
      routeId={routeId}
      className={className}
    />
  );
}
