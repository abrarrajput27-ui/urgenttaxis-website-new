import type { Metadata } from 'next';
import PublicHeader from '@/components/public/Header';
import PublicFooter from '@/components/public/Footer';

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
