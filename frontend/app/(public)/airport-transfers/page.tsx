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
    <div className="pb-16 bg-slate-50 min-h-screen text-slate-900">
      {/* 1. Breadcrumbs */}
      <div className="bg-white border-b border-slate-100">
        <PublicBreadcrumbs items={breadcrumbItems} />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* 2. Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 text-xs font-bold shadow-sm">
          Punctual Airport & Railway Cabs
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-brand-blue tracking-tight leading-tight">
          Airport Taxi Transfers
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          Reliable pickup and drop services for IGI Airport Delhi (T3/T1) and Noida International Airport with guaranteed clean vehicles and transparent zone pricing.
        </p>
      </section>

      {/* 3. Supported Airport Locations & 4. Fare Calculator Widget */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Airport Info Card */}
        <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-6 lg:col-span-1 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-4">Supported Airport Hubs</h2>
          <div className="space-y-4 text-sm">
            {airportLocations.length > 0 ? (
              airportLocations.map((loc) => (
                <div key={loc.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 hover:shadow-md transition-shadow">
                  <span className="font-black text-brand-blue block text-base">{loc.name}</span>
                  <span className="text-slate-500 block font-medium">{loc.city}, {loc.state}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 font-medium">IGI Airport Delhi T3/T1 & Noida International Airport.</p>
            )}
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100 text-sm text-slate-600 leading-relaxed font-medium">
            <p className="font-bold text-slate-900 mb-2">Pickup Procedure:</p>
            <p>Driver contact details and vehicle numbers are dispatched 2 hours prior to flight arrival.</p>
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
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl font-black text-slate-900">Airport Fleet Categories</h2>
          <p className="text-sm text-slate-500 font-medium">Select suitable vehicle sizes based on passenger and luggage count.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories?.map((cat) => (
            <div key={cat.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="h-48 relative bg-white border-b border-slate-100 p-4 flex items-center justify-center">
                <VehicleImage
                  categoryImageUrl={cat.image_url}
                  alt={`${cat.name} airport transfer taxi`}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>
              <div className="p-8 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-black text-brand-blue">{cat.name}</h3>
                  <p className="text-sm text-slate-600 mt-2 font-medium leading-relaxed">{cat.description}</p>
                </div>
                <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-sm text-slate-600 font-bold">
                  <span>Capacity: {cat.max_passengers || 4} Pax</span>
                  <Link href={`/fleet/${cat.slug || cat.id}`} className="text-brand-blue hover:text-brand-blue-light transition-colors">
                    View Fleet →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Included vs Excluded Charges */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-emerald-100 p-8 rounded-3xl space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-5xl">✓</div>
          <h3 className="text-xl font-black text-brand-green relative z-10">Included in Airport Base Fare</h3>
          <ul className="text-sm text-slate-600 space-y-3 font-medium relative z-10">
            <li className="flex gap-2"><span className="text-brand-green">✓</span> Vehicle fuel charges for the transfer zone distance</li>
            <li className="flex gap-2"><span className="text-brand-green">✓</span> Driver allowance for transfer duration</li>
            <li className="flex gap-2"><span className="text-brand-green">✓</span> Doorstep pickup or airport terminal meeting point</li>
          </ul>
        </div>

        <div className="bg-white border border-amber-100 p-8 rounded-3xl space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-5xl">⚠️</div>
          <h3 className="text-xl font-black text-amber-600 relative z-10">Excluded / Payable at Actuals</h3>
          <ul className="text-sm text-slate-600 space-y-3 font-medium relative z-10">
            <li className="flex gap-2"><span className="text-amber-500">⚠</span> Airport terminal parking fees</li>
            <li className="flex gap-2"><span className="text-amber-500">⚠</span> MCD / State toll entry taxes</li>
            <li className="flex gap-2"><span className="text-amber-500">⚠</span> Extra wait time beyond included complimentary window</li>
          </ul>
        </div>
      </section>

      {/* 7. Visible FAQs */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-100">
        <h2 className="text-3xl font-black text-slate-900 text-center mb-10">
          Frequently Asked Questions
        </h2>
        <div className="space-y-5 text-sm">
          {visibleFaqs.map((faq, idx) => (
            <div key={idx} className="bg-white border border-slate-200 p-6 rounded-2xl space-y-2.5 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-base font-black text-brand-blue">{faq.question}</h3>
              <p className="text-slate-600 leading-relaxed font-medium">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Final CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center border-t border-slate-100">
        <div className="bg-gradient-to-r from-brand-blue to-brand-blue-light border border-slate-800 rounded-3xl p-10 space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('/hero-pattern.svg')] bg-center"></div>
          <h2 className="text-3xl sm:text-4xl font-black text-white relative z-10">
            Need an Airport Pick Up or Drop Cab?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <a
              href={`tel:${SITE_CONFIG.phoneRaw}`}
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-brand-blue font-black text-sm px-8 py-4 rounded-xl transition-all shadow-lg"
            >
              Call {SITE_CONFIG.phone}
            </a>
            <a
              href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20would%20like%20to%20make%20an%20inquiry.%20%E2%9C%A8`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-brand-green hover:bg-brand-green-hover text-white font-black text-sm px-8 py-4 rounded-xl transition-all shadow-lg"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
