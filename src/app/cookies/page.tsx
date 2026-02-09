import { Metadata } from 'next';
import Link from 'next/link';
import { Cookie, Shield, BarChart3, Settings, Check, AlertCircle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

export const metadata: Metadata = {
  title: 'Cookie Policy - FlyFile',
  description: 'Informativa sui cookie e le tecnologie di tracciamento utilizzate da FlyFile.',
};

export default function CookiesPage() {
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
              <span className="text-white text-sm font-medium">Cookie Policy</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Informativa sui Cookie
            </h1>

            <p className="text-lg text-white/85 max-w-2xl mx-auto mb-6">
              Trasparenza totale su come utilizziamo i cookie per migliorare la tua esperienza su FlyFile.
            </p>

            <p className="text-white/60 text-sm">Ultimo aggiornamento: Gennaio 2026</p>
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
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Cosa sono i Cookie?</h2>
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
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">Tipi di Cookie Utilizzati</h2>

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
          </div>
        </div>
      </div>

      {/* Section 3: Cookie Table */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">Dettaglio Cookie Utilizzati</h2>

          <div className="border border-gray-200 rounded-xl overflow-hidden">
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
                  <td className="py-4 px-5 font-mono text-xs text-gray-800">_ga</td>
                  <td className="py-4 px-5">
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Analitico</span>
                  </td>
                  <td className="py-4 px-5 text-gray-600">2 anni</td>
                  <td className="py-4 px-5 text-gray-600">Google Analytics - identificazione</td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-5 font-mono text-xs text-gray-800">preferences</td>
                  <td className="py-4 px-5">
                    <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">Funzionale</span>
                  </td>
                  <td className="py-4 px-5 text-gray-600">1 anno</td>
                  <td className="py-4 px-5 text-gray-600">Preferenze utente</td>
                </tr>
              </tbody>
            </table>
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
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestione dei Cookie</h2>
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
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Impostazioni del Browser</h2>
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

      {/* Section 6: Contact CTA */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Domande sui Cookie?</h2>
            <p className="text-gray-700 mb-8 max-w-lg mx-auto">
              Se hai domande sulla nostra politica sui cookie o sul trattamento dei tuoi dati,
              contattaci pure.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-3.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity duration-300 shadow-lg shadow-purple-500/25"
            >
              Contattaci
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
