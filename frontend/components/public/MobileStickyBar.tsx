'use client';

import { useState, useEffect } from 'react';
import { Phone, MessageSquare } from 'lucide-react';
import { BUSINESS_CONFIG } from '@/lib/config';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { trackPhoneCall, trackWhatsAppClick } from '@/lib/analytics';

export default function MobileStickyBar() {
  const callDigits = BUSINESS_CONFIG.phone.primaryRaw.replace(/\D/g, '') || '917310651940';
  const whatsappUrl = generateWhatsAppLink();
  const [isInputActive, setIsInputActive] = useState(false);

  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        setIsInputActive(true);
      }
    };

    const handleFocusOut = () => {
      setIsInputActive(false);
    };

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);

    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  return (
    <aside
      id="mobile-contact-bar"
      aria-label="Quick Mobile Contacts"
      className={`md:hidden fixed z-40 right-3 flex items-center gap-2 pointer-events-auto transition-all duration-300 ${
        isInputActive ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 translate-y-0'
      }`}
      style={{ bottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <a
        id="mobile-call-button"
        href={`tel:+${callDigits}`}
        onClick={() => trackPhoneCall('Mobile Sticky Bar')}
        aria-label="Call Urgent Taxis at 7310651940"
        className="flex items-center gap-1.5 py-2 px-3 rounded-full bg-[#1e1b4b] hover:bg-[#0f172a] active:scale-95 text-white font-bold text-xs shadow-lg shadow-blue-950/30 border border-white/20 transition-all backdrop-blur-xs"
      >
        <Phone className="w-3.5 h-3.5 text-brand-green shrink-0" />
        <span className="truncate">Call Now</span>
      </a>

      <a
        id="mobile-whatsapp-button"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackWhatsAppClick('Mobile Sticky Bar')}
        aria-label="Chat on WhatsApp at 8595066033"
        className="flex items-center gap-1.5 py-2 px-3 rounded-full bg-[#059669] hover:bg-[#047857] active:scale-95 text-white font-bold text-xs shadow-lg shadow-emerald-950/30 border border-white/20 transition-all backdrop-blur-xs"
      >
        <MessageSquare className="w-3.5 h-3.5 text-white shrink-0" />
        <span className="truncate">WhatsApp</span>
      </a>
    </aside>
  );
}
