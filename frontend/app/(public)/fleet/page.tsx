import { supabaseServer } from '@/lib/supabase/server';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';
import VehicleImage from '@/components/public/VehicleImage';
import Link from 'next/link';

export const metadata = constructMetadata({
  title: 'Taxi Fleet Directory & Vehicle Categories',
  description: 'Explore our verified outstation taxi fleet featuring comfortable Sedans, spacious SUVs, and luxury cabs available for intercity travel and airport transfers.',
  canonicalPath: '/fleet',
});

export default async function FleetDirectoryPage() {
  const supabase = await supabaseServer();

  const { data: categories } = await supabase
    .from('vehicle_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Taxi Fleet' },
  ];

  const visibleFaqs = [
    {
      question: 'What types of vehicles are available in the Urgent Taxis fleet?',
      answer: 'Our fleet features well-maintained Sedan (e.g. Maruti Dzire, Toyota Etios) and SUV/MUV (e.g. Maruti Ertiga, Toyota Innova Crysta) categories suitable for outstation travel and airport pickups.',
    },
    {
      question: 'Are vehicle images on the website exact representations?',
      answer: 'We provide category-level and model-level specifications. While exact vehicle colors may vary, the seating capacity, baggage space, and vehicle category booked are 100% guaranteed.',
    },
    {
      question: 'Do you expose vehicle registration numbers on public pages?',
      answer: 'No. Vehicle registration details and driver contact information are provided privately to customers via SMS/WhatsApp after booking confirmation.',
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: visibleFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="pb-16">
      {/* 1. Breadcrumbs */}
      <PublicBreadcrumbs items={breadcrumbItems} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* 2. Hero Section */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-3">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
          Verified Commercial Fleet Catalog
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Our Outstation & Airport Taxi Fleet
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Choose from clean, well-maintained Sedan and SUV cabs driven by experienced highway chauffeurs for your journey.
        </p>
      </section>

      {/* 3. Vehicle Category Grid */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories?.map((cat) => (
            <div
              key={cat.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div className="h-52 relative bg-slate-950">
                <VehicleImage
                  categoryImageUrl={cat.image_url}
                  alt={`${cat.name} taxi available for outstation cab booking`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white">{cat.name}</h2>
                  <p className="text-xs text-slate-400 leading-relaxed">{cat.description}</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                    <span>Passenger Capacity:</span>
                    <span className="font-bold text-amber-400">{cat.max_passengers || 4} Seats</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <Link
                      href={`/fleet/${cat.slug || cat.id}`}
                      className="w-full text-center text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors border border-emerald-500/30 bg-emerald-500/10 py-2.5 rounded-xl"
                    >
                      Category Details & Models →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Booking / Fare CTA */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900 text-center">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Need a Specific Vehicle for Your Outstation Trip?</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Get an instant fare quotation using our server-side pricing calculator or connect with our support desk.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/#search-widget"
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-5 py-3 rounded-xl transition-colors"
            >
              Calculate Fare Now
            </Link>
            <a
              href="https://wa.me/917310651940?text=Hello%20Urgent%20Taxis%2C%20I%20have%20a%20fleet%20inquiry."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-colors"
            >
              💬 WhatsApp Assistance
            </a>
          </div>
        </div>
      </section>

      {/* 5. Why Choose Urgent Taxis */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl font-bold text-white">Fleet Standards & Comfort</h2>
          <p className="text-xs text-slate-400">Guaranteed quality and safety parameters across all vehicles.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
            <h3 className="text-sm font-bold text-white">Clean & Sanitized Interiors</h3>
            <p className="text-slate-400">Vehicles undergo thorough interior cleaning and sanitization prior to every outstation departure.</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
            <h3 className="text-sm font-bold text-white">Highway Certified Chauffeurs</h3>
            <p className="text-slate-400">Experienced commercial drivers trained for intercity highways, night driving, and customer safety.</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
            <h3 className="text-sm font-bold text-white">AC & Airbags Standard</h3>
            <p className="text-slate-400">All fleet vehicles come equipped with working air conditioning and standard safety airbags.</p>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-900">
        <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-8">
          Frequently Asked Questions (Fleet & Vehicles)
        </h2>
        <div className="space-y-4 text-xs">
          {visibleFaqs.map((faq, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
              <h3 className="text-sm font-bold text-white">{faq.question}</h3>
              <p className="text-slate-400 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Final CTA */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center border-t border-slate-900">
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready to Book Your Preferred Cab?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`tel:${SITE_CONFIG.phoneRaw}`}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              📞 Call {SITE_CONFIG.phone}
            </a>
            <a
              href={SITE_CONFIG.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-6 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              💬 WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
