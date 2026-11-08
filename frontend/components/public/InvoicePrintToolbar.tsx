'use client';

import React from 'react';
import Link from 'next/link';
import { FaWhatsapp, FaPrint, FaArrowLeft } from 'react-icons/fa';

interface InvoicePrintToolbarProps {
  bookingReference: string;
  documentTitle: string;
}

export default function InvoicePrintToolbar({ bookingReference, documentTitle }: InvoicePrintToolbarProps) {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const shareText = `🚖 *URGENT TAXIS — OFFICIAL INVOICE*\nReference: *${bookingReference}*\nDownload/View Receipt:\nhttps://www.urgenttaxis.in/booking-confirmation/${bookingReference}/invoice\n\n24/7 Helpline: +91 7310651940`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="print:hidden bg-slate-900 text-white py-3 px-4 sticky top-0 z-50 shadow-lg border-b border-slate-800">
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-3">
          <Link
            href={`/booking-confirmation/${bookingReference}`}
            className="text-slate-300 hover:text-white flex items-center gap-1.5 font-bold text-xs sm:text-sm bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-lg transition-colors"
          >
            <FaArrowLeft className="text-xs" />
            <span>Booking Details</span>
          </Link>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="tabular-nums text-slate-300 text-xs sm:text-sm font-black tracking-wider">
            {bookingReference}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#059669] hover:bg-[#047857] text-white font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
            title="Share invoice on WhatsApp"
          >
            <FaWhatsapp className="text-sm" />
            <span className="hidden sm:inline">Share on WhatsApp</span>
          </a>

          <button
            onClick={handlePrint}
            className="bg-brand-blue hover:bg-blue-600 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
            id="print-invoice-btn"
          >
            <FaPrint className="text-xs" />
            <span>Download / Print Invoice (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
