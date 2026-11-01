import { Metadata } from 'next';
import Link from 'next/link';
import { BLOG_ARTICLES } from '@/lib/data/blog-data';
import { BUSINESS_CONFIG } from '@/lib/config';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';
import { Clock, ArrowRight, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Travel Blog & Highway Guides | Urgent Taxis',
  description: 'Expert outstation road trip guides, expressway updates, toll breakdowns, and taxi fare tips across Ghaziabad, Delhi NCR, Uttarakhand, and North India.',
  alternates: {
    canonical: `${BUSINESS_CONFIG.canonicalDomain}/blog`,
  },
  openGraph: {
    title: 'Travel Blog & Highway Guides | Urgent Taxis',
    description: 'Expert outstation road trip guides, expressway updates, toll breakdowns, and taxi fare tips across Ghaziabad, Delhi NCR, Uttarakhand, and North India.',
    url: `${BUSINESS_CONFIG.canonicalDomain}/blog`,
    siteName: BUSINESS_CONFIG.brandName,
    locale: 'en_IN',
    type: 'website',
  },
};

export default function BlogListPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Travel Blog' },
  ];

  const articles = Object.values(BLOG_ARTICLES);

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Urgent Taxis Travel Guides and Highway Articles',
    description: 'Comprehensive road trip guides and taxi advice for North India.',
    itemListElement: articles.map((art, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: art.title,
      url: `${BUSINESS_CONFIG.canonicalDomain}/blog/${art.slug}`,
    })),
  };

  return (
    <div className="pb-16 bg-slate-50 text-slate-900 min-h-screen text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <div className="bg-white border-b border-slate-200">
        <PublicBreadcrumbs items={breadcrumbItems} />
      </div>

      {/* Header Banner */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold">
          <BookOpen className="w-4 h-4" />
          Highway Guides & Fare Advice
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-brand-blue tracking-tight">
          Urgent Taxis Travel & Highway Blog
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed">
          Expert highway guides, expressway route reviews, toll calculators, and taxi fare insights from our experienced transport team in Ghaziabad.
        </p>
      </section>

      {/* Blog Cards Grid */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((blog) => (
            <article
              key={blog.slug}
              className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col justify-between space-y-5 hover:border-blue-500/50 hover:bg-slate-850 transition-all duration-200 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-300 text-blue-400 font-semibold uppercase tracking-wider text-[10px]">
                    {blog.category}
                  </span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3" />
                    {blog.readingTimeMins} min read
                  </span>
                </div>

                <Link href={`/blog/${blog.slug}`}>
                  <h2 className="text-base sm:text-lg font-bold text-brand-blue group-hover:text-blue-400 transition-colors leading-snug">
                    {blog.title}
                  </h2>
                </Link>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                  {blog.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  {new Date(blog.publishedDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <Link
                  href={`/blog/${blog.slug}`}
                  className="font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                >
                  <span>Read Guide</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
