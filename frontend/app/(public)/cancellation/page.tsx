import { constructMetadata } from '@/lib/seo';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';

export const metadata = constructMetadata({
  title: 'Cancellation & Refund Policy | Urgent Taxis',
  description: '100% refund on cancellations up to 6 hours before pickup. Transparent cancellation and refund guidelines for Urgent Taxis.',
  canonicalPath: '/cancellation',
});

export const revalidate = 3600; // Static Edge Caching with 1-Hour ISR (TTFB < 50ms)

export default function CancellationPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Cancellation Policy' },
  ];

  return (
    <div className="pb-16 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <div className="bg-white border-b border-slate-100">
        <PublicBreadcrumbs items={breadcrumbItems} />
      </div>

      <section className="py-10 sm:py-14 md:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-8">
          Cancellation & Refund Policy
        </h1>
        
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed font-medium">
          <p>
            We understand that personal and business travel schedules can change unexpectedly. Urgent Taxis provides a clear, passenger-friendly cancellation and refund policy with zero hidden fees.
          </p>

          <h2 className="text-lg font-black text-slate-900 mt-6">1. Cancellation by Passenger</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Up to 6 Hours Before Departure:</strong> 100% full refund of your 30% advance token payment. Zero cancellation penalty.
            </li>
            <li>
              <strong>Within 6 Hours of Departure / Chauffeur En Route:</strong> The advance token is retained to compensate the allocated driver who has already been dispatched to your pickup location.
            </li>
            <li>
              <strong>No-Show at Pickup Address:</strong> If the chauffeur arrives at the specified location and the customer is unreachable after 30 minutes of waiting, the booking is treated as a no-show and the advance token is forfeited.
            </li>
          </ul>

          <h2 className="text-lg font-black text-slate-900 mt-6">2. Cancellation or Delay by Urgent Taxis</h2>
          <p>
            In the rare event of severe vehicle breakdown, extreme road closure, or force majeure where we cannot fulfill your ride, our dispatch team will first attempt to provide a free vehicle upgrade or equivalent replacement. If an alternative vehicle is not acceptable, a 100% immediate refund of all payments will be issued.
          </p>

          <h2 className="text-lg font-black text-slate-900 mt-6">3. Refund Timeline & Processing</h2>
          <p>
            Approved advance token refunds are processed immediately back to the original payment source (UPI, Debit/Credit Card, or Net Banking) and typically credit within 2 to 4 business days depending on your bank.
          </p>
          
          <p className="mt-8 text-xs text-slate-500">
            Last updated: November 2026 • Urgent Taxis Transport Services
          </p>
        </div>
      </section>
    </div>
  );
}
