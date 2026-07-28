import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';

export const metadata = constructMetadata({
  title: 'Customer Reviews & Rating | Urgent Taxis',
  description: 'Read genuine customer reviews, ratings, and feedback for outstation cab bookings, airport transfers, and local rentals with Urgent Taxis.',
  canonicalPath: '/reviews',
});

const reviewsData = [
  {
    name: 'Rajesh Sharma',
    city: 'Delhi',
    route: 'Delhi to Haldwani',
    rating: 5,
    date: 'July 2026',
    comment: 'Booked an Ertiga for family travel from Delhi to Haldwani. The vehicle arrived 15 mins before time in clean condition. Transparent toll pricing and polite driver!',
  },
  {
    name: 'Ananya Verma',
    city: 'Noida',
    route: 'IGI Airport T3 Transfer',
    rating: 5,
    date: 'July 2026',
    comment: 'Punctual 4:00 AM pickup for my flight at Delhi T3. Clean Dzire sedan and zero surge pricing drama. Highly recommended!',
  },
  {
    name: 'Vikas Agarwal',
    city: 'Gurgaon',
    route: 'Delhi to Nainital & Bhimtal Tour',
    rating: 5,
    date: 'June 2026',
    comment: 'Took a 4-day Kumaon hill trip. Driver was expert in mountain driving and knew all the local sightseeing spots around Kainchi Dham. Excellent service!',
  },
  {
    name: 'Siddharth Patel',
    city: 'Ghaziabad',
    route: 'Local Hourly Rental (8h/80km)',
    rating: 5,
    date: 'June 2026',
    comment: 'Used local rental for client meetings across Delhi NCR. Flexible billing and very smooth experience.',
  },
];

export default function ReviewsPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Customer Reviews' },
  ];

  return (
    <div className="pb-16 bg-white text-slate-900">
      <PublicBreadcrumbs items={breadcrumbItems} />

      {/* Header Banner */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-3">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#059669]/10 text-[#059669] border border-[#059669]/20 text-xs font-bold">
          Verified Passenger Feedback
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[#1e1b4b] tracking-tight">
          Customer Reviews & Testimonials
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed font-medium">
          See what our passengers say about our outstation cabs, verified highway drivers, and doorstep airport transfers.
        </p>
      </section>

      {/* Reviews Grid */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviewsData.map((rev, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-[#1e1b4b]">{rev.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{rev.city} • <span className="text-[#059669] font-bold">{rev.route}</span></p>
                </div>
                <div className="flex text-amber-400 text-sm">
                  {'★'.repeat(rev.rating)}
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
                &ldquo;{rev.comment}&rdquo;
              </p>

              <span className="text-[10px] text-slate-400 font-bold block text-right">{rev.date}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center bg-slate-50 border border-slate-200 p-8 rounded-3xl max-w-xl mx-auto space-y-3">
          <h3 className="text-lg font-black text-[#1e1b4b]">Had a Great Trip with Urgent Taxis?</h3>
          <p className="text-xs text-slate-600 font-medium">Share your trip feedback or book your next outstation cab directly on WhatsApp.</p>
          <a
            href={SITE_CONFIG.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors shadow-sm"
          >
            💬 Share Feedback / Book Cab
          </a>
        </div>
      </section>
    </div>
  );
}
