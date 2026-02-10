import { Metadata } from 'next';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { AlertTriangle, Check, Upload, BarChart3 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pagamento Annullato - FlyFile',
  description: 'Il processo di pagamento è stato annullato.',
};

export default function SubscriptionCancelPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 text-center">
            {/* Cancel Icon */}
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>

            {/* Cancel Message */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Pagamento Annullato</h1>

            <p className="text-lg text-gray-600 mb-8">
              Il processo di pagamento è stato annullato. Nessun addebito è stato effettuato.
            </p>

            {/* Encouragement */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Perché Scegliere FlyFile?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Check className="w-5 h-5 text-green-500 mt-1" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">File Illimitati</p>
                    <p className="text-sm text-gray-600">Nessun limite di dimensione</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Check className="w-5 h-5 text-green-500 mt-1" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Sicurezza AES-256</p>
                    <p className="text-sm text-gray-600">Crittografia enterprise-grade</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Check className="w-5 h-5 text-green-500 mt-1" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Team Collaboration</p>
                    <p className="text-sm text-gray-600">Piano Business</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Check className="w-5 h-5 text-green-500 mt-1" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Analytics Avanzati</p>
                    <p className="text-sm text-gray-600">Monitoraggio completo</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/prezzi"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Visualizza Piani
                </Link>
                <Link
                  href="/upload"
                  className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center justify-center"
                >
                  Torna al Caricamento
                </Link>
              </div>

              {/* Free Trial Option */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-4">
                  Vuoi provare FlyFile prima di abbonarti?
                </p>
                <Link href="/" className="text-blue-600 hover:text-blue-500 font-medium inline-flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Inizia con il Piano Gratuito
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
