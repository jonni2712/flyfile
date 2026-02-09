import { Metadata } from 'next';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import {
  Zap,
  Lock,
  Share2,
  BarChart3,
  Users,
  Code,
  Check,
  Shield,
  Cloud,
  Globe,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Funzionalità - FlyFile',
  description:
    'Scopri le funzionalità enterprise-grade di FlyFile: crittografia AES-256, condivisione intelligente, analytics avanzate e molto altro.',
};

export default function FeaturesPage() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative min-h-[85vh] flex items-center -mt-16 pt-16 overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        {/* Decorative circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-20">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <Zap className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Funzionalità Avanzate</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            Tutto quello che serve per
            <span className="block italic font-light">condividere in sicurezza</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Scopri le funzionalità enterprise-grade che rendono FlyFile la scelta preferita per
            professionisti e aziende di tutto il mondo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-all shadow-lg"
            >
              Prova Subito Gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/15 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-full hover:bg-white/25 transition-all"
            >
              Vedi i Piani
            </Link>
          </div>
        </div>
      </div>

      {/* Core Features */}
      <div className="bg-white py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
              Funzionalità principali
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mt-4 mb-6 leading-tight">
              Sicurezza, condivisione e analytics
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              FlyFile combina sicurezza enterprise, facilità d&apos;uso e prestazioni elevate per
              offrirti la migliore esperienza di condivisione file.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Encryption */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-5">
                <Lock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Crittografia AES-256</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Ogni file è protetto con crittografia end-to-end di livello militare. I tuoi dati
                sono al sicuro anche se i nostri server vengono compromessi.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Chiavi uniche per ogni file
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Crittografia lato server
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Standard bancario
                </li>
              </ul>
            </div>

            {/* Smart Sharing */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-5">
                <Share2 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Condivisione Intelligente</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Link personalizzabili, scadenze automatiche e controlli di accesso avanzati per ogni
                tipo di condivisione.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                  Link con scadenza personalizzata
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                  Protezione con password
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                  Limitazioni di download
                </li>
              </ul>
            </div>

            {/* Analytics */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-5">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Analytics Avanzate</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Monitora chi, quando e come accede ai tuoi file con analytics dettagliate in tempo
                reale.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" />
                  Tracking download in tempo reale
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" />
                  Geolocalizzazione accessi
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" />
                  Statistiche browser e OS
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Features */}
      <div className="bg-gray-50 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">
              Funzionalità avanzate
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mt-4 mb-6 leading-tight">
              Strumenti per team e sviluppatori
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Strumenti professionali per team e organizzazioni che hanno bisogno di controllo
              completo sui loro dati.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Team Management */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Gestione Team</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">
                Collabora in sicurezza con il tuo team. Invita membri e monitora l&apos;attività di
                gruppo.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" />
                    Inviti via email
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" />
                    Fino a 3 membri inclusi
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" />
                    Dashboard condivisa
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" />
                    Analytics di team
                  </div>
                </div>
              </div>
            </div>

            {/* API Integration */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mr-4">
                  <Code className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">API REST</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">
                Integra FlyFile nei tuoi workflow esistenti con la nostra API REST completa e
                documentazione dettagliata.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-indigo-500 mr-2 flex-shrink-0" />
                    Endpoint completi
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-indigo-500 mr-2 flex-shrink-0" />
                    Autenticazione Bearer Token
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-indigo-500 mr-2 flex-shrink-0" />
                    Esempi di codice
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-indigo-500 mr-2 flex-shrink-0" />
                    Webhook real-time
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="bg-white py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-12 sm:p-16 text-white relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="text-center mb-12">
                <span className="text-sm font-semibold text-white/70 uppercase tracking-wider">
                  Prestazioni e scalabilità
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-4">
                  Infrastruttura pensata per crescere
                </h2>
                <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
                  Infrastruttura cloud progettata per gestire qualsiasi volume di dati con
                  prestazioni costanti.
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold mb-1">99.9%</h3>
                  <p className="text-white/70 text-sm">Uptime SLA</p>
                </div>

                <div className="text-center">
                  <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Cloud className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold mb-1">Illimitato</h3>
                  <p className="text-white/70 text-sm">Dimensione file</p>
                </div>

                <div className="text-center">
                  <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold mb-1">AES-256</h3>
                  <p className="text-white/70 text-sm">Crittografia</p>
                </div>

                <div className="text-center">
                  <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold mb-1">Cloudflare</h3>
                  <p className="text-white/70 text-sm">CDN globale</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-12 sm:p-16 text-white overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Pronto a iniziare?</h2>
                <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Unisciti a migliaia di professionisti che hanno scelto FlyFile per le loro esigenze
                  di condivisione file sicura.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-all shadow-lg"
                  >
                    Inizia Gratis Ora
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/15 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-full hover:bg-white/25 transition-all"
                  >
                    Contatta il Sales
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
