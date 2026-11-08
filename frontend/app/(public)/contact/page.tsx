import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import { BUSINESS_CONFIG } from '@/lib/config';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';
import ContactInquiryForm from '@/components/public/ContactInquiryForm';
import { Phone, MessageSquare, Mail, MapPin, Clock, ShieldCheck, Zap, Award } from 'lucide-react';
import { FaPhoneAlt, FaWhatsapp, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';
import DirectBookingComparison from '@/components/public/DirectBookingComparison';

export const metadata = constructMetadata({
  title: 'Contact Us | Urgent Taxis 24/7 Dispatch Desk & Support',
  description: 'Get in touch with Urgent Taxis. Call +91 7310651940 or WhatsApp +91 8595066033 24/7 for instant outstation cab booking, airport transfers, and customer support.',
  canonicalPath: '/contact',
});

export default function ContactUsPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Contact Us' },
  ];

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'TaxiService',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.domain,
    telephone: SITE_CONFIG.phone,
    email: SITE_CONFIG.supportEmail,
    description: '24/7 outstation cab booking, airport transfers, and local taxi rental in Ghaziabad and Delhi NCR.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Shop No. 09, S. R. Complex, Railway Station Road',
      addressLocality: 'Masuri, Ghaziabad',
      addressRegion: 'Uttar Pradesh',
      postalCode: '201302',
      addressCountry: 'IN',
    },
    areaServed: [
      { '@type': 'City', name: 'Ghaziabad' },
      { '@type': 'City', name: 'Noida' },
      { '@type': 'City', name: 'Delhi' },
      { '@type': 'AdministrativeArea', name: 'Delhi NCR' },
    ],
    priceRange: '₹₹',
  };

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(SITE_CONFIG.address)}&travelmode=driving`;

  return (
    <div className="pb-16 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <div className="bg-white border-b border-slate-100">
        <PublicBreadcrumbs items={breadcrumbItems} />
      </div>

      {/* 1. UPGRADED HERO SECTION */}
      <section className="relative bg-[#0a1128] text-white py-14 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
            <span>24/7 Live Transport Helpline • हमेशा आपके साथ!</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
            Contact <span className="text-brand-green">Urgent Taxis</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed font-medium">
            We are here to assist you 24/7 for instant outstation cab bookings, IGI airport transfers, customized pilgrimage packages, and corporate transport assistance.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs sm:text-sm font-semibold text-blue-200">
            <a
              href={`tel:${SITE_CONFIG.phoneRaw}`}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-xs px-4 py-2 rounded-full border border-white/20 flex items-center gap-2 transition-colors text-white"
            >
              <FaPhoneAlt className="text-brand-green text-xs" />
              <span>{SITE_CONFIG.phone}</span>
            </a>
            <span>•</span>
            <a
              href={generateWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-green/20 hover:bg-brand-green/30 backdrop-blur-xs px-4 py-2 rounded-full border border-brand-green/40 flex items-center gap-2 transition-colors text-emerald-300"
            >
              <FaWhatsapp className="text-brand-green text-sm" />
              <span>WhatsApp: +91 8595066033</span>
            </a>
            <span>•</span>
            <span className="bg-white/10 backdrop-blur-xs px-4 py-2 rounded-full border border-white/20">
              📍 Masuri, Ghaziabad HQ
            </span>
          </div>
        </div>
      </section>

      {/* 2. TRUST HIGHLIGHT PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center font-bold flex-shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-slate-900">10-15 Min Dispatch</h4>
              <p className="text-[11px] text-slate-500 font-medium">Fast doorstep arrival</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-brand-green flex items-center justify-center font-bold flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-slate-900">Verified Chauffeurs</h4>
              <p className="text-[11px] text-slate-500 font-medium">100% Commercial DL</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-slate-900">Upfront Fare Quotes</h4>
              <p className="text-[11px] text-slate-500 font-medium">Transparent per-KM fare clarity</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-slate-900">24/7 Operations</h4>
              <p className="text-[11px] text-slate-500 font-medium">Always open 365 days</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN CONTACT GRID: INFO CARDS + INQUIRY FORM */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct Helpline & Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200/90 p-6 sm:p-8 rounded-3xl space-y-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-brand-green uppercase tracking-wider">Direct Access</span>
              <h2 className="text-2xl font-black text-brand-blue tracking-tight mt-1">
                Head Office &amp; Help Desk
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Masuri, Ghaziabad registered operations desk serving all of Delhi NCR &amp; North India.
              </p>
            </div>

            {/* Helpline Phone */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold text-lg flex-shrink-0 border border-brand-blue/20">
                <FaPhoneAlt />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">24/7 Phone Helpline</p>
                <a
                  href={`tel:${SITE_CONFIG.phoneRaw}`}
                  className="text-lg sm:text-xl font-black text-slate-900 hover:text-brand-blue transition-colors block"
                >
                  {SITE_CONFIG.phone}
                </a>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Instant booking &amp; driver dispatch</p>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-green/10 text-brand-green flex items-center justify-center font-bold text-xl flex-shrink-0 border border-brand-green/20">
                <FaWhatsapp />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">WhatsApp Booking Desk</p>
                <a
                  href={generateWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg sm:text-xl font-black text-brand-green hover:text-brand-green-hover transition-colors block"
                >
                  +91 85950 66033
                </a>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Share pickup address &amp; get instant quote</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-lg flex-shrink-0 border border-slate-200">
                <FaEnvelope />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Support &amp; Corporate Inquiries</p>
                <a
                  href={`mailto:${SITE_CONFIG.supportEmail}`}
                  className="text-sm sm:text-base font-bold text-slate-800 hover:text-brand-blue transition-colors block"
                >
                  {SITE_CONFIG.supportEmail}
                </a>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Corporate tie-ups &amp; invoice requests</p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-lg flex-shrink-0 border border-slate-200">
                <FaMapMarkerAlt />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Registered Office Address</p>
                <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
                  {SITE_CONFIG.address}
                </p>
              </div>
            </div>

            {/* Business Hours */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 font-medium space-y-1">
              <div className="flex items-center justify-between">
                <span>Dispatch Operations:</span>
                <strong className="text-emerald-800 font-bold">24 Hours / 7 Days Open</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Customer Care Desk:</span>
                <strong className="text-slate-800 font-bold">24x7 On-Call Support</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Quick Inquiry Form */}
        <div className="lg:col-span-7">
          <ContactInquiryForm />
        </div>
      </section>

      {/* 4. GOOGLE MAPS EMBED SECTION */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-8">
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
          {/* Location & Directions Header */}
          <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-brand-green uppercase tracking-wider mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Official Head Office Location
              </div>
              <p className="text-sm font-bold text-brand-blue">
                Masuri, Ghaziabad, Uttar Pradesh 201302 (NH-9 Corridor)
              </p>
            </div>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-green hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <span>Get Driving Directions</span>
              <span>↗</span>
            </a>
          </div>

          {/* Full Color Interactive Map Viewport */}
          <div className="relative min-h-[420px] h-[450px] w-full bg-slate-100 flex-1">
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(SITE_CONFIG.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              className="w-full h-full absolute inset-0 border-0"
              allowFullScreen
              loading="lazy"
              title="Urgent Taxis Office Location Map"
            />

            {/* Floating Location Pin Badge */}
            <div className="absolute top-3 left-3 bg-white/95 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-xl shadow-md border border-slate-200 flex items-center gap-2 pointer-events-none backdrop-blur-xs">
              <span className="text-base">📍</span>
              <span>Urgent Taxis HQ • Masuri, Ghaziabad</span>
            </div>
          </div>

          {/* Map Footer with Directions Link */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium shrink-0">
            <span className="text-[11px] text-slate-500">
              Railway Station Road, Masuri, NH-9 Corridor, Ghaziabad
            </span>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-brand-blue hover:text-brand-green transition-colors"
            >
              Open Driving Route in Google Maps →
            </a>
          </div>
        </div>
      </section>

      {/* Direct Booking Comparison Section */}
      <DirectBookingComparison />
    </div>
  );
}
