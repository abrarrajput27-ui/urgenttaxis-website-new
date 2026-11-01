import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';
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
  description: 'Explore comprehensive cab services by Urgent Taxis across Delhi NCR and North India. Reliable One-Way, Round-Trip, Airport, Corporate, and Group transportation.',
  canonicalPath: '/services',
});

const serviceList = [
  {
    id: 'oneway',
    title: '1. One-Way Outstation Taxi',
    href: '/routes',
    image: '/services/oneway.jpg',
    tag: 'Pay Only for One Side',
    description: 'Affordable and reliable one-way intercity cab service across Delhi NCR, Uttar Pradesh, Uttarakhand, Rajasthan, Haryana, and Punjab. Pay exclusively for the distance you travel without round-trip return fare burdens.',
    benefits: ['Zero return fare charges', 'Doorstep pickup & drop', 'Tolls & taxes itemized transparently', 'Instant booking confirmation'],
    useCases: 'Relocation, one-way business travel, airport drop-offs, festival family visits.',
    vehicles: 'Sedan (Dzire/Etios), SUV (Ertiga/Carens), Luxury (Innova Crysta).',
    ctaText: 'Explore One-Way Routes',
  },
  {
    id: 'roundtrip',
    title: '2. Round-Trip Outstation Taxi',
    href: '/routes',
    image: '/services/roundtrip.jpg',
    tag: 'Flexible Multi-Day Travel',
    description: 'Complete round-trip outstation car rental with experienced highway drivers at your disposal for weekend getaways, family holidays, business roadshows, and intercity circuits.',
    benefits: ['Dedicated driver for entire itinerary', 'Flexible stops & sightseeing en route', 'Transparent daily km limits & driver allowance', 'Clean, highway-tested AC vehicles'],
    useCases: 'Weekend vacations, wedding attendance, hill station road trips, multi-city itineraries.',
    vehicles: 'Dzire, Ertiga, Innova Crysta, Tempo Traveller.',
    ctaText: 'Book Round-Trip Cab',
  },
  {
    id: 'airport',
    title: '3. Airport Transfers',
    href: '/airport-transfers',
    image: '/services/airport.jpg',
    tag: '24/7 Guaranteed Punctuality',
    description: 'On-time airport pickups and drop-offs connecting Delhi IGI Airport (T1, T2, T3) with Ghaziabad, Noida, Greater Noida, Gurugram, Faridabad, and regional cities. Free flight tracking included.',
    benefits: ['60 minutes complimentary flight delay buffer', 'Professional terminal meet & greet', 'Dedicated flight number tracking', 'No midnight surge extortion'],
    useCases: 'Corporate arrivals, family flight connections, late-night & early-morning flights.',
    vehicles: 'Sedan, Premium SUV, Innova Crysta.',
    ctaText: 'View Airport Cabs',
  },
  {
    id: 'local',
    title: '4. Local Taxi Rentals (Hourly Packages)',
    href: '/local-rentals',
    image: '/services/local.jpg',
    tag: 'By the Hour Freedom',
    description: 'City taxi hire by the hour for local errands, meetings, and shopping circuits in Ghaziabad, Delhi, Noida, and Gurugram. Choose flexible 4-Hour / 40 km or 8-Hour / 80 km packages.',
    benefits: ['Unlimited stops within booked package', 'Driver waits during appointments', 'Zero surge pricing during peak hours', 'Comfortable AC interiors'],
    useCases: 'City shopping tours, client meetings, hospital visits, event transportation.',
    vehicles: 'Hatchback, Sedan, SUV.',
    ctaText: 'Explore Hourly Packages',
  },
  {
    id: 'corporate',
    title: '5. Corporate Transportation',
    href: '/corporate-taxi',
    image: '/services/corporate.jpg',
    tag: 'Executive Travel Desk',
    description: 'Specialized enterprise travel desk solutions for corporate clients, business delegations, daily employee shuttle, and VIP guest airport transfers with centralized GST billing.',
    benefits: ['Verified executive drivers in uniform', 'Consolidated monthly invoicing with GST credits', 'Priority fleet dispatch desk', 'Strict confidentiality & safety protocols'],
    useCases: 'Executive business visits, client hosting, corporate conferences, regular branch shuttles.',
    vehicles: 'Executive Sedans, Innova Crysta / Hycross.',
    ctaText: 'Inquire for Corporate',
  },
  {
    id: 'sightseeing',
    title: '6. Tourist & Sightseeing Taxi',
    href: '/tour-packages',
    image: '/destinations/jaipur.webp',
    tag: 'Curated Heritage Tours',
    description: 'Guided tourist city cabs and Golden Triangle tours covering Delhi, Agra, and Jaipur. Travel at your own pace with knowledgeable drivers who know local landmarks, monuments, and culinary hotspots.',
    benefits: ['Flexible custom itineraries', 'Doorstep pickup from hotels', 'Scenic route recommendations', 'Ample time at each monument'],
    useCases: 'Delhi Darshan, Agra Taj Mahal day tours, Jaipur heritage day trips.',
    vehicles: 'Sedan, Ertiga SUV, Innova Crysta.',
    ctaText: 'View Tour Packages',
  },
  {
    id: 'pilgrimage',
    title: '7. Pilgrimage Tours (Teerth Yatra)',
    href: '/chardham-yatra',
    image: '/destinations/haridwar.webp',
    tag: 'Sacred Circuit Journeys',
    description: 'Specialized devotional travel packages for Char Dham Yatra (Kedarnath, Badrinath, Gangotri, Yamunotri), Haridwar-Rishikesh Ganga Snan, Mathura-Vrindavan, Ayodhya Ram Mandir, and Vaishno Devi.',
    benefits: ['Experienced hill & mountain drivers', 'Safe driving protocols on ghat roads', 'Support for senior citizen luggage', 'Customizable temple halts'],
    useCases: 'Family teerth yatras, elderly pilgrimage journeys, sacred festival travel.',
    vehicles: 'Ertiga, Innova Crysta, 12-26 Seater Tempo Traveller.',
    ctaText: 'Char Dham & Teerth Cabs',
  },
  {
    id: 'bus',
    title: '8. Bus & Minibus Charter',
    href: '/bus-charter',
    image: '/services/wedding.jpg',
    tag: 'Large Group Logistical Support',
    description: 'Charter bus rentals for large groups, wedding guest shuttles, school trips, and corporate offsites. Available in 21-seater, 35-seater, and 50-seater luxury AC coach options.',
    benefits: ['Pushback luxury seating', 'Large dedicated luggage compartments', 'Commercial permits for pan-India travel', 'Dual professional drivers for long hauls'],
    useCases: 'Wedding guest transit, corporate annual retreats, school educational excursions.',
    vehicles: '21 to 50 Seater Luxury AC Coaches.',
    ctaText: 'Explore Bus Charters',
  },
  {
    id: 'tempo',
    title: '9. Tempo Traveller & Group Transport',
    href: '/tempo-traveller',
    image: '/destinations/manali.jpg',
    tag: '9 to 26 Seater Group Travel',
    description: 'Force Tempo Travellers with 1x1 Maharaja pushback captain seats, individual AC vents, and ambient lighting. Perfect for 8 to 20 passengers heading to Himachal, Uttarakhand, or Rajasthan.',
    benefits: ['Reclining captain chairs', 'Music system & charging points at every seat', 'Spacious roof carrier for baggage', 'Smooth highway suspension'],
    useCases: 'Friend road trips to Manali/Goa, extended family holiday groups, office outings.',
    vehicles: '9, 12, 16, 20, 26 Seater Force Tempo Travellers.',
    ctaText: 'View Tempo Travellers',
  },
];

const faqs = [
  {
    q: 'What types of taxi services does Urgent Taxis offer?',
    a: 'Urgent Taxis provides One-Way Outstation drops, Round-Trip Outstation cabs, 24/7 Airport Transfers (Delhi IGI), Local Hourly Rentals (4hr/40km and 8hr/80km), Corporate Travel desks, Devotional Teerth Yatra cabs, and 9–26 seater Tempo Travellers.',
  },
  {
    q: 'Is one-way taxi service available for all major North Indian cities?',
    a: 'Yes. We operate verified one-way drop taxis connecting Delhi NCR (Ghaziabad, Noida, Gurugram, Faridabad) with over 500 cities across Uttar Pradesh, Uttarakhand, Rajasthan, Haryana, Himachal Pradesh, and Punjab. You pay only for the one-way distance.',
  },
  {
    q: 'Are tolls, state entry taxes, and parking included in the quotation?',
    a: 'Our quotations clearly itemize the base fare, driver allowance, and estimated toll/state border taxes. Fastag tolls and interstate border taxes are charged transparently at actual government plaza rates without hidden markup.',
  },
  {
    q: 'How far in advance should I book my cab?',
    a: 'For outstation trips and airport transfers, we recommend booking at least 2 to 4 hours in advance. For peak holiday periods or specialized vehicles (Innova Crysta, Tempo Traveller), booking 24 hours prior ensures guaranteed category assignment.',
  },
  {
    q: 'What happens if my inbound flight at Delhi Airport is delayed?',
    a: 'For all airport pickup bookings with flight numbers provided, our dispatch desk monitors flight tracking automatically. We offer a complimentary 60-minute waiting buffer from the actual touchdown time.',
  },
  {
    q: 'Can I cancel or reschedule my booking?',
    a: 'Yes. Bookings can be cancelled or rescheduled up to 4 hours before the scheduled pickup time with zero cancellation penalty. Please refer to our Booking Policy and Cancellation terms for full details.',
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

      {/* 3.1 Hero Section */}
      <section className="bg-brand-blue text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-4">
          <span className="inline-block px-4 py-1.5 bg-white/20 rounded-full text-xs font-black backdrop-blur-sm border border-white/30 uppercase tracking-wider">
            Comprehensive Travel Solutions
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight drop-shadow-md">
            Our Taxi & Car Rental Services
          </h1>
          <p className="text-base sm:text-xl text-blue-100 font-medium max-w-3xl mx-auto leading-relaxed">
            Fast To Your Destination – Your Quick Ride Solution! Reliable outstation cabs, 24/7 airport transfers, and local hourly rentals in Delhi NCR and across North India.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/routes"
              className="w-full sm:w-auto px-8 py-4 bg-brand-green hover:bg-brand-green-hover text-white font-black text-sm rounded-xl shadow-lg shadow-brand-green/30 transition-all text-center"
            >
              Book an Outstation Cab →
            </Link>
            <a
              href={`tel:${SITE_CONFIG.phoneRaw}`}
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/30 backdrop-blur-sm transition-all text-center flex items-center justify-center gap-2"
            >
              <FaPhoneAlt className="w-3.5 h-3.5 text-brand-green" />
              Call 24/7: {SITE_CONFIG.phone}
            </a>
          </div>
        </div>
      </section>

      {/* 3.2 Introduction */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 space-y-4">
          <div className="max-w-3xl">
            <span className="text-xs font-bold text-brand-green uppercase tracking-wider block mb-1">
              Who We Are
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-blue tracking-tight">
              Reliable Transportation Services Designed for Seamless Travel
            </h2>
          </div>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
            Urgent Taxis is a premier mobility provider headquartered in Ghaziabad, delivering prompt, courteous, and dependable passenger transit throughout Delhi NCR and North India. Whether you require an urgent early-morning airport drop to Delhi IGI Terminal 3, an economical one-way intercity cab to Agra or Dehradun, a flexible hourly city rental for back-to-back corporate meetings, or a spacious Tempo Traveller for a Himalayan family vacation, our fleet is prepared 24 hours a day, 365 days a year.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-center">
            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="text-2xl font-black text-brand-blue">500+</div>
              <div className="text-xs text-slate-500 font-bold uppercase mt-1">Intercity Routes</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="text-2xl font-black text-brand-green">100%</div>
              <div className="text-xs text-slate-500 font-bold uppercase mt-1">AC Sanitized Fleet</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="text-2xl font-black text-brand-blue">24/7</div>
              <div className="text-xs text-slate-500 font-bold uppercase mt-1">Dispatch Support</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="text-2xl font-black text-brand-green">₹0</div>
              <div className="text-xs text-slate-500 font-bold uppercase mt-1">Hidden Surcharges</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3.3 Why Choose Urgent Taxis? */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-brand-green uppercase tracking-wider">
            Our Advantage
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-brand-blue tracking-tight">
            Why Travelers Choose Urgent Taxis
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            We focus on punctuality, passenger comfort, and absolute transparency from quote to drop-off.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <FaClock className="text-brand-blue w-6 h-6" />,
              title: 'Guaranteed Punctuality',
              desc: 'Drivers arrive 15 minutes before the scheduled pickup time for stress-free departures.',
            },
            {
              icon: <FaShieldAlt className="text-brand-green w-6 h-6" />,
              title: 'Verified Highway Drivers',
              desc: 'Thoroughly background-checked chauffeurs with minimum 5 years inter-state highway experience.',
            },
            {
              icon: <FaMoneyBillWave className="text-brand-blue w-6 h-6" />,
              title: 'Transparent Pricing',
              desc: 'Clear rate cards with zero hidden night charges or unexpected baggage add-ons.',
            },
            {
              icon: <FaCar className="text-brand-green w-6 h-6" />,
              title: 'Well-Maintained Fleet',
              desc: 'Regularly serviced, air-conditioned Sedans, SUVs, and Tempo Travellers in pristine hygienic condition.',
            },
            {
              icon: <FaPlane className="text-brand-blue w-6 h-6" />,
              title: 'Airport Flight Tracking',
              desc: 'Automated flight status monitoring with complimentary 60-minute landing delay grace period.',
            },
            {
              icon: <FaUserTie className="text-brand-green w-6 h-6" />,
              title: '24/7 Dedicated Support',
              desc: 'Direct human dispatch assistance over call and WhatsApp whenever you need assistance.',
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
            Explore All Offerings
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-brand-blue tracking-tight">
            Comprehensive Services Portfolio
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            Click on any service to view route rate cards, hourly packages, or initiate an instant booking.
          </p>
        </div>

        <div className="space-y-8">
          {serviceList.map((srv, idx) => (
            <div
              key={srv.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 hover:shadow-md transition-shadow"
            >
              {/* Image Column */}
              <div className="lg:col-span-5 relative h-64 lg:h-auto bg-slate-100 overflow-hidden">
                <Image
                  src={srv.image}
                  alt={`${srv.title} service by Urgent Taxis in Delhi NCR`}
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
                      Key Benefits:
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
                      <span className="font-bold text-slate-500 uppercase block text-[10px]">Recommended Use Cases</span>
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
                    <FaWhatsapp className="w-3.5 h-3.5" /> Book via WhatsApp
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
              Quick & Effortless
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-blue tracking-tight">
              Our 5-Step Seamless Booking Process
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              From quotation to destination arrival, booking with Urgent Taxis takes under two minutes.
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
                desc: 'Input pickup address, destination, travel date, and preferred time.',
              },
              {
                step: '03',
                title: 'Choose Vehicle',
                desc: 'Pick between Dzire (Sedan), Ertiga (SUV), or Innova Crysta.',
              },
              {
                step: '04',
                title: 'Review & Confirm',
                desc: 'Review itemized fare breakdown and reserve online or via WhatsApp.',
              },
              {
                step: '05',
                title: 'Driver Arrival',
                desc: 'Receive driver name, phone, and car number 30 mins prior with live tracking.',
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

      {/* 3.7 FAQs */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-brand-green uppercase tracking-wider">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-brand-blue tracking-tight">
            Frequently Asked Questions About Our Services
          </h2>
        </div>

        <div className="space-y-3 pt-4">
          {faqs.map((faq, idx) => (
            <details
              key={idx}
              className="group border border-slate-200 rounded-2xl bg-white p-5 open:bg-slate-50 transition-colors shadow-xs"
            >
              <summary className="font-extrabold text-slate-800 cursor-pointer list-none flex justify-between items-center text-sm sm:text-base">
                <span>{faq.q}</span>
                <span className="text-brand-blue group-open:rotate-180 transition-transform font-black text-lg">▾</span>
              </summary>
              <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium border-t border-slate-100 pt-3">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* 3.6 Final CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-blue to-blue-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="max-w-2xl mx-auto relative z-10 space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Ready to Book Your Next Journey?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base font-medium">
              Call our 24/7 highway dispatch desk or send a quick WhatsApp message to get an instant quotation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-2">
            <Link
              href="/routes"
              className="w-full sm:w-auto px-8 py-4 bg-white text-brand-blue hover:bg-slate-100 font-black text-sm rounded-xl shadow-lg transition-all"
            >
              Browse 500+ Routes →
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
