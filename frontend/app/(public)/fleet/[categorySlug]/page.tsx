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
    <div className="pb-16">
      {/* 1. Breadcrumbs */}
      <PublicBreadcrumbs items={breadcrumbItems} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* 2. Category Hero */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
          Vehicle Category Profile
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          {category.name} Cab Booking
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          {category.description || `Book verified ${category.name} vehicles for outstation trips, airport transfers, and local hourly rentals.`}
        </p>
      </section>

      {/* 3. Vehicle Models & 4. Image Fallback */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl font-bold text-white">Active {category.name} Models & Variants</h2>
          <p className="text-xs text-slate-400">Verified vehicle models available in this category.</p>
        </div>

        {models && models.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model) => (
              <div key={model.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between">
                <div className="h-44 relative bg-slate-950">
                  <VehicleImage
                    modelImageUrl={model.master_image_url}
                    categoryImageUrl={category.image_url}
                    alt={`${model.brand_name} ${model.model_name} ${category.name} taxi`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {model.brand_name} {model.model_name}
                    </h3>
                    <span className="text-[11px] text-emerald-400 font-medium block mt-0.5">
                      Display Mode: {model.display_mode === 'exact_vehicle' ? 'Exact Model Guaranteed' : 'Model or Similar'}
                    </span>
                  </div>

                  {model.vehicle_variants && model.vehicle_variants.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 text-xs space-y-1 text-slate-300">
                      {model.vehicle_variants.map((v: VehicleVariant) => (
                        <div key={v.id} className="flex justify-between items-center py-0.5">
                          <span>{v.variant_name} ({v.fuel_type})</span>
                          <span className="text-amber-400 font-semibold">{v.seating_capacity} Seats</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-2">
            <h3 className="text-base font-bold text-white">Category Models Cataloged</h3>
            <p className="text-xs text-slate-400">Standard {category.name} vehicles available for outstation and airport transfer bookings.</p>
          </div>
        )}
      </section>

      {/* 5. Service Suitability */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl font-bold text-white">Ideal Service Suitability</h2>
          <p className="text-xs text-slate-400">Recommended trip types for {category.name} cabs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
            <h3 className="text-sm font-bold text-white">Outstation Intercity Travel</h3>
            <p className="text-slate-400">Comfortable seating and suspension for highway journeys (e.g. Delhi to Agra, Haridwar, Jaipur).</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
            <h3 className="text-sm font-bold text-white">Airport Transfers</h3>
            <p className="text-slate-400">Timely pickups and drops for IGI Airport Terminal 3/1 with luggage space for family travel.</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
            <h3 className="text-sm font-bold text-white">Local Hourly Rentals</h3>
            <p className="text-slate-400">Flexible 8-hour / 80-KM city packages for business travel and shopping trips.</p>
          </div>
        </div>
      </section>

      {/* 6. Fare / Booking CTA (Secure Public Fare API Widget) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl font-bold text-white">Calculate {category.name} Fare</h2>
          <p className="text-xs text-slate-400">Instant server-side fare calculation for your itinerary.</p>
        </div>
        <PublicFareWidget
          localPackages={localPackages || []}
          categories={categories || []}
          routes={routes || []}
          locations={locations || []}
        />
      </section>

      {/* 7. Relevant Database Routes */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl font-bold text-white">Popular {category.name} Routes</h2>
          <p className="text-xs text-slate-400">Verified outstation corridors served by our {category.name} fleet.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {routes?.slice(0, 3).map((r) => {
            const originName = r.origin?.name || 'Origin';
            const destName = r.destination?.name || 'Destination';
            const routeSlug = `${originName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-to-${destName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-taxi`;

            return (
              <div key={r.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{originName} → {destName}</h3>
                  <span className="text-xs text-amber-400 font-mono block mt-1">Verified Distance: {r.estimated_distance_km} KM</span>
                </div>
                <div className="pt-2 border-t border-slate-800/80">
                  <Link href={`/routes/${routeSlug}`} className="text-xs font-bold text-emerald-400 hover:underline">
                    View Route Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. Booking Process & 9. Visible FAQs */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-900">
        <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-8">
          Frequently Asked Questions ({category.name} Cabs)
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

      {/* 10. Final CTA */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center border-t border-slate-900">
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Book a {category.name} Cab Now
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`tel:${SITE_CONFIG.phoneRaw}`}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              📞 Call {SITE_CONFIG.phone}
            </a>
            <a
              href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis%2C%20I%20want%20to%20book%20a%20${encodeURIComponent(category.name)}%20cab.`}
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
