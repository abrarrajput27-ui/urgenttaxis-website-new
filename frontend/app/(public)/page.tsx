import { supabaseServer } from '@/lib/supabase/server';
import PublicFareWidget from '@/components/public/PublicFareWidget';
import VehicleImage from '@/components/public/VehicleImage';
import { constructMetadata, generateLocalBusinessSchema, SITE_CONFIG } from '@/lib/seo';
import Link from 'next/link';
import Image from 'next/image';
import { FaUser, FaSuitcase, FaSnowflake, FaMusic, FaMapMarkerAlt, FaRoute } from 'react-icons/fa';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import RoutesTabWidget from '@/components/public/RoutesTabWidget';
import TrustSection from '@/components/public/TrustSection';

export const metadata = constructMetadata({
  title: 'Outstation Cab Booking & Airport Taxi Service',
  description: 'Book reliable sedan, SUV, and outstation cabs in Delhi NCR, Agra, Haridwar, Jaipur, and airport transfers with transparent pricing.',
});

export default async function HomePage() {
  const supabase = await supabaseServer();

  // Fetch reference master data
  const { data: categories } = await supabase
    .from('vehicle_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  const { data: routes } = await supabase
    .from('routes')
    .select('*, origin:locations!routes_origin_location_id_fkey(*), destination:locations!routes_destination_location_id_fkey(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  const { data: localPackages } = await supabase
    .from('pricing_local_packages')
    .select('*')
    .eq('is_active', true);

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

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: visibleFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Video */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-brand-blue/70 z-0"></div>

        <div className="max-w-5xl mx-auto text-center space-y-5 mb-10 relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold tracking-wide shadow-sm">
            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
            Guaranteed & Transparent Outstation Fares
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
            Reliable Outstation Taxi <br className="hidden sm:block" /> & Airport Transfers
          </h1>

          <p className="text-indigo-100 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            Book verified sedan and SUV cabs for one-way outstation trips, round-trip journeys, local hourly packages, and airport transfers with transparent per-KM pricing.
          </p>
        </div>

        {/* 3. PUBLIC FARE SEARCH WIDGET */}
        <PublicFareWidget
          localPackages={localPackages || []}
          categories={categories || []}
          routes={routes || []}
          locations={locations || []}
        />
      </section>

      {/* PHASE 6B: TRUST SECTION (Moved below Hero) */}
      <TrustSection />

      {/* 4. MOST BOOKED ROUTES SECTION */}
      <section id="routes" className="py-4 bg-white">
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
      <section id="fleet" className="py-4 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-100 overflow-hidden">
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
              { image: "/fleet-brand/Hatchback.png", title: "Hatchback", models: "(WagonR, Swift, Celerio)", seats: "4 Seats", bags: "2 Bags", ac: true, music: true, outstationPrice: "₹10/km", localPrice: "₹1200" },
              { image: "/fleet-brand/dzire.png", title: "Sedan", models: "(Dzire, Etios, Amaze)", seats: "4 Seats", bags: "2 Bags", ac: true, music: true, outstationPrice: "₹11/km", localPrice: "₹1500" },
              { image: "/fleet-brand/Ertiga.png", title: "SUV / MPV", models: "(Ertiga, Triber, Carens)", seats: "6/7 Seats", bags: "4 Bags", ac: true, music: true, outstationPrice: "₹15/km", localPrice: "₹2000" },
              { image: "/fleet-brand/Innova%20Crysta.png", title: "Premium SUV", models: "(Innova Crysta, Hycross)", seats: "6/7 Seats", bags: "4 Bags", ac: true, music: true, outstationPrice: "₹20/km", localPrice: "₹2500" },
              { image: "/fleet-brand/Tempo Traveller.png", title: "12 Seater Traveller", models: "Force Traveller 1x1", seats: "12 Seats", bags: "10 Bags", ac: true, music: true, outstationPrice: "₹24/km", localPrice: "₹3500" },
              { image: "/fleet-brand/Tempo Traveller.png", title: "16 Seater Traveller", models: "Force Traveller 2x1", seats: "16 Seats", bags: "12 Bags", ac: true, music: true, outstationPrice: "₹26/km", localPrice: "₹4500" },
              { image: "/fleet-brand/Tempo Traveller.png", title: "20 Seater Traveller", models: "Force Traveller 2x1", seats: "20 Seats", bags: "15 Bags", ac: true, music: true, outstationPrice: "₹28/km", localPrice: "₹5500" },
              { image: "/fleet-brand/Tempo Traveller.png", title: "26 Seater Traveller", models: "Force Traveller 2x2", seats: "26 Seats", bags: "20 Bags", ac: true, music: true, outstationPrice: "₹32/km", localPrice: "₹6500" },
              { image: "/fleet-brand/Urbania.png", title: "12 Seater Urbania", models: "Force Urbania Premium", seats: "12 Seats", bags: "10 Bags", ac: true, music: true, outstationPrice: "₹30/km", localPrice: "₹5000" },
              { image: "/fleet-brand/Urbania.png", title: "16 Seater Urbania", models: "Force Urbania Premium", seats: "16 Seats", bags: "14 Bags", ac: true, music: true, outstationPrice: "₹34/km", localPrice: "₹6000" },
              { image: "/fleet-brand/Bus.png", title: "27 Seater Bus", models: "Luxury AC Bus", seats: "27 Seats", bags: "27 Bags", ac: true, music: true, outstationPrice: "₹45/km", localPrice: "₹8000" },
              { image: "/fleet-brand/volvo bus.png", title: "45 Seater Bus", models: "Luxury AC Bus", seats: "45 Seats", bags: "45 Bags", ac: true, music: true, outstationPrice: "₹55/km", localPrice: "₹10000" },
              // Duplicate to create seamless loop
              { image: "/fleet-brand/Hatchback.png", title: "Hatchback", models: "(WagonR, Swift, Celerio)", seats: "4 Seats", bags: "2 Bags", ac: true, music: true, outstationPrice: "₹10/km", localPrice: "₹1200" },
              { image: "/fleet-brand/dzire.png", title: "Sedan", models: "(Dzire, Etios, Amaze)", seats: "4 Seats", bags: "2 Bags", ac: true, music: true, outstationPrice: "₹11/km", localPrice: "₹1500" },
              { image: "/fleet-brand/Ertiga.png", title: "SUV / MPV", models: "(Ertiga, Triber, Carens)", seats: "6/7 Seats", bags: "4 Bags", ac: true, music: true, outstationPrice: "₹15/km", localPrice: "₹2000" },
              { image: "/fleet-brand/Innova%20Crysta.png", title: "Premium SUV", models: "(Innova Crysta, Hycross)", seats: "6/7 Seats", bags: "4 Bags", ac: true, music: true, outstationPrice: "₹20/km", localPrice: "₹2500" }
            ].map((v, i) => (
              <div key={i} className="shrink-0 w-[300px] bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col border border-slate-100 transition-transform hover:-translate-y-1">
                <div className="bg-slate-50 flex items-center justify-center border-b border-slate-100 overflow-hidden h-40">
                  <Image
                    src={v.image}
                    alt={v.title}
                    width={260}
                    height={160}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-brand-blue mb-1">{v.title}</h3>
                  <p className="text-xs text-slate-500 mb-4 h-4">{v.models}</p>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-semibold text-slate-700 mb-6">
                    <div className="flex items-center gap-1.5"><FaUser className="text-brand-green" /> {v.seats}</div>
                    <div className="flex items-center gap-1.5"><FaSuitcase className="text-brand-green" /> {v.bags}</div>
                    <div className="flex items-center gap-1.5"><FaSnowflake className="text-brand-green" /> {v.ac ? 'AC' : 'Non-AC'}</div>
                    <div className="flex items-center gap-1.5"><FaMusic className="text-brand-green" /> {v.music ? 'Music' : 'No Music'}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6 mt-auto">
                    <div className="bg-purple-50 rounded-xl p-3 text-center border border-purple-100">
                      <div className="text-[10px] text-purple-600 font-bold uppercase tracking-wider mb-1">Outstation</div>
                      <div className="text-sm font-black text-slate-800">{v.outstationPrice}</div>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
                      <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-1">Local Rentals</div>
                      <div className="text-sm font-black text-slate-800">{v.localPrice}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href={`/fleet/${v.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                      className="flex items-center justify-center gap-2 border-2 border-brand-blue text-brand-blue font-bold rounded-full py-2 hover:bg-brand-blue hover:text-white transition-colors text-xs"
                    >
                      View Details
                    </Link>
                    <a
                      href={generateWhatsAppLink(SITE_CONFIG.whatsapp, {
                        vehicleModel: v.title,
                        customMessage: `Hello Urgent Taxis! 👋\n\nI am interested in booking the *${v.title}*.\nPlease share availability and best fare.`
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 border-2 border-brand-green text-brand-green font-bold rounded-full py-2 hover:bg-brand-green hover:text-white transition-colors text-xs"
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
      <section id="airport-transfers" className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100">
        <div className="bg-gradient-to-r from-brand-blue to-brand-blue-light rounded-3xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('/hero-pattern.svg')] bg-center mix-blend-overlay"></div>
          <div className="space-y-5 relative z-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold tracking-wide shadow-sm">
              Punctual & Doorstep Pickups
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              Airport Transfers & Railway Pickups
            </h2>
            <p className="text-sm sm:text-base text-indigo-100 leading-relaxed font-medium">
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
      <section id="tour-packages" className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100">
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
            <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl tracking-wider">POPULAR</div>
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
            <span className="text-xs font-black px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 block w-fit">
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
      <section id="local-rentals" className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100">
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
          {localPackages?.slice(0, 3).map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300 group flex flex-col w-full">
              <span className="text-xs font-black px-3 py-1.5 rounded-lg bg-brand-blue/10 text-brand-blue border border-brand-blue/20 block w-fit">
                {pkg.package_name || `${pkg.included_hours}h / ${pkg.included_km}km`}
              </span>
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  {pkg.included_hours} Hours
                </h3>
                <span className="text-sm text-brand-green font-bold block mt-1">{pkg.included_km} KM Included</span>
              </div>
              <p className="text-sm text-slate-500 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="block">Extra KM: ₹{pkg.extra_km_rate}/km</span>
                <span className="block mt-1">Extra Hour: ₹{pkg.extra_hour_rate}/hr</span>
              </p>
              <div className="pt-2">
                <a
                  href={generateWhatsAppLink(SITE_CONFIG.whatsapp, {
                    tripType: 'Local Rental',
                    customMessage: `Hello Urgent Taxis! 👋\n\nI would like to book a *Local Rental Cab*. 🚖\n⏱️ *Package*: ${pkg.included_hours}H / ${pkg.included_km}KM`
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-brand-blue hover:bg-brand-blue-light text-white text-sm font-bold py-3.5 rounded-xl transition-all shadow-md"
                >
                  Book Package
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>



      {/* 9. VISIBLE FAQS SECTION */}
      <section id="faq" className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-100">
        <div className="text-center space-y-3 mb-4">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Clear answers regarding outstation fares, toll inclusions, and driver allowances.
          </p>
        </div>

        <div className="space-y-5 text-sm">
          {visibleFaqs.map((faq, idx) => (
            <div key={idx} className="bg-white border border-slate-200 p-6 rounded-2xl space-y-2.5 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-base font-black text-brand-blue">{faq.question}</h3>
              <p className="text-slate-600 leading-relaxed font-medium">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
