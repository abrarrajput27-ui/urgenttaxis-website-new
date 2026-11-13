"use client";

import React, { useState, useMemo } from 'react';
import { calculateRouteTolls } from '@/lib/tolls';
import { ShieldCheck, Info, Car, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';

interface RouteTollBreakdownCardProps {
  origin: string;
  destination: string;
  initialVehicle?: string;
  distanceKm?: number;
}

export default function RouteTollBreakdownCard({
  origin,
  destination,
  initialVehicle = 'sedan',
  distanceKm = 250,
}: RouteTollBreakdownCardProps) {
  const [vehicle, setVehicle] = useState<string>(initialVehicle);
  const tripType = 'one_way';

  const tollData = useMemo(() => {
    return calculateRouteTolls(origin, destination, vehicle, false, distanceKm);
  }, [origin, destination, vehicle, distanceKm]);

  return (
    <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-7 my-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>NHAI & Expressway Verified Breakdown</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Highway Tolls & State Border Entry Tax
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Individual plaza breakdown along the actual corridor path ({origin} → {destination})
          </p>
        </div>

        {/* One-Way Trip Scope Badge */}
        <div className="flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto text-xs font-bold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>One-Way Highway Toll</span>
        </div>
      </div>

      {/* Vehicle Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-4 border-b border-slate-100">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
          <Car className="w-3.5 h-3.5" /> Vehicle:
        </span>
        {[
          { id: 'sedan', label: 'Sedan (Dzire/Etios)' },
          { id: 'ertiga', label: 'Ertiga (6-Seater)' },
          { id: 'suv', label: 'SUV (Innova Crysta)' },
          { id: 'tempo_traveller', label: 'Tempo Traveller (12/16)' },
          { id: 'force_urbania', label: 'Force Urbania' },
          { id: 'minibus', label: 'Minibus (27-Seater)' },
          { id: 'bus_coach', label: 'Bus / Coach (45-Seater)' },
        ].map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setVehicle(v.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              vehicle === v.id
                ? 'bg-[#1e1b4b] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Toll Plazas Table */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Highway Toll Plazas ({tollData.tollPlazas.length} on Route)
          </h4>
          <span className="text-[11px] font-semibold text-slate-400">
            Single Journey One-Way
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
              State Commercial Border Entry Taxes
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
          </div>
        </div>
      )}

      {/* Summary Note */}
      <div className="mt-5 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-start gap-2.5 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Transparent Highway Policy: </span>
          Highway tolls and commercial state border taxes are electronic and paid seamlessly via vehicle FASTag or government portal at physical booths. Rates verified as of {tollData.lastVerified} per {tollData.verificationSource}.
        </div>
      </div>
    </section>
  );
}
