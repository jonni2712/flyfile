'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Smartphone, Key, Check, Copy, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';

interface TwoFactorStatus {
  isEnabled: boolean;
  backupCodesRemaining?: number;
  enabledAt?: string;
}

interface SetupData {
  secret: string;
  totpUri: string;
  qrCodeUrl: string;
}

export default function SecurityPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [enabling, setEnabling] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'status' | 'setup' | 'verify' | 'backup' | 'disable'>('status');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchStatus();
    }
  }, [user, authLoading, router]);

  const fetchStatus = async () => {
    if (!user) return;

    try {
      const res = await fetch(`/api/2fa/status?userId=${user.uid}`);
      const data = await res.json();

      if (res.ok) {
        setStatus(data);
      }
    } catch (err) {
      console.error('Error fetching 2FA status:', err);
    } finally {
      setLoading(false);
    }
  };

  const startSetup = async () => {
    if (!user) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/2fa/setup?userId=${user.uid}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Errore nella generazione setup');
      }

      setSetupData(data);
      setStep('setup');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore');
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if (!user || !setupData) return;

    setError(null);
    setEnabling(true);

    try {
      const res = await fetch('/api/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          secret: setupData.secret,
          token: verificationCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Codice non valido');
      }

      setBackupCodes(data.backupCodes);
      setStep('backup');
      setStatus({ isEnabled: true, backupCodesRemaining: data.backupCodes.length });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore');
    } finally {
      setEnabling(false);
    }
  };

  const disable2FA = async () => {
    if (!user) return;

    setError(null);
    setDisabling(true);

    try {
      const res = await fetch('/api/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Errore nella disabilitazione');
      }

      setStatus({ isEnabled: false });
      setStep('status');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore');
    } finally {
      setDisabling(false);
    }
  };

  const copyToClipboard = (text: string, type: 'secret' | 'codes') => {
    navigator.clipboard.writeText(text);
    if (type === 'secret') {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/profile" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna al Profilo
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Sicurezza Account</h1>
          <p className="text-gray-600 mt-1">Gestisci l&apos;autenticazione a due fattori (2FA)</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Status View */}
        {step === 'status' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-3 rounded-full ${status?.isEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Shield className={`w-8 h-8 ${status?.isEnabled ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Autenticazione a Due Fattori (2FA)
                </h2>
                <p className={`text-sm ${status?.isEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                  {status?.isEnabled ? 'Abilitata' : 'Non abilitata'}
                </p>
              </div>
            </div>

            {status?.isEnabled ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">2FA è attiva sul tuo account</span>
                  </div>
                  {status.backupCodesRemaining !== undefined && (
                    <p className="text-sm text-green-700 mt-2">
                      Codici di backup rimanenti: <strong>{status.backupCodesRemaining}</strong>
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setStep('disable')}
                  className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Disabilita 2FA
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Proteggi il tuo account aggiungendo un secondo livello di sicurezza.
                  Quando accedi, dovrai inserire un codice generato dalla tua app di autenticazione.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Cosa ti serve:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Un&apos;app di autenticazione (Google Authenticator, Authy, etc.)</li>
                    <li>• Il tuo smartphone</li>
                  </ul>
                </div>

                <button
                  onClick={startSetup}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Configura 2FA
                </button>
              </div>
            )}
          </div>
        )}

        {/* Setup View */}
        {step === 'setup' && setupData && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-full bg-blue-100">
                <Smartphone className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Configura la tua App</h2>
                <p className="text-sm text-gray-500">Passo 1 di 2</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Scansiona questo QR code con la tua app di autenticazione:
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={setupData.qrCodeUrl}
                  alt="QR Code 2FA"
                  className="mx-auto w-48 h-48 border rounded-lg"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">
                  Oppure inserisci manualmente questo codice:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white border rounded px-3 py-2 font-mono text-sm break-all">
                    {setupData.secret}
                  </code>
                  <button
                    onClick={() => copyToClipboard(setupData.secret, 'secret')}
                    className="p-2 text-gray-500 hover:text-gray-700"
                    title="Copia"
                  >
                    {copiedSecret ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setStep('verify')}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Ho configurato l&apos;app
              </button>

              <button
                onClick={() => {
                  setStep('status');
                  setSetupData(null);
                }}
                className="w-full px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annulla
              </button>
            </div>
          </div>
        )}

        {/* Verify View */}
        {step === 'verify' && setupData && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-full bg-blue-100">
                <Key className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Verifica il Codice</h2>
                <p className="text-sm text-gray-500">Passo 2 di 2</p>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-gray-600">
                Inserisci il codice a 6 cifre mostrato nella tua app di autenticazione:
              </p>

              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full text-center text-3xl tracking-widest font-mono py-4 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={6}
              />

              <button
                onClick={verifyAndEnable}
                disabled={verificationCode.length !== 6 || enabling}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {enabling ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifica in corso...
                  </>
                ) : (
                  'Verifica e Attiva 2FA'
                )}
              </button>

              <button
                onClick={() => setStep('setup')}
                className="w-full px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Torna indietro
              </button>
            </div>
          </div>
        )}

        {/* Backup Codes View */}
        {step === 'backup' && backupCodes && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-full bg-green-100">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">2FA Attivata!</h2>
                <p className="text-sm text-green-600">Salva i tuoi codici di backup</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Importante!</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Salva questi codici in un luogo sicuro. Potrai usarli per accedere al tuo account se perdi l&apos;accesso alla tua app di autenticazione.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Codici di Backup</h3>
                  <button
                    onClick={() => copyToClipboard(backupCodes.join('\n'), 'codes')}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    {copiedCodes ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedCodes ? 'Copiato!' : 'Copia tutti'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <code key={index} className="bg-white border rounded px-3 py-2 font-mono text-sm text-center">
                      {code}
                    </code>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setStep('status');
                  setBackupCodes(null);
                  setSetupData(null);
                  setVerificationCode('');
                }}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Ho salvato i codici
              </button>
            </div>
          </div>
        )}

        {/* Disable Confirmation */}
        {step === 'disable' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-full bg-red-100">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Disabilita 2FA</h2>
                <p className="text-sm text-red-600">Questa azione ridurrà la sicurezza del tuo account</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">
                  Sei sicuro di voler disabilitare l&apos;autenticazione a due fattori? Il tuo account sarà meno protetto.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('status')}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  onClick={disable2FA}
                  disabled={disabling}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {disabling ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Disabilitazione...
                    </>
                  ) : (
                    'Disabilita 2FA'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
