import Link from 'next/link';
import { CUSTOMER_REVIEWS, REVIEWS_OVERALL_STATS } from '@/lib/data/reviews-data';
import { FaStar, FaGoogle, FaCheckCircle, FaRoute, FaCar, FaArrowRight } from 'react-icons/fa';

export default function HomepageReviewsSection() {
  // Select 4 most prominent, diverse reviews for homepage
  const featuredReviews = CUSTOMER_REVIEWS.slice(0, 4);

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-brand-blue text-xs font-bold">
              <FaGoogle className="text-red-500" />
              <span>Google Verified Customer Reviews • 4.9★ Rating</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Trusted by 15,000+ North India Travelers
            </h2>
            <p className="text-sm text-slate-500 font-medium max-w-xl">
              Real stories from families, business riders, and pilgrims who choose Urgent Taxis for reliable, transparent outstation travel.
            </p>
          </div>

          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-brand-blue hover:text-brand-green transition-colors border border-slate-200 bg-slate-50 hover:bg-white px-5 py-2.5 rounded-xl shadow-xs self-start md:self-auto"
          >
            <span>Read All {REVIEWS_OVERALL_STATS.totalReviewsCount} Reviews</span>
            <FaArrowRight className="text-xs" />
          </Link>
        </div>

        {/* 4 Featured Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between hover:bg-white hover:border-blue-400/50 hover:shadow-md transition-all duration-300 space-y-4 group"
            >
              <div className="space-y-3">
                {/* Header: Avatar, Name & Google */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-full ${rev.avatarBg} text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-xs`}
                    >
                      {rev.initials}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 group-hover:text-brand-blue transition-colors">
                        {rev.name}
                      </h3>
                      <p className="text-[10px] text-slate-400">{rev.date}</p>
                    </div>
                  </div>
                  <FaGoogle className="text-red-500 text-xs flex-shrink-0" />
                </div>

                {/* Stars & Verified */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-amber-400 gap-0.5 text-xs">
                    {[...Array(rev.rating)].map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/50">
                    <FaCheckCircle className="text-[8px]" /> Verified
                  </span>
                </div>

                {/* Route */}
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-white px-2 py-1 rounded-lg border border-slate-200/70 w-full truncate">
                  <FaRoute className="text-brand-green text-[10px] flex-shrink-0" />
                  <span className="truncate">{rev.route}</span>
                </div>

                {/* Review Text */}
                <p className="text-xs text-slate-600 leading-relaxed font-normal line-clamp-4">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              {/* Vehicle & Highlight */}
              <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span className="flex items-center gap-1 text-slate-700 font-semibold">
                  <FaCar className="text-brand-blue text-[10px]" />
                  {rev.vehicle}
                </span>
                <span className="text-emerald-800 font-bold">5.0★</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-emerald-50 to-blue-50 border border-blue-100/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <p className="text-xs font-bold text-slate-900">
                100% Commercial Yellow-Plate Fleet • Verified Highway Chauffeurs
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Zero surge pricing. Fixed per-KM transparent matrix. 24/7 Masuri Ghaziabad dispatch desk.
              </p>
            </div>
          </div>

          <Link
            href="/reviews"
            className="px-4 py-2 rounded-xl bg-brand-blue hover:bg-blue-900 text-white font-bold text-xs shadow-sm transition-all whitespace-nowrap"
          >
            Explore Customer Stories →
          </Link>
        </div>
      </div>
    </section>
  );
}
