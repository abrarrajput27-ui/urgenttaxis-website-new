import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AIRPORT_ROUTES_DATA, AirportRouteData } from '@/lib/data/airport-routes-data';
import { BUSINESS_CONFIG } from '@/lib/config';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';
import { Phone, MessageSquare, Plane, Shield, Clock, CheckCircle2, ArrowRight, Car, MapPin, Navigation } from 'lucide-react';

interface AirportRoutePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(AIRPORT_ROUTES_DATA).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: AirportRoutePageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = AIRPORT_ROUTES_DATA[slug];
  if (!data) return {};

  const canonicalUrl = `${BUSINESS_CONFIG.canonicalDomain}/airport-transfers/${data.slug}`;

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
          alt: `${data.title} - Urgent Taxis`,
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

export default async function AirportRoutePage({ params }: AirportRoutePageProps) {
  const { slug } = await params;
  const data: AirportRouteData | undefined = AIRPORT_ROUTES_DATA[slug];

  if (!data) {
    notFound();
  }

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Airport Transfers', href: '/airport-transfers' },
    { label: `${data.origin} to ${data.destination}` },
  ];

  // Structured Data (JSON-LD)
  const taxiServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'TaxiService',
    name: data.title,
    description: data.metaDescription,
    provider: {
      '@type': 'LocalBusiness',
      name: BUSINESS_CONFIG.brandName,
      telephone: BUSINESS_CONFIG.phone.primary,
      url: BUSINESS_CONFIG.canonicalDomain,
      logo: `${BUSINESS_CONFIG.canonicalDomain}${BUSINESS_CONFIG.logoUrl}`,
      priceRange: '₹₹',
      address: {
        '@type': 'PostalAddress',
        streetAddress: `${BUSINESS_CONFIG.headOffice.shopNumber}, ${BUSINESS_CONFIG.headOffice.building}`,
        addressLocality: BUSINESS_CONFIG.headOffice.locality,
        addressRegion: BUSINESS_CONFIG.headOffice.city,
        postalCode: BUSINESS_CONFIG.headOffice.postalCode,
        addressCountry: 'IN',
      },
    },
    serviceType: 'Airport Taxi Transfer',
    areaServed: [
      {
        '@type': 'AdministrativeArea',
        name: data.origin,
      },
      {
        '@type': 'AdministrativeArea',
        name: data.destination,
      },
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

  const whatsappBaseUrl = `https://wa.me/${BUSINESS_CONFIG.phone.whatsappRaw}?text=${encodeURIComponent(
    `Hello Urgent Taxis, I want to book an airport taxi for route: ${data.origin} to ${data.destination}. Please confirm driver and fare.`
  )}`;

  const otherAirportRoutes = Object.values(AIRPORT_ROUTES_DATA).filter((r) => r.slug !== data.slug);

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(taxiServiceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Breadcrumbs */}
      <div className="bg-slate-900 border-b border-slate-800">
        <PublicBreadcrumbs items={breadcrumbs} />
      </div>

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 pt-10 pb-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs sm:text-sm font-medium mb-4">
              <Plane className="w-4 h-4 text-blue-400" />
              Delhi IGI Airport Transfer (T1, T2, T3)
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {data.h1}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-300">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Distance: <strong>{data.distanceKm} km</strong></span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Est. Time: <strong>{data.durationText}</strong> (Peak: {data.peakDurationText})</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href={`tel:${BUSINESS_CONFIG.phone.primaryRaw}`}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
              >
                <Phone className="w-5 h-5" />
                <span>Call {BUSINESS_CONFIG.phone.display}</span>
              </a>

              <a
                href={whatsappBaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02]"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Book on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Highlights */}
      <section className="bg-slate-900/60 border-b border-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-white">100% On-Time Guarantee</p>
                <p className="text-xs text-slate-400">Arrives 10 mins before pickup</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Plane className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-white">Free Flight Tracking</p>
                <p className="text-xs text-slate-400">Zero charges for flight delays</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-white">Commercial Yellow Plate</p>
                <p className="text-xs text-slate-400">Verified highway chauffeurs</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-white">No Cancellation Shock</p>
                <p className="text-xs text-slate-400">Guaranteed vehicle dispatch</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Transparent Rates Grid */}
        <section>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Fixed Airport Taxi Fares — {data.origin} to {data.destination}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Clear, upfront pricing with zero surge charges. Toll and parking charged at actuals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sedan Card */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                    Most Economical
                  </span>
                  <span className="text-xs text-slate-400">4 Seater AC</span>
                </div>
                <h3 className="text-xl font-bold text-white">Sedan</h3>
                <p className="text-xs text-slate-400 mt-1">Maruti Dzire, Toyota Etios, Honda Amaze</p>
                <div className="mt-6 mb-6">
                  <span className="text-3xl font-extrabold text-white">₹{data.sedanFare.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-slate-400 ml-2">fixed one-way</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Up to 4 Passengers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>2 Large + 1 Small Luggage Bags</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Air Conditioned & Clean Cab</span>
                  </li>
                </ul>
              </div>
              <a
                href={`https://wa.me/${BUSINESS_CONFIG.phone.whatsappRaw}?text=${encodeURIComponent(
                  `Hello Urgent Taxis, I want to book an AC Sedan for ${data.origin} to ${data.destination} (₹${data.sedanFare}). Please confirm.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm text-center transition-colors"
              >
                Book Sedan
              </a>
            </div>

            {/* Ertiga SUV Card */}
            <div className="p-6 rounded-2xl bg-slate-900 border-2 border-blue-500/60 transition-all flex flex-col justify-between shadow-xl relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                Family & Luggage Choice
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full">
                    6 Seater MPV
                  </span>
                  <span className="text-xs text-slate-400">Spacious SUV</span>
                </div>
                <h3 className="text-xl font-bold text-white">Maruti Ertiga</h3>
                <p className="text-xs text-slate-400 mt-1">Ertiga, Triber, Carens</p>
                <div className="mt-6 mb-6">
                  <span className="text-3xl font-extrabold text-white">₹{data.ertigaFare.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-slate-400 ml-2">fixed one-way</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    <span>Up to 6 Passengers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    <span>3 to 4 Large Luggage Bags</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    <span>Roof Carrier Available on Request</span>
                  </li>
                </ul>
              </div>
              <a
                href={`https://wa.me/${BUSINESS_CONFIG.phone.whatsappRaw}?text=${encodeURIComponent(
                  `Hello Urgent Taxis, I want to book an Ertiga SUV for ${data.origin} to ${data.destination} (₹${data.ertigaFare}). Please confirm.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm text-center transition-colors"
              >
                Book Ertiga
              </a>
            </div>

            {/* Innova Crysta Card */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full">
                    Premium Travel
                  </span>
                  <span className="text-xs text-slate-400">7 Seater Luxury</span>
                </div>
                <h3 className="text-xl font-bold text-white">Innova Crysta</h3>
                <p className="text-xs text-slate-400 mt-1">Toyota Innova Crysta / Hycross</p>
                <div className="mt-6 mb-6">
                  <span className="text-3xl font-extrabold text-white">₹{data.crystaFare.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-slate-400 ml-2">fixed one-way</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                    <span>Up to 7 Passengers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                    <span>4 to 5 Large Luggage Bags</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                    <span>Ultimate Highway Suspension</span>
                  </li>
                </ul>
              </div>
              <a
                href={`https://wa.me/${BUSINESS_CONFIG.phone.whatsappRaw}?text=${encodeURIComponent(
                  `Hello Urgent Taxis, I want to book an Innova Crysta for ${data.origin} to ${data.destination} (₹${data.crystaFare}). Please confirm.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm text-center transition-colors"
              >
                Book Innova Crysta
              </a>
            </div>
          </div>
        </section>

        {/* Detailed Overview */}
        <section className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
            About This Airport Transfer Route
          </h2>
          <div className="space-y-4 text-slate-300 leading-relaxed text-sm sm:text-base">
            {data.overview.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
            <Navigation className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Recommended Highway Corridor
              </p>
              <p className="text-sm font-medium text-white mt-1">
                {data.expresswayCorridor}
              </p>
            </div>
          </div>
        </section>

        {/* Airport Terminals Guide */}
        <section className="bg-slate-900/30 rounded-2xl border border-slate-800 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
            Delhi IGI Airport Terminals Served
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.terminals.map((term, i) => (
              <div key={i} className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
                <h3 className="text-base font-bold text-white mb-2">{term.terminal}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">{term.details}</p>
                <div className="pt-3 border-t border-slate-800 text-[11px] text-blue-400 font-medium">
                  {term.airlines}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Step-by-Step Pickup Process */}
        <section className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
            How Your Airport Ride Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.pickupDropProcess.map((step, i) => (
              <div key={i} className="p-5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-sm mb-3">
                  {i + 1}
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{step.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{step.step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
            Frequently Asked Questions — Airport Transfers
          </h2>
          <div className="space-y-4">
            {data.faqs.map((faq, i) => (
              <details
                key={i}
                className="group rounded-xl border border-slate-800 bg-slate-900/70 p-4 transition-all open:border-slate-700"
              >
                <summary className="flex cursor-pointer items-center justify-between font-semibold text-white">
                  <span className="text-sm sm:text-base">{faq.question}</span>
                  <span className="ml-4 flex-shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180">
                    ▼
                  </span>
                </summary>
                <div className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800 pt-3">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Other Airport Routes */}
        <section className="bg-slate-900/30 rounded-2xl border border-slate-800 p-6 sm:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4">
            Other Airport Transfer Routes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {otherAirportRoutes.map((route) => (
              <Link
                key={route.slug}
                href={`/airport-transfers/${route.slug}`}
                className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 transition-all flex items-center justify-between group"
              >
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                    {route.origin} → {route.destination}
                  </p>
                  <p className="text-[11px] text-slate-400">From ₹{route.sedanFare} • {route.distanceKm} km</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
