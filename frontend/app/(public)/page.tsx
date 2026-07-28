import { supabaseServer } from '@/lib/supabase/server';
import PublicFareWidget from '@/components/public/PublicFareWidget';
import VehicleImage from '@/components/public/VehicleImage';
import { constructMetadata, generateLocalBusinessSchema, SITE_CONFIG } from '@/lib/seo';
import Link from 'next/link';

export const metadata = constructMetadata({
  title: 'Outstation Cab Booking & Airport Taxi Service',
  description: 'Book reliable sedan, SUV, and outstation cabs in Delhi NCR, Agra, Haridwar, Jaipur, and airport transfers with transparent pricing.',
});

export default async function HomePage() {
  const supabase = await supabaseServer();

  // Fetch reference master data
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

  const localBusinessSchema = generateLocalBusinessSchema();

  // Visible FAQs for FAQPage JSON-LD Schema
  const visibleFaqs = [
    {
      question: 'How is the One-Way Outstation fare calculated?',
      answer: 'One-Way outstation fares include a base distance threshold and base fare. Extra distance beyond the included limit is charged at a fixed per-KM rate. Driver allowance is included in the base fare.',
    },
    {
      question: 'How does Round-Trip daily minimum billing work?',
      answer: 'Round-Trip outstation bookings carry a guaranteed minimum distance of 250 KM per day. The billable distance is whichever is higher between your actual driven distance and the daily minimum guarantee.',
    },
    {
      question: 'Are Toll Tax and Parking charges included in the fare?',
      answer: 'Toll taxes, state border entry taxes, and parking fees are excluded from the base fare and are payable directly by the passenger at actual toll booths, unless explicitly specified as included in your quotation.',
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
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* 2. HERO SECTION */}
      <section className="relative pt-8 pb-16 px-4 sm:px-6 lg:px-8 bg-slate-950 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-4 mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Guaranteed & Transparent Outstation Fares
          </span>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Reliable Outstation Taxi & Airport Transfers
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Book verified sedan and SUV cabs for one-way outstation trips, round-trip journeys, local hourly packages, and airport transfers with transparent per-KM pricing.
          </p>
        </div>

        {/* 3. PUBLIC FARE SEARCH WIDGET */}
        <PublicFareWidget
          localPackages={localPackages || []}
          categories={categories || []}
          routes={routes || []}
          locations={locations || []}
        />
      </section>

      {/* 4. POPULAR ROUTES SECTION */}
      <section id="routes" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Popular Database-Backed Taxi Routes
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Verified outstation travel corridors with fixed distance limits.
            </p>
          </div>
          <Link
            href="/routes"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 rounded-lg"
          >
            View All Routes →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {routes?.slice(0, 6).map((r) => (
            <div key={r.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div>
                <h3 className="text-base font-bold text-white">
                  {r.origin?.name} → {r.destination?.name}
                </h3>
                <span className="text-xs text-amber-400 font-mono font-medium block mt-1">
                  Est. Distance: {r.estimated_distance_km} KM ({r.estimated_duration_hours ? `${r.estimated_duration_hours} hrs` : 'Direct Route'})
                </span>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <Link
                  href={`/routes/${r.slug || r.id}`}
                  className="text-xs font-bold text-slate-300 hover:text-white underline"
                >
                  Route Details
                </Link>
                <a
                  href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis%2C%20I%20want%20to%20book%20a%20cab%20from%20${encodeURIComponent(r.origin?.name || '')}%20to%20${encodeURIComponent(r.destination?.name || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-extrabold px-3 py-2 rounded-lg transition-colors"
                >
                  Book Cab
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FLEET SHOWCASE SECTION */}
      <section id="fleet" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Our Vehicle Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Choose from our verified fleet of well-maintained sedans and spacious SUVs.
            </p>
          </div>
          <Link
            href="/fleet"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 rounded-lg"
          >
            Explore Fleet →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories?.map((cat) => (
            <div key={cat.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div className="h-48 relative bg-slate-950">
                <VehicleImage
                  categoryImageUrl={cat.image_url}
                  alt={`${cat.name} taxi available for outstation cab booking`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{cat.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{cat.description}</p>
                </div>
                <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/80 font-medium text-slate-300">
                  <span>Capacity: {cat.max_passengers || 4} Passengers</span>
                  <Link href={`/fleet/${cat.slug || cat.id}`} className="text-emerald-400 hover:text-emerald-300 font-bold">
                    Category Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. AIRPORT TRANSFERS SECTION */}
      <section id="airport-transfers" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100">
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-xs font-semibold">
              Punctual & Doorstep Pickups
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#1e1b4b] tracking-tight">
              Airport Transfers & Railway Pickups
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Hassle-free transfers to and from IGI Airport Delhi (T3/T1) and Noida International Airport with flight tracking and guaranteed clean vehicles.
            </p>
            <div className="pt-2">
              <Link
                href="/airport-transfers"
                className="inline-block bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-3 rounded-xl transition-colors"
              >
                View Airport Transfer Rates →
              </Link>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-[#1e1b4b] border-b border-slate-100 pb-2">Top Verified Airport Routes</h3>
            <ul className="space-y-3 text-xs text-slate-700 font-medium">
              <li className="flex justify-between items-center">
                <span>IGI Airport T3 ↔ Gurgaon Cyber City</span>
                <span className="text-[#059669] font-bold">Fixed Zone Rate</span>
              </li>
              <li className="flex justify-between items-center">
                <span>IGI Airport T3 ↔ Noida Sector 62</span>
                <span className="text-[#059669] font-bold">Fixed Zone Rate</span>
              </li>
              <li className="flex justify-between items-center">
                <span>IGI Airport T3 ↔ Greater Noida</span>
                <span className="text-[#059669] font-bold">Fixed Zone Rate</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6B. OUTSTATION TOUR PACKAGES (CONSOLIDATED FROM SOURCE PROJECTS) */}
      <section id="tour-packages" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100">
        <div className="text-center space-y-2 mb-10">
          <span className="inline-block px-3 py-1 rounded-full bg-[#059669]/10 text-[#059669] border border-[#059669]/20 text-xs font-bold">
            Curated Sightseeing & Hill Station Circuits
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[#1e1b4b] tracking-tight">
            Popular Multi-Day Outstation Tour Cabs
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto font-medium">
            Explore top North India tour circuits with dedicated chauffeur-driven sedans, SUVs, and Tempo Travellers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
              Uttarakhand Kumaon Circuit (3 Nights / 4 Days)
            </span>
            <h3 className="text-lg font-black text-[#1e1b4b]">Nainital, Bhimtal & Kainchi Dham</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Delhi ↔ Kathgodam ↔ Nainital ↔ Kainchi Dham ↔ Sattal ↔ Bhimtal tour package with complete local sightseeing.
            </p>
            <div className="pt-2 flex justify-between items-center text-xs">
              <span className="text-[#059669] font-bold">Starting ₹12,499</span>
              <a
                href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis%2C%20I%20want%20to%20inquire%20about%20the%20Nainital%20Bhimtal%20Kainchi%20Dham%20Tour%20Package.`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#059669] hover:bg-[#047857] text-white font-bold px-3.5 py-2 rounded-xl"
              >
                Inquire Tour
              </a>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-md bg-emerald-50 text-[#059669] border border-emerald-100">
              Char Dham / Spiritual Express (2 Nights / 3 Days)
            </span>
            <h3 className="text-lg font-black text-[#1e1b4b]">Haridwar & Rishikesh Ganga Aarti</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Delhi ↔ Haridwar Har Ki Pauri ↔ Rishikesh Ram Jhula & Parmarth Niketan Ganga Aarti spiritual tour package.
            </p>
            <div className="pt-2 flex justify-between items-center text-xs">
              <span className="text-[#059669] font-bold">Starting ₹7,999</span>
              <a
                href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis%2C%20I%20want%20to%20inquire%20about%20the%20Haridwar%20Rishikesh%20Tour%20Package.`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#059669] hover:bg-[#047857] text-white font-bold px-3.5 py-2 rounded-xl"
              >
                Inquire Tour
              </a>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-100">
              Golden Triangle Circuit (2 Nights / 3 Days)
            </span>
            <h3 className="text-lg font-black text-[#1e1b4b]">Delhi ↔ Agra Taj Mahal ↔ Jaipur</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Complete heritage circuit covering Taj Mahal Agra, Fatehpur Sikri, Amber Fort Jaipur, and Hawa Mahal.
            </p>
            <div className="pt-2 flex justify-between items-center text-xs">
              <span className="text-[#059669] font-bold">Starting ₹9,999</span>
              <a
                href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis%2C%20I%20want%20to%20inquire%20about%20the%20Golden%20Triangle%20Tour%20Package.`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#059669] hover:bg-[#047857] text-white font-bold px-3.5 py-2 rounded-xl"
              >
                Inquire Tour
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 7. LOCAL RENTALS SECTION */}
      <section id="local-rentals" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Local Hourly Rental Packages
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Flexible hourly packages for city shopping, business travel, and local errands.
            </p>
          </div>
          <Link
            href="/local-rentals"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 rounded-lg"
          >
            View All Packages →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {localPackages?.slice(0, 3).map((pkg) => (
            <div key={pkg.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {pkg.package_name || `${pkg.included_hours}h / ${pkg.included_km}km`}
              </span>
              <h3 className="text-lg font-bold text-white">
                {pkg.included_hours} Hours ({pkg.included_km} KM Included)
              </h3>
              <p className="text-xs text-slate-400">
                Extra KM: ₹{pkg.extra_km_rate}/km | Extra Hour: ₹{pkg.extra_hour_rate}/hr
              </p>
              <div className="pt-2">
                <a
                  href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis%2C%20I%20want%20to%20book%20a%20local%20rental%20package%3A%20${pkg.included_hours}H%2F${pkg.included_km}KM`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
                >
                  Book Package
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. WHY CHOOSE URGENT TAXIS */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Why Choose Urgent Taxis?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Transparent policies, verified drivers, and guaranteed outstation vehicles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/20">
              💵
            </div>
            <h3 className="text-base font-bold text-white">Transparent Itemized Pricing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculated using strict per-KM rates and daily minimums. Clearly itemized base fare, distance charges, and driver allowance.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-lg border border-blue-500/20">
              🛡️
            </div>
            <h3 className="text-base font-bold text-white">Verified Fleet & Drivers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Well-maintained sedans and SUVs driven by experienced chauffeurs trained for highway navigation and safety.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/20">
              📲
            </div>
            <h3 className="text-base font-bold text-white">Instant Booking Assistance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instant phone and WhatsApp support for quick outstation trip confirmation and vehicle assignment.
            </p>
          </div>
        </div>
      </section>

      {/* 9. VISIBLE FAQS SECTION */}
      <section id="faq" className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-900">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Clear answers regarding outstation fares, toll inclusions, and driver allowances.
          </p>
        </div>

        <div className="space-y-4 text-xs">
          {visibleFaqs.map((faq, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
              <h3 className="text-sm font-bold text-white">{faq.question}</h3>
              <p className="text-slate-400 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 10. FINAL CONVERSION CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-slate-900 text-center">
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to Book Your Outstation Cab?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Get an instant fare quotation or connect with our support desk for custom trip requirements.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
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
    </>
  );
}
