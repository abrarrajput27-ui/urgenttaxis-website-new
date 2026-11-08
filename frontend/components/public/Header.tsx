'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { SITE_CONFIG } from '@/lib/seo';
import { BUSINESS_CONFIG } from '@/lib/config';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { trackPhoneCall, trackWhatsAppClick } from '@/lib/analytics';
import { FaPhoneAlt, FaWhatsapp, FaFacebook, FaInstagram, FaYoutube, FaEnvelope, FaHeadset, FaHeart } from 'react-icons/fa';

export default function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
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
    <header ref={headerRef} className="sticky top-0 z-50 font-sans w-full transition-all duration-300 bg-white shadow-sm relative">
      
      {/* Top Bar (Hidden on Mobile) */}
      <div className="hidden lg:flex border-b border-slate-100 bg-slate-50 text-[13px] py-1">
        <div className="w-full px-2 sm:px-4 lg:px-6 xl:px-8 flex justify-between items-center">
          
          {/* Top Bar Left */}
          <div className="flex items-center gap-6 font-semibold">
            <div className="flex items-center gap-1.5 text-brand-green">
              <FaHeadset className="w-4 h-4" />
              <span>24/7 Customer Support</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <FaHeart className="w-3.5 h-3.5 text-slate-400" />
              <span>We are always here to help you!</span>
            </div>
          </div>

          {/* Top Bar Right */}
          <div className="flex items-center gap-6 font-semibold">
            <a href="mailto:info@urgenttaxis.in" className="flex items-center gap-2 text-slate-600 hover:text-brand-blue transition-colors">
              <FaEnvelope className="w-4 h-4" />
              <span>info@urgenttaxis.in</span>
            </a>
            {(BUSINESS_CONFIG.socialProfiles.facebook || BUSINESS_CONFIG.socialProfiles.instagram || BUSINESS_CONFIG.socialProfiles.youtube) && (
              <div className="flex items-center gap-3">
                {BUSINESS_CONFIG.socialProfiles.facebook && <a href={BUSINESS_CONFIG.socialProfiles.facebook} target="_blank" rel="noopener noreferrer" className="bg-[#1877F2] text-white p-1.5 rounded-full hover:opacity-80 transition-opacity" aria-label="Facebook"><FaFacebook className="w-3.5 h-3.5" /></a>}
                {BUSINESS_CONFIG.socialProfiles.instagram && <a href={BUSINESS_CONFIG.socialProfiles.instagram} target="_blank" rel="noopener noreferrer" className="bg-[#E4405F] text-white p-1.5 rounded-full hover:opacity-80 transition-opacity" aria-label="Instagram"><FaInstagram className="w-3.5 h-3.5" /></a>}
                {BUSINESS_CONFIG.socialProfiles.youtube && <a href={BUSINESS_CONFIG.socialProfiles.youtube} target="_blank" rel="noopener noreferrer" className="bg-[#FF0000] text-white p-1.5 rounded-full hover:opacity-80 transition-opacity" aria-label="YouTube"><FaYoutube className="w-3.5 h-3.5" /></a>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="w-full px-2 sm:px-4 lg:px-6 xl:px-8 py-0 flex items-center h-[60px] overflow-hidden">
        
        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0" onClick={() => setMobileOpen(false)} prefetch={true}>
          <div className="relative h-10 sm:h-11 w-36 sm:w-44 flex items-center overflow-hidden">
            <Image
              src="/logo.jpg"
              alt="Urgent Taxis Logo"
              width={176}
              height={44}
              className="max-h-10 sm:max-h-11 w-auto object-contain object-left"
              style={{ maxHeight: '42px', width: 'auto', height: 'auto' }}
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-5 text-[15px] font-extrabold text-slate-800 ml-auto mr-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <div key={link.name} className="relative group flex items-center">
                {link.hasDropdown ? (
                  <>
                    <Link href="/services" prefetch={true} className={`hover:text-brand-green transition-colors cursor-pointer flex items-center gap-1 pb-1 border-b-[3px] ${isActive ? 'text-brand-green border-brand-green' : 'border-transparent hover:border-brand-green/30'}`}>
                      {link.name}
                    </Link>
                    <div className="absolute top-[30px] left-0 w-56 bg-white shadow-xl rounded-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col py-2 z-50 transform origin-top-left -translate-y-2 group-hover:translate-y-0">
                      <Link href="/services" prefetch={true} className="px-5 py-2.5 hover:bg-slate-50 hover:text-brand-green text-sm font-bold border-b border-slate-50">All Services Overview</Link>
                      <Link href="/taxi-service" prefetch={true} className="px-5 py-2.5 hover:bg-slate-50 hover:text-brand-green text-sm font-bold border-b border-slate-50">NCR Taxi Service</Link>
                      <Link href="/airport-transfers" prefetch={true} className="px-5 py-2.5 hover:bg-slate-50 hover:text-brand-green text-sm font-bold border-b border-slate-50">Airport Transfers</Link>
                      <Link href="/local-rentals" prefetch={true} className="px-5 py-2.5 hover:bg-slate-50 hover:text-brand-green text-sm font-bold border-b border-slate-50">Local Rentals</Link>
                      <Link href="/corporate-taxi" prefetch={true} className="px-5 py-2.5 hover:bg-slate-50 hover:text-brand-green text-sm font-bold border-b border-slate-50">Corporate Taxi</Link>
                      <Link href="/tempo-traveller" prefetch={true} className="px-5 py-2.5 hover:bg-slate-50 hover:text-brand-green text-sm font-bold border-b border-slate-50">Tempo Traveller</Link>
                      <Link href="/bus-charter" prefetch={true} className="px-5 py-2.5 hover:bg-slate-50 hover:text-brand-green text-sm font-bold border-b border-slate-50">Bus Charter</Link>
                      <Link href="/chardham-yatra" prefetch={true} className="px-5 py-2.5 hover:bg-slate-50 hover:text-brand-green text-sm font-bold border-b border-slate-50">Chardham Yatra</Link>
                      <Link href="/tour-packages" prefetch={true} className="px-5 py-2.5 hover:bg-slate-50 hover:text-brand-green text-sm font-bold">Tour Packages</Link>
                    </div>
                  </>
                ) : (
                  <Link 
                    href={link.href} 
                    prefetch={true}
                    className={`hover:text-brand-green transition-colors pb-1 border-b-[3px] ${isActive ? 'text-brand-green border-brand-green' : 'border-transparent hover:border-brand-green/30'}`}
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right Action Block */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1e1b4b] flex items-center justify-center text-white shadow-sm">
              <FaPhoneAlt className="w-[12px] h-[12px]" />
            </div>
            <div className="flex flex-col justify-center">
              <a href={`tel:${SITE_CONFIG.phoneRaw}`} onClick={() => trackPhoneCall('Header Desktop')} className="text-[17px] font-black tracking-tight text-[#1e1b4b] leading-none hover:text-brand-green transition-colors mb-1">
                {SITE_CONFIG.phone}
              </a>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide leading-none">Call us anytime</span>
            </div>
          </div>

          <a
            href={generateWhatsAppLink(SITE_CONFIG.whatsapp, { customMessage: 'Hello Urgent Taxis! 👋\n\nI would like to make an inquiry. ✨' })}
            onClick={() => trackWhatsAppClick('Header Desktop')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-[#00a859] hover:bg-[#00904d] text-white font-bold text-[13px] px-3 py-1 rounded-full transition-all shadow-md hover:shadow-lg"
          >
            <FaWhatsapp className="w-[16px] h-[16px]" />
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-4 lg:hidden ml-auto">
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
        className={`lg:hidden absolute left-0 right-0 top-full bg-white/95 backdrop-blur-md shadow-xl overflow-hidden transition-all duration-300 ease-in-out border-t border-slate-100 ${mobileOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="bg-transparent px-4 pt-2 pb-4 space-y-3 font-sans shadow-inner border-t border-slate-100/50">
          <nav className="flex flex-col space-y-1 text-[16px] font-extrabold text-slate-800">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              
              if (link.hasDropdown) {
                return (
                  <div key={link.name} className="flex flex-col">
                    <button 
                      onClick={() => setServicesOpen(!servicesOpen)} 
                      className="px-4 py-3 rounded-xl bg-slate-50 text-slate-700 font-bold mb-1 flex justify-between items-center w-full"
                    >
                      Services 
                      <span className={`transform transition-transform ${servicesOpen ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    <div className={`flex flex-col pl-6 space-y-1 overflow-hidden transition-all duration-300 ${servicesOpen ? 'max-h-[500px]' : 'max-h-0'}`}>
                      <Link href="/services" prefetch={true} onClick={() => setMobileOpen(false)} className="px-4 py-2 rounded-xl hover:bg-slate-50 hover:text-brand-green transition-colors text-[14px] font-bold">All Services Overview</Link>
                      <Link href="/taxi-service" prefetch={true} onClick={() => setMobileOpen(false)} className="px-4 py-2 rounded-xl hover:bg-slate-50 hover:text-brand-green transition-colors text-[14px]">NCR Taxi Service</Link>
                      <Link href="/airport-transfers" prefetch={true} onClick={() => setMobileOpen(false)} className="px-4 py-2 rounded-xl hover:bg-slate-50 hover:text-brand-green transition-colors text-[14px]">Airport Transfers</Link>
                      <Link href="/local-rentals" prefetch={true} onClick={() => setMobileOpen(false)} className="px-4 py-2 rounded-xl hover:bg-slate-50 hover:text-brand-green transition-colors text-[14px]">Local Rentals</Link>
                      <Link href="/corporate-taxi" prefetch={true} onClick={() => setMobileOpen(false)} className="px-4 py-2 rounded-xl hover:bg-slate-50 hover:text-brand-green transition-colors text-[14px]">Corporate Taxi</Link>
                      <Link href="/tempo-traveller" prefetch={true} onClick={() => setMobileOpen(false)} className="px-4 py-2 rounded-xl hover:bg-slate-50 hover:text-brand-green transition-colors text-[14px]">Tempo Traveller</Link>
                      <Link href="/bus-charter" prefetch={true} onClick={() => setMobileOpen(false)} className="px-4 py-2 rounded-xl hover:bg-slate-50 hover:text-brand-green transition-colors text-[14px]">Bus Charter</Link>
                      <Link href="/chardham-yatra" prefetch={true} onClick={() => setMobileOpen(false)} className="px-4 py-2 rounded-xl hover:bg-slate-50 hover:text-brand-green transition-colors text-[14px]">Chardham Yatra</Link>
                      <Link href="/tour-packages" prefetch={true} onClick={() => setMobileOpen(false)} className="px-4 py-2 rounded-xl hover:bg-slate-50 hover:text-brand-green transition-colors text-[14px]">Tour Packages</Link>
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
          
          <div className="pt-4 border-t border-slate-100 flex flex-row gap-3">
            <a href={`tel:${SITE_CONFIG.phoneRaw}`} onClick={() => trackPhoneCall('Header Mobile')} className="flex-1 flex items-center justify-center gap-1.5 bg-[#1e1b4b] hover:bg-[#15133c] text-white font-bold text-[14px] py-3 rounded-xl shadow-md transition-colors">
              <FaPhoneAlt className="w-3.5 h-3.5" /> Call Now
            </a>
            <a href={generateWhatsAppLink(SITE_CONFIG.whatsapp, { customMessage: 'Hello Urgent Taxis! 👋\n\nI would like to make an inquiry. ✨' })}
            onClick={() => trackWhatsAppClick('Header Desktop')} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 bg-[#00a859] text-white font-bold text-[14px] py-3 rounded-xl shadow-md">
              <FaWhatsapp className="w-4 h-4" /> WhatsApp
            </a>
          </div>
            
          {/* Mobile Top Bar Info */}
          <div className="flex items-center justify-between pt-3 pb-1 border-t border-slate-100/50 text-[13px] text-slate-500 font-bold">
            <a href="mailto:info@urgenttaxis.in" className="flex items-center gap-1.5 hover:text-brand-blue">
              <FaEnvelope /> info@urgenttaxis.in
            </a>
            {(BUSINESS_CONFIG.socialProfiles.facebook || BUSINESS_CONFIG.socialProfiles.instagram || BUSINESS_CONFIG.socialProfiles.youtube) && (
              <div className="flex items-center gap-3 text-lg">
                {BUSINESS_CONFIG.socialProfiles.facebook && <a href={BUSINESS_CONFIG.socialProfiles.facebook} target="_blank" rel="noopener noreferrer" className="text-[#1877F2] hover:opacity-80" aria-label="Facebook"><FaFacebook /></a>}
                {BUSINESS_CONFIG.socialProfiles.instagram && <a href={BUSINESS_CONFIG.socialProfiles.instagram} target="_blank" rel="noopener noreferrer" className="text-[#E4405F] hover:opacity-80" aria-label="Instagram"><FaInstagram /></a>}
                {BUSINESS_CONFIG.socialProfiles.youtube && <a href={BUSINESS_CONFIG.socialProfiles.youtube} target="_blank" rel="noopener noreferrer" className="text-[#FF0000] hover:opacity-80" aria-label="YouTube"><FaYoutube /></a>}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

