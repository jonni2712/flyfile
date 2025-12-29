import { Metadata } from 'next';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { Shield, Check, Lock, User, Clock, BarChart3, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy - FlyFile',
  description: 'Informativa sulla privacy e trattamento dei dati di FlyFile. Scopri come proteggiamo i tuoi dati personali.',
};

export default function PrivacyPage() {
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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-8">
              <Shield className="w-5 h-5 text-cyan-400 mr-2" />
              <span className="text-white/90 text-sm font-medium">Privacy Policy</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              La tua privacy è la nostra
              <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                priorità assoluta
              </span>
            </h1>

            <p className="text-xl text-blue-100/80 max-w-3xl mx-auto">
              Ultimo aggiornamento: Dicembre 2025
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%)`
          }}
        ></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="space-y-12">

            {/* Introduction */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduzione</h2>
              <p className="text-gray-700 leading-relaxed">
                FlyFile (&quot;noi&quot;, &quot;nostro&quot; o &quot;la società&quot;) è impegnata a proteggere la privacy e la sicurezza dei dati personali degli utenti (&quot;tu&quot; o &quot;utente&quot;). Questa Privacy Policy descrive come raccogliamo, utilizziamo, conserviamo e proteggiamo le tue informazioni quando utilizzi il nostro servizio di condivisione file sicura.
              </p>
            </div>

            {/* Data Collection */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Informazioni che Raccogliamo</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Informazioni di Account</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Nome e indirizzo email durante la registrazione</li>
                    <li>Password criptografata per la sicurezza dell&apos;account</li>
                    <li>Preferenze di configurazione del profilo</li>
                    <li>Informazioni di fatturazione per gli abbonamenti a pagamento</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Dati di Utilizzo</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Metadati dei file caricati (nome, dimensione, data di caricamento)</li>
                    <li>Log di accesso e attività del servizio</li>
                    <li>Indirizzo IP e informazioni del dispositivo</li>
                    <li>Analytics sull&apos;utilizzo delle funzionalità</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Analytics Section */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Analisi e Statistiche</h2>

              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mr-4">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Google Analytics</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Utilizziamo Google Analytics per comprendere come gli utenti interagiscono con il nostro sito. Questo ci aiuta a migliorare l&apos;esperienza utente e le prestazioni del servizio.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                    <span className="text-gray-700 text-sm"><strong>Consenso richiesto:</strong> Google Analytics viene attivato solo dopo il tuo esplicito consenso</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                    <span className="text-gray-700 text-sm"><strong>IP anonimizzato:</strong> Il tuo indirizzo IP viene anonimizzato prima dell&apos;elaborazione</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                    <span className="text-gray-700 text-sm"><strong>Revoca facile:</strong> Puoi revocare il consenso in qualsiasi momento dalle <Link href="/cookies" className="text-purple-600 hover:underline">impostazioni cookie</Link></span>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 text-sm">
                Per maggiori informazioni su come Google utilizza i dati, consulta la <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Privacy Policy di Google</a>.
              </p>
            </div>

            {/* Data Processing */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Come Utilizziamo i Tuoi Dati</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center mr-3 mt-1">
                      <Check className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Fornitura del Servizio</h4>
                      <p className="text-gray-600 text-sm">Gestione dell&apos;account e delle funzionalità di condivisione file</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center mr-3 mt-1">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Sicurezza</h4>
                      <p className="text-gray-600 text-sm">Prevenzione di frodi e protezione dell&apos;account</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center mr-3 mt-1">
                      <Check className="w-3 h-3 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Miglioramento</h4>
                      <p className="text-gray-600 text-sm">Analisi per migliorare le prestazioni del servizio</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center mr-3 mt-1">
                      <Check className="w-3 h-3 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Comunicazione</h4>
                      <p className="text-gray-600 text-sm">Invio di aggiornamenti importanti sul servizio</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Security */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Sicurezza dei Dati</h2>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Crittografia End-to-End</h3>
                </div>
                <p className="text-gray-700">
                  Tutti i file caricati sono protetti con crittografia AES-256, lo stesso standard utilizzato dalle istituzioni bancarie e governative. I tuoi dati sono crittografati prima di essere archiviati sui nostri server.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Misure di Sicurezza Tecniche</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                    <li>Crittografia AES-256 per tutti i file</li>
                    <li>Connessioni SSL/TLS per il trasferimento dati</li>
                    <li>Autenticazione a due fattori disponibile</li>
                    <li>Monitoraggio continuo della sicurezza</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Misure Organizzative</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                    <li>Accesso limitato ai dati del personale</li>
                    <li>Formazione regolare sulla sicurezza</li>
                    <li>Audit di sicurezza periodici</li>
                    <li>Politiche rigorose di gestione dati</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* User Rights */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">I Tuoi Diritti (GDPR)</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-800">Diritto di Accesso</h4>
                    <p className="text-gray-600 text-sm">Puoi richiedere una copia di tutti i dati personali che abbiamo su di te</p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-gray-800">Diritto di Rettifica</h4>
                    <p className="text-gray-600 text-sm">Puoi correggere informazioni inesatte o incomplete</p>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold text-gray-800">Diritto alla Cancellazione</h4>
                    <p className="text-gray-600 text-sm">Puoi richiedere la rimozione dei tuoi dati personali</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-semibold text-gray-800">Diritto alla Portabilità</h4>
                    <p className="text-gray-600 text-sm">Puoi esportare i tuoi dati in un formato leggibile</p>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-semibold text-gray-800">Diritto di Opposizione</h4>
                    <p className="text-gray-600 text-sm">Puoi opporti al trattamento dei tuoi dati per finalità specifiche</p>
                  </div>

                  <div className="border-l-4 border-indigo-500 pl-4">
                    <h4 className="font-semibold text-gray-800">Diritto di Limitazione</h4>
                    <p className="text-gray-600 text-sm">Puoi richiedere di limitare il trattamento dei tuoi dati</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Retention */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Conservazione dei Dati</h2>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-4 mt-1">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">File Caricati</h4>
                    <p className="text-gray-700">Conservati secondo la durata specificata nel tuo piano di abbonamento (7-60 giorni), poi eliminati automaticamente</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mr-4 mt-1">
                    <User className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Dati Account</h4>
                    <p className="text-gray-700">Conservati finché mantieni il tuo account attivo. Eliminati entro 30 giorni dalla cancellazione dell&apos;account</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center mr-4 mt-1">
                    <BarChart3 className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Log di Sistema</h4>
                    <p className="text-gray-700">Conservati per 12 mesi per scopi di sicurezza e analisi delle prestazioni</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contattaci</h2>

              <p className="text-gray-700 mb-6">
                Per qualsiasi domanda riguardo questa Privacy Policy o per esercitare i tuoi diritti, puoi contattarci:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mr-4 mt-1">
                    <Mail className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Data Protection Officer</h4>
                    <a href="mailto:privacy@flyfile.it" className="text-purple-600 hover:underline">privacy@flyfile.it</a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-4 mt-1">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Supporto Generale</h4>
                    <a href="mailto:support@flyfile.it" className="text-blue-600 hover:underline">support@flyfile.it</a>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-gray-700">
                  <strong>Nota:</strong> Ci impegniamo a rispondere alle tue richieste entro 30 giorni come richiesto dal GDPR.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
