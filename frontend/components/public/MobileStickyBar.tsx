import { Phone, MessageSquare } from 'lucide-react';
import { BUSINESS_CONFIG } from '@/lib/config';

export default function MobileStickyBar() {
  const callDigits = BUSINESS_CONFIG.phone.primaryRaw.replace(/\D/g, '') || '917310651940';
  const whatsappDigits = BUSINESS_CONFIG.phone.whatsappRaw || '918595066033';

  const whatsappUrl = `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
    'Hello Urgent Taxis! 👋 I want to book a cab. Please share details and vehicle availability.'
  )}`;

  return (
    <aside
      id="mobile-contact-bar"
      aria-label="Quick Mobile Contacts"
      className="md:hidden fixed z-50 right-3.5 flex items-center gap-2 pointer-events-auto"
      style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <a
        id="mobile-call-button"
        href={`tel:+${callDigits}`}
        aria-label="Call Urgent Taxis at 7310651940"
        className="flex items-center gap-1.5 py-2.5 px-3.5 rounded-full bg-[#1e1b4b] hover:bg-[#0f172a] active:scale-95 text-white font-black text-xs shadow-lg shadow-blue-950/30 border border-white/20 transition-all backdrop-blur-xs"
      >
        <Phone className="w-3.5 h-3.5 text-brand-green shrink-0" />
        <span className="truncate">Call Now</span>
      </a>

      <a
        id="mobile-whatsapp-button"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp at 8595066033"
        className="flex items-center gap-1.5 py-2.5 px-3.5 rounded-full bg-[#059669] hover:bg-[#047857] active:scale-95 text-white font-black text-xs shadow-lg shadow-emerald-950/30 border border-white/20 transition-all backdrop-blur-xs"
      >
        <MessageSquare className="w-3.5 h-3.5 text-white shrink-0" />
        <span className="truncate">WhatsApp</span>
      </a>
    </aside>
  );
}
