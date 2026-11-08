'use client';

import { useState } from 'react';
import { CustomerReview, CUSTOMER_REVIEWS, REVIEWS_OVERALL_STATS } from '@/lib/data/reviews-data';
import { FaStar, FaGoogle, FaCheckCircle, FaCar, FaRoute, FaUserCheck, FaWhatsapp, FaShieldAlt } from 'react-icons/fa';
import Link from 'next/link';

export default function ReviewsViewer() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filterTabs = [
    { id: 'all', label: 'All Reviews' },
    { id: 'outstation', label: 'Outstation Trips' },
    { id: 'airport', label: 'Airport Transfers' },
    { id: 'pilgrimage', label: 'Pilgrimage Darshan' },
    { id: 'family', label: 'Family Tours' },
    { id: 'corporate', label: 'Corporate Travel' },
  ];

  const filteredReviews = CUSTOMER_REVIEWS.filter((review) => {
    const matchesFilter = activeFilter === 'all' || review.tripType === activeFilter;
    const matchesSearch =
      searchQuery === '' ||
      review.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.vehicle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-10">
      {/* 1. Google Rating Summary Stats Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left: Overall Score */}
          <div className="md:col-span-5 text-center md:text-left space-y-3 md:border-r md:border-slate-100 md:pr-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-brand-blue text-xs font-bold">
              <FaGoogle className="text-red-500" />
              <span>Google Verified Customer Ratings</span>
            </div>

            <div className="flex items-baseline justify-center md:justify-start gap-3">
              <span className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight">
                {REVIEWS_OVERALL_STATS.averageRating}
              </span>
              <div className="space-y-1 text-left">
                <div className="flex items-center text-amber-400 gap-1 text-lg">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>
                <p className="text-xs font-bold text-slate-500">
                  Based on <strong>{REVIEWS_OVERALL_STATS.totalReviewsCount}</strong> verified rides
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              100% genuine passenger experiences collected from completed outstation trips, airport transfers, and local packages across North India.
            </p>
          </div>

          {/* Right: Verified Performance Highlights */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1">
              <span className="text-2xl font-black text-brand-green block">99.4%</span>
              <span className="text-xs font-bold text-slate-700 block">On-Time Dispatch</span>
              <span className="text-[10px] text-slate-500 block">Early driver arrival</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1">
              <span className="text-2xl font-black text-brand-blue block">96%</span>
              <span className="text-xs font-bold text-slate-700 block">5-Star Reviews</span>
              <span className="text-[10px] text-slate-500 block">Exceptional satisfaction</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1 col-span-2 sm:col-span-1">
              <span className="text-2xl font-black text-emerald-800 block">15 Lakh+</span>
              <span className="text-xs font-bold text-slate-700 block">Safe Kilometers</span>
              <span className="text-[10px] text-slate-500 block">Commercial yellow plate</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                activeFilter === tab.id
                  ? 'bg-brand-blue text-white shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search by city, name or car..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>
      </div>

      {/* 3. Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReviews.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 space-y-4 group"
          >
            <div className="space-y-3">
              {/* Card Header: Avatar + User Info + Google Badge */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${review.avatarBg} text-white font-black text-sm flex items-center justify-center shadow-xs flex-shrink-0`}
                  >
                    {review.initials}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-blue transition-colors">
                      {review.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">{review.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-bold text-blue-700 flex-shrink-0">
                  <FaGoogle className="text-red-500 text-[11px]" />
                  <span>Google</span>
                </div>
              </div>

              {/* Stars & Verified Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center text-amber-400 gap-1 text-sm">
                  {[...Array(review.rating)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>

                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  <FaCheckCircle className="text-emerald-800 text-[9px]" /> Verified Ride
                </span>
              </div>

              {/* Route Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-700 w-full truncate">
                <FaRoute className="text-brand-green flex-shrink-0 text-xs" />
                <span className="truncate">{review.route}</span>
              </div>

              {/* Highlight Headline */}
              {review.highlight && (
                <p className="text-xs font-black text-brand-blue">
                  &ldquo;{review.highlight}&rdquo;
                </p>
              )}

              {/* Review Text */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {review.comment}
              </p>
            </div>

            {/* Card Footer: Vehicle + Driver */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <FaCar className="text-brand-blue" />
                <strong>{review.vehicle}</strong>
              </span>

              {review.driverMention && (
                <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  {review.driverMention}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 4. Action Card: Share Review on Google / WhatsApp */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0a1128] to-[#1e293b] text-white p-8 sm:p-10 shadow-xl space-y-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold">
          <FaUserCheck className="text-brand-green" />
          <span>Help Other Travelers Plan Better</span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
          Have You Traveled with Urgent Taxis Recently?
        </h2>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
          Whether you traveled to a hill station, completed an early morning airport drop, or went on a family pilgrimage, we would love to hear your feedback!
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <a
            href="https://wa.me/918595066033?text=Hello%20Urgent%20Taxis%2C%20I%20would%20like%20to%20share%20my%20recent%20ride%20feedback%20and%20review."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white font-black text-sm shadow-lg transition-transform hover:scale-105"
          >
            <FaWhatsapp className="text-base" />
            <span>Share Feedback on WhatsApp</span>
          </a>

          <Link
            href="/routes"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all"
          >
            <FaCar className="text-brand-green" />
            <span>Book Your Next Ride</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
