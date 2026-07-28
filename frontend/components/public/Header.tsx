'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SITE_CONFIG } from '@/lib/seo';

export default function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 font-sans shadow-sm bg-white">
      {/* 1. Top Bar (White background matching reference video frame) */}
      <div className="bg-white text-slate-600 text-[12px] font-medium py-1.5 px-4 sm:px-6 lg:px-8 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2">
          {/* Headset / Support Icon */}
          <span className="text-[#10b981]">🎧</span>
          <span className="font-bold text-slate-800">24/7 Customer Support</span>
          <span className="hidden md:inline text-slate-400 ml-2 flex items-center gap-1">
            <span className="text-rose-500">♡</span> We are always here to help you!
          </span>
        </div>
        <div className="flex items-center gap-4 text-[12px]">
          <a href={`mailto:${SITE_CONFIG.supportEmail}`} className="hover:underline text-slate-600 flex items-center gap-1.5">
            <span className="text-slate-400">✉</span>
            <span>{SITE_CONFIG.supportEmail}</span>
          </a>
          
          {/* Social Icons (Facebook, Instagram, YouTube) */}
          <div className="hidden sm:flex items-center gap-2 ml-2">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center transition-colors" aria-label="Facebook">
              <span className="text-[10px] font-bold">f</span>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center transition-colors" aria-label="Instagram">
              <span className="text-[10px] font-bold">📷</span>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center transition-colors" aria-label="YouTube">
              <span className="text-[10px] font-bold">▶</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="bg-white text-slate-900 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Official Urgent Taxis Brand Logo */}
          <Link href="/" className="flex items-center gap-2 py-1">
            <Image
              src="/logo.jpg"
              alt="Urgent Taxis Logo"
              width={200}
              height={55}
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-[15px] font-bold text-slate-800">
            <Link href="/" className="text-[#059669] hover:text-[#059669] transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#059669]">
              Home
            </Link>
            <Link href="/routes" className="hover:text-[#059669] transition-colors py-1">
              Services
            </Link>
            <Link href="/routes" className="hover:text-[#059669] transition-colors py-1">
              Routes
            </Link>
            <Link href="/fleet" className="hover:text-[#059669] transition-colors py-1">
              Fleet
            </Link>
            <Link href="/airport-transfers" className="hover:text-[#059669] transition-colors py-1">
              Reviews
            </Link>
            <Link href="/local-rentals" className="hover:text-[#059669] transition-colors py-1">
              Blog
            </Link>
            <Link href="/routes" className="hover:text-[#059669] transition-colors py-1">
              About Us
            </Link>
            <Link href="/routes" className="hover:text-[#059669] transition-colors py-1">
              Contact Us
            </Link>
          </nav>

          {/* Right Action Block (Call CTA Pill + WhatsApp Button) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Call Us Anytime Badge/Pill */}
            <a
              href={`tel:${SITE_CONFIG.phoneRaw}`}
              className="flex items-center gap-3 bg-[#1e1b4b] text-white px-4 py-2 rounded-full hover:bg-[#2e2a72] transition-colors shadow-sm"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-sm">
                📞
              </div>
              <div className="flex flex-col pr-1">
                <span className="text-[14px] font-black tracking-tight leading-tight">
                  {SITE_CONFIG.phone}
                </span>
                <span className="text-[9px] font-semibold text-slate-300 tracking-wider uppercase leading-none mt-0.5">
                  CALL US ANYTIME
                </span>
              </div>
            </a>

            {/* WhatsApp CTA Button */}
            <a
              href={SITE_CONFIG.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm px-5 py-2.5 rounded-full transition-all shadow-sm"
            >
              <span className="text-base">💬</span>
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 font-sans">
            <nav className="flex flex-col space-y-2 text-sm font-bold text-slate-800">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 text-[#059669]"
              >
                Home
              </Link>
              <Link
                href="/routes"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-900"
              >
                Outstation Routes & Services
              </Link>
              <Link
                href="/fleet"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-900"
              >
                Taxi Fleet
              </Link>
              <Link
                href="/airport-transfers"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-900"
              >
                Airport Transfers
              </Link>
              <Link
                href="/local-rentals"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-900"
              >
                Local Rentals
              </Link>
            </nav>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
              <a
                href={`tel:${SITE_CONFIG.phoneRaw}`}
                className="w-full flex items-center justify-center gap-2 bg-[#1e1b4b] text-white font-bold text-sm py-3 rounded-full shadow-sm"
              >
                📞 Call {SITE_CONFIG.phone}
              </a>
              <a
                href={SITE_CONFIG.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#059669] text-white font-bold text-sm py-3 rounded-full shadow-sm"
              >
                💬 Chat on WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

