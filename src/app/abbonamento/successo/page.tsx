import { Metadata } from 'next';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { Check, Upload, Mail, Shield, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pagamento Completato - FlyFile',
  description: 'Il tuo abbonamento FlyFile è stato attivato con successo.',
};

export default function SubscriptionSuccessPage() {
  return (
    <MainLayout>
      {/* Hero */}
      <div className="relative -mt-16 pt-16 overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-24">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
            <Check className="w-10 h-10 text-blue-600" strokeWidth={3} />
          </div>

          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Abbonamento Attivato</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
            Pagamento completato!
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Benvenuto nella famiglia FlyFile. Il tuo piano è ora attivo e puoi iniziare subito a utilizzare tutte le funzionalità.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
            <div className="rounded-2xl border border-gray-200 p-6 text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-sm text-gray-500 mb-1">Stato</div>
              <div className="text-lg font-bold text-gray-900">Attivo</div>
            </div>
            <div className="rounded-2xl border border-gray-200 p-6 text-center">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-sm text-gray-500 mb-1">Pagamento</div>
              <div className="text-lg font-bold text-gray-900">Confermato</div>
            </div>
            <div className="rounded-2xl border border-gray-200 p-6 text-center">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="w-5 h-5 text-pink-600" />
              </div>
              <div className="text-sm text-gray-500 mb-1">Ricevuta</div>
              <div className="text-lg font-bold text-gray-900">Inviata via email</div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
              Inizia subito
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 mb-4">
              Cosa puoi fare adesso
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Il tuo piano è attivo immediatamente. Ecco come iniziare a sfruttare FlyFile al massimo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
            <Link
              href="/"
              className="group rounded-2xl border-2 border-gray-200 hover:border-blue-500 p-6 transition-all"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors">
                <Upload className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Carica i tuoi file</h3>
              <p className="text-sm text-gray-500 mb-3">Inizia a condividere file con crittografia AES-256 e link personalizzati.</p>
              <span className="inline-flex items-center text-sm font-medium text-blue-600">
                Vai al caricamento <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            </Link>
            <Link
              href="/settings/billing"
              className="group rounded-2xl border-2 border-gray-200 hover:border-purple-500 p-6 transition-all"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-500 transition-colors">
                <Shield className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Gestisci abbonamento</h3>
              <p className="text-sm text-gray-500 mb-3">Visualizza fatture, modifica piano o aggiorna i dati di pagamento.</p>
              <span className="inline-flex items-center text-sm font-medium text-purple-600">
                Vai alle impostazioni <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            </Link>
          </div>

          {/* Email Notice */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-12">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Conferma via email</h4>
                <p className="text-sm text-gray-600">
                  Riceverai a breve un&apos;email di conferma con i dettagli del tuo abbonamento e la ricevuta di pagamento.
                </p>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="text-center">
            <p className="text-gray-500 mb-4">Hai bisogno di aiuto?</p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/contatti" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                <Mail className="w-4 h-4" />
                Contattaci
              </Link>
              <Link href="/supporto" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                <HelpCircle className="w-4 h-4" />
                Centro assistenza
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
