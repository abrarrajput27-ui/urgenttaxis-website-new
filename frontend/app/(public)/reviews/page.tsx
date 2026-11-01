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
    <div className="pb-16 bg-slate-950 min-h-screen text-slate-100">
      <div className="bg-slate-900 border-b border-slate-800">
        <PublicBreadcrumbs items={breadcrumbItems} />
      </div>

      {/* Header Banner */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
          <HeartHandshake className="w-4 h-4" />
          Authentic Passenger Experience
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Passenger Feedback & Quality Assurance
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          At Urgent Taxis, we value genuine customer feedback. We do not display synthetic or fabricated ratings. Every ride is tracked by our operations desk in Masuri, Ghaziabad to ensure safety, punctuality, and fair pricing.
        </p>
      </section>

      {/* Commitment Pillars */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Verified Highway Drivers</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Every driver undergoes route briefing, background checks, and vehicle safety inspections before dispatched on outstation routes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Zero Surge Pricing</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Unlike algorithmic cab aggregators, our fares are fixed according to our transparent per-km rate matrix. What you are quoted is what you pay.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Direct Owner Resolution</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              If you ever face an issue during your journey, our fleet supervisor and management desk address your query immediately.
            </p>
          </div>
        </div>
      </section>

      {/* Share Your Trip Experience Banner */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 sm:p-10 text-center space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Recently Traveled with Urgent Taxis?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Your feedback helps us continuously improve our service. Share your ride experience, compliment your driver, or share suggestions directly with our operations team.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
            <a
              href={feedbackWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-transform hover:scale-105"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Share Trip Feedback on WhatsApp</span>
            </a>

            <a
              href={`tel:${BUSINESS_CONFIG.phone.primaryRaw}`}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Call Helpline ({BUSINESS_CONFIG.phone.display})</span>
            </a>
          </div>

          <p className="text-xs text-slate-400 pt-4">
            * Verified Google Business reviews link will be integrated upon completion of our verified Google Business Profile setup.
          </p>
        </div>
      </section>
    </div>
  );
}
