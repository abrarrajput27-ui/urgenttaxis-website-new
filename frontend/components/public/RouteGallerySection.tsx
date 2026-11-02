import React from 'react';
import Image from 'next/image';

interface RouteGallerySectionProps {
  originName: string;
  destName: string;
}

export default function RouteGallerySection({ originName, destName }: RouteGallerySectionProps) {
  const normDest = destName.toLowerCase();

  // Match destination image
  let destImage = '/destinations/agra.jpg';
  if (normDest.includes('dehradun')) destImage = '/destinations/dehradun.webp';
  else if (normDest.includes('haridwar')) destImage = '/destinations/haridwar.webp';
  else if (normDest.includes('rishikesh')) destImage = '/destinations/rishikesh.webp';
  else if (normDest.includes('jaipur')) destImage = '/destinations/jaipur.webp';
  else if (normDest.includes('chandigarh')) destImage = '/destinations/chandigarh.webp';
  else if (normDest.includes('shimla')) destImage = '/destinations/shimla.webp';
  else if (normDest.includes('manali')) destImage = '/destinations/manali.jpg';
  else if (normDest.includes('nainital')) destImage = '/destinations/nainital.webp';
  else if (normDest.includes('mussoorie')) destImage = '/destinations/mussoorie.webp';
  else if (normDest.includes('ramnagar') || normDest.includes('corbett')) destImage = '/destinations/ramnagar.webp';
  else if (normDest.includes('amritsar')) destImage = '/destinations/amritsar.jpg';
  else if (normDest.includes('lucknow')) destImage = '/destinations/lucknow.jpg';
  else if (normDest.includes('udaipur')) destImage = '/destinations/udaipur.jpg';

  const galleryItems = [
    {
      src: destImage,
      alt: `${destName} destination landmark and travel attraction for taxi trip from ${originName}`,
      caption: `${destName} Tourism & City Landmarks`,
      tag: 'Destination View',
    },
    {
      src: '/fleet-brand/dzire.png',
      alt: `Sedan Dzire AC cab for ${originName} to ${destName} highway taxi journey`,
      caption: 'Sedan (Dzire / Etios) - 4 Seater',
      tag: 'Comfort Sedan',
    },
    {
      src: '/fleet-brand/Ertiga.png',
      alt: `Maruti Ertiga 6 seater family SUV cab for ${originName} to ${destName}`,
      caption: 'SUV / MPV (Ertiga / Carens) - 6 Seater',
      tag: 'Family SUV',
    },
    {
      src: '/fleet-brand/Innova%20Crysta.png',
      alt: `Toyota Innova Crysta luxury 7 seater taxi for ${originName} to ${destName} outstation trip`,
      caption: 'Innova Crysta - Luxury 7 Seater',
      tag: 'Premium Luxury',
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4 font-sans">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h2 className="text-xl font-black text-brand-blue flex items-center gap-2">
          <span>📸</span> Route & Fleet Gallery ({originName} to {destName})
        </h2>
        <span className="text-xs bg-blue-50 text-brand-blue font-bold px-3 py-1 rounded-full border border-blue-200">
          Clean AC Fleet
        </span>
      </div>
      <p className="text-xs text-slate-500 font-medium">
        Take a visual tour of our sanitized vehicles and scenic landmarks on the {originName} to {destName} corridor:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        {galleryItems.map((item, idx) => (
          <div
            key={idx}
            className="group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              <span className="absolute top-2 left-2 bg-brand-blue/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                {item.tag}
              </span>
            </div>
            <div className="p-3 bg-white border-t border-slate-100">
              <p className="text-xs font-bold text-slate-800 text-center">{item.caption}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
