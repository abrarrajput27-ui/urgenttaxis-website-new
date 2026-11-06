import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import { BUSINESS_CONFIG } from '@/lib/config';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';

export const metadata = constructMetadata({
  title: 'Contact Us | Urgent Taxis 24/7 Dispatch Desk & Support',
  description: 'Get in touch with Urgent Taxis. Call 7310 651 940 or WhatsApp us 24/7 for instant outstation cab booking, airport transfers, and customer support.',
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
    <div className="pb-16 bg-slate-50 min-h-screen text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <div className="bg-white border-b border-slate-100">
        <PublicBreadcrumbs items={breadcrumbItems} />
      </div>

      {/* Header Banner */}
      <section className="py-10 sm:py-14 md:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 text-xs font-bold shadow-sm">
          24/7 Direct Customer Support
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-brand-blue tracking-tight">
          Contact Urgent Taxis
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          We are here to assist you 24/7 for outstation cab bookings, airport transfers, custom tour quotes, and customer assistance.
        </p>
      </section>

      {/* Contact Grid */}
      <section className="py-10 sm:py-14 md:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Branch Info Card */}
        <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-brand-blue border-b border-slate-100 pb-4">
              Head Office Details
            </h2>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold text-xl flex-shrink-0 border border-brand-blue/20">
                📞
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Helpline</p>
                <a href={`tel:${SITE_CONFIG.phoneRaw}`} className="text-xl font-black text-slate-900 hover:text-brand-blue transition-colors">
                  {SITE_CONFIG.phone}
                </a>
                <p className="text-sm text-slate-500 font-medium mt-1">Available 24x7 for instant booking</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-green/10 text-brand-green flex items-center justify-center font-bold text-xl flex-shrink-0 border border-brand-green/20">
                💬
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">WhatsApp Support</p>
                <a
                  href={`https://wa.me/${BUSINESS_CONFIG.phone.whatsappRaw}?text=${encodeURIComponent('Hello Urgent Taxis! 👋 I would like to make an inquiry about booking a taxi.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl font-black text-brand-green hover:text-brand-green-hover transition-colors"
                >
                  {SITE_CONFIG.whatsappDisplay || BUSINESS_CONFIG.phone.whatsapp}
                </a>
                <p className="text-sm text-slate-500 font-medium mt-1">Instant quote & cab assignment</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xl flex-shrink-0 border border-slate-200">
                📍
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Registered Address</p>
                <p className="text-sm text-slate-700 font-semibold leading-relaxed">
                  {SITE_CONFIG.address}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xl flex-shrink-0 border border-slate-200">
                ✉️
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Support Email</p>
                <a href={`mailto:${SITE_CONFIG.supportEmail}`} className="text-sm font-bold text-slate-800 hover:text-brand-blue transition-colors">
                  {SITE_CONFIG.supportEmail}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Google Map Embedding with Clear Location & Directions */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
          {/* Location & Directions Header */}
          <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-brand-green uppercase tracking-wider mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Official Head Office Location
              </div>
              <p className="text-sm font-bold text-brand-blue">
                Masuri, Ghaziabad, Uttar Pradesh 201302
              </p>
            </div>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-green hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <span>Get Directions</span>
              <span>↗</span>
            </a>
          </div>

          {/* Full Color Interactive Map Viewport */}
          <div className="relative min-h-[380px] bg-slate-100 flex-1">
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
              <span>Urgent Taxis HQ • Masuri</span>
            </div>
          </div>

          {/* Map Footer with Directions Link */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium shrink-0">
            <span className="text-[11px] text-slate-500">
              Railway Station Road, Masuri, NH-9 Corridor
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
    </div>
  );
}
