import { Metadata } from 'next';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { Shield, Check, Lock, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy - FlyFile',
  description: 'Informativa sulla privacy e trattamento dei dati di FlyFile. Scopri come proteggiamo i tuoi dati personali.',
};

export default function PrivacyPage() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative min-h-[60vh] flex items-center -mt-16 pt-16 overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        {/* Decorative circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-20">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-2 mb-8">
            <Shield className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Privacy Policy</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            La tua privacy è la nostra
            <span className="block italic font-light">priorità assoluta</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
            Ultimo aggiornamento: Gennaio 2026
          </p>
        </div>
      </div>

      {/* Introduzione */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">Introduzione</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-4 mb-6">
            Il nostro impegno per i tuoi dati
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            FlyFile (&quot;noi&quot;, &quot;nostro&quot; o &quot;la società&quot;) è impegnata a proteggere la privacy e la sicurezza dei dati personali degli utenti (&quot;tu&quot; o &quot;utente&quot;). Questa Privacy Policy descrive come raccogliamo, utilizziamo, conserviamo e proteggiamo le tue informazioni quando utilizzi il nostro servizio di condivisione file sicura.
          </p>
        </div>
      </div>

      {/* Informazioni che Raccogliamo */}
      <div className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Dati raccolti</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-4 mb-10">
            Informazioni che Raccogliamo
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-5">Informazioni di Account</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Nome e indirizzo email durante la registrazione</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Password criptografata per la sicurezza dell&apos;account</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Preferenze di configurazione del profilo</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Informazioni di fatturazione per gli abbonamenti a pagamento</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-5">Dati di Utilizzo</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Metadati dei file caricati (nome, dimensione, data di caricamento)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Log di accesso e attività del servizio</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Indirizzo IP e informazioni del dispositivo</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Analytics sull&apos;utilizzo delle funzionalità</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Analisi e Statistiche */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Analytics</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-4 mb-10">
            Analisi e Statistiche
          </h2>

          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Google Analytics</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Utilizziamo Google Analytics per comprendere come gli utenti interagiscono con il nostro sito. Questo ci aiuta a migliorare l&apos;esperienza utente e le prestazioni del servizio.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600"><strong className="text-gray-900">Consenso richiesto:</strong> Google Analytics viene attivato solo dopo il tuo esplicito consenso</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600"><strong className="text-gray-900">IP anonimizzato:</strong> Il tuo indirizzo IP viene anonimizzato prima dell&apos;elaborazione</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600"><strong className="text-gray-900">Revoca facile:</strong> Puoi revocare il consenso in qualsiasi momento dalle <Link href="/cookies" className="text-purple-600 hover:underline">impostazioni cookie</Link></span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Per maggiori informazioni su come Google utilizza i dati, consulta la <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Privacy Policy di Google</a>.
          </p>
        </div>
      </div>

      {/* Come Utilizziamo i Tuoi Dati */}
      <div className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Utilizzo dati</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-4 mb-10">
            Come Utilizziamo i Tuoi Dati
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <div className="w-2 h-2 rounded-full bg-blue-500 mb-4" />
              <h4 className="text-lg font-bold text-gray-900 mb-2">Fornitura del Servizio</h4>
              <p className="text-gray-600">Gestione dell&apos;account e delle funzionalità di condivisione file</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mb-4" />
              <h4 className="text-lg font-bold text-gray-900 mb-2">Sicurezza</h4>
              <p className="text-gray-600">Prevenzione di frodi e protezione dell&apos;account</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <div className="w-2 h-2 rounded-full bg-purple-500 mb-4" />
              <h4 className="text-lg font-bold text-gray-900 mb-2">Miglioramento</h4>
              <p className="text-gray-600">Analisi per migliorare le prestazioni del servizio</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <div className="w-2 h-2 rounded-full bg-orange-500 mb-4" />
              <h4 className="text-lg font-bold text-gray-900 mb-2">Comunicazione</h4>
              <p className="text-gray-600">Invio di aggiornamenti importanti sul servizio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sicurezza dei Dati */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Protezione</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-4 mb-10">
            Sicurezza dei Dati
          </h2>

          <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-8 sm:p-10 text-white mb-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Crittografia End-to-End</h3>
              </div>
              <p className="text-white/85 text-lg leading-relaxed">
                Tutti i file caricati sono protetti con crittografia AES-256, lo stesso standard utilizzato dalle istituzioni bancarie e governative. I tuoi dati sono crittografati prima di essere archiviati sui nostri server.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <h4 className="text-lg font-bold text-gray-900 mb-5">Misure di Sicurezza Tecniche</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Crittografia AES-256 per tutti i file</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Connessioni SSL/TLS per il trasferimento dati</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Autenticazione a due fattori disponibile</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Monitoraggio continuo della sicurezza</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <h4 className="text-lg font-bold text-gray-900 mb-5">Misure Organizzative</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Accesso limitato ai dati del personale</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Formazione regolare sulla sicurezza</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Audit di sicurezza periodici</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5 flex-shrink-0" />
                  <span className="text-gray-600">Politiche rigorose di gestione dati</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* I Tuoi Diritti (GDPR) */}
      <div className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">I tuoi diritti</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-4 mb-10">
            I Tuoi Diritti (GDPR)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-l-4 border-blue-500 pl-6 py-1">
              <h4 className="text-lg font-bold text-gray-900 mb-1">Diritto di Accesso</h4>
              <p className="text-gray-600">Puoi richiedere una copia di tutti i dati personali che abbiamo su di te</p>
            </div>

            <div className="border-l-4 border-emerald-500 pl-6 py-1">
              <h4 className="text-lg font-bold text-gray-900 mb-1">Diritto di Rettifica</h4>
              <p className="text-gray-600">Puoi correggere informazioni inesatte o incomplete</p>
            </div>

            <div className="border-l-4 border-purple-500 pl-6 py-1">
              <h4 className="text-lg font-bold text-gray-900 mb-1">Diritto alla Cancellazione</h4>
              <p className="text-gray-600">Puoi richiedere la rimozione dei tuoi dati personali</p>
            </div>

            <div className="border-l-4 border-orange-500 pl-6 py-1">
              <h4 className="text-lg font-bold text-gray-900 mb-1">Diritto alla Portabilità</h4>
              <p className="text-gray-600">Puoi esportare i tuoi dati in un formato leggibile</p>
            </div>

            <div className="border-l-4 border-red-500 pl-6 py-1">
              <h4 className="text-lg font-bold text-gray-900 mb-1">Diritto di Opposizione</h4>
              <p className="text-gray-600">Puoi opporti al trattamento dei tuoi dati per finalità specifiche</p>
            </div>

            <div className="border-l-4 border-indigo-500 pl-6 py-1">
              <h4 className="text-lg font-bold text-gray-900 mb-1">Diritto di Limitazione</h4>
              <p className="text-gray-600">Puoi richiedere di limitare il trattamento dei tuoi dati</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conservazione dei Dati */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Conservazione</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-4 mb-10">
            Conservazione dei Dati
          </h2>

          <div className="space-y-0 divide-y divide-gray-100">
            <div className="flex items-start gap-5 py-6 first:pt-0">
              <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">File Caricati</h4>
                <p className="text-gray-600">Conservati secondo la durata specificata nel tuo piano di abbonamento (7 giorni - 1 anno), poi eliminati automaticamente</p>
              </div>
            </div>

            <div className="flex items-start gap-5 py-6">
              <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">Dati Account</h4>
                <p className="text-gray-600">Conservati finché mantieni il tuo account attivo. Eliminati entro 30 giorni dalla cancellazione dell&apos;account</p>
              </div>
            </div>

            <div className="flex items-start gap-5 py-6 last:pb-0">
              <div className="w-3 h-3 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">Log di Sistema</h4>
                <p className="text-gray-600">Conservati per 12 mesi per scopi di sicurezza e analisi delle prestazioni</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contattaci */}
      <div className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Contatti</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-4 mb-6">
            Contattaci
          </h2>

          <p className="text-lg text-gray-600 leading-relaxed mb-10">
            Per qualsiasi domanda riguardo questa Privacy Policy o per esercitare i tuoi diritti, puoi contattarci:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Data Protection Officer</h4>
                  <a href="mailto:privacy@flyfile.it" className="text-purple-600 hover:underline">privacy@flyfile.it</a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Supporto Generale</h4>
                  <a href="mailto:support@flyfile.it" className="text-blue-600 hover:underline">support@flyfile.it</a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
            <p className="text-sm text-gray-700">
              <strong>Nota:</strong> Ci impegniamo a rispondere alle tue richieste entro 30 giorni come richiesto dal GDPR.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
