import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trip & Passenger Details | Urgent Taxis',
  description: 'Complete your booking details and confirm your ride with Urgent Taxis.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  alternates: {
    canonical: 'https://www.urgenttaxis.in/checkout',
  },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
