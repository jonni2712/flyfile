'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

type Step = 'email' | 'password' | 'code';

export default function LoginPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const { sendAuthCode, verifyAuthCode, signInWithGoogle, signInWithPassword, isProcessingRedirect } = useAuth();
  const router = useRouter();

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Auto-focus on step change
  useEffect(() => {
    if (step === 'code') codeInputRef.current?.focus();
    if (step === 'password') passwordInputRef.current?.focus();
  }, [step]);

  // Show loading screen while processing OAuth redirect
  if (isProcessingRedirect) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Accesso in corso...</p>
        </div>
      </div>
    );
  }

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check if user has password
      const res = await fetch('/api/auth/check-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.method === 'password') {
        setStep('password');
      } else {
        // Send code and go to code step
        await sendAuthCode(email);
        setStep('code');
        setResendCooldown(60);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Errore';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithPassword(email, password);
      router.push('/upload');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Password non valida';
      // Firebase error codes
      if (errorMessage.includes('wrong-password') || errorMessage.includes('invalid-credential')) {
        setError('Password non valida');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUseCodeInstead = async () => {
    setError('');
    setLoading(true);
    try {
      await sendAuthCode(email);
      setStep('code');
      setResendCooldown(60);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Errore nell\'invio del codice');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-password-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      // This endpoint requires auth, so for non-authed users we use the code flow
      // Actually, for forgot password, we should just send the code instead
      await sendAuthCode(email);
      setStep('code');
      setResendCooldown(60);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Errore');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyAuthCode(email, code);
      router.push('/upload');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Codice non valido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');

    try {
      await sendAuthCode(email);
      setResendCooldown(60);
      setCode('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nell\'invio del codice';
      setError(errorMessage);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();
      window.location.href = '/upload';
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Accesso con Google fallito';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const goBack = () => {
    setStep('email');
    setCode('');
    setPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">FlyFile</h2>
          </div>

          {/* Step: Email */}
          {step === 'email' && (
            <>
              <h1 className="text-xl font-semibold text-gray-900 text-center mb-2">
                Accedi a FlyFile
              </h1>
              <p className="text-gray-500 text-center mb-6 text-sm">
                Inserisci la tua email per continuare
              </p>

              {error && (
                <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                  {error}
                </div>
              )}

              <form onSubmit={handleContinue} className="space-y-4">
                <div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors"
                    placeholder="mario@esempio.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gray-950 text-white font-medium rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Caricamento...' : 'Continua'}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-white text-gray-400 text-sm">oppure</span>
                  </div>
                </div>
              </div>

              {/* Google Login */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full border border-gray-200 text-gray-700 py-3 px-6 rounded-full font-medium hover:bg-gray-50 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Accedi con Google
              </button>

              {/* Register Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-500 text-sm">
                  Non hai un account?{' '}
                  <Link href="/registrati" className="text-gray-900 font-medium hover:underline">
                    Registrati
                  </Link>
                </p>
              </div>
            </>
          )}

          {/* Step: Password */}
          {step === 'password' && (
            <>
              <button
                onClick={goBack}
                className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Indietro
              </button>

              <h1 className="text-xl font-semibold text-gray-900 text-center mb-2">
                Inserisci la password
              </h1>
              <p className="text-gray-500 text-center mb-6 text-sm">
                Accedi con la tua password per <strong className="text-gray-900">{email}</strong>
              </p>

              {error && (
                <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                  {error}
                </div>
              )}

              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="relative">
                  <input
                    ref={passwordInputRef}
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gray-950 text-white font-medium rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Accesso in corso...' : 'Accedi'}
                </button>
              </form>

              <div className="mt-4 flex items-center justify-between text-sm">
                <button
                  onClick={handleUseCodeInstead}
                  disabled={loading}
                  className="text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Usa codice invece
                </button>
                <button
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Password dimenticata?
                </button>
              </div>
            </>
          )}

          {/* Step: Code */}
          {step === 'code' && (
            <>
              <button
                onClick={goBack}
                className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Indietro
              </button>

              <h1 className="text-xl font-semibold text-gray-900 text-center mb-2">
                Controlla la tua email
              </h1>
              <p className="text-gray-500 text-center mb-6 text-sm">
                Abbiamo inviato un codice a <strong className="text-gray-900">{email}</strong>
              </p>

              {error && (
                <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                  <input
                    ref={codeInputRef}
                    id="code"
                    name="code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 6) setCode(val);
                    }}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 text-center text-2xl tracking-[0.5em] font-mono placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors"
                    placeholder="000000"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full py-3 px-4 bg-gray-950 text-white font-medium rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifica in corso...' : 'Accedi'}
                </button>
              </form>

              {/* Resend */}
              <div className="mt-4 text-center">
                {resendCooldown > 0 ? (
                  <p className="text-gray-400 text-sm">
                    Invia di nuovo tra {resendCooldown}s
                  </p>
                ) : (
                  <button
                    onClick={handleResend}
                    className="text-gray-900 text-sm font-medium hover:underline"
                  >
                    Invia di nuovo
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm transition-colors">
            &larr; Torna alla home
          </Link>
        </div>
      </div>
    </div>
  );
}
