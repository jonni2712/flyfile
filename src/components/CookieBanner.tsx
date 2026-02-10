'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  };

  const applyCookies = (prefs: CookiePreferences) => {
    if (prefs.functional) {
      document.documentElement.setAttribute('data-functional-cookies', 'enabled');
    }

    if (prefs.analytics) {
      // Enable analytics
      const win = window as unknown as { loadGoogleAnalytics?: () => void };
      if (typeof window !== 'undefined' && win.loadGoogleAnalytics) {
        win.loadGoogleAnalytics();
      }
    } else {
      // Disable and remove analytics cookies
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
          <div className="bg-gradient-to-r from-slate-900/95 via-blue-900/95 to-indigo-900/95 backdrop-blur-lg border-t border-white/20 shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                      <Cookie className="w-5 h-5 text-cyan-400" />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Utilizziamo i Cookie</h3>
                      <p className="text-blue-100/90 text-sm leading-relaxed">
                        Utilizziamo cookie essenziali per il funzionamento del sito e cookie opzionali per migliorare la tua esperienza.{' '}
                        <Link href="/cookie" className="text-cyan-400 hover:text-cyan-300 underline">
                          Scopri di più nella nostra Cookie Policy
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <button
                    onClick={openSettings}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-xl font-medium transition-all duration-300 text-sm"
                  >
                    <Settings className="w-4 h-4 inline mr-2" />
                    Gestisci Preferenze
                  </button>

                  <button
                    onClick={acceptEssential}
                    className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white border border-white/40 rounded-xl font-medium transition-all duration-300 text-sm"
                  >
                    Solo Essenziali
                  </button>

                  <button
                    onClick={acceptAll}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-300 shadow-lg text-sm"
                  >
                    <Check className="w-4 h-4 inline mr-2" />
                    Accetta Tutti
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
            <div className="bg-white/95 backdrop-blur-lg border border-white/40 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Cog className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold">Preferenze Cookie</h2>
                  </div>
                  <button
                    onClick={closeSettings}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-96 overflow-y-auto">
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Personalizza le tue preferenze sui cookie. Puoi modificare queste impostazioni in qualsiasi momento.
                </p>

                <div className="space-y-6">
                  {/* Essential Cookies */}
                  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <Check className="w-4 h-4 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-800">Cookie Essenziali</h3>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                        Sempre Attivi
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Necessari per il funzionamento del sito web. Include autenticazione, sicurezza e preferenze di base.
                    </p>
                  </div>

                  {/* Functional Cookies */}
                  <div className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <Cog className="w-4 h-4 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-800">Cookie Funzionali</h3>
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
                      Migliorano l&apos;esperienza utente con preferenze personalizzate, impostazioni dell&apos;interfaccia e funzionalità avanzate.
                    </p>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-4 h-4 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-800">Cookie Analitici</h3>
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
                      Ci aiutano a capire come utilizzi il sito per migliorare le prestazioni. Tutti i dati sono anonimi e aggregati.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-6 bg-gray-50/50">
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <button
                    onClick={closeSettings}
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-medium transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={saveSettings}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all shadow-lg"
                  >
                    Salva Preferenze
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
  // This will need to be triggered via a state management solution
  // For now, clear consent and reload
  localStorage.removeItem('cookie-consent');
  window.location.reload();
}
