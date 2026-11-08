import type { Metadata } from 'next';
import PublicHeader from '@/components/public/Header';
import PublicFooter from '@/components/public/Footer';
import MobileStickyBar from '@/components/public/MobileStickyBar';

export const metadata: Metadata = {
  title: {
    default: 'Urgent Taxis - Outstation Cabs & Airport Transfers',
    template: '%s | Urgent Taxis',
  },
  description: 'Book verified sedan and SUV outstation taxis, one-way cabs, round-trip journeys, local packages, and airport transfers with transparent pricing.',
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-brand-green selection:text-white">
      <div className="print:hidden">
        <PublicHeader />
      </div>
      <main className="flex-1 print:p-0 print:m-0">{children}</main>
      <div className="print:hidden">
        <PublicFooter />
        <MobileStickyBar />
      </div>
    </div>
  );
}
