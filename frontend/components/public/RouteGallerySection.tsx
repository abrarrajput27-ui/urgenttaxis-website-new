'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { FaChevronLeft, FaChevronRight, FaTimes, FaExpand, FaSearchPlus, FaTaxi } from 'react-icons/fa';

export interface GalleryItem {
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
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);

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

  const handleOpenModal = (idx: number) => {
    setActiveModalIndex(idx);
  };

  const handleCloseModal = () => {
    setActiveModalIndex(null);
  };

  const handlePrevImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveModalIndex((prev) => {
      if (prev === null) return 0;
      return prev > 0 ? prev - 1 : galleryItems.length - 1;
    });
  }, [galleryItems.length]);

  const handleNextImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveModalIndex((prev) => {
      if (prev === null) return 0;
      return prev < galleryItems.length - 1 ? prev + 1 : 0;
    });
  }, [galleryItems.length]);

  // Keyboard navigation for fast interactive modal
  useEffect(() => {
    if (activeModalIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseModal();
      } else if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalIndex, handlePrevImage, handleNextImage]);

  return (
    <div className={`space-y-4 font-sans ${className}`}>
      {/* Header with Arrow Controls */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-brand-blue text-[11px] font-bold mb-1">
            <span>📷</span>
            <span>Click Any Photo to Open Instant View</span>
          </div>
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
            className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-600 hover:text-brand-blue hover:bg-slate-50 transition-all cursor-pointer active:scale-90"
          >
            <FaChevronLeft className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={scrollRight}
            aria-label="Next gallery image"
            className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-600 hover:text-brand-blue hover:bg-slate-50 transition-all cursor-pointer active:scale-90"
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
            onClick={() => handleOpenModal(idx)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleOpenModal(idx);
              }
            }}
            className="min-w-[220px] sm:min-w-[240px] md:min-w-[260px] flex-1 snap-start bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all group flex flex-col justify-between cursor-pointer active:scale-[0.98]"
          >
            <div className="relative h-40 sm:h-44 w-full bg-slate-100 overflow-hidden">
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
                sizes="(max-width: 640px) 70vw, (max-width: 1024px) 30vw, 20vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                  <FaSearchPlus className="w-2.5 h-2.5" />
                  <span>Click to view</span>
                </span>
                <span className="text-white/80 text-xs">
                  <FaExpand className="w-3 h-3" />
                </span>
              </div>
            </div>
            <div className="p-3 bg-white border-t border-slate-100 text-center">
              <p className="text-xs font-black text-slate-800 line-clamp-1 group-hover:text-brand-blue transition-colors">
                {item.caption}
              </p>
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

      {/* Fast Interactive Lightbox Modal */}
      {activeModalIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-150"
          onClick={handleCloseModal}
        >
          {/* Top Bar with Counter & Close Button */}
          <div
            className="w-full max-w-5xl flex items-center justify-between text-white pb-3 border-b border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm font-black bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white">
                Photo {activeModalIndex + 1} of {galleryItems.length}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-300 hidden sm:inline">
                {galleryItems[activeModalIndex].caption}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCloseModal}
              aria-label="Close image preview"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>

          {/* Center Image Container with Navigation Arrows */}
          <div
            className="relative w-full max-w-5xl flex-1 flex items-center justify-center my-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Previous Arrow */}
            <button
              type="button"
              onClick={handlePrevImage}
              aria-label="Previous photo"
              className="absolute left-2 sm:left-4 z-10 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-90 border border-white/20"
            >
              <FaChevronLeft className="w-4 h-4" />
            </button>

            {/* Main High-Res Image */}
            <div className="relative w-full h-[60vh] sm:h-[70vh] rounded-2xl overflow-hidden shadow-2xl bg-black/40">
              <Image
                src={galleryItems[activeModalIndex].src}
                alt={galleryItems[activeModalIndex].alt}
                fill
                priority
                className="object-contain"
                sizes="(max-width: 1280px) 95vw, 1200px"
              />
            </div>

            {/* Next Arrow */}
            <button
              type="button"
              onClick={handleNextImage}
              aria-label="Next photo"
              className="absolute right-2 sm:right-4 z-10 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-90 border border-white/20"
            >
              <FaChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Bar: Landmark Details & Fast Action Button */}
          <div
            className="w-full max-w-5xl bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-3 border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center sm:text-left">
              <h3 className="font-black text-sm sm:text-base text-white">
                {galleryItems[activeModalIndex].caption}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Scenic viewpoint along the {originName} to {destName} route corridor.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all cursor-pointer active:scale-95"
              >
                Close View
              </button>
              <a
                href="#booking-widget"
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
              >
                <FaTaxi className="w-3.5 h-3.5" />
                <span>Book Cab for this Trip</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
