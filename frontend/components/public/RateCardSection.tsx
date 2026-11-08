'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LOCAL_RENTAL_CONFIG } from '@/lib/pricing';
import { generateWhatsAppLink } from '@/lib/whatsapp';

interface RateCardSectionProps {
  id?: string;
  className?: string;
}

export default function RateCardSection({ id = 'rate-card', className = '' }: RateCardSectionProps) {
  const [activeTab, setActiveTab] = useState<'hourly' | 'outstation' | 'airport'>('hourly');

  const hourlyFleetRows = [
    { key: 'hatchback', name: 'Hatchback', models: 'WagonR, Tiago', seats: '4+1' },
    { key: 'sedan', name: 'Sedan (Dzire / Etios)', models: 'Maruti Dzire, Etios', seats: '4+1' },
    { key: 'suv-muv', name: 'SUV / MUV (Ertiga)', models: 'Maruti Ertiga, Carens', seats: '6+1' },
    { key: 'executive-suv', name: 'Innova Crysta', models: 'Toyota Innova Crysta', seats: '7+1' },
    { key: 'tempo12', name: 'Tempo 12-Seater', models: 'Force Tempo Traveller', seats: '12+1' },
    { key: 'tempo16', name: 'Tempo 16-Seater', models: 'Force Tempo Traveller', seats: '16+1' },
    { key: 'tempo20', name: 'Tempo 20-Seater', models: 'Force Tempo Traveller', seats: '20+1' },
    { key: 'tempo26', name: 'Tempo 26-Seater', models: 'Force Tempo Traveller', seats: '26+1' },
    { key: 'urbania12', name: 'Force Urbania 12S', models: 'Force Urbania VIP Luxury', seats: '12+1' },
    { key: 'bus27', name: 'Mini Bus 27-Seater', models: 'Deluxe AC Coach', seats: '27+1' },
    { key: 'bus45', name: 'Coach Bus 45-Seater', models: 'Volvo / BharatBenz Luxury', seats: '45+1' },
  ];

  const outstationFleetRows = [
    {
      vehicle: 'Hatchback (WagonR / Swift)',
      seats: '4 Passengers',
      luggage: '2 Bags',
      roundTripRate: '₹9 - ₹10/km',
      oneWayRate: '₹11/km',
      minKmDay: '250 KM',
      driverAllowance: 'Included (Night: ₹300)',
      ac: 'Included',
    },
    {
      vehicle: 'Sedan (Dzire / Etios)',
      seats: '4 Passengers',
      luggage: '3 Bags',
      roundTripRate: '₹11 - ₹12/km',
      oneWayRate: '₹13.5/km',
      minKmDay: '250 KM',
      driverAllowance: 'Included (Night: ₹300)',
      ac: 'Included',
    },
    {
      vehicle: 'SUV / MPV (Maruti Ertiga)',
      seats: '6 Passengers',
      luggage: '4 Bags',
      roundTripRate: '₹15 - ₹16/km',
      oneWayRate: '₹17.5/km',
      minKmDay: '250 KM',
      driverAllowance: 'Included (Night: ₹300)',
      ac: 'Included',
    },
    {
      vehicle: 'Innova Crysta Premium',
      seats: '7 Passengers',
      luggage: '5 Bags',
      roundTripRate: '₹19 - ₹20/km',
      oneWayRate: '₹26/km',
      minKmDay: '300 KM',
      driverAllowance: 'Included (Night: ₹350)',
      ac: 'Included',
    },
    {
      vehicle: 'Tempo Traveller 12-Seater',
      seats: '12 Passengers',
      luggage: '8 Bags',
      roundTripRate: '₹24 - ₹26/km',
      oneWayRate: 'Fixed Corridor',
      minKmDay: '300 KM',
      driverAllowance: 'Included (Night: ₹500)',
      ac: 'Included',
    },
    {
      vehicle: 'Tempo Traveller 16-Seater',
      seats: '16 Passengers',
      luggage: '12 Bags',
      roundTripRate: '₹26 - ₹28/km',
      oneWayRate: 'Fixed Corridor',
      minKmDay: '300 KM',
      driverAllowance: 'Included (Night: ₹500)',
      ac: 'Included',
    },
    {
      vehicle: 'Tempo Traveller 20-Seater',
      seats: '20 Passengers',
      luggage: '15 Bags',
      roundTripRate: '₹28 - ₹30/km',
      oneWayRate: 'Fixed Corridor',
      minKmDay: '300 KM',
      driverAllowance: 'Included (Night: ₹500)',
      ac: 'Included',
    },
    {
      vehicle: 'Tempo Traveller 26-Seater',
      seats: '26 Passengers',
      luggage: '20 Bags',
      roundTripRate: '₹32 - ₹34/km',
      oneWayRate: 'Fixed Corridor',
      minKmDay: '300 KM',
      driverAllowance: 'Included (Night: ₹500)',
      ac: 'Included',
    },
    {
      vehicle: 'Force Urbania VIP Luxury',
      seats: '12-16 Passengers',
      luggage: '15 Bags',
      roundTripRate: '₹34 - ₹38/km',
      oneWayRate: 'Fixed Corridor',
      minKmDay: '300 KM',
      driverAllowance: 'Included (Night: ₹600)',
      ac: 'Included',
    },
    {
      vehicle: 'Deluxe AC Bus 27 / 45S',
      seats: '27 - 45 Passengers',
      luggage: '45 Bags',
      roundTripRate: '₹45 - ₹65/km',
      oneWayRate: 'Custom Tour',
      minKmDay: '300 KM',
      driverAllowance: 'Included (Night: ₹800)',
      ac: 'Included',
    },
  ];

  const airportCorridorRows = [
    { destination: 'Delhi IGI Airport ⇄ Ghaziabad', sedan: '₹1,599', ertiga: '₹2,199', crysta: '₹3,199', time: '1 hr 15 mins' },
    { destination: 'Delhi IGI Airport ⇄ Noida (Sec 1-150)', sedan: '₹1,499', ertiga: '₹2,099', crysta: '₹2,999', time: '1 hr' },
    { destination: 'Delhi IGI Airport ⇄ Greater Noida', sedan: '₹1,799', ertiga: '₹2,499', crysta: '₹3,499', time: '1 hr 30 mins' },
    { destination: 'Delhi IGI Airport ⇄ East / Central Delhi', sedan: '₹1,299', ertiga: '₹1,899', crysta: '₹2,699', time: '45 mins' },
    { destination: 'Delhi IGI Airport ⇄ Gurugram (All Phases)', sedan: '₹1,199', ertiga: '₹1,699', crysta: '₹2,499', time: '35 mins' },
    { destination: 'Delhi IGI Airport ⇄ Faridabad', sedan: '₹1,499', ertiga: '₹2,099', crysta: '₹2,999', time: '1 hr 10 mins' },
    { destination: 'Delhi IGI Airport ⇄ Meerut Expressway', sedan: '₹2,399', ertiga: '₹3,199', crysta: '₹4,499', time: '1 hr 45 mins' },
  ];

  return (
    <section id={id} className={`py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans ${className}`}>
      {/* Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 text-xs font-bold">
          <span>Official 2026 Rate Card • 100% Transparent Billing</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
          Urgent Taxis Official <span className="text-brand-blue">Rate Card</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-medium">
          Guaranteed standard tariff matrix across Delhi NCR &amp; North India. Direct operator rates with zero aggregator commission markups.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center mb-8">
        <div className="grid grid-cols-3 bg-slate-200/80 p-1.5 rounded-2xl max-w-xl w-full border border-slate-300 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('hourly')}
            className={`py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer text-center ${
              activeTab === 'hourly'
                ? 'bg-brand-blue text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            ⏱️ Hourly Rentals
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('outstation')}
            className={`py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer text-center ${
              activeTab === 'outstation'
                ? 'bg-brand-blue text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            🚗 Outstation Per-KM
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('airport')}
            className={`py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer text-center ${
              activeTab === 'airport'
                ? 'bg-brand-blue text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            ✈️ Airport Corridors
          </button>
        </div>
      </div>

      {/* 1. HOURLY RENTALS RATE CARD TABLE */}
      {activeTab === 'hourly' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Local Hourly Cab Rental Tariff Matrix (All 5 Packages)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Covers doorstep pickup, chauffeur allowance, and fuel up to package limits.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                Zero ₹0 Fares • 100% Calculated
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-black">
                    <th className="py-3 px-4 sm:px-5">Vehicle Class</th>
                    <th className="py-3 px-3 text-center">4H / 40KM</th>
                    <th className="py-3 px-3 text-center">6H / 60KM</th>
                    <th className="py-3 px-3 text-center bg-blue-50/60 text-brand-blue">8H / 80KM (Standard)</th>
                    <th className="py-3 px-3 text-center">10H / 100KM</th>
                    <th className="py-3 px-3 text-center bg-emerald-50/60 text-emerald-900">12H / 120KM (Full Day)</th>
                    <th className="py-3 px-3 text-center">Extra KM</th>
                    <th className="py-3 px-3 text-center">Extra Hour</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {hourlyFleetRows.map((car, idx) => {
                    const cfg = LOCAL_RENTAL_CONFIG[car.key] || LOCAL_RENTAL_CONFIG['sedan'];
                    return (
                      <tr key={car.key} className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50/60' : 'bg-slate-50/30 hover:bg-slate-50'}>
                        <td className="py-3 px-4 sm:px-5 font-bold text-slate-900">
                          <div>{car.name}</div>
                          <span className="text-[11px] text-slate-400 font-normal">{car.models} • {car.seats}</span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold tabular-nums">
                          ₹{cfg['4h40km'].basePrice.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3 text-center font-bold tabular-nums">
                          ₹{cfg['6h60km'].basePrice.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3 text-center font-black tabular-nums bg-blue-50/30 text-brand-blue">
                          ₹{cfg['8h80km'].basePrice.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3 text-center font-bold tabular-nums">
                          ₹{cfg['10h100km'].basePrice.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3 text-center font-black tabular-nums bg-emerald-50/30 text-emerald-900">
                          ₹{cfg['12h120km'].basePrice.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-900 tabular-nums">
                          ₹{cfg['8h80km'].extraKmRate}/km
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-900 tabular-nums">
                          ₹{cfg['8h80km'].extraHourRate}/hr
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
              <strong className="text-slate-900 block mb-1">🟢 What is Included:</strong>
              Doorstep pickup, vehicle fuel for package KM limit, and chauffeur allowance for package hours.
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
              <strong className="text-slate-900 block mb-1">ℹ️ What is Excluded:</strong>
              State border entry taxes, highway tolls, and parking tickets are payable directly at actual receipts.
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
              <strong className="text-slate-900 block mb-1">💳 30% Token / 70% Balance:</strong>
              Confirm any package instantly with 30% online advance token. Remaining 70% balance payable at trip end.
            </div>
          </div>
        </div>
      )}

      {/* 2. OUTSTATION PER-KM RATE CARD TABLE */}
      {activeTab === 'outstation' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Outstation Taxi Per-KM Rate Card
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Applicable for Delhi NCR to Uttarakhand, UP, Rajasthan, Haryana, Punjab &amp; HP.
                </p>
              </div>
              <span className="text-xs font-bold text-brand-blue bg-blue-100 px-3 py-1 rounded-full">
                Zero Surge Guarantee
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-black">
                    <th className="py-3 px-4 sm:px-5">Vehicle Category</th>
                    <th className="py-3 px-3 text-center">Seating</th>
                    <th className="py-3 px-3 text-center">Luggage</th>
                    <th className="py-3 px-3 text-center bg-blue-50/60 text-brand-blue">Round-Trip Rate</th>
                    <th className="py-3 px-3 text-center">One-Way Rate</th>
                    <th className="py-3 px-3 text-center">Min. KM / Day</th>
                    <th className="py-3 px-3 text-center">Driver Allowance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {outstationFleetRows.map((row, idx) => (
                    <tr key={row.vehicle} className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50/60' : 'bg-slate-50/30 hover:bg-slate-50'}>
                      <td className="py-3 px-4 sm:px-5 font-bold text-slate-900">{row.vehicle}</td>
                      <td className="py-3 px-3 text-center font-medium">{row.seats}</td>
                      <td className="py-3 px-3 text-center font-medium">{row.luggage}</td>
                      <td className="py-3 px-3 text-center font-black tabular-nums bg-blue-50/30 text-brand-blue">{row.roundTripRate}</td>
                      <td className="py-3 px-3 text-center font-bold tabular-nums">{row.oneWayRate}</td>
                      <td className="py-3 px-3 text-center font-bold tabular-nums">{row.minKmDay}</td>
                      <td className="py-3 px-3 text-center text-xs font-semibold text-slate-600">{row.driverAllowance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-900 block mb-1">Standard Billing Rules:</strong>
            One-way trips include all highway toll plaza taxes and inter-state passenger border entry permits. Round-trip bookings have a daily minimum travel quota of 250 KM/day (300 KM/day for Innova Crysta, Tempo &amp; Buses). Tolls and border taxes on round trips are paid directly by customer at actual toll booths.
          </div>
        </div>
      )}

      {/* 3. AIRPORT CORRIDORS RATE CARD */}
      {activeTab === 'airport' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Delhi IGI Airport (T1, T2, T3) Fixed Transfer Corridors
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Doorstep pickup or airport flight arrival pickup with 60 minutes complimentary waiting time.
                </p>
              </div>
              <span className="text-xs font-bold text-purple-800 bg-purple-100 px-3 py-1 rounded-full">
                Fixed Corridors • No Surge
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-black">
                    <th className="py-3 px-4 sm:px-5">Corridor Route</th>
                    <th className="py-3 px-3 text-center">Sedan (Dzire / Etios)</th>
                    <th className="py-3 px-3 text-center">SUV (Ertiga 6S)</th>
                    <th className="py-3 px-3 text-center">Innova Crysta (7S)</th>
                    <th className="py-3 px-3 text-center">Estimated Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {airportCorridorRows.map((row, idx) => (
                    <tr key={row.destination} className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50/60' : 'bg-slate-50/30 hover:bg-slate-50'}>
                      <td className="py-3 px-4 sm:px-5 font-bold text-slate-900">{row.destination}</td>
                      <td className="py-3 px-3 text-center font-black tabular-nums text-brand-blue">{row.sedan}</td>
                      <td className="py-3 px-3 text-center font-bold tabular-nums">{row.ertiga}</td>
                      <td className="py-3 px-3 text-center font-bold tabular-nums text-emerald-800">{row.crysta}</td>
                      <td className="py-3 px-3 text-center text-xs font-semibold text-slate-500">{row.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CTA Footer */}
      <div className="mt-8 p-6 rounded-3xl bg-gradient-to-r from-blue-50 to-emerald-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm sm:text-base font-black text-slate-900">
            Need a Custom Corporate or Multi-Day Group Quotation?
          </h4>
          <p className="text-xs text-slate-500 font-medium">
            Masuri, Ghaziabad 24/7 transport desk provides immediate customized packages for weddings and corporate fleets.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/cabs?serviceType=one_way"
            className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-900 text-white font-bold text-xs shadow-xs transition-colors"
          >
            Search Live Cabs
          </Link>
          <a
            href={generateWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white font-bold text-xs shadow-xs transition-colors"
          >
            WhatsApp Desk
          </a>
        </div>
      </div>
    </section>
  );
}
