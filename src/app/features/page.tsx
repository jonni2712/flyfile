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
  Globe
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Funzionalità - FlyFile',
  description: 'Scopri le funzionalità enterprise-grade di FlyFile: crittografia AES-256, condivisione intelligente, analytics avanzate e molto altro.',
};

export default function FeaturesPage() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden -mt-16 pt-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)`
          }}
        ></div>

        <div className="relative z-10 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-8">
              <Zap className="w-5 h-5 text-cyan-400 mr-2" />
              <span className="text-white/90 text-sm font-medium">Funzionalità Avanzate</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              Tutto quello che serve per
              <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                condividere in sicurezza
              </span>
            </h1>

            <p className="text-xl text-blue-100/80 max-w-3xl mx-auto mb-8">
              Scopri le funzionalità enterprise-grade che rendono FlyFile la scelta preferita per professionisti e aziende di tutto il mondo.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/upload"
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg"
              >
                Prova Subito Gratis
              </Link>
              <Link
                href="/pricing"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-xl font-semibold transition-all duration-300"
              >
                Vedi i Piani
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Content */}
      <div className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%)`
          }}
        ></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Core Features */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Funzionalità Principali</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              FlyFile combina sicurezza enterprise, facilità d&apos;uso e prestazioni elevate per offrirti la migliore esperienza di condivisione file.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-20">
            {/* Encryption */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8 hover:bg-white/80 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Crittografia AES-256</h3>
              <p className="text-gray-700 mb-6">
                Ogni file è protetto con crittografia end-to-end di livello militare. I tuoi dati sono al sicuro anche se i nostri server vengono compromessi.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Chiavi uniche per ogni file
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Crittografia lato server
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Standard bancario
                </li>
              </ul>
            </div>

            {/* Smart Sharing */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8 hover:bg-white/80 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Share2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Condivisione Intelligente</h3>
              <p className="text-gray-700 mb-6">
                Link personalizzabili, scadenze automatiche e controlli di accesso avanzati per ogni tipo di condivisione.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-blue-500 mr-2" />
                  Link con scadenza personalizzata
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-blue-500 mr-2" />
                  Protezione con password
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-blue-500 mr-2" />
                  Limitazioni di download
                </li>
              </ul>
            </div>

            {/* Analytics */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8 hover:bg-white/80 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Analytics Avanzate</h3>
              <p className="text-gray-700 mb-6">
                Monitora chi, quando e come accede ai tuoi file con analytics dettagliate in tempo reale.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-purple-500 mr-2" />
                  Tracking download in tempo reale
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-purple-500 mr-2" />
                  Geolocalizzazione accessi
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-purple-500 mr-2" />
                  Statistiche browser e OS
                </li>
              </ul>
            </div>
          </div>

          {/* Advanced Features */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Funzionalità Avanzate</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Strumenti professionali per team e organizzazioni che hanno bisogno di controllo completo sui loro dati.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {/* Team Management */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Gestione Team</h3>
              </div>
              <p className="text-gray-700 mb-6">
                Collabora in sicurezza con il tuo team. Invita membri e monitora l&apos;attività di gruppo.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-orange-500 mr-2" />
                    Inviti via email
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-orange-500 mr-2" />
                    Fino a 3 membri inclusi
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-orange-500 mr-2" />
                    Dashboard condivisa
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-orange-500 mr-2" />
                    Analytics di team
                  </div>
                </div>
              </div>
            </div>

            {/* API Integration */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">API REST</h3>
              </div>
              <p className="text-gray-700 mb-6">
                Integra FlyFile nei tuoi workflow esistenti con la nostra API REST completa e documentazione dettagliata.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-indigo-500 mr-2" />
                    Endpoint completi
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-indigo-500 mr-2" />
                    Autenticazione Bearer Token
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-indigo-500 mr-2" />
                    Esempi di codice
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-indigo-500 mr-2" />
                    Webhook real-time
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance & Scale */}
          <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-3xl p-12 text-white mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-6">Prestazioni e Scalabilità</h2>
              <p className="text-xl text-blue-100/80 max-w-3xl mx-auto">
                Infrastruttura cloud progettata per gestire qualsiasi volume di dati con prestazioni costanti.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">99.9%</h3>
                <p className="text-blue-100/80">Uptime SLA</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Cloud className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Illimitato</h3>
                <p className="text-blue-100/80">Dimensione file</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">AES-256</h3>
                <p className="text-blue-100/80">Crittografia</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-orange-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Cloudflare</h3>
                <p className="text-blue-100/80">CDN globale</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Pronto a iniziare?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Unisciti a migliaia di professionisti che hanno scelto FlyFile per le loro esigenze di condivisione file sicura.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg"
                >
                  Inizia Gratis Ora
                </Link>
                <Link
                  href="/contact"
                  className="px-8 py-4 bg-white/20 hover:bg-white/30 text-gray-800 border border-gray-300 rounded-xl font-semibold transition-all duration-300"
                >
                  Contatta il Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
