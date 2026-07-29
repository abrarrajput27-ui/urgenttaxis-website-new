import { constructMetadata } from '@/lib/seo';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';

export const metadata = constructMetadata({
  title: 'Cancellation & Refund Policy | Urgent Taxis',
  description: 'Cancellation and refund guidelines for outstation taxi bookings with Urgent Taxis.',
  canonicalPath: '/cancellation',
});

export default function CancellationPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Cancellation Policy' },
  ];

  return (
    <div className="pb-16 bg-slate-50 min-h-screen text-slate-900">
      <div className="bg-white border-b border-slate-100">
        <PublicBreadcrumbs items={breadcrumbItems} />
      </div>

      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black text-brand-blue tracking-tight mb-8">
          Cancellation & Refund Policy
        </h1>
        
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed font-medium">
          <p>
            We understand that travel plans can change. Urgent Taxis aims to provide a transparent cancellation process for our passengers.
          </p>

          <h2 className="text-lg font-black text-slate-900 mt-6">1. Cancellation by Passenger</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>More than 24 hours before pickup:</strong> Full refund of token amount (if applicable), minus nominal payment gateway processing fees.</li>
            <li><strong>Within 12-24 hours before pickup:</strong> A cancellation fee equivalent to a percentage of the booking amount or token fee may be deducted to compensate the blocked driver.</li>
            <li><strong>Last-minute / No-show (Less than 12 hours):</strong> Token advance is generally non-refundable as the vehicle has already been dispatched or blocked for your trip.</li>
          </ul>

          <h2 className="text-lg font-black text-slate-900 mt-6">2. Cancellation by Urgent Taxis</h2>
          <p>
            In the rare event that we are unable to fulfill your booking due to vehicle breakdown, extreme weather, or unavailability, we will attempt to provide a replacement vehicle. If unsuccessful, we will issue a 100% refund of any advance paid.
          </p>

          <h2 className="text-lg font-black text-slate-900 mt-6">3. Refund Processing</h2>
          <p>
            Approved refunds will be processed back to the original mode of payment within 5-7 business days.
          </p>
          
          <p className="mt-8 text-xs text-slate-500">
            Last updated: July 2026
          </p>
        </div>
      </section>
    </div>
  );
}
