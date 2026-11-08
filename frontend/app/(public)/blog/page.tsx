import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { BLOG_ARTICLES } from '@/lib/data/blog-data';
import { BUSINESS_CONFIG } from '@/lib/config';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';
import { Clock, ArrowRight, BookOpen, Compass, Calendar } from 'lucide-react';

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
    <div className="pb-16 bg-slate-50 text-slate-900 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <div className="bg-white border-b border-slate-200">
        <PublicBreadcrumbs items={breadcrumbItems} />
      </div>

      {/* 1. UPGRADED HERO SECTION */}
      <section className="relative bg-[#0a1128] text-white py-14 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold shadow-xs">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Highway Travel Guides &amp; Fare Advice</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
            Urgent Taxis <span className="text-brand-green">Travel &amp; Highway Blog</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed font-medium">
            Expert highway guides, expressway route reviews, toll calculators, and taxi fare insights from our experienced transport team in Ghaziabad.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs sm:text-sm font-semibold text-blue-200">
            <span className="bg-white/10 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/15">
              🏔️ Hill Station Road Trips
            </span>
            <span>•</span>
            <span className="bg-white/10 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/15">
              🛣️ Toll &amp; Expressway Guides
            </span>
            <span>•</span>
            <span className="bg-white/10 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/15">
              🛕 Pilgrimage Itineraries
            </span>
          </div>
        </div>
      </section>

      {/* 2. BLOG CARDS GRID WITH AUTHENTIC IMAGES */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((blog) => (
            <article
              key={blog.slug}
              className="bg-white border border-slate-200/90 shadow-sm rounded-3xl overflow-hidden flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 hover:border-blue-300 transition-all duration-300 group"
            >
              <div>
                {/* Authentic Destination WebP Image */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                  <Image
                    src={blog.image || '/destinations/delhi.webp'}
                    alt={blog.imageAlt || blog.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Category Pill Floating */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-white border border-white/20 text-[11px] font-bold uppercase tracking-wider shadow-sm">
                      {blog.category}
                    </span>
                  </div>
                  {/* Reading Time Floating */}
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium flex items-center gap-1 shadow-sm">
                      <Clock className="w-3 h-3" />
                      {blog.readingTimeMins} min read
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <Link href={`/blog/${blog.slug}`}>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-brand-blue transition-colors leading-snug">
                      {blog.title}
                    </h2>
                  </Link>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 font-normal">
                    {blog.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(blog.publishedDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <Link
                  href={`/blog/${blog.slug}`}
                  className="font-bold text-brand-blue group-hover:text-brand-green flex items-center gap-1.5 transition-colors"
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
