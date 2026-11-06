'use client';

import React from 'react';
import { FAQItem } from '@/lib/faqs/faq-generator';
import Script from 'next/script';
import Link from 'next/link';
import { FaChevronDown, FaArrowRight, FaQuestionCircle } from 'react-icons/fa';

interface PageFAQSectionProps {
  faqs: FAQItem[];
  title?: string;
  subtitle?: string;
  includeSchema?: boolean;
  twoColumnLayout?: boolean;
  className?: string;
}

export default function PageFAQSection({
  faqs,
  title = 'Frequently Asked Questions',
  subtitle,
  includeSchema = true,
  twoColumnLayout = true,
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

  const faqIcons = ['🚕', '⏱️', '🚗', '🔄', '🛡️', '🌙'];

  return (
    <section className={`bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6 font-sans ${className}`}>
      {includeSchema && (
        <Script
          id={`faq-schema-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {twoColumnLayout ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Heading, Subtitle & Question Graphic Box */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                Frequently Asked <span className="text-brand-green">Questions</span>
              </h2>
              {subtitle && (
                <p className="mt-2 text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Stylized Question Graphic Box */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-100 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-blue text-white flex items-center justify-center text-3xl shadow-lg shrink-0">
                <FaQuestionCircle className="text-brand-green" />
              </div>
              <div>
                <h4 className="font-black text-sm text-slate-900">Have Questions?</h4>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Our highway reservation desk is available 24/7 for custom bookings and vehicle queries.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Accordion + View All FAQs Link */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex justify-end pb-1">
              <Link
                href="/faq"
                className="text-xs font-black text-brand-blue hover:text-brand-green flex items-center gap-1.5 transition-colors"
              >
                <span>View All FAQs</span>
                <FaArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-slate-300 open:bg-slate-50/60 shadow-2xs"
                >
                  <summary className="flex cursor-pointer items-center justify-between font-bold text-slate-900 text-sm list-none">
                    <span className="flex items-center gap-2.5">
                      <span className="text-sm">{faqIcons[index % faqIcons.length]}</span>
                      <span>{faq.question}</span>
                    </span>
                    <span className="ml-3 flex-shrink-0 text-slate-400 group-hover:text-brand-blue transition-transform duration-200 group-open:rotate-180">
                      <FaChevronDown className="w-3 h-3" />
                    </span>
                  </summary>
                  <div className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium border-t border-slate-200/70 pt-3 pl-6">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Single column fallback */
        <>
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
        </>
      )}
    </section>
  );
}
