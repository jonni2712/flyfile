'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
          <div className="max-w-lg w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 text-center">
            {/* Error Icon */}
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>

            {/* Error Message */}
            <h1 className="text-3xl font-bold text-white mb-4">
              Errore Critico
            </h1>
            <p className="text-blue-200/80 mb-6">
              Si è verificato un errore critico nell'applicazione. Prova a ricaricare la pagina.
            </p>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && error.message && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-left">
                <p className="text-sm text-red-300 font-mono break-all">
                  {error.message}
                </p>
              </div>
            )}

            {/* Actions */}
            <button
              onClick={reset}
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Ricarica Pagina
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
