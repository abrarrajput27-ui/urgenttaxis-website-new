import React from 'react';
import Image from 'next/image';
import { FaHeadset, FaUserFriends, FaShieldAlt, FaRupeeSign } from 'react-icons/fa';

export default function TrustSection() {
  const trustItems = [
    {
      title: "10,000+",
      subtitle: "Happy Customers",
      desc: "and counting",
      icon: <FaUserFriends className="text-white text-xl" />,
      colorClass: "bg-[#3b2c85]",
    },
    {
      title: "Verified",
      subtitle: "Drivers",
      desc: "Background verified",
      icon: <FaShieldAlt className="text-white text-xl" />,
      colorClass: "bg-[#00a859]",
    },
    {
      title: "No Hidden",
      subtitle: "Charges",
      desc: "100% Transparent",
      icon: <FaRupeeSign className="text-white text-xl" />,
      colorClass: "bg-[#3b2c85]",
    },
    {
      title: "24/7",
      subtitle: "Support",
      desc: "We're here anytime",
      icon: <FaHeadset className="text-white text-xl" />,
      colorClass: "bg-[#00a859]",
    }
  ];

  const features = [
    {
      title: "Transparent Itemized Pricing",
      description: "Calculated using strict per-KM rates and daily minimums. Clearly itemized base fare, distance charges, and driver allowance.",
      icon: "💵"
    },
    {
      title: "Verified Fleet & Drivers",
      description: "Well-maintained sedans and SUVs driven by experienced chauffeurs trained for highway navigation and safety.",
      icon: "🛡️"
    },
    {
      title: "Instant Booking Assistance",
      description: "Instant phone and WhatsApp support for quick outstation trip confirmation and vehicle assignment.",
      icon: "📲"
    }
  ];

  const platforms = [
    { name: "MakeMyTrip", logo: "/partners/makemytrip.svg" },
    { name: "Goibibo", logo: "/partners/goibibo.png" },
    { name: "EaseMyTrip", logo: "/partners/easemytrip.svg" },
    { name: "Savaari", logo: "/partners/savaari.png" },
    { name: "Justdial", logo: "/partners/justdial.png" },
    { name: "TripAdvisor", logo: "/partners/tripadvisor.jpg" }
  ];

  return (
    <>
      {/* Floating Trust Band */}
      <section className="w-full px-2 sm:px-6 lg:px-8 font-sans relative z-20 -mt-10 sm:-mt-6 mb-2 sm:mb-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl sm:rounded-[2rem] p-3 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100/50">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 divide-y-0 lg:divide-x divide-slate-100">
              {trustItems.map((item, idx) => (
                <div key={idx} className={`flex flex-col sm:flex-row items-center text-center sm:text-left gap-1.5 sm:gap-4 w-full ${idx !== 0 && idx !== 2 ? 'lg:pl-6' : ''}`}>
                  <div className={`w-8 h-8 sm:w-14 sm:h-14 rounded-full flex-shrink-0 flex items-center justify-center shadow-lg ${item.colorClass}`}>
                    <span className="scale-75 sm:scale-100">{item.icon}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] sm:text-[17px] font-black text-slate-900 leading-tight">
                      {item.title} <br className="hidden sm:block" /> {item.subtitle}
                    </span>
                    <span className="text-[9px] sm:text-xs font-medium text-slate-500 mt-0.5 leading-none">
                      {item.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Book Direct Section */}
      <section className="w-full bg-gradient-to-b from-white to-slate-50 py-4 px-4 sm:px-6 lg:px-8 border-t border-slate-100 font-sans">
        <div className="max-w-7xl mx-auto space-y-6 px-2 sm:px-8">
          
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-brand-blue tracking-tight">
              Why Book Direct with Urgent Taxis?
            </h2>
            <p className="text-slate-600 font-medium text-sm sm:text-base leading-relaxed">
              Book directly with Urgent Taxis for transparent pricing, verified drivers, flexible support and a smoother booking experience.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Features - Left Side */}
            <div className="lg:col-span-2 grid grid-cols-1 gap-6 w-full">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] hover:-translate-y-1 hover:border-brand-green/30 transition-all duration-300 group w-full"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 bg-brand-green/10 rounded-2xl flex items-center justify-center text-2xl border border-brand-green/20 flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-slate-900 text-lg sm:text-xl mb-1.5">{feature.title}</h3>
                      <p className="text-slate-500 text-sm sm:text-base leading-relaxed font-medium">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            {/* SEO Text (Moved up to save space) */}
            <div className="text-[11px] text-slate-400 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner mt-2">
              Urgent Taxis provides premier <strong className="font-semibold">outstation taxi</strong> and <strong className="font-semibold">airport taxi</strong> services across major cities. Whether you need a simple <strong className="font-semibold">cab booking</strong> or an <strong className="font-semibold">online cab booking</strong> platform, our <strong className="font-semibold">taxi service</strong> offers reliable <strong className="font-semibold">chauffeur driven car</strong> experiences. We specialize in <strong className="font-semibold">one way taxi</strong> drops, <strong className="font-semibold">round trip cab</strong> packages, and prompt <strong className="font-semibold">airport transfer</strong>. For city tours, book a <strong className="font-semibold">local cab</strong> or hire a spacious <strong className="font-semibold">tempo traveller</strong> for group trips. We also cater to business professionals requiring a <strong className="font-semibold">corporate cab</strong>. Explore popular corridors with our <strong className="font-semibold">Delhi taxi</strong>, <strong className="font-semibold">Noida taxi</strong>, <strong className="font-semibold">Ghaziabad taxi</strong>, <strong className="font-semibold">Aligarh taxi</strong>, <strong className="font-semibold">Lucknow taxi</strong>, <strong className="font-semibold">Haridwar taxi</strong>, <strong className="font-semibold">Rishikesh taxi</strong>, <strong className="font-semibold">Nainital taxi</strong>, <strong className="font-semibold">Jim Corbett taxi</strong>, <strong className="font-semibold">Dehradun taxi</strong>, <strong className="font-semibold">Agra taxi</strong>, and <strong className="font-semibold">Jaipur taxi</strong> routes.
            </div>
          </div>

            {/* Platforms Grid - Right Side */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-slate-100 flex flex-col h-full w-full">
              <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">Compare our fares on top platforms</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6 w-full">
                {platforms.map((platform, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-center p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-brand-blue/30 transition-all duration-300 h-20 w-full"
                  >
                    <img 
                      src={platform.logo} 
                      alt={`${platform.name} Logo`} 
                      className="max-h-12 max-w-full object-contain"
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
        </div>
      </section>
    </>
  );
}
