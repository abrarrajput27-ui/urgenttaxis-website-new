import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaCheckCircle, FaTimesCircle, FaShieldAlt, FaPhoneAlt, FaWhatsapp } from 'react-icons/fa';
import { SITE_CONFIG } from '@/lib/seo';
import { BUSINESS_CONFIG } from '@/lib/config';

export default function DirectBookingComparison() {
  const comparisonRows = [
    {
      feature: 'Pricing Model',
      urgentTaxis: 'Guaranteed Transparent Per-KM Matrix (Zero Surge)',
      others: 'Algorithmic Dynamic Surge Pricing (Up to 1.5x–2x)',
      urgentWins: true,
    },
    {
      feature: 'Advance Payment',
      urgentTaxis: 'Only 30% Advance Token (Balance on Destination)',
      others: '100% Full Upfront Prepayment Mandatory',
      urgentWins: true,
    },
    {
      feature: 'Driver & Fleet Standard',
      urgentTaxis: 'Verified Commercial Yellow-Plate Cabs & Hill Experts',
      others: 'Random Gig-Economy Unscreened Allocation',
      urgentWins: true,
    },
    {
      feature: 'Operations & Dispatch Desk',
      urgentTaxis: 'Direct 24/7 Masuri Ghaziabad Desk & Instant WhatsApp',
      others: 'Automated Chatbot & Offshore Call Center Queue',
      urgentWins: true,
    },
    {
      feature: 'One-Way Outstation Billing',
      urgentTaxis: 'True One-Way Fare (Zero Return Fare or Tolls Charged)',
      others: 'Hidden Return Fare or Dead-Mileage Markups',
      urgentWins: true,
    },
    {
      feature: 'Highway Stoppages & Flexibility',
      urgentTaxis: 'Free Highway Dhaba & Temple Stoppages Included',
      others: 'Strict GPS Penalties for Route Deviations',
      urgentWins: true,
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
      <div className="space-y-12">
        {/* 1. Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 text-xs font-bold uppercase tracking-wider">
            Direct Operator Guarantee
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Why Book Direct with <span className="text-brand-blue">Urgent Taxis</span>?
          </h2>
          <p className="text-slate-600 font-medium text-sm sm:text-base leading-relaxed">
            Book directly with Urgent Taxis for transparent pricing, verified drivers, flexible support and a smoother booking experience.
          </p>
        </div>

        {/* 2. Top Two-Column Grid Matching Platform Comparison Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: 3 Benefit Cards */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-4">
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-brand-green flex items-center justify-center text-2xl flex-shrink-0 border border-emerald-100">
                💵
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">
                  Transparent Itemized Pricing
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Calculated using strict per-KM rates and daily minimums. Clearly itemized base fare, distance charges, and driver allowance.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center text-2xl flex-shrink-0 border border-blue-100">
                🛡️
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">
                  Verified Fleet &amp; Drivers
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Well-maintained sedans and SUVs driven by experienced chauffeurs trained for highway navigation and safety.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl flex-shrink-0 border border-purple-100">
                📲
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">
                  Instant Booking Assistance
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Instant phone and WhatsApp support for quick outstation trip confirmation and vehicle assignment.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Compare Our Fares on Top Platforms Box */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Compare our fares on top platforms
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Direct bookings save up to 20% in middleman commissions
                </p>
              </div>

              {/* 6 Logos Grid (2 rows x 3 cols) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* MakeMyTrip */}
                <div className="h-16 rounded-2xl bg-slate-50 border border-slate-200/80 p-2 flex items-center justify-center hover:bg-white hover:border-brand-blue/50 transition-all shadow-2xs">
                  <Image
                    src="/partners/makemytrip.svg"
                    alt="MakeMyTrip Cabs"
                    width={110}
                    height={38}
                    className="max-h-8 w-auto object-contain"
                  />
                </div>

                {/* Goibibo */}
                <div className="h-16 rounded-2xl bg-slate-50 border border-slate-200/80 p-2 flex items-center justify-center hover:bg-white hover:border-brand-blue/50 transition-all shadow-2xs">
                  <Image
                    src="/partners/goibibo.png"
                    alt="Goibibo Cabs"
                    width={110}
                    height={38}
                    className="max-h-8 w-auto object-contain"
                  />
                </div>

                {/* EaseMyTrip */}
                <div className="h-16 rounded-2xl bg-slate-50 border border-slate-200/80 p-2 flex items-center justify-center hover:bg-white hover:border-brand-blue/50 transition-all shadow-2xs">
                  <Image
                    src="/partners/easemytrip.svg"
                    alt="EaseMyTrip Cabs"
                    width={110}
                    height={38}
                    className="max-h-8 w-auto object-contain"
                  />
                </div>

                {/* Savaari */}
                <div className="h-16 rounded-2xl bg-slate-50 border border-slate-200/80 p-2 flex items-center justify-center hover:bg-white hover:border-brand-blue/50 transition-all shadow-2xs">
                  <Image
                    src="/partners/savaari.png"
                    alt="Savaari Car Rentals"
                    width={110}
                    height={38}
                    className="max-h-8 w-auto object-contain"
                  />
                </div>

                {/* Justdial */}
                <div className="h-16 rounded-2xl bg-slate-50 border border-slate-200/80 p-2 flex items-center justify-center hover:bg-white hover:border-brand-blue/50 transition-all shadow-2xs">
                  <Image
                    src="/partners/justdial.png"
                    alt="Justdial Taxis"
                    width={110}
                    height={38}
                    className="max-h-8 w-auto object-contain"
                  />
                </div>

                {/* Tripadvisor */}
                <div className="h-16 rounded-2xl bg-slate-50 border border-slate-200/80 p-2 flex items-center justify-center hover:bg-white hover:border-brand-blue/50 transition-all shadow-2xs">
                  <Image
                    src="/partners/tripadvisor.jpg"
                    alt="Tripadvisor Cabs"
                    width={110}
                    height={38}
                    className="max-h-8 w-auto object-contain rounded"
                  />
                </div>
              </div>
            </div>

            {/* Platform Disclaimer Note */}
            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 font-medium leading-relaxed mt-4">
              <strong>Please Note:</strong> Many travelers discover taxi services through popular travel platforms. Urgent Taxis provides direct, transparent communication and pricing with zero aggregator commission markups.
            </div>
          </div>
        </div>

        {/* 3. Detailed Comparison Matrix Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm">
          <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Direct Operator vs. Online Aggregators Comparison
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Why North India travelers save money and avoid headaches by booking directly with Urgent Taxis.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full w-fit">
              100% Price &amp; Service Guarantee
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-black">
                  <th className="py-3.5 px-4 sm:px-6 w-1/3">Service Feature</th>
                  <th className="py-3.5 px-4 sm:px-6 w-1/3 text-brand-green bg-emerald-50/60 font-black">
                    Urgent Taxis (Direct Operator)
                  </th>
                  <th className="py-3.5 px-4 sm:px-6 w-1/3 text-slate-500">
                    Other Online Aggregators
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-800">
                      {row.feature}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 bg-emerald-50/30 font-bold text-emerald-950 flex items-center gap-2">
                      <FaCheckCircle className="text-brand-green text-sm flex-shrink-0" />
                      <span>{row.urgentTaxis}</span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500 font-medium">
                      <div className="flex items-center gap-2">
                        <FaTimesCircle className="text-rose-400 text-sm flex-shrink-0" />
                        <span>{row.others}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50 via-emerald-50 to-blue-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600 font-medium text-center sm:text-left">
              Speak directly with our transport dispatch desk in Masuri, Ghaziabad for custom bookings.
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`tel:${SITE_CONFIG.phoneRaw}`}
                className="px-4 py-2 rounded-xl bg-brand-blue hover:bg-blue-900 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <FaPhoneAlt className="text-xs" />
                <span>Call {SITE_CONFIG.phone}</span>
              </a>
              <a
                href={`https://wa.me/${BUSINESS_CONFIG.phone.whatsappRaw}?text=${encodeURIComponent('Hello Urgent Taxis! 👋 I want to book a cab directly.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <FaWhatsapp className="text-xs" />
                <span>WhatsApp Booking</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
