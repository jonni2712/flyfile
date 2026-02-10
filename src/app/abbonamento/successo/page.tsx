import { Metadata } from 'next';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { Check, Upload, BarChart3, Mail, Shield, HelpCircle, Cog } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pagamento Completato - FlyFile',
  description: 'Il tuo abbonamento FlyFile è stato attivato con successo.',
};

export default function SubscriptionSuccessPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-white py-12">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"></div>

          {/* Animated glass orbs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-gradient-to-br from-pink-400/20 to-blue-600/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Card */}
          <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            {/* Success Animation Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-12 text-center relative overflow-hidden">
              {/* Confetti Animation */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <div className="text-white text-9xl animate-ping">🎉</div>
              </div>

              {/* Success Icon with Animation */}
              <div className="relative mb-6 inline-block">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
                  <Check className="w-12 h-12 text-blue-600" strokeWidth={3} />
                </div>
              </div>

              <h1 className="text-4xl font-bold text-white mb-3">
                Pagamento Completato con Successo!
              </h1>
              <p className="text-xl text-blue-50">
                Benvenuto nella famiglia FlyFile
              </p>
            </div>

            <div className="p-8 md:p-12">
              {/* Subscription Details */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Check className="w-6 h-6 mr-2 text-blue-600" />
                  Dettagli del tuo Abbonamento
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Piano */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                    <div className="text-sm font-medium text-gray-600 mb-2">Piano Selezionato</div>
                    <div className="text-2xl font-bold text-gray-900">Pro</div>
                    <span className="inline-flex items-center px-3 py-1 mt-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      Pro
                    </span>
                  </div>

                  {/* Ciclo di Fatturazione */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    <div className="text-sm font-medium text-gray-600 mb-2">Ciclo di Fatturazione</div>
                    <div className="text-2xl font-bold text-gray-900">Mensile</div>
                    <div className="text-sm text-gray-600 mt-2">Rinnovo ogni mese</div>
                  </div>

                  {/* Status */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                    <div className="text-sm font-medium text-gray-600 mb-2">Stato Abbonamento</div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Attivo
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-2">Accesso immediato</div>
                  </div>
                </div>
              </div>

              {/* What's Included */}
              <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Cog className="w-6 h-6 mr-2 text-purple-600" />
                  Cosa Include il Tuo Piano
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'Trasferimenti file illimitati',
                    'Fino a 30 file per trasferimento',
                    '500GB di quota mensile',
                    'Conservazione per 30 giorni',
                    'Protezione con password',
                    'Scadenza personalizzata',
                    'Analytics avanzate',
                    'Branding personalizzato',
                    'Accesso API',
                    'Supporto webhook',
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              <div className="border-t border-gray-200 pt-8 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Upload className="w-6 h-6 mr-2 text-blue-600" />
                  Inizia Subito
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Link
                    href="/"
                    className="group bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Carica i Tuoi File
                  </Link>
                  <Link
                    href="/upload"
                    className="group bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-blue-500 px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow hover:shadow-lg flex items-center justify-center"
                  >
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Vai al Caricamento
                  </Link>
                </div>
              </div>

              {/* Email Confirmation Notice */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start">
                  <Mail className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Conferma via Email</h4>
                    <p className="text-sm text-blue-800">
                      Riceverai a breve un&apos;email di conferma con i dettagli del tuo abbonamento e la ricevuta di pagamento.
                    </p>
                  </div>
                </div>
              </div>

              {/* Support */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <p className="text-gray-600 mb-4">Hai bisogno di aiuto o hai domande?</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/contatti" className="text-blue-600 hover:text-blue-500 font-medium inline-flex items-center">
                    <Mail className="w-5 h-5 mr-1" />
                    Contattaci
                  </Link>
                  <span className="text-gray-400">•</span>
                  <Link href="/supporto" className="text-blue-600 hover:text-blue-500 font-medium inline-flex items-center">
                    <HelpCircle className="w-5 h-5 mr-1" />
                    Centro Assistenza
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-blue-600 mr-1" />
                Pagamento Sicuro
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-purple-600 mr-1" />
                Supporto 24/7
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-pink-600 mr-1" />
                Garanzia Soddisfatti
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
