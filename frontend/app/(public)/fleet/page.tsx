import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import Image from 'next/image';
import Link from 'next/link';
import { FaUser, FaSuitcase, FaSnowflake, FaMusic, FaMapMarkerAlt, FaRoute } from 'react-icons/fa';

export const metadata = constructMetadata({
  title: 'Our Taxi Fleet - Urgent Taxis',
  description: 'Explore our wide range of well-maintained vehicles including Cars, SUVs, Tempo Travellers, Urbania, and Luxury Buses.',
  canonicalPath: '/fleet',
});

// Reusable Vehicle Card Component
const VehicleCard = ({
  image,
  title,
  models,
  seats,
  bags,
  ac,
  music,
  localSightseeing = true,
  outstationTravel = true,
  outstationPrice,
  localPrice,
}: {
  image: string;
  title: string;
  models: string;
  seats: string;
  bags: string;
  ac: boolean;
  music: boolean;
  localSightseeing?: boolean;
  outstationTravel?: boolean;
  outstationPrice: string;
  localPrice: string;
}) => (
  <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] overflow-visible flex flex-col border border-slate-100 transition-transform hover:-translate-y-1">
    <div className="bg-slate-50 flex items-center justify-center border-b border-slate-100 overflow-hidden">
      <Image
        src={image}
        alt={title}
        width={300}
        height={180}
        className="w-full h-auto object-contain"
      />
    </div>
    <div className="p-6 flex-1 flex flex-col">
      <h3 className="text-xl font-bold text-brand-blue mb-1">{title}</h3>
      <p className="text-xs text-slate-500 mb-4 h-4">{models}</p>

      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-semibold text-slate-700 mb-6">
        <div className="flex items-center gap-1.5"><FaUser className="text-brand-green" /> {seats}</div>
        <div className="flex items-center gap-1.5"><FaSuitcase className="text-brand-green" /> {bags}</div>
        <div className="flex items-center gap-1.5"><FaSnowflake className="text-brand-green" /> {ac ? 'AC' : 'Non-AC'}</div>
        <div className="flex items-center gap-1.5"><FaMusic className="text-brand-green" /> {music ? 'Music System' : 'No Music'}</div>
        {localSightseeing && <div className="flex items-center gap-1.5"><FaMapMarkerAlt className="text-brand-green" /> Local Sightseeing</div>}
        {outstationTravel && <div className="flex items-center gap-1.5"><FaRoute className="text-brand-green" /> Outstation Travel</div>}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6 mt-auto">
        <div className="bg-purple-50 rounded-xl p-3 text-center border border-purple-100">
          <div className="text-[10px] text-purple-600 font-bold uppercase tracking-wider mb-1">Outstation</div>
          <div className="text-sm font-black text-slate-800">{outstationPrice}</div>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
          <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-1">Local Rentals</div>
          <div className="text-sm font-black text-slate-800">{localPrice}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <a
          href={`tel:${SITE_CONFIG.phoneRaw}`}
          className="flex items-center justify-center gap-2 border-2 border-brand-blue text-brand-blue font-bold rounded-full py-2 hover:bg-brand-blue hover:text-white transition-colors text-sm"
        >
          <span>📞</span> Call Now
        </a>
        <a
          href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20would%20like%20to%20make%20an%20inquiry.%20%E2%9C%A8`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 border-2 border-brand-green text-brand-green font-bold rounded-full py-2 hover:bg-brand-green hover:text-white transition-colors text-sm"
        >
          <span>💬</span> WhatsApp
        </a>
      </div>
    </div>
  </div>
);

export default function FleetPage() {
  return (
    <div className="min-h-screen bg-white pb-20 font-sans">
      {/* 1. Hero Section */}
      <section className="relative text-white py-32 px-4 text-center overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/fleet-hero-bg.png" 
            alt="Fleet Background" 
            fill 
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-slate-900/80"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50"></div>
        </div>

        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          <div className="inline-block text-xs font-bold tracking-[0.2em] text-brand-green uppercase mb-2">
            Comfort & Safety Guaranteed
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4">
            Our Taxi Fleet
          </h1>
          <p className="text-slate-300 text-sm md:text-base font-medium leading-relaxed">
            Explore our range of well-maintained vehicles for all your travel needs. From economical hatchbacks to luxury SUVs, we have the perfect ride for your journey.
          </p>
          <div className="w-16 h-1 bg-brand-green mx-auto mt-8 rounded-full"></div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-20">
        
        {/* Cars & SUVs */}
        <section>
          <h2 className="text-2xl font-black text-brand-blue mb-6 border-b-2 border-brand-blue pb-2 inline-block">Cars & SUVs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <VehicleCard
              image="/fleet-brand/Hatchback.png" 
              title="Hatchback"
              models="(WagonR, Swift, Celerio)"
              seats="4 Seats"
              bags="2 Bags"
              ac={true}
              music={true}
              outstationPrice="₹10/km"
              localPrice="₹1200"
            />
            <VehicleCard
              image="/fleet-brand/dzire.png"
              title="Sedan"
              models="(Dzire, Etios, Amaze)"
              seats="4 Seats"
              bags="2 Bags"
              ac={true}
              music={true}
              outstationPrice="₹11/km"
              localPrice="₹1500"
            />
            <VehicleCard
              image="/fleet-brand/Ertiga.png"
              title="SUV / MPV"
              models="(Ertiga, Triber, Carens)"
              seats="6/7 Seats"
              bags="4 Bags"
              ac={true}
              music={true}
              outstationPrice="₹15/km"
              localPrice="₹2000"
            />
            <VehicleCard
                image="/fleet-brand/Innova%20Crysta.png"
                title="Premium SUV"
                models="(Innova Crysta, Hycross)"
                seats="6/7 Seats"
                bags="4 Bags"
                ac={true}
                music={true}
                outstationPrice="₹20/km"
                localPrice="₹2500"
                />
          </div>
        </section>

        {/* Tempo Travellers */}
        <section>
          <h2 className="text-2xl font-black text-brand-blue mb-6 border-b-2 border-brand-blue pb-2 inline-block">Tempo Travellers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <VehicleCard
              image="/fleet-brand/Tempo Traveller.png"
              title="12 Seater Traveller"
              models="Force Traveller 1x1"
              seats="12 Seats"
              bags="10 Bags"
              ac={true}
              music={true}
              outstationPrice="₹24/km"
              localPrice="₹3500"
            />
            <VehicleCard
              image="/fleet-brand/Tempo Traveller.png"
              title="16 Seater Traveller"
              models="Force Traveller 2x1"
              seats="16 Seats"
              bags="12 Bags"
              ac={true}
              music={true}
              outstationPrice="₹26/km"
              localPrice="₹4500"
            />
            <VehicleCard
              image="/fleet-brand/Tempo Traveller.png"
              title="20 Seater Traveller"
              models="Force Traveller 2x1"
              seats="20 Seats"
              bags="15 Bags"
              ac={true}
              music={true}
              outstationPrice="₹28/km"
              localPrice="₹5500"
            />
            <VehicleCard
              image="/fleet-brand/Tempo Traveller.png"
              title="26 Seater Traveller"
              models="Force Traveller 2x2"
              seats="26 Seats"
              bags="20 Bags"
              ac={true}
              music={true}
              outstationPrice="₹32/km"
              localPrice="₹6500"
            />
          </div>
        </section>

        {/* Urbania */}
        <section>
          <h2 className="text-2xl font-black text-brand-blue mb-6 border-b-2 border-brand-blue pb-2 inline-block">Urbania</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <VehicleCard
              image="/fleet-brand/Urbania.png"
              title="12 Seater Urbania"
              models="Force Urbania Premium"
              seats="12 Seats"
              bags="10 Bags"
              ac={true}
              music={true}
              outstationPrice="₹30/km"
              localPrice="₹5000"
            />
            <VehicleCard
              image="/fleet-brand/Urbania.png"
              title="16 Seater Urbania"
              models="Force Urbania Premium"
              seats="16 Seats"
              bags="14 Bags"
              ac={true}
              music={true}
              outstationPrice="₹34/km"
              localPrice="₹6000"
            />
          </div>
        </section>

        {/* Luxury Buses */}
        <section>
          <h2 className="text-2xl font-black text-brand-blue mb-6 border-b-2 border-brand-blue pb-2 inline-block">Luxury Buses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <VehicleCard
              image="/fleet-brand/Bus.png"
              title="27 Seater Bus"
              models="Luxury AC Bus"
              seats="27 Seats"
              bags="27 Bags"
              ac={true}
              music={true}
              outstationPrice="₹45/km"
              localPrice="₹8000"
            />
            <VehicleCard
              image="/fleet-brand/volvo bus.png"
              title="45 Seater Bus"
              models="Luxury AC Bus"
              seats="45 Seats"
              bags="45 Bags"
              ac={true}
              music={true}
              outstationPrice="₹55/km"
              localPrice="₹10000"
            />
          </div>
        </section>

        {/* Important Guidelines */}
        <section className="bg-slate-50 border border-slate-200 rounded-2xl p-8 lg:p-12 text-center max-w-4xl mx-auto">
          <h3 className="text-xl font-black text-brand-blue mb-6 tracking-wide">IMPORTANT GUIDELINES</h3>
          <ul className="text-sm text-slate-700 font-medium space-y-3 inline-block text-left list-disc list-inside marker:text-brand-green">
            <li>Minimum 250 km per day limit for outstation trips.</li>
            <li>Toll tax, state tax and parking extra.</li>
            <li>Driver allowance ₹300 per day (₹500 for hill areas or commercial vehicles).</li>
            <li>Billing starts &amp; ends at garage (average 15km distance from pickup/drop added in outstation rentals).</li>
            <li>AC will be switched off in hill areas to ensure engine performance &amp; safety.</li>
          </ul>
        </section>

        {/* Links section */}
        <section className="grid md:grid-cols-2 gap-8 border-t border-slate-100 pt-12">
          <div>
            <h4 className="text-lg font-bold text-brand-blue mb-4 flex items-center gap-2">
              <span className="text-brand-green">📍</span> Popular Routes
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm font-semibold text-slate-600">
              <Link href="/routes" className="hover:text-brand-green p-3 border border-slate-100 rounded-lg hover:border-brand-green hover:bg-brand-green/5 transition-all text-center">Delhi to Agra</Link>
              <Link href="/routes" className="hover:text-brand-green p-3 border border-slate-100 rounded-lg hover:border-brand-green hover:bg-brand-green/5 transition-all text-center">Delhi to Jaipur</Link>
              <Link href="/routes" className="hover:text-brand-green p-3 border border-slate-100 rounded-lg hover:border-brand-green hover:bg-brand-green/5 transition-all text-center">Delhi to Haridwar</Link>
              <Link href="/routes" className="hover:text-brand-green p-3 border border-slate-100 rounded-lg hover:border-brand-green hover:bg-brand-green/5 transition-all text-center">Delhi to Shimla</Link>
              <Link href="/routes" className="hover:text-brand-green p-3 border border-slate-100 rounded-lg hover:border-brand-green hover:bg-brand-green/5 transition-all text-center">Delhi to Rishikesh</Link>
              <Link href="/routes" className="hover:text-brand-green p-3 border border-slate-100 rounded-lg hover:border-brand-green hover:bg-brand-green/5 transition-all text-center">Delhi to Varanasi</Link>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold text-brand-blue mb-4 flex items-center gap-2">
              <span className="text-brand-green">🚕</span> Top City Taxi Services
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm font-semibold text-slate-600">
              <Link href="/fleet" className="hover:text-brand-green p-3 border border-slate-100 rounded-lg hover:border-brand-green hover:bg-brand-green/5 transition-all text-center">Innova</Link>
              <Link href="/fleet" className="hover:text-brand-green p-3 border border-slate-100 rounded-lg hover:border-brand-green hover:bg-brand-green/5 transition-all text-center">Ertiga</Link>
              <Link href="/fleet" className="hover:text-brand-green p-3 border border-slate-100 rounded-lg hover:border-brand-green hover:bg-brand-green/5 transition-all text-center">Dzire/Etios</Link>
              <Link href="/fleet" className="hover:text-brand-green p-3 border border-slate-100 rounded-lg hover:border-brand-green hover:bg-brand-green/5 transition-all text-center">Tempo Traveller</Link>
              <Link href="/fleet" className="hover:text-brand-green p-3 border border-slate-100 rounded-lg hover:border-brand-green hover:bg-brand-green/5 transition-all text-center">Urbania</Link>
              <Link href="/fleet" className="hover:text-brand-green p-3 border border-slate-100 rounded-lg hover:border-brand-green hover:bg-brand-green/5 transition-all text-center">Luxury Bus</Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
