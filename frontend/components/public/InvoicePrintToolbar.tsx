'use client';

import React from 'react';
import Link from 'next/link';

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

  return (
    <div className="print:hidden bg-slate-900 text-white py-3.5 px-4 sticky top-0 z-50 shadow-md">
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-3">
          <Link
            href={`/booking-confirmation/${bookingReference}`}
            className="text-slate-300 hover:text-white flex items-center gap-1 font-semibold text-xs sm:text-sm"
          >
            &larr; Back to Confirmation
          </Link>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="tabular-nums text-slate-300 text-xs sm:text-sm font-bold">{bookingReference}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="bg-brand-blue hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-lg text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            id="print-invoice-btn"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Download / Print PDF
          </button>
        </div>
      </div>
    </div>
  );
}
