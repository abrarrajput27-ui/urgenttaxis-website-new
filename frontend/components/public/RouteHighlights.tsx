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
      icon: <FaMountain className="w-5 h-5 text-indigo-600" />,
      title: isHilly ? 'Scenic Mountain Drive' : 'Express Highway Drive',
      description: isHilly
        ? 'Beautiful views throughout the journey'
        : 'Smooth multi-lane expressway cruising',
      bg: 'bg-indigo-50 border-indigo-100',
    },
    {
      icon: <FaStar className="w-5 h-5 text-amber-500" />,
      title: isHilly ? 'Popular Hill Station' : 'Prime Destination',
      description: 'Ideal for family and group trips',
      bg: 'bg-amber-50 border-amber-100',
    },
    {
      icon: <FaRoad className="w-5 h-5 text-emerald-600" />,
      title: 'Well Connected Route',
      description: `${highwayName} with smooth roads`,
      bg: 'bg-emerald-50 border-emerald-100',
    },
    {
      icon: <FaUtensils className="w-5 h-5 text-blue-600" />,
      title: 'Multiple Stops',
      description: 'Restaurants, fuel stations and attractions',
      bg: 'bg-blue-50 border-blue-100',
    },
    {
      icon: <FaShieldAlt className="w-5 h-5 text-teal-600" />,
      title: 'Safe & Comfortable',
      description: 'Professional drivers and well maintained cabs',
      bg: 'bg-teal-50 border-teal-100',
    },
  ];

  return (
    <div className={`space-y-4 font-sans ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          Quick Route Highlights
        </h2>
        <span className="text-xs bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full">
          Travel Essentials
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {highlights.map((item, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl border ${item.bg} bg-white shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center space-y-2 group`}
          >
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <h3 className="font-black text-sm text-slate-800 leading-snug">
              {item.title}
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
