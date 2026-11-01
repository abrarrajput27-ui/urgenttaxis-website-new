'use client';

import React from 'react';
import UnifiedBookingWidget from './UnifiedBookingWidget';

export interface RouteBookingWidgetProps {
  defaultOrigin: string;
  defaultDestination: string;
  defaultDistanceKm: number;
  routeId?: string;
  className?: string;
}

export default function RouteBookingWidget({
  defaultOrigin,
  defaultDestination,
  defaultDistanceKm,
  routeId = '',
  className = '',
}: RouteBookingWidgetProps) {
  return (
    <UnifiedBookingWidget
      initialServiceType="one_way"
      defaultOrigin={defaultOrigin}
      defaultDestination={defaultDestination}
      defaultDistanceKm={defaultDistanceKm}
      routeId={routeId}
      className={className}
    />
  );
}
