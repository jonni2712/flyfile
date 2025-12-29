'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Mail, RefreshCw, Check, LogOut } from 'lucide-react';

export default function VerifyEmailPage() {
  const { user, sendVerificationEmail, signOut } = useAuth();
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleResendVerification = async () => {
    setSending(true);
    setError('');
    setSuccess(false);

    try {
      await sendVerificationEmail();
      setSuccess(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Impossibile inviare l\'email';
      setError(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-6">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Verifica la tua email</h2>
          <p className="mt-2 text-sm text-gray-600">
            Abbiamo inviato un link di verifica al tuo indirizzo email
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Glass morphism card */}
        <div className="bg-white/70 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl py-8 px-6">
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
              <Check className="w-5 h-5 mr-2" />
              Un nuovo link di verifica è stato inviato al tuo indirizzo email.
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="text-center">
            {/* Email icon */}
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 mb-6">
              <Mail className="h-10 w-10 text-blue-600" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-4">Controlla la tua email</h3>

            <p className="text-sm text-gray-600 mb-6">
              Ti abbiamo inviato un&apos;email con un link di verifica. Clicca sul link per attivare il tuo account e accedere a tutte le funzionalità di FlyFile.
            </p>

            {/* Resend verification button */}
            <button
              onClick={handleResendVerification}
              disabled={sending}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Invio in corso...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5 mr-2" />
                  Invia nuovamente email di verifica
                </>
              )}
            </button>

            {/* Alternative actions */}
            <div className="flex flex-col space-y-3 mt-6">
              <Link href="/profile" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                Modifica indirizzo email
              </Link>

              <button
                onClick={handleSignOut}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium inline-flex items-center justify-center"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Esci
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-white/50 backdrop-blur-sm border border-white/20 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            Non trovi l&apos;email?
          </h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Controlla la cartella spam/posta indesiderata</li>
            <li>• Verifica di aver inserito l&apos;email corretta</li>
            <li>• Attendi qualche minuto, l&apos;email potrebbe essere in ritardo</li>
            <li>• Clicca su &quot;Invia nuovamente&quot; se necessario</li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Hai problemi?{' '}
            <Link href="/contact" className="text-blue-600 hover:text-blue-500 font-medium">
              Contatta il supporto
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
