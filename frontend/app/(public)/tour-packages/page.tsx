import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';

export const metadata = constructMetadata({
  title: 'Custom Tour Packages | Urgent Taxis',
  description: 'Plan custom tour packages, sightseeing itineraries, and multi-day trips with Urgent Taxis. Reliable cabs for family and group travel.',
  canonicalPath: '/tour-packages',
});

export default function TourPackagesPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Tour Packages' },
  ];

  const popularDestinations = [
    { name: 'Nainital & Lakes', duration: '3-4 Days' },
    { name: 'Agra - Mathura - Vrindavan', duration: '2 Days' },
    { name: 'Shimla - Manali', duration: '5-7 Days' },
    { name: 'Jaipur & Rajasthan', duration: '4-6 Days' },
  ];

  return (
    <div className="pb-16 bg-slate-50 min-h-screen text-slate-900">
      <div className="bg-white border-b border-slate-100">
        <PublicBreadcrumbs items={breadcrumbItems} />
      </div>

      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 text-xs font-bold shadow-sm">
          Multi-Day Itineraries
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-brand-blue tracking-tight">
          Custom Tour Packages
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          Tailor-made travel experiences. Hire a dedicated cab and driver for your entire vacation itinerary.
        </p>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm mb-12">
           <h2 className="text-2xl font-black text-brand-blue text-center mb-8">Popular Tour Routes</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularDestinations.map((dest, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center">
                  <h3 className="font-bold text-slate-900">{dest.name}</h3>
                  <span className="text-xs text-brand-green font-bold block mt-1">{dest.duration}</span>
                </div>
              ))}
           </div>
        </div>

        <div className="text-center bg-white border border-brand-blue/10 p-10 rounded-3xl max-w-2xl mx-auto space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue to-brand-green"></div>
          <h3 className="text-2xl font-black text-brand-blue">Plan Your Custom Tour</h3>
          <p className="text-sm text-slate-600 font-medium">
            Have a specific itinerary in mind? Share your travel dates and destinations with our team, and we will provide a complete transportation package.
          </p>
          <div className="pt-2">
            <a
              href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20would%20like%20to%20plan%20a%20*Custom%20Tour%20Package*.%20%F0%9F%8F%94%EF%B8%8F`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-brand-green hover:bg-brand-green-hover text-white font-black text-sm px-8 py-4 rounded-xl transition-all shadow-md"
            >
              Enquire Custom Package
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
