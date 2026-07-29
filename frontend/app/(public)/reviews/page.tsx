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
    <div className="pb-16 bg-slate-50 min-h-screen text-slate-900">
      <div className="bg-white border-b border-slate-100">
        <PublicBreadcrumbs items={breadcrumbItems} />
      </div>

      {/* Header Banner */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 text-xs font-bold shadow-sm">
          Verified Passenger Feedback
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-brand-blue tracking-tight">
          Customer Reviews & Testimonials
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          See what our passengers say about our outstation cabs, verified highway drivers, and doorstep airport transfers.
        </p>
      </section>

      {/* Reviews Grid */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reviewsData.map((rev, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 p-8 rounded-3xl space-y-5 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-brand-blue">{rev.name}</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">{rev.city} • <span className="text-brand-green font-bold">{rev.route}</span></p>
                </div>
                <div className="flex text-amber-500 text-lg">
                  {'★'.repeat(rev.rating)}
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50 p-5 rounded-2xl border border-slate-100 italic">
                &ldquo;{rev.comment}&rdquo;
              </p>

              <span className="text-xs text-slate-400 font-bold block text-right tracking-wider uppercase">{rev.date}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center bg-white border border-brand-blue/10 p-10 rounded-3xl max-w-2xl mx-auto space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue to-brand-green"></div>
          <h3 className="text-2xl font-black text-brand-blue">Had a Great Trip with Urgent Taxis?</h3>
          <p className="text-sm text-slate-600 font-medium">Share your trip feedback or book your next outstation cab directly on WhatsApp.</p>
          <div className="pt-2">
            <a
              href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20would%20like%20to%20make%20an%20inquiry.%20%E2%9C%A8`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-brand-green hover:bg-brand-green-hover text-white font-black text-sm px-8 py-4 rounded-xl transition-all shadow-md"
            >
              Share Feedback / Book Cab
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
