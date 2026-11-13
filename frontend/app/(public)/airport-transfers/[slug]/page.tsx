import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AIRPORT_ROUTES_DATA, AirportRouteData } from '@/lib/data/airport-routes-data';
import { BUSINESS_CONFIG } from '@/lib/config';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';
import PageFAQSection from '@/components/public/PageFAQSection';
import PublicFareWidget from '@/components/public/PublicFareWidget';
import { getAirportSpecificFAQs, getCommonBookingFAQs } from '@/lib/faqs/faq-generator';
import { Phone, MessageSquare, Plane, Shield, Clock, CheckCircle2, ArrowRight, MapPin, Navigation } from 'lucide-react';

export const revalidate = 3600; // Static Edge Caching with 1-Hour ISR (TTFB < 50ms)

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

export interface AirportMessageOptions {
  vehicleName: string;
  vehicleCategory?: string;
  origin: string;
  destination: string;
  fare?: number;
  capacity?: string;
  flightDetails?: string;
  travelDate?: string;
  travelTime?: string;
}

export function buildAirportWhatsAppMessage(opts: AirportMessageOptions): string {
  const lines: string[] = [];
  lines.push('Hello Urgent Taxis! 👋');
  lines.push('');
  lines.push(`I would like to book a ${opts.vehicleName} for airport transfer from ${opts.origin} to ${opts.destination}.`);
  if (opts.fare) {
    lines.push(`• Fixed Fare: ₹${opts.fare.toLocaleString('en-IN')} (toll & parking extra)`);
  }
  if (opts.capacity) {
    lines.push(`• Capacity: ${opts.capacity}`);
  }

  const hasFlight = Boolean(opts.flightDetails && opts.flightDetails.trim());
  const hasDateTime = Boolean((opts.travelDate && opts.travelDate.trim()) || (opts.travelTime && opts.travelTime.trim()));

  if (hasFlight) {
    lines.push(`• Flight / Terminal: ${opts.flightDetails!.trim()}`);
  }
  if (hasDateTime) {
    const dtParts = [opts.travelDate?.trim(), opts.travelTime?.trim()].filter(Boolean);
    lines.push(`• Travel Date & Time: ${dtParts.join(', ')}`);
  }

  lines.push('');

  if (!hasFlight && !hasDateTime) {
    lines.push('Please let me know cab availability. I will provide my flight number, terminal (T1/T2/T3), and pickup time.');
  } else if (!hasFlight) {
    lines.push('Please let me know cab availability. I will provide my flight number and terminal (T1/T2/T3).');
  } else if (!hasDateTime) {
    lines.push('Please let me know cab availability. I will provide my pickup date and time.');
  } else {
    lines.push('Please confirm cab availability and driver assignment.');
  }

  return lines.join('\n');
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


  // Generate Airport-specific FAQs + Common Booking FAQs (Requirement 7)
  const airportSpecificFaqs = getAirportSpecificFAQs(data.destination, data.origin);
  const commonFaqs = getCommonBookingFAQs().filter(f => f.question.includes('30% advance') || f.question.includes('payment options') || f.question.includes('contact'));
  const existingFaqs = data.faqs || [];
  const combinedAirportFaqs = [...airportSpecificFaqs, ...existingFaqs.filter(ef => !airportSpecificFaqs.some(af => af.question.toLowerCase() === ef.question.toLowerCase())), ...commonFaqs];

  const whatsappBaseUrl = generateWhatsAppLink({
    tripType: 'Airport Transfer',
    pickup: data.origin,
    drop: data.destination,
    pageUrl: `${BUSINESS_CONFIG.canonicalDomain}/airport-transfers/${data.slug}`,
    customMessage: [
      `Hello Urgent Taxis! 👋`,
      '',
      `I would like to book an Airport Transfer cab from ${data.origin} to ${data.destination}.`,
      '',
      'Please let me know cab availability. I will provide my flight number, terminal (T1/T2/T3), and pickup time.',
    ].join('\n'),
  });

  const sedanWhatsAppUrl = generateWhatsAppLink({
    tripType: 'Airport Transfer',
    pickup: data.origin,
    drop: data.destination,
    vehicleCategory: 'AC Sedan (Dzire / Etios)',
    totalFare: data.sedanFare,
    pageUrl: `${BUSINESS_CONFIG.canonicalDomain}/airport-transfers/${data.slug}`,
    customMessage: buildAirportWhatsAppMessage({
      vehicleName: 'AC Sedan (Dzire / Etios)',
      origin: data.origin,
      destination: data.destination,
      fare: data.sedanFare,
      capacity: 'Up to 4 passengers',
    }),
  });

  const ertigaWhatsAppUrl = generateWhatsAppLink({
    tripType: 'Airport Transfer',
    pickup: data.origin,
    drop: data.destination,
    vehicleCategory: 'Maruti Ertiga SUV',
    totalFare: data.ertigaFare,
    pageUrl: `${BUSINESS_CONFIG.canonicalDomain}/airport-transfers/${data.slug}`,
    customMessage: buildAirportWhatsAppMessage({
      vehicleName: 'Maruti Ertiga',
      origin: data.origin,
      destination: data.destination,
      fare: data.ertigaFare,
      capacity: 'Up to 6 passengers',
    }),
  });

  const crystaWhatsAppUrl = generateWhatsAppLink({
    tripType: 'Airport Transfer',
    pickup: data.origin,
    drop: data.destination,
    vehicleCategory: 'Toyota Innova Crysta',
    totalFare: data.crystaFare,
    pageUrl: `${BUSINESS_CONFIG.canonicalDomain}/airport-transfers/${data.slug}`,
    customMessage: buildAirportWhatsAppMessage({
      vehicleName: 'Toyota Innova Crysta',
      origin: data.origin,
      destination: data.destination,
      fare: data.crystaFare,
      capacity: 'Up to 7 passengers',
    }),
  });

  const otherAirportRoutes = Object.values(AIRPORT_ROUTES_DATA).filter((r) => r.slug !== data.slug);

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(taxiServiceSchema) }}
      />

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-slate-200">
        <PublicBreadcrumbs items={breadcrumbs} />
      </div>

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-brand-blue text-white pt-10 pb-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs sm:text-sm font-medium mb-4">
              <Plane className="w-4 h-4 text-blue-400" />
              Delhi IGI Airport Transfer (T1, T2, T3)
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {data.h1}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-blue-100">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Distance: <strong>{data.distanceKm} km</strong></span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
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
      <section className="bg-white border-b border-slate-200 py-6 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-brand-blue">100% On-Time Guarantee</p>
                <p className="text-xs text-slate-500 font-medium">Arrives 10 mins before pickup</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Plane className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-brand-blue">Free Flight Tracking</p>
                <p className="text-xs text-slate-500 font-medium">Zero charges for flight delays</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-brand-green flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-brand-blue">Commercial Yellow Plate</p>
                <p className="text-xs text-slate-500 font-medium">Verified highway chauffeurs</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-brand-blue">No Cancellation Shock</p>
                <p className="text-xs text-slate-500 font-medium">Guaranteed vehicle dispatch</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Interactive Live Airport Fare Calculator */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 lg:p-8">
          <div className="mb-4">
            <span className="text-brand-green font-bold text-xs uppercase tracking-wider block mb-1">
              LIVE AIRPORT FARE CALCULATOR
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-brand-blue">
              Calculate & Book Airport Taxi ({data.origin} ⇄ {data.destination})
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Instant fixed fare quotes with 30% advance token confirmation and zero flight delay waiting fees.
            </p>
          </div>
          <PublicFareWidget
            initialServiceType="airport_transfer"
            defaultOrigin={data.origin}
            defaultDestination={data.destination}
            defaultDistanceKm={data.distanceKm}
          />
        </section>
        {/* Transparent Rates Grid */}
        <section>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-blue">
              Fixed Airport Taxi Fares — {data.origin} to {data.destination}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Your fare is shared before booking confirmation. The quoted amount may vary with demand, vehicle availability and trip requirements. Toll and parking charged at actuals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sedan Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-emerald-500/50 transition-all flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                    Most Economical
                  </span>
                  <span className="text-xs text-slate-600">4 Seater AC</span>
                </div>
                <h3 className="text-xl font-bold text-brand-blue">Sedan</h3>
                <p className="text-xs text-slate-600 mt-1">Maruti Dzire, Toyota Etios, Honda Amaze</p>
                <div className="mt-6 mb-6">
                  <span className="text-3xl font-black text-brand-blue">₹{data.sedanFare.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-slate-600 ml-2">fixed one-way</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700">
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
                href={sedanWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm text-center transition-colors"
              >
                Book Sedan
              </a>
            </div>

            {/* Ertiga SUV Card */}
            <div className="p-6 rounded-2xl bg-white border-2 border-brand-blue transition-all flex flex-col justify-between shadow-md relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                Family & Luggage Choice
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full">
                    6 Seater MPV
                  </span>
                  <span className="text-xs text-slate-600">Spacious SUV</span>
                </div>
                <h3 className="text-xl font-bold text-brand-blue">Maruti Ertiga</h3>
                <p className="text-xs text-slate-600 mt-1">Ertiga, Triber, Carens</p>
                <div className="mt-6 mb-6">
                  <span className="text-3xl font-black text-brand-blue">₹{data.ertigaFare.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-slate-600 ml-2">fixed one-way</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700">
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
                href={ertigaWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm text-center transition-colors"
              >
                Book Ertiga
              </a>
            </div>

            {/* Innova Crysta Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-brand-blue/50 transition-all flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                    Premium Travel
                  </span>
                  <span className="text-xs text-slate-600">7 Seater Luxury</span>
                </div>
                <h3 className="text-xl font-bold text-brand-blue">Innova Crysta</h3>
                <p className="text-xs text-slate-600 mt-1">Toyota Innova Crysta / Hycross</p>
                <div className="mt-6 mb-6">
                  <span className="text-3xl font-black text-brand-blue">₹{data.crystaFare.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-slate-600 ml-2">fixed one-way</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-green" />
                    <span>Up to 7 Passengers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-green" />
                    <span>4 to 5 Large Luggage Bags</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-green" />
                    <span>Ultimate Highway Suspension</span>
                  </li>
                </ul>
              </div>
              <a
                href={crystaWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 w-full py-3 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white font-bold text-sm text-center transition-colors shadow-md"
              >
                Book Innova Crysta
              </a>
            </div>
          </div>
        </section>

        {/* Detailed Overview */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-brand-blue mb-6">
            About This Airport Transfer Route
          </h2>
          <div className="space-y-4 text-slate-700 leading-relaxed text-sm sm:text-base">
            {data.overview.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-start gap-3">
            <Navigation className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Recommended Highway Corridor
              </p>
              <p className="text-sm font-bold text-slate-800 mt-1">
                {data.expresswayCorridor}
              </p>
            </div>
          </div>
        </section>

        {/* Airport Terminals Guide */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-brand-blue mb-6">
            Delhi IGI Airport Terminals Served
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.terminals.map((term, i) => (
              <div key={i} className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                <h3 className="text-base font-bold text-brand-blue mb-2">{term.terminal}</h3>
                <p className="text-xs text-slate-700 leading-relaxed mb-4">{term.details}</p>
                <div className="pt-3 border-t border-slate-200 text-[11px] text-blue-400 font-medium">
                  {term.airlines}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Step-by-Step Pickup Process */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-brand-blue mb-6">
            How Your Airport Ride Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.pickupDropProcess.map((step, i) => (
              <div key={i} className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-sm mb-3">
                  {i + 1}
                </div>
                <h3 className="text-sm font-bold text-brand-blue mb-2">{step.title}</h3>
                <p className="text-xs text-slate-700 leading-relaxed">{step.step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs Section (Requirement 7) */}
        <PageFAQSection
          faqs={combinedAirportFaqs}
          title={`Frequently Asked Questions — ${data.title}`}
          subtitle={`Key details on pickup timings, flight delays, fares, and terminal drop arrangements.`}
          includeSchema={true}
        />

        {/* Other Airport Routes */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-brand-blue mb-4">
            Other Airport Transfer Routes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {otherAirportRoutes.map((route) => (
              <Link
                key={route.slug}
                href={`/airport-transfers/${route.slug}`}
                className="p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-brand-blue/40 transition-all flex items-center justify-between group shadow-xs"
              >
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-brand-blue transition-colors">
                    {route.origin} → {route.destination}
                  </p>
                  <p className="text-[11px] text-slate-600">From ₹{route.sedanFare} • {route.distanceKm} km</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
