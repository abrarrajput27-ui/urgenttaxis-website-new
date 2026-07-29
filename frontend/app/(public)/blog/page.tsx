import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';

export const metadata = constructMetadata({
  title: 'Travel Blog | Urgent Taxis Outstation Guides & Fare Tips',
  description: 'Read outstation travel tips, highway guides, fuel updates, and cab booking advice from the Urgent Taxis editorial team.',
  canonicalPath: '/blog',
});

const sampleBlogs = [
  {
    slug: 'delhi-to-nainital-road-trip-guide',
    title: 'Complete Guide for Delhi to Nainital Road Trip: Distance, Tolls & Best Stops',
    excerpt: 'Planning a road trip from Delhi to Nainital? Discover verified highway routes via Rampur and Haldwani, toll expenses, and scenic stops along the way.',
    date: 'July 15, 2026',
  },
  {
    slug: 'one-way-vs-round-trip-taxi-comparison',
    title: 'One-Way vs Round-Trip Taxi Fares: How to Choose the Most Cost-Effective Cab',
    excerpt: 'Understand when one-way taxi pricing saves you money versus when round-trip daily driver allowances are more practical for outstation travel.',
    date: 'June 28, 2026',
  },
  {
    slug: 'delhi-airport-transfer-tips',
    title: 'Top 5 Tips for Stress-Free IGI Airport T3 Cab Pickups & Drop-offs',
    excerpt: 'How to coordinate late-night airport transfers at Delhi IGI Airport Terminal 3, avoid parking surges, and ensure on-time flight catch.',
    date: 'June 10, 2026',
  },
];

export default function BlogListPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Travel Blog' },
  ];

  return (
    <div className="pb-16 bg-slate-50 min-h-screen text-slate-900">
      <div className="bg-white border-b border-slate-100">
        <PublicBreadcrumbs items={breadcrumbItems} />
      </div>

      {/* Header Banner */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 text-xs font-bold shadow-sm">
          Travel Guides & Highway Advice
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-brand-blue tracking-tight">
          Urgent Taxis Travel Blog
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          Expert travel insights, outstation route breakdowns, fare advice, and North India sightseeing itineraries.
        </p>
      </section>

      {/* Blog Cards Grid */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sampleBlogs.map((blog) => (
            <article
              key={blog.slug}
              className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-between space-y-5 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">{blog.date}</span>
                <h2 className="text-lg font-black text-brand-blue leading-snug hover:text-brand-blue-light transition-colors cursor-pointer">
                  {blog.title}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {blog.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20read%20your%20article%20on%20*${encodeURIComponent(blog.title)}*.%20%F0%9F%93%96`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-brand-green hover:text-brand-green-hover transition-colors flex items-center gap-1"
                >
                  Discuss on WhatsApp →
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
