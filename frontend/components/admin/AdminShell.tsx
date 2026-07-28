'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
  user: {
    email?: string;
    fullName?: string;
    roles?: string[];
  };
}

export default function AdminShell({ children, user }: AdminLayoutProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navSections = [
    {
      title: 'Operations',
      items: [
        { name: 'Dashboard', href: '/admin/dashboard' },
        { name: 'Bookings', href: '#', comingSoon: true },
        { name: 'Enquiries', href: '#', comingSoon: true },
        { name: 'Quotations', href: '#', comingSoon: true },
        { name: 'Fleet Availability', href: '#', comingSoon: true },
        { name: 'Assignments', href: '#', comingSoon: true },
      ],
    },
    {
      title: 'Fleet & Vehicle Master',
      items: [
        { name: 'Vehicle Categories', href: '/admin/categories' },
        { name: 'Vehicle Models', href: '/admin/models' },
        { name: 'Vehicle Variants', href: '/admin/variants' },
        { name: 'Amenities', href: '/admin/amenities' },
        { name: 'Actual Fleet', href: '/admin/fleet' },
        { name: 'Drivers', href: '#', comingSoon: true },
        { name: 'Vendors', href: '#', comingSoon: true },
      ],
    },
    {
      title: 'Pricing Engine',
      items: [
        { name: 'Pricing Console', href: '/admin/pricing' },
        { name: 'Dynamic Surge Rules', href: '/admin/pricing/surge' },
        { name: 'Pricing Simulator', href: '/admin/pricing/simulator' },
        { name: 'Quotations & Snapshots', href: '#', comingSoon: true },
      ],
    },
    {
      title: 'CMS & System',
      items: [
        { name: 'CMS Pages', href: '#', comingSoon: true },
        { name: 'SEO Metadata', href: '#', comingSoon: true },
        { name: 'Users & Roles', href: '#', comingSoon: true },
        { name: 'Audit Logs', href: '#', comingSoon: true },
        { name: 'System Settings', href: '#', comingSoon: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header Branding */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-amber-400">URGENT TAXIS</h1>
              <p className="text-xs text-slate-400 font-medium">Platform Administration</p>
            </div>
            <span className="bg-amber-500/10 text-amber-400 text-[10px] font-semibold px-2 py-0.5 rounded border border-amber-500/20">
              v1.0
            </span>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navSections.map((section) => (
              <div key={section.title}>
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
                  {section.title}
                </h2>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.name}>
                        {item.comingSoon ? (
                          <span className="flex items-center justify-between px-3 py-2 text-sm text-slate-500 rounded-md cursor-not-allowed">
                            <span>{item.name}</span>
                            <span className="text-[9px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                              Soon
                            </span>
                          </span>
                        ) : (
                          <Link
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                              isActive
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold'
                                : 'text-slate-300 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            <span>{item.name}</span>
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="overflow-hidden pr-2">
            <p className="text-xs font-semibold text-slate-200 truncate">
              {user.fullName || user.email}
            </p>
            <p className="text-[10px] text-amber-400 font-mono capitalize truncate">
              {user.roles && user.roles.length > 0 ? user.roles.join(', ') : 'Admin'}
            </p>
          </div>
          <form action="/admin/api/logout" method="POST">
            <button
              type="submit"
              className="text-xs bg-slate-800 hover:bg-red-600/80 text-slate-300 hover:text-white px-2.5 py-1.5 rounded transition-colors font-medium cursor-pointer"
            >
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-900">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-slate-300 font-medium">Admin</span>
              <span>/</span>
              <span className="text-amber-400 font-semibold">Console</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Supabase DB
            </span>
          </div>
        </header>

        {/* Dynamic Body */}
        <div className="p-4 md:p-8 overflow-y-auto flex-1">{children}</div>
      </main>
    </div>
  );
}

