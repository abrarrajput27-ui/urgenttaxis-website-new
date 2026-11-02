'use client';

import React, { useState } from 'react';
import { FaExpand, FaCompress, FaExternalLinkAlt, FaRoute, FaCompass } from 'react-icons/fa';

interface RouteMapCardProps {
  originName: string;
  destName: string;
  distanceKm: number;
  durationText?: string;
  highwayName?: string;
  className?: string;
}

export default function RouteMapCard({
  originName,
  destName,
  distanceKm,
  durationText = '5 - 6 Hours',
  highwayName = 'National Highway',
  className = '',
}: RouteMapCardProps) {
  const [viewMode, setViewMode] = useState<'map' | 'satellite'>('map');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    originName
  )}&destination=${encodeURIComponent(destName)}&travelmode=driving`;

  // Real Google Maps live embed URL
  const embedMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    `${originName} to ${destName}`
  )}&t=${viewMode === 'satellite' ? 'k' : 'm'}&z=9&output=embed`;

  return (
    <div
      id="route-map"
      className={`bg-white rounded-3xl shadow-xs border border-slate-200/90 overflow-hidden flex flex-col font-sans transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl md:inset-10' : 'h-full'
      } ${className}`}
    >
      {/* Card Header matching Urgent Taxis Brand Theme */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-sm">
            <FaRoute className="w-4 h-4 text-brand-blue" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
              Route Map
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              {originName} → {destName} Corridor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Map / Satellite Toggle */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-xs ${
                viewMode === 'map'
                  ? 'bg-white text-brand-blue shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Map
            </button>
            <button
              type="button"
              onClick={() => setViewMode('satellite')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-xs ${
                viewMode === 'satellite'
                  ? 'bg-white text-brand-blue shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Satellite
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-1.5 text-slate-600 hover:text-brand-blue hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200 bg-white"
          >
            {isFullscreen ? <FaCompress className="w-3.5 h-3.5" /> : <FaExpand className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Map Viewport */}
      <div className="relative flex-1 min-h-[300px] sm:min-h-[340px] bg-slate-100 overflow-hidden select-none">
        <iframe
          title={`Live Highway Driving Route Map from ${originName} to ${destName}`}
          src={embedMapUrl}
          className="w-full h-full border-0 absolute inset-0"
          loading="lazy"
          allowFullScreen
        />

        {/* Floating Distance Badge matching concept */}
        <div className="absolute bottom-3 left-3 bg-[#1e1b4b] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg border border-blue-900/40 flex items-center gap-2 pointer-events-none backdrop-blur-xs">
          <span className="text-amber-400">🚗</span>
          <span>
            {distanceKm} km • <strong className="text-amber-300 font-black">{durationText}</strong>
          </span>
        </div>

        {/* Live Navigation overlay link */}
        <a
          href={googleMapsDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 right-3 bg-white/95 hover:bg-white text-brand-blue hover:text-brand-green text-[11px] font-black px-2.5 py-1.5 rounded-xl shadow-md border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
        >
          <FaCompass className="w-3 h-3 text-brand-green" />
          <span>Google Maps Directions</span>
          <FaExternalLinkAlt className="w-2.5 h-2.5 ml-0.5 opacity-70" />
        </a>
      </div>

      {/* Card Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
          <span className="text-[11px] font-bold text-slate-700">Live Highway Highway Corridor</span>
        </div>
        <a
          href={googleMapsDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-black text-brand-blue hover:text-brand-green flex items-center gap-1 transition-colors"
        >
          <span>Open Full Route</span>
          <FaExternalLinkAlt className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
}
