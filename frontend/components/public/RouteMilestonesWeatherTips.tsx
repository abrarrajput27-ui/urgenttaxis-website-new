'use client';

import React from 'react';
import { RouteMilestone, RouteWeather } from '@/lib/data/route-corridor-details';
import { FaCloudSun, FaExternalLinkAlt, FaClock, FaCar, FaTshirt, FaMoneyBillWave, FaMapMarkedAlt, FaCalendarCheck } from 'react-icons/fa';

interface RouteMilestonesWeatherTipsProps {
  originName: string;
  destName: string;
  milestones: RouteMilestone[];
  weather: RouteWeather;
  travelTips: string[];
  className?: string;
}

export default function RouteMilestonesWeatherTips({
  originName,
  destName,
  milestones,
  weather,
  travelTips,
  className = '',
}: RouteMilestonesWeatherTipsProps) {
  const tipIcons = [
    <FaCar key="car" className="w-3.5 h-3.5 text-brand-blue shrink-0" />,
    <FaTshirt key="tshirt" className="w-3.5 h-3.5 text-amber-600 shrink-0" />,
    <FaMoneyBillWave key="money" className="w-3.5 h-3.5 text-brand-green shrink-0" />,
    <FaMapMarkedAlt key="map" className="w-3.5 h-3.5 text-indigo-600 shrink-0" />,
    <FaCalendarCheck key="calendar" className="w-3.5 h-3.5 text-rose-600 shrink-0" />,
  ];

  return (
    <div className={`space-y-6 font-sans ${className}`}>
      {/* 1. Distance & Route Milestones Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h2 className="text-xl font-black text-brand-blue flex items-center gap-2">
            <span>📍</span> Distance & Route Milestones ({originName} to {destName})
          </h2>
          <span className="text-xs bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full border border-slate-200">
            Highway Waypoints
          </span>
        </div>

        {/* Timeline */}
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3 before:top-2 before:bottom-3 before:w-0.5 before:bg-blue-200">
          {milestones.map((m, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === milestones.length - 1;

            return (
              <div key={idx} className="relative group">
                <span
                  className={`absolute -left-6 sm:-left-8 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isFirst
                      ? 'bg-emerald-500 border-white ring-4 ring-emerald-100'
                      : isLast
                      ? 'bg-rose-500 border-white ring-4 ring-rose-100'
                      : 'bg-brand-blue border-white ring-2 ring-blue-100 group-hover:scale-110'
                  }`}
                />

                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-slate-900">{m.town}</h3>
                      <span className="text-xs font-bold text-slate-400">({m.km} km)</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">{m.description}</p>
                  </div>

                  <div className="self-start sm:self-auto shrink-0 mt-1 sm:mt-0">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-blue bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      <FaClock className="w-2.5 h-2.5 text-brand-blue" />
                      <span>{m.timeText}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Destination Weather & Travel Tips Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h2 className="text-xl font-black text-brand-blue flex items-center gap-2">
            <span>☀️</span> Weather in {destName} & Travel Tips
          </h2>
          <span className="text-xs bg-amber-50 text-amber-800 font-bold px-3 py-1 rounded-full border border-amber-200">
            Advisory
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weather Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                Current Climate
              </span>
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(`weather in ${destName}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-brand-blue hover:text-brand-green flex items-center gap-1 transition-colors"
              >
                Forecast <FaExternalLinkAlt className="w-2.5 h-2.5" />
              </a>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white text-amber-500 border border-slate-200 flex items-center justify-center text-2xl shadow-2xs">
                <FaCloudSun />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{weather.temp}</div>
                <div className="text-xs font-bold text-slate-600">{weather.condition}</div>
                <div className="text-[11px] text-slate-400 font-medium">Feels like {weather.feelsLike}</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 font-medium border-t border-slate-200/60 pt-2">
              Check morning mountain fog and road conditions prior to departure.
            </div>
          </div>

          {/* Travel Tips List */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Essential Journey Tips:
            </h4>
            <ul className="space-y-2">
              {travelTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium leading-relaxed">
                  <div className="w-5 h-5 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                    {tipIcons[idx % tipIcons.length]}
                  </div>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
