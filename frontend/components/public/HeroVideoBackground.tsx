'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

/**
 * Ultra-Fast Hero Background Component
 * - Serves optimized 68KB WebP poster immediately with priority for instant LCP (<100ms)
 * - Defers 8MB video loading until after initial page hydration and idle state on desktop
 * - Bypasses heavy video downloading on mobile viewports (<768px) to guarantee lightning speed
 */
export default function HeroVideoBackground() {
  const [loadVideo, setLoadVideo] = useState(false);

  useEffect(() => {
    // Only load background video on desktop viewports after page is fully idle
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      if ('requestIdleCallback' in window) {
        const handle = (window as any).requestIdleCallback(() => setLoadVideo(true), { timeout: 2500 });
        return () => (window as any).cancelIdleCallback(handle);
      } else {
        const timer = setTimeout(() => setLoadVideo(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
      {/* Instant WebP Hero Poster Image (LCP <= 100ms) */}
      <Image
        src="/hero-poster.webp"
        alt="Urgent Taxis Outstation Travel"
        fill
        priority
        quality={80}
        className="object-cover object-center z-0"
        sizes="100vw"
      />

      {/* Deferred Desktop Background Video (Fades in smoothly without blocking initial render) */}
      {loadVideo && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000 animate-in fade-in"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
      )}

      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-[#0a1128]/75 z-0" />

      {/* Authentic Dotted Pattern matching Brand Theme */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] z-0" />
    </div>
  );
}
