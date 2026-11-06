import React from 'react';
import Link from 'next/link';
import { FaHeadset, FaUserCheck, FaShieldAlt, FaRupeeSign, FaCheckCircle, FaMapMarkerAlt } from 'react-icons/fa';
import { BUSINESS_CONFIG } from '@/lib/config';

export default function TrustSection() {
  const trustItems = [
    {
      title: "Verified",
      subtitle: "Highway Drivers",
      desc: "Licensed & route-tested",
      icon: <FaUserCheck className="text-white text-xl" />,
      colorClass: "bg-brand-blue",
    },
    {
      title: "Clean",
      subtitle: "Comfortable Cabs",
      desc: "AC sedans & SUVs",
      icon: <FaShieldAlt className="text-white text-xl" />,
      colorClass: "bg-brand-green",
    },
    {
      title: "Transparent",
      subtitle: "Pricing",
      desc: "Clear itemized fare",
      icon: <FaRupeeSign className="text-white text-xl" />,
      colorClass: "bg-[#1a419c]",
    },
    {
      title: "24/7",
      subtitle: "Customer Support",
      desc: "Always on WhatsApp & Call",
      icon: <FaHeadset className="text-white text-xl" />,
      colorClass: "bg-brand-green",
    },
  ];

  const directBookingBenefits = [
    {
      title: "One Clear, Final Price",
      description: "No hidden charges or surprise surcharges at the end of your trip. We provide complete transparency regarding base fare, driver allowance, tolls, and state border taxes before departure.",
      icon: "💵",
    },
    {
      title: "Driver & Car Details Shared Early",
      description: "Receive your assigned chauffeur's contact number, verified license details, and vehicle registration well ahead of departure time for zero-stress airport and outstation pickups.",
      icon: "🚗",
    },
    {
      title: "Real Local Office in Ghaziabad",
      description: `Headquartered locally at ${BUSINESS_CONFIG.headOffice.formattedAddress}. Our dispatch and operational support teams are based right here in NCR, not in an anonymous call center.`,
      icon: "📍",
    },
    {
      title: "Direct 24/7 WhatsApp & Phone Support",
      description: "Speak directly with our dedicated operations team anytime day or night. Need to adjust your pickup time, change your drop location, or add a stop? We handle it instantly.",
      icon: "📲",
    },
    {
      title: "Fair & Transparent Cancellation Policy",
      description: "Plans change, and we understand. Enjoy flexible rescheduling and transparent cancellation up to 6 hours before departure with instant token refunds.",
      icon: "🛡️",
    },
  ];

  return (
    <>
      {/* Floating Trust Band */}
      <section className="w-full px-2 sm:px-6 lg:px-8 font-sans relative z-20 my-8 sm:my-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100/50">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 divide-y-0 lg:divide-x divide-slate-100">
              {trustItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col sm:flex-row items-center text-center sm:text-left gap-2 sm:gap-4 w-full ${
                    idx !== 0 ? 'lg:pl-6' : ''
                  }`}
                >
                  <div
                    className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex-shrink-0 flex items-center justify-center shadow-md ${item.colorClass}`}
                  >
                    <span className="scale-75 sm:scale-100">{item.icon}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-base font-black text-slate-900 leading-tight">
                      {item.title} <br className="hidden sm:block" /> {item.subtitle}
                    </span>
                    <span className="text-[10px] sm:text-xs font-medium text-slate-500 mt-0.5 leading-none">
                      {item.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Book Direct Section (Replaces competitor logos strip) */}
      <section className="w-full bg-gradient-to-b from-white to-slate-50 py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-100 font-sans">
        <div className="max-w-7xl mx-auto space-y-8 px-2 sm:px-8">
          {/* Header */}
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="inline-block px-3 py-1 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 text-xs font-bold uppercase tracking-wider">
              Guaranteed Direct Operator Value
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-blue tracking-tight">
              Why Book Direct with Urgent Taxis?
            </h2>
            <p className="text-slate-600 font-medium text-sm sm:text-base leading-relaxed">
              When you book directly with our local Ghaziabad dispatch desk, you avoid middleman commissions, get direct driver coordination, and travel with full peace of mind.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {directBookingBenefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-brand-green/30 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-2xl border border-brand-blue/20">
                    {benefit.icon}
                  </div>
                  <h3 className="font-black text-slate-900 text-lg sm:text-xl">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">
                    {benefit.description}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-brand-green">
                  <FaCheckCircle /> Direct Customer Guarantee
                </div>
              </div>
            ))}

            {/* Local Dispatch Box */}
            <div className="bg-brand-blue text-white p-6 sm:p-7 rounded-3xl shadow-[0_10px_30px_-10px_rgba(26,65,156,0.3)] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-sm border border-white/30">
                  🏢
                </div>
                <h3 className="font-black text-white text-lg sm:text-xl">
                  Local Ghaziabad Presence
                </h3>
                <p className="text-blue-100 text-sm leading-relaxed font-medium">
                  Have questions or need custom group travel arrangements? Visit our local office on Railway Station Road, Masuri, or connect with our dispatch supervisors directly.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-white/10 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <FaMapMarkerAlt /> Masuri, Ghaziabad, UP 201302
                </div>
                <Link
                  href="/contact"
                  className="inline-block text-white underline font-semibold hover:text-emerald-200 transition-colors"
                >
                  View complete office contact details →
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
