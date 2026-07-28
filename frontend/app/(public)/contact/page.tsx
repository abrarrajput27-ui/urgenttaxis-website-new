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
    <div className="pb-16 bg-white text-slate-900">
      <PublicBreadcrumbs items={breadcrumbItems} />

      {/* Header Banner */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-3">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#059669]/10 text-[#059669] border border-[#059669]/20 text-xs font-bold">
          24/7 Direct Customer Support
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[#1e1b4b] tracking-tight">
          Contact Urgent Taxis
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed font-medium">
          We are here to assist you 24/7 for outstation cab bookings, airport transfers, custom tour quotes, and customer assistance.
        </p>
      </section>

      {/* Contact Grid */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Branch Info Card */}
        <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="text-xl font-black text-[#1e1b4b] border-b border-slate-100 pb-3">
              Head Office Details
            </h2>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                📞
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Helpline</p>
                <a href={`tel:${SITE_CONFIG.phoneRaw}`} className="text-lg font-black text-[#1e1b4b] hover:text-[#059669]">
                  {SITE_CONFIG.phone}
                </a>
                <p className="text-xs text-slate-500 font-medium">Available 24x7 for instant booking</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#059669] flex items-center justify-center font-bold text-lg flex-shrink-0">
                💬
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">WhatsApp Support</p>
                <a
                  href={SITE_CONFIG.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-black text-[#059669] hover:underline"
                >
                  {SITE_CONFIG.phone}
                </a>
                <p className="text-xs text-slate-500 font-medium">Instant quote & cab assignment</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                📍
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Address</p>
                <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                  {SITE_CONFIG.address}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                ✉️
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Support Email</p>
                <a href={`mailto:${SITE_CONFIG.supportEmail}`} className="text-xs font-bold text-slate-800 hover:underline">
                  {SITE_CONFIG.supportEmail}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Google Map Embedding */}
        <div className="bg-slate-100 rounded-3xl border border-slate-200 overflow-hidden shadow-sm min-h-[380px]">
          <iframe
            src={`https://maps.google.com/maps?q=${encodeURIComponent(SITE_CONFIG.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            className="w-full h-full min-h-[380px] border-0"
            allowFullScreen
            loading="lazy"
            title="Urgent Taxis Office Map"
          />
        </div>
      </section>
    </div>
  );
}
