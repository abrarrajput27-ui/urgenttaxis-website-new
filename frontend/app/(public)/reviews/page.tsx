import { constructMetadata } from '@/lib/seo';
import { BUSINESS_CONFIG } from '@/lib/config';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';
import { MessageSquare, Phone, ShieldCheck, HeartHandshake, CheckCircle2 } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Customer Feedback & Service Quality Policy | Urgent Taxis',
  description: 'Read about Urgent Taxis commitment to passenger safety, punctuality, and service quality. Share your feedback directly with our transport management team.',
  canonicalPath: '/reviews',
});

export default function ReviewsPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Customer Reviews & Feedback' },
  ];

  const feedbackWhatsAppUrl = `https://wa.me/${BUSINESS_CONFIG.phone.whatsappRaw}?text=${encodeURIComponent(
    'Hello Urgent Taxis Management, I would like to share feedback regarding my recent trip.'
  )}`;

  return (
    <div className="pb-16 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <div className="bg-white border-b border-slate-200">
        <PublicBreadcrumbs items={breadcrumbItems} />
      </div>

      {/* Header Banner */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 text-xs font-bold shadow-sm">
          <HeartHandshake className="w-4 h-4" />
          Authentic Passenger Experience
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-brand-blue tracking-tight">
          Passenger Feedback & Quality Assurance
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          At Urgent Taxis, we value genuine customer feedback. We do not display synthetic or fabricated ratings. Every ride is tracked by our operations desk in Masuri, Ghaziabad to ensure safety, punctuality, and fair pricing.
        </p>
      </section>

      {/* Commitment Pillars */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue border border-blue-100 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-brand-blue mb-2">Verified Highway Drivers</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Every driver undergoes route briefing, background checks, and vehicle safety inspections before dispatched on outstation routes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-brand-green border border-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-brand-blue mb-2">Zero Surge Pricing</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Unlike algorithmic cab aggregators, our fares are fixed according to our transparent per-km rate matrix. What you are quoted is what you pay.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-brand-blue mb-2">Direct Owner Resolution</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              If you ever face an issue during your journey, our fleet supervisor and management desk address your query immediately.
            </p>
          </div>
        </div>
      </section>

      {/* Share Your Trip Experience Banner */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white border border-slate-200 p-8 sm:p-10 text-center space-y-6 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-black text-brand-blue">
            Recently Traveled with Urgent Taxis?
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed font-medium">
            Your feedback helps us continuously improve our service. Share your ride experience, compliment your driver, or share suggestions directly with our operations team.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
            <a
              href={feedbackWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white font-black text-sm shadow-lg shadow-brand-green/30 transition-transform hover:scale-105"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Share Trip Feedback on WhatsApp</span>
            </a>

            <a
              href={`tel:${BUSINESS_CONFIG.phone.primaryRaw}`}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-sm transition-colors"
            >
              <Phone className="w-4 h-4 text-brand-green" />
              <span>Call Helpline ({BUSINESS_CONFIG.phone.display})</span>
            </a>
          </div>

          <p className="text-xs text-slate-500 pt-4 font-medium">
            * Verified Google Business reviews link will be integrated upon completion of our verified Google Business Profile setup.
          </p>
        </div>
      </section>
    </div>
  );
}
