import React from 'react';
import { FaHeadset, FaUserCheck, FaShieldAlt, FaRupeeSign } from 'react-icons/fa';
import DirectBookingComparison from '@/components/public/DirectBookingComparison';

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

      {/* Direct Booking Comparison Section (Platform Logos & Operator vs Aggregators Matrix) */}
      <DirectBookingComparison />
    </>
  );
}
