import { constructMetadata } from '@/lib/seo';
import { BUSINESS_CONFIG } from '@/lib/config';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';
import { ShieldCheck, CheckCircle2, MessageSquare, HeartHandshake, Phone } from 'lucide-react';
import ReviewsViewer from '@/components/public/ReviewsViewer';
import { REVIEWS_OVERALL_STATS, CUSTOMER_REVIEWS } from '@/lib/data/reviews-data';
import { FaGoogle, FaStar } from 'react-icons/fa';
import DirectBookingComparison from '@/components/public/DirectBookingComparison';

export const metadata = constructMetadata({
  title: 'Customer Reviews & Ratings (4.9★ Google Verified) | Urgent Taxis',
  description: 'Read authentic customer reviews & Google ratings for Urgent Taxis outstation cabs, IGI airport transfers, and one-way drops across Ghaziabad, Delhi NCR & North India.',
  canonicalPath: '/reviews',
});

export const revalidate = 3600; // Static Edge Caching with 1-Hour ISR (TTFB < 50ms)

export default function ReviewsPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Customer Reviews & Ratings' },
  ];

  // Schema.org AggregateRating and Review Schema for Rich Snippets
  const reviewsSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: BUSINESS_CONFIG.brandName,
    image: `${BUSINESS_CONFIG.canonicalDomain}/logo.jpg`,
    telephone: BUSINESS_CONFIG.phone.primaryRaw,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${BUSINESS_CONFIG.headOffice.shopNumber}, ${BUSINESS_CONFIG.headOffice.building}, ${BUSINESS_CONFIG.headOffice.street}`,
      addressLocality: `${BUSINESS_CONFIG.headOffice.locality}, ${BUSINESS_CONFIG.headOffice.city}`,
      addressRegion: BUSINESS_CONFIG.headOffice.state,
      postalCode: BUSINESS_CONFIG.headOffice.postalCode,
      addressCountry: BUSINESS_CONFIG.headOffice.country,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: REVIEWS_OVERALL_STATS.averageRating.toString(),
      reviewCount: '1250',
      bestRating: '5',
      worstRating: '1',
    },
    review: CUSTOMER_REVIEWS.slice(0, 5).map((rev) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: rev.name,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: rev.rating.toString(),
        bestRating: '5',
      },
      reviewBody: rev.comment,
    })),
  };

  return (
    <div className="pb-16 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsSchema) }}
      />

      <div className="bg-white border-b border-slate-200">
        <PublicBreadcrumbs items={breadcrumbItems} />
      </div>

      {/* 1. UPGRADED HERO SECTION */}
      <section className="relative bg-[#0a1128] text-white py-14 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold shadow-xs">
            <FaGoogle className="text-red-400 text-xs" />
            <span>Google Verified • 4.9★ Average Rating</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
            Genuine Customer <span className="text-brand-green">Reviews &amp; Ratings</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed font-medium">
            Discover real feedback from families, solo travelers, and corporate riders who rely on Urgent Taxis for safe, punctual, and transparent doorstep taxi service across North India.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs sm:text-sm font-semibold text-blue-200">
            <span className="bg-white/10 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/15 flex items-center gap-1.5">
              <span className="text-amber-400 flex"><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></span>
              <span>4.9 / 5.0 Rating</span>
            </span>
            <span>•</span>
            <span className="bg-white/10 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/15">
              ⭐ 1,250+ Verified Google Reviews
            </span>
            <span>•</span>
            <span className="bg-white/10 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/15">
              🛡️ 100% Commercial Fleet
            </span>
          </div>
        </div>
      </section>

      {/* 2. MAIN REVIEWS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <ReviewsViewer />
      </section>

      {/* 3. COMMITMENT PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <span className="text-xs font-bold text-brand-green uppercase tracking-wider">Quality Assurance</span>
          <h2 className="text-2xl sm:text-3xl font-black text-brand-blue tracking-tight">
            Our 3 Core Service Promises
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-blue border border-blue-100 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-brand-blue mb-2">Verified Highway Drivers</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Every driver undergoes route briefing, background verification, and vehicle safety inspections before being dispatched on outstation journeys.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-brand-green border border-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-brand-blue mb-2">Transparent Upfront Pricing</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Your fare is shared before booking confirmation. The quoted amount may vary with demand, vehicle availability and trip requirements, with complete billing transparency.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-blue border border-blue-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-brand-blue mb-2">Direct Owner Resolution</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              If you ever face an issue during your journey, our fleet supervisor and management desk in Masuri address your concern immediately.
            </p>
          </div>
        </div>
      </section>

      {/* Direct Booking Comparison Section */}
      <DirectBookingComparison />
    </div>
  );
}
