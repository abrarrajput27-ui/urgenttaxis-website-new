import Link from 'next/link';
import Image from 'next/image';
import PublicHeader from '@/components/public/Header';
import PublicFooter from '@/components/public/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans">
      <PublicHeader />
      <main className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center space-y-6 max-w-xl mx-auto">
        <div className="bg-slate-100 p-4 rounded-2xl inline-block shadow-sm">
          <Image
            src="/logo.jpg"
            alt="Urgent Taxis Logo"
            width={160}
            height={45}
            className="h-10 w-auto object-contain"
          />
        </div>
        <h1 className="text-6xl font-black text-[#1e1b4b]">404</h1>
        <h2 className="text-2xl font-bold text-slate-800">Page Not Found</h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          The outstation route or page you are looking for does not exist or has been moved.
        </p>
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm px-6 py-3 rounded-full transition-colors shadow-sm"
          >
            Return to Homepage
          </Link>
          <Link
            href="/routes"
            className="bg-[#1e1b4b] hover:bg-[#2e2a72] text-white font-bold text-sm px-6 py-3 rounded-full transition-colors shadow-sm"
          >
            Explore Outstation Routes
          </Link>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
