import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { LOCALITIES_DATA, LocalityData } from '@/lib/data/localities-data';
import { BUSINESS_CONFIG } from '@/lib/config';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';
import PageFAQSection from '@/components/public/PageFAQSection';
import MmtBookingWidget from '@/components/public/MmtBookingWidget';
import RoutesTabWidget from '@/components/public/RoutesTabWidget';
import { getCitySpecificFAQs, getCommonBookingFAQs } from '@/lib/faqs/faq-generator';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { Phone, MessageSquare, MapPin, CheckCircle2, Shield, Clock, Compass, Plane, ArrowRight, Car, Users, Briefcase, Sparkles } from 'lucide-react';

interface LocalityPageProps {
  params: Promise<{ locality: string }>;
}

export async function generateStaticParams() {
  return Object.keys(LOCALITIES_DATA).map((locality) => ({
    locality,
  }));
}

export async function generateMetadata({ params }: LocalityPageProps): Promise<Metadata> {
  const { locality } = await params;
  const data = LOCALITIES_DATA[locality];
  if (!data) return {};

  const canonicalUrl = `${BUSINESS_CONFIG.canonicalDomain}/taxi-service/${data.slug}`;

  return {
    title: data.metaTitle,
    description: data.metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      url: canonicalUrl,
      siteName: BUSINESS_CONFIG.brandName,
      locale: 'en_IN',
      type: 'website',
      images: [
        {
          url: `${BUSINESS_CONFIG.canonicalDomain}/logo.jpg`,
          width: 800,
          height: 800,
          alt: `${data.name} Taxi Service - Urgent Taxis`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.metaTitle,
      description: data.metaDescription,
      images: [`${BUSINESS_CONFIG.canonicalDomain}/logo.jpg`],
    },
  };
}

const FLEET_CATEGORIES = [
  {
    name: 'Sedan',
    models: 'Maruti Suzuki Dzire, Hyundai Aura, Honda Amaze',
    seats: 4,
    bags: 2,
    rate: '₹12/km',
    image: '/dzire.webp',
    idealFor: 'Comfortable family and business trips',
    href: '/fleet/sedan',
  },
  {
    name: 'Ertiga',
    models: 'Maruti Suzuki Ertiga (All-New)',
    seats: 6,
    bags: 3,
    rate: '₹15/km',
    image: '/ertiga.webp',
    idealFor: 'Spacious family journeys with extra boot space',
    href: '/fleet/suv-muv',
  },
  {
    name: 'Innova Crysta',
    models: 'Toyota Innova Crysta (Luxury Captain Seats)',
    seats: 7,
    bags: 4,
    rate: '₹22/km',
    image: '/crysta.webp',
    idealFor: 'VIP, hill journeys, and executive highway comfort',
    href: '/fleet/executive-suv',
  },
];

export default async function LocalityPage({ params }: LocalityPageProps) {
  const { locality } = await params;
  const data: LocalityData | undefined = LOCALITIES_DATA[locality];

  if (!data) {
    notFound();
  }

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Taxi Service', href: '/taxi-service' },
    { label: data.name, href: `/taxi-service/${data.slug}`, current: true },
  ];

  const cityFaqs = getCitySpecificFAQs(data.name, data.keyLandmarks && data.keyLandmarks.length > 0 ? data.keyLandmarks : [data.district || data.name]);
  const commonFaqs = getCommonBookingFAQs();
  const customFaqs = data.faqs ? data.faqs.map(f => ({ question: f.question, answer: f.answer })) : [];
  const combinedCityFaqs = [
    ...customFaqs,
    ...cityFaqs,
    ...commonFaqs,
  ].slice(0, 8);

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'TaxiService',
    name: `Urgent Taxis - ${data.name}`,
    telephone: BUSINESS_CONFIG.phone.primaryRaw,
    url: `${BUSINESS_CONFIG.canonicalDomain}/taxi-service/${data.slug}`,
    logo: `${BUSINESS_CONFIG.canonicalDomain}/logo.jpg`,
    image: `${BUSINESS_CONFIG.canonicalDomain}/logo.jpg`,
    description: data.metaDescription,
    priceRange: '₹₹',
    areaServed: {
      '@type': 'AdministrativeArea',
      name: data.district ? `${data.name}, ${data.district}` : data.name,
      containedInPlace: {
        '@type': 'State',
        name: data.state || 'Uttar Pradesh',
      },
    },
    provider: {
      '@type': 'LocalBusiness',
      name: BUSINESS_CONFIG.brandName,
      telephone: BUSINESS_CONFIG.phone.primaryRaw,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'NH-9, Near Masuri Toll Plaza, Masuri',
        addressLocality: 'Ghaziabad',
        addressRegion: 'Uttar Pradesh',
        postalCode: '201015',
        addressCountry: 'IN',
      },
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `Taxi Services in ${data.name}`,
      itemListElement: [
        {
          '@type': 'Offer',
          name: 'One-Way Outstation Taxi',
          priceCurrency: 'INR',
          description: `Chauffeur-driven one-way outstation cab booking from ${data.name}`,
        },
        {
          '@type': 'Offer',
          name: 'Round-Trip Outstation Cab',
          priceCurrency: 'INR',
          description: `Round-trip commercial taxi hire from ${data.name}`,
        },
        {
          '@type': 'Offer',
          name: 'Airport Transfer Cab',
          priceCurrency: 'INR',
          description: `24x7 verified airport pickup and drop taxi from ${data.name}`,
        },
      ],
    },
  };

  const otherLocalities = Object.values(LOCALITIES_DATA)
    .filter((loc) => loc.slug !== data.slug)
    .slice(0, 12);

  const whatsappBaseUrl = generateWhatsAppLink({
    tripType: `Taxi Service in ${data.name}`,
    pickup: data.name,
    pageUrl: `https://www.urgenttaxis.in/taxi-service/${data.slug}`,
    customMessage: `Hello Urgent Taxis! I need to book a verified cab in ${data.name}. Please share cab availability & instant quote.`,
  });

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      {/* Breadcrumbs Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <PublicBreadcrumbs items={breadcrumbs} />
        </div>
      </div>

      {/* ── TOP HERO SECTION (Matching Footer #0a1128 Background & Dotted View) ── */}
      <section className="relative overflow-hidden bg-[#0a1128] text-white pt-12 pb-16 sm:pb-20 border-b border-white/10">
        {/* Authentic Dotted Pattern matching Footer & Master Theme */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Verified Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs sm:text-sm font-bold mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>24/7 Verified Taxi Service in {data.name}</span>
            </div>

            {/* Clean H1 Heading (No highway or external route names) */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {data.h1}
            </h1>

            {/* Tagline */}
            <p className="mt-4 text-base sm:text-lg text-blue-100 leading-relaxed font-normal">
              {data.tagline}. Dedicated outstation cabs, one-way drops, and reliable airport transfers with verified local drivers.
            </p>

            {/* 100% Pincode Coverage Callout (Replaces restricted pincode list) */}
            <div className="mt-5 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-xs sm:text-sm text-blue-100 backdrop-blur-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>100% Doorstep Coverage:</strong> Serving all pincodes, sectors &amp; villages across {data.name} 24x7</span>
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
              <a
                href={`tel:${BUSINESS_CONFIG.phone.primaryRaw}`}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-[#0a1128] font-black text-xs sm:text-sm shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Phone className="w-4 h-4 text-blue-600" />
                <span>Call {BUSINESS_CONFIG.phone.display}</span>
              </a>

              <a
                href={whatsappBaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#00a859] hover:bg-emerald-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Book on WhatsApp</span>
              </a>

              <a
                href="#routes"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold text-xs sm:text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Browse Routes</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Pillars Bar */}
      <section className="bg-white border-b border-slate-200 py-6 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-50 text-brand-blue border border-blue-100">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-blue">Doorstep Pickup</p>
                <p className="text-xs text-slate-500 font-medium">All addresses across {data.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-brand-green border border-emerald-100">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-blue">Commercial Fleet</p>
                <p className="text-xs text-slate-500 font-medium">Yellow-plate certified vehicles</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-brand-green border border-emerald-100">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-blue">Transparent Rates</p>
                <p className="text-xs text-slate-500 font-medium">Sedan ₹12/km • Ertiga ₹15/km</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-50 text-brand-blue border border-blue-100">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-blue">24/7 Availability</p>
                <p className="text-xs text-slate-500 font-medium">Early morning &amp; late night rides</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* ── 1. INTERACTIVE LIVE FARE CALCULATOR (Open & Visible on Initial Load) ── */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 lg:p-8">
          <div className="mb-4">
            <span className="text-brand-green font-bold text-xs uppercase tracking-wider block mb-1">
              LIVE FARE ESTIMATOR &amp; INSTANT BOOKING
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-brand-blue">
              Calculate &amp; Book Outstation Cab from {data.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Choose your destination, verify transparent per-km fares, and confirm your cab with a 30% advance token.
            </p>
          </div>
          <MmtBookingWidget
            defaultOrigin={data.name}
            defaultDestination={data.popularRoutes?.[0]?.destination || 'Delhi'}
            routeMode={false}
          />
        </section>

        {/* ── 2. COMPREHENSIVE OUTSTATION CAB NETWORK FROM THIS LOCATION ── */}
        <section id="routes" className="scroll-mt-20">
          <div className="mb-6">
            <span className="text-brand-green font-bold text-xs uppercase tracking-wider block mb-1">
              CONNECTED INTER-CITY ROUTES
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-brand-blue">
              Outstation Cab Routes from {data.name} to All Connected States
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-3xl">
              Travel seamlessly from {data.name} to any destination across Uttar Pradesh, Uttarakhand, Delhi NCR, Rajasthan, Himachal Pradesh, Haryana, and Punjab. Covering all major cities, district tehsils, pilgrimage centers, and villages.
            </p>
          </div>

          <RoutesTabWidget
            initialOrigin={data.name}
            initialActiveState={data.state === 'Uttar Pradesh' ? 'Uttar Pradesh' : 'Uttarakhand'}
          />
        </section>

        {/* ── 3. SINGLE FULL-CONTAINER LOCATION PINPOINT MAP ── */}
        <section id="locality-map" className="scroll-mt-20">
          <div className="mb-4">
            <span className="text-brand-green font-bold text-xs uppercase tracking-wider block mb-1">
              SERVICE AREA PINPOINT
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-brand-blue">
              24/7 Doorstep Cab Coverage Area in {data.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Our GPS-tracked cabs and experienced chauffeurs are stationed throughout {data.name} for rapid 15–20 minute doorstep dispatches.
            </p>
          </div>

          <div className="w-full h-[450px] sm:h-[520px] rounded-3xl overflow-hidden border border-slate-200 shadow-md relative bg-slate-100">
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(data.name + (data.state ? ', ' + data.state : ''))}&t=&z=12&ie=UTF8&iwloc=&output=embed`}
              className="w-full h-full border-0 absolute inset-0"
              allowFullScreen
              loading="lazy"
              title={`Urgent Taxis 24x7 Cab Coverage Area Map - ${data.name}`}
            />
            <div className="absolute top-4 left-4 bg-[#0a1128]/90 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg border border-white/10 pointer-events-none flex items-center gap-2 backdrop-blur-xs">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{data.name} Pinpoint • Serving All Sectors &amp; Pincodes</span>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.name + ', ' + data.state)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 bg-white/95 hover:bg-white text-[#0a1128] font-bold text-xs px-3.5 py-2 rounded-xl shadow-md border border-slate-200 transition-all flex items-center gap-1.5"
            >
              <span>Open in Google Maps</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>

        {/* ── 4. LOCALITY OVERVIEW & CONNECTIVITY HIGHLIGHTS ── */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-brand-blue mb-6">
            About Our Taxi Service in {data.name}{data.district && data.district.toLowerCase() !== data.name.toLowerCase() ? `, ${data.district}` : data.state ? `, ${data.state}` : ''}
          </h2>
          <div className="space-y-4 text-slate-700 leading-relaxed text-sm sm:text-base">
            {data.overviewParagraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          {/* Landmarks & Connectivity Highlights */}
          <div className="mt-8 pt-8 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
              <h3 className="text-sm font-bold text-brand-blue uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Key Landmarks Served
              </h3>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600">
                {data.keyLandmarks.map((lm, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-brand-blue font-bold mt-0.5">•</span>
                    <span>{lm}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
              <h3 className="text-sm font-bold text-brand-blue uppercase tracking-wider mb-3 flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-600" />
                Transit Hubs &amp; Access
              </h3>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600">
                {data.metroAndTransit.map((mt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-brand-green font-bold mt-0.5">•</span>
                    <span>{mt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
              <h3 className="text-sm font-bold text-brand-blue uppercase tracking-wider mb-3 flex items-center gap-2">
                <Car className="w-4 h-4 text-brand-blue" />
                Expressways &amp; Highways
              </h3>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600">
                {data.expressways.map((exp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-brand-green font-bold mt-0.5">•</span>
                    <span>{exp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── 5. AVAILABLE FLEET CATEGORIES ── */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div>
              <span className="text-brand-green font-bold text-xs uppercase tracking-wider block mb-1">
                OUR VERIFIED VEHICLES
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-brand-blue">
                Available Cabs for Hire in {data.name}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                100% commercial yellow-plate vehicles with active air conditioning and experienced highway drivers.
              </p>
            </div>
            <Link
              href="/fleet"
              className="mt-4 sm:mt-0 text-sm font-bold text-brand-blue hover:text-brand-green transition-colors inline-flex items-center gap-1.5"
            >
              <span>View Full Fleet</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FLEET_CATEGORIES.map((vehicle) => (
              <div
                key={vehicle.name}
                className="rounded-2xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full mb-4 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-2">
                    <Image
                      src={vehicle.image}
                      alt={`${vehicle.name} Cab in ${data.name}`}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-bold text-brand-blue">{vehicle.name}</h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {vehicle.rate}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{vehicle.models}</p>
                  <p className="text-xs text-slate-600 mb-4">{vehicle.idealFor}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {vehicle.seats} Passengers
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      {vehicle.bags} Bags
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
                  <a
                    href={generateWhatsAppLink({
                      tripType: 'Outstation Cab Inquiry',
                      pickup: data.name,
                      vehicleCategory: vehicle.name,
                      customMessage: `Hello Urgent Taxis! I want to book a ${vehicle.name} from ${data.name}.`,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Book</span>
                  </a>
                  <Link
                    href={vehicle.href}
                    className="inline-flex items-center justify-center py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
                  >
                    <span>Details</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. FREQUENTLY ASKED QUESTIONS ── */}
        <PageFAQSection
          faqs={combinedCityFaqs}
          title={`Frequently Asked Questions — ${data.name} Taxi Service`}
          subtitle={`Everything you need to know about booking outstation cabs, airport drops, and rates in ${data.name}.`}
          includeSchema={true}
        />

        {/* ── 7. OTHER SERVICE HUBS IN THE REGION ── */}
        <section className="bg-slate-100/70 rounded-3xl p-6 sm:p-8 border border-slate-200/80">
          <div className="mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-brand-blue mb-1">
              Explore Taxi Services in Other Cities &amp; Regions
            </h2>
            <p className="text-xs text-slate-500">
              Need cab service in nearby towns or departure hubs? Explore our verified network:
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {otherLocalities.map((loc) => (
              <Link
                key={loc.slug}
                href={`/taxi-service/${loc.slug}`}
                className="p-3 bg-white rounded-xl border border-slate-200/80 hover:border-brand-blue hover:shadow-xs transition-all flex items-center justify-between group"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800 group-hover:text-brand-blue transition-colors">
                    {loc.name}
                  </p>
                  <p className="text-[11px] text-slate-500">{loc.district}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-blue group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </section>

        {/* ── 8. BOTTOM BOOKING CTA BANNER (Matching "Book your ride in 2 clicks" Footer CTA) ── */}
        <section className="relative overflow-hidden bg-[#0a1128] rounded-[2rem] text-center px-4 sm:px-8 lg:px-12 py-10 sm:py-14 shadow-2xl border border-white/10 text-white">
          {/* Authentic Dotted Pattern matching Footer & Master Theme */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant Cab Dispatch in {data.name}</span>
            </span>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              Need an Urgent Cab in {data.name}?
            </h2>

            <p className="text-xs sm:text-sm lg:text-base text-blue-100 max-w-2xl mx-auto font-medium leading-relaxed">
              Book your ride in just 2 clicks • 24x7 verified doorstep pickup across all pincodes • Instant confirmation via WhatsApp
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <a
                href={`tel:${BUSINESS_CONFIG.phone.primaryRaw}`}
                className="bg-white hover:bg-slate-50 text-[#0a1128] font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4 text-[#0a1128]" />
                <span>Call Now ({BUSINESS_CONFIG.phone.display})</span>
              </a>

              <a
                href={whatsappBaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#00a859] hover:bg-emerald-600 text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Book on WhatsApp</span>
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
