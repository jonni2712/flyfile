'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTransfer } from '@/context/TransferContext';
import {
  Upload, X, File, Check, AlertCircle, Lock, Mail, Link2, Clock, Shield, Plus,
  Image, Video, FileText, Crown, Copy, CheckCircle, ExternalLink, Loader2, HardDrive, FolderOpen
} from 'lucide-react';
import { getPlanLimits } from '@/types';
import StorageQuota from '@/components/StorageQuota';

interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

// Expiry options with plan requirements
const EXPIRY_OPTIONS = [
  { value: 1, label: '1 Giorno', minPlan: 'free' },
  { value: 3, label: '3 Giorni', minPlan: 'free' },
  { value: 5, label: '5 Giorni', minPlan: 'free' },
  { value: 7, label: '1 Settimana', minPlan: 'starter' },
  { value: 14, label: '2 Settimane', minPlan: 'pro' },
  { value: 30, label: '1 Mese', minPlan: 'pro' },
  { value: 90, label: '3 Mesi', minPlan: 'business' },
  { value: 365, label: '1 Anno', minPlan: 'business' },
];

const PLAN_HIERARCHY = ['free', 'starter', 'pro', 'business'];

export default function UploadPage() {
  const { user, userProfile, loading } = useAuth();
  const { createTransfer, loading: transferLoading } = useTransfer();
  const router = useRouter();

  // Form state
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [title, setTitle] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'link'>('link');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [expiryDays, setExpiryDays] = useState(3);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Verification state (for anonymous users)
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const verificationInputRef = useRef<HTMLInputElement>(null);

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    downloadUrl: string;
    customUrl?: string;
    transferId: string;
    expiresAt: string;
    emailSent?: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const isAnonymous = !user;

  // Get current user's plan and limits
  const currentPlan = useMemo(() => {
    if (isAnonymous) return 'free';
    return userProfile?.plan || 'free';
  }, [isAnonymous, userProfile]);

  const planLimits = useMemo(() => {
    return getPlanLimits(currentPlan as 'free' | 'starter' | 'pro' | 'business');
  }, [currentPlan]);

  // Filter expiry options based on plan
  const availableExpiryOptions = useMemo(() => {
    const planIndex = PLAN_HIERARCHY.indexOf(currentPlan);
    return EXPIRY_OPTIONS.filter(option => {
      const optionPlanIndex = PLAN_HIERARCHY.indexOf(option.minPlan);
      return optionPlanIndex <= planIndex;
    });
  }, [currentPlan]);

  // Check if password protection is available
  const canUsePassword = planLimits.passwordProtection;

  useEffect(() => {
    if (!loading && user && userProfile) {
      setSenderName(userProfile.displayName || '');
    }
  }, [user, userProfile, loading]);

  // Focus verification input when modal opens
  useEffect(() => {
    if (showVerificationModal && verificationInputRef.current) {
      verificationInputRef.current.focus();
    }
  }, [showVerificationModal]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return { gradient: 'from-purple-500 to-pink-500', icon: <Image className="w-5 h-5 text-white" /> };
    } else if (type.startsWith('video/')) {
      return { gradient: 'from-red-500 to-orange-500', icon: <Video className="w-5 h-5 text-white" /> };
    } else if (type.includes('pdf')) {
      return { gradient: 'from-red-600 to-red-700', icon: <FileText className="w-5 h-5 text-white" /> };
    }
    return { gradient: 'from-cyan-500 to-blue-500', icon: <File className="w-5 h-5 text-white" /> };
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    // Handle both files and folders via DataTransfer API
    const items = e.dataTransfer.items;
    const allFiles: File[] = [];

    const processEntry = async (entry: FileSystemEntry): Promise<void> => {
      if (entry.isFile) {
        const fileEntry = entry as FileSystemFileEntry;
        return new Promise((resolve) => {
          fileEntry.file((file) => {
            allFiles.push(file);
            resolve();
          });
        });
      } else if (entry.isDirectory) {
        const dirEntry = entry as FileSystemDirectoryEntry;
        const reader = dirEntry.createReader();
        return new Promise((resolve) => {
          const readEntries = () => {
            reader.readEntries(async (entries) => {
              if (entries.length === 0) {
                resolve();
              } else {
                for (const entry of entries) {
                  await processEntry(entry);
                }
                readEntries(); // Continue reading (directories can have batched results)
              }
            });
          };
          readEntries();
        });
      }
    };

    if (items && items.length > 0) {
      const entries: FileSystemEntry[] = [];
      for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry?.();
        if (entry) {
          entries.push(entry);
        }
      }

      if (entries.length > 0) {
        for (const entry of entries) {
          await processEntry(entry);
        }
        addFiles(allFiles);
        return;
      }
    }

    // Fallback to simple file list
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    // Check max files limit
    const currentCount = files.length;
    const maxFiles = planLimits.maxFilesPerTransfer === -1 ? Infinity : planLimits.maxFilesPerTransfer;

    if (currentCount + newFiles.length > maxFiles) {
      setUploadError(`Puoi caricare massimo ${maxFiles} file per trasferimento.`);
      return;
    }

    // Check storage limit for registered users
    if (user && userProfile) {
      const storageLimit = userProfile.storageLimit || planLimits.storageLimit;
      const currentStorage = userProfile.storageUsed || 0;
      const existingFilesSize = files.reduce((acc, f) => acc + f.file.size, 0);
      const newFilesSize = newFiles.reduce((acc, f) => acc + f.size, 0);
      const totalNewSize = existingFilesSize + newFilesSize;

      // Skip check for unlimited storage (-1)
      if (storageLimit !== -1 && currentStorage + totalNewSize > storageLimit) {
        const availableSpace = storageLimit - currentStorage;
        setUploadError(
          `Spazio insufficiente. Hai ${formatBytes(availableSpace)} disponibili, ma stai cercando di caricare ${formatBytes(totalNewSize)}. Passa a un piano superiore per più spazio.`
        );
        return;
      }
    }

    const uploadFiles: UploadFile[] = newFiles.map((file) => ({
      file,
      progress: 0,
      status: 'pending' as const,
    }));
    setFiles((prev) => [...prev, ...uploadFiles]);
    setUploadError(null);

    // Auto-fill title from first file if empty
    if (!title && newFiles.length > 0) {
      const firstName = newFiles[0].name.replace(/\.[^/.]+$/, ''); // Remove extension
      setTitle(firstName);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Send verification code
  const sendVerificationCode = async () => {
    if (!senderEmail.trim()) {
      setUploadError('Inserisci la tua email per procedere.');
      return false;
    }

    setIsSendingCode(true);
    setVerificationError('');

    try {
      const response = await fetch('/api/anonymous/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: senderEmail.trim() }),
      });

      const result = await response.json();

      if (result.success) {
        setShowVerificationModal(true);
        return true;
      } else {
        if (result.limitsExceeded) {
          setUploadError(result.error);
        } else {
          setVerificationError(result.error || 'Errore nell\'invio del codice');
        }
        return false;
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      setUploadError('Errore di connessione. Riprova.');
      return false;
    } finally {
      setIsSendingCode(false);
    }
  };

  // Verify code
  const verifyCode = async (codeToVerify?: string) => {
    // Prevent double submission
    if (isVerifying) return;

    const code = codeToVerify || verificationCode;

    if (!code || code.length !== 6) {
      setVerificationError('Inserisci un codice di 6 cifre');
      return;
    }

    setIsVerifying(true);
    setVerificationError('');

    try {
      const response = await fetch('/api/anonymous/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: senderEmail.trim(),
          code: code,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsEmailVerified(true);
        setShowVerificationModal(false);
        // Proceed with upload
        await performUpload();
      } else {
        setVerificationError(result.error || 'Codice non valido');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      setVerificationError('Errore di connessione. Riprova.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle code input change
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(value);
    setVerificationError('');

    // Auto-submit when 6 digits entered
    if (value.length === 6) {
      setTimeout(() => verifyCode(value), 100);
    }
  };

  // Perform the actual upload
  const performUpload = async () => {
    setIsUploading(true);
    setUploadError(null);

    // Update file statuses to uploading
    setFiles(prev => prev.map(f => ({ ...f, status: 'uploading' as const })));

    try {
      const result = await createTransfer(
        {
          title: title.trim(),
          message: message.trim() || undefined,
          recipientEmail: deliveryMethod === 'email' ? recipientEmail.trim() : undefined,
          senderName: senderName.trim() || undefined,
          password: canUsePassword && password ? password : undefined,
          deliveryMethod,
          expiryDays,
          email: isAnonymous ? senderEmail.trim() : undefined,
        },
        files.map(f => f.file)
      );

      if (result.success && result.downloadUrl) {
        // Update file statuses to completed
        setFiles(prev => prev.map(f => ({ ...f, status: 'completed' as const, progress: 100 })));

        // Show success modal
        setUploadResult({
          downloadUrl: result.downloadUrl,
          customUrl: result.customUrl,
          transferId: result.transferId || '',
          expiresAt: result.expiresAt || '',
          emailSent: deliveryMethod === 'email',
        });
        setShowSuccessModal(true);
      } else {
        throw new Error(result.error || 'Errore durante il caricamento');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore durante il caricamento';
      setUploadError(errorMessage);
      setFiles(prev => prev.map(f => ({ ...f, status: 'error' as const, error: errorMessage })));
    } finally {
      setIsUploading(false);
    }
  };

  // Handle upload button click
  const handleUpload = async () => {
    // Validation
    if (files.length === 0) {
      setUploadError('Seleziona almeno un file da caricare.');
      return;
    }

    if (!title.trim()) {
      setUploadError('Inserisci un titolo per il trasferimento.');
      return;
    }

    if (isAnonymous && !senderEmail.trim()) {
      setUploadError('Inserisci la tua email per procedere.');
      return;
    }

    if (deliveryMethod === 'email' && !recipientEmail.trim()) {
      setUploadError('Inserisci l\'email del destinatario.');
      return;
    }

    // For anonymous users, require email verification first
    if (isAnonymous && !isEmailVerified) {
      await sendVerificationCode();
      return;
    }

    // For registered users or verified anonymous users, proceed with upload
    await performUpload();
  };

  const copyToClipboard = async () => {
    // Prefer custom URL if available, otherwise use standard download URL
    const urlToCopy = uploadResult?.customUrl || uploadResult?.downloadUrl;
    if (urlToCopy) {
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetForm = () => {
    setFiles([]);
    setTitle('');
    setMessage('');
    setRecipientEmail('');
    setPassword('');
    setExpiryDays(3);
    setShowSuccessModal(false);
    setUploadResult(null);
    setUploadError(null);
    setIsEmailVerified(false);
    setVerificationCode('');
  };

  const totalSize = files.reduce((acc, f) => acc + f.file.size, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center -mt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
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

      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-white/20">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500/20 rounded-full mb-4">
                <Mail className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Verifica la tua Email</h3>
              <p className="text-blue-200/80">Abbiamo inviato un codice di 6 cifre a:</p>
              <p className="text-cyan-400 font-semibold mt-1">{senderEmail}</p>
            </div>

            <div className="mb-6">
              <label htmlFor="verificationCode" className="block text-sm font-semibold text-white mb-2">
                Codice di Verifica
              </label>
              <input
                ref={verificationInputRef}
                type="text"
                id="verificationCode"
                value={verificationCode}
                onChange={handleCodeChange}
                maxLength={6}
                placeholder="000000"
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white text-center text-2xl font-mono tracking-widest placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
              />
              {verificationError && (
                <p className="text-red-400 text-sm mt-2">{verificationError}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowVerificationModal(false);
                  setVerificationCode('');
                  setVerificationError('');
                }}
                className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={() => verifyCode(verificationCode)}
                disabled={isVerifying || verificationCode.length !== 6}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Verifica...
                  </>
                ) : (
                  'Verifica'
                )}
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={sendVerificationCode}
                disabled={isSendingCode}
                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium disabled:opacity-50"
              >
                {isSendingCode ? 'Invio in corso...' : 'Non hai ricevuto il codice? Reinvia'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && uploadResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-3xl shadow-2xl max-w-lg w-full p-8 border border-white/20 relative">
            {/* Close Button */}
            <button
              onClick={resetForm}
              className="absolute top-4 right-4 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all"
              aria-label="Chiudi"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-green-400 to-emerald-500 rounded-full mb-4 animate-bounce">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">Upload Completato!</h3>
              <p className="text-blue-200/80">
                {uploadResult.emailSent
                  ? 'Il link è stato inviato al destinatario via email.'
                  : 'Condividi il link qui sotto con il destinatario.'}
              </p>
            </div>

            {/* Download Link */}
            <div className="mb-6">
              {/* Custom Branded URL if available */}
              {uploadResult.customUrl && (
                <div className="mb-4">
                  <label className="flex items-center text-sm font-semibold text-white mb-2">
                    <Crown className="w-4 h-4 text-yellow-400 mr-2" />
                    Link Personalizzato
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={uploadResult.customUrl}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl text-white text-sm"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-xl text-yellow-400 transition-colors"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              <label className="block text-sm font-semibold text-white mb-2">
                {uploadResult.customUrl ? 'Link Standard' : 'Link di Download'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={uploadResult.downloadUrl}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm"
                />
                {!uploadResult.customUrl && (
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-xl text-cyan-400 transition-colors"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                )}
              </div>
              {copied && (
                <p className="text-green-400 text-sm mt-2">Link copiato negli appunti!</p>
              )}
            </div>

            {/* Transfer Info */}
            <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-200/70">File caricati:</span>
                <span className="text-white font-medium">{files.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-200/70">Dimensione totale:</span>
                <span className="text-white font-medium">{formatBytes(totalSize)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-200/70">Scadenza:</span>
                <span className="text-white font-medium">{expiryDays} giorni</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => window.open(uploadResult.customUrl || uploadResult.downloadUrl, '_blank')}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Apri Link
              </button>
              <button
                onClick={resetForm}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-colors"
              >
                Nuovo Upload
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6">
            <Upload className="w-5 h-5 text-cyan-400 mr-2" />
            <span className="text-white/90 text-sm font-medium">Upload Sicuro</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Carica i tuoi{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">File</span>
          </h1>
          <p className="text-lg text-blue-100/80 max-w-2xl mx-auto">
            Condividi file in modo sicuro con crittografia end-to-end
          </p>
        </div>

        {/* Storage Quota - Show for logged in users */}
        {user && userProfile && (
          <div className="mb-6">
            <StorageQuota
              storageUsed={userProfile.storageUsed || 0}
              storageLimit={userProfile.storageLimit || planLimits.storageLimit}
              pendingSize={totalSize}
            />
          </div>
        )}

        {/* Error Alert */}
        {uploadError && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-200">{uploadError}</p>
            <button onClick={() => setUploadError(null)} className="ml-auto text-red-400 hover:text-red-300">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Main Upload Card */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl overflow-hidden mb-6">
          {/* Drag & Drop Zone */}
          <div
            className={`relative p-8 lg:p-12 border-b border-white/10 transition-colors ${
              isDragOver ? 'bg-white/20' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="fileInput"
              disabled={isUploading}
            />
            <input
              type="file"
              // @ts-ignore - webkitdirectory is a non-standard but widely supported attribute
              webkitdirectory="true"
              directory=""
              onChange={handleFileSelect}
              className="hidden"
              id="folderInput"
              disabled={isUploading}
            />

            {files.length === 0 ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full mb-6 animate-bounce">
                  <Upload className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Trascina i file qui</h3>
                <p className="text-blue-100/70 mb-6">oppure clicca per selezionarli</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => document.getElementById('fileInput')?.click()}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 transform hover:scale-105"
                  >
                    <Plus className="w-5 h-5 inline-block mr-2" />
                    Seleziona File
                  </button>
                  <button
                    type="button"
                    onClick={() => document.getElementById('folderInput')?.click()}
                    className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-purple-400 hover:to-pink-500 transition-all duration-300 transform hover:scale-105"
                  >
                    <FolderOpen className="w-5 h-5 inline-block mr-2" />
                    Seleziona Cartella
                  </button>
                </div>
                <p className="text-xs text-blue-200/60 mt-4">
                  Max {planLimits.maxFilesPerTransfer === -1 ? 'illimitati' : planLimits.maxFilesPerTransfer} file • Tutti i formati supportati
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    File ({files.length}) - {formatBytes(totalSize)}
                  </h3>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => document.getElementById('fileInput')?.click()}
                      disabled={isUploading}
                      className="text-cyan-400 hover:text-cyan-300 text-sm font-medium disabled:opacity-50"
                    >
                      + Aggiungi file
                    </button>
                    <button
                      type="button"
                      onClick={() => document.getElementById('folderInput')?.click()}
                      disabled={isUploading}
                      className="text-purple-400 hover:text-purple-300 text-sm font-medium disabled:opacity-50"
                    >
                      + Aggiungi cartella
                    </button>
                  </div>
                </div>

                {files.map((fileItem, index) => {
                  const fileIcon = getFileIcon(fileItem.file.type);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all group"
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <div className={`w-10 h-10 bg-gradient-to-br ${fileIcon.gradient} rounded-lg flex items-center justify-center mr-3 flex-shrink-0`}>
                          {fileIcon.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{fileItem.file.name}</p>
                          <p className="text-blue-200/60 text-sm">{formatBytes(fileItem.file.size)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-3">
                        {fileItem.status === 'uploading' && (
                          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                        )}
                        {fileItem.status === 'completed' && (
                          <Check className="w-5 h-5 text-green-400" />
                        )}
                        {fileItem.status === 'error' && (
                          <AlertCircle className="w-5 h-5 text-red-400" />
                        )}
                        {!isUploading && (
                          <button
                            onClick={() => removeFile(index)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upload Options */}
          <div className="p-8 lg:p-10 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-white mb-2">
                Titolo del Trasferimento *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isUploading}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all disabled:opacity-50"
                placeholder="Es: Documenti progetto, Foto vacanze..."
              />
            </div>

            {/* Delivery Method */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">Metodo di Consegna</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`relative flex items-center p-4 bg-white/5 backdrop-blur-sm border-2 rounded-xl cursor-pointer hover:bg-white/10 transition-all ${
                  deliveryMethod === 'email' ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/20'
                }`}>
                  <input
                    type="radio"
                    name="delivery_method"
                    value="email"
                    checked={deliveryMethod === 'email'}
                    onChange={() => setDeliveryMethod('email')}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <div className={`w-5 h-5 border-2 rounded-full mr-3 flex items-center justify-center ${
                    deliveryMethod === 'email' ? 'border-cyan-400 bg-cyan-400' : 'border-white/40'
                  }`}>
                    {deliveryMethod === 'email' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-cyan-400 mr-2" />
                      <span className="font-medium text-white">Invia via Email</span>
                    </div>
                  </div>
                </label>
                <label className={`relative flex items-center p-4 bg-white/5 backdrop-blur-sm border-2 rounded-xl cursor-pointer hover:bg-white/10 transition-all ${
                  deliveryMethod === 'link' ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/20'
                }`}>
                  <input
                    type="radio"
                    name="delivery_method"
                    value="link"
                    checked={deliveryMethod === 'link'}
                    onChange={() => setDeliveryMethod('link')}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <div className={`w-5 h-5 border-2 rounded-full mr-3 flex items-center justify-center ${
                    deliveryMethod === 'link' ? 'border-cyan-400 bg-cyan-400' : 'border-white/40'
                  }`}>
                    {deliveryMethod === 'link' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <Link2 className="w-5 h-5 text-purple-400 mr-2" />
                      <span className="font-medium text-white">Ottieni Link</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Anonymous User Email */}
            {isAnonymous && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <p className="text-yellow-200 text-sm mb-3">
                  Stai caricando come utente anonimo. Inserisci la tua email per verificare la tua identità e ricevere il link di download.
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="senderEmail" className="block text-sm font-semibold text-white mb-2">
                      La tua Email * {isEmailVerified && <span className="text-green-400">(Verificata)</span>}
                    </label>
                    <input
                      type="email"
                      id="senderEmail"
                      value={senderEmail}
                      onChange={(e) => {
                        setSenderEmail(e.target.value);
                        setIsEmailVerified(false); // Reset verification if email changes
                      }}
                      disabled={isUploading || isEmailVerified}
                      required
                      className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all disabled:opacity-50"
                      placeholder="tuaemail@esempio.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="senderNameAnon" className="block text-sm font-semibold text-white mb-2">
                      Il tuo Nome
                    </label>
                    <input
                      type="text"
                      id="senderNameAnon"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      disabled={isUploading}
                      className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all disabled:opacity-50"
                      placeholder="Mario Rossi"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email Fields */}
            {deliveryMethod === 'email' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="recipientEmail" className="block text-sm font-semibold text-white mb-2">
                    Email Destinatario *
                  </label>
                  <input
                    type="email"
                    id="recipientEmail"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    disabled={isUploading}
                    className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all disabled:opacity-50"
                    placeholder="destinatario@email.com"
                  />
                </div>
                {!isAnonymous && (
                  <div>
                    <label htmlFor="senderName" className="block text-sm font-semibold text-white mb-2">
                      Il tuo Nome
                    </label>
                    <input
                      type="text"
                      id="senderName"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      disabled={isUploading}
                      className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all disabled:opacity-50"
                      placeholder="Mario Rossi"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-white mb-2">
                Messaggio (Opzionale)
              </label>
              <textarea
                id="message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isUploading}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all resize-none disabled:opacity-50"
                placeholder="Aggiungi un messaggio per il destinatario..."
              />
            </div>

            {/* Advanced Options */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Password - Only for Pro/Business */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                  <Lock className="w-4 h-4 inline-block mr-1" />
                  Password (Opzionale)
                  {!canUsePassword && (
                    <span className="ml-2 text-xs text-yellow-400">
                      <Crown className="w-3 h-3 inline-block mr-1" />
                      Pro
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!canUsePassword || isUploading}
                  className={`w-full h-12 px-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all ${!canUsePassword ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder={canUsePassword ? "Proteggi con password" : "Disponibile con piano Pro"}
                />
              </div>

              {/* Expiry - Filtered by plan */}
              <div>
                <label htmlFor="expiryDays" className="block text-sm font-semibold text-white mb-2">
                  <Clock className="w-4 h-4 inline-block mr-1" />
                  Scadenza
                  <span className="ml-2 text-xs text-blue-300">
                    (max {planLimits.retentionDays} giorni)
                  </span>
                </label>
                <select
                  id="expiryDays"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(parseInt(e.target.value))}
                  disabled={isUploading}
                  className="w-full h-12 px-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50"
                >
                  {availableExpiryOptions.map(option => (
                    <option key={option.value} value={option.value} className="bg-slate-900">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleUpload}
                disabled={files.length === 0 || isUploading || isSendingCode}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center group"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    Caricamento in corso...
                  </>
                ) : isSendingCode ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    Invio codice...
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
                    {files.length > 0
                      ? isAnonymous && !isEmailVerified
                        ? `Verifica Email e Carica ${files.length} File`
                        : `Carica ${files.length} File (${formatBytes(totalSize)})`
                      : 'Seleziona file da caricare'
                    }
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
            <Shield className="w-4 h-4 text-green-400 mr-2" />
            <span className="text-white/80 text-sm">Protetto con crittografia AES-256 end-to-end</span>
          </div>
        </div>
      </div>
    </div>
  );
}
