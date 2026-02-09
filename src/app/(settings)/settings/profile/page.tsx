'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Camera,
  Trash2,
  Shield,
  Key,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  X,
  Mail,
} from 'lucide-react';

interface TwoFactorStatus {
  isEnabled: boolean;
  backupCodesRemaining?: number;
}

interface SetupData {
  secret: string;
  totpUri: string;
  qrCodeUrl: string;
}

export default function ProfileSecurityPage() {
  const { user, userProfile, updateUserProfile, deleteAccount, refreshUserProfile } = useAuth();

  // Profile fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  // Avatar
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // 2FA
  const [twoFAStatus, setTwoFAStatus] = useState<TwoFactorStatus | null>(null);
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [twoFAStep, setTwoFAStep] = useState<'idle' | 'setup' | 'verify' | 'backup' | 'disable'>('idle');
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFAError, setTwoFAError] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Password
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [sendingPasswordEmail, setSendingPasswordEmail] = useState(false);
  const [passwordEmailSent, setPasswordEmailSent] = useState(false);

  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (userProfile) {
      if (userProfile.firstName) {
        setFirstName(userProfile.firstName);
        setLastName(userProfile.lastName || '');
      } else if (userProfile.displayName) {
        const parts = userProfile.displayName.split(' ');
        setFirstName(parts[0] || '');
        setLastName(parts.slice(1).join(' ') || '');
      }
    }
  }, [userProfile]);

  useEffect(() => {
    if (user) {
      fetch2FAStatus();
      checkPassword();
    }
  }, [user]);

  const fetch2FAStatus = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/2fa/status?userId=${user.uid}`);
      if (res.ok) {
        const data = await res.json();
        setTwoFAStatus(data);
      }
    } catch {
      // ignore
    }
  };

  const checkPassword = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch('/api/auth/check-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      if (res.ok) {
        const data = await res.json();
        setHasPassword(data.method === 'password');
      }
    } catch {
      // ignore
    }
  };

  // Profile save
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileMessage('');
    try {
      await updateUserProfile({
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`.trim(),
      });
      setProfileMessage('Salvato.');
      setTimeout(() => setProfileMessage(''), 3000);
    } catch {
      setProfileMessage('Errore durante il salvataggio');
    } finally {
      setSavingProfile(false);
    }
  };

  // Avatar upload
  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    setUploadingAvatar(true);
    try {
      const token = await user.getIdToken();
      // Get presigned URL
      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: user.uid, fileName: file.name, contentType: file.type }),
      });
      if (!res.ok) throw new Error('Errore upload');
      const { uploadUrl, avatarPath } = await res.json();

      // Upload to R2
      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });

      // Confirm upload
      const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL || ''}/${avatarPath}`;
      await fetch('/api/profile/avatar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: user.uid, photoURL: publicUrl }),
      });

      await refreshUserProfile();
    } catch {
      // ignore
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Avatar delete
  const handleAvatarDelete = async () => {
    if (!user) return;
    setDeletingAvatar(true);
    try {
      const token = await user.getIdToken();
      await fetch(`/api/profile/avatar?userId=${user.uid}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      await refreshUserProfile();
    } catch {
      // ignore
    } finally {
      setDeletingAvatar(false);
    }
  };

  // 2FA setup
  const startSetup = async () => {
    if (!user) return;
    setTwoFAError('');
    setTwoFALoading(true);
    try {
      const res = await fetch(`/api/2fa/setup?userId=${user.uid}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSetupData(data);
      setTwoFAStep('setup');
    } catch (err) {
      setTwoFAError(err instanceof Error ? err.message : 'Errore');
    } finally {
      setTwoFALoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if (!user || !setupData) return;
    setTwoFAError('');
    setTwoFALoading(true);
    try {
      const res = await fetch('/api/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, secret: setupData.secret, token: verificationCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Codice non valido');
      setBackupCodes(data.backupCodes);
      setTwoFAStep('backup');
      setTwoFAStatus({ isEnabled: true, backupCodesRemaining: data.backupCodes.length });
    } catch (err) {
      setTwoFAError(err instanceof Error ? err.message : 'Errore');
    } finally {
      setTwoFALoading(false);
    }
  };

  const disable2FA = async () => {
    if (!user) return;
    setTwoFAError('');
    setTwoFALoading(true);
    try {
      const res = await fetch('/api/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTwoFAStatus({ isEnabled: false });
      setTwoFAStep('idle');
    } catch (err) {
      setTwoFAError(err instanceof Error ? err.message : 'Errore');
    } finally {
      setTwoFALoading(false);
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

  // Password setup
  const handleSendPasswordEmail = async () => {
    if (!user) return;
    setSendingPasswordEmail(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/auth/send-password-setup', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPasswordEmailSent(true);
        setTimeout(() => setPasswordEmailSent(false), 5000);
      }
    } catch {
      // ignore
    } finally {
      setSendingPasswordEmail(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'ELIMINA') return;
    setDeleting(true);
    try {
      await deleteAccount();
      window.location.href = '/';
    } catch (err) {
      alert((err as Error).message || 'Errore durante l\'eliminazione');
    } finally {
      setDeleting(false);
    }
  };

  if (!user || !userProfile) return null;

  return (
    <div className="space-y-10">
      {/* Profile Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Profilo</h2>

        {/* Avatar */}
        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            {userProfile.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {(firstName || userProfile.displayName || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAvatarUpload(file);
                e.target.value = '';
              }}
              className="hidden"
            />
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              Carica avatar
            </button>
            {userProfile.photoURL && (
              <button
                onClick={handleAvatarDelete}
                disabled={deletingAvatar}
                className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deletingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Cancella avatar
              </button>
            )}
          </div>
        </div>

        {/* Name fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-gray-900 transition-colors"
              placeholder="Mario"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cognome</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-gray-900 transition-colors"
              placeholder="Rossi"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo email</label>
            <input
              type="email"
              value={userProfile.email}
              disabled
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-500 bg-gray-50 cursor-not-allowed"
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
              Salva modifiche
            </button>
            {profileMessage && <p className="text-sm text-gray-600">{profileMessage}</p>}
          </div>
        </div>
      </section>

      <hr className="border-gray-200" />

      {/* Password & Security Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Password e sicurezza</h2>

        {/* 2FA */}
        <div className="border border-gray-200 rounded-xl p-5 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Autenticazione a due fattori</p>
                <p className="text-xs text-gray-500">Aggiungi un ulteriore livello di sicurezza al tuo account</p>
              </div>
            </div>
            {twoFAStep === 'idle' && (
              <button
                onClick={twoFAStatus?.isEnabled ? () => setTwoFAStep('disable') : startSetup}
                disabled={twoFALoading}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  twoFAStatus?.isEnabled
                    ? 'text-red-600 border border-red-200 hover:bg-red-50'
                    : 'text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {twoFALoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : twoFAStatus?.isEnabled ? (
                  'Disattiva'
                ) : (
                  'Attiva'
                )}
              </button>
            )}
          </div>

          {twoFAError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {twoFAError}
            </div>
          )}

          {/* 2FA Setup - QR Code */}
          {twoFAStep === 'setup' && setupData && (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-gray-600">Scansiona questo QR code con la tua app di autenticazione:</p>
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={setupData.qrCodeUrl} alt="QR Code 2FA" className="w-48 h-48 border rounded-lg" />
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Oppure inserisci manualmente:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono break-all">{setupData.secret}</code>
                  <button onClick={() => copyToClipboard(setupData.secret, 'secret')} className="p-1 text-gray-400 hover:text-gray-600">
                    {copiedSecret ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setTwoFAStep('verify')} className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800">
                  Ho configurato l&apos;app
                </button>
                <button onClick={() => { setTwoFAStep('idle'); setSetupData(null); }} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                  Annulla
                </button>
              </div>
            </div>
          )}

          {/* 2FA Verify */}
          {twoFAStep === 'verify' && (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-gray-600">Inserisci il codice a 6 cifre dalla tua app:</p>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full text-center text-2xl tracking-widest font-mono py-3 border-2 rounded-xl focus:ring-0 focus:border-gray-900"
                maxLength={6}
              />
              <div className="flex gap-3">
                <button
                  onClick={verifyAndEnable}
                  disabled={verificationCode.length !== 6 || twoFALoading}
                  className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
                >
                  {twoFALoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Verifica e Attiva
                </button>
                <button onClick={() => setTwoFAStep('setup')} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                  Indietro
                </button>
              </div>
            </div>
          )}

          {/* 2FA Backup Codes */}
          {twoFAStep === 'backup' && backupCodes && (
            <div className="mt-4 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-800">Salva questi codici di backup in un luogo sicuro.</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-900">Codici di Backup</span>
                  <button
                    onClick={() => copyToClipboard(backupCodes.join('\n'), 'codes')}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    {copiedCodes ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedCodes ? 'Copiato!' : 'Copia tutti'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, i) => (
                    <code key={i} className="bg-white border rounded px-3 py-1.5 font-mono text-xs text-center">{code}</code>
                  ))}
                </div>
              </div>
              <button
                onClick={() => { setTwoFAStep('idle'); setBackupCodes(null); setSetupData(null); setVerificationCode(''); }}
                className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800"
              >
                Ho salvato i codici
              </button>
            </div>
          )}

          {/* 2FA Disable confirm */}
          {twoFAStep === 'disable' && (
            <div className="mt-4 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">Sei sicuro di voler disabilitare l&apos;autenticazione a due fattori?</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={disable2FA}
                  disabled={twoFALoading}
                  className="px-5 py-2 bg-red-600 text-white text-sm font-medium rounded-full hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {twoFALoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Disabilita 2FA
                </button>
                <button onClick={() => setTwoFAStep('idle')} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                  Annulla
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Password setup */}
        <div className="border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <Key className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {hasPassword ? 'Modifica password' : 'Configura password'}
              </p>
              <p className="text-xs text-gray-500">
                {hasPassword
                  ? 'Clicca per ricevere un\'email per modificare la tua password.'
                  : 'Clicca sul pulsante qui sotto e ti invieremo un\'email per configurare la tua password.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleSendPasswordEmail}
            disabled={sendingPasswordEmail}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {sendingPasswordEmail ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            Invia e-mail
          </button>
          {passwordEmailSent && (
            <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
              <Check className="w-4 h-4" />
              Email inviata! Controlla la tua casella di posta.
            </p>
          )}
        </div>
      </section>

      <hr className="border-gray-200" />

      {/* Delete Account Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>
        <p className="text-sm text-gray-600 mb-4">
          Una volta eliminato il tuo account, tutte le sue risorse e dati saranno cancellati permanentemente.
          Prima di eliminare il tuo account, scarica tutti i dati che desideri conservare.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-full hover:bg-red-700 transition-colors"
        >
          Elimina account
        </button>
      </section>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Elimina Account
              </h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile.
              Scrivi <strong>ELIMINA</strong> per confermare.
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl mb-4 focus:outline-none focus:border-gray-900"
              placeholder="Scrivi ELIMINA"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                Annulla
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirm !== 'ELIMINA'}
                className="px-5 py-2 bg-red-600 text-white text-sm font-medium rounded-full hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Elimina Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
