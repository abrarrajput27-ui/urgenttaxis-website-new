import { BUSINESS_CONFIG } from '@/lib/config';
import { Phone, MessageSquare } from 'lucide-react';

export default function MobileStickyBar() {
  const whatsappUrl = `https://wa.me/${BUSINESS_CONFIG.phone.whatsappRaw}?text=${encodeURIComponent(
    'Hello Urgent Taxis, I want to book a cab. Please share vehicle availability and fare.'
  )}`;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] max-w-full overflow-hidden">
      <div className="max-w-md mx-auto grid grid-cols-2 gap-2.5">
        <a
          href={`tel:${BUSINESS_CONFIG.phone.primaryRaw}`}
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 active:from-blue-700 active:to-blue-800 text-white font-bold text-sm shadow-md shadow-blue-600/30 transition-all text-center"
        >
          <Phone className="w-4 h-4 flex-shrink-0 animate-bounce" />
          <span className="truncate">Call Now</span>
        </a>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 active:from-emerald-700 active:to-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-600/30 transition-all text-center"
        >
          <MessageSquare className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
