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

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}
