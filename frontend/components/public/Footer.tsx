import Link from 'next/link';
import Image from 'next/image';
import { SITE_CONFIG } from '@/lib/seo';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { FaFacebookF, FaInstagram, FaYoutube, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';

export default function PublicFooter() {
  return (
    <>
      {/* 1. Top Call-to-Action Banner */}
      <div className="w-full bg-white pt-8 pb-4 lg:pt-4 lg:pb-4 relative z-20">
        <div className="w-[98%] lg:w-[94%] xl:max-w-7xl mx-auto relative z-20">
          <div className="bg-[#1a419c] relative rounded-[2rem] text-center px-3 sm:px-8 lg:px-12 pt-24 sm:pt-28 lg:py-6 shadow-2xl border border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between min-h-[auto] lg:min-h-[100px]">
            
            <div className="relative z-20 space-y-1 lg:space-y-2 mt-2 lg:mt-0 lg:w-[65%] flex flex-col items-center justify-center">
              <h3 className="text-white text-[22px] sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-center">
                Book your ride in just 2 clicks
              </h3>
              <p className="text-blue-100 text-[12px] sm:text-sm lg:text-base font-medium pb-2 lg:pb-0 text-center">
                Get instant confirmation via WhatsApp
              </p>
              
              <div className="flex flex-row items-center justify-center gap-2 sm:gap-3 mt-2 lg:mt-3 pb-6 lg:pb-0 w-full">
                <a
                  href={`tel:${SITE_CONFIG.phoneRaw}`}
                  className="bg-white hover:bg-slate-50 text-[#1a419c] font-black text-[12px] sm:text-sm px-4 sm:px-6 py-2.5 lg:py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 flex-none sm:flex-none"
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

            {/* Overflowing Car Image */}
            <div className="absolute -top-20 sm:-top-24 lg:top-1/2 left-1/2 lg:left-auto lg:right-4 -translate-x-1/2 lg:translate-x-0 lg:-translate-y-1/2 w-[98%] max-w-[340px] sm:max-w-[400px] lg:max-w-[440px] xl:max-w-[500px] z-10 pointer-events-none">
              <Image
                src="/cta-hero.png"
                alt="Urgent Taxis Cab"
                width={700}
                height={400}
                className="object-contain w-full h-auto drop-shadow-2xl mix-blend-multiply"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-[#0b101e] text-slate-300 font-sans text-sm mt-0">
        {/* 2. Main Footer Content Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 border-b border-white/10">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-row items-center justify-between gap-2 text-[11px] sm:text-[12px] text-slate-500">
        <p>© 2026 Urgent Taxis.</p>
        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/privacy" className="hover:text-brand-green transition-colors whitespace-nowrap">
            Privacy Policy
          </Link>
          <span className="text-slate-700">|</span>
          <Link href="/terms" className="hover:text-brand-green transition-colors whitespace-nowrap">
            Terms of Use
          </Link>
        </div>
      </div>
    </footer>
    </>
  );
}
