import React from 'react';
import { FaRoute, FaCloudSun, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

interface RouteTravelInfoSectionProps {
  originName: string;
  destName: string;
  distanceKm: number;
  durationHours: number;
  durationMins: number;
}

export default function RouteTravelInfoSection({
  originName,
  destName,
  distanceKm,
  durationHours,
  durationMins,
}: RouteTravelInfoSectionProps) {
  const isHilly = ['shimla', 'manali', 'nainital', 'mussoorie', 'rishikesh', 'ranikhet', 'almora', 'kausani'].some(
    (h) => destName.toLowerCase().includes(h)
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6 font-sans">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h2 className="text-xl font-black text-brand-blue flex items-center gap-2">
          <span>🚗</span> Travel Guide & Highway Information ({originName} to {destName})
        </h2>
        <span className="text-xs bg-slate-100 text-slate-800 font-bold px-3 py-1 rounded-full border border-slate-200">
          Highway Advisory
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Highway Corridor Overview */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-brand-blue font-bold text-sm">
            <FaRoute className="w-4 h-4 text-brand-blue" />
            <h3>Expressway Route</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Primary national highway corridor connecting {originName} and {destName} spans ~{distanceKm} km with smooth multi-lane access and automated FASTag toll gates.
          </p>
          <div className="text-[11px] font-bold text-slate-500 pt-1">
            ⏱️ Driving Duration: ~{durationHours}h {durationMins}m (subject to traffic)
          </div>
        </div>

        {/* Best Time to Travel & Weather */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-brand-blue font-bold text-sm">
            <FaCloudSun className="w-4 h-4 text-brand-blue" />
            <h3>Ideal Departure Window</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Early morning departures (5:00 AM – 7:00 AM) are strongly recommended to bypass city congestion, save 45–60 minutes in transit, and enjoy daylight highway driving.
          </p>
          <div className="text-[11px] font-bold text-slate-500 pt-1">
            ☀️ Weather: Pleasant mornings, check seasonal fog/rain alerts before heading out.
          </div>
        </div>

        {/* Vehicle Comfort & Hill Safety */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <FaCheckCircle className="w-4 h-4 text-brand-green" />
            <h3>Driver & Vehicle Quality</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Our outstation drivers possess extensive inter-state highway experience, with practical knowledge of expressways, ghat roads, and bypass diversions.
          </p>
          <div className="text-[11px] font-bold text-slate-500 pt-1">
            ❄️ Air-Conditioned Cabs (AC turned off on steep hairpin climbs for engine power safety).
          </div>
        </div>
      </div>

      {/* Hill Driving or Highway Specific Notes */}
      {isHilly ? (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
          <h4 className="text-xs font-black text-brand-blue uppercase tracking-wide flex items-center gap-1.5">
            <FaExclamationTriangle className="text-brand-blue" /> Essential Hill Station Travel Guidelines:
          </h4>
          <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 font-medium ml-1">
            <li>Hills require specialized mountain drivers with hilly terrain commercial licenses.</li>
            <li>Night driving on steep mountain ghats after 8:00 PM is discouraged by state authorities for passenger safety.</li>
            <li>In hilly zones, cab air-conditioning may be paused intermittently on steep inclines to maintain required vehicular pulling torque.</li>
          </ul>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
          <h4 className="text-xs font-black text-blue-900 uppercase tracking-wide flex items-center gap-1.5">
            <FaCheckCircle className="text-brand-blue" /> Highway Travel Checklist:
          </h4>
          <ul className="list-disc list-inside text-xs text-blue-800 space-y-1 font-medium ml-1">
            <li>Doorstep pickup and drop at your chosen home, hotel, railway station, or airport terminal.</li>
            <li>FASTag tolls are estimated transparently; pay actual plaza receipts directly or add to bill.</li>
            <li>Clean food stops available every 50–70 km along verified corridor food plazas.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
