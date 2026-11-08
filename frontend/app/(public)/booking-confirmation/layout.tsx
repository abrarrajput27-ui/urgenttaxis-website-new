import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Booking Confirmation | Urgent Taxis',
  description: 'Booking confirmation and invoice details for Urgent Taxis.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function BookingConfirmationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
