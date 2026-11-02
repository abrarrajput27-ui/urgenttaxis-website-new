import { BUSINESS_CONFIG } from '@/lib/config';
import { Phone, MessageSquare } from 'lucide-react';

export default function MobileStickyBar() {
  const phoneDigits = (BUSINESS_CONFIG.phone.primaryRaw || '+917310651940').replace(/\D/g, '');
  const whatsappDigits = (BUSINESS_CONFIG.phone.whatsappRaw || '917310651940').replace(/\D/g, '');

  const whatsappUrl = `https://wa.me/${whatsappDigits || '917310651940'}?text=${encodeURIComponent(
    'Hello Urgent Taxis, I want to book a cab. Please share vehicle availability and fare.'
  )}`;

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 pt-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] max-w-full overflow-hidden"
      style={{ paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="max-w-md mx-auto grid grid-cols-2 gap-2.5">
        <a
          href={`tel:+${phoneDigits || '917310651940'}`}
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#1e1b4b] active:bg-slate-900 text-white font-bold text-sm shadow-md transition-all text-center"
        >
          <Phone className="w-4 h-4 shrink-0" />
          <span className="truncate">Call Now</span>
        </a>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#059669] active:bg-[#047857] text-white font-bold text-sm shadow-md transition-all text-center"
        >
          <MessageSquare className="w-4 h-4 shrink-0" />
          <span className="truncate">WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
