'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/context/AuthContext';

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const redirected = useRef(false);

  useEffect(() => {
    if (loading || redirected.current) return;

    if (!user) {
      redirected.current = true;
      router.push('/accedi');
      return;
    }

    // This layout only renders on hard refresh / direct URL access.
    // Store the target settings path in sessionStorage, then redirect
    // to /upload. The global SettingsRedirectHandler (in locale layout)
    // will pick up the flag and do router.push from /upload, which
    // triggers the @settings/(.)settings/* intercepting route panel.
    redirected.current = true;
    sessionStorage.setItem('settings-redirect', pathname);
    router.replace('/upload');
  }, [loading, user, pathname, router]);

  // Full-screen white overlay with spinner while the redirect happens
  return (
    <div className="fixed inset-0 bg-white z-[70] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
