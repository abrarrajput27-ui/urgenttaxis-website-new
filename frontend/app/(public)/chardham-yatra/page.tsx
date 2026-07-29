import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';

export const metadata = constructMetadata({
  title: 'Chardham Yatra Taxi Services | Urgent Taxis',
  description: 'Book reliable cabs and tempo travellers for Chardham Yatra. Verified hill drivers for Kedarnath, Badrinath, Gangotri, and Yamunotri.',
  canonicalPath: '/chardham-yatra',
});

export default function ChardhamYatraPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Chardham Yatra' },
  ];

  return (
    <div className="pb-16 bg-slate-50 min-h-screen text-slate-900">
      <div className="bg-white border-b border-slate-100">
        <PublicBreadcrumbs items={breadcrumbItems} />
      </div>

      <section className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-bold shadow-sm">
          Sacred Pilgrimage Tours
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-brand-blue tracking-tight">
          Chardham Yatra Taxi Booking
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          Safe, comfortable, and reliable transportation for your sacred journey to Yamunotri, Gangotri, Kedarnath, and Badrinath.
        </p>
      </section>

      <section className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-2xl font-black text-brand-blue">Our Yatra Services</h2>
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            The Chardham Yatra requires experienced hill drivers and extremely well-maintained vehicles. We specialize in providing customized travel plans starting from Delhi, Haridwar, or Dehradun.
          </p>
          <ul className="space-y-4 text-sm text-slate-600 font-medium pt-2">
            <li className="flex gap-3"><span className="text-amber-500">ॐ</span> Do Dham Yatra (Kedarnath & Badrinath)</li>
            <li className="flex gap-3"><span className="text-amber-500">ॐ</span> Complete Chardham Yatra</li>
            <li className="flex gap-3"><span className="text-amber-500">ॐ</span> Verified drivers experienced in Himalayan terrain</li>
            <li className="flex gap-3"><span className="text-amber-500">ॐ</span> Flexible SUV (Innova/Ertiga) and Tempo Traveller options</li>
          </ul>
        </div>
        
        <div className="bg-gradient-to-br from-brand-blue to-brand-blue-light text-white p-8 rounded-3xl shadow-md relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -z-10"></div>
          <h2 className="text-2xl font-black relative z-10">Book Your Yatra Package</h2>
          <p className="text-sm text-blue-100 font-medium relative z-10 leading-relaxed mt-4 mb-6">
            Contact us early to secure your preferred vehicle, as demand is highly seasonal. Our team will assist you with route planning and travel advisories.
          </p>
          <div className="relative z-10">
            <a
              href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%99%8F%0A%0AI%20am%20looking%20to%20book%20a%20cab%20for%20*Chardham%20Yatra*.%20%F0%9F%9A%96`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-amber-500 hover:bg-amber-600 text-slate-900 font-black text-sm px-8 py-4 rounded-xl transition-all shadow-lg"
            >
              Enquire Yatra Packages
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
