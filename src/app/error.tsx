'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
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

      <div className="relative z-10 max-w-lg w-full">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 text-center">
          {/* Error Icon */}
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-white mb-4">
            Qualcosa è andato storto
          </h1>
          <p className="text-blue-200/80 mb-6">
            Si è verificato un errore imprevisto. Il nostro team è stato notificato e stiamo lavorando per risolvere il problema.
          </p>

          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-left">
              <p className="text-sm text-red-300 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-400/60 mt-2">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg hover:shadow-xl"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Riprova
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all border border-white/20"
            >
              <Home className="w-5 h-5 mr-2" />
              Torna alla Home
            </Link>
          </div>

          {/* Contact Support */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-sm text-blue-200/60 mb-3">
              Problema persistente?
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center text-cyan-400 hover:text-cyan-300 text-sm font-medium"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contatta il supporto
            </Link>
          </div>
        </div>

        {/* FlyFile Branding */}
        <div className="mt-6 text-center">
          <p className="text-blue-200/50 text-sm">
            FlyFile - Condivisione file sicura
          </p>
        </div>
      </div>
    </div>
  );
}
