'use client';

import { ReactNode } from 'react';
import { usePathname } from '@/i18n/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/i18n/navigation';
import { X } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const TITLE_MAP: Record<string, string> = {
  '/settings/profile': 'Profilo e sicurezza',
  '/settings/notifications': 'Impostazioni di notifica',
  '/settings/brand': 'Brand',
  '/settings/billing': 'Piano e pagamento',
  '/settings/members': 'Membri',
  '/settings/sponsorships': 'Sponsorizzazioni',
};

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  const pageTitle = TITLE_MAP[pathname] || 'Impostazioni';

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push('/accedi');
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky close bar */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 px-6 py-4 border-b border-gray-100">
        <Link
          href="/upload"
          className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors w-fit"
        >
          <X className="w-5 h-5" />
          <span className="text-sm font-medium">Chiudi</span>
        </Link>
      </div>

      {/* Content — no sidebar to avoid intercept overlap */}
      <div className="max-w-[800px] mx-auto px-6 sm:px-10 pb-16">
        <div className="mt-8 mb-8">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
            {user.email}
          </p>
          <h2 className="text-4xl font-bold text-gray-900">
            {pageTitle}
          </h2>
        </div>

        {children}
      </div>
    </div>
  );
}
