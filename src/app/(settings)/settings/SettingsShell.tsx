'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { X, ChevronLeft, Menu } from 'lucide-react';
import { useState } from 'react';

const TITLE_MAP: Record<string, string> = {
  '/settings/profile': 'Profilo e sicurezza',
  '/settings/notifications': 'Impostazioni di notifica',
  '/settings/brand': 'Brand',
  '/settings/billing': 'Piano e pagamento',
  '/settings/members': 'Membri',
};

const SIDEBAR_SECTIONS = [
  {
    title: 'Account',
    links: [
      { href: '/settings/profile', label: 'Profilo e sicurezza' },
      { href: '/settings/notifications', label: 'Impostazioni di notifica' },
    ],
  },
  {
    title: 'Spazio Di Lavoro',
    links: [
      { href: '/settings/brand', label: 'Brand' },
      { href: '/settings/billing', label: 'Piano e pagamento' },
      { href: '/settings/members', label: 'Membri' },
    ],
  },
];

export default function SettingsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const pageTitle = TITLE_MAP[pathname] || 'Impostazioni';

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky close bar */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <Link
          href="/upload"
          className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors"
        >
          <X className="w-5 h-5" />
          <span className="text-sm font-medium">Chiudi</span>
        </Link>

        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Content */}
      <div className="max-w-[1100px] mx-auto px-6 sm:px-10 pb-16">
        {/* Header */}
        <div className="mt-8 mb-8">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
            {user.email}
          </p>
          <h2 className="text-4xl font-bold text-gray-900">
            {pageTitle}
          </h2>
        </div>

        {/* Mobile sidebar */}
        {mobileSidebarOpen && (
          <div className="lg:hidden mb-8 border border-gray-200 rounded-xl p-4">
            <Sidebar pathname={pathname} onClose={() => setMobileSidebarOpen(false)} />
          </div>
        )}

        {/* Two-column layout: content + sidebar */}
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {children}
          </div>

          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-20">
              <Sidebar pathname={pathname} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  return (
    <nav className="space-y-6">
      {SIDEBAR_SECTIONS.map((section) => (
        <div key={section.title}>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {section.title}
          </h3>
          <ul className="space-y-1">
            {section.links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className={`flex items-center justify-between py-2 px-3 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'text-gray-900 font-semibold bg-gray-50'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
