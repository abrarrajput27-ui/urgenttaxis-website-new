import { Metadata } from 'next';
import { Suspense } from 'react';
import CabsClient from './CabsClient';

export const metadata: Metadata = {
  title: 'Available Cabs & Instant Fares | Urgent Taxis',
  description:
    'Choose from verified sedans, SUVs, and Innova Crysta outstation cabs and airport transfers. Instant transparent pricing with 30% advance token and zero hidden charges.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function CabsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="animate-pulse bg-slate-200 h-24 rounded-2xl w-full max-w-4xl"></div>
        </div>
      }
    >
      <CabsClient />
    </Suspense>
  );
}
