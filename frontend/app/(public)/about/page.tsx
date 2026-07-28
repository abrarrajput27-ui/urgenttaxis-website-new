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
    <div className="pb-16 bg-white text-slate-900">
      <PublicBreadcrumbs items={breadcrumbItems} />

      {/* Hero Banner */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#059669]/10 text-[#059669] border border-[#059669]/20 text-xs font-bold">
          Trusted Travel Partner Across India
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[#1e1b4b] tracking-tight">
          About Urgent Taxis
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
          Delivering safe, punctual, and affordable outstation cabs, airport transfers, and local hourly rentals directly from our Masuri, Ghaziabad headquarters.
        </p>
      </section>

      {/* Mission & Story */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-slate-100 space-y-8">
        <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl space-y-4">
          <h2 className="text-2xl font-black text-[#1e1b4b]">Our Story & Mission</h2>
          <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-medium">
            Founded with a vision to eliminate hidden charges and driver delays in outstation cab travel, Urgent Taxis has grown to become the preferred taxi partner for thousands of families, corporate professionals, and spiritual pilgrims traveling across Delhi NCR, Uttarakhand, Uttar Pradesh, Himachal Pradesh, and Rajasthan.
          </p>
          <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-medium">
            Operating 24/7 out of our S. R. Complex, Railway Station Road office in Masuri, Ghaziabad, our dispatch desk ensures every trip is assigned a commercially verified driver and a well-maintained vehicle.
          </p>
        </div>

        {/* 4 Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-2 shadow-sm">
            <div className="text-2xl">🛡️</div>
            <h3 className="text-base font-bold text-[#1e1b4b]">100% Verified Fleet & Drivers</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Every driver undergoes background checks and highway safety evaluation. Cabs undergo routine mechanical checks before every trip.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-2 shadow-sm">
            <div className="text-2xl">💵</div>
            <h3 className="text-base font-bold text-[#1e1b4b]">Transparent Per-KM Fares</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              No surprise driver fees or end-of-trip price hikes. Our itemized quotations clearly specify base fare, distance rates, and toll rules upfront.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-2 shadow-sm">
            <div className="text-2xl">⏰</div>
            <h3 className="text-base font-bold text-[#1e1b4b]">24/7 Punctual Pickups</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Whether it’s a 3:00 AM IGI Airport transfer or an early morning outstation departure, our vehicles reach your doorstep ahead of schedule.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-2 shadow-sm">
            <div className="text-2xl">🚘</div>
            <h3 className="text-base font-bold text-[#1e1b4b]">Diverse Vehicle Categories</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Choose from comfortable Hatchbacks, premium Sedans (Dzire/Etios), spacious 6-seater SUVs (Ertiga/Carens), and luxury Innova Crystas.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-[#1e1b4b] to-slate-900 border border-slate-800 text-white rounded-3xl p-8 text-center space-y-4">
          <h3 className="text-2xl font-black">Need a Quick Cab Quote?</h3>
          <p className="text-xs sm:text-sm text-slate-300">Connect with our 24/7 support desk for custom trip arrangements.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href={`tel:${SITE_CONFIG.phoneRaw}`}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors"
            >
              📞 Call {SITE_CONFIG.phone}
            </a>
            <a
              href={SITE_CONFIG.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-6 py-3 rounded-xl transition-colors"
            >
              💬 WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
