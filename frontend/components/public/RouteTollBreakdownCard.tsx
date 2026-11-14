"use client";

import React, { useState, useMemo } from 'react';
import { calculateRouteTolls } from '@/lib/tolls';
import { ShieldCheck, Info, MapPin, Car } from 'lucide-react';

interface RouteTollBreakdownCardProps {
  origin: string;
  destination: string;
  initialVehicle?: string;
  distanceKm?: number;
}

const VEHICLE_OPTIONS = [
  { id: 'sedan', label: 'Sedan (Dzire/Etios)', rateText: '₹12/km' },
  { id: 'suv', label: 'SUV (Ertiga/Carens)', rateText: '₹15/km' },
  { id: 'crysta', label: 'Innova Crysta', rateText: '₹22/km' },
  { id: 'traveller', label: 'Tempo Traveller', rateText: '₹26/km' },
];

export default function RouteTollBreakdownCard({
  origin,
  destination,
  initialVehicle = 'sedan',
  distanceKm = 250,
}: RouteTollBreakdownCardProps) {
  const [selectedVehicle, setSelectedVehicle] = useState(initialVehicle);

  const tollData = useMemo(() => {
    // Show verified one-way toll for selected commercial taxi category
    return calculateRouteTolls(origin, destination, selectedVehicle, false, distanceKm);
  }, [origin, destination, selectedVehicle, distanceKm]);

  return (
    <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-7 my-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>NHAI &amp; Expressway Verified One-Way Toll</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Highway Tolls &amp; State Border Entry Tax Breakup
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Individual plaza breakdown along the actual highway corridor path ({origin} → {destination})
          </p>
        </div>

        {/* One-Way Trip Scope Badge */}
        <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto text-xs font-bold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Verified One-Way Toll</span>
        </div>
      </div>

      {/* Vehicle Category Selector for Tolls */}
      <div className="mt-5 pb-4 border-b border-slate-100">
        <span className="text-xs font-bold text-slate-500 block mb-2 uppercase tracking-wider">
          Select Cab Category for Verified Highway Toll:
        </span>
        <div className="flex flex-wrap gap-2">
          {VEHICLE_OPTIONS.map((v) => {
            const isActive = selectedVehicle.toLowerCase().includes(v.id) || (v.id === 'sedan' && selectedVehicle.toLowerCase().includes('hatchback'));
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVehicle(v.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                  isActive
                    ? 'bg-brand-blue text-white shadow-xs font-black'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                <Car className="w-3 h-3" />
                <span>{v.label}</span>
                <span className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                  ({v.rateText})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toll Plazas Table */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Highway Toll Plazas ({tollData.tollPlazas.length} on Corridor)
          </h4>
          <span className="text-[11px] font-semibold text-slate-400">
            One-Way Rate ({selectedVehicle.toUpperCase()})
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/70">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200/70 text-[11px] sm:text-xs uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 sm:px-4">Toll Plaza</th>
                <th className="py-2.5 px-3 sm:px-4 hidden sm:table-cell">Highway / Expressway</th>
                <th className="py-2.5 px-3 sm:px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tollData.tollPlazas.map((plaza) => (
                <tr key={plaza.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-3 sm:px-4">
                    <div className="font-bold text-slate-900">{plaza.name}</div>
                    <div className="text-[11px] text-slate-500 sm:hidden">{plaza.highway}</div>
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-slate-600 hidden sm:table-cell">
                    {plaza.highway}
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-right font-black text-slate-900 tabular-nums">
                    ₹{plaza.appliedRate}
                  </td>
                </tr>
              ))}
              {/* Toll Total Row */}
              <tr className="bg-slate-50 font-bold border-t border-slate-200">
                <td className="py-3 px-3 sm:px-4 text-slate-800" colSpan={2}>
                  Total Highway Toll ({tollData.tollPlazas.length} Plazas)
                </td>
                <td className="py-3 px-3 sm:px-4 text-right font-black text-[#1e1b4b] text-sm sm:text-base tabular-nums">
                  ₹{tollData.totalToll}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* State Commercial Border Taxes */}
      {tollData.stateTaxes.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              State Commercial Passenger Border Entry Taxes
            </h4>
            <span className="text-[11px] font-semibold text-slate-400">Statutory Border Checkposts</span>
          </div>

          <div className="space-y-2">
            {tollData.stateTaxes.map((st) => (
              <div
                key={st.state}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs sm:text-sm"
              >
                <div>
                  <div className="font-bold text-slate-900">{st.name}</div>
                  <div className="text-[11px] text-slate-500">{st.description}</div>
                </div>
                <div className="font-black text-slate-900 tabular-nums shrink-0 ml-3">
                  ₹{st.rate}
                </div>
              </div>
            ))}
            
            {/* Total State Tax Row */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 border border-slate-200 font-bold text-xs sm:text-sm">
              <span className="text-slate-800">Total Statutory State Border Passenger Taxes</span>
              <span className="font-black text-[#1e1b4b] tabular-nums">₹{tollData.totalStateTax}</span>
            </div>
          </div>
        </div>
      )}

      {/* Combined Grand Total Summary Bar */}
      <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-[#0a1128] to-[#1e1b4b] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
            Corridor One-Way Statutory Highway Expenses
          </span>
          <span className="text-sm sm:text-base font-black">
            Highway Toll (₹{tollData.totalToll}) + State Border Taxes (₹{tollData.totalStateTax})
          </span>
        </div>
        <div className="text-right sm:shrink-0">
          <span className="text-[10px] text-slate-300 block">Total One-Way Surcharges</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-400">
            ₹{tollData.grandTotal}
          </span>
        </div>
      </div>

      {/* Summary Note */}
      <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-start gap-2.5 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Transparent Highway Policy: </span>
          Highway tolls and commercial state passenger taxes are paid seamlessly via vehicle FASTag or government portal. In <strong>One-Way &amp; Airport Cabs</strong>, tolls and state taxes are calculated and included in the all-inclusive fare. In <strong>Round-Trip &amp; Local Rentals</strong>, tolls and state border permits are paid at actuals on the highway.
        </div>
      </div>
    </section>
  );
}
