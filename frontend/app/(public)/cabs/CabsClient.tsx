'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import UnifiedBookingWidget, {
  BookingServiceType,
} from '@/components/public/UnifiedBookingWidget';
import { HourlyRentalPackageId } from '@/lib/pricing';
import { ShieldCheck, Award, Clock, ArrowRight, CheckCircle2, PhoneCall } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/seo';

export default function CabsClient() {
  const searchParams = useSearchParams();

  const serviceType = (searchParams.get('serviceType') as BookingServiceType) || 'one_way';
  const pickup = searchParams.get('pickup') || searchParams.get('origin') || '';
  const drop = searchParams.get('drop') || searchParams.get('destination') || '';
  const date = searchParams.get('date') || searchParams.get('pickupDate') || '';
  const time = searchParams.get('time') || searchParams.get('pickupTime') || '';
  const distanceKm = Number(searchParams.get('distanceKm') || searchParams.get('km') || 0);
  const packageId = (searchParams.get('packageId') as HourlyRentalPackageId) || '8h80km';
  const rawStops = searchParams.get('stops') || '';
  const stops = rawStops ? rawStops.split('|').filter(Boolean) : [];

  const serviceLabelMap: Record<string, string> = {
    one_way: 'One-Way Outstation',
    round_trip: 'Round-Trip Outstation',
    local_rental: 'Hourly Local Rental',
    airport_transfer: 'Airport Transfer',
  };

  const currentServiceLabel = serviceLabelMap[serviceType] || 'Cab Booking';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* 1. TOP HEADER & BREADCRUMBS */}
      <section className="bg-gradient-to-b from-[#1e1b4b] to-[#0f172a] text-white pt-8 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-300">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-emerald-400 font-semibold">Available Cabs</span>
          </nav>

          {/* MMT Style 4-Step Booking Progress Tracker */}
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-2 text-xs font-bold border-b border-white/10 scrollbar-hide">
            <div className="flex items-center gap-1.5 text-emerald-400 shrink-0">
              <span className="w-5 h-5 rounded-full bg-emerald-500/30 border border-emerald-400 flex items-center justify-center text-[11px]">✓</span>
              <span>1. Search Route</span>
            </div>
            <span className="text-white/30 shrink-0">➔</span>
            <div className="flex items-center gap-1.5 text-white bg-white/10 px-3 py-1 rounded-full border border-emerald-400 shrink-0">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[11px]">2</span>
              <span>2. Select Vehicle</span>
            </div>
            <span className="text-white/30 shrink-0">➔</span>
            <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
              <span className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[11px]">3</span>
              <span>3. Trip Details</span>
            </div>
            <span className="text-white/30 shrink-0">➔</span>
            <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
              <span className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[11px]">4</span>
              <span>4. Confirmed</span>
            </div>
          </div>

          {/* Heading */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
            <div>
              <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                {currentServiceLabel}
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                {pickup && drop
                  ? `${pickup} to ${drop} Cabs`
                  : pickup
                  ? `Available Cabs from ${pickup}`
                  : 'Select Your Verified Cab'}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm font-medium mt-1 max-w-2xl leading-relaxed">
                Choose from verified sedans, SUVs, and luxury Innova Crysta cabs. Instant transparent fares with 30% advance deposit and 70% balance paid to the driver.
              </p>
            </div>

            {/* Support Desk Pill */}
            <div className="shrink-0 flex items-center gap-3 bg-white/10 backdrop-blur-xs border border-white/15 px-4 py-2.5 rounded-2xl w-fit">
              <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-xs">
                <span className="block text-slate-300 text-[11px]">24/7 Dispatch Desk</span>
                <a href={`tel:${SITE_CONFIG.phoneRaw}`} className="font-bold text-white hover:text-emerald-300 transition-colors">
                  {SITE_CONFIG.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN RESULTS CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Render Interactive Unified Booking & Vehicle Selection Widget */}
        <UnifiedBookingWidget
          initialServiceType={serviceType}
          defaultOrigin={pickup}
          defaultDestination={drop}
          defaultDistanceKm={distanceKm}
          defaultDate={date}
          defaultTime={time}
          defaultPackageId={packageId}
          defaultStops={stops}
          isDedicatedPage={true}
          className="shadow-2xl"
        />

        {/* 3. ASSURANCE & TRANSPARENCY SECTION */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">30% Token Guarantee</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                100% refundable advance deposit if cancelled up to 24 hours prior to trip start.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Zero Hidden Surcharges</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Includes base vehicle rate, fuel, chauffeur charges, and GST. Toll & parking extra.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-brand-green flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Verified Chauffeurs</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Background-checked highway chauffeurs with extensive North India driving experience.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">24/7 Doorstep Pickup</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Door-to-door pickup across all sectors of Delhi, Noida, Ghaziabad and NCR.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
