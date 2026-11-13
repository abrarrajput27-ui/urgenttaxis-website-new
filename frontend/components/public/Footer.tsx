import ContextualSEONavigation from '@/components/public/ContextualSEONavigation';
import Link from 'next/link';
import Image from 'next/image';
import { SITE_CONFIG } from '@/lib/seo';
import { BUSINESS_CONFIG } from '@/lib/config';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { FaFacebookF, FaInstagram, FaYoutube, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';

export default function PublicFooter() {
  return (
    <>
      {/* 1. Top Call-to-Action Banner */}
      <div className="w-full bg-transparent pt-16 sm:pt-24 lg:pt-8 pb-8 sm:pb-12 lg:pb-6 my-6 sm:my-10 relative z-20 overflow-x-clip">
        <div className="w-[98%] lg:w-[94%] xl:max-w-7xl mx-auto relative z-20">
          <div className="bg-[#0a1128] relative rounded-[2rem] text-center px-3 sm:px-8 lg:px-12 pt-24 sm:pt-28 lg:py-6 shadow-2xl border border-white/10 flex flex-col lg:flex-row lg:items-center lg:justify-between min-h-[auto] lg:min-h-[100px] overflow-visible">
            {/* Authentic Dotted Pattern matching Footer & Master Theme */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none rounded-[2rem]" />
            
            <div className="relative z-20 space-y-1 lg:space-y-2 mt-2 lg:mt-0 lg:w-[65%] flex flex-col items-center justify-center">
              <h3 className="text-white text-[22px] sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-center">
                Book your ride in just 2 clicks
              </h3>
              <p className="text-blue-100 text-[12px] sm:text-sm lg:text-base font-medium pb-2 lg:pb-0 text-center">
                Get instant confirmation via WhatsApp
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-2 lg:mt-3 pb-6 lg:pb-0 w-full">
                <a
                  href={`tel:${SITE_CONFIG.phoneRaw}`}
                  className="bg-white hover:bg-slate-50 text-[#0a1128] font-black text-[12px] sm:text-sm px-4 sm:px-6 py-2.5 lg:py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 flex-none sm:flex-none"
                >
                  <FaPhoneAlt /> Call Now
                </a>
                <a
                  href={generateWhatsAppLink(SITE_CONFIG.whatsapp, { customMessage: 'Hello Urgent Taxis! 👋\n\nI would like to make an inquiry. ✨' })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#00a859] hover:bg-emerald-600 text-white font-black text-[12px] sm:text-sm px-4 sm:px-6 py-2.5 lg:py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none whitespace-nowrap"
                >
                  <FaWhatsapp className="text-lg" /> Book on WhatsApp
                </a>
              </div>
            </div>

            {/* Overflowing Car Image - Half Outside Container */}
            <div className="absolute -top-20 sm:-top-24 lg:top-1/2 left-1/2 lg:left-auto lg:right-4 -translate-x-1/2 lg:translate-x-0 lg:-translate-y-1/2 w-[98%] max-w-[340px] sm:max-w-[400px] lg:max-w-[440px] xl:max-w-[500px] z-10 pointer-events-none">
              <Image
                src="/cta-hero.webp"
                alt="Urgent Taxis Cab"
                width={700}
                height={400}
                className="object-contain w-full h-auto drop-shadow-2xl"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      <footer className="relative bg-[#0a1128] text-slate-300 font-sans text-sm mt-0 overflow-hidden border-t border-white/10 print:hidden">
        {/* Authentic Dotted Pattern matching Route Pages Hero Section */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="relative z-10">
        {/* 2. Main Footer Content Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 border-b border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          
          {/* Column 1: Brand Logo & Description */}
          <div className="space-y-4 col-span-1">
            <div className="bg-white p-2.5 rounded-lg inline-block">
              <Image
                src="/logo.jpg"
                alt="Urgent Taxis Logo"
                width={160}
                height={45}
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="text-slate-400 text-[13px] leading-relaxed">
              Your reliable travel partner for outstation trips, local rentals and airport transfers in Ghaziabad, Delhi NCR and North India.
            </p>
            <p className="text-brand-green font-bold text-xs tracking-wider">
              हमेशा आपके साथ!
            </p>
            {/* Social Media Profiles (Rendered only when verified URLs are configured) */}
            {(BUSINESS_CONFIG.socialProfiles.facebook || BUSINESS_CONFIG.socialProfiles.instagram || BUSINESS_CONFIG.socialProfiles.youtube) && (
              <div className="flex items-center gap-3">
                {BUSINESS_CONFIG.socialProfiles.facebook && (
                  <a href={BUSINESS_CONFIG.socialProfiles.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-[#1877f2] flex items-center justify-center text-white hover:opacity-80 transition-opacity" aria-label="Facebook">
                    <FaFacebookF size={14} />
                  </a>
                )}
                {BUSINESS_CONFIG.socialProfiles.instagram && (
                  <a href={BUSINESS_CONFIG.socialProfiles.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white hover:opacity-80 transition-opacity" aria-label="Instagram">
                    <FaInstagram size={14} />
                  </a>
                )}
                {BUSINESS_CONFIG.socialProfiles.youtube && (
                  <a href={BUSINESS_CONFIG.socialProfiles.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-[#ff0000] flex items-center justify-center text-white hover:opacity-80 transition-opacity" aria-label="YouTube">
                    <FaYoutube size={14} />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4 col-span-1">
            <h4 className="text-white font-bold text-[15px] tracking-wide uppercase">
              Quick links
            </h4>
            <ul className="space-y-3 text-[13px] text-slate-400">
              <li><Link href="/" className="hover:text-white transition-colors block">Home</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors block">About Us</Link></li>
              <li><Link href="/fleet" className="hover:text-white transition-colors block">Our Fleet</Link></li>
              <li><Link href="/routes" className="hover:text-white transition-colors block">Popular Routes</Link></li>
              <li><Link href="/reviews" className="hover:text-white transition-colors block">Reviews</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors block">Blog</Link></li>
              <li><Link href="/taxi-service" className="hover:text-white transition-colors block">NCR Taxi Service</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors block">FAQ</Link></li>
              <li><Link href="/booking-policy" className="hover:text-white transition-colors block">Booking Policy</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors block">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 3: Our Services */}
          <div className="space-y-4 col-span-1">
            <h4 className="text-white font-bold text-[15px] tracking-wide uppercase">
              Our services
            </h4>
            <ul className="space-y-3 text-[13px] text-slate-400">
              <li><Link href="/routes" className="hover:text-white transition-colors block">Outstation Cabs</Link></li>
              <li><Link href="/airport-transfers" className="hover:text-white transition-colors block">Airport Transfers</Link></li>
              <li><Link href="/local-rentals" className="hover:text-white transition-colors block">Local Rentals</Link></li>
              <li><Link href="/corporate-taxi" className="hover:text-white transition-colors block">Corporate Taxi</Link></li>
              <li><Link href="/tempo-traveller" className="hover:text-white transition-colors block">Tempo Traveller</Link></li>
              <li><Link href="/bus-charter" className="hover:text-white transition-colors block">Bus Charter</Link></li>
              <li><Link href="/chardham-yatra" className="hover:text-white transition-colors block">Chardham Yatra</Link></li>
              <li><Link href="/tour-packages" className="hover:text-white transition-colors block">Tour Packages</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="space-y-4 col-span-1">
            <h4 className="text-white font-bold text-[15px] tracking-wide uppercase">
              Contact Us
            </h4>
            <div className="space-y-3 text-[13px] text-slate-400">
              <div className="flex items-start gap-3">
                <FaPhoneAlt className="text-emerald-500 mt-1 shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-500 block uppercase font-medium">24/7 Helpline</span>
                  <a href={`tel:${SITE_CONFIG.phoneRaw}`} className="hover:text-white font-semibold transition-colors block">
                    {SITE_CONFIG.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaWhatsapp className="text-emerald-500 mt-1 shrink-0 text-base" />
                <div>
                  <span className="text-[11px] text-slate-500 block uppercase font-medium">WhatsApp Booking</span>
                  <a
                    href={generateWhatsAppLink(SITE_CONFIG.whatsapp, { customMessage: 'Hello Urgent Taxis! 👋\n\nI need to book a cab.' })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white font-semibold transition-colors block"
                  >
                    {BUSINESS_CONFIG.phone.whatsapp}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaEnvelope className="text-slate-400 mt-1 shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-500 block uppercase font-medium">Email Desk</span>
                  <a href={`mailto:${SITE_CONFIG.supportEmail}`} className="hover:text-white transition-colors block break-all">
                    {SITE_CONFIG.supportEmail}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-slate-400 mt-1 shrink-0 text-base" />
                <div>
                  <span className="text-[11px] text-slate-500 block uppercase font-medium">Head Office</span>
                  <span className="leading-relaxed text-xs block">
                    {SITE_CONFIG.address}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Structured Contextual SEO Navigation (Requirements 3 & 4) */}
      <ContextualSEONavigation />

      {/* 4. Bottom Legal / Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] sm:text-[12px] text-slate-500 text-center sm:text-left">
        <p>© 2026 Urgent Taxis. All rights reserved.</p>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:gap-6">
          <Link href="/privacy" className="hover:text-brand-green transition-colors">
            Privacy Policy
          </Link>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <Link href="/terms" className="hover:text-brand-green transition-colors">
            Terms of Use
          </Link>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <Link href="/booking-policy" className="hover:text-brand-green transition-colors">
            Booking Policy
          </Link>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <Link href="/cancellation" className="hover:text-brand-green transition-colors">
            Cancellation Policy
          </Link>
        </div>
      </div>

      {/* 5. Permanent Designer Credit with Smooth Continuous Horizontal Scrolling Animation (Requirement 8) */}
      <div className="border-t border-white/5 py-3 overflow-hidden w-full max-w-full pb-16 md:pb-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden w-full max-w-full">
          <div className="designer-credit-marquee">
            <div className="footer-designer-credit text-[13px] sm:text-[14px] text-slate-400">
              <span className="font-normal">Designed by </span>
              <strong className="font-bold text-slate-200">Mantsha Khan</strong>
            </div>
          </div>
        </div>
      </div>
        </div>
    </footer>
    </>
  );
}
