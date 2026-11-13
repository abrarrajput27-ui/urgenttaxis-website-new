import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: 'swap' });

export const metadata: Metadata = {
  title: "Urgent Taxis - Reliable Outstation Cab Booking",
  description: "Book reliable sedan, SUV, and outstation cabs in Ghaziabad and Delhi NCR with transparent pricing.",
  icons: {
    icon: [
      { url: '/logo.jpg', sizes: '32x32' },
      { url: '/logo.jpg', sizes: '192x192' },
    ],
    shortcut: '/logo.jpg',
    apple: [
      { url: '/logo.jpg', sizes: '180x180' },
    ],
  },
  verification: {
    google: 'gmiuOYv-8DEgSTJdyAa9-uNXHyO8PdwcK94l-mgFjTM',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en-IN" className={`${inter.variable} h-full antialiased font-sans`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="preconnect" href="https://maps.google.com" />
        <link rel="dns-prefetch" href="https://maps.google.com" />
        <link rel="preconnect" href="https://maps.googleapis.com" />
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
        <link rel="preconnect" href="https://maps.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://maps.gstatic.com" />
        <link rel="preconnect" href="https://www.google.com" />
        <link rel="dns-prefetch" href="https://www.google.com" />
      </head>
      <body className="min-h-full flex flex-col bg-brand-white text-slate-900 w-full max-w-full overflow-x-hidden">
        {/* Google Analytics 4 (only if NEXT_PUBLIC_GA_ID is configured) */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        {children}
      </body>
    </html>
  );
}
