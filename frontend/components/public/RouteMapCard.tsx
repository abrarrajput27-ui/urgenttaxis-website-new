'use client';

import React, { useState } from 'react';
import { FaExpand, FaCompress, FaExternalLinkAlt, FaRoute, FaCompass, FaMapMarkerAlt, FaDirections } from 'react-icons/fa';

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

  // Explicit Google Maps Direction Embed routing from origin (saddr) to destination (daddr)
  const embedMapUrl = `https://maps.google.com/maps?saddr=${encodeURIComponent(
    originName
  )}&daddr=${encodeURIComponent(destName)}&t=${viewMode === 'satellite' ? 'k' : 'm'}&output=embed`;

  return (
    <div
      id="route-map"
      className={`bg-white rounded-3xl shadow-xs border border-slate-200/90 overflow-hidden flex flex-col font-sans transition-all duration-300 scroll-mt-24 ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl md:inset-10' : 'h-full'
      } ${className}`}
    >
      {/* Card Header matching Urgent Taxis Brand Theme */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-sm border border-blue-100 shadow-xs">
            <FaRoute className="w-4 h-4 text-brand-blue" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-brand-blue tracking-tight leading-tight">
                Route Map
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-brand-green border border-emerald-200 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                GPS Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Turn-by-turn highway corridor from {originName} to {destName}
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

      {/* Direction & Location Indication Bar */}
      <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-900 font-bold shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100 shrink-0"></span>
            <span className="text-slate-500 font-medium">Pickup:</span>
            <span className="text-brand-blue">{originName}</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400 font-bold">
            <span>➔</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-900 font-bold shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-100 shrink-0"></span>
            <span className="text-slate-500 font-medium">Drop:</span>
            <span className="text-brand-blue">{destName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-[11px] text-slate-600 font-medium shrink-0">
          <span className="inline-flex items-center gap-1 text-slate-700 font-bold">
            🛣️ {highwayName}
          </span>
          <span className="text-slate-300">•</span>
          <span className="font-bold text-brand-green">
            📏 {distanceKm} km (~{durationText})
          </span>
        </div>
      </div>

      {/* Map Viewport with Explicit Overlays */}
      <div className="relative flex-1 min-h-[320px] sm:min-h-[360px] bg-slate-100 overflow-hidden select-none">
        <iframe
          title={`Live Highway Driving Route Map from ${originName} to ${destName}`}
          src={embedMapUrl}
          className="w-full h-full border-0 absolute inset-0"
          loading="lazy"
          allowFullScreen
        />

        {/* Floating Origin Location Marker Indicator (Top Left) */}
        <div className="absolute top-3 left-3 bg-white/95 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-xl shadow-md border border-slate-200 flex items-center gap-2 pointer-events-none backdrop-blur-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>From: <strong>{originName}</strong></span>
        </div>

        {/* Floating Destination Location Marker Indicator (Bottom Left) */}
        <div className="absolute bottom-3 left-3 bg-[#1e1b4b] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg border border-blue-900/40 flex items-center gap-2 pointer-events-none backdrop-blur-xs">
          <span>📍</span>
          <span>To: <strong>{destName}</strong></span>
          <span className="text-blue-300 font-normal">|</span>
          <span className="text-brand-green font-black">{distanceKm} km</span>
        </div>

        {/* Live Navigation CTA Button (Top Right) */}
        <a
          href={googleMapsDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 right-3 bg-brand-green hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
        >
          <FaDirections className="w-3.5 h-3.5" />
          <span>Get Directions</span>
          <FaExternalLinkAlt className="w-2.5 h-2.5 ml-0.5 opacity-80" />
        </a>
      </div>

      {/* Card Footer with Corridor Summary & Turn-by-Turn Navigation */}
      <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 font-medium shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0" />
          <span className="text-[11px] font-bold text-slate-700">
            Directions: {originName} ➔ {destName} via {highwayName}
          </span>
        </div>
        <a
          href={googleMapsDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-brand-blue hover:text-brand-green flex items-center gap-1.5 transition-colors"
        >
          <span>Open Turn-by-Turn in Google Maps</span>
          <FaExternalLinkAlt className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
