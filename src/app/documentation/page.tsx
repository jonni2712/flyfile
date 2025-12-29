import { Metadata } from 'next';
import MainLayout from '@/components/layout/MainLayout';
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
  HelpCircle
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Documentazione - FlyFile',
  description: 'Guide complete, tutorial passo-passo e riferimenti API per sfruttare al massimo le potenzialità di FlyFile.',
};

export default function DocumentationPage() {
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
              <FileText className="w-5 h-5 text-cyan-400 mr-2" />
              <span className="text-white/90 text-sm font-medium">Documentazione</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              Tutto quello che serve
              <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                per iniziare
              </span>
            </h1>

            <p className="text-xl text-blue-100/80 max-w-3xl mx-auto mb-8">
              Guide complete, tutorial passo-passo e riferimenti API per sfruttare al massimo le potenzialità di FlyFile.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#quick-start"
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg"
              >
                Guida Rapida
              </a>
              <a
                href="#api-reference"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-xl font-semibold transition-all duration-300"
              >
                API Reference
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Content */}
      <div className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%)`
          }}
        ></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Quick Start Guide */}
          <section id="quick-start" className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Guida Rapida</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Inizia a condividere file in modo sicuro in meno di 5 minuti.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-16">
              {/* Step 1 */}
              <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8 relative">
                <div className="absolute -top-4 left-8">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    1
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 mt-4">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Crea Account</h3>
                <p className="text-gray-700 mb-6">
                  Registrati gratuitamente per accedere a tutte le funzionalità di sicurezza e tracking.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-blue-500 mr-2" />
                    Email e password
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-blue-500 mr-2" />
                    Verifica email automatica
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-blue-500 mr-2" />
                    Accesso immediato
                  </li>
                </ul>
              </div>

              {/* Step 2 */}
              <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8 relative">
                <div className="absolute -top-4 left-8">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                    2
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 mt-4">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Upload File</h3>
                <p className="text-gray-700 mb-6">
                  Trascina i file nell&apos;area di upload o selezionali dal tuo dispositivo.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Drag & drop
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Upload multipli
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Crittografia automatica
                  </li>
                </ul>
              </div>

              {/* Step 3 */}
              <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8 relative">
                <div className="absolute -top-4 left-8">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                    3
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 mt-4">
                  <Share2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Condividi</h3>
                <p className="text-gray-700 mb-6">
                  Personalizza le impostazioni di sicurezza e condividi il link generato.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-purple-500 mr-2" />
                    Link sicuro
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-purple-500 mr-2" />
                    Protezione password
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-purple-500 mr-2" />
                    Scadenza personalizzata
                  </li>
                </ul>
              </div>
            </div>

            {/* Pro Tips */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-3xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mr-4">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Suggerimenti Pro</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Sicurezza Avanzata</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>Usa password complesse per i file sensibili</li>
                    <li>Imposta scadenze brevi per ridurre i rischi</li>
                    <li>Monitora gli accessi nella dashboard</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Produttività</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>Salva destinatari frequenti per invii rapidi</li>
                    <li>Usa template per messaggi ricorrenti</li>
                    <li>Sfrutta le API per automatizzare i workflow</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Features Guide */}
          <section id="features-guide" className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Guide alle Funzionalità</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Approfondimenti dettagliati su come utilizzare al meglio ogni funzionalità di FlyFile.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Upload Guide */}
              <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8 hover:bg-white/80 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Upload Avanzato</h3>
                <p className="text-gray-700 mb-4">
                  Gestione file multipli, validazione automatica e progress tracking in tempo reale.
                </p>
                <span className="text-green-600 font-medium text-sm">Scopri di più</span>
              </div>

              {/* Security Guide */}
              <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8 hover:bg-white/80 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Impostazioni Sicurezza</h3>
                <p className="text-gray-700 mb-4">
                  Protezione password, controlli di accesso e configurazioni di scadenza avanzate.
                </p>
                <span className="text-blue-600 font-medium text-sm">Scopri di più</span>
              </div>

              {/* Analytics Guide */}
              <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8 hover:bg-white/80 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Analytics e Reporting</h3>
                <p className="text-gray-700 mb-4">
                  Monitoraggio accessi, statistiche dettagliate e report esportabili.
                </p>
                <span className="text-purple-600 font-medium text-sm">Scopri di più</span>
              </div>

              {/* Team Guide */}
              <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8 hover:bg-white/80 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Gestione Team</h3>
                <p className="text-gray-700 mb-4">
                  Inviti membri, ruoli personalizzati e dashboard collaborativa per team business.
                </p>
                <span className="text-orange-600 font-medium text-sm">Scopri di più</span>
              </div>

              {/* API Guide */}
              <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8 hover:bg-white/80 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Integrazione API</h3>
                <p className="text-gray-700 mb-4">
                  REST API completa, autenticazione OAuth2 e SDK per linguaggi popolari.
                </p>
                <span className="text-indigo-600 font-medium text-sm">Scopri di più</span>
              </div>

              {/* Troubleshooting */}
              <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8 hover:bg-white/80 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mb-6">
                  <HelpCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Risoluzione Problemi</h3>
                <p className="text-gray-700 mb-4">
                  Soluzioni ai problemi comuni, FAQ dettagliate e procedure di diagnostic.
                </p>
                <span className="text-yellow-600 font-medium text-sm">Scopri di più</span>
              </div>
            </div>
          </section>

          {/* API Reference */}
          <section id="api-reference" className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">API Reference</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Documentazione completa per integrare FlyFile nei tuoi sistemi e workflow.
              </p>
            </div>

            <div className="bg-gray-900 rounded-3xl p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Endpoint Base</h3>
                <span className="px-3 py-1 bg-green-600 text-white text-xs rounded-full">REST API v1</span>
              </div>
              <div className="bg-gray-800 rounded-xl p-6 font-mono text-sm">
                <div className="text-green-400 mb-2">Base URL:</div>
                <div className="text-white">https://flyfile.it/api/v1</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Authentication */}
              <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Autenticazione</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Bearer Token (Laravel Sanctum)</h4>
                    <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm">
                      <span className="text-blue-600">Authorization:</span> Bearer {'{token}'}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Come ottenere il token</h4>
                    <p className="text-sm text-gray-600">
                      Genera un token API dalla tua dashboard utente nella sezione &quot;Impostazioni API&quot; (richiede piano Business).
                    </p>
                  </div>
                </div>
              </div>

              {/* Common Endpoints */}
              <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Endpoint Principali</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-green-500 pl-4">
                    <div className="font-mono text-sm text-green-600 mb-1">POST /transfers</div>
                    <p className="text-gray-700 text-sm">Crea un nuovo trasferimento file</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <div className="font-mono text-sm text-blue-600 mb-1">GET /transfers/{'{id}'}</div>
                    <p className="text-gray-700 text-sm">Recupera dettagli trasferimento</p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <div className="font-mono text-sm text-purple-600 mb-1">GET /analytics</div>
                    <p className="text-gray-700 text-sm">Statistiche e analytics</p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-4">
                    <div className="font-mono text-sm text-orange-600 mb-1">POST /teams/{'{id}'}/invite</div>
                    <p className="text-gray-700 text-sm">Invita membri al team</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Examples */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Esempi di Codice</h3>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* JavaScript Example */}
                <div className="bg-gray-900 rounded-3xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-bold text-white">JavaScript</h4>
                    <span className="px-3 py-1 bg-yellow-600 text-white text-xs rounded-full">ES6+</span>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-6 font-mono text-sm overflow-x-auto">
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
                <div className="bg-gray-900 rounded-3xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-bold text-white">Python</h4>
                    <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full">requests</span>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-6 font-mono text-sm overflow-x-auto">
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
          </section>

          {/* FAQ Section */}
          <section id="faq" className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Domande Frequenti</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Risposte alle domande più comuni su FlyFile e le sue funzionalità.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Come funziona la crittografia end-to-end?</h3>
                  <p className="text-gray-700">
                    Ogni file caricato su FlyFile viene crittografato con AES-256 utilizzando una chiave unica generata automaticamente. Il file viene crittografato sul nostro server prima di essere archiviato e viene decrittografato solo quando un utente autorizzato lo scarica. Questo garantisce che nemmeno noi possiamo accedere ai contenuti dei tuoi file.
                  </p>
                </div>

                <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Quali sono i limiti di trasferimento?</h3>
                  <p className="text-gray-700">
                    La dimensione dei singoli file è illimitata su tutti i piani. Il limite riguarda la quota mensile: Free (5GB/mese), Starter (300GB/mese), Pro (500GB/mese), Business (illimitato). Ogni piano ha anche un limite di trasferimenti mensili.
                  </p>
                </div>

                <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">I file vengono eliminati automaticamente?</h3>
                  <p className="text-gray-700">
                    Sì, tutti i file hanno una scadenza automatica basata sul tuo piano: Free (5 giorni), Starter (7 giorni), Pro (30 giorni), Business (1 anno). Con i piani Pro e Business puoi personalizzare la scadenza. Una volta scaduti, i file vengono eliminati definitivamente.
                  </p>
                </div>

                <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Posso integrare FlyFile nei miei sistemi?</h3>
                  <p className="text-gray-700">
                    Sì! Con il piano Business hai accesso alla nostra API REST completa con autenticazione Bearer Token e webhook per notifiche in tempo reale. La documentazione completa è disponibile nella sezione API Reference di questa pagina.
                  </p>
                </div>

                <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">FlyFile è conforme al GDPR?</h3>
                  <p className="text-gray-700">
                    Sì, FlyFile è completamente conforme al GDPR e ad altri standard internazionali per la protezione dei dati. Abbiamo implementato tutte le misure tecniche e organizzative necessarie per garantire la sicurezza dei dati personali e rispettare i diritti degli utenti.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Support Call to Action */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Hai bisogno di aiuto?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Il nostro team di supporto è qui per aiutarti. Contattaci per assistenza tecnica, domande sui piani o supporto per l&apos;integrazione.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg"
                >
                  Contatta il Supporto
                </Link>
                <a
                  href="mailto:support@flyfile.it"
                  className="px-8 py-4 bg-white/60 hover:bg-white/80 text-gray-800 border border-gray-300 rounded-xl font-semibold transition-all duration-300"
                >
                  support@flyfile.it
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
