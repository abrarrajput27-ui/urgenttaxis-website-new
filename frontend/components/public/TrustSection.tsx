import Image from 'next/image';
import Link from 'next/link';
import { FaPhoneAlt, FaTag, FaUserCheck, FaHeadset, FaFileInvoiceDollar, FaCar } from 'react-icons/fa';

export default function TrustSection() {
  const features = [
    {
      title: "Direct Booking Assistance",
      description: "Book directly with our team for quick confirmation and personalized support.",
      icon: <FaPhoneAlt className="text-2xl text-brand-green" />
    },
    {
      title: "Competitive Pricing",
      description: "Direct bookings may help you avoid additional marketplace markups or platform fees where applicable.",
      icon: <FaTag className="text-2xl text-brand-green" />
    },
    {
      title: "Verified Drivers",
      description: "Professional verified drivers with clean vehicles.",
      icon: <FaUserCheck className="text-2xl text-brand-green" />
    },
    {
      title: "24×7 Customer Support",
      description: "Dedicated support before, during and after your journey.",
      icon: <FaHeadset className="text-2xl text-brand-green" />
    },
    {
      title: "Transparent Fare",
      description: "Clear fare breakup with no hidden surprises.",
      icon: <FaFileInvoiceDollar className="text-2xl text-brand-green" />
    },
    {
      title: "Trusted Outstation Specialist",
      description: "Specialized in Outstation Cabs, Airport Transfers, Local Rentals, Corporate Travel, Tempo Traveller and Tour Packages.",
      icon: <FaCar className="text-2xl text-brand-green" />
    }
  ];

  const platforms = [
    { name: "MakeMyTrip" },
    { name: "Goibibo" },
    { name: "EaseMyTrip" },
    { name: "Savaari" },
    { name: "Justdial" },
    { name: "TripAdvisor" }
  ];

  return (
    <section className="w-full bg-gradient-to-b from-white to-slate-50 py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-100 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-brand-blue tracking-tight">
            Why Book Direct with Urgent Taxis?
          </h2>
          <p className="text-slate-600 font-medium text-sm sm:text-base leading-relaxed">
            Book directly with Urgent Taxis for transparent pricing, verified drivers, flexible support and a smoother booking experience.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* Left Side: Features Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow hover:border-brand-green/30 group"
              >
                <div className="w-12 h-12 bg-brand-green/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Right Side: Logo Wall & Disclaimer */}
          <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-lg border border-slate-100 sticky top-24">
            <h3 className="text-xl font-black text-slate-800 text-center mb-6">Popular Travel Platforms</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              {platforms.map((platform, idx) => (
                <div 
                  key={idx} 
                  className="bg-slate-50 h-16 rounded-xl flex items-center justify-center p-3 grayscale hover:grayscale-0 hover:scale-105 hover:shadow-sm transition-all duration-300 border border-slate-100 cursor-pointer"
                >
                  {/* Using placehold.co text fallback since logos are missing */}
                  <img 
                    src={`https://placehold.co/120x60/e2e8f0/475569?text=${platform.name}`}
                    alt={`${platform.name} Platform`}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                  />
                </div>
              ))}
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-xs text-slate-500 font-medium leading-relaxed text-justify">
                <span className="font-bold text-slate-700 block mb-1">Please Note:</span>
                Many travelers discover taxi services through popular travel platforms. Booking directly with Urgent Taxis can provide personalized assistance, transparent communication and competitive pricing depending on the route and availability.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Section: CTAs and SEO Content */}
        <div className="flex flex-col items-center space-y-8 pt-8">
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <a href="tel:+917310651940" className="bg-brand-green hover:bg-emerald-600 text-white font-bold py-3.5 px-8 rounded-xl shadow-md transition-colors text-center text-sm">
              Book Direct & Save Time
            </a>
            <Link href="/routes" className="bg-white hover:bg-slate-50 text-brand-blue border-2 border-brand-blue font-bold py-3.5 px-8 rounded-xl shadow-sm transition-colors text-center text-sm">
              Get Instant Fare
            </Link>
          </div>

          <div className="max-w-4xl mx-auto text-center">
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Urgent Taxis provides premier <strong className="font-semibold">outstation taxi</strong> and <strong className="font-semibold">airport taxi</strong> services across major cities. Whether you need a simple <strong className="font-semibold">cab booking</strong> or an <strong className="font-semibold">online cab booking</strong> platform, our <strong className="font-semibold">taxi service</strong> offers reliable <strong className="font-semibold">chauffeur driven car</strong> experiences. We specialize in <strong className="font-semibold">one way taxi</strong> drops, <strong className="font-semibold">round trip cab</strong> packages, and prompt <strong className="font-semibold">airport transfer</strong>. For city tours, book a <strong className="font-semibold">local cab</strong> or hire a spacious <strong className="font-semibold">tempo traveller</strong> for group trips. We also cater to business professionals requiring a <strong className="font-semibold">corporate cab</strong>. Explore popular corridors with our <strong className="font-semibold">Delhi taxi</strong>, <strong className="font-semibold">Noida taxi</strong>, <strong className="font-semibold">Ghaziabad taxi</strong>, <strong className="font-semibold">Aligarh taxi</strong>, <strong className="font-semibold">Lucknow taxi</strong>, <strong className="font-semibold">Haridwar taxi</strong>, <strong className="font-semibold">Rishikesh taxi</strong>, <strong className="font-semibold">Nainital taxi</strong>, <strong className="font-semibold">Jim Corbett taxi</strong>, <strong className="font-semibold">Dehradun taxi</strong>, <strong className="font-semibold">Agra taxi</strong>, and <strong className="font-semibold">Jaipur taxi</strong> routes.
            </p>
          </div>
          
        </div>
      </div>
    </section>
  );
}
