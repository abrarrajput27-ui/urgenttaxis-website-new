'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { SITE_CONFIG } from '@/lib/seo';
import { FaPhoneAlt, FaWhatsapp, FaFacebook, FaInstagram, FaYoutube, FaEnvelope, FaHeadset, FaHeart } from 'react-icons/fa';

export default function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services', hasDropdown: true },
    { name: 'Routes', href: '/routes' },
    { name: 'Fleet', href: '/fleet' },
    { name: 'Reviews', href: '/reviews' },
    { name: 'Blog', href: '/blog' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact Us', href: '/contact' },
  ];

  return (
    <header ref={headerRef} className="sticky top-0 z-50 font-sans w-full transition-all duration-300 bg-white border-b border-slate-200 shadow-sm">
      
      {/* Top Bar (Hidden on Mobile) */}
      <div className="hidden lg:flex border-b border-slate-100 bg-slate-50 text-[12px] py-2">
        <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          
          {/* Top Bar Left */}
          <div className="flex items-center gap-6 font-semibold">
            <div className="flex items-center gap-1.5 text-brand-green">
              <FaHeadset className="w-3.5 h-3.5" />
              <span>24/7 Customer Support</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <FaHeart className="w-3 h-3 text-slate-400" />
              <span>We are always here to help you!</span>
            </div>
          </div>

          {/* Top Bar Right */}
          <div className="flex items-center gap-6 font-semibold">
            <a href="mailto:info@urgenttaxis.com" className="flex items-center gap-1.5 text-slate-500 hover:text-brand-blue transition-colors">
              <FaEnvelope className="w-3.5 h-3.5" />
              <span>info@urgenttaxis.com</span>
            </a>
            <div className="flex items-center gap-3">
              <a href="#" className="text-[#1877F2] hover:opacity-80 transition-opacity"><FaFacebook className="w-4 h-4" /></a>
              <a href="#" className="text-[#E4405F] hover:opacity-80 transition-opacity"><FaInstagram className="w-4 h-4" /></a>
              <a href="#" className="text-[#FF0000] hover:opacity-80 transition-opacity"><FaYoutube className="w-4 h-4" /></a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center py-1 flex-shrink-0" onClick={() => setMobileOpen(false)} prefetch={true}>
          <Image
            src="/logo.jpg"
            alt="Urgent Taxis Logo"
            width={200}
            height={60}
            className="h-14 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-[15px] font-bold text-slate-800 h-full">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <div key={link.name} className="relative group h-full flex items-center">
                {link.hasDropdown ? (
                  <>
                    <span className={`hover:text-brand-green transition-colors cursor-pointer flex items-center gap-1 h-full border-b-2 ${isActive ? 'text-brand-green border-brand-green' : 'border-transparent hover:border-brand-green/30'}`}>
                      {link.name} <span className="text-[10px]">▼</span>
                    </span>
                    <div className="absolute top-full left-0 w-56 bg-white shadow-xl rounded-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col py-2 z-50 transform origin-top-left -translate-y-2 group-hover:translate-y-0">
                      <Link href="/airport-transfers" prefetch={true} className="px-5 py-2.5 hover:bg-slate-50 hover:text-brand-green text-sm border-b border-slate-50 last:border-0">Airport Transfers</Link>
                      <Link href="/local-rentals" prefetch={true} className="px-5 py-2.5 hover:bg-slate-50 hover:text-brand-green text-sm border-b border-slate-50 last:border-0">Local Rentals</Link>
                      <Link href="/corporate-taxi" prefetch={true} className="px-5 py-2.5 hover:bg-slate-50 hover:text-brand-green text-sm border-b border-slate-50 last:border-0">Corporate Taxi</Link>
                      <Link href="/tour-packages" prefetch={true} className="px-5 py-2.5 hover:bg-slate-50 hover:text-brand-green text-sm">Tour Packages</Link>
                    </div>
                  </>
                ) : (
                  <Link 
                    href={link.href} 
                    prefetch={true}
                    className={`hover:text-brand-green transition-colors h-full flex items-center border-b-2 ${isActive ? 'text-brand-green border-brand-green' : 'border-transparent hover:border-brand-green/30'}`}
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right Action Block */}
        <div className="hidden lg:flex items-center gap-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#3b2c85] flex items-center justify-center text-white shadow-sm">
              <FaPhoneAlt className="w-4 h-4" />
            </div>
            <div className="flex flex-col justify-center">
              <a href={`tel:${SITE_CONFIG.phoneRaw}`} className="text-[17px] font-black tracking-tight text-[#3b2c85] leading-none hover:text-brand-green transition-colors mb-1">
                {SITE_CONFIG.phone}
              </a>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide leading-none">Call us anytime</span>
            </div>
          </div>

          <a
            href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20would%20like%20to%20make%20an%20inquiry.%20%E2%9C%A8`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#00a859] hover:bg-[#00904d] text-white font-bold text-[15px] px-6 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg"
          >
            <FaWhatsapp className="w-5 h-5" />
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-4 lg:hidden">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
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
      </div>

      {/* Mobile Navigation Drawer */}
      <div 
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="bg-white px-4 pt-2 pb-6 space-y-4 font-sans shadow-inner border-t border-slate-100">
          <nav className="flex flex-col space-y-1 text-[15px] font-bold text-slate-700">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              
              if (link.hasDropdown) {
                return (
                  <div key={link.name} className="flex flex-col">
                    <span className="px-4 py-3 rounded-xl bg-slate-50 text-slate-500 mb-1">Services ▼</span>
                    <div className="flex flex-col pl-6 space-y-1">
                      <Link href="/airport-transfers" prefetch={true} onClick={() => setMobileOpen(false)} className="px-4 py-2.5 rounded-xl hover:bg-slate-50 hover:text-brand-green transition-colors text-[14px]">Airport Transfers</Link>
                      <Link href="/local-rentals" prefetch={true} onClick={() => setMobileOpen(false)} className="px-4 py-2.5 rounded-xl hover:bg-slate-50 hover:text-brand-green transition-colors text-[14px]">Local Rentals</Link>
                      <Link href="/corporate-taxi" prefetch={true} onClick={() => setMobileOpen(false)} className="px-4 py-2.5 rounded-xl hover:bg-slate-50 hover:text-brand-green transition-colors text-[14px]">Corporate Taxi</Link>
                      <Link href="/tour-packages" prefetch={true} onClick={() => setMobileOpen(false)} className="px-4 py-2.5 rounded-xl hover:bg-slate-50 hover:text-brand-green transition-colors text-[14px]">Tour Packages</Link>
                    </div>
                  </div>
                );
              }
              
              return (
                <Link 
                  key={link.name}
                  href={link.href}
                  prefetch={true} 
                  onClick={() => setMobileOpen(false)} 
                  className={`px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-brand-green/10 text-brand-green' : 'hover:bg-slate-50'}`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            <a href={`tel:${SITE_CONFIG.phoneRaw}`} className="w-full flex items-center justify-center gap-2 bg-[#3b2c85] text-white font-bold text-[15px] py-3.5 rounded-xl shadow-md">
              <FaPhoneAlt className="w-4 h-4" /> Call Now
            </a>
            <a href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20would%20like%20to%20make%20an%20inquiry.%20%E2%9C%A8`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-[#00a859] text-white font-bold text-[15px] py-3.5 rounded-xl shadow-md">
              <FaWhatsapp className="w-5 h-5" /> WhatsApp Booking
            </a>
            
            {/* Mobile Top Bar Info */}
            <div className="flex flex-col items-center gap-3 pt-4 pb-2 text-sm text-slate-500 font-medium">
              <a href="mailto:info@urgenttaxis.com" className="flex items-center gap-2 hover:text-brand-blue">
                <FaEnvelope /> info@urgenttaxis.com
              </a>
              <div className="flex items-center gap-4 text-lg">
                <a href="#" className="text-[#1877F2]"><FaFacebook /></a>
                <a href="#" className="text-[#E4405F]"><FaInstagram /></a>
                <a href="#" className="text-[#FF0000]"><FaYoutube /></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
