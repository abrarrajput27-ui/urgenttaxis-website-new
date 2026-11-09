import { supabaseServer } from '@/lib/supabase/server';
import MmtBookingWidget from '@/components/public/MmtBookingWidget';
import VehicleImage from '@/components/public/VehicleImage';
import { constructMetadata, generateLocalBusinessSchema, SITE_CONFIG } from '@/lib/seo';
import Link from 'next/link';
import Image from 'next/image';
import { FaUser, FaSuitcase, FaSnowflake, FaMusic, FaMapMarkerAlt, FaRoute } from 'react-icons/fa';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { buildWhatsAppBookingLink } from '@/lib/pricing';
import RoutesTabWidget from '@/components/public/RoutesTabWidget';
import TrustSection from '@/components/public/TrustSection';
import PageFAQSection from '@/components/public/PageFAQSection';
import HomepageReviewsSection from '@/components/public/HomepageReviewsSection';
import {
  FALLBACK_CATEGORIES,
  FALLBACK_LOCATIONS,
  FALLBACK_ROUTES,
  FALLBACK_PACKAGES,
  withTimeout,
} from '@/lib/data/fallback-data';

export const metadata = constructMetadata({
  title: 'Taxi Service in Ghaziabad & Outstation Cabs',
  description: 'Book reliable taxi service in Ghaziabad, Noida & Delhi NCR. Verified AC cabs for outstation trips, IGI airport transfers & local rentals. Call 24/7.',
});

export default async function HomePage() {
  let categories = FALLBACK_CATEGORIES;
  let routes = FALLBACK_ROUTES;
  let locations = FALLBACK_LOCATIONS;
  let localPackages = FALLBACK_PACKAGES;

  try {
    const supabase = await supabaseServer();
    const [catRes, routeRes, locRes, pkgRes] = await Promise.all([
      withTimeout(
        supabase.from('vehicle_categories').select('*').eq('is_active', true).order('display_order', { ascending: true }),
        2000,
        { data: null }
      ),
      withTimeout(
        supabase.from('routes').select('*, origin:locations!routes_origin_location_id_fkey(*), destination:locations!routes_destination_location_id_fkey(*)').eq('is_active', true).order('created_at', { ascending: false }),
        2000,
        { data: null }
      ),
      withTimeout(
        supabase.from('locations').select('*').eq('is_active', true).order('name', { ascending: true }),
        2000,
        { data: null }
      ),
      withTimeout(
        supabase.from('pricing_local_packages').select('*').eq('is_active', true),
        2000,
        { data: null }
      ),
    ]);

    if (catRes?.data && catRes.data.length > 0) categories = catRes.data;
    if (routeRes?.data && routeRes.data.length > 0) routes = routeRes.data;
    if (locRes?.data && locRes.data.length > 0) locations = locRes.data;
    if (pkgRes?.data && pkgRes.data.length > 0) localPackages = pkgRes.data;
  } catch (err) {
    console.warn('Supabase fetch failed on HomePage, using fallback data:', err);
  }

  const localBusinessSchema = generateLocalBusinessSchema();

  // Visible FAQs for FAQPage JSON-LD Schema
  const visibleFaqs = [
    {
      question: 'How is the One-Way Outstation fare calculated?',
      answer: 'One-Way outstation fares include a base distance threshold and base fare. Extra distance beyond the included limit is charged at a fixed per-KM rate. Driver allowance is included in the base fare.',
    },
    {
      question: 'How does Round-Trip daily minimum billing work?',
      answer: 'Round-Trip outstation bookings carry a guaranteed minimum distance of 250 KM per day. The billable distance is whichever is higher between your actual driven distance and the daily minimum guarantee.',
    },
    {
      question: 'Are Toll Tax and Parking charges included in the fare?',
      answer: 'Toll taxes, state border entry taxes, and parking fees are excluded from the base fare and are payable directly by the passenger at actual toll booths, unless explicitly specified as included in your quotation.',
    },
  ];


  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      {/* 2. HERO SECTION */}
      <section className="relative bg-brand-blue pt-28 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-white/10 overflow-hidden">
        {/* Background Decorative Elements */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          poster="/hero-poster.webp"
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-[#0a1128]/75 z-0"></div>

        <div className="max-w-5xl mx-auto text-center space-y-3 mb-6 relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold tracking-wide shadow-sm">
            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
            Verified & Transparent Outstation Fares
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
            Reliable Outstation Taxi & Cab Service <br className="hidden sm:block" /> in Ghaziabad & Delhi NCR
          </h1>

          <p className="text-blue-100 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            Book verified sedan and SUV cabs for one-way outstation trips, round-trip journeys, local hourly packages, and airport transfers with transparent per-KM pricing.
          </p>
        </div>

        {/* 3. MMT STYLE UNIFORM FARE CALCULATOR & BOOKING WIDGET */}
        <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-4">
          <MmtBookingWidget />
        </div>
      </section>

      {/* PHASE 6B: TRUST SECTION (Moved below Hero) */}
      <TrustSection />

      {/* 4. MOST BOOKED ROUTES SECTION */}
      <section id="routes" className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-end justify-between mb-4 gap-4">
          <div>
            <span className="text-brand-green font-bold text-sm tracking-widest uppercase mb-2 block">QUICK BOOKING</span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-blue tracking-tight">
              Most Booked Routes
            </h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              Below is the list of top outstation routes. You can book our services for any route from here.
            </p>
          </div>
          <Link
            href="/routes"
            className="text-sm font-bold text-brand-blue hover:text-brand-green transition-colors border border-slate-200 bg-white px-5 py-2.5 rounded-full shadow-sm hover:shadow-md flex items-center gap-2"
          >
            View All Routes <span>→</span>
          </Link>
        </div>

        <div className="w-full px-2 sm:px-6 lg:px-8">
          <RoutesTabWidget />
        </div>
      </section>

      {/* 5. FLEET SLIDER SECTION */}
      <section id="fleet" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-100 overflow-hidden">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col items-center text-center mb-4 gap-4">
            <h2 className="text-3xl sm:text-4xl font-black text-brand-blue tracking-tight">
              Wide Range of Clean & Comfortable Cars
            </h2>
            <p className="text-sm text-slate-500 font-medium max-w-2xl">
              Please Select any of them to book your ride with us.
            </p>
          </div>

          <div className="overflow-hidden relative w-full pb-8">
            <div className="flex gap-6 w-max animate-slow-slide hover:[animation-play-state:paused]">
            {[
              { image: "/fleet-brand/Hatchback.webp", title: "Hatchback", models: "(WagonR, Swift, Celerio)", seats: "4 Seats", bags: "2 Bags", ac: true, music: true, outstationPrice: "₹11/km", localPrice: "₹1200", href: "/fleet/hatchback" },
              { image: "/fleet-brand/dzire.webp", title: "Sedan", models: "(Dzire, Etios, Amaze)", seats: "4 Seats", bags: "2 Bags", ac: true, music: true, outstationPrice: "₹12/km", localPrice: "₹1500", href: "/fleet/sedan" },
              { image: "/fleet-brand/Ertiga.webp", title: "SUV / MPV", models: "(Ertiga, Triber, Carens)", seats: "6/7 Seats", bags: "4 Bags", ac: true, music: true, outstationPrice: "₹15/km", localPrice: "₹2000", href: "/fleet/suv-muv" },
              { image: "/fleet-brand/Innova Crysta.webp", title: "Premium SUV", models: "(Innova Crysta, Hycross)", seats: "6/7 Seats", bags: "4 Bags", ac: true, music: true, outstationPrice: "₹22/km", localPrice: "₹2500", href: "/fleet/executive-suv" },
              { image: "/fleet-brand/Tempo Traveller.webp", title: "12 Seater Traveller", models: "Force Traveller 1x1", seats: "12 Seats", bags: "10 Bags", ac: true, music: true, outstationPrice: "₹24/km", localPrice: "₹3500", href: "/tempo-traveller" },
              { image: "/fleet-brand/Tempo Traveller.webp", title: "16 Seater Traveller", models: "Force Traveller 2x1", seats: "16 Seats", bags: "12 Bags", ac: true, music: true, outstationPrice: "₹26/km", localPrice: "₹4500", href: "/tempo-traveller" },
              { image: "/fleet-brand/Tempo Traveller.webp", title: "20 Seater Traveller", models: "Force Traveller 2x1", seats: "20 Seats", bags: "15 Bags", ac: true, music: true, outstationPrice: "₹28/km", localPrice: "₹5500", href: "/tempo-traveller" },
              { image: "/fleet-brand/Tempo Traveller.webp", title: "26 Seater Traveller", models: "Force Traveller 2x2", seats: "26 Seats", bags: "20 Bags", ac: true, music: true, outstationPrice: "₹32/km", localPrice: "₹6500", href: "/tempo-traveller" },
              { image: "/fleet-brand/Urbania.webp", title: "12 Seater Urbania", models: "Force Urbania Premium", seats: "12 Seats", bags: "10 Bags", ac: true, music: true, outstationPrice: "₹30/km", localPrice: "₹5000", href: "/tempo-traveller" },
              { image: "/fleet-brand/Urbania.webp", title: "16 Seater Urbania", models: "Force Urbania Premium", seats: "16 Seats", bags: "14 Bags", ac: true, music: true, outstationPrice: "₹34/km", localPrice: "₹6000", href: "/tempo-traveller" },
              { image: "/fleet-brand/Bus.webp", title: "27 Seater Bus", models: "Luxury AC Bus", seats: "27 Seats", bags: "27 Bags", ac: true, music: true, outstationPrice: "₹45/km", localPrice: "₹8000", href: "/bus-charter" },
              { image: "/fleet-brand/volvo bus.webp", title: "45 Seater Bus", models: "Luxury AC Bus", seats: "45 Seats", bags: "45 Bags", ac: true, music: true, outstationPrice: "₹55/km", localPrice: "₹10000", href: "/bus-charter" },
            ].map((v, i) => (
              <div key={i} className="shrink-0 w-[310px] bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col border border-slate-100 transition-transform hover:-translate-y-1">
                <div className="bg-slate-50 flex items-center justify-center border-b border-slate-100 overflow-hidden h-44 p-2">
                  <Image
                    src={v.image}
                    alt={v.title}
                    width={280}
                    height={160}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-brand-blue mb-0.5">{v.title}</h3>
                  <p className="text-xs text-slate-500 mb-3 min-h-[1.25rem]">{v.models}</p>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-[11px] font-semibold text-slate-700 mb-4">
                    <div className="flex items-center gap-1.5"><FaUser className="text-brand-green" /> {v.seats}</div>
                    <div className="flex items-center gap-1.5"><FaSuitcase className="text-brand-green" /> {v.bags}</div>
                    <div className="flex items-center gap-1.5"><FaSnowflake className="text-brand-green" /> {v.ac ? 'AC' : 'Non-AC'}</div>
                    <div className="flex items-center gap-1.5"><FaMusic className="text-brand-green" /> {v.music ? 'Music' : 'No Music'}</div>
                    <div className="flex items-center gap-1.5"><FaMapMarkerAlt className="text-brand-green" /> Local Trips</div>
                    <div className="flex items-center gap-1.5"><FaRoute className="text-brand-green" /> Outstation</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4 mt-auto">
                    <div className="bg-blue-50 rounded-xl p-2.5 text-center border border-blue-100">
                      <div className="text-[9px] text-brand-blue font-bold uppercase tracking-wider mb-0.5">Outstation</div>
                      <div className="text-xs font-black text-slate-800">{v.outstationPrice}</div>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-2.5 text-center border border-emerald-100">
                      <div className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider mb-0.5">Local Rentals</div>
                      <div className="text-xs font-black text-slate-800">{v.localPrice}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${SITE_CONFIG.phoneRaw}`}
                      className="flex items-center justify-center gap-1.5 border border-brand-blue text-brand-blue font-bold rounded-xl py-2 hover:bg-brand-blue hover:text-white transition-colors text-xs"
                    >
                      <span>📞</span> Call Now
                    </a>
                    <a
                      href={generateWhatsAppLink(SITE_CONFIG.whatsapp, {
                        vehicleModel: v.title,
                        customMessage: `Hello Urgent Taxis! 👋\n\nI am interested in booking the *${v.title}* (${v.models}).\n• Seating: ${v.seats}\n• Outstation Fare: ${v.outstationPrice}\n• Local Package: ${v.localPrice}\n\nPlease share availability.`
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 bg-brand-green hover:bg-brand-green-hover text-white font-bold rounded-xl py-2 transition-colors text-xs shadow-xs"
                    >
                      <span>💬</span> WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>
          
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes slowSlide {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-slow-slide {
              animation: slowSlide 30s linear infinite;
            }
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}} />
        </div>
      </section>

      {/* 6. AIRPORT TRANSFERS SECTION */}
      <section id="airport-transfers" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100">
        <div className="bg-gradient-to-r from-brand-blue to-brand-blue-light rounded-3xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('/hero-pattern.svg')] bg-center mix-blend-overlay"></div>
          <div className="space-y-5 relative z-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold tracking-wide shadow-sm">
              Punctual & Doorstep Pickups
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              Airport Transfers & Railway Pickups
            </h2>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed font-medium">
              Hassle-free transfers to and from IGI Airport Delhi (T3/T1) and Noida International Airport with flight tracking and guaranteed clean vehicles.
            </p>
            <div className="pt-3">
              <Link
                href="/airport-transfers"
                className="inline-block bg-white hover:bg-slate-50 text-brand-blue text-sm font-bold px-6 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                View Airport Transfer Rates →
              </Link>
            </div>
          </div>
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] relative group hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300 w-full">
            <h3 className="text-base font-black text-brand-blue border-b border-slate-100 pb-3">Top Verified Airport Routes</h3>
            <ul className="space-y-4 text-sm text-slate-700 font-medium">
              <li className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span>IGI Airport T3 ↔ Gurgaon Cyber City</span>
                <span className="text-brand-green font-bold bg-brand-green/10 px-2.5 py-1 rounded-md text-xs">Fixed Rate</span>
              </li>
              <li className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span>IGI Airport T3 ↔ Noida Sector 62</span>
                <span className="text-brand-green font-bold bg-brand-green/10 px-2.5 py-1 rounded-md text-xs">Fixed Rate</span>
              </li>
              <li className="flex justify-between items-center">
                <span>IGI Airport T3 ↔ Greater Noida</span>
                <span className="text-brand-green font-bold bg-brand-green/10 px-2.5 py-1 rounded-md text-xs">Fixed Rate</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6B. OUTSTATION TOUR PACKAGES */}
      <section id="tour-packages" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100">
        <div className="text-center space-y-3 mb-4">
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 text-xs font-bold">
            Curated Sightseeing & Hill Station Circuits
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Popular Multi-Day Outstation Tour Cabs
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto font-medium">
            Explore top North India tour circuits with dedicated chauffeur-driven sedans, SUVs, and Tempo Travellers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300 w-full">
            <span className="text-xs font-black px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 block w-fit">
              Uttarakhand Circuit (3N / 4D)
            </span>
            <h3 className="text-xl font-black text-brand-blue leading-tight">Nainital, Bhimtal & Kainchi Dham</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Delhi ↔ Kathgodam ↔ Nainital ↔ Kainchi Dham ↔ Sattal ↔ Bhimtal tour package with complete local sightseeing.
            </p>
            <div className="pt-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-t border-slate-100 mt-2">
              <span className="text-brand-green font-black text-lg">From ₹12,499</span>
              <a
                href={generateWhatsAppLink(SITE_CONFIG.whatsapp, {
                  tripType: 'Tour Package',
                  customMessage: 'Hello Urgent Taxis! 👋\n\nI would like to inquire about the *Nainital Bhimtal Kainchi Dham Tour Package*. ⛰️'
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-green hover:bg-brand-green-hover text-white text-center font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                Inquire Tour
              </a>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden w-full">
            <div className="absolute top-0 right-0 bg-brand-green text-white text-[10px] font-black px-3 py-1 rounded-bl-xl tracking-wider">POPULAR</div>
            <span className="text-xs font-black px-3 py-1.5 rounded-lg bg-brand-green/10 text-brand-green border border-brand-green/20 block w-fit">
              Spiritual Express (2N / 3D)
            </span>
            <h3 className="text-xl font-black text-brand-blue leading-tight">Haridwar & Rishikesh Ganga Aarti</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Delhi ↔ Haridwar Har Ki Pauri ↔ Rishikesh Ram Jhula & Parmarth Niketan Ganga Aarti spiritual tour package.
            </p>
            <div className="pt-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-t border-slate-100 mt-2">
              <span className="text-brand-green font-black text-lg">From ₹7,999</span>
              <a
                href={generateWhatsAppLink(SITE_CONFIG.whatsapp, {
                  tripType: 'Tour Package',
                  customMessage: 'Hello Urgent Taxis! 👋\n\nI would like to inquire about the *Haridwar Rishikesh Tour Package*. ⛰️'
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-green hover:bg-brand-green-hover text-white text-center font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                Inquire Tour
              </a>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300 w-full">
            <span className="text-xs font-black px-3 py-1.5 rounded-lg bg-brand-blue/10 text-brand-blue border border-brand-blue/20 block w-fit">
              Golden Triangle (2N / 3D)
            </span>
            <h3 className="text-xl font-black text-brand-blue leading-tight">Delhi ↔ Agra Taj Mahal ↔ Jaipur</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Complete heritage circuit covering Taj Mahal Agra, Fatehpur Sikri, Amber Fort Jaipur, and Hawa Mahal.
            </p>
            <div className="pt-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-t border-slate-100 mt-2">
              <span className="text-brand-green font-black text-lg">From ₹9,999</span>
              <a
                href={generateWhatsAppLink(SITE_CONFIG.whatsapp, {
                  tripType: 'Tour Package',
                  customMessage: 'Hello Urgent Taxis! 👋\n\nI would like to inquire about the *Golden Triangle Tour Package*. ⛰️'
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-green hover:bg-brand-green-hover text-white text-center font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                Inquire Tour
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 7. LOCAL RENTALS SECTION */}
      <section id="local-rentals" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-4 gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Local Hourly Rental Packages
            </h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              Flexible hourly packages for city shopping, business travel, and local errands.
            </p>
          </div>
          <Link
            href="/local-rentals"
            className="text-sm font-bold text-brand-blue hover:text-brand-green transition-colors border border-slate-200 bg-white px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md"
          >
            View All Packages →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              id: 'sedan-8h',
              name: 'Sedan (Dzire / Etios)',
              badge: 'Most Popular',
              hours: 8,
              km: 80,
              price: 1500,
              extraKm: 11,
              extraHour: 180,
              vehicle: 'Sedan',
            },
            {
              id: 'ertiga-8h',
              name: 'SUV / MPV (Ertiga)',
              badge: 'Family Ride',
              hours: 8,
              km: 80,
              price: 2000,
              extraKm: 15,
              extraHour: 220,
              vehicle: 'SUV / Ertiga',
            },
            {
              id: 'crysta-8h',
              name: 'Innova Crysta',
              badge: 'Premium Luxury',
              hours: 8,
              km: 80,
              price: 2500,
              extraKm: 20,
              extraHour: 250,
              vehicle: 'Innova Crysta',
            },
          ].map((pkg) => {
            const waUrl = buildWhatsAppBookingLink({
              serviceType: 'Local rental',
              vehicleName: pkg.vehicle,
              origin: 'Ghaziabad / Delhi NCR',
              destination: '8h/80km Local Rental Package',
              estimatedFare: pkg.price,
              pageUrl: 'https://www.urgenttaxis.in/local-rentals',
            });

            return (
              <div
                key={pkg.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 p-8 space-y-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between w-full"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black px-3 py-1.5 rounded-lg bg-blue-50 text-brand-blue border border-blue-100 block w-fit">
                      {pkg.name}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                      {pkg.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-slate-900">
                      {pkg.hours} Hours / {pkg.km} KM
                    </h3>
                    <span className="text-2xl text-emerald-800 tabular-nums font-black block mt-2">
                      ₹{pkg.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-500 font-medium block">30% Advance Token: ₹{Math.round(pkg.price * 0.30)}</span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium bg-slate-50 p-3 rounded-2xl border border-slate-100 mt-4 space-y-1">
                    <span className="block">Extra KM: <strong>₹{pkg.extraKm}/km</strong></span>
                    <span className="block">Extra Hour: <strong>₹{pkg.extraHour}/hr</strong></span>
                  </p>
                </div>

                <div className="pt-2">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#1e1b4b] hover:bg-slate-800 text-white text-sm font-bold py-3.5 rounded-2xl transition-all shadow-md"
                  >
                    💬 Book Package
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>



      {/* 8.5. GOOGLE VERIFIED CUSTOMER REVIEWS SECTION */}
      <HomepageReviewsSection />

      {/* 9. VISIBLE FAQS SECTION */}
      {/* 9. VISIBLE FAQS SECTION (Migrated to shared PageFAQSection component) */}
      <section id="faq" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100">
        <PageFAQSection
          faqs={visibleFaqs}
          title="Frequently Asked Questions"
          subtitle="Clear answers regarding outstation fares, toll inclusions, and driver allowances."
          twoColumnLayout={true}
          includeSchema={true}
        />
      </section>

    </div>
  );
}
