'use client';

import React, { useState } from 'react';
import { FaExpand, FaCompress, FaExternalLinkAlt, FaRoute, FaDirections } from 'react-icons/fa';

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

  // Strip accidental duplicate "via " prefix from corridor data
  const cleanHighway = (highwayName || 'National Highway').replace(/^via\s+/i, '').trim();

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
      className={`bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden flex flex-col font-sans transition-all duration-300 scroll-mt-24 w-full ${
        isFullscreen ? 'fixed inset-3 z-50 shadow-2xl md:inset-8 bg-white' : ''
      } ${className}`}
    >
      {/* Card Header matching Urgent Taxis Brand Theme */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-base border border-blue-100 shadow-xs shrink-0">
            <FaRoute className="w-5 h-5 text-brand-blue" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-brand-blue tracking-tight leading-tight">
                Route Map
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-brand-green border border-emerald-200 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live GPS Highway Route
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Turn-by-turn driving route and navigation corridor from {originName} to {destName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Map / Satellite Toggle */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs ${
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
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs ${
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
            className="p-2 text-slate-600 hover:text-brand-blue hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200 bg-white"
          >
            {isFullscreen ? <FaCompress className="w-4 h-4" /> : <FaExpand className="w-4 h-4" />}
          </button>

          {/* Get Directions CTA Button */}
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-brand-green hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 shrink-0"
          >
            <FaDirections className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Get Directions</span>
            <span className="sm:hidden">Navigate</span>
            <FaExternalLinkAlt className="w-2 h-2 ml-0.5 opacity-80" />
          </a>
        </div>
      </div>

      {/* Direction & Location Indication Bar */}
      <div className="px-4 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100 shrink-0"></span>
            <span className="text-slate-500 font-medium">Pickup:</span>
            <span className="text-brand-blue">{originName}</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400 font-bold px-0.5">
            <span>➔</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-100 shrink-0"></span>
            <span className="text-slate-500 font-medium">Drop:</span>
            <span className="text-brand-blue">{destName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-slate-600 font-medium shrink-0 flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-slate-800 font-bold shadow-xs">
            🛣️ {cleanHighway}
          </span>
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-bold text-brand-green shadow-xs">
            📏 {distanceKm} km (~{durationText})
          </span>
        </div>
      </div>

      {/* 100% Unobstructed Full Container Map Viewport */}
      <div className="w-full bg-slate-100 overflow-hidden select-none">
        <iframe
          title={`Live Highway Driving Route Map from ${originName} to ${destName}`}
          src={embedMapUrl}
          className="w-full border-0 block"
          style={{
            width: '100%',
            height: isFullscreen ? 'calc(100vh - 170px)' : '480px',
            minHeight: isFullscreen ? 'calc(100vh - 170px)' : '480px',
            display: 'block',
          }}
          allowFullScreen
        />
      </div>

      {/* Card Footer with Corridor Summary & Turn-by-Turn Navigation */}
      <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 font-medium shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0" />
          <span className="text-xs font-bold text-slate-800">
            Driving Route: {originName} ➔ {destName} via {cleanHighway} ({distanceKm} km)
          </span>
        </div>
        <a
          href={googleMapsDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-brand-blue hover:text-brand-green flex items-center gap-1.5 transition-colors bg-white px-3.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs"
        >
          <span>Open Turn-by-Turn in Google Maps</span>
          <FaExternalLinkAlt className="w-3 h-3 text-brand-green" />
        </a>
      </div>
    </div>
  );
}
