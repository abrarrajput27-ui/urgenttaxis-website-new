import Link from 'next/link';
import Image from 'next/image';
import { SITE_CONFIG } from '@/lib/seo';

export default function PublicFooter() {
  return (
    <footer className="bg-[#0b132b] text-slate-300 font-sans text-sm">
      {/* 1. Top Call-to-Action Banner (Blue background with vehicle image & white pill buttons) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
        <div className="bg-[#1e40af] rounded-2xl p-6 sm:p-10 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          {/* Text Content */}
          <div className="z-10 max-w-xl space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Book your ride in just 2 clicks
            </h3>
            <p className="text-sm sm:text-base text-blue-100 font-medium">
              Get instant confirmation via WhatsApp
            </p>
            {/* Pill Action Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
              <a
                href={`tel:${SITE_CONFIG.phoneRaw}`}
                className="bg-white hover:bg-slate-100 text-[#1e1b4b] font-bold text-sm px-6 py-3 rounded-full transition-all shadow-md flex items-center gap-2"
              >
                <span>📞</span>
                <span>Call Now</span>
              </a>
              <a
                href={SITE_CONFIG.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm px-6 py-3 rounded-full transition-all shadow-md flex items-center gap-2"
              >
                <span>💬</span>
                <span>Book on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Right Vehicle Image / Graphic from Reference */}
          <div className="relative w-full max-w-xs md:max-w-sm h-36 sm:h-44 z-10 flex justify-center md:justify-end">
            <Image
              src="/hero-bg.webp"
              alt="Urgent Taxis Taxi Cab"
              width={350}
              height={180}
              className="object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* 2. Main Footer Content Grid (5 Columns on dark navy background) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Column 1: Brand Logo & Description */}
          <div className="space-y-4 lg:col-span-1">
            <div className="bg-white p-2.5 rounded-lg inline-block shadow-md">
              <Image
                src="/logo.jpg"
                alt="Urgent Taxis Logo"
                width={160}
                height={45}
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Your reliable travel partner for outstation trips, local rentals and airport transfers across India.
            </p>
            {/* Social Media Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#1877f2] flex items-center justify-center text-white font-bold text-sm hover:opacity-90 transition-opacity"
                aria-label="Facebook"
              >
                f
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm hover:opacity-90 transition-opacity"
                aria-label="Instagram"
              >
                📷
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#ff0000] flex items-center justify-center text-white font-bold text-sm hover:opacity-90 transition-opacity"
                aria-label="YouTube"
              >
                ▶
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-base tracking-tight mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-slate-500">›</span> Home
                </Link>
              </li>
              <li>
                <Link href="/routes" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-slate-500">›</span> About Us
                </Link>
              </li>
              <li>
                <Link href="/routes" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-slate-500">›</span> Our Services
                </Link>
              </li>
              <li>
                <Link href="/fleet" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-slate-500">›</span> Our Fleet
                </Link>
              </li>
              <li>
                <Link href="/routes" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-slate-500">›</span> Popular Routes
                </Link>
              </li>
              <li>
                <Link href="/airport-transfers" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-slate-500">›</span> Reviews
                </Link>
              </li>
              <li>
                <Link href="/local-rentals" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-slate-500">›</span> Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Our Services */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-base tracking-tight mb-4">
              Our Services
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link href="/routes" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-slate-500">›</span> Outstation One Way Taxi
                </Link>
              </li>
              <li>
                <Link href="/routes" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-slate-500">›</span> Outstation Round Trip Taxi
                </Link>
              </li>
              <li>
                <Link href="/airport-transfers" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-slate-500">›</span> Airport Transfer
                </Link>
              </li>
              <li>
                <Link href="/local-rentals" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-slate-500">›</span> Local Rental
                </Link>
              </li>
              <li>
                <Link href="/routes" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-slate-500">›</span> Tour Packages
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Top Routes */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-base tracking-tight mb-4">
              Top Routes
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link href="/routes" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-slate-500">›</span> Delhi to Haridwar
                </Link>
              </li>
              <li>
                <Link href="/routes" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-slate-500">›</span> Delhi to Dehradun
                </Link>
              </li>
              <li>
                <Link href="/routes" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-slate-500">›</span> Delhi to Haldwani
                </Link>
              </li>
              <li>
                <Link href="/routes" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-slate-500">›</span> Delhi to Rishikesh
                </Link>
              </li>
              <li>
                <Link href="/routes" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-slate-500">›</span> Delhi to Shimla
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Contact Us */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-base tracking-tight mb-4">
              Contact Us
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="text-white text-base">📞</span>
                <div>
                  <a href={`tel:${SITE_CONFIG.phoneRaw}`} className="text-white font-bold hover:underline">
                    +91 {SITE_CONFIG.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-white text-base">✉</span>
                <a href={`mailto:${SITE_CONFIG.supportEmail}`} className="text-slate-300 hover:text-white transition-colors">
                  {SITE_CONFIG.supportEmail}
                </a>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-white text-base">📍</span>
                <span className="text-slate-300 leading-relaxed">
                  {SITE_CONFIG.address}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Bottom Legal / Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <p>© {new Date().getFullYear()} Urgent Taxis. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link href="/routes" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link href="/routes" className="hover:text-white transition-colors">
            Terms & Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
}

