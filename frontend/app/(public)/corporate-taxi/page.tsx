import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';

export const metadata = constructMetadata({
  title: 'Corporate Taxi Services | Urgent Taxis',
  description: 'Reliable corporate travel solutions, employee transportation, and business meeting cabs with Urgent Taxis. Monthly billing and corporate accounts available.',
  canonicalPath: '/corporate-taxi',
});

export default function CorporateTaxiPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Corporate Taxi' },
  ];

  return (
    <div className="pb-16 bg-slate-50 min-h-screen text-slate-900">
      <div className="bg-white border-b border-slate-100">
        <PublicBreadcrumbs items={breadcrumbItems} />
      </div>

      <section className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 text-xs font-bold shadow-sm">
          B2B Travel Solutions
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-brand-blue tracking-tight">
          Corporate Taxi Services
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          Professional transportation for executives, employees, and corporate events with dedicated account management.
        </p>
      </section>

      <section className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-2xl font-black text-brand-blue">Why Choose Our Corporate Cabs?</h2>
          <ul className="space-y-4 text-sm text-slate-600 font-medium pt-4">
            <li className="flex gap-3"><span className="text-brand-green">✓</span> Priority booking and dedicated support desk</li>
            <li className="flex gap-3"><span className="text-brand-green">✓</span> Post-paid monthly invoicing and customized billing</li>
            <li className="flex gap-3"><span className="text-brand-green">✓</span> Verified, well-groomed chauffeurs for VIP transfers</li>
            <li className="flex gap-3"><span className="text-brand-green">✓</span> Extensive fleet from Sedans to Premium SUVs</li>
            <li className="flex gap-3"><span className="text-brand-green">✓</span> GPS tracked vehicles for employee safety</li>
          </ul>
        </div>

        <div className="bg-brand-blue text-white p-8 rounded-3xl space-y-6 shadow-md relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -z-10"></div>
          <h2 className="text-2xl font-black relative z-10">Open a Corporate Account</h2>
          <p className="text-sm text-blue-100 font-medium relative z-10 leading-relaxed">
            Streamline your company's travel expenses and ensure top-tier comfort for your team. Contact our corporate sales team today to discuss tailored packages.
          </p>
          <div className="pt-4 relative z-10">
            <a
              href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20am%20interested%20in%20setting%20up%20a%20*Corporate%20Account*.%20%F0%9F%8F%A2`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-brand-green hover:bg-brand-green-hover text-white font-black text-sm px-8 py-4 rounded-xl transition-all shadow-lg"
            >
              Enquire on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
