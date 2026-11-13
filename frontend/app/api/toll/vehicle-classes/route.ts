import { NextResponse } from 'next/server';

export const VEHICLE_TOLL_CLASSES = [
  {
    vehicle_id: 'sedan',
    website_vehicle_name: 'Sedan (Dzire / Etios)',
    axle_count: 2,
    provider_vehicle_class: '2AxlesAuto',
    official_toll_class: 'Car / Jeep / Van',
    registration_category: 'Commercial Tourist Taxi (Yellow Plate)',
    is_active: true,
  },
  {
    vehicle_id: 'ertiga',
    website_vehicle_name: 'Ertiga (6-Seater SUV)',
    axle_count: 2,
    provider_vehicle_class: '2AxlesAuto',
    official_toll_class: 'Car / Jeep / Van',
    registration_category: 'Commercial Tourist Taxi (Yellow Plate)',
    is_active: true,
  },
  {
    vehicle_id: 'suv',
    website_vehicle_name: 'SUV (Innova / XUV700)',
    axle_count: 2,
    provider_vehicle_class: '2AxlesAuto',
    official_toll_class: 'Car / Jeep / Van / SUV',
    registration_category: 'Commercial Tourist Taxi (Yellow Plate)',
    is_active: true,
  },
  {
    vehicle_id: 'tempo_traveller',
    website_vehicle_name: 'Tempo Traveller (12/16 Seater)',
    axle_count: 2,
    provider_vehicle_class: '2AxlesLCV',
    official_toll_class: 'Light Commercial Vehicle (LCV)',
    registration_category: 'Commercial Maxi Cab',
    is_active: true,
  },
  {
    vehicle_id: 'force_traveller',
    website_vehicle_name: 'Force Traveller (20/26 Seater)',
    axle_count: 2,
    provider_vehicle_class: '2AxlesLCV',
    official_toll_class: 'Mini Bus / LCV',
    registration_category: 'Commercial Stage / Contract Carriage',
    is_active: true,
  },
  {
    vehicle_id: 'force_urbania',
    website_vehicle_name: 'Force Urbania (12/16 Seater Luxury)',
    axle_count: 2,
    provider_vehicle_class: '2AxlesLCV',
    official_toll_class: 'Light Commercial Vehicle (LCV)',
    registration_category: 'Commercial Luxury Van',
    is_active: true,
  },
  {
    vehicle_id: 'minibus',
    website_vehicle_name: 'Minibus (27 Seater)',
    axle_count: 2,
    provider_vehicle_class: '2AxlesBus',
    official_toll_class: 'Bus / Mini Bus (2 Axle)',
    registration_category: 'Heavy Passenger Vehicle',
    is_active: true,
  },
  {
    vehicle_id: 'bus_coach',
    website_vehicle_name: 'Bus / Coach (45 Seater)',
    axle_count: 3,
    provider_vehicle_class: '3AxlesBus',
    official_toll_class: 'Multi-Axle Commercial Bus',
    registration_category: 'Heavy Passenger Bus',
    is_active: true,
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: VEHICLE_TOLL_CLASSES,
  });
}
