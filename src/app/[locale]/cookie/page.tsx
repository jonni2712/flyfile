import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { Cookie, Shield, BarChart3, Settings, Check, AlertCircle, Megaphone, Globe } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.cookies' });

  const pathnames = routing.pathnames['/cookie'];
  const canonicalLocale = locale as keyof typeof pathnames;
  const localizedPath = typeof pathnames === 'string' ? pathnames : pathnames[canonicalLocale] || pathnames.it;

  const baseUrl = 'https://flyfile.it';
  const canonicalUrl = locale === 'it' ? `${baseUrl}${localizedPath}` : `${baseUrl}/${locale}${localizedPath}`;

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    const p = typeof pathnames === 'string' ? pathnames : pathnames[loc as keyof typeof pathnames] || pathnames.it;
    languages[loc] = loc === 'it' ? `${baseUrl}${p}` : `${baseUrl}/${loc}${p}`;
  }

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title: `${t('title')} | FlyFile`,
      description: t('description'),
      url: canonicalUrl,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: `FlyFile - ${t('title')}` }],
    },
  };
}

export default async function CookiesPage() {
  const t = await getTranslations('legal.cookies');

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden -mt-16 pt-16">
        {/* Decorative blurred circles */}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl" />

        <div className="relative z-10 py-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/15 border border-white/25 rounded-full mb-8">
              <Cookie className="w-5 h-5 text-white mr-2" />
              <span className="text-white text-sm font-medium">{t('badge')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              {t('heroTitle')}
            </h1>

            <p className="text-lg text-white/85 max-w-2xl mx-auto mb-6">
              {t('heroSubtitle')}
            </p>

            <p className="text-white/60 text-sm">{t('lastUpdated')}</p>
          </div>
        </div>
      </div>

      {/* Section 1: Cosa sono i Cookie? */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mr-4">
                <Cookie className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('whatAreCookies')}</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo quando visiti un sito web.
              Servono a ricordare le tue preferenze, a mantenere attiva la sessione e a migliorare la tua esperienza di navigazione.
            </p>
            <p className="text-gray-700 leading-relaxed">
              FlyFile utilizza cookie per garantire il corretto funzionamento del servizio e per offrirti
              un&apos;esperienza personalizzata e sicura.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Tipi di Cookie */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">{t('typesTitle')}</h2>

          <div className="space-y-6">
            {/* Essential Cookies */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 border-l-4 border-l-green-500">
              <div className="flex items-center mb-3">
                <Shield className="w-5 h-5 text-green-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Cookie Essenziali</h3>
                <span className="ml-3 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Sempre attivi</span>
              </div>
              <p className="text-gray-700 mb-4">
                Necessari per il funzionamento base del sito. Senza questi cookie, servizi come l&apos;autenticazione
                e la sicurezza non funzionerebbero correttamente.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600 text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Autenticazione e sessione utente
                </li>
                <li className="flex items-center text-gray-600 text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Protezione CSRF
                </li>
                <li className="flex items-center text-gray-600 text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Preferenze cookie
                </li>
                <li className="flex items-center text-gray-600 text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Sessione di autenticazione Firebase
                </li>
                <li className="flex items-center text-gray-600 text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Protezione anti-spam e anti-bot (reCAPTCHA)
                </li>
              </ul>
            </div>

            {/* Analytics Cookies */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 border-l-4 border-l-blue-500">
              <div className="flex items-center mb-3">
                <BarChart3 className="w-5 h-5 text-blue-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Cookie Analitici</h3>
                <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Opzionali</span>
              </div>
              <p className="text-gray-700 mb-4">
                Ci aiutano a capire come gli utenti interagiscono con il sito, permettendoci di migliorare
                continuamente l&apos;esperienza utente.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600 text-sm">
                  <Check className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                  Statistiche di utilizzo aggregate
                </li>
                <li className="flex items-center text-gray-600 text-sm">
                  <Check className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                  Monitoraggio delle performance
                </li>
                <li className="flex items-center text-gray-600 text-sm">
                  <Check className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                  Analisi dei percorsi di navigazione
                </li>
              </ul>
            </div>

            {/* Functional Cookies */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 border-l-4 border-l-purple-500">
              <div className="flex items-center mb-3">
                <Settings className="w-5 h-5 text-purple-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Cookie Funzionali</h3>
                <span className="ml-3 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">Opzionali</span>
              </div>
              <p className="text-gray-700 mb-4">
                Permettono di ricordare le tue preferenze e personalizzare l&apos;esperienza sul sito.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600 text-sm">
                  <Check className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" />
                  Preferenze di lingua
                </li>
                <li className="flex items-center text-gray-600 text-sm">
                  <Check className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" />
                  Impostazioni di visualizzazione
                </li>
                <li className="flex items-center text-gray-600 text-sm">
                  <Check className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" />
                  Personalizzazione del dashboard
                </li>
              </ul>
            </div>

            {/* Marketing Cookies */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 border-l-4 border-l-orange-500">
              <div className="flex items-center mb-3">
                <Megaphone className="w-5 h-5 text-orange-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Cookie di Marketing</h3>
                <span className="ml-3 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">Opzionali</span>
              </div>
              <p className="text-gray-700 mb-4">
                Utilizzati per mostrare annunci pubblicitari pertinenti e misurarne l&apos;efficacia.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600 text-sm">
                  <Check className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" />
                  Personalizzazione degli annunci pubblicitari
                </li>
                <li className="flex items-center text-gray-600 text-sm">
                  <Check className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" />
                  Misurazione delle performance pubblicitarie
                </li>
                <li className="flex items-center text-gray-600 text-sm">
                  <Check className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" />
                  Remarketing e retargeting
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Cookie Table */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">{t('detailTitle')}</h2>

          {/* Desktop table - hidden on mobile */}
          <div className="hidden md:block border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-4 px-5 font-semibold text-gray-900">Nome</th>
                  <th className="text-left py-4 px-5 font-semibold text-gray-900">Tipo</th>
                  <th className="text-left py-4 px-5 font-semibold text-gray-900">Durata</th>
                  <th className="text-left py-4 px-5 font-semibold text-gray-900">Scopo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-5 font-mono text-xs text-gray-800">flyfile_session</td>
                  <td className="py-4 px-5">
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Essenziale</span>
                  </td>
                  <td className="py-4 px-5 text-gray-600">Sessione</td>
                  <td className="py-4 px-5 text-gray-600">Mantiene la sessione utente attiva</td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-5 font-mono text-xs text-gray-800">XSRF-TOKEN</td>
                  <td className="py-4 px-5">
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Essenziale</span>
                  </td>
                  <td className="py-4 px-5 text-gray-600">Sessione</td>
                  <td className="py-4 px-5 text-gray-600">Protezione CSRF</td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-5 font-mono text-xs text-gray-800">cookie_consent</td>
                  <td className="py-4 px-5">
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Essenziale</span>
                  </td>
                  <td className="py-4 px-5 text-gray-600">1 anno</td>
                  <td className="py-4 px-5 text-gray-600">Memorizza le preferenze cookie</td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-5 font-mono text-xs text-gray-800">__session</td>
                  <td className="py-4 px-5">
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Essenziale</span>
                  </td>
                  <td className="py-4 px-5 text-gray-600">1 ora</td>
                  <td className="py-4 px-5 text-gray-600">Mantiene la sessione di autenticazione dell&apos;utente (Firebase)</td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-5 font-mono text-xs text-gray-800">_GRECAPTCHA</td>
                  <td className="py-4 px-5">
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Essenziale</span>
                  </td>
                  <td className="py-4 px-5 text-gray-600">6 mesi</td>
                  <td className="py-4 px-5 text-gray-600">Protezione anti-spam e anti-bot (Google reCAPTCHA)</td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-5 font-mono text-xs text-gray-800">_ga</td>
                  <td className="py-4 px-5">
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Analitico</span>
                  </td>
                  <td className="py-4 px-5 text-gray-600">2 anni</td>
                  <td className="py-4 px-5 text-gray-600">Google Analytics - identificazione utente</td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-5 font-mono text-xs text-gray-800">_gid</td>
                  <td className="py-4 px-5">
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Analitico</span>
                  </td>
                  <td className="py-4 px-5 text-gray-600">24 ore</td>
                  <td className="py-4 px-5 text-gray-600">Identificazione sessione utente per analisi statistiche</td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-5 font-mono text-xs text-gray-800">_gat / _gat_gtag_*</td>
                  <td className="py-4 px-5">
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Analitico</span>
                  </td>
                  <td className="py-4 px-5 text-gray-600">1 minuto</td>
                  <td className="py-4 px-5 text-gray-600">Limitazione della frequenza delle richieste ad Analytics</td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-5 font-mono text-xs text-gray-800">_ga_W4J7Q31Y7B</td>
                  <td className="py-4 px-5">
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Analitico</span>
                  </td>
                  <td className="py-4 px-5 text-gray-600">2 anni</td>
                  <td className="py-4 px-5 text-gray-600">Mantiene lo stato della sessione Google Analytics 4</td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-5 font-mono text-xs text-gray-800">preferences</td>
                  <td className="py-4 px-5">
                    <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">Funzionale</span>
                  </td>
                  <td className="py-4 px-5 text-gray-600">1 anno</td>
                  <td className="py-4 px-5 text-gray-600">Preferenze utente</td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-5 font-mono text-xs text-gray-800">Google AdSense</td>
                  <td className="py-4 px-5">
                    <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">Marketing</span>
                  </td>
                  <td className="py-4 px-5 text-gray-600">Variabile</td>
                  <td className="py-4 px-5 text-gray-600">Personalizzazione e misurazione degli annunci pubblicitari</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile card layout - visible only on mobile */}
          <div className="md:hidden space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-gray-800">flyfile_session</span>
                <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Essenziale</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Durata</span>
                  <span className="text-gray-700">Sessione</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Scopo</span>
                  <span className="text-gray-700 text-right ml-4">Mantiene la sessione utente attiva</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-gray-800">XSRF-TOKEN</span>
                <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Essenziale</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Durata</span>
                  <span className="text-gray-700">Sessione</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Scopo</span>
                  <span className="text-gray-700 text-right ml-4">Protezione CSRF</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-gray-800">cookie_consent</span>
                <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Essenziale</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Durata</span>
                  <span className="text-gray-700">1 anno</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Scopo</span>
                  <span className="text-gray-700 text-right ml-4">Memorizza le preferenze cookie</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-gray-800">__session</span>
                <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Essenziale</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Durata</span>
                  <span className="text-gray-700">1 ora</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Scopo</span>
                  <span className="text-gray-700 text-right ml-4">Sessione di autenticazione Firebase</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-gray-800">_GRECAPTCHA</span>
                <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Essenziale</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Durata</span>
                  <span className="text-gray-700">6 mesi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Scopo</span>
                  <span className="text-gray-700 text-right ml-4">Protezione anti-spam e anti-bot (Google reCAPTCHA)</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-gray-800">_ga</span>
                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Analitico</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Durata</span>
                  <span className="text-gray-700">2 anni</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Scopo</span>
                  <span className="text-gray-700 text-right ml-4">Google Analytics - identificazione utente</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-gray-800">_gid</span>
                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Analitico</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Durata</span>
                  <span className="text-gray-700">24 ore</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Scopo</span>
                  <span className="text-gray-700 text-right ml-4">Identificazione sessione utente per analisi statistiche</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-gray-800">_gat / _gat_gtag_*</span>
                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Analitico</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Durata</span>
                  <span className="text-gray-700">1 minuto</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Scopo</span>
                  <span className="text-gray-700 text-right ml-4">Limitazione della frequenza delle richieste ad Analytics</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-gray-800">_ga_W4J7Q31Y7B</span>
                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Analitico</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Durata</span>
                  <span className="text-gray-700">2 anni</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Scopo</span>
                  <span className="text-gray-700 text-right ml-4">Stato della sessione Google Analytics 4</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-gray-800">preferences</span>
                <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">Funzionale</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Durata</span>
                  <span className="text-gray-700">1 anno</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Scopo</span>
                  <span className="text-gray-700 text-right ml-4">Preferenze utente</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-gray-800">Google AdSense</span>
                <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">Marketing</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Durata</span>
                  <span className="text-gray-700">Variabile</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Scopo</span>
                  <span className="text-gray-700 text-right ml-4">Personalizzazione e misurazione degli annunci pubblicitari</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Gestione dei Cookie */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mr-4">
                <Settings className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('managementTitle')}</h2>
            </div>
            <p className="text-gray-700 mb-6">
              Puoi gestire le tue preferenze sui cookie in qualsiasi momento. Hai il diritto di:
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Accettare o rifiutare i cookie opzionali</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Modificare le tue preferenze in qualsiasi momento</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Eliminare i cookie già memorizzati nel tuo browser</span>
              </li>
            </ul>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">Nota importante</h4>
                  <p className="text-yellow-700 text-sm leading-relaxed">
                    Disabilitare i cookie essenziali potrebbe compromettere alcune funzionalità del sito,
                    come l&apos;autenticazione e la sicurezza delle sessioni.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Browser Settings */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{t('browserTitle')}</h2>
            <p className="text-gray-700 mb-6">
              Puoi anche controllare i cookie attraverso le impostazioni del tuo browser.
              Ecco i link alle guide dei principali browser:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="https://support.google.com/chrome/answer/95647"
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 bg-gray-50 rounded-xl text-center hover:bg-gray-100 transition-colors border border-gray-100"
              >
                <span className="font-semibold text-gray-900">Chrome</span>
              </a>
              <a
                href="https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer"
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 bg-gray-50 rounded-xl text-center hover:bg-gray-100 transition-colors border border-gray-100"
              >
                <span className="font-semibold text-gray-900">Firefox</span>
              </a>
              <a
                href="https://support.apple.com/guide/safari/manage-cookies-sfri11471"
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 bg-gray-50 rounded-xl text-center hover:bg-gray-100 transition-colors border border-gray-100"
              >
                <span className="font-semibold text-gray-900">Safari</span>
              </a>
              <a
                href="https://support.microsoft.com/help/4027947"
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 bg-gray-50 rounded-xl text-center hover:bg-gray-100 transition-colors border border-gray-100"
              >
                <span className="font-semibold text-gray-900">Edge</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Section 6: Servizi di Terze Parti */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mr-4">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Servizi di terze parti e trasferimento dati</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              I cookie analitici (Google Analytics), di marketing (Google AdSense) e i servizi di analisi (Vercel Analytics)
              vengono caricati <strong>esclusivamente dopo il tuo consenso esplicito</strong>.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              Alcuni dati possono essere trasferiti verso server situati negli Stati Uniti, gestiti dai seguenti fornitori:
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700"><strong>Google</strong> (Analytics, AdSense, reCAPTCHA) — elaborazione dati di navigazione e protezione anti-spam</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700"><strong>Vercel Analytics</strong> — analisi delle performance del sito senza utilizzo di cookie (cookie-less)</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700"><strong>Stripe</strong> — può impostare cookie durante il flusso di pagamento per la prevenzione delle frodi</span>
              </li>
            </ul>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-800 mb-1">Nota sul consenso</h4>
                  <p className="text-blue-700 text-sm leading-relaxed">
                    Il cookie <code className="bg-blue-100 px-1 rounded">_GRECAPTCHA</code> è classificato come essenziale
                    in quanto necessario per la protezione della sicurezza della piattaforma e la prevenzione di abusi.
                    I trasferimenti di dati verso gli Stati Uniti avvengono nel rispetto delle garanzie previste dal GDPR.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 7: Contact CTA */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{t('questionsTitle')}</h2>
            <p className="text-gray-700 mb-8 max-w-lg mx-auto">
              Se hai domande sulla nostra politica sui cookie o sul trattamento dei tuoi dati,
              contattaci pure.
            </p>
            <Link
              href="/contatti"
              className="inline-flex items-center px-8 py-3.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-full font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25"
            >
              Contattaci
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
