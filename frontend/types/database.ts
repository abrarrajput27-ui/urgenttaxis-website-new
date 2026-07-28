export type FuelType = 'Petrol' | 'Diesel' | 'CNG' | 'Electric' | 'Hybrid' | 'Other';
export type FleetStatus = 'available' | 'booked' | 'on_trip' | 'maintenance' | 'blocked' | 'inactive';
export type DisplayMode = 'exact_vehicle' | 'vehicle_model' | 'model_or_similar' | 'category_or_similar';

export interface VehicleCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VehicleModel {
  id: string;
  category_id: string;
  brand_name: string;
  model_name: string;
  slug: string;
  master_image_url: string | null;
  display_mode: DisplayMode;
  is_active: boolean;
  created_at: string;
  vehicle_categories?: VehicleCategory;
}

export interface VehicleVariant {
  id: string;
  model_id: string;
  variant_name: string;
  fuel_type: FuelType;
  seating_capacity: number;
  luggage_capacity_large: number;
  is_active: boolean;
  created_at: string;
  vehicle_models?: VehicleModel;
}

export interface Amenity {
  id: string;
  name: string;
  icon_name: string | null;
  is_active: boolean;
}

export interface Vendor {
  id: string;
  company_name: string;
  contact_person: string;
  phone: string;
  email: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Driver {
  id: string;
  full_name: string;
  phone: string;
  license_number: string;
  vendor_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ActualFleet {
  id: string;
  variant_id: string;
  registration_number: string | null;
  chassis_number: string | null;
  vendor_id: string | null;
  default_driver_id: string | null;
  status: FleetStatus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  vehicle_variants?: VehicleVariant & {
    vehicle_models?: VehicleModel & {
      vehicle_categories?: VehicleCategory;
    };
  };
  vendors?: Vendor;
  drivers?: Driver;
}

export interface Location {
  id: string;
  name: string;
  city: string;
  state: string;
  location_type: 'city' | 'airport' | 'railway_station' | 'tourist_spot';
  is_active: boolean;
  created_at: string;
}

export interface Route {
  id: string;
  origin_location_id: string;
  destination_location_id: string;
  estimated_distance_km: number;
  estimated_duration_minutes: number | null;
  is_active: boolean;
  created_at: string;
  origin?: Location;
  destination?: Location;
}

export interface PricingOneWay {
  id: string;
  route_id: string;
  category_id: string;
  base_fare: number;
  included_km: number;
  extra_km_rate: number;
  driver_allowance: number;
  default_included_charges: string[];
  default_excluded_charges: string[];
  is_active: boolean;
  created_at: string;
  routes?: Route;
  vehicle_categories?: VehicleCategory;
}

export interface PricingRoundTrip {
  id: string;
  category_id: string;
  min_km_per_day: number;
  per_km_rate: number;
  driver_allowance_per_day: number;
  night_halt_charge: number;
  default_included_charges: string[];
  default_excluded_charges: string[];
  is_active: boolean;
  created_at: string;
  vehicle_categories?: VehicleCategory;
}

export interface PricingLocalPackage {
  id: string;
  category_id: string;
  package_name: string;
  included_hours: number;
  included_km: number;
  package_price: number;
  extra_hour_rate: number;
  extra_km_rate: number;
  default_included_charges: string[];
  default_excluded_charges: string[];
  is_active: boolean;
  created_at: string;
  vehicle_categories?: VehicleCategory;
}

export interface PricingAirportTransfer {
  id: string;
  airport_location_id: string;
  city_zone_location_id: string;
  category_id: string;
  base_fare: number;
  included_km: number;
  extra_km_rate: number;
  default_included_charges: string[];
  default_excluded_charges: string[];
  is_active: boolean;
  created_at: string;
  airport_location?: Location;
  city_zone_location?: Location;
  vehicle_categories?: VehicleCategory;
}

export interface DynamicPricingRule {
  id: string;
  rule_name: string;
  trip_type: 'one_way' | 'round_trip' | 'local_rental' | 'airport_transfer' | null;
  category_id: string | null;
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  adjustment_type: 'percentage' | 'flat';
  adjustment_value: number;
  priority: number;
  is_active: boolean;
  created_at: string;
  vehicle_categories?: VehicleCategory;
}

export interface FareSnapshot {
  id: string;
  booking_id: string | null;
  automatic_fare: number;
  manual_override_fare: number | null;
  final_fare: number;
  override_reason: string | null;
  overridden_by_user_id: string | null;
  breakdown_json: Record<string, unknown>;
  created_at: string;
}

export interface CMSPage {
  id: string;
  slug: string;
  title: string;
  content_markdown: string | null;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

