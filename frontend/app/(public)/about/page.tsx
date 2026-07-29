import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';

export const metadata = constructMetadata({
  title: 'About Us | Urgent Taxis - Outstation & Airport Taxi Partner',
  description: 'Learn about Urgent Taxis, India’s trusted outstation cab provider offering verified drivers, transparent per-KM pricing, and 24/7 customer support.',
  canonicalPath: '/about',
});

export default function AboutUsPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'About Us' },
  ];

  return (
    <div className="pb-16 bg-slate-50 min-h-screen text-slate-900">
      <div className="bg-white border-b border-slate-100">
        <PublicBreadcrumbs items={breadcrumbItems} />
      </div>

      {/* Hero Banner */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 text-xs font-bold shadow-sm">
          Trusted Travel Partner Across India
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-brand-blue tracking-tight">
          About Urgent Taxis
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          Delivering safe, punctual, and affordable outstation cabs, airport transfers, and local hourly rentals directly from our Masuri, Ghaziabad headquarters.
        </p>
      </section>

      {/* Mission & Story */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-slate-100 space-y-8">
        <div className="bg-white border border-slate-200 p-10 rounded-3xl space-y-5 shadow-sm">
          <h2 className="text-3xl font-black text-brand-blue">Our Story & Mission</h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
            Founded with a vision to eliminate hidden charges and driver delays in outstation cab travel, Urgent Taxis has grown to become the preferred taxi partner for thousands of families, corporate professionals, and spiritual pilgrims traveling across Delhi NCR, Uttarakhand, Uttar Pradesh, Himachal Pradesh, and Rajasthan.
          </p>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
            Operating 24/7 out of our S. R. Complex, Railway Station Road office in Masuri, Ghaziabad, our dispatch desk ensures every trip is assigned a commercially verified driver and a well-maintained vehicle.
          </p>
        </div>

        {/* 4 Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold text-2xl border border-brand-blue/20 mb-2">
              🛡️
            </div>
            <h3 className="text-lg font-black text-slate-900">100% Verified Fleet & Drivers</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Every driver undergoes background checks and highway safety evaluation. Cabs undergo routine mechanical checks before every trip.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-brand-green/10 text-brand-green flex items-center justify-center font-bold text-2xl border border-brand-green/20 mb-2">
              💵
            </div>
            <h3 className="text-lg font-black text-slate-900">Transparent Per-KM Fares</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              No surprise driver fees or end-of-trip price hikes. Our itemized quotations clearly specify base fare, distance rates, and toll rules upfront.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold text-2xl border border-brand-blue/20 mb-2">
              ⏰
            </div>
            <h3 className="text-lg font-black text-slate-900">24/7 Punctual Pickups</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Whether it’s a 3:00 AM IGI Airport transfer or an early morning outstation departure, our vehicles reach your doorstep ahead of schedule.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-brand-green/10 text-brand-green flex items-center justify-center font-bold text-2xl border border-brand-green/20 mb-2">
              🚘
            </div>
            <h3 className="text-lg font-black text-slate-900">Diverse Vehicle Categories</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Choose from comfortable Hatchbacks, premium Sedans (Dzire/Etios), spacious 6-seater SUVs (Ertiga/Carens), and luxury Innova Crystas.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-brand-blue to-brand-blue-light border border-slate-200 text-white rounded-3xl p-10 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('/hero-pattern.svg')] bg-center"></div>
          <h3 className="text-3xl font-black relative z-10">Need a Quick Cab Quote?</h3>
          <p className="text-sm text-indigo-100 relative z-10 font-medium">Connect with our 24/7 support desk for custom trip arrangements.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 relative z-10">
            <a
              href={`tel:${SITE_CONFIG.phoneRaw}`}
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-brand-blue font-black text-sm px-8 py-4 rounded-xl transition-all shadow-md"
            >
              Call {SITE_CONFIG.phone}
            </a>
            <a
              href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20would%20like%20to%20make%20an%20inquiry.%20%E2%9C%A8`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-brand-green hover:bg-brand-green-hover text-white font-black text-sm px-8 py-4 rounded-xl transition-all shadow-md"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
