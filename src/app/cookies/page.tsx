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
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden -mt-16 pt-20 pb-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)`
          }}
        ></div>

        <div className="relative z-10 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-8">
              <Cookie className="w-5 h-5 text-cyan-400 mr-2" />
              <span className="text-white/90 text-sm font-medium">Cookie Policy</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Informativa sui Cookie
            </h1>

            <p className="text-xl text-blue-100/80 max-w-2xl mx-auto">
              Trasparenza totale su come utilizziamo i cookie per migliorare la tua esperienza su FlyFile.
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="py-16 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%)`
          }}
        ></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Last Update */}
          <div className="text-center mb-12">
            <p className="text-gray-600">Ultimo aggiornamento: Dicembre 2025</p>
          </div>

          {/* What are Cookies */}
          <section className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-2xl p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mr-4">
                <Cookie className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Cosa sono i Cookie?</h2>
            </div>
            <p className="text-gray-700 mb-4">
              I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo quando visiti un sito web.
              Servono a ricordare le tue preferenze, a mantenere attiva la sessione e a migliorare la tua esperienza di navigazione.
            </p>
            <p className="text-gray-700">
              FlyFile utilizza cookie per garantire il corretto funzionamento del servizio e per offrirti
              un&apos;esperienza personalizzata e sicura.
            </p>
          </section>

          {/* Types of Cookies */}
          <section className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tipi di Cookie Utilizzati</h2>

            <div className="space-y-6">
              {/* Essential Cookies */}
              <div className="border-l-4 border-green-500 pl-6">
                <div className="flex items-center mb-2">
                  <Shield className="w-5 h-5 text-green-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Cookie Essenziali</h3>
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Sempre attivi</span>
                </div>
                <p className="text-gray-700 mb-3">
                  Necessari per il funzionamento base del sito. Senza questi cookie, servizi come l&apos;autenticazione
                  e la sicurezza non funzionerebbero correttamente.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-600 text-sm">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Autenticazione e sessione utente
                  </li>
                  <li className="flex items-center text-gray-600 text-sm">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Protezione CSRF
                  </li>
                  <li className="flex items-center text-gray-600 text-sm">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Preferenze cookie
                  </li>
                </ul>
              </div>

              {/* Analytics Cookies */}
              <div className="border-l-4 border-blue-500 pl-6">
                <div className="flex items-center mb-2">
                  <BarChart3 className="w-5 h-5 text-blue-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Cookie Analitici</h3>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Opzionali</span>
                </div>
                <p className="text-gray-700 mb-3">
                  Ci aiutano a capire come gli utenti interagiscono con il sito, permettendoci di migliorare
                  continuamente l&apos;esperienza utente.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-600 text-sm">
                    <Check className="w-4 h-4 text-blue-500 mr-2" />
                    Statistiche di utilizzo aggregate
                  </li>
                  <li className="flex items-center text-gray-600 text-sm">
                    <Check className="w-4 h-4 text-blue-500 mr-2" />
                    Monitoraggio delle performance
                  </li>
                  <li className="flex items-center text-gray-600 text-sm">
                    <Check className="w-4 h-4 text-blue-500 mr-2" />
                    Analisi dei percorsi di navigazione
                  </li>
                </ul>
              </div>

              {/* Functional Cookies */}
              <div className="border-l-4 border-purple-500 pl-6">
                <div className="flex items-center mb-2">
                  <Settings className="w-5 h-5 text-purple-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Cookie Funzionali</h3>
                  <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Opzionali</span>
                </div>
                <p className="text-gray-700 mb-3">
                  Permettono di ricordare le tue preferenze e personalizzare l&apos;esperienza sul sito.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-600 text-sm">
                    <Check className="w-4 h-4 text-purple-500 mr-2" />
                    Preferenze di lingua
                  </li>
                  <li className="flex items-center text-gray-600 text-sm">
                    <Check className="w-4 h-4 text-purple-500 mr-2" />
                    Impostazioni di visualizzazione
                  </li>
                  <li className="flex items-center text-gray-600 text-sm">
                    <Check className="w-4 h-4 text-purple-500 mr-2" />
                    Personalizzazione del dashboard
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Cookie Table */}
          <section className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dettaglio Cookie Utilizzati</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Nome</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Tipo</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Durata</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Scopo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-3 px-4 font-mono text-xs text-gray-700">flyfile_session</td>
                    <td className="py-3 px-4"><span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Essenziale</span></td>
                    <td className="py-3 px-4 text-gray-600">Sessione</td>
                    <td className="py-3 px-4 text-gray-600">Mantiene la sessione utente attiva</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-xs text-gray-700">XSRF-TOKEN</td>
                    <td className="py-3 px-4"><span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Essenziale</span></td>
                    <td className="py-3 px-4 text-gray-600">Sessione</td>
                    <td className="py-3 px-4 text-gray-600">Protezione CSRF</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-xs text-gray-700">cookie_consent</td>
                    <td className="py-3 px-4"><span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Essenziale</span></td>
                    <td className="py-3 px-4 text-gray-600">1 anno</td>
                    <td className="py-3 px-4 text-gray-600">Memorizza le preferenze cookie</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-xs text-gray-700">_ga</td>
                    <td className="py-3 px-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Analitico</span></td>
                    <td className="py-3 px-4 text-gray-600">2 anni</td>
                    <td className="py-3 px-4 text-gray-600">Google Analytics - identificazione</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-xs text-gray-700">preferences</td>
                    <td className="py-3 px-4"><span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Funzionale</span></td>
                    <td className="py-3 px-4 text-gray-600">1 anno</td>
                    <td className="py-3 px-4 text-gray-600">Preferenze utente</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Manage Cookies */}
          <section className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-2xl p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-4">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Gestione dei Cookie</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Puoi gestire le tue preferenze sui cookie in qualsiasi momento. Hai il diritto di:
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                <span className="text-gray-700">Accettare o rifiutare i cookie opzionali</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                <span className="text-gray-700">Modificare le tue preferenze in qualsiasi momento</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                <span className="text-gray-700">Eliminare i cookie già memorizzati nel tuo browser</span>
              </li>
            </ul>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">Nota importante</h4>
                  <p className="text-yellow-700 text-sm">
                    Disabilitare i cookie essenziali potrebbe compromettere alcune funzionalità del sito,
                    come l&apos;autenticazione e la sicurezza delle sessioni.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Browser Settings */}
          <section className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Impostazioni del Browser</h2>
            <p className="text-gray-700 mb-4">
              Puoi anche controllare i cookie attraverso le impostazioni del tuo browser.
              Ecco i link alle guide dei principali browser:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="https://support.google.com/chrome/answer/95647"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-white/50 rounded-xl text-center hover:bg-white/80 transition-colors"
              >
                <span className="font-semibold text-gray-900">Chrome</span>
              </a>
              <a
                href="https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-white/50 rounded-xl text-center hover:bg-white/80 transition-colors"
              >
                <span className="font-semibold text-gray-900">Firefox</span>
              </a>
              <a
                href="https://support.apple.com/guide/safari/manage-cookies-sfri11471"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-white/50 rounded-xl text-center hover:bg-white/80 transition-colors"
              >
                <span className="font-semibold text-gray-900">Safari</span>
              </a>
              <a
                href="https://support.microsoft.com/help/4027947"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-white/50 rounded-xl text-center hover:bg-white/80 transition-colors"
              >
                <span className="font-semibold text-gray-900">Edge</span>
              </a>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Domande sui Cookie?</h2>
            <p className="text-gray-700 mb-6">
              Se hai domande sulla nostra politica sui cookie o sul trattamento dei tuoi dati,
              contattaci pure.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              Contattaci
            </Link>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
