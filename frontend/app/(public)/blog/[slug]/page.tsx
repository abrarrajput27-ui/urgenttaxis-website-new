import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BLOG_ARTICLES, BlogArticle } from '@/lib/data/blog-data';
import { BUSINESS_CONFIG } from '@/lib/config';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';
import { Calendar, Clock, User, ArrowLeft, ArrowRight, Phone, MessageSquare, Tag, Bookmark } from 'lucide-react';

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
          url: `${BUSINESS_CONFIG.canonicalDomain}/logo.jpg`,
          width: 800,
          height: 800,
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

  const faqSchema = article.faqs && article.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  } : null;

  const whatsappShareUrl = `https://wa.me/${BUSINESS_CONFIG.phone.whatsappRaw}?text=${encodeURIComponent(
    `Hello Urgent Taxis, I read your article "${article.title}". I would like to enquire about cabs for this route.`
  )}`;

  const otherArticles = Object.values(BLOG_ARTICLES)
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Breadcrumbs */}
      <div className="bg-slate-900 border-b border-slate-800">
        <PublicBreadcrumbs items={breadcrumbs} />
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Category & Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-4">
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
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-6">
          {article.title}
        </h1>

        {/* Excerpt Lead */}
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-medium pb-8 border-b border-slate-800 italic">
          &ldquo;{article.excerpt}&rdquo;
        </p>

        {/* Content Sections */}
        <div className="py-8 space-y-10 text-slate-300 leading-relaxed">
          {article.content.map((sec, idx) => (
            <section key={idx} className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {sec.heading}
              </h2>
              {sec.paragraphs.map((p, pIdx) => (
                <p key={pIdx} className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {p}
                </p>
              ))}

              {sec.subsections && sec.subsections.length > 0 && (
                <div className="mt-4 space-y-4 pl-4 border-l-2 border-slate-800">
                  {sec.subsections.map((sub, sIdx) => (
                    <div key={sIdx} className="space-y-2">
                      <h3 className="text-base font-bold text-slate-100">
                        {sub.title}
                      </h3>
                      {sub.body.map((b, bIdx) => (
                        <p key={bIdx} className="text-xs sm:text-sm text-slate-400">
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
          <div className="my-8 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
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
          <section className="my-10 p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {article.faqs.map((faq, fIdx) => (
                <details
                  key={fIdx}
                  className="group rounded-xl border border-slate-800 bg-slate-900/80 p-4 transition-all open:border-slate-700"
                >
                  <summary className="flex cursor-pointer items-center justify-between font-semibold text-white text-sm">
                    <span>{faq.question}</span>
                    <span className="ml-4 flex-shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180">
                      ▼
                    </span>
                  </summary>
                  <div className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800 pt-3">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Tags */}
        <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <Tag className="w-3.5 h-3.5" />
          <span className="font-semibold text-slate-300">Tags:</span>
          {article.tags.map((tag) => (
            <span key={tag} className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-300">
              #{tag}
            </span>
          ))}
        </div>

        {/* Action Banner */}
        <div className="my-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-900 via-slate-900 to-slate-900 border border-blue-800/50 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-white">Planning this trip?</h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Get an instant fixed quote for your door-to-door outstation cab.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`tel:${BUSINESS_CONFIG.phone.primaryRaw}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Call Helpline</span>
            </a>
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>

        {/* Related Articles */}
        <div className="pt-8 border-t border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">More Guides from Our Travel Desk</h3>
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
                className="p-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    {rel.category}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                    {rel.title}
                  </h4>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1">
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
