'use client';

import { useState } from 'react';
import Image from 'next/image';

interface VehicleImageProps {
  variantImageUrl?: string | null;
  modelImageUrl?: string | null;
  categoryImageUrl?: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

/**
 * Public Vehicle Image component implementing fallback hierarchy:
 * Variant Image -> Model Image -> Category Image -> SVG Fallback Placeholder
 */
export default function VehicleImage({
  variantImageUrl,
  modelImageUrl,
  categoryImageUrl,
  alt,
  width = 400,
  height = 250,
  className = 'w-full h-full object-cover',
  priority = false,
}: VehicleImageProps) {
  // Determine primary candidate image
  const primarySrc = variantImageUrl || modelImageUrl || categoryImageUrl || null;
  const [imageSrc, setImageSrc] = useState<string | null>(primarySrc);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    // If primary candidate fails, fallback to model, then category, then null (SVG)
    if (imageSrc === variantImageUrl && modelImageUrl) {
      setImageSrc(modelImageUrl);
    } else if ((imageSrc === variantImageUrl || imageSrc === modelImageUrl) && categoryImageUrl) {
      setImageSrc(categoryImageUrl);
    } else {
      setHasError(true);
      setImageSrc(null);
    }
  };

  if (!imageSrc || hasError) {
    return (
      <div className={`bg-slate-900 border border-slate-800 flex flex-col items-center justify-center p-6 text-slate-500 rounded-lg ${className}`}>
        <svg className="w-12 h-12 text-slate-700 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M8 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM4 11h16M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11M3 11v6a1 1 0 001 1h1m16-7v6a1 1 0 01-1 1h-1"
          />
        </svg>
        <span className="text-[11px] font-mono text-slate-600">Urgent Taxis Fleet</span>
      </div>
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      onError={handleError}
      className={className}
    />
  );
}
