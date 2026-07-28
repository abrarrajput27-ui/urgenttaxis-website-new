import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Urgent Taxis - Admin Portal & Fleet Management",
  description: "Secure Admin Console & Pricing Engine for Urgent Taxis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased font-sans">
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}

