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
    // Redirect to /upload, then immediately push back to this settings path
    // so that Next.js triggers the intercepting route @settings/(.)settings/*
    // which renders the slide-in panel.
    redirected.current = true;
    const target = pathname;
    router.replace('/upload');
    // setTimeout without cleanup — fires even after this component unmounts
    setTimeout(() => {
      router.push(target as any);
    }, 150);
  }, [loading, user, pathname, router]);

  // Full-screen white overlay with spinner while the redirect happens
  return (
    <div className="fixed inset-0 bg-white z-[70] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
