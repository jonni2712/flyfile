import { Metadata } from 'next';
import Link from 'next/link';
import { Lightbulb, AlertTriangle, HelpCircle, Gift, FileText, Mail, BookOpen, ExternalLink, Heart, Check } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

export const metadata: Metadata = {
  title: 'Supporto Beta Tester - FlyFile',
  description: 'Pagina di supporto dedicata ai beta tester di FlyFile. Segnala bug, richiedi features e ottieni aiuto.',
};

export default function SupportPage() {
  return (
    <MainLayout>
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden -mt-16 pt-24 pb-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                            radial-gradient(circle at 40% 80%, rgba(120, 200, 255, 0.3) 0%, transparent 50%)`
        }}
      ></div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Beta Tester Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full mb-6">
            <Lightbulb className="w-6 h-6 text-purple-400 mr-2" />
            <span className="text-white font-semibold text-lg">Beta Testing Program</span>
          </div>
        </div>

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Benvenuto,{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Beta Tester
            </span>
          </h1>
          <p className="text-lg text-blue-100/80 max-w-2xl mx-auto">
            Grazie per aiutarci a migliorare FlyFile! Il tuo feedback è prezioso per noi.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Report Bug */}
          <a
            href="mailto:support@flyfile.it?subject=Bug Report"
            className="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl mb-4 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Segnala un Bug</h3>
            <p className="text-blue-200/70 text-sm mb-3">
              Hai trovato qualcosa che non funziona? Faccelo sapere!
            </p>
            <div className="flex items-center text-cyan-400 text-sm font-medium">
              <span>Segnala</span>
              <ExternalLink className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          {/* Request Feature */}
          <a
            href="mailto:support@flyfile.it?subject=Feature Request"
            className="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl mb-4 group-hover:scale-110 transition-transform">
              <Lightbulb className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Richiedi Feature</h3>
            <p className="text-blue-200/70 text-sm mb-3">
              Hai un&apos;idea per migliorare FlyFile? Condividila!
            </p>
            <div className="flex items-center text-cyan-400 text-sm font-medium">
              <span>Suggerisci</span>
              <ExternalLink className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          {/* Ask Question */}
          <a
            href="mailto:support@flyfile.it?subject=Domanda"
            className="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl mb-4 group-hover:scale-110 transition-transform">
              <HelpCircle className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Fai una Domanda</h3>
            <p className="text-blue-200/70 text-sm mb-3">
              Hai bisogno di aiuto o chiarimenti? Chiedi pure!
            </p>
            <div className="flex items-center text-cyan-400 text-sm font-medium">
              <span>Chiedi Aiuto</span>
              <ExternalLink className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Beta Tester Benefits */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Vantaggi Beta Tester</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="w-6 h-6 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-blue-100/90">
                  <strong className="text-white">3 Mesi Gratis</strong> di piano Pro o Business
                </span>
              </li>
              <li className="flex items-start">
                <Check className="w-6 h-6 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-blue-100/90">
                  <strong className="text-white">Accesso anticipato</strong> alle nuove funzionalità
                </span>
              </li>
              <li className="flex items-start">
                <Check className="w-6 h-6 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-blue-100/90">
                  <strong className="text-white">Supporto prioritario</strong> diretto dal team
                </span>
              </li>
              <li className="flex items-start">
                <Check className="w-6 h-6 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-blue-100/90">
                  <strong className="text-white">Influenza diretta</strong> sullo sviluppo del prodotto
                </span>
              </li>
              <li className="flex items-start">
                <Check className="w-6 h-6 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-blue-100/90">
                  <strong className="text-white">Badge esclusivo</strong> Beta Tester
                </span>
              </li>
            </ul>
          </div>

          {/* Guidelines */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Come Contribuire</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-cyan-400 text-sm font-bold">1</span>
                </span>
                <span className="text-blue-100/90">Usa FlyFile nelle tue attività quotidiane</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-cyan-400 text-sm font-bold">2</span>
                </span>
                <span className="text-blue-100/90">Segnala bug o comportamenti inaspettati</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-cyan-400 text-sm font-bold">3</span>
                </span>
                <span className="text-blue-100/90">Suggerisci miglioramenti e nuove funzionalità</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-cyan-400 text-sm font-bold">4</span>
                </span>
                <span className="text-blue-100/90">Fornisci feedback dettagliato sulla tua esperienza</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-cyan-400 text-sm font-bold">5</span>
                </span>
                <span className="text-blue-100/90">Rispondi ai nostri sondaggi e richieste di feedback</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Support Channels */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Altri Canali di Supporto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <a
              href="mailto:support@flyfile.it"
              className="flex items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold">Email Diretta</h4>
                <p className="text-blue-200/70 text-sm">support@flyfile.it</p>
              </div>
            </a>

            {/* Documentation */}
            <Link
              href="/documentation"
              className="flex items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold">Documentazione</h4>
                <p className="text-blue-200/70 text-sm">Guide e tutorial</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="text-center bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-400/30 rounded-2xl p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Grazie per il Tuo Supporto!</h3>
          <p className="text-blue-100/80 max-w-2xl mx-auto">
            Il tuo contributo è fondamentale per rendere FlyFile il miglior servizio di condivisione file.
            Insieme stiamo costruendo qualcosa di grande!
          </p>
        </div>
      </div>
    </div>
    </MainLayout>
  );
}
