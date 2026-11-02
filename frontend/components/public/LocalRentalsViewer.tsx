'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { LOCAL_RENTAL_CONFIG, calculateAdvanceToken, buildWhatsAppBookingLink } from '@/lib/pricing';

interface FleetCardInfo {
  key: string;
  name: string;
  models: string;
  seats: number;
  bags: number;
  image: string;
  badge?: string;
  group: 'cabs' | 'suvs' | 'tempo' | 'bus';
}

const FLEET_CLASSES: FleetCardInfo[] = [
  {
    key: 'hatchback',
    name: 'Hatchback',
    models: 'WagonR, Tiago, Celerio',
    seats: 4,
    bags: 1,
    image: '/fleet-brand/Hatchback.png',
    badge: 'Budget Value',
    group: 'cabs',
  },
  {
    key: 'sedan',
    name: 'Sedan',
    models: 'Maruti Dzire, Toyota Etios',
    seats: 4,
    bags: 2,
    image: '/fleet-brand/dzire.png',
    badge: 'Most Popular',
    group: 'cabs',
  },
  {
    key: 'suv-muv',
    name: 'SUV / MPV',
    models: 'Maruti Ertiga, Carens',
    seats: 6,
    bags: 4,
    image: '/fleet-brand/Ertiga.png',
    badge: 'Family Favorite',
    group: 'suvs',
  },
  {
    key: 'executive-suv',
    name: 'Innova Crysta',
    models: 'Toyota Innova Crysta',
    seats: 7,
    bags: 5,
    image: '/fleet-brand/Innova Crysta.png',
    badge: 'Premium Luxury',
    group: 'suvs',
  },
  {
    key: 'tempo12',
    name: 'Tempo 12-Seater',
    models: 'Force Tempo Traveller',
    seats: 12,
    bags: 8,
    image: '/fleet-brand/Tempo Traveller.png',
    badge: 'Small Group',
    group: 'tempo',
  },
  {
    key: 'tempo16',
    name: 'Tempo 16-Seater',
    models: 'Force Tempo Traveller',
    seats: 16,
    bags: 12,
    image: '/fleet-brand/Tempo Traveller.png',
    badge: 'Touring Group',
    group: 'tempo',
  },
  {
    key: 'tempo20',
    name: 'Tempo 20-Seater',
    models: 'Force Tempo Traveller',
    seats: 20,
    bags: 15,
    image: '/fleet-brand/Tempo Traveller.png',
    badge: 'Corporate Group',
    group: 'tempo',
  },
  {
    key: 'tempo26',
    name: 'Tempo 26-Seater',
    models: 'Force Tempo Traveller',
    seats: 26,
    bags: 20,
    image: '/fleet-brand/Tempo Traveller.png',
    badge: 'Large Group',
    group: 'tempo',
  },
  {
    key: 'urbania12',
    name: 'Force Urbania 12S',
    models: 'Force Urbania Luxury',
    seats: 12,
    bags: 10,
    image: '/fleet-brand/Urbania.png',
    badge: 'VIP Executive',
    group: 'tempo',
  },
  {
    key: 'urbania16',
    name: 'Force Urbania 16S',
    models: 'Force Urbania Luxury',
    seats: 16,
    bags: 14,
    image: '/fleet-brand/Urbania.png',
    badge: 'VIP Executive',
    group: 'tempo',
  },
  {
    key: 'bus27',
    name: 'Mini Bus 27-Seater',
    models: 'Tata / Eicher Deluxe AC',
    seats: 27,
    bags: 25,
    image: '/fleet-brand/Bus.png',
    badge: 'Group Event',
    group: 'bus',
  },
  {
    key: 'bus45',
    name: 'Coach Bus 45-Seater',
    models: 'BharatBenz / Volvo Luxury',
    seats: 45,
    bags: 45,
    image: '/fleet-brand/volvo bus.png',
    badge: 'Marriage / Tour',
    group: 'bus',
  },
];

export default function LocalRentalsViewer() {
  const [selectedPackage, setSelectedPackage] = useState<'8h80km' | '12h120km'>('8h80km');
  const [activeGroup, setActiveGroup] = useState<'all' | 'cabs' | 'suvs' | 'tempo' | 'bus'>('all');

  const filteredFleet = FLEET_CLASSES.filter(
    (car) => activeGroup === 'all' || car.group === activeGroup
  );

  return (
    <div className="space-y-8 font-sans">
      {/* 1. PACKAGE DURATION SELECTOR TABS */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <div className="bg-slate-200/80 p-1.5 rounded-2xl flex max-w-md w-full border border-slate-300/80">
          <button
            type="button"
            onClick={() => setSelectedPackage('8h80km')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              selectedPackage === '8h80km'
                ? 'bg-[#1e1b4b] text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            ⏱️ 8 Hours / 80 KM (Full Day)
          </button>
          <button
            type="button"
            onClick={() => setSelectedPackage('12h120km')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              selectedPackage === '12h120km'
                ? 'bg-[#1e1b4b] text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            🌙 12 Hours / 120 KM (Extended)
          </button>
        </div>
      </div>

      {/* 2. FLEET CATEGORY FILTER CHIPS */}
      <div className="flex overflow-x-auto justify-start sm:justify-center gap-2 pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'All Fleet (12 Models)' },
          { id: 'cabs', label: 'Sedan & Hatchback' },
          { id: 'suvs', label: 'SUVs & Innova' },
          { id: 'tempo', label: 'Tempo & Urbania' },
          { id: 'bus', label: 'Deluxe Buses' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveGroup(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
              activeGroup === tab.id
                ? 'bg-[#059669] border-[#059669] text-white shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. PACKAGE CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFleet.map((car) => {
          const config = LOCAL_RENTAL_CONFIG[car.key] || LOCAL_RENTAL_CONFIG['sedan'];
          const pkg = config[selectedPackage];
          const tokenAmount = calculateAdvanceToken(pkg.basePrice, 30);
          const balanceAmount = pkg.basePrice - tokenAmount;

          const whatsappUrl = buildWhatsAppBookingLink({
            serviceType: 'Local rental',
            vehicleName: car.name,
            origin: 'Ghaziabad / Delhi NCR',
            destination: selectedPackage === '8h80km' ? '8h/80km Local Package' : '12h/120km Local Package',
            estimatedFare: pkg.basePrice,
            pageUrl: 'https://www.urgenttaxis.in/local-rentals',
          });

          return (
            <div
              key={car.key}
              className="bg-white border-2 border-slate-200 hover:border-indigo-900/40 rounded-3xl p-6 space-y-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-black text-slate-900">{car.name}</h3>
                  {car.badge && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                      {car.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 font-semibold mb-3">{car.models}</p>

                {/* Car Image */}
                <div className="relative h-32 w-full my-2 flex items-center justify-center">
                  <Image
                    src={car.image}
                    alt={car.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>

                {/* Specs */}
                <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold mb-4">
                  <span className="bg-slate-100 px-2 py-1 rounded-lg">👥 {car.seats} Seats</span>
                  <span className="bg-slate-100 px-2 py-1 rounded-lg">🧳 {car.bags} Bags</span>
                  <span className="bg-slate-100 px-2 py-1 rounded-lg">❄️ AC</span>
                </div>

                {/* Pricing Box */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs">
                  <div className="flex justify-between items-baseline border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-700">Package Fare ({pkg.hours}H / {pkg.km}KM):</span>
                    <span className="font-mono text-xl font-black text-slate-900">
                      ₹{pkg.basePrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>30% Advance Token:</span>
                    <span className="font-mono font-black">₹{tokenAmount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>70% Driver Balance:</span>
                    <span className="font-mono font-bold text-slate-800">₹{balanceAmount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="pt-2 border-t border-dashed border-slate-200 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div>
                      <span className="text-slate-400 block">Extra KM:</span>
                      <strong className="text-slate-900">₹{pkg.extraKmRate}/KM</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Extra Hour:</span>
                      <strong className="text-slate-900">₹{pkg.extraHourRate}/Hour</strong>
                    </div>
                  </div>
                </div>

                {/* Inclusions text */}
                <div className="text-[11px] text-slate-500 font-medium space-y-0.5 pt-2">
                  <p className="text-emerald-700 font-bold">✓ Fuel, Chauffeur Allowance & Doorstep Pickup</p>
                  <p className="text-amber-700 font-medium">⚠️ Tolls, State Border Taxes & Parking at Actuals</p>
                </div>
              </div>

              {/* CTAs */}
              <div className="pt-3 space-y-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 text-center"
                >
                  💬 Book on WhatsApp
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
