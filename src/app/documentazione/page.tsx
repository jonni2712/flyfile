import { Metadata } from 'next';
import MainLayout from '@/components/layout/MainLayout';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import Link from 'next/link';
import {
  FileText,
  User,
  Upload,
  Share2,
  Check,
  Lightbulb,
  Lock,
  BarChart3,
  Users,
  Code,
  HelpCircle,
  ArrowRight,
  Zap,
  Mail,
  MessageCircle,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Documentazione',
  description:
    'Guide complete, tutorial passo-passo e riferimenti API per sfruttare al massimo le potenzialità di FlyFile.',
  alternates: { canonical: 'https://flyfile.it/documentazione' },
  openGraph: {
    title: 'Documentazione | FlyFile',
    description: 'Guide complete, tutorial passo-passo e riferimenti API per FlyFile.',
    url: 'https://flyfile.it/documentazione',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'FlyFile - Documentazione' }],
  },
};

export default function DocumentationPage() {
  return (
    <MainLayout>
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: 'https://flyfile.it' },
        { name: 'Documentazione', url: 'https://flyfile.it/documentazione' },
      ]} />
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden -mt-16 pt-16">
        {/* Decorative circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl" />

        <div className="relative z-10 py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full mb-8">
              <FileText className="w-4 h-4 text-white mr-2" />
              <span className="text-white text-sm font-medium">Documentazione</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              Tutto quello che serve
              <span className="block">per iniziare</span>
            </h1>

            <p className="text-lg text-white/80 max-w-3xl mx-auto mb-10">
              Guide complete, tutorial passo-passo e riferimenti API per sfruttare al massimo le
              potenzialità di FlyFile.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#quick-start"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-600 rounded-full font-semibold hover:bg-white/90 transition-all duration-300 shadow-lg shadow-black/10"
              >
                Guida Rapida
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
              <a
                href="#api-reference"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/15 text-white border border-white/30 rounded-full font-semibold hover:bg-white/25 transition-all duration-300"
              >
                API Reference
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Start Section */}
      <section id="quick-start" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Guida Rapida</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Inizia a condividere file in modo sicuro in meno di 5 minuti.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 relative">
              <div className="absolute -top-5 left-8">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30">
                  1
                </div>
              </div>
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 mt-4">
                <User className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Crea Account</h3>
              <p className="text-gray-600 mb-6">
                Registrati gratuitamente per accedere a tutte le funzionalità di sicurezza e
                tracking.
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                  Email e password
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                  Verifica email automatica
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                  Accesso immediato
                </li>
              </ul>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 relative">
              <div className="absolute -top-5 left-8">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-green-500/30">
                  2
                </div>
              </div>
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 mt-4">
                <Upload className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Upload File</h3>
              <p className="text-gray-600 mb-6">
                Trascina i file nell&apos;area di upload o selezionali dal tuo dispositivo.
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Drag &amp; drop
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Upload multipli
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Crittografia automatica
                </li>
              </ul>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 relative">
              <div className="absolute -top-5 left-8">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/30">
                  3
                </div>
              </div>
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 mt-4">
                <Share2 className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Condividi</h3>
              <p className="text-gray-600 mb-6">
                Personalizza le impostazioni di sicurezza e condividi il link generato.
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" />
                  Link sicuro
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" />
                  Protezione password
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" />
                  Scadenza personalizzata
                </li>
              </ul>
            </div>
          </div>

          {/* Pro Tips */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mr-4">
                <Lightbulb className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Suggerimenti Pro</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Sicurezza Avanzata</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Usa password complesse per i file sensibili</li>
                  <li>Imposta scadenze brevi per ridurre i rischi</li>
                  <li>Monitora gli accessi nella dashboard</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Produttività</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Salva destinatari frequenti per invii rapidi</li>
                  <li>Usa template per messaggi ricorrenti</li>
                  <li>Sfrutta le API per automatizzare i workflow</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Guide Section */}
      <section id="features-guide" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Guide alle Funzionalità</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Approfondimenti dettagliati su come utilizzare al meglio ogni funzionalità di FlyFile.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Upload Guide */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
                <Upload className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Upload Avanzato</h3>
              <p className="text-gray-600 mb-4">
                Gestione file multipli, validazione automatica e progress tracking in tempo reale.
              </p>
              <span className="inline-flex items-center text-green-600 font-medium text-sm group-hover:gap-2 transition-all duration-300">
                Scopri di più
                <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            </div>

            {/* Security Guide */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Impostazioni Sicurezza</h3>
              <p className="text-gray-600 mb-4">
                Protezione password, controlli di accesso e configurazioni di scadenza avanzate.
              </p>
              <span className="inline-flex items-center text-blue-600 font-medium text-sm group-hover:gap-2 transition-all duration-300">
                Scopri di più
                <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            </div>

            {/* Analytics Guide */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Analytics e Reporting</h3>
              <p className="text-gray-600 mb-4">
                Monitoraggio accessi, statistiche dettagliate e report esportabili.
              </p>
              <span className="inline-flex items-center text-purple-600 font-medium text-sm group-hover:gap-2 transition-all duration-300">
                Scopri di più
                <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            </div>

            {/* Team Guide */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Gestione Team</h3>
              <p className="text-gray-600 mb-4">
                Inviti membri, ruoli personalizzati e dashboard collaborativa per team business.
              </p>
              <span className="inline-flex items-center text-orange-600 font-medium text-sm group-hover:gap-2 transition-all duration-300">
                Scopri di più
                <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            </div>

            {/* API Guide */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                <Code className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Integrazione API</h3>
              <p className="text-gray-600 mb-4">
                REST API completa, autenticazione OAuth2 e SDK per linguaggi popolari.
              </p>
              <span className="inline-flex items-center text-indigo-600 font-medium text-sm group-hover:gap-2 transition-all duration-300">
                Scopri di più
                <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            </div>

            {/* Troubleshooting */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center mb-6">
                <HelpCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Risoluzione Problemi</h3>
              <p className="text-gray-600 mb-4">
                Soluzioni ai problemi comuni, FAQ dettagliate e procedure di diagnostic.
              </p>
              <span className="inline-flex items-center text-yellow-600 font-medium text-sm group-hover:gap-2 transition-all duration-300">
                Scopri di più
                <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* API Reference Section */}
      <section id="api-reference" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">API Reference</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Documentazione completa per integrare FlyFile nei tuoi sistemi e workflow.
            </p>
          </div>

          {/* Base URL */}
          <div className="bg-gray-950 rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Endpoint Base</h3>
              <span className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
                REST API v1
              </span>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 font-mono text-sm">
              <div className="text-green-400 mb-2">Base URL:</div>
              <div className="text-white">https://flyfile.it/api/v1</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Authentication */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Autenticazione</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Bearer Token (Laravel Sanctum)
                  </h4>
                  <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm">
                    <span className="text-blue-600">Authorization:</span> Bearer {'{token}'}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Come ottenere il token</h4>
                  <p className="text-sm text-gray-600">
                    Genera un token API dalla tua dashboard utente nella sezione &quot;Impostazioni
                    API&quot; (richiede piano Business).
                  </p>
                </div>
              </div>
            </div>

            {/* Endpoints */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Endpoint Principali</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <div className="font-mono text-sm text-green-600 mb-1">POST /transfers</div>
                  <p className="text-gray-600 text-sm">Crea un nuovo trasferimento file</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="font-mono text-sm text-blue-600 mb-1">
                    GET /transfers/{'{id}'}
                  </div>
                  <p className="text-gray-600 text-sm">Recupera dettagli trasferimento</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <div className="font-mono text-sm text-purple-600 mb-1">GET /analytics</div>
                  <p className="text-gray-600 text-sm">Statistiche e analytics</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <div className="font-mono text-sm text-orange-600 mb-1">
                    POST /teams/{'{id}'}/invite
                  </div>
                  <p className="text-gray-600 text-sm">Invita membri al team</p>
                </div>
              </div>
            </div>
          </div>

          {/* Code Examples */}
          <div className="mt-12">
            <h3 className="text-xl font-bold text-gray-900 mb-8">Esempi di Codice</h3>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* JavaScript Example */}
              <div className="bg-gray-950 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-bold text-white">JavaScript</h4>
                  <span className="px-3 py-1 bg-yellow-600 text-white text-xs font-medium rounded-full">
                    ES6+
                  </span>
                </div>
                <div className="bg-gray-900 rounded-xl p-6 font-mono text-sm overflow-x-auto">
                  <pre className="text-gray-300">
{`const response = await fetch('https://flyfile.it/api/v1/upload', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'Content-Type': 'multipart/form-data'
  },
  body: formData
});

const result = await response.json();
console.log(result.shareUrl);`}
                  </pre>
                </div>
              </div>

              {/* Python Example */}
              <div className="bg-gray-950 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-bold text-white">Python</h4>
                  <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                    requests
                  </span>
                </div>
                <div className="bg-gray-900 rounded-xl p-6 font-mono text-sm overflow-x-auto">
                  <pre className="text-gray-300">
{`import requests

headers = {
    'Authorization': f'Bearer {token}'
}

files = {'file': open('document.pdf', 'rb')}

response = requests.post(
    'https://flyfile.it/api/v1/upload',
    headers=headers,
    files=files
)

print(response.json()['shareUrl'])`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Domande Frequenti</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Risposte alle domande più comuni su FlyFile e le sue funzionalità.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Come funziona la crittografia end-to-end?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Ogni file caricato su FlyFile viene crittografato con AES-256 utilizzando una
                  chiave unica generata automaticamente. Il file viene crittografato sul nostro
                  server prima di essere archiviato e viene decrittografato solo quando un utente
                  autorizzato lo scarica. Questo garantisce che nemmeno noi possiamo accedere ai
                  contenuti dei tuoi file.
                </p>
              </div>

              <div className="py-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Quali sono i limiti di trasferimento?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  La dimensione dei singoli file è illimitata su tutti i piani. Il limite riguarda
                  la quota mensile: Free (5GB/mese), Starter (300GB/mese), Pro (500GB/mese),
                  Business (illimitato). Ogni piano ha anche un limite di trasferimenti mensili.
                </p>
              </div>

              <div className="py-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  I file vengono eliminati automaticamente?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Sì, tutti i file hanno una scadenza automatica basata sul tuo piano: Free (5
                  giorni), Starter (7 giorni), Pro (30 giorni), Business (1 anno). Con i piani Pro e
                  Business puoi personalizzare la scadenza. Una volta scaduti, i file vengono
                  eliminati definitivamente.
                </p>
              </div>

              <div className="py-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Posso integrare FlyFile nei miei sistemi?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Sì! Con il piano Business hai accesso alla nostra API REST completa con
                  autenticazione Bearer Token e webhook per notifiche in tempo reale. La
                  documentazione completa è disponibile nella sezione API Reference di questa pagina.
                </p>
              </div>

              <div className="py-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  FlyFile è conforme al GDPR?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Sì, FlyFile è completamente conforme al GDPR e ad altri standard internazionali
                  per la protezione dei dati. Abbiamo implementato tutte le misure tecniche e
                  organizzative necessarie per garantire la sicurezza dei dati personali e rispettare
                  i diritti degli utenti.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-12 lg:p-16 text-center relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Hai bisogno di aiuto?
              </h2>
              <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
                Il nostro team di supporto è qui per aiutarti. Contattaci per assistenza tecnica,
                domande sui piani o supporto per l&apos;integrazione.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contatti"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-600 rounded-full font-semibold hover:bg-white/90 transition-all duration-300 shadow-lg shadow-black/10"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Contatta il Supporto
                </Link>
                <a
                  href="mailto:support@flyfile.it"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/15 text-white border border-white/30 rounded-full font-semibold hover:bg-white/25 transition-all duration-300"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  support@flyfile.it
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
