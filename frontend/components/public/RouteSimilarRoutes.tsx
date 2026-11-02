'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaArrowRight } from 'react-icons/fa';

export interface SimilarRouteItem {
  slug: string;
  originName: string;
  destName: string;
  distanceKm: number;
  startingFare: number;
  image: string;
}

interface RouteSimilarRoutesProps {
  originName: string;
  similarRoutes: SimilarRouteItem[];
  className?: string;
}

export default function RouteSimilarRoutes({
  originName,
  similarRoutes,
  className = '',
}: RouteSimilarRoutesProps) {
  if (!similarRoutes || similarRoutes.length === 0) return null;

  return (
    <div className={`space-y-5 font-sans ${className}`}>
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Similar Routes
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Explore other popular outstation taxi routes from {originName}.
          </p>
        </div>

        <Link
          href="/routes"
          className="text-xs font-black text-brand-blue hover:text-brand-green flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <span>View All Routes</span>
          <FaArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {similarRoutes.map((route, idx) => (
          <Link
            key={idx}
            href={`/routes/${route.slug}`}
            className="group rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between"
          >
            {/* Image Thumbnail */}
            <div className="relative h-32 w-full bg-slate-900 overflow-hidden">
              <Image
                src={route.image}
                alt={`${route.originName} to ${route.destName} Cab`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                loading="lazy"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2.5 right-2.5 text-white">
                <span className="text-[10px] uppercase font-bold text-blue-200">Outstation Taxi</span>
                <h3 className="font-black text-sm text-white drop-shadow-sm truncate">
                  {route.originName} → {route.destName}
                </h3>
              </div>
            </div>

            {/* Bottom Fare Bar with Arrow */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Starting Fare</span>
                <span className="text-sm font-black text-brand-blue">
                  From ₹{route.startingFare.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="w-7 h-7 rounded-full bg-brand-blue text-white flex items-center justify-center group-hover:bg-brand-green transition-colors shadow-2xs">
                <FaArrowRight className="w-2.5 h-2.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
