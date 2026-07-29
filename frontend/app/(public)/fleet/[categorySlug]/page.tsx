import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { getPublicSupabaseClient } from '@/lib/supabase/static-public';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';
import VehicleImage from '@/components/public/VehicleImage';
import PublicFareWidget from '@/components/public/PublicFareWidget';
import Link from 'next/link';
import { VehicleVariant } from '@/types/database';

interface DynamicCategoryPageProps {
  params: Promise<{
    categorySlug: string;
  }>;
}

// Resolve vehicle category by slug from database
async function resolveCategoryBySlug(slug: string) {
  const supabase = await supabaseServer();
  const { data: categories } = await supabase
    .from('vehicle_categories')
    .select('*')
    .eq('is_active', true);

  if (!categories) return null;

  return categories.find(
    (c) => c.slug === slug || c.id === slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug
  );
}

export async function generateMetadata({ params }: DynamicCategoryPageProps) {
  const resolvedParams = await params;
  const category = await resolveCategoryBySlug(resolvedParams.categorySlug);

  if (!category) {
    return constructMetadata({
      title: 'Category Not Found',
      noIndex: true,
    });
  }

  return constructMetadata({
    title: `${category.name} Cab Booking | Outstation & Airport Taxi`,
    description: `Book reliable ${category.name} taxis for outstation trips, airport transfers, and local rentals. Transparent per-KM pricing and verified chauffeurs.`,
    canonicalPath: `/fleet/${resolvedParams.categorySlug}`,
  });
}

export async function generateStaticParams() {
  const supabase = getPublicSupabaseClient();
  const { data: categories } = await supabase
    .from('vehicle_categories')
    .select('*')
    .eq('is_active', true);

  if (!categories) return [];

  return categories.map((c) => ({
    categorySlug: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  }));
}

export default async function DynamicVehicleCategoryPage({ params }: DynamicCategoryPageProps) {
  const resolvedParams = await params;
  const category = await resolveCategoryBySlug(resolvedParams.categorySlug);

  if (!category) {
    notFound();
  }

  const supabase = await supabaseServer();

  // Fetch Models for this Category
  const { data: models } = await supabase
    .from('vehicle_models')
    .select('*, vehicle_variants(*)')
    .eq('category_id', category.id)
    .eq('is_active', true);

  // Fetch Master Reference Data for Pricing Widget
  const { data: categories } = await supabase
    .from('vehicle_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  const { data: routes } = await supabase
    .from('routes')
    .select('*, origin:locations!routes_origin_location_id_fkey(*), destination:locations!routes_destination_location_id_fkey(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  const { data: localPackages } = await supabase
    .from('pricing_local_packages')
    .select('*')
    .eq('is_active', true);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Taxi Fleet', href: '/fleet' },
    { label: category.name },
  ];

  // Category specific visible FAQs
  const visibleFaqs = [
    {
      question: `What makes ${category.name} ideal for outstation cab trips?`,
      answer: `${category.name} vehicles offer optimal fuel efficiency, comfortable seating for up to ${category.max_passengers || 4} passengers, and ample trunk space for outstation luggage.`,
    },
    {
      question: `How is the fare calculated for ${category.name} cabs?`,
      answer: `Outstation fares are calculated using database per-KM rates and daily minimum guarantees. Enter your trip details in our server pricing calculator to view an itemized quote.`,
    },
    {
      question: `Are toll tax and parking charges included for ${category.name} bookings?`,
      answer: `Toll taxes, state border entry taxes, and parking fees are excluded from the base fare and are payable at actual toll booths, unless specified as included in your quotation DTO.`,
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

      {/* 2. Category Hero */}
      <section className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 text-xs font-bold shadow-sm">
          Vehicle Category Profile
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-brand-blue tracking-tight leading-tight">
          {category.name} Cab Booking
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          {category.description || `Book verified ${category.name} vehicles for outstation trips, airport transfers, and local hourly rentals.`}
        </p>
      </section>

      {/* 3. Vehicle Models & 4. Image Fallback */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100">
        <div className="text-center space-y-3 mb-4">
          <h2 className="text-3xl font-black text-slate-900">Active {category.name} Models & Variants</h2>
          <p className="text-sm text-slate-500 font-medium">Verified vehicle models available in this category.</p>
        </div>

        {models && models.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {models.map((model) => (
              <div key={model.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-48 relative bg-white border-b border-slate-100 p-4 flex items-center justify-center">
                  <VehicleImage
                    modelImageUrl={model.master_image_url}
                    categoryImageUrl={category.image_url}
                    alt={`${model.brand_name} ${model.model_name} ${category.name} taxi`}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-black text-brand-blue">
                      {model.brand_name} {model.model_name}
                    </h3>
                    <span className="text-xs text-brand-green font-bold block mt-1">
                      Display Mode: {model.display_mode === 'exact_vehicle' ? 'Exact Model Guaranteed' : 'Model or Similar'}
                    </span>
                  </div>

                  {model.vehicle_variants && model.vehicle_variants.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 text-sm space-y-2 text-slate-600 font-medium">
                      {model.vehicle_variants.map((v: VehicleVariant) => (
                        <div key={v.id} className="flex justify-between items-center py-1">
                          <span>{v.variant_name} <span className="text-slate-400 text-xs">({v.fuel_type})</span></span>
                          <span className="text-amber-600 font-bold">{v.seating_capacity} Seats</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 p-10 rounded-3xl text-center space-y-3 shadow-sm">
            <h3 className="text-xl font-black text-slate-900">Category Models Cataloged</h3>
            <p className="text-sm text-slate-500 font-medium max-w-md mx-auto">Standard {category.name} vehicles available for outstation and airport transfer bookings.</p>
          </div>
        )}
      </section>

      {/* 5. Service Suitability */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100">
        <div className="text-center space-y-3 mb-4">
          <h2 className="text-3xl font-black text-slate-900">Ideal Service Suitability</h2>
          <p className="text-sm text-slate-500 font-medium">Recommended trip types for {category.name} cabs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-slate-600">
          <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-3 shadow-sm text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold text-2xl border border-brand-blue/20 mb-4">🛣️</div>
            <h3 className="text-lg font-black text-slate-900">Outstation Intercity Travel</h3>
            <p className="font-medium leading-relaxed">Comfortable seating and suspension for highway journeys (e.g. Delhi to Agra, Haridwar, Jaipur).</p>
          </div>
          <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-3 shadow-sm text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-green/10 text-brand-green flex items-center justify-center font-bold text-2xl border border-brand-green/20 mb-4">✈️</div>
            <h3 className="text-lg font-black text-slate-900">Airport Transfers</h3>
            <p className="font-medium leading-relaxed">Timely pickups and drops for IGI Airport Terminal 3/1 with luggage space for family travel.</p>
          </div>
          <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-3 shadow-sm text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold text-2xl border border-brand-blue/20 mb-4">🏙️</div>
            <h3 className="text-lg font-black text-slate-900">Local Hourly Rentals</h3>
            <p className="font-medium leading-relaxed">Flexible 8-hour / 80-KM city packages for business travel and shopping trips.</p>
          </div>
        </div>
      </section>

      {/* 6. Fare / Booking CTA (Secure Public Fare API Widget) */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-3xl font-black text-slate-900">Calculate {category.name} Fare</h2>
          <p className="text-sm text-slate-500 font-medium">Instant server-side fare calculation for your itinerary.</p>
        </div>
        <PublicFareWidget
          localPackages={localPackages || []}
          categories={categories || []}
          routes={routes || []}
          locations={locations || []}
        />
      </section>

      {/* 7. Relevant Database Routes */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-3xl font-black text-slate-900">Popular {category.name} Routes</h2>
          <p className="text-sm text-slate-500 font-medium">Verified outstation corridors served by our {category.name} fleet.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {routes?.slice(0, 3).map((r) => {
            const originName = r.origin?.name || 'Origin';
            const destName = r.destination?.name || 'Destination';
            const routeSlug = `${originName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-to-${destName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-taxi`;

            return (
              <div key={r.id} className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <h3 className="text-base font-black text-slate-900">{originName} → {destName}</h3>
                  <span className="text-sm text-amber-600 font-bold block mt-1">Distance: {r.estimated_distance_km} KM</span>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <Link href={`/routes/${routeSlug}`} className="text-sm font-bold text-brand-blue hover:text-brand-blue-light transition-colors">
                    View Route Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. Booking Process & 9. Visible FAQs */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-100">
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

      {/* 10. Final CTA */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center border-t border-slate-100">
        <div className="bg-gradient-to-r from-brand-blue to-brand-blue-light border border-slate-800 rounded-3xl p-10 space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('/hero-pattern.svg')] bg-center"></div>
          <h2 className="text-3xl sm:text-4xl font-black text-white relative z-10">
            Book a {category.name} Cab Now
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <a
              href={`tel:${SITE_CONFIG.phoneRaw}`}
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-brand-blue font-black text-sm px-8 py-4 rounded-xl transition-all shadow-lg"
            >
              Call {SITE_CONFIG.phone}
            </a>
            <a
              href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20would%20like%20to%20book%20a%20*${encodeURIComponent(category.name)}*%20cab.%20%F0%9F%9A%96`}
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
