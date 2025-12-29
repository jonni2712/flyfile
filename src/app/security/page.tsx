import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Lock, Key, Eye, Server, Globe, Check, Clock, BarChart3, AlertTriangle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

export const metadata: Metadata = {
  title: 'Sicurezza - FlyFile',
  description: 'Standard di sicurezza enterprise, conformità GDPR e crittografia di livello militare per proteggere i tuoi dati più importanti.',
};

export default function SecurityPage() {
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
              <Shield className="w-5 h-5 text-cyan-400 mr-2" />
              <span className="text-white/90 text-sm font-medium">Sicurezza Enterprise</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              La tua sicurezza è la nostra
              <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                priorità assoluta
              </span>
            </h1>

            <p className="text-xl text-blue-100/80 max-w-3xl mx-auto mb-8">
              Standard di sicurezza enterprise, conformità GDPR e crittografia di livello militare per proteggere i tuoi dati più importanti.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/upload"
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg"
              >
                Prova la Sicurezza
              </Link>
              <Link
                href="/privacy"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-xl font-semibold transition-all duration-300"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Security Content */}
      <div className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%)`
          }}
        ></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Encryption Features */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Crittografia End-to-End</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ogni file è protetto con la stessa crittografia utilizzata da banche e governi. I tuoi dati sono al sicuro, sempre.
            </p>
          </div>

          {/* Main Security Feature */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-12 border border-green-200 mb-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-8">
                  <Lock className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Crittografia AES-256</h3>
                <p className="text-lg text-gray-700 mb-6">
                  Utilizziamo lo standard di crittografia AES-256, lo stesso utilizzato dal governo americano per i documenti top-secret.
                  Ogni file riceve una chiave di crittografia unica che viene generata automaticamente.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-700">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>Chiavi uniche per ogni singolo file</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>Crittografia lato server prima dello storage</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>Decrittografia sicura al momento del download</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-2xl p-8">
                <h4 className="text-xl font-bold text-gray-900 mb-6">Come Funziona</h4>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-4 mt-1">
                      <span className="text-blue-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-800">Upload</h5>
                      <p className="text-gray-600 text-sm">Il file viene crittografato sul nostro server prima dello storage</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mr-4 mt-1">
                      <span className="text-green-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-800">Storage</h5>
                      <p className="text-gray-600 text-sm">Il file crittografato viene archiviato in modo sicuro</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mr-4 mt-1">
                      <span className="text-purple-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-800">Download</h5>
                      <p className="text-gray-600 text-sm">Il file viene decrittografato solo al momento del download autorizzato</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Features Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-20">
            {/* Secure Transfer */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Trasferimenti Sicuri</h3>
              <p className="text-gray-700 mb-6">
                Tutte le comunicazioni avvengono tramite HTTPS con certificati SSL/TLS per garantire che i dati in transito siano sempre protetti.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-blue-500 mr-2" />
                  Certificati SSL/TLS
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-blue-500 mr-2" />
                  HTTPS obbligatorio
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-blue-500 mr-2" />
                  Protezione HSTS
                </li>
              </ul>
            </div>

            {/* Access Control */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                <Key className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Controllo Accessi</h3>
              <p className="text-gray-700 mb-6">
                Controlla chi può accedere ai tuoi file con protezione password, scadenze automatiche e limitazioni di download.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-purple-500 mr-2" />
                  Protezione password
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-purple-500 mr-2" />
                  Scadenze personalizzate
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-purple-500 mr-2" />
                  Limitazioni download
                </li>
              </ul>
            </div>

            {/* Security Monitoring */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Monitoraggio Sicurezza</h3>
              <p className="text-gray-700 mb-6">
                Monitoriamo continuamente l&apos;accesso ai tuoi file e ti forniamo log dettagliati per tracciare ogni attività.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-orange-500 mr-2" />
                  Log accessi completi
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-orange-500 mr-2" />
                  Geolocalizzazione IP
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-orange-500 mr-2" />
                  Alert in tempo reale
                </li>
              </ul>
            </div>
          </div>

          {/* Compliance Section */}
          <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-3xl p-12 text-white mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-6">Conformità e Standard</h2>
              <p className="text-xl text-blue-100/80 max-w-3xl mx-auto">
                Rispettiamo le normative europee per la protezione dei dati e implementiamo le migliori pratiche di sicurezza.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* GDPR */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold mb-4">GDPR Compliant</h3>
                <p className="text-blue-100/80 text-sm">
                  Completamente conforme al Regolamento Generale sulla Protezione dei Dati dell&apos;Unione Europea.
                </p>
              </div>

              {/* Crittografia */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold mb-4">Crittografia AES-256</h3>
                <p className="text-blue-100/80 text-sm">
                  Standard di crittografia di livello bancario per proteggere tutti i tuoi file in transito e a riposo.
                </p>
              </div>

              {/* Server EU */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Globe className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-4">Server in Europa</h3>
                <p className="text-blue-100/80 text-sm">
                  I tuoi dati sono archiviati su server europei con CDN globale Cloudflare per prestazioni ottimali.
                </p>
              </div>
            </div>
          </div>

          {/* Infrastructure Security */}
          <div className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Sicurezza dell&apos;Infrastruttura</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                La nostra infrastruttura è progettata con sicurezza multi-livello per proteggere i tuoi dati a ogni strato.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Data Centers */}
              <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mr-4">
                    <Server className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Infrastruttura Cloud</h3>
                </div>
                <p className="text-gray-700 mb-6">
                  Utilizziamo Cloudflare R2 per lo storage dei file, garantendo velocità globale e affidabilità enterprise.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-700">
                    <Check className="w-5 h-5 text-blue-500 mr-3" />
                    <span>CDN globale Cloudflare</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <Check className="w-5 h-5 text-blue-500 mr-3" />
                    <span>Storage ridondante multi-regione</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <Check className="w-5 h-5 text-blue-500 mr-3" />
                    <span>99.9% di uptime SLA</span>
                  </li>
                </ul>
              </div>

              {/* Network Security */}
              <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Sicurezza di Rete</h3>
                </div>
                <p className="text-gray-700 mb-6">
                  Protezione multi-livello con firewall avanzati, sistemi di rilevamento intrusioni e monitoraggio continuo.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-700">
                    <Check className="w-5 h-5 text-purple-500 mr-3" />
                    <span>Firewall avanzati e WAF</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <Check className="w-5 h-5 text-purple-500 mr-3" />
                    <span>Sistemi IDS/IPS in tempo reale</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <Check className="w-5 h-5 text-purple-500 mr-3" />
                    <span>Protezione DDoS avanzata</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Security Best Practices */}
          <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-12 mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Best Practice di Sicurezza</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Consigli per massimizzare la sicurezza dei tuoi trasferimenti di file con FlyFile.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Key className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Password Forti</h4>
                <p className="text-gray-600 text-sm">Usa password complesse per proteggere i trasferimenti sensibili</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Scadenze Brevi</h4>
                <p className="text-gray-600 text-sm">Imposta scadenze rapide per ridurre la finestra di esposizione</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Monitora Accessi</h4>
                <p className="text-gray-600 text-sm">Controlla regolarmente chi ha accesso ai tuoi file</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Condivisione Limitata</h4>
                <p className="text-gray-600 text-sm">Condividi link solo con destinatari autorizzati</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Sicurezza Garantita per i Tuoi Dati
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Affidati alla piattaforma di condivisione file più sicura. Inizia oggi con la massima protezione per i tuoi dati sensibili.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg"
                >
                  Inizia con Sicurezza Massima
                </Link>
                <Link
                  href="/contact"
                  className="px-8 py-4 bg-white/60 hover:bg-white/80 text-gray-800 border border-gray-300 rounded-xl font-semibold transition-all duration-300"
                >
                  Contatta il Security Team
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
