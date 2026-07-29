import Link from 'next/link';
import Image from 'next/image';
import { SITE_CONFIG } from '@/lib/seo';
import { FaFacebookF, FaInstagram, FaYoutube, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

export default function PublicFooter() {
  return (
    <footer className="bg-[#0b101e] text-slate-300 font-sans text-sm">
      {/* 1. Top Call-to-Action Banner */}
      <div className="bg-brand-blue relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between py-6 md:py-8 relative overflow-hidden">
          <div className="z-10 text-white flex-1 md:pl-20">
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight mb-6 text-center md:text-left">
              Book your ride in <br className="hidden md:block"/> just 2 clicks
            </h3>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <a
                href={`tel:${SITE_CONFIG.phoneRaw}`}
                className="bg-white hover:bg-slate-100 text-brand-blue font-bold text-sm px-8 py-3 rounded-md transition-all shadow-md flex items-center gap-2"
              >
                Call Now
              </a>
              <a
                href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20would%20like%20to%20make%20an%20inquiry.%20%E2%9C%A8`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-green hover:bg-brand-green-hover text-white font-bold text-sm px-8 py-3 rounded-md transition-all shadow-md flex items-center gap-2"
              >
                Book WhatsApp
              </a>
            </div>
          </div>

          <div className="relative w-full max-w-sm h-48 md:h-64 z-10 flex justify-center md:justify-end mt-8 md:mt-0 md:pr-10">
            <Image
              src="/hero-bg.webp"
              alt="Urgent Taxis Taxi Cab"
              width={450}
              height={250}
              className="object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* 2. Main Footer Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 border-b border-white/10">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8">
          
          {/* Column 1: Brand Logo & Description */}
          <div className="space-y-4 col-span-2 lg:col-span-1">
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
              Your reliable travel partner for outstation trips, local rentals and airport transfers across India.
            </p>
            {/* Social Media Icons */}
            <div className="flex items-center gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#1877f2] flex items-center justify-center text-white hover:opacity-80 transition-opacity" aria-label="Facebook">
                <FaFacebookF size={14} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white hover:opacity-80 transition-opacity" aria-label="Instagram">
                <FaInstagram size={14} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#ff0000] flex items-center justify-center text-white hover:opacity-80 transition-opacity" aria-label="YouTube">
                <FaYoutube size={14} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4 col-span-1">
            <h4 className="text-white font-bold text-[15px] tracking-wide uppercase">
              Quick links
            </h4>
            <ul className="space-y-3 text-[13px] text-slate-400">
              <li><Link href="/" prefetch={true} className="hover:text-white transition-colors block">Home</Link></li>
              <li><Link href="/about" prefetch={true} className="hover:text-white transition-colors block">About Us</Link></li>
              <li><Link href="/fleet" prefetch={true} className="hover:text-white transition-colors block">Our Fleet</Link></li>
              <li><Link href="/routes" prefetch={true} className="hover:text-white transition-colors block">Popular Routes</Link></li>
              <li><Link href="/reviews" prefetch={true} className="hover:text-white transition-colors block">Reviews</Link></li>
              <li><Link href="/blog" prefetch={true} className="hover:text-white transition-colors block">Blog</Link></li>
              <li><Link href="/faq" prefetch={true} className="hover:text-white transition-colors block">FAQ</Link></li>
              <li><Link href="/contact" prefetch={true} className="hover:text-white transition-colors block">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 3: Our Services */}
          <div className="space-y-4 col-span-1">
            <h4 className="text-white font-bold text-[15px] tracking-wide uppercase">
              Our services
            </h4>
            <ul className="space-y-3 text-[13px] text-slate-400">
              <li><Link href="/fleet" prefetch={true} className="hover:text-white transition-colors block">Outstation Cabs</Link></li>
              <li><Link href="/local-rentals" prefetch={true} className="hover:text-white transition-colors block">Local Rentals</Link></li>
              <li><Link href="/corporate-taxi" prefetch={true} className="hover:text-white transition-colors block">Corporate Taxi</Link></li>
              <li><Link href="/tempo-traveller" prefetch={true} className="hover:text-white transition-colors block">Tempo Traveller</Link></li>
              <li><Link href="/tour-packages" prefetch={true} className="hover:text-white transition-colors block">Tour Packages</Link></li>
            </ul>
          </div>

          {/* Column 4: Top Routes */}
          <div className="space-y-4 col-span-1">
            <h4 className="text-white font-bold text-[15px] tracking-wide uppercase">
              Top Routes
            </h4>
            <ul className="space-y-3 text-[13px] text-slate-400">
              <li><Link href="/routes/delhi-to-haridwar" prefetch={true} className="hover:text-white transition-colors block">Delhi to Haridwar</Link></li>
              <li><Link href="/routes/delhi-to-dehradun" prefetch={true} className="hover:text-white transition-colors block">Delhi to Dehradun</Link></li>
              <li><Link href="/routes/delhi-to-haldwani" prefetch={true} className="hover:text-white transition-colors block">Delhi to Haldwani</Link></li>
              <li><Link href="/routes/delhi-to-rishikesh" prefetch={true} className="hover:text-white transition-colors block">Delhi to Rishikesh</Link></li>
              <li><Link href="/routes/delhi-to-shimla" prefetch={true} className="hover:text-white transition-colors block">Delhi to Shimla</Link></li>
            </ul>
          </div>

          {/* Column 5: Contact Us */}
          <div className="space-y-4 col-span-2 lg:col-span-1">
            <h4 className="text-white font-bold text-[15px] tracking-wide uppercase">
              Contact Us
            </h4>
            <div className="space-y-4 text-[13px] text-slate-400">
              <div className="flex items-start gap-3">
                <FaPhoneAlt className="text-slate-400 mt-1 shrink-0" />
                <div>
                  <a href={`tel:${SITE_CONFIG.phoneRaw}`} className="hover:text-white transition-colors block">
                    +91 {SITE_CONFIG.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaEnvelope className="text-slate-400 mt-1 shrink-0" />
                <a href={`mailto:${SITE_CONFIG.supportEmail}`} className="hover:text-white transition-colors block break-all">
                  {SITE_CONFIG.supportEmail}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-slate-400 mt-1 shrink-0 text-base" />
                <span className="leading-relaxed">
                  Head Office: Shop No. 1, Ground Floor, Chilla Gaon, Mayur Vihar Phase 1, New Delhi - 110091
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Links Matrix */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b border-white/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-[12px] text-slate-500">
          <div>
            <h5 className="text-white font-bold mb-3">Popular City Taxi Services</h5>
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              <Link href="/local-rentals" className="hover:text-white transition-colors">Taxi Services in Delhi</Link> <span>•</span>
              <Link href="/local-rentals" className="hover:text-white transition-colors">Taxi Services in Gurgaon</Link> <span>•</span>
              <Link href="/local-rentals" className="hover:text-white transition-colors">Taxi Services in Noida</Link> <span>•</span>
              <Link href="/local-rentals" className="hover:text-white transition-colors">Taxi Services in Ghaziabad</Link> <span>•</span>
              <Link href="/local-rentals" className="hover:text-white transition-colors">Taxi Services in Faridabad</Link>
            </div>
          </div>
          <div>
            <h5 className="text-white font-bold mb-3">Top Airport Routes</h5>
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              <Link href="/airport-transfers" className="hover:text-white transition-colors">Delhi Airport</Link> <span>•</span>
              <Link href="/airport-transfers" className="hover:text-white transition-colors">Jaipur Airport</Link> <span>•</span>
              <Link href="/airport-transfers" className="hover:text-white transition-colors">Chandigarh Airport</Link> <span>•</span>
              <Link href="/airport-transfers" className="hover:text-white transition-colors">Dehradun Airport</Link> <span>•</span>
              <Link href="/airport-transfers" className="hover:text-white transition-colors">Amritsar Airport</Link>
            </div>
          </div>
          <div className="sm:col-span-2 md:col-span-1">
            <h5 className="text-white font-bold mb-3">Delhi Airport Routes</h5>
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              <Link href="/airport-transfers" className="hover:text-white transition-colors">IGI to Gurgaon</Link> <span>•</span>
              <Link href="/airport-transfers" className="hover:text-white transition-colors">IGI to Noida</Link> <span>•</span>
              <Link href="/airport-transfers" className="hover:text-white transition-colors">IGI to Faridabad</Link> <span>•</span>
              <Link href="/airport-transfers" className="hover:text-white transition-colors">IGI to Ghaziabad</Link> <span>•</span>
              <Link href="/airport-transfers" className="hover:text-white transition-colors">IGI to Meerut</Link>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Legal / Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-slate-500">
        <p>© Copyright 2024. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="hover:text-brand-green transition-colors">
            Privacy Policy
          </Link>
          <span className="text-slate-700">|</span>
          <Link href="/terms" className="hover:text-brand-green transition-colors">
            Terms of Use
          </Link>
        </div>
      </div>
    </footer>
  );
}
