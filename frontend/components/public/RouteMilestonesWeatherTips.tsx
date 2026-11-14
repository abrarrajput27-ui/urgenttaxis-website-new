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
    <FaCar key="car" className="w-4 h-4 text-brand-blue shrink-0" />,
    <FaTshirt key="tshirt" className="w-4 h-4 text-brand-green shrink-0" />,
    <FaMoneyBillWave key="money" className="w-4 h-4 text-brand-green shrink-0" />,
    <FaMapMarkedAlt key="map" className="w-4 h-4 text-brand-blue shrink-0" />,
    <FaCalendarCheck key="calendar" className="w-4 h-4 text-brand-blue shrink-0" />,
  ];

  const scrollToMap = (e: React.MouseEvent) => {
    e.preventDefault();
    const mapElement = document.getElementById('route-map');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const weatherSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(
    `weather in ${destName}`
  )}`;

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
            {(milestones || []).map((m, idx) => {
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
                        ? 'bg-brand-green border-white ring-4 ring-brand-green/20'
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
          <a
            href="#route-map"
            onClick={scrollToMap}
            className="font-bold text-brand-blue hover:text-brand-green transition-colors cursor-pointer"
          >
            View on Map ↑
          </a>
        </div>
      </div>

      {/* Right Column: Weather in Destination + Travel Tips */}
      <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
        {/* Weather Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
              <span>🌤️</span> Weather in {destName}
            </h3>
            <a
              href="#route-map"
              onClick={scrollToMap}
              className="text-xs font-bold text-brand-blue hover:text-brand-green flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View Route on Map</span>
              <span className="text-brand-green font-black">→</span>
            </a>
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50/80 to-slate-50 rounded-2xl border border-blue-100/70">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center text-brand-green border border-slate-100">
                <FaCloudSun className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Today in {destName}
                </span>
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {weather.temp}
                </span>
                <p className="text-xs font-bold text-brand-blue">
                  {weather.condition}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Feels Like</span>
              <span className="text-sm font-black text-slate-700">{weather.feelsLike}</span>
            </div>
          </div>

          <div className="pt-1 text-right">
            <a
              href={weatherSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-black text-brand-blue hover:text-brand-green inline-flex items-center gap-1 transition-colors"
            >
              <span>View 7-Day Forecast</span>
              <FaExternalLinkAlt className="w-2.5 h-2.5 ml-0.5 text-brand-green" />
            </a>
          </div>
        </div>

        {/* Travel Tips Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex-1 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
              <span>💡</span> Travel Tips
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Important recommendations for a hassle-free trip to {destName}.
            </p>
          </div>

          <ul className="space-y-3.5">
            {travelTips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                <span className="mt-0.5 p-1 rounded-lg bg-slate-50 border border-slate-100">
                  {tipIcons[idx % tipIcons.length]}
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
