'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';

/**
 * Global handler: when the user hard-refreshes a /settings/* page,
 * the (settings) layout stores the target path in sessionStorage and
 * redirects to /upload.  This component, mounted in the locale layout,
 * detects the flag once we land on /upload and does a client-side
 * router.push — which triggers the @settings/(.)settings/* intercepting
 * route so the panel slides in properly.
 */
export default function SettingsRedirectHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const target = sessionStorage.getItem('settings-redirect');
    if (target && !pathname.startsWith('/settings')) {
      sessionStorage.removeItem('settings-redirect');
      router.push(target as any);
    }
  }, [pathname, router]);

  return null;
}
