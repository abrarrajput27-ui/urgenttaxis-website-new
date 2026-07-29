import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
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

  return (
    <div className="pb-16 bg-slate-50 min-h-screen text-slate-900">
      <div className="bg-white border-b border-slate-100">
        <PublicBreadcrumbs items={breadcrumbItems} />
      </div>

      {/* Header Banner */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
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
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
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
                  href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20would%20like%20to%20make%20an%20inquiry.%20%E2%9C%A8`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl font-black text-brand-green hover:text-brand-green-hover transition-colors"
                >
                  {SITE_CONFIG.phone}
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

        {/* Google Map Embedding */}
        <div className="bg-slate-200 rounded-3xl border border-slate-200 overflow-hidden shadow-sm min-h-[400px] relative">
          <iframe
            src={`https://maps.google.com/maps?q=${encodeURIComponent(SITE_CONFIG.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            className="w-full h-full absolute inset-0 border-0 mix-blend-luminosity hover:mix-blend-normal transition-all duration-500"
            allowFullScreen
            loading="lazy"
            title="Urgent Taxis Office Map"
          />
        </div>
      </section>
    </div>
  );
}
