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

export default function PublicFareWidget({
  initialServiceType = 'one_way',
  routes = [],
  defaultOrigin,
  defaultDestination,
  defaultDistanceKm,
  routeId,
  className = '',
}: PublicFareWidgetProps) {
  const origin = defaultOrigin || routes[0]?.origin?.name || 'Delhi NCR';
  const dest = defaultDestination || routes[0]?.destination?.name || 'Agra';
  const dist = defaultDistanceKm || (routes[0]?.estimated_distance_km ? Number(routes[0].estimated_distance_km) : 240);
  const rId = routeId || routes[0]?.id || '';

  return (
    <UnifiedBookingWidget
      initialServiceType={initialServiceType}
      defaultOrigin={origin}
      defaultDestination={dest}
      defaultDistanceKm={dist}
      routeId={rId}
      className={className}
    />
  );
}
