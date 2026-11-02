'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface GalleryItem {
  src: string;
  caption: string;
  alt: string;
}

interface RouteGallerySectionProps {
  originName: string;
  destName: string;
  galleryItems: GalleryItem[];
  className?: string;
}

export default function RouteGallerySection({
  originName,
  destName,
  galleryItems,
  className = '',
}: RouteGallerySectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <div className={`space-y-4 font-sans ${className}`}>
      {/* Header with Arrow Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Route Gallery
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Scenic highway views and landmarks on the {originName} to {destName} corridor.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={scrollLeft}
            aria-label="Previous gallery image"
            className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-600 hover:text-brand-blue hover:bg-slate-50 transition-all cursor-pointer"
          >
            <FaChevronLeft className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={scrollRight}
            aria-label="Next gallery image"
            className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-600 hover:text-brand-blue hover:bg-slate-50 transition-all cursor-pointer"
          >
            <FaChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Gallery Cards Row / Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {galleryItems.map((item, idx) => (
          <div
            key={idx}
            className="min-w-[220px] sm:min-w-[240px] md:min-w-[260px] flex-1 snap-start bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="relative h-40 sm:h-44 w-full bg-slate-100 overflow-hidden">
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                sizes="(max-width: 640px) 70vw, (max-width: 1024px) 30vw, 20vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="p-3 bg-white border-t border-slate-100 text-center">
              <p className="text-xs font-black text-slate-800 line-clamp-1">{item.caption}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Subtle Dot Indicator */}
      <div className="flex justify-center items-center gap-1.5 pt-1">
        <span className="w-2.5 h-2.5 rounded-full bg-brand-blue" />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
      </div>
    </div>
  );
}
