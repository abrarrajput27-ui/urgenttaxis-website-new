import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { BLOG_ARTICLES, BlogArticle } from '@/lib/data/blog-data';
import { BUSINESS_CONFIG } from '@/lib/config';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';
import PageFAQSection from '@/components/public/PageFAQSection';
import { Calendar, Clock, User, ArrowRight, Phone, MessageSquare, Tag, Bookmark } from 'lucide-react';

export const revalidate = 3600; // Static Edge Caching with 1-Hour ISR (TTFB < 50ms)

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(BLOG_ARTICLES).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = BLOG_ARTICLES[slug];
  if (!article) return {};

  const canonicalUrl = `${BUSINESS_CONFIG.canonicalDomain}/blog/${article.slug}`;

  return {
    title: article.metaTitle,
    description: article.metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      url: canonicalUrl,
      siteName: BUSINESS_CONFIG.brandName,
      locale: 'en_IN',
      type: 'article',
      publishedTime: article.publishedDate,
      modifiedTime: article.modifiedDate,
      authors: [article.author],
      tags: article.tags,
      images: [
        {
          url: `${BUSINESS_CONFIG.canonicalDomain}${article.image || '/logo.jpg'}`,
          width: 1200,
          height: 630,
          alt: `${article.title} - Urgent Taxis`,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: article.metaTitle,
      description: article.metaDescription,
      images: [`${BUSINESS_CONFIG.canonicalDomain}/logo.jpg`],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const article: BlogArticle | undefined = BLOG_ARTICLES[slug];

  if (!article) {
    notFound();
  }

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Travel Blog', href: '/blog' },
    { label: article.title },
  ];

  // Schema Markup
  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.metaDescription,
    datePublished: article.publishedDate,
    dateModified: article.modifiedDate,
    author: {
      '@type': 'Organization',
      name: article.author,
      url: BUSINESS_CONFIG.canonicalDomain,
    },
    publisher: {
      '@type': 'Organization',
      name: BUSINESS_CONFIG.brandName,
      logo: {
        '@type': 'ImageObject',
        url: `${BUSINESS_CONFIG.canonicalDomain}${BUSINESS_CONFIG.logoUrl}`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BUSINESS_CONFIG.canonicalDomain}/blog/${article.slug}`,
    },
    keywords: article.tags.join(', '),
  };


  const whatsappShareUrl = `https://wa.me/${BUSINESS_CONFIG.phone.whatsappRaw}?text=${encodeURIComponent(
    `Hello Urgent Taxis, I read your article "${article.title}". I would like to enquire about cabs for this route.`
  )}`;

  const otherArticles = Object.values(BLOG_ARTICLES)
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-slate-200">
        <PublicBreadcrumbs items={breadcrumbs} />
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Category & Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mb-4">
          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold uppercase tracking-wider">
            {article.category}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(article.publishedDate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {article.readingTimeMins} min read
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            {article.author}
          </span>
        </div>

        {/* Article H1 */}
        <h1 className="text-2xl sm:text-4xl font-black text-brand-blue tracking-tight leading-tight mb-6">
          {article.title}
        </h1>

        {/* Excerpt Lead */}
        <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-medium pb-8 border-b border-slate-200 italic">
          &ldquo;{article.excerpt}&rdquo;
        </p>

        {/* Featured Image */}
        <div className="my-8 relative w-full h-64 sm:h-80 md:h-[420px] rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-slate-100">
          <Image
            src={article.image || '/destinations/delhi.webp'}
            alt={article.imageAlt || article.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 896px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-4 left-4 right-4 text-white text-xs sm:text-sm font-semibold drop-shadow-md flex items-center justify-between">
            <span>📍 {article.imageAlt || article.title}</span>
            <span className="hidden sm:inline-block bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-xs">Verified Highway Guide</span>
          </div>
        </div>

        {/* Content Sections */}
        <div className="py-8 space-y-10 text-slate-700 leading-relaxed">
          {article.content.map((sec, idx) => (
            <section key={idx} className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-brand-blue tracking-tight">
                {sec.heading}
              </h2>
              {sec.paragraphs.map((p, pIdx) => (
                <p key={pIdx} className="text-sm sm:text-base text-slate-700 leading-relaxed">
                  {p}
                </p>
              ))}

              {sec.subsections && sec.subsections.length > 0 && (
                <div className="mt-4 space-y-4 pl-4 border-l-2 border-slate-200">
                  {sec.subsections.map((sub, sIdx) => (
                    <div key={sIdx} className="space-y-2">
                      <h3 className="text-base font-bold text-slate-100">
                        {sub.title}
                      </h3>
                      {sub.body.map((b, bIdx) => (
                        <p key={bIdx} className="text-xs sm:text-sm text-slate-600">
                          {b}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Related Routes */}
        {article.relatedRoutes && article.relatedRoutes.length > 0 && (
          <div className="my-8 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-emerald-400" />
              Related Routes & Fares
            </h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {article.relatedRoutes.map((rt, rIdx) => (
                <Link
                  key={rIdx}
                  href={rt.href}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 text-xs font-semibold transition-colors"
                >
                  <span>{rt.label}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* FAQs */}

        {article.faqs && article.faqs.length > 0 && (

          <PageFAQSection

            faqs={article.faqs}

            twoColumnLayout={true}

            className="my-10"

            includeSchema={true}

          />

        )}



        {/* Tags */}
        <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <Tag className="w-3.5 h-3.5" />
          <span className="font-semibold text-slate-700">Tags:</span>
          {article.tags.map((tag) => (
            <span key={tag} className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-700">
              #{tag}
            </span>
          ))}
        </div>

        {/* Action Banner */}
        <div className="my-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#1e1b4b] via-slate-900 to-[#1e1b4b] border border-blue-900/60 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-black text-white">Planning this trip?</h3>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Book a verified AC cab with doorstep pickup from Ghaziabad & Delhi NCR. Transparent per-km rates with 30% advance deposit.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/routes"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#1e1b4b] hover:bg-slate-100 font-black text-xs transition-colors shadow-sm"
            >
              <span>Explore Routes</span>
            </Link>
            <a
              href={`tel:${BUSINESS_CONFIG.phone.primaryRaw}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-black text-xs transition-colors shadow-sm"
            >
              <Phone className="w-4 h-4" />
              <span>Call Now</span>
            </a>
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-black text-xs transition-colors shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Related Articles */}
        <div className="pt-8 border-t border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-brand-blue">More Guides from Our Travel Desk</h3>
            <Link href="/blog" className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
              <span>View All Articles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {otherArticles.map((rel) => (
              <Link
                key={rel.slug}
                href={`/blog/${rel.slug}`}
                className="p-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-500/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-600 block mb-1">
                    {rel.category}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-brand-blue group-hover:text-blue-400 transition-colors line-clamp-2">
                    {rel.title}
                  </h4>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{rel.readingTimeMins} min read</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
