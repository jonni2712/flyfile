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
      <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden -mt-16 pt-16">
        {/* Decorative Circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />

        <div className="relative z-10 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 border border-white/30 rounded-full mb-8">
              <Shield className="w-5 h-5 text-white mr-2" />
              <span className="text-white text-sm font-medium">Sicurezza Enterprise</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              La tua sicurezza è la nostra<br />
              priorità assoluta
            </h1>

            <p className="text-lg text-white/80 max-w-3xl mx-auto mb-10">
              Standard di sicurezza enterprise, conformità GDPR e crittografia di livello militare per proteggere i tuoi dati più importanti.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="px-8 py-4 bg-white text-purple-600 hover:bg-gray-100 rounded-xl font-semibold transition-all duration-300 shadow-lg"
              >
                Prova la Sicurezza
              </Link>
              <Link
                href="/privacy"
                className="px-8 py-4 bg-transparent hover:bg-white/10 text-white border-2 border-white/40 rounded-xl font-semibold transition-all duration-300"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* AES-256 Encryption Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Crittografia End-to-End</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Ogni file è protetto con la stessa crittografia utilizzata da banche e governi. I tuoi dati sono al sicuro, sempre.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 lg:p-12 border border-gray-100 shadow-sm">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-8">
                  <Lock className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Crittografia AES-256</h3>
                <p className="text-base text-gray-700 mb-6">
                  Utilizziamo lo standard di crittografia AES-256, lo stesso utilizzato dal governo americano per i documenti top-secret.
                  Ogni file riceve una chiave di crittografia unica che viene generata automaticamente.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center text-gray-700">
                    <div className="w-6 h-6 bg-green-50 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span>Chiavi uniche per ogni singolo file</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <div className="w-6 h-6 bg-green-50 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span>Crittografia lato server prima dello storage</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <div className="w-6 h-6 bg-green-50 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span>Decrittografia sicura al momento del download</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-2xl p-8">
                <h4 className="text-xl font-bold text-gray-900 mb-8">Come Funziona</h4>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-4 mt-0.5 flex-shrink-0">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-1">Upload</h5>
                      <p className="text-gray-600 text-sm">Il file viene crittografato sul nostro server prima dello storage</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-0.5 flex-shrink-0">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-1">Storage</h5>
                      <p className="text-gray-600 text-sm">Il file crittografato viene archiviato in modo sicuro</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-4 mt-0.5 flex-shrink-0">
                      <span className="text-white font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-1">Download</h5>
                      <p className="text-gray-600 text-sm">Il file viene decrittografato solo al momento del download autorizzato</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Features Grid */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Funzionalità di Sicurezza</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Protezione a 360 gradi per ogni aspetto della condivisione dei tuoi file.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Secure Transfer */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <Lock className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Trasferimenti Sicuri</h3>
              <p className="text-gray-600 mb-6">
                Tutte le comunicazioni avvengono tramite HTTPS con certificati SSL/TLS per garantire che i dati in transito siano sempre protetti.
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                  Certificati SSL/TLS
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                  HTTPS obbligatorio
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                  Protezione HSTS
                </li>
              </ul>
            </div>

            {/* Access Control */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
                <Key className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Controllo Accessi</h3>
              <p className="text-gray-600 mb-6">
                Controlla chi può accedere ai tuoi file con protezione password, scadenze automatiche e limitazioni di download.
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" />
                  Protezione password
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" />
                  Scadenze personalizzate
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" />
                  Limitazioni download
                </li>
              </ul>
            </div>

            {/* Security Monitoring */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Monitoraggio Sicurezza</h3>
              <p className="text-gray-600 mb-6">
                Monitoriamo continuamente l&apos;accesso ai tuoi file e ti forniamo log dettagliati per tracciare ogni attività.
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-orange-600 mr-2 flex-shrink-0" />
                  Log accessi completi
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-orange-600 mr-2 flex-shrink-0" />
                  Geolocalizzazione IP
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-orange-600 mr-2 flex-shrink-0" />
                  Alert in tempo reale
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Section - Gradient Card */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-12 relative overflow-hidden">
            {/* Decorative Circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Conformità e Standard</h2>
                <p className="text-lg text-white/80 max-w-3xl mx-auto">
                  Rispettiamo le normative europee per la protezione dei dati e implementiamo le migliori pratiche di sicurezza.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* GDPR */}
                <div className="bg-white/15 border border-white/20 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">GDPR Compliant</h3>
                  <p className="text-white/80 text-sm">
                    Completamente conforme al Regolamento Generale sulla Protezione dei Dati dell&apos;Unione Europea.
                  </p>
                </div>

                {/* Crittografia */}
                <div className="bg-white/15 border border-white/20 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Crittografia AES-256</h3>
                  <p className="text-white/80 text-sm">
                    Standard di crittografia di livello bancario per proteggere tutti i tuoi file in transito e a riposo.
                  </p>
                </div>

                {/* Server EU */}
                <div className="bg-white/15 border border-white/20 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Server in Europa</h3>
                  <p className="text-white/80 text-sm">
                    I tuoi dati sono archiviati su server europei con CDN globale Cloudflare per prestazioni ottimali.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Infrastructure Security */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Sicurezza dell&apos;Infrastruttura</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              La nostra infrastruttura è progettata con sicurezza multi-livello per proteggere i tuoi dati a ogni strato.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Cloud Infrastructure */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mr-4">
                  <Server className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Infrastruttura Cloud</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Utilizziamo Cloudflare R2 per lo storage dei file, garantendo velocità globale e affidabilità enterprise.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700">
                  <Check className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                  <span>CDN globale Cloudflare</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <Check className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                  <span>Storage ridondante multi-regione</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <Check className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                  <span>99.9% di uptime SLA</span>
                </li>
              </ul>
            </div>

            {/* Network Security */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mr-4">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Sicurezza di Rete</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Protezione multi-livello con firewall avanzati, sistemi di rilevamento intrusioni e monitoraggio continuo.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700">
                  <Check className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0" />
                  <span>Firewall avanzati e WAF</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <Check className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0" />
                  <span>Sistemi IDS/IPS in tempo reale</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <Check className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0" />
                  <span>Protezione DDoS avanzata</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Security Best Practices */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Best Practice di Sicurezza</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Consigli per massimizzare la sicurezza dei tuoi trasferimenti di file con FlyFile.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Password Forti</h4>
              <p className="text-gray-600 text-sm">Usa password complesse per proteggere i trasferimenti sensibili</p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Scadenze Brevi</h4>
              <p className="text-gray-600 text-sm">Imposta scadenze rapide per ridurre la finestra di esposizione</p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Monitora Accessi</h4>
              <p className="text-gray-600 text-sm">Controlla regolarmente chi ha accesso ai tuoi file</p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Condivisione Limitata</h4>
              <p className="text-gray-600 text-sm">Condividi link solo con destinatari autorizzati</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              Sicurezza Garantita per i Tuoi Dati
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Affidati alla piattaforma di condivisione file più sicura. Inizia oggi con la massima protezione per i tuoi dati sensibili.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg"
              >
                Inizia con Sicurezza Massima
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 rounded-xl font-semibold transition-all duration-300"
              >
                Contatta il Security Team
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
