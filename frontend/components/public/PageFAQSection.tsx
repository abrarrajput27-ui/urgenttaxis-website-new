import React from 'react';
import { FAQItem } from '@/lib/faqs/faq-generator';
import Script from 'next/script';

interface PageFAQSectionProps {
  faqs: FAQItem[];
  title?: string;
  subtitle?: string;
  includeSchema?: boolean;
  className?: string;
}

export default function PageFAQSection({
  faqs,
  title = 'Frequently Asked Questions',
  subtitle,
  includeSchema = true,
  className = '',
}: PageFAQSectionProps) {
  if (!faqs || faqs.length === 0) return null;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <section className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 ${className}`}>
      {includeSchema && (
        <Script
          id={`faq-schema-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 font-medium">
            {subtitle}
          </p>
        )}
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <details
            key={index}
            className="group rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-slate-300 open:bg-slate-50/70"
          >
            <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900 text-sm sm:text-base list-none">
              <span>{faq.question}</span>
              <span className="ml-4 flex-shrink-0 text-brand-blue font-bold text-lg transition-transform duration-200 group-open:rotate-180">
                ▾
              </span>
            </summary>
            <div className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium border-t border-slate-200/60 pt-3">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
