'use client';

import React from 'react';
import { FaMountain, FaStar, FaRoad, FaUtensils, FaShieldAlt } from 'react-icons/fa';

interface RouteHighlightsProps {
  originName: string;
  destName: string;
  highwayName?: string;
  className?: string;
}

export default function RouteHighlights({
  originName,
  destName,
  highwayName = 'via NH9',
  className = '',
}: RouteHighlightsProps) {
  const isHilly = ['nainital', 'shimla', 'manali', 'mussoorie', 'rishikesh', 'ranikhet', 'almora', 'kausani', 'kullu', 'dharamshala'].some(
    (h) => destName.toLowerCase().includes(h)
  );

  const highlights = [
    {
      icon: <FaMountain className="w-5 h-5 text-brand-blue" />,
      title: isHilly ? 'Scenic Mountain Drive' : 'Express Highway Drive',
      description: isHilly
        ? 'Beautiful views throughout the journey'
        : 'Smooth multi-lane expressway cruising',
    },
    {
      icon: <FaStar className="w-5 h-5 text-amber-500" />,
      title: isHilly ? 'Popular Hill Station' : 'Prime Destination',
      description: 'Ideal for family and group trips',
    },
    {
      icon: <FaRoad className="w-5 h-5 text-brand-green" />,
      title: 'Well Connected Route',
      description: `${highwayName} with smooth roads`,
    },
    {
      icon: <FaUtensils className="w-5 h-5 text-brand-blue" />,
      title: 'Multiple Stops',
      description: 'Restaurants, fuel stations and attractions',
    },
    {
      icon: <FaShieldAlt className="w-5 h-5 text-brand-green" />,
      title: 'Safe & Comfortable',
      description: 'Professional drivers and well maintained cabs',
    },
  ];

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4 font-sans ${className}`}>
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h2 className="text-xl font-black text-brand-blue flex items-center gap-2">
          <span>✨</span> Quick Route Highlights ({originName} to {destName})
        </h2>
        <span className="text-xs bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full border border-slate-200">
          Travel Essentials
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-1">
        {highlights.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-brand-blue hover:shadow-sm transition-all flex flex-col items-center text-center space-y-2 group"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-2xs flex items-center justify-center group-hover:scale-105 transition-transform">
              {item.icon}
            </div>
            <h3 className="font-extrabold text-xs text-slate-900 leading-snug">
              {item.title}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
