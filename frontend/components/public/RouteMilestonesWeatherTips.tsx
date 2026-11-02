'use client';

import React from 'react';
import { RouteMilestone, RouteWeather } from '@/lib/data/route-corridor-details';
import { FaCloudSun, FaExternalLinkAlt, FaClock, FaCheckCircle, FaCar, FaTshirt, FaMoneyBillWave, FaMapMarkedAlt, FaCalendarCheck } from 'react-icons/fa';

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
    <FaCar key="car" className="w-4 h-4 text-brand-blue shrink-0" />,
    <FaTshirt key="tshirt" className="w-4 h-4 text-amber-600 shrink-0" />,
    <FaMoneyBillWave key="money" className="w-4 h-4 text-emerald-600 shrink-0" />,
    <FaMapMarkedAlt key="map" className="w-4 h-4 text-indigo-600 shrink-0" />,
    <FaCalendarCheck key="calendar" className="w-4 h-4 text-rose-600 shrink-0" />,
  ];

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans ${className}`}>
      {/* Left Column: Distance & Route Details (Timeline) */}
      <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col justify-between">
        <div>
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>📍</span> Distance & Route Details
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Key milestones, highway distance markers, and estimated driving hours for {originName} to {destName}.
            </p>
          </div>

          {/* Timeline Nodes */}
          <div className="relative pl-6 sm:pl-8 space-y-7 before:absolute before:left-2.5 sm:before:left-3 before:top-2 before:bottom-3 before:w-0.5 before:bg-blue-200">
            {milestones.map((m, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === milestones.length - 1;

              return (
                <div key={idx} className="relative group">
                  {/* Pin / Node Circle */}
                  <span
                    className={`absolute -left-6 sm:-left-8 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isFirst
                        ? 'bg-emerald-500 border-white ring-4 ring-emerald-100'
                        : isLast
                        ? 'bg-rose-500 border-white ring-4 ring-rose-100'
                        : 'bg-brand-blue border-white ring-2 ring-blue-100 group-hover:scale-110'
                    }`}
                  />

                  {/* Milestone Info */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-sm sm:text-base text-slate-900">
                          {m.town}
                        </h3>
                        <span className="text-xs font-bold text-slate-400">
                          ({m.km} km)
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        {m.description}
                      </p>
                    </div>

                    <div className="self-start sm:self-auto shrink-0 mt-1 sm:mt-0">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-blue bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                        <FaClock className="w-2.5 h-2.5 text-blue-500" />
                        <span>{m.timeText}</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>* Travel times may vary during rush hours and holiday periods.</span>
        </div>
      </div>

      {/* Right Column: Weather in Destination + Travel Tips */}
      <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
        {/* Weather in Destination Card */}
        <div className="bg-gradient-to-br from-blue-50/80 via-white to-sky-50/40 rounded-3xl p-6 border border-blue-100 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-blue-100/60">
            <h3 className="text-lg font-black text-slate-900">Weather in {destName}</h3>
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(`weather in ${destName}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-brand-blue hover:text-brand-green flex items-center gap-1 transition-colors"
            >
              <span>View 7 Day Forecast</span>
              <FaExternalLinkAlt className="w-2.5 h-2.5" />
            </a>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-amber-100/80 text-amber-500 flex items-center justify-center text-3xl shadow-inner">
                <FaCloudSun />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                  Current Conditions
                </span>
                <div className="text-3xl font-black text-slate-900 mt-1">
                  {weather.temp}
                </div>
                <div className="text-xs font-bold text-slate-600">
                  {weather.condition}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 font-medium block">Feels like</span>
              <span className="text-base font-black text-slate-700">{weather.feelsLike}</span>
            </div>
          </div>
        </div>

        {/* Travel Tips Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>💡</span> Travel Tips
              </h3>
              <span className="text-xs font-bold text-slate-400">Driver Recommendations</span>
            </div>

            <ul className="space-y-3 pt-3.5">
              {travelTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    {tipIcons[idx % tipIcons.length]}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                    {tip}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
