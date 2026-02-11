'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import {
  Cookie,
  Settings,
  Check,
  X,
  BarChart3,
  Cog
} from 'lucide-react';

interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
}

export default function CookieBanner() {
  const t = useTranslations('cookieBanner');
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    functional: false,
    analytics: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    const savedPreferences = localStorage.getItem('cookie-preferences');

    if (!consent) {
      setShowBanner(true);
      setTimeout(() => setIsVisible(true), 100);
    } else if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const hideBanner = () => {
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 500);
  };

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', 'true');
    localStorage.setItem('cookie-preferences', JSON.stringify(prefs));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    applyCookies(prefs);
    // Notify other components that consent was given
    window.dispatchEvent(new Event('cookie-consent-updated'));
  };

  const applyCookies = (prefs: CookiePreferences) => {
    if (prefs.functional) {
      document.documentElement.setAttribute('data-functional-cookies', 'enabled');
    }

    if (prefs.analytics) {
      const win = window as unknown as { loadGoogleAnalytics?: () => void };
      if (typeof window !== 'undefined' && win.loadGoogleAnalytics) {
        win.loadGoogleAnalytics();
      }
    } else {
      if (typeof window !== 'undefined') {
        (window as unknown as { [key: string]: boolean })['ga-disable-G-W4J7Q31Y7B'] = true;
      }

      const gaCookies = ['_ga', '_gid', '_gat', '_ga_W4J7Q31Y7B'];
      gaCookies.forEach(name => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
    }
  };

  const acceptAll = () => {
    const newPrefs = { essential: true, functional: true, analytics: true };
    setPreferences(newPrefs);
    saveConsent(newPrefs);
    hideBanner();
  };

  const acceptEssential = () => {
    const newPrefs = { essential: true, functional: false, analytics: false };
    setPreferences(newPrefs);
    saveConsent(newPrefs);
    hideBanner();
  };

  const openSettings = () => {
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeSettings = () => {
    setShowModal(false);
    document.body.style.overflow = '';
  };

  const saveSettings = () => {
    saveConsent(preferences);
    closeSettings();
    hideBanner();
  };

  if (!showBanner && !showModal) return null;

  return (
    <>
      {/* Cookie Banner */}
      {showBanner && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-500 ease-in-out ${
            isVisible ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="bg-white border-t border-gray-200 shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Cookie className="w-5 h-5 text-purple-600" />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{t('title')}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {t('description')}{' '}
                        <Link href="/cookie" className="text-blue-600 hover:text-blue-700 underline">
                          {t('learnMore')}
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <button
                    onClick={openSettings}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition-all text-sm"
                  >
                    <Settings className="w-4 h-4 inline mr-2" />
                    {t('managePreferences')}
                  </button>

                  <button
                    onClick={acceptEssential}
                    className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-full font-medium transition-all text-sm"
                  >
                    {t('essentialOnly')}
                  </button>

                  <button
                    onClick={acceptAll}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 text-white rounded-full font-medium transition-all shadow-lg text-sm"
                  >
                    <Check className="w-4 h-4 inline mr-2" />
                    {t('acceptAll')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Settings Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60]">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeSettings}></div>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Cog className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold">{t('preferencesTitle')}</h2>
                  </div>
                  <button
                    onClick={closeSettings}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-96 overflow-y-auto">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {t('preferencesDescription')}
                </p>

                <div className="space-y-4">
                  {/* Essential Cookies */}
                  <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">{t('essential.title')}</h3>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                        {t('essential.badge')}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {t('essential.description')}
                    </p>
                  </div>

                  {/* Functional Cookies */}
                  <div className="border border-gray-200 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Cog className="w-4 h-4 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">{t('functional.title')}</h3>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={preferences.functional}
                          onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {t('functional.description')}
                    </p>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="border border-gray-200 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <BarChart3 className="w-4 h-4 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">{t('analytics.title')}</h3>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={preferences.analytics}
                          onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-purple-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {t('analytics.description')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <button
                    onClick={closeSettings}
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full font-medium transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={saveSettings}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 text-white rounded-full font-medium transition-all shadow-lg"
                  >
                    {t('savePreferences')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Export function to open preferences from other pages
export function openCookiePreferences() {
  localStorage.removeItem('cookie-consent');
  window.location.reload();
}
