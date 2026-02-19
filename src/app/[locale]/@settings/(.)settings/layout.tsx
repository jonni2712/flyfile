'use client';

import { ReactNode, useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/context/AuthContext';
import { X, ChevronLeft, Menu } from 'lucide-react';

const TITLE_MAP: Record<string, string> = {
  '/settings/profile': 'Profilo e sicurezza',
  '/settings/notifications': 'Impostazioni di notifica',
  '/settings/brand': 'Brand',
  '/settings/billing': 'Piano e pagamento',
  '/settings/members': 'Membri',
  '/settings/sponsorships': 'Sponsorizzazioni',
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
      { href: '/settings/sponsorships', label: 'Sponsorizzazioni' },
      { href: '/settings/billing', label: 'Piano e pagamento' },
      { href: '/settings/members', label: 'Membri' },
    ],
  },
];

export default function SettingsPanelLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const pageTitle = TITLE_MAP[pathname] || 'Impostazioni';

  // Slide-in animation
  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    });
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => router.back(), 300);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />

      {/* Panel — slides in from right */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[1100px] bg-white z-[70] transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Sticky close bar */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleClose}
            className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
            <span className="text-sm font-medium">Chiudi</span>
          </button>

          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Content */}
        <div className="px-6 sm:px-10 pb-16">
          {/* Header */}
          <div className="mt-8 mb-8">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
              {user?.email}
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
    </>
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
                    href={link.href as any}
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
