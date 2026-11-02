'use client';

import React, { useState } from 'react';
import { FaMapMarkerAlt, FaExpand, FaCompress, FaPlus, FaMinus, FaCar, FaExternalLinkAlt } from 'react-icons/fa';

interface RouteMapCardProps {
  originName: string;
  destName: string;
  distanceKm: number;
  durationText?: string;
  waypoints?: string[];
  className?: string;
}

export default function RouteMapCard({
  originName,
  destName,
  distanceKm,
  durationText = '6 - 7 Hours',
  waypoints = ['Hapur', 'Moradabad', 'Rampur', 'Haldwani'],
  className = '',
}: RouteMapCardProps) {
  const [viewMode, setViewMode] = useState<'map' | 'satellite'>('map');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 1.75));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.85));
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    originName
  )}&destination=${encodeURIComponent(destName)}&travelmode=driving`;

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col font-sans transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl md:inset-10' : ''
      } ${className}`}
    >
      {/* Top Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl">🗺️</span>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Route Map</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Map / Satellite Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-white text-brand-blue shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Map
            </button>
            <button
              type="button"
              onClick={() => setViewMode('satellite')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'satellite'
                  ? 'bg-white text-brand-blue shadow-xs'
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
            {isFullscreen ? <FaCompress className="w-3.5 h-3.5" /> : <FaExpand className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Map Canvas Viewport */}
      <div className="relative flex-1 min-h-[300px] sm:min-h-[360px] bg-slate-100 overflow-hidden select-none">
        {viewMode === 'satellite' ? (
          <div className="w-full h-full relative">
            <iframe
              title={`Satellite route view for ${originName} to ${destName}`}
              src="https://www.openstreetmap.org/export/embed.html?bbox=76.5%2C26.5%2C80.0%2C31.0&layer=mapnik"
              className="w-full h-full border-0 absolute inset-0 filter contrast-125 brightness-95"
              loading="lazy"
            />
            {/* Satellite overlay badge */}
            <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 shadow-md">
              🛰️ Live Corridor View
            </div>
          </div>
        ) : (
          /* Stylized Illustrated Route Canvas matching concept reference */
          <div
            className="w-full h-full min-h-[320px] relative transition-transform duration-300 origin-center bg-[#eef3f7]"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Background Graphic Grid & Terrain Features */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Simulated Mountain / Forest Terrain (e.g. Jim Corbett / Foothills) */}
            <div className="absolute top-4 right-12 w-48 h-32 bg-emerald-100/70 border border-emerald-200/80 rounded-3xl -rotate-6 flex flex-col items-center justify-center p-3 text-center pointer-events-none">
              <span className="text-[10px] uppercase font-black tracking-wider text-emerald-800">
                Corbett Reserve
              </span>
              <span className="text-[9px] text-emerald-700/80 font-semibold">National Park Area</span>
            </div>

            {/* Major Regional Labels */}
            <div className="absolute top-10 left-16 text-slate-400 font-bold text-xs uppercase tracking-wider">
              Bijnor
            </div>
            <div className="absolute top-24 left-8 text-slate-400 font-bold text-xs uppercase tracking-wider">
              Meerut
            </div>
            <div className="absolute bottom-20 right-32 text-slate-400 font-bold text-xs uppercase tracking-wider">
              Bareilly
            </div>

            {/* SVG Connecting Route Path */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 500 360"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Outer Glow / Road Shadow */}
              <path
                d="M 85 285 C 150 270, 200 240, 260 210 S 360 170, 415 85"
                fill="none"
                stroke="#93c5fd"
                strokeWidth="10"
                strokeLinecap="round"
                opacity="0.6"
              />
              {/* Main Highway Route Line (Electric Blue) */}
              <path
                d="M 85 285 C 150 270, 200 240, 260 210 S 360 170, 415 85"
                fill="none"
                stroke="#2563eb"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Animated/Dashed inner flow line */}
              <path
                d="M 85 285 C 150 270, 200 240, 260 210 S 360 170, 415 85"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeDasharray="6 6"
                strokeLinecap="round"
                className="animate-pulse"
              />

              {/* Waypoint circles along the path */}
              <circle cx="170" cy="255" r="4.5" fill="#1e40af" stroke="#ffffff" strokeWidth="2" />
              <circle cx="260" cy="210" r="5" fill="#1e40af" stroke="#ffffff" strokeWidth="2" />
              <circle cx="330" cy="175" r="4.5" fill="#1e40af" stroke="#ffffff" strokeWidth="2" />
              <circle cx="380" cy="125" r="4.5" fill="#1e40af" stroke="#ffffff" strokeWidth="2" />
            </svg>

            {/* Waypoint Labels on Canvas */}
            <div className="absolute top-[260px] left-[155px] -translate-x-1/2 text-[10px] font-bold text-slate-600 bg-white/80 px-1.5 py-0.5 rounded shadow-xs">
              {waypoints[0] || 'Hapur'}
            </div>
            <div className="absolute top-[188px] left-[260px] -translate-x-1/2 text-[10px] font-bold text-slate-700 bg-white/90 px-1.5 py-0.5 rounded shadow-xs border border-slate-200">
              {waypoints[1] || 'Moradabad'}
            </div>
            <div className="absolute top-[180px] left-[340px] text-[10px] font-bold text-slate-600 bg-white/80 px-1.5 py-0.5 rounded shadow-xs">
              {waypoints[2] || 'Rampur'}
            </div>
            <div className="absolute top-[110px] left-[360px] text-[10px] font-bold text-slate-700 bg-white/90 px-1.5 py-0.5 rounded shadow-xs border border-slate-200">
              {waypoints[3] || 'Haldwani'}
            </div>

            {/* Origin Marker Pin (Bottom Left) */}
            <div className="absolute bottom-12 left-10 flex items-center gap-1.5 bg-white border-2 border-emerald-600 text-slate-900 px-3 py-1.5 rounded-xl shadow-lg z-20">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping inline-block" />
              <FaMapMarkerAlt className="text-emerald-600 text-sm" />
              <span className="text-xs font-black tracking-tight">{originName}</span>
            </div>

            {/* Destination Marker Pin (Top Right) */}
            <div className="absolute top-12 right-12 flex items-center gap-1.5 bg-white border-2 border-rose-600 text-slate-900 px-3 py-1.5 rounded-xl shadow-lg z-20">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <FaMapMarkerAlt className="text-rose-600 text-sm" />
              <span className="text-xs font-black tracking-tight">{destName}</span>
            </div>

            {/* Floating Distance Badge Pill on Highway Route */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="bg-brand-blue text-white px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 border border-blue-400/40 text-xs font-black backdrop-blur-sm whitespace-nowrap">
                <FaCar className="text-amber-300 text-sm" />
                <span>
                  {distanceKm} km • {durationText}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Zoom Controls at Bottom Right */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden text-xs font-bold">
          <button
            type="button"
            onClick={handleZoomIn}
            aria-label="Zoom in"
            className="p-2.5 text-slate-700 hover:text-brand-blue hover:bg-slate-100 transition-colors border-b border-slate-100 cursor-pointer"
          >
            <FaPlus className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            aria-label="Zoom out"
            className="p-2.5 text-slate-700 hover:text-brand-blue hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <FaMinus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Bottom Bar: Direct GPS Directions Link */}
      <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">Turn-by-turn highway navigation</span>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-blue hover:text-brand-green font-bold flex items-center gap-1.5 transition-colors"
        >
          <span>Open in Google Maps</span>
          <FaExternalLinkAlt className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
