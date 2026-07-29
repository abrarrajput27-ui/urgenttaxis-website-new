import { constructMetadata } from '@/lib/seo';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';

export const metadata = constructMetadata({
  title: 'Terms and Conditions | Urgent Taxis',
  description: 'Read the terms and conditions for booking outstation cabs and taxi services with Urgent Taxis.',
  canonicalPath: '/terms',
});

export default function TermsPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Terms and Conditions' },
  ];

  return (
    <div className="pb-16 bg-slate-50 min-h-screen text-slate-900">
      <div className="bg-white border-b border-slate-100">
        <PublicBreadcrumbs items={breadcrumbItems} />
      </div>

      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black text-brand-blue tracking-tight mb-8">
          Terms and Conditions
        </h1>
        
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed font-medium">
          <p>
            Welcome to Urgent Taxis. By using our website and booking our cab services, you agree to comply with and be bound by the following terms and conditions of use.
          </p>

          <h2 className="text-lg font-black text-slate-900 mt-6">1. Booking & Payments</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>A minimum token advance (e.g., 25%) may be required to confirm your booking and assign a driver.</li>
            <li>The remaining balance must be paid directly to the driver or via the company payment links during the journey.</li>
            <li>Toll taxes, state border taxes, and parking fees are generally excluded from the base fare unless explicitly mentioned in your itemized quotation.</li>
          </ul>

          <h2 className="text-lg font-black text-slate-900 mt-6">2. Passenger Responsibilities</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Passengers must carry a valid government-issued ID (e.g., Aadhaar, PAN) during the journey, especially for interstate travel.</li>
            <li>Any damage caused to the vehicle by the passenger will be liable for penalty.</li>
            <li>Illegal substances and consumption of alcohol inside the cab are strictly prohibited.</li>
          </ul>

          <h2 className="text-lg font-black text-slate-900 mt-6">3. Operational Delays</h2>
          <p>
            Urgent Taxis acts as a facilitator for transport services. While we strive to maintain strict punctuality, we are not liable for delays caused by circumstances beyond our control (e.g., severe traffic, vehicle breakdown, natural calamities, or roadblocks).
          </p>
          
          <p className="mt-8 text-xs text-slate-500">
            Last updated: July 2026. These terms are subject to change without prior notice.
          </p>
        </div>
      </section>
    </div>
  );
}
