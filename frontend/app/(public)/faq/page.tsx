import React from 'react';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';
import { FaPhoneAlt, FaWhatsapp, FaQuestionCircle, FaShieldAlt } from 'react-icons/fa';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { BUSINESS_CONFIG } from '@/lib/config';

export const metadata = constructMetadata({
  title: 'Frequently Asked Questions & Taxi Booking Help',
  description: 'Common questions about outstation taxi fares, toll inclusions, IGI airport pickups, driver allowances, and cancellation policies at Urgent Taxis.',
  canonicalPath: '/faq',
});

const FAQ_CATEGORIES = [
  {
    category: 'Outstation Cab Booking & Pricing',
    faqs: [
      {
        q: 'How are One-Way outstation taxi fares calculated?',
        a: 'One-Way drops are priced transparently based on the actual highway distance between your pickup and drop addresses. The fare includes the vehicle, fuel, and driver charges. Highway tolls and interstate entry taxes are itemized clearly on your quotation.',
      },
      {
        q: 'How does the Round-Trip daily minimum billing work?',
        a: 'All round-trip outstation journeys carry an industry-standard minimum of 250 km per calendar day. If your total travel exceeds the minimum threshold, extra distance is billed at the standard category per-km rate (e.g., ₹11/km for Sedan, ₹15/km for SUV).',
      },
      {
        q: 'Are toll taxes and state border taxes included in the fare?',
        a: 'Tolls, state passenger taxes, and parking fees are paid at actuals at physical booths, unless your quotation explicitly states an all-inclusive rate. This ensures you only pay for the exact route taken.',
      },
      {
        q: 'What is the Driver Night Allowance charge?',
        a: `A night driver allowance of ₹${BUSINESS_CONFIG.policies.driverNightAllowance.amount} applies when the vehicle is driven between ${BUSINESS_CONFIG.policies.driverNightAllowance.startTime} and ${BUSINESS_CONFIG.policies.driverNightAllowance.endTime}.`,
      },
      {
        q: 'Ghaziabad se Haridwar taxi kitne ka padega? (Fare estimate)',
        a: 'Ghaziabad to Haridwar one-way taxi fare typically starts from ₹3,499 for a comfortable AC Sedan (Maruti Dzire/Etios) and ₹4,699 for an Ertiga SUV. Final pricing depends on exact pickup locality and seasonal toll plaza rates.',
      },
    ],
  },
  {
    category: 'Airport Transfers (IGI Delhi & Regional)',
    faqs: [
      {
        q: 'How does doorstep pickup work for Delhi IGI Airport?',
        a: 'Our chauffeur coordinates with you and arrives promptly at your Ghaziabad, Noida, or Delhi NCR address for your scheduled pickup time. We factor in expressway traffic to ensure you reach Terminal 1, 2, or 3 with plenty of time before check-in.',
      },
      {
        q: 'What if my flight arrives late at Delhi Airport?',
        a: 'We monitor live flight statuses for all airport pickup bookings. If your flight is delayed, our operations team automatically adjusts your driver dispatch time so you are never stranded.',
      },
      {
        q: 'Where will the driver meet me at Delhi Airport Terminal 3?',
        a: 'For T3 domestic and international arrivals, your chauffeur will coordinate with you via call and WhatsApp to pick you up from the dedicated multi-level passenger pickup bays.',
      },
    ],
  },
  {
    category: 'Vehicles, Drivers & Safety',
    faqs: [
      {
        q: 'Are your vehicles commercial-registered with yellow plates?',
        a: 'Yes. 100% of our fleet operates on commercial commercial-permit (yellow plate) registration with valid fitness certificates, national commercial insurance, and authorized highway permits.',
      },
      {
        q: 'Can I request a specific car model like Dzire or Ertiga?',
        a: 'Yes. You can request preferred vehicle models (e.g., Maruti Dzire, Toyota Etios, Maruti Ertiga, Toyota Innova Crysta). We guarantee the vehicle category and do our utmost to assign your exact preferred model.',
      },
      {
        q: 'Are your chauffeurs trained for hilly terrain (Uttarakhand / Himachal)?',
        a: 'Yes. All drivers assigned to mountain routes (Haridwar, Rishikesh, Dehradun, Mussoorie, Nainital, Shimla, Manali) have extensive experience navigating hill curves, fog, and seasonal ghat conditions.',
      },
    ],
  },
  {
    category: 'Booking, Payments & Cancellation',
    faqs: [
      {
        q: 'How do I confirm my taxi booking with Urgent Taxis?',
        a: `You can confirm your ride in under 2 minutes by calling our dispatch desk directly at ${BUSINESS_CONFIG.phone.display} or messaging us on WhatsApp at ${BUSINESS_CONFIG.phone.whatsapp}.`,
      },
      {
        q: 'What is your cancellation policy?',
        a: 'We offer free cancellation up to 6 hours before scheduled departure. Any advance token deposit is refunded promptly with zero deduction.',
      },
      {
        q: 'What payment modes are accepted?',
        a: 'We accept UPI (Google Pay, PhonePe, Paytm), Net Banking, and cash directly to the chauffeur upon arrival at your destination.',
      },
    ],
  },
];

export default function FAQPage() {
  const allFaqs = FAQ_CATEGORIES.flatMap((c) => c.faqs);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Frequently Asked Questions' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="bg-white border-b border-slate-200">
        <PublicBreadcrumbs items={breadcrumbs} />
      </div>

      {/* Hero Header */}
      <section className="bg-brand-blue text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider border border-white/20">
            Transparent Travel Guidance
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
            Everything you need to know about outstation taxi fares, toll rules, airport pickups, driver allowances, and booking policies with Urgent Taxis.
          </p>
        </div>
      </section>

      {/* Main FAQ Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        {FAQ_CATEGORIES.map((cat, catIdx) => (
          <div key={catIdx} className="space-y-6">
            <h2 className="text-2xl font-black text-brand-blue border-b border-slate-200 pb-3 flex items-center gap-2">
              <FaQuestionCircle className="text-brand-green" /> {cat.category}
            </h2>

            <div className="space-y-4">
              {cat.faqs.map((faq, fIdx) => (
                <div
                  key={fIdx}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    {faq.q}
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Still Have Questions CTA */}
        <div className="bg-gradient-to-r from-brand-blue to-blue-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-black">Still have a question?</h3>
            <p className="text-blue-100 text-sm max-w-md">
              Our 24/7 Ghaziabad dispatch team is always available to assist with custom quotes, route advice, or special travel requirements.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <a
              href={`tel:${SITE_CONFIG.phoneRaw}`}
              className="bg-white hover:bg-slate-100 text-brand-blue px-6 py-3 rounded-xl font-bold text-center text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <FaPhoneAlt /> Call Desk 24/7
            </a>
            <a
              href={generateWhatsAppLink(SITE_CONFIG.whatsapp, {
                customMessage: 'Hello Urgent Taxis! 👋\n\nI have a question about booking a cab.',
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-green hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-center text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <FaWhatsapp /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
