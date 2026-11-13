import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';
import PageFAQSection from '@/components/public/PageFAQSection';
import DirectBookingComparison from '@/components/public/DirectBookingComparison';
import {
  FaCar,
  FaPlane,
  FaPhoneAlt,
  FaWhatsapp,
  FaCheckCircle,
  FaShieldAlt,
  FaClock,
  FaMoneyBillWave,
  FaUserTie,
} from 'react-icons/fa';

export const metadata = constructMetadata({
  title: 'Urgent Taxis Services | Outstation, Local & Airport Cab Solutions',
  description: 'Explore taxi and car rental services by Urgent Taxis across Delhi NCR and North India. One-Way, Round-Trip, Airport, Corporate, and Group travel options.',
  canonicalPath: '/services',
});

export const revalidate = 3600; // Static Edge Caching with 1-Hour ISR (TTFB < 50ms)

const serviceList = [
  {
    id: 'oneway',
    title: '1. One-Way Outstation Taxi',
    href: '/routes',
    image: '/services/oneway.webp',
    tag: 'Pay for Distance Traveled',
    description: 'One-way intercity cab service connecting Delhi NCR with destinations across Uttar Pradesh, Uttarakhand, Rajasthan, Haryana, and Punjab. Pay for the distance of your one-way journey.',
    benefits: ['No return journey billing', 'Doorstep pickup and drop', 'Itemized toll and tax breakdown', 'Advance booking confirmation'],
    useCases: 'Relocation, one-way business travel, airport drop-offs, family visits.',
    vehicles: 'Sedan (Dzire/Etios), SUV (Ertiga/Carens), Executive SUV (Innova Crysta).',
    ctaText: 'Explore One-Way Routes',
  },
  {
    id: 'roundtrip',
    title: '2. Round-Trip Outstation Taxi',
    href: '/routes',
    image: '/services/roundtrip.webp',
    tag: 'Multi-Day Outstation Travel',
    description: 'Round-trip outstation car rental with a dedicated driver for weekend getaways, family holidays, business visits, and multi-city travel.',
    benefits: ['Dedicated driver throughout your trip', 'Flexible stops en route', 'Standard daily km limits and driver allowance', 'Air-conditioned vehicles'],
    useCases: 'Weekend vacations, family functions, hill station road trips, business itineraries.',
    vehicles: 'Sedan, Ertiga SUV, Innova Crysta, Tempo Traveller.',
    ctaText: 'Book Round-Trip Cab',
  },
  {
    id: 'airport',
    title: '3. Airport Transfers',
    href: '/airport-transfers',
    image: '/services/airport.webp',
    tag: 'Airport Pickup & Drop',
    description: 'Scheduled airport pickups and drop-offs connecting Delhi IGI Airport (T1, T2, T3) with Ghaziabad, Noida, Greater Noida, Gurugram, Faridabad, and regional cities.',
    benefits: ['Scheduled terminal drop and pickup', 'Driver details shared prior to journey', 'Direct telephone coordination', 'Transparent price breakdown'],
    useCases: 'Flight departure drops, home return pickups, business travel connections.',
    vehicles: 'Sedan, SUV, Innova Crysta.',
    ctaText: 'View Airport Cabs',
  },
  {
    id: 'local',
    title: '4. Local Taxi Rentals (Hourly Packages)',
    href: '/local-rentals',
    image: '/services/local.webp',
    tag: 'Hourly City Packages',
    description: 'City taxi hire by the hour for local errands, meetings, and shopping trips in Ghaziabad, Delhi, Noida, and Gurugram. Choose from 4-Hour / 40 km or 8-Hour / 80 km packages.',
    benefits: ['Flexible city travel within booked package', 'Driver waits between appointments', 'Standard package rates', 'Air-conditioned cabs'],
    useCases: 'City shopping, business meetings, medical visits, local family errands.',
    vehicles: 'Hatchback, Sedan, SUV.',
    ctaText: 'Explore Hourly Packages',
  },
  {
    id: 'corporate',
    title: '5. Corporate Transportation',
    href: '/corporate-taxi',
    image: '/services/corporate.webp',
    tag: 'Business & Office Travel',
    description: 'Corporate travel solutions for business clients, visiting personnel, and executive airport transfers with itemized invoices.',
    benefits: ['Professional chauffeurs', 'GST invoices provided upon request', 'Sedan and SUV category options', 'Prompt scheduling support'],
    useCases: 'Executive business visits, client meetings, corporate conferences, regular office shuttles.',
    vehicles: 'Sedan, Innova Crysta.',
    ctaText: 'Inquire for Corporate',
  },
  {
    id: 'sightseeing',
    title: '6. Tourist & Sightseeing Taxi',
    href: '/tour-packages',
    image: '/destinations/jaipur.webp',
    tag: 'Sightseeing Tours',
    description: 'Tourist cabs for local sightseeing and Golden Triangle trips covering Delhi, Agra, and Jaipur at your preferred pace.',
    benefits: ['Customizable travel schedule', 'Hotel and residence pickup', 'Convenient travel timing', 'Comfortable seating for groups'],
    useCases: 'Delhi Darshan, Agra Taj Mahal day visits, Jaipur heritage day trips.',
    vehicles: 'Sedan, Ertiga SUV, Innova Crysta.',
    ctaText: 'View Tour Packages',
  },
  {
    id: 'pilgrimage',
    title: '7. Pilgrimage Tours (Teerth Yatra)',
    href: '/chardham-yatra',
    image: '/destinations/haridwar.webp',
    tag: 'Devotional Circuits',
    description: 'Devotional travel cabs for Haridwar, Rishikesh, Mathura-Vrindavan, Ayodhya, and Uttarakhand pilgrimage routes.',
    benefits: ['Drivers familiar with highway and hill routes', 'Courteous customer support', 'Planned rest stops', 'Custom travel duration'],
    useCases: 'Family pilgrimage journeys, senior citizen travel, temple visits.',
    vehicles: 'Ertiga, Innova Crysta, Tempo Traveller.',
    ctaText: 'Char Dham & Teerth Cabs',
  },
  {
    id: 'bus',
    title: '8. Bus & Minibus Charter',
    href: '/bus-charter',
    image: '/services/wedding.webp',
    tag: 'Group Travel Options',
    description: 'Bus and coach hire assistance for large groups, wedding guest transportation, and group events upon prior reservation.',
    benefits: ['Multiple seating options (21 to 50 seats)', 'Luggage space', 'Commercial permits for intercity travel', 'Advance booking coordination'],
    useCases: 'Wedding guest transportation, company outings, large group events.',
    vehicles: '21 to 50 Seater AC Coaches.',
    ctaText: 'Explore Bus Charters',
  },
  {
    id: 'tempo',
    title: '9. Tempo Traveller & Group Transport',
    href: '/tempo-traveller',
    image: '/destinations/manali.webp',
    tag: 'Group Transportation',
    description: 'Force Tempo Travellers with pushback seating and air conditioning for family and group tours heading to Rajasthan, Uttarakhand, or Himachal Pradesh.',
    benefits: ['Comfortable pushback seating', 'Dedicated luggage carrier', 'Air-conditioned interior', 'Suitable for groups of 9 to 20+'],
    useCases: 'Group holidays to hill stations, family road trips, event travel.',
    vehicles: '9, 12, 16, 20, 26 Seater Force Tempo Travellers.',
    ctaText: 'View Tempo Travellers',
  },
];

const faqs = [
  {
    q: 'What types of taxi services does Urgent Taxis offer?',
    a: 'Urgent Taxis provides One-Way Outstation drops, Round-Trip Outstation cabs, Airport Transfers (Delhi IGI), Local Hourly Rentals (4hr/40km and 8hr/80km), Corporate Travel support, and Tempo Travellers for group travel.',
  },
  {
    q: 'How are outstation taxi fares calculated?',
    a: 'Outstation one-way fares are calculated based on the distance between the pickup and drop city. Round-trip fares include a standard daily minimum km allowance and driver day allowance. Tolls and state taxes are itemized clearly.',
  },
  {
    q: 'Are tolls and state border taxes included in the fare?',
    a: 'Our quotations clearly itemize the base fare, driver allowance, and estimated toll/state border taxes. Plaza tolls and interstate taxes can be paid as incurred or included as outlined in your fare summary.',
  },
  {
    q: 'How far in advance should I book my cab?',
    a: 'For outstation journeys and airport transfers, we recommend booking at least 2 to 4 hours in advance. For peak holiday dates or larger vehicles (Innova Crysta, Tempo Traveller), booking 24 hours prior ensures timely vehicle allocation.',
  },
  {
    q: 'How do airport pickups work?',
    a: 'Please share your flight number and arrival terminal during booking. Our team coordinates driver arrival to match your scheduled landing time and provides the driver contact details prior to pickup.',
  },
  {
    q: 'Can I cancel or reschedule my booking?',
    a: 'Yes. Bookings can be modified or cancelled by contacting our team in advance. Please refer to our Booking Policy and Cancellation terms for applicable terms.',
  },
];

export default function ServicesPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Our Services' },
  ];

  const generalWhatsAppUrl = generateWhatsAppLink(SITE_CONFIG.whatsapp, {
    customMessage: 'Hello Urgent Taxis! 👋\n\nI would like to inquire about your taxi and car rental services. ✨'
  });

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans pb-20">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <PublicBreadcrumbs items={breadcrumbItems} />
      </div>

      {/* 1. UPGRADED HERO SECTION */}
      <section className="relative bg-[#0a1128] text-white py-14 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
            <span>Comprehensive North India Travel Solutions</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
            Our Taxi &amp; <span className="text-brand-green">Car Rental Services</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed font-medium">
            Fast To Your Destination – Your Quick Ride Solution! Verified outstation cabs, 24/7 IGI airport transfers, flexible local hourly rentals, and group Tempo Travellers across Delhi NCR and North India.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs sm:text-sm font-semibold text-blue-200">
            <span className="bg-white/10 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/15">
              🚗 One-Way &amp; Round-Trip Outstation
            </span>
            <span>•</span>
            <span className="bg-white/10 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/15">
              ✈️ 24/7 IGI Airport Transfers
            </span>
            <span>•</span>
            <span className="bg-white/10 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/15">
              ⏱️ Local Hourly Rentals
            </span>
            <span>•</span>
            <span className="bg-white/10 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/15">
              🚐 Group Tempo Travellers
            </span>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/routes"
              className="px-8 py-3.5 bg-brand-green hover:bg-brand-green-hover text-white font-black text-sm rounded-xl shadow-lg transition-transform hover:scale-105 text-center"
            >
              Browse 500+ Outstation Routes →
            </Link>
            <a
              href={`tel:${SITE_CONFIG.phoneRaw}`}
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/25 backdrop-blur-xs transition-colors text-center flex items-center justify-center gap-2"
            >
              <FaPhoneAlt className="w-3.5 h-3.5 text-brand-green" />
              Call Helpline: {SITE_CONFIG.phone}
            </a>
          </div>
        </div>
      </section>

      {/* 3.2 Introduction */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 space-y-4">
          <div className="max-w-3xl">
            <span className="text-xs font-bold text-brand-green uppercase tracking-wider block mb-1">
              About Our Services
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-blue tracking-tight">
              Passenger Transportation Services Across North India
            </h2>
          </div>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
            Urgent Taxis operates passenger road transportation services based in Ghaziabad, serving travelers across Delhi NCR and neighboring northern states. We cater to airport pickups and drops to Delhi IGI Airport, one-way intercity drops, round-trip family vacations, local hourly rentals for shopping or business, and Tempo Travellers for group tours.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-center">
            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="text-xl sm:text-2xl font-black text-brand-blue">One-Way & Return</div>
              <div className="text-xs text-slate-500 font-bold uppercase mt-1">Intercity Drops</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="text-xl sm:text-2xl font-black text-brand-green">Air-Conditioned</div>
              <div className="text-xs text-slate-500 font-bold uppercase mt-1">Sedan & SUV Fleet</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="text-xl sm:text-2xl font-black text-brand-blue">Direct Support</div>
              <div className="text-xs text-slate-500 font-bold uppercase mt-1">Phone & WhatsApp</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="text-xl sm:text-2xl font-black text-brand-green">Clear Fares</div>
              <div className="text-xs text-slate-500 font-bold uppercase mt-1">Itemized Breakdown</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3.3 Why Choose Urgent Taxis? */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-brand-green uppercase tracking-wider">
            Customer Benefits
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-brand-blue tracking-tight">
            Why Book With Urgent Taxis
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            We focus on comfortable vehicles, experienced drivers, and clear pricing communication.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <FaClock className="text-brand-blue w-6 h-6" />,
              title: 'Timely Service',
              desc: 'Drivers aim for punctual arrival at your scheduled pickup location.',
            },
            {
              icon: <FaShieldAlt className="text-brand-green w-6 h-6" />,
              title: 'Experienced Drivers',
              desc: 'Chauffeurs familiar with national highways, expressway routes, and hill driving.',
            },
            {
              icon: <FaMoneyBillWave className="text-brand-blue w-6 h-6" />,
              title: 'Itemized Fares',
              desc: 'Clear quotations detailing base fare, driver allowance, and estimated tolls.',
            },
            {
              icon: <FaCar className="text-brand-green w-6 h-6" />,
              title: 'Clean Vehicles',
              desc: 'Air-conditioned Sedans, SUVs, and Tempo Travellers prepared for highway travel.',
            },
            {
              icon: <FaPlane className="text-brand-blue w-6 h-6" />,
              title: 'Airport Coordination',
              desc: 'Pre-scheduled terminal pickups and drop-offs with driver details shared in advance.',
            },
            {
              icon: <FaUserTie className="text-brand-green w-6 h-6" />,
              title: 'Direct Support',
              desc: 'Booking and trip coordination assistance directly via call and WhatsApp.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-brand-blue hover:shadow-md transition-all space-y-3"
            >
              <div className="p-3 bg-slate-50 rounded-xl w-fit border border-slate-100">{item.icon}</div>
              <h3 className="font-extrabold text-base text-slate-800">{item.title}</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3.4 Individual Service Sections (9 Services) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-brand-green uppercase tracking-wider">
            All Services
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-brand-blue tracking-tight">
            Our Service Offerings
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            Browse our transportation categories and choose the option that matches your itinerary.
          </p>
        </div>

        <div className="space-y-8">
          {serviceList.map((srv) => (
            <div
              key={srv.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 hover:shadow-md transition-shadow"
            >
              {/* Image Column */}
              <div className="lg:col-span-5 relative h-64 lg:h-auto bg-slate-100 overflow-hidden">
                <Image
                  src={srv.image}
                  alt={`${srv.title} service by Urgent Taxis`}
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <span className="absolute top-4 left-4 bg-brand-blue/90 backdrop-blur-xs text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  {srv.tag}
                </span>
              </div>

              {/* Content Column */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-brand-blue tracking-tight">
                      {srv.title}
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed font-medium">
                      {srv.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Key Highlights:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 font-medium">
                      {srv.benefits.map((b, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <FaCheckCircle className="text-brand-green w-3.5 h-3.5 flex-shrink-0" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-500 uppercase block text-[10px]">Use Cases</span>
                      <span className="font-semibold text-slate-800">{srv.useCases}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-500 uppercase block text-[10px]">Available Vehicles</span>
                      <span className="font-semibold text-slate-800">{srv.vehicles}</span>
                    </div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                  <Link
                    href={srv.href}
                    className="w-full sm:w-auto px-6 py-3 bg-brand-blue hover:bg-brand-blue-hover text-white font-black text-xs rounded-xl shadow-sm transition-all text-center"
                  >
                    {srv.ctaText} →
                  </Link>
                  <a
                    href={generateWhatsAppLink(SITE_CONFIG.whatsapp, {
                      tripType: srv.title,
                      customMessage: `Hello Urgent Taxis! 👋\n\nI would like to inquire about booking *${srv.title}*.`
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-3 bg-brand-green hover:bg-brand-green-hover text-white font-bold text-xs rounded-xl shadow-sm transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    <FaWhatsapp className="w-3.5 h-3.5" /> Inquire via WhatsApp
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3.5 5-Step Booking Process */}
      <section className="bg-slate-100 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-brand-green uppercase tracking-wider">
              Booking Steps
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-blue tracking-tight">
              How to Book Your Taxi
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Simple steps from inquiry to trip confirmation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                step: '01',
                title: 'Select Service',
                desc: 'Choose One-Way, Round-Trip, Airport Drop, or Hourly Rental.',
              },
              {
                step: '02',
                title: 'Enter Route Info',
                desc: 'Input pickup address, destination, travel date, and pickup time.',
              },
              {
                step: '03',
                title: 'Choose Vehicle',
                desc: 'Select from Sedan (Dzire), SUV (Ertiga), or Innova Crysta.',
              },
              {
                step: '04',
                title: 'Review Fare',
                desc: 'Review itemized fare breakdown and confirm online or via WhatsApp.',
              },
              {
                step: '05',
                title: 'Driver Coordination',
                desc: 'Driver contact details shared prior to scheduled journey time.',
              },
            ].map((st, i) => (
              <div
                key={i}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 relative overflow-hidden"
              >
                <div className="text-3xl font-black text-brand-blue/15">{st.step}</div>
                <h3 className="font-extrabold text-sm text-slate-800">{st.title}</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

            {/* 3.65 DIRECT BOOKING COMPARISON */}
      <DirectBookingComparison />

      {/* 3.7 FAQs */}

      <section className="py-10 sm:py-14 md:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        <PageFAQSection

          faqs={faqs.map(f => ({ question: f.q, answer: f.a }))}

          title="Cab Services Frequently Asked Questions"

          subtitle="Transparent guidance on one-way drops, outstation cabs, round trips, and verified chauffeurs."

          twoColumnLayout={true}

          includeSchema={true}

        />

      </section>



      {/* 3.6 Final CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-blue to-blue-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="max-w-2xl mx-auto relative z-10 space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Ready to Book Your Ride?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base font-medium">
              Call our team directly or message us on WhatsApp for bookings and fare inquiries.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-2">
            <Link
              href="/routes"
              className="w-full sm:w-auto px-8 py-4 bg-white text-brand-blue hover:bg-slate-100 font-black text-sm rounded-xl shadow-lg transition-all"
            >
              Browse Routes →
            </Link>
            <a
              href={generalWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-brand-green hover:bg-brand-green-hover text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <FaWhatsapp className="w-4 h-4" /> WhatsApp Booking
            </a>
            <a
              href={`tel:${SITE_CONFIG.phoneRaw}`}
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/30 backdrop-blur-sm transition-all flex items-center justify-center gap-2"
            >
              <FaPhoneAlt className="w-3.5 h-3.5 text-brand-green" /> Call: {SITE_CONFIG.phone}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
