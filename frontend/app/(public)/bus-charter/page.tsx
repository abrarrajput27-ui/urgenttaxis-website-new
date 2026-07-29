import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';

export const metadata = constructMetadata({
  title: 'Bus Charter Services | Urgent Taxis',
  description: 'Charter a bus for group tours, school trips, weddings, and corporate events with Urgent Taxis. Comfortable and safe group transportation.',
  canonicalPath: '/bus-charter',
});

export default function BusCharterPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Bus Charter' },
  ];

  return (
    <div className="pb-16 bg-slate-50 min-h-screen text-slate-900">
      <div className="bg-white border-b border-slate-100">
        <PublicBreadcrumbs items={breadcrumbItems} />
      </div>

      <section className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 text-xs font-bold shadow-sm">
          Large Group Transportation
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-brand-blue tracking-tight">
          Bus Charter Services
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          Reliable bus rentals for weddings, corporate events, educational tours, and large group excursions.
        </p>
      </section>

      <section className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-2xl font-black text-brand-blue">Charter a Bus with Us</h2>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              When traveling with 20+ passengers, our Bus Charter service is the most economical and comfortable choice. We provide well-maintained mini-buses and large coaches suited for various group requirements.
            </p>
            <ul className="space-y-3 text-sm text-slate-600 font-medium">
              <li className="flex gap-3"><span className="text-brand-green">✓</span> Weddings & Family Functions</li>
              <li className="flex gap-3"><span className="text-brand-green">✓</span> Corporate Offsites & Team Building</li>
              <li className="flex gap-3"><span className="text-brand-green">✓</span> School & College Educational Trips</li>
              <li className="flex gap-3"><span className="text-brand-green">✓</span> Pilgrimage & Tour Packages</li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-brand-blue to-brand-blue-light text-white p-8 rounded-3xl shadow-md relative overflow-hidden flex flex-col justify-center text-center">
            <div className="absolute inset-0 opacity-10 bg-[url('/hero-pattern.svg')] bg-center"></div>
            <h3 className="text-2xl font-black relative z-10 mb-4">Request a Custom Quote</h3>
            <p className="text-sm text-blue-50 font-medium relative z-10 leading-relaxed mb-6">
              Bus charter pricing depends on the itinerary, duration, and seating capacity. Connect with our logistics expert to get a tailored quotation.
            </p>
            <div className="relative z-10">
              <a
                href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20would%20like%20to%20request%20a%20quote%20for%20a%20*Bus%20Charter*.%20%F0%9F%9A%8C`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-brand-blue font-black text-sm px-8 py-4 rounded-xl hover:bg-slate-50 transition-all shadow-lg"
              >
                Get Quotation
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
