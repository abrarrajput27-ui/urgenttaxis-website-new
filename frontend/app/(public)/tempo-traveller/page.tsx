import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';
import Link from 'next/link';

export const metadata = constructMetadata({
  title: 'Tempo Traveller on Rent | Urgent Taxis',
  description: 'Book 9, 12, 16 seater Tempo Travellers for group travel, family outstation trips, and events with Urgent Taxis.',
  canonicalPath: '/tempo-traveller',
});

export default function TempoTravellerPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Tempo Traveller' },
  ];

  return (
    <div className="pb-16 bg-slate-50 min-h-screen text-slate-900">
      <div className="bg-white border-b border-slate-100">
        <PublicBreadcrumbs items={breadcrumbItems} />
      </div>

      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 text-xs font-bold shadow-sm">
          Group Travel Made Easy
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-brand-blue tracking-tight">
          Tempo Traveller Booking
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          Spacious and comfortable Tempo Travellers for family trips, outstation tours, and group airport transfers.
        </p>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-white border border-slate-200 p-8 md:p-12 rounded-3xl shadow-sm text-center max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl font-black text-brand-blue">Perfect for Large Groups</h2>
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            Traveling with a large family or a group of friends? Our well-maintained Tempo Travellers offer pushback seats, ample luggage space, and premium AC cooling to ensure a comfortable journey for groups of 9 to 16 passengers.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="text-lg font-black text-brand-green">9-12</div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Seater Options</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="text-lg font-black text-brand-green">A/C</div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Pushback Seats</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="text-lg font-black text-brand-green">Expert</div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Hill Drivers</div>
            </div>
          </div>

          <div className="pt-8">
            <a
              href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20want%20to%20enquire%20about%20a%20*Tempo%20Traveller*%20booking.%20%F0%9F%9A%90`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-brand-green hover:bg-brand-green-hover text-white font-black text-sm px-8 py-4 rounded-xl transition-all shadow-lg"
            >
              Check Availability & Prices
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
