'use client';

import { useState, useEffect, useCallback } from 'react';
import { Analytics } from '@vercel/analytics/next';

const GA_MEASUREMENT_ID = 'G-W4J7Q31Y7B';
const ADSENSE_CLIENT_ID = 'ca-pub-5065560716215945';

interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
}

function getPreferences(): CookiePreferences | null {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem('cookie-preferences');
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

function loadScript(id: string, src: string, attrs?: Record<string, string>): void {
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.src = src;
  script.async = true;
  if (attrs) {
    Object.entries(attrs).forEach(([key, value]) => {
      script.setAttribute(key, value);
    });
  }
  document.head.appendChild(script);
}

function removeScript(id: string): void {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function clearGACookies(): void {
  const gaCookies = ['_ga', '_gid', '_gat', '_ga_W4J7Q31Y7B'];
  gaCookies.forEach(name => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
}

export default function ConsentScripts() {
  const [analyticsConsent, setAnalyticsConsent] = useState(false);

  const applyConsent = useCallback(() => {
    const prefs = getPreferences();
    const hasAnalytics = prefs?.analytics === true;
    setAnalyticsConsent(hasAnalytics);

    const w = window as unknown as Record<string, unknown>;

    if (hasAnalytics) {
      // Remove the GA disable flag
      delete w[`ga-disable-${GA_MEASUREMENT_ID}`];

      // Load Google Analytics gtag.js
      loadScript(
        'ga-gtag',
        `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
      );

      // Initialize dataLayer and gtag if not already done
      if (!w.__gaInitialized) {
        w.dataLayer = (w.dataLayer as unknown[]) || [];
        const gtag = function (..._args: unknown[]) {
          (w.dataLayer as unknown[]).push(arguments);
        };
        w.gtag = gtag;
        gtag('js', new Date());
        gtag('config', GA_MEASUREMENT_ID);
        w.__gaInitialized = true;
      }

      // Load Google AdSense
      loadScript(
        'google-adsense',
        `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`,
        { crossorigin: 'anonymous' }
      );
    } else {
      // Disable GA tracking
      w[`ga-disable-${GA_MEASUREMENT_ID}`] = true;

      // Clear existing GA cookies
      clearGACookies();

      // Remove injected scripts
      removeScript('ga-gtag');
      removeScript('google-adsense');
    }
  }, []);

  useEffect(() => {
    // Disable GA immediately before any script could load
    (window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`] = true;

    // Apply saved preferences
    applyConsent();

    // React to consent changes from CookieBanner
    window.addEventListener('cookie-consent-updated', applyConsent);
    return () => window.removeEventListener('cookie-consent-updated', applyConsent);
  }, [applyConsent]);

  // Vercel Analytics only renders when analytics consent is given
  return analyticsConsent ? <Analytics /> : null;
}
