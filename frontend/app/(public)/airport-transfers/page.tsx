import { supabaseServer } from '@/lib/supabase/server';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';
import PublicFareWidget from '@/components/public/PublicFareWidget';
import VehicleImage from '@/components/public/VehicleImage';
import Link from 'next/link';

export const metadata = constructMetadata({
  title: 'Airport Taxi Transfer Service | IGI Airport Delhi Cabs',
  description: 'Book reliable airport taxi transfers to and from IGI Airport Delhi (Terminal 3 / Terminal 1) and Noida International Airport with doorstep pickup and fixed zone rates.',
  canonicalPath: '/airport-transfers',
});

export default async function AirportTransfersPage() {
  const supabase = await supabaseServer();

  // Fetch Master Data
  const { data: categories } = await supabase
    .from('vehicle_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  const { data: routes } = await supabase
    .from('routes')
    .select('*, origin:locations!routes_origin_location_id_fkey(*), destination:locations!routes_destination_location_id_fkey(*)')
    .eq('is_active', true);

  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  const { data: localPackages } = await supabase
    .from('pricing_local_packages')
    .select('*')
    .eq('is_active', true);

  // Filter airport and city locations
  const airportLocations = locations?.filter((l) => l.location_type === 'airport') || [];

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Airport Transfers' },
  ];

  const visibleFaqs = [
    {
      question: 'How do airport transfer pickups work at IGI Airport Delhi?',
      answer: 'Our driver tracks your flight status and coordinates arrival pickup at IGI Airport Terminal 3 or Terminal 1. Doorstep drop service is provided directly to your destination.',
    },
    {
      question: 'Are airport entry fees and toll charges included in the fare?',
      answer: 'Airport entry fees, parking charges, and toll taxes are excluded from the base transfer fare and are payable at actuals, unless explicitly specified as included in your quotation DTO.',
    },
    {
      question: 'What happens if my flight is delayed?',
      answer: 'Since flight details are shared prior to travel, our dispatch team monitors flight delays to adjust chauffeur arrival timing accordingly.',
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
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
          Punctual Airport & Railway Cabs
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Airport Taxi Transfers
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Reliable pickup and drop services for IGI Airport Delhi (T3/T1) and Noida International Airport with guaranteed clean vehicles and transparent zone pricing.
        </p>
      </section>

      {/* 3. Supported Airport Locations & 4. Fare Calculator Widget */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Airport Info Card */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 lg:col-span-1">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Supported Airport Hubs</h2>
          <div className="space-y-3 text-xs">
            {airportLocations.length > 0 ? (
              airportLocations.map((loc) => (
                <div key={loc.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-white block">{loc.name}</span>
                  <span className="text-slate-400 block">{loc.city}, {loc.state}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-400">IGI Airport Delhi T3/T1 & Noida International Airport.</p>
            )}
          </div>

          <div className="pt-2 text-xs text-slate-400 leading-relaxed">
            <p className="font-semibold text-slate-300">Pickup Procedure:</p>
            <p className="mt-1">Driver contact details and vehicle numbers are dispatched 2 hours prior to flight arrival.</p>
          </div>
        </div>

        {/* Fare Search Widget */}
        <div className="lg:col-span-2">
          <PublicFareWidget
            localPackages={localPackages || []}
            categories={categories || []}
            routes={routes || []}
            locations={locations || []}
            initialServiceType="airport_transfer"
          />
        </div>
      </section>

      {/* 5. Vehicle Options */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl font-bold text-white">Airport Fleet Categories</h2>
          <p className="text-xs text-slate-400">Select suitable vehicle sizes based on passenger and luggage count.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories?.map((cat) => (
            <div key={cat.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
              <div className="h-44 relative bg-slate-950">
                <VehicleImage
                  categoryImageUrl={cat.image_url}
                  alt={`${cat.name} airport transfer taxi`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{cat.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{cat.description}</p>
                </div>
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                  <span>Capacity: {cat.max_passengers || 4} Passengers</span>
                  <Link href={`/fleet/${cat.slug || cat.id}`} className="text-emerald-400 font-bold hover:underline">
                    View Fleet →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Included vs Excluded Charges */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3">
          <h3 className="text-base font-bold text-emerald-400">✓ Included in Airport Base Fare</h3>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li>Vehicle fuel charges for the transfer zone distance</li>
            <li>Driver allowance for transfer duration</li>
            <li>Doorstep pickup or airport terminal meeting point</li>
          </ul>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3">
          <h3 className="text-base font-bold text-amber-400">⚠️ Excluded / Payable at Actuals</h3>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li>Airport terminal parking fees</li>
            <li>MCD / State toll entry taxes</li>
            <li>Extra wait time beyond included complimentary window</li>
          </ul>
        </div>
      </section>

      {/* 7. Visible FAQs */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-900">
        <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-8">
          Frequently Asked Questions (Airport Transfers)
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

      {/* 8. Final CTA */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center border-t border-slate-900">
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Need an Airport Pick Up or Drop Cab?
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
