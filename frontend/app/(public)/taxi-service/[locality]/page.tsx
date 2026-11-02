import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LOCALITIES_DATA, LocalityData } from '@/lib/data/localities-data';
import { BUSINESS_CONFIG } from '@/lib/config';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';
import PageFAQSection from '@/components/public/PageFAQSection';
import PublicFareWidget from '@/components/public/PublicFareWidget';
import { getCitySpecificFAQs, getCommonBookingFAQs } from '@/lib/faqs/faq-generator';
import { Phone, MessageSquare, MapPin, CheckCircle2, Shield, Clock, Compass, Plane, ArrowRight, Car } from 'lucide-react';

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
      card: 'summary',
      title: data.metaTitle,
      description: data.metaDescription,
      images: [`${BUSINESS_CONFIG.canonicalDomain}/logo.jpg`],
    },
  };
}

export default async function LocalityPage({ params }: LocalityPageProps) {
  const { locality } = await params;
  const data: LocalityData | undefined = LOCALITIES_DATA[locality];

  if (!data) {
    notFound();
  }

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Taxi Service', href: '/taxi-service' },
    { label: data.name },
  ];

  // Structured Data (JSON-LD)
  const taxiServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'TaxiService',
    name: `Urgent Taxis - ${data.name} Taxi Service`,
    description: data.metaDescription,
    provider: {
      '@type': 'LocalBusiness',
      name: BUSINESS_CONFIG.brandName,
      legalName: BUSINESS_CONFIG.legalName,
      telephone: BUSINESS_CONFIG.phone.primary,
      url: BUSINESS_CONFIG.canonicalDomain,
      logo: `${BUSINESS_CONFIG.canonicalDomain}${BUSINESS_CONFIG.logoUrl}`,
      priceRange: '₹₹',
      address: {
        '@type': 'PostalAddress',
        streetAddress: `${BUSINESS_CONFIG.headOffice.shopNumber}, ${BUSINESS_CONFIG.headOffice.building}, ${BUSINESS_CONFIG.headOffice.street}`,
        addressLocality: BUSINESS_CONFIG.headOffice.locality,
        addressRegion: BUSINESS_CONFIG.headOffice.city,
        postalCode: BUSINESS_CONFIG.headOffice.postalCode,
        addressCountry: 'IN',
      },
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: `${data.name}, ${data.district}, ${data.state}`,
    },
    serviceType: [
      'Outstation Taxi Service',
      'One Way Cab',
      'Round Trip Taxi',
      'Airport Taxi Transfers',
      'Local Hourly Rental',
    ],
    termsOfService: `${BUSINESS_CONFIG.canonicalDomain}/terms`,
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  // Generate City-specific FAQs + Common Booking FAQs (Requirement 7)
  const citySpecificFaqs = getCitySpecificFAQs(data.name, data.keyLandmarks);
  const commonFaqs = getCommonBookingFAQs().filter(f => f.question.includes('30% advance') || f.question.includes('how is the fare calculated') || f.question.includes('contact'));
  const existingFaqs = data.faqs || [];
  const combinedCityFaqs = [...citySpecificFaqs, ...existingFaqs.filter(ef => !citySpecificFaqs.some(cf => cf.question.toLowerCase() === ef.question.toLowerCase())), ...commonFaqs];

  const whatsappBaseUrl = `https://wa.me/${BUSINESS_CONFIG.phone.whatsappRaw}?text=${encodeURIComponent(
    `Hello Urgent Taxis, I need a taxi pickup in ${data.name}. Please share available cabs and fare details.`
  )}`;

  // Find other localities for internal linking
  const otherLocalities = Object.values(LOCALITIES_DATA)
    .filter((loc) => loc.slug !== data.slug)
    .slice(0, 12);

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen font-sans">
      {/* Structured Data Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(taxiServiceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-slate-200">
        <PublicBreadcrumbs items={breadcrumbs} />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-brand-blue text-white pt-10 pb-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Verified Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-medium mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              24/7 Verified Taxi Service in {data.name}
            </div>

            {/* H1 Heading */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {data.h1}
            </h1>

            {/* Tagline */}
            <p className="mt-4 text-base sm:text-lg text-blue-100 leading-relaxed">
              {data.tagline}. Dedicated outstation cabs, one-way drops, and reliable IGI Airport transfers with verified local drivers.
            </p>

            {/* Pincodes Served */}
            {data.pincodes.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Pincodes Served:</span>
                {data.pincodes.map((pin) => (
                  <span key={pin} className="px-2 py-0.5 rounded bg-white/10 border border-white/20 text-blue-100 font-mono">
                    {pin}
                  </span>
                ))}
              </div>
            )}

            {/* Quick Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href={`tel:${BUSINESS_CONFIG.phone.primaryRaw}`}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Phone className="w-5 h-5" />
                <span>Call {BUSINESS_CONFIG.phone.display}</span>
              </a>

              <a
                href={whatsappBaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Book on WhatsApp</span>
              </a>

              <a
                href="#fares"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium transition-all"
              >
                <span>View Fares</span>
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
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-blue">Doorstep Pickup</p>
                <p className="text-xs text-slate-500 font-medium">Any sector or address in {data.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-blue">Commercial Cabs</p>
                <p className="text-xs text-slate-500 font-medium">Yellow-plate certified vehicles</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-blue">Zero Hidden Charges</p>
                <p className="text-xs text-slate-500 font-medium">Transparent per-km rate matrix</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-blue">24/7 Availability</p>
                <p className="text-xs text-slate-500 font-medium">Early morning & late night rides</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Comprehensive Locality Overview */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-brand-blue mb-6">
            About Our Taxi Service in {data.name}, {data.district}
          </h2>
          <div className="space-y-4 text-slate-700 leading-relaxed text-sm sm:text-base">
            {data.overviewParagraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          {/* Landmarks & Connectivity Highlights */}
          <div className="mt-8 pt-8 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Key Landmarks Served
              </h3>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600">
                {data.keyLandmarks.map((lm, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>{lm}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-600" />
                Metro & Transit Access
              </h3>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600">
                {data.metroAndTransit.map((mt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">•</span>
                    <span>{mt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Car className="w-4 h-4 text-amber-600" />
                Expressways & Highways
              </h3>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600">
                {data.expressways.map((exp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span>{exp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Interactive Live Locality Fare Calculator */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 lg:p-8 mb-8">
          <div className="mb-4">
            <span className="text-brand-green font-bold text-xs uppercase tracking-wider block mb-1">
              LIVE FARE CALCULATOR
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-brand-blue">
              Calculate & Book Outstation Cab from {data.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Choose your destination city, check live transparent per-km rates, and confirm with official 30% advance token.
            </p>
          </div>
          <PublicFareWidget
            initialServiceType="one_way"
            defaultOrigin={data.name}
          />
        </section>

        {/* Popular Outstation Fares Table */}
        <section id="fares" className="scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-3xl font-bold text-brand-blue">
                Popular Outstation & Airport Taxi Fares from {data.name}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Estimated one-way fares with verified commercial vehicles. Toll and state tax calculated at actuals.
              </p>
            </div>
            <span className="mt-2 sm:mt-0 text-xs text-slate-600">
              * Fares may vary depending on exact sector pickup.
            </span>
          </div>

          <div className="w-full max-w-full min-w-0 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-800/80 text-xs uppercase font-semibold text-slate-200 border-b border-slate-700">
                <tr>
                  <th scope="col" className="px-4 py-3.5 sm:px-6">Destination</th>
                  <th scope="col" className="px-4 py-3.5 sm:px-6">Distance & Time</th>
                  <th scope="col" className="px-4 py-3.5 sm:px-6">Sedan (Dzire/Etios)</th>
                  <th scope="col" className="px-4 py-3.5 sm:px-6">Ertiga (6-Seater)</th>
                  <th scope="col" className="px-4 py-3.5 sm:px-6">Innova Crysta</th>
                  <th scope="col" className="px-4 py-3.5 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.popularRoutes.map((route, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 sm:px-6 font-semibold text-slate-900">
                      {route.destination}
                    </td>
                    <td className="px-4 py-4 sm:px-6 text-slate-600 text-xs sm:text-sm">
                      <div>{route.distanceKm} km</div>
                      <div className="text-slate-600 font-mono">{route.durationText}</div>
                    </td>
                    <td className="px-4 py-4 sm:px-6 font-bold text-emerald-400">
                      ₹{route.sedanFare.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-4 sm:px-6 font-bold text-blue-400">
                      ₹{route.ertigaFare.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-4 sm:px-6 font-bold text-purple-400">
                      ₹{route.crystaFare.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-4 sm:px-6 text-right">
                      <a
                        href={`https://wa.me/${BUSINESS_CONFIG.phone.whatsappRaw}?text=${encodeURIComponent(
                          `Hello Urgent Taxis, I want to book a taxi from ${data.name} to ${route.destination}. Please confirm vehicle availability.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-colors"
                      >
                        <span>Book</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Airport Transfer Guide */}
        <section className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-900/40 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
              <Plane className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-brand-blue">
                Delhi IGI Airport Transfer Guide from {data.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Punctual airport pickups and drop-offs to Terminal 1, Terminal 2, and Terminal 3.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold uppercase text-slate-600 block mb-1">
                  Distance & Travel Duration
                </span>
                <p className="text-lg font-bold text-brand-blue">
                  Approx. {data.airportTransferGuide.distanceToT3Km} km • ~{data.airportTransferGuide.typicalDurationMins} minutes
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold uppercase text-slate-600 block mb-1">
                  Recommended Transit Corridor
                </span>
                <p className="text-sm text-slate-700">
                  {data.airportTransferGuide.recommendedRoute}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-xs font-semibold uppercase text-amber-400 block mb-1">
                  Departure Advice for Passengers
                </span>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {data.airportTransferGuide.pickupAdvice}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-600 block">Fixed Airport Fare from</span>
                  <span className="text-lg font-bold text-emerald-400">₹1,199 (Sedan)</span>
                </div>
                <a
                  href={`tel:${BUSINESS_CONFIG.phone.primaryRaw}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-slate-900 font-semibold text-xs sm:text-sm transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call for Airport Cab</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs Section (Requirement 7) */}
        <PageFAQSection
          faqs={combinedCityFaqs}
          title={`Frequently Asked Questions — ${data.name} Taxi Service`}
          subtitle={`Everything you need to know about booking outstation cabs, airport drops, and rates in ${data.name}.`}
          includeSchema={true}
        />

        {/* Nearby Localities & Regional Coverage */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-brand-blue mb-2">
            Taxi Services in Nearby Localities & NCR Hubs
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mb-6">
            We provide doorstep pickup and transparent outstation cab booking across all areas in Ghaziabad and Delhi NCR.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {otherLocalities.map((loc) => (
              <Link
                key={loc.slug}
                href={`/taxi-service/${loc.slug}`}
                className="group p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-500/40 transition-all flex items-center justify-between"
              >
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-brand-blue transition-colors">
                    {loc.name}
                  </p>
                  <p className="text-[11px] text-slate-500">{loc.district}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </section>

        {/* Bottom Booking CTA Banner */}
        <section className="rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 p-8 text-center border border-blue-800/50 shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-black text-brand-blue">
            Need an Urgent Cab in {data.name}?
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-700 max-w-2xl mx-auto">
            Book your verified outstation or airport taxi in under 60 seconds. Our chauffeurs arrive at your exact address on time.
          </p>
          <div className="mt-6 flex flex-wrap justify-center items-center gap-4">
            <a
              href={`tel:${BUSINESS_CONFIG.phone.primaryRaw}`}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold shadow-lg transition-transform hover:scale-105"
            >
              <Phone className="w-5 h-5 text-blue-600" />
              <span>Call {BUSINESS_CONFIG.phone.display}</span>
            </a>
            <a
              href={whatsappBaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30 transition-transform hover:scale-105"
            >
              <MessageSquare className="w-5 h-5" />
              <span>WhatsApp Booking</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
