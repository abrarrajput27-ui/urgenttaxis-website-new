'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SITE_CONFIG } from '@/lib/seo';
import { FaPhoneAlt, FaWhatsapp } from 'react-icons/fa';

export default function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 font-sans shadow-sm w-full transition-all duration-300 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center py-1 flex-shrink-0">
          <Image
            src="/logo.jpg"
            alt="Urgent Taxis Logo"
            width={180}
            height={50}
            className="h-12 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-[14px] font-bold text-slate-800">
          <Link href="/" className="hover:text-brand-green transition-colors py-1">Home</Link>
          <Link href="/reviews" className="hover:text-brand-green transition-colors py-1">Reviews</Link>
          <div className="relative group py-1">
            <span className="hover:text-brand-green transition-colors cursor-pointer flex items-center gap-1">
              Services <span className="text-[10px]">▼</span>
            </span>
            <div className="absolute top-full left-0 mt-2 w-48 bg-white shadow-xl rounded-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col py-2 z-50">
              <Link href="/airport-transfers" className="px-4 py-2 hover:bg-slate-50 hover:text-brand-green text-sm">Airport Transfers</Link>
              <Link href="/local-rentals" className="px-4 py-2 hover:bg-slate-50 hover:text-brand-green text-sm">Local Rentals</Link>
              <Link href="/corporate-taxi" className="px-4 py-2 hover:bg-slate-50 hover:text-brand-green text-sm">Corporate Taxi</Link>
              <Link href="/tour-packages" className="px-4 py-2 hover:bg-slate-50 hover:text-brand-green text-sm">Tour Packages</Link>
            </div>
          </div>
          <Link href="/fleet" className="hover:text-brand-green transition-colors py-1">Fleet</Link>
          <Link href="/blog" className="hover:text-brand-green transition-colors py-1">Blog</Link>
          <Link href="/about" className="hover:text-brand-green transition-colors py-1">About Us</Link>
          <Link href="/contact" className="hover:text-brand-green transition-colors py-1">Contact Us</Link>
        </nav>

        {/* Right Action Block */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
              <FaPhoneAlt className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-500 uppercase leading-none">Call us 24/7</span>
              <a href={`tel:${SITE_CONFIG.phoneRaw}`} className="text-[15px] font-black tracking-tight text-brand-blue leading-none hover:text-brand-green transition-colors mt-0.5">
                +91 {SITE_CONFIG.phone}
              </a>
            </div>
          </div>

          <a
            href={SITE_CONFIG.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-brand-green hover:bg-brand-green-hover text-white font-bold text-sm px-6 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg"
          >
            <FaWhatsapp className="w-5 h-5" />
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-4 pb-6 space-y-4 font-sans shadow-inner">
          <nav className="flex flex-col space-y-1 text-sm font-bold text-slate-700">
            <Link href="/" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl hover:bg-slate-50">Home</Link>
            <Link href="/reviews" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl hover:bg-slate-50">Reviews</Link>
            <Link href="/fleet" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl hover:bg-slate-50">Fleet</Link>
            <Link href="/blog" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl hover:bg-slate-50">Blog</Link>
            <Link href="/about" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl hover:bg-slate-50">About Us</Link>
            <Link href="/contact" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl hover:bg-slate-50">Contact Us</Link>
          </nav>
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            <a href={`tel:${SITE_CONFIG.phoneRaw}`} className="w-full flex items-center justify-center gap-2 bg-brand-blue text-white font-bold text-sm py-3.5 rounded-xl shadow-md">
              <FaPhoneAlt /> Call {SITE_CONFIG.phone}
            </a>
            <a href={SITE_CONFIG.whatsapp} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-brand-green text-white font-bold text-sm py-3.5 rounded-xl shadow-md">
              <FaWhatsapp className="w-5 h-5" /> WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
