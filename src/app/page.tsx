'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTransfer } from '@/context/TransferContext';
import {
  Upload, X, File, Check, AlertCircle, Lock, Mail, Clock, Shield, Plus,
  Image, Video, FileText, Crown, Copy, CheckCircle, ExternalLink, Loader2, FolderOpen, MoreHorizontal,
  ChevronRight, ChevronLeft
} from 'lucide-react';
import { getPlanLimits } from '@/types';
import MainLayout from '@/components/layout/MainLayout';

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

const ACCESS_OPTIONS = [
  {
    value: 'public' as const,
    label: 'Pubblico',
    desc: 'Chiunque abbia il link può accedere. Ricevi una notifica la prima volta che i tuoi file vengono scaricati.',
  },
  {
    value: 'tracked' as const,
    label: 'Tracciato',
    desc: 'Chiunque abbia il link può accedere dopo autenticazione. Ricevi notifiche dettagliate per ogni download.',
  },
  {
    value: 'limited' as const,
    label: 'Limitato',
    desc: 'Solo i destinatari specificati possono accedere a questo trasferimento. Ricevi notifiche dettagliate per ogni download.',
  },
];

const VIEW_OPTIONS = [
  { value: 'preview_download' as const, label: 'Anteprima e download', desc: 'I destinatari possono visualizzare i file e scaricarli.' },
  { value: 'download_only' as const, label: 'Solo download', desc: 'I destinatari possono solo scaricare i file. L\'anteprima non sarà disponibile.' },
  { value: 'preview_only' as const, label: 'Solo anteprima', desc: 'I destinatari possono accedere solo a un\'anteprima dei file.' },
];

function SidePanelContent({
  deliveryMethod, setDeliveryMethod,
  password, setPassword, canUsePassword,
  senderName, setSenderName,
  accessControl, setAccessControl,
  viewOption, setViewOption,
  isBusiness, isUploading,
  onViewOptionsHover, viewOptionsExpanded,
}: {
  deliveryMethod: 'email' | 'link';
  setDeliveryMethod: (v: 'email' | 'link') => void;
  password: string;
  setPassword: (v: string) => void;
  canUsePassword: boolean;
  senderName: string;
  setSenderName: (v: string) => void;
  accessControl: 'public' | 'tracked' | 'limited';
  setAccessControl: (v: 'public' | 'tracked' | 'limited') => void;
  viewOption: 'preview_download' | 'download_only' | 'preview_only';
  setViewOption: (v: 'preview_download' | 'download_only' | 'preview_only') => void;
  isBusiness: boolean;
  isUploading: boolean;
  onViewOptionsHover?: (open: boolean) => void;
  viewOptionsExpanded?: boolean;
}) {
  const [subView, setSubView] = useState<'main' | 'access'>('main');

  // Access Control detail view — replaces entire panel
  if (subView === 'access') {
    return (
      <div>
        <button
          type="button"
          onClick={() => setSubView('main')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-5"
        >
          <ChevronLeft className="w-4 h-4" />
          Torna alle opzioni
        </button>
        <h3 className="text-lg font-bold text-gray-900 mb-5">Controllo accessi</h3>
        <div className="space-y-4">
          {ACCESS_OPTIONS.map((opt) => {
            const isSelected = accessControl === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAccessControl(opt.value)}
                className="w-full text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? 'border-[#409cff] bg-[#409cff]' : 'border-gray-300 group-hover:border-gray-400'
                  }`}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                        {opt.value === 'tracked' && <Shield className="w-3.5 h-3.5 inline mr-1 text-gray-500" />}
                        {opt.value === 'limited' && <Lock className="w-3.5 h-3.5 inline mr-1 text-gray-500" />}
                        {opt.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{opt.desc}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-5 pt-4 border-t border-gray-100 leading-relaxed">
          Per i trasferimenti via email, i destinatari del trasferimento sono autorizzati automaticamente.
        </p>
      </div>
    );
  }

  // Main view
  return (
    <div className="space-y-0">
      {/* Delivery Method */}
      <div className="border-b border-gray-100 pb-4 mb-4">
        <button
          type="button"
          onClick={() => setDeliveryMethod('email')}
          disabled={isUploading}
          className="flex items-center gap-3 w-full py-2"
        >
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            deliveryMethod === 'email' ? 'border-[#409cff] bg-[#409cff]' : 'border-gray-300'
          }`}>
            {deliveryMethod === 'email' && <div className="w-2 h-2 bg-white rounded-full" />}
          </div>
          <span className={`text-sm font-medium ${deliveryMethod === 'email' ? 'text-gray-900' : 'text-gray-500'}`}>
            Invia e-mail
          </span>
        </button>
        <button
          type="button"
          onClick={() => setDeliveryMethod('link')}
          disabled={isUploading}
          className="flex items-center gap-3 w-full py-2"
        >
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            deliveryMethod === 'link' ? 'border-[#409cff] bg-[#409cff]' : 'border-gray-300'
          }`}>
            {deliveryMethod === 'link' && <div className="w-2 h-2 bg-white rounded-full" />}
          </div>
          <span className={`text-sm font-medium ${deliveryMethod === 'link' ? 'text-gray-900' : 'text-gray-500'}`}>
            Crea link
          </span>
        </button>
      </div>

      {/* Access Control — Business only */}
      <div className="border-b border-gray-100 pb-4 mb-4">
        <button
          type="button"
          onClick={() => isBusiness && setSubView('access')}
          className="flex items-center justify-between w-full group"
        >
          <div className="text-left">
            <span className="flex items-center gap-1 text-xs font-medium text-gray-400 uppercase tracking-wider">
              Controllo accessi
              {!isBusiness && (
                <span className="text-yellow-600 normal-case tracking-normal ml-1">
                  <Crown className="w-3 h-3 inline mr-0.5" />
                  Business
                </span>
              )}
            </span>
            <p className={`text-sm font-medium mt-0.5 ${isBusiness ? 'text-gray-900' : 'text-gray-400'}`}>
              {ACCESS_OPTIONS.find(o => o.value === accessControl)?.label || 'Pubblico'}
            </p>
          </div>
          {isBusiness && (
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
          )}
        </button>
      </div>

      {/* View Options — Business only */}
      <div className="border-b border-gray-100 pb-4 mb-4 relative">
        <button
          type="button"
          onClick={() => isBusiness && onViewOptionsHover?.(!viewOptionsExpanded)}
          className="flex items-center justify-between w-full group"
        >
          <div className="text-left">
            <span className="flex items-center gap-1 text-xs font-medium text-gray-400 uppercase tracking-wider">
              Opzioni di visualizzazione
              {!isBusiness && (
                <span className="text-yellow-600 normal-case tracking-normal ml-1">
                  <Crown className="w-3 h-3 inline mr-0.5" />
                  Business
                </span>
              )}
            </span>
            <p className={`text-sm font-medium mt-0.5 ${isBusiness ? 'text-gray-900' : 'text-gray-400'}`}>
              {VIEW_OPTIONS.find(o => o.value === viewOption)?.label || 'Anteprima e download'}
            </p>
          </div>
          {isBusiness && (
            <ChevronRight className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform ${viewOptionsExpanded ? 'rotate-90' : ''}`} />
          )}
        </button>

        {/* Mobile: inline view options */}
        {viewOptionsExpanded && isBusiness && (
          <div className="lg:hidden mt-3 space-y-0 border border-gray-100 rounded-xl overflow-hidden">
            {VIEW_OPTIONS.map((opt, idx) => {
              const isSelected = viewOption === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setViewOption(opt.value); onViewOptionsHover?.(false); }}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                  } ${idx < VIEW_OPTIONS.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <span className={`text-sm font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                    {opt.label}
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{opt.desc}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Password */}
      <div className="border-b border-gray-100 pb-4 mb-4">
        <label className="flex items-center text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
          Password
          {!canUsePassword && (
            <span className="ml-1.5 text-yellow-600 normal-case tracking-normal">
              <Crown className="w-3 h-3 inline mr-0.5" />
              Pro
            </span>
          )}
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={!canUsePassword || isUploading}
          className={`w-full py-1.5 text-sm text-gray-900 placeholder-gray-400 bg-transparent border-none outline-none focus:ring-0 disabled:opacity-50 ${!canUsePassword ? 'opacity-50 cursor-not-allowed' : ''}`}
          placeholder={canUsePassword ? 'Imposta password' : 'Piano Pro richiesto'}
        />
      </div>

      {/* Sender Name */}
      <div>
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
          Nome mittente
        </label>
        <input
          type="text"
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
          disabled={isUploading}
          className="w-full py-1.5 text-sm text-gray-900 placeholder-gray-400 bg-transparent border-none outline-none focus:ring-0 disabled:opacity-50"
          placeholder="Mario Rossi"
        />
      </div>
    </div>
  );
}

export default function HomePage() {
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
  const [accessControl, setAccessControl] = useState<'public' | 'tracked' | 'limited'>('public');
  const [viewOption, setViewOption] = useState<'preview_download' | 'download_only' | 'preview_only'>('preview_download');
  const [viewOptionsExpanded, setViewOptionsExpanded] = useState(false);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Advanced options toggle
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const sidePanelRef = useRef<HTMLDivElement>(null);
  const [sidePanelHeight, setSidePanelHeight] = useState(0);

  // Sync side panel height to upload card
  useEffect(() => {
    if (showAdvancedOptions && sidePanelRef.current) {
      setSidePanelHeight(sidePanelRef.current.offsetHeight);
    } else {
      setSidePanelHeight(0);
    }
  }, [showAdvancedOptions]);

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
      const isBusiness = currentPlan === 'business';
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
          accessControl: isBusiness ? accessControl : undefined,
          viewOption: isBusiness ? viewOption : undefined,
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
    setAccessControl('public');
    setViewOption('preview_download');
    setViewOptionsExpanded(false);
    setShowSuccessModal(false);
    setUploadResult(null);
    setUploadError(null);
    setIsEmailVerified(false);
    setVerificationCode('');
  };

  const totalSize = files.reduce((acc, f) => acc + f.file.size, 0);

  if (loading) {
    return (
      <MainLayout showFooter={false}>
        <div className="min-h-screen bg-[#f0edfa] flex items-center justify-center -mt-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#409cff]"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showFooter={false}>
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

      {/* Full-page gradient background with card overlay */}
      <div className="min-h-screen -mt-16 pt-16 relative overflow-x-hidden overflow-y-visible bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        {/* Animated decorative circles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-[60%] w-72 h-72 bg-white/10 rounded-full blur-3xl mix-blend-multiply animate-pulse" />
          <div className="absolute top-[50%] right-[10%] w-96 h-96 bg-pink-300/20 rounded-full blur-3xl mix-blend-multiply animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-[10%] left-[40%] w-80 h-80 bg-blue-300/20 rounded-full blur-3xl mix-blend-multiply animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[30%] right-[30%] w-64 h-64 bg-purple-300/15 rounded-full blur-2xl mix-blend-multiply animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
          {/* Left Panel — Upload Card */}
          <div
            className="w-full lg:w-[480px] lg:min-w-[480px] flex flex-col items-center justify-center px-6 py-8 flex-shrink-0"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Upload Card + Side Panel wrapper */}
            <div className="relative w-full max-w-[420px]">
            <div className={`bg-white rounded-2xl shadow-lg p-6 w-full transition-all ${isDragOver ? 'ring-2 ring-[#409cff] ring-offset-2 ring-offset-transparent' : ''}`} style={showAdvancedOptions && sidePanelHeight > 0 ? { minHeight: sidePanelHeight } : undefined}>
              {/* Error Alert */}
              {uploadError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm flex-1">{uploadError}</p>
                  <button onClick={() => setUploadError(null)} className="text-red-400 hover:text-red-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Hidden file inputs */}
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

              {/* File buttons */}
              <div className="flex gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => document.getElementById('fileInput')?.click()}
                  disabled={isUploading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#409cff] hover:bg-[#2d8ae8] text-white rounded-full text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  Aggiungi file
                </button>
                <button
                  type="button"
                  onClick={() => document.getElementById('folderInput')?.click()}
                  disabled={isUploading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#7c5cfc] hover:bg-[#6a4be0] text-white rounded-full text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <FolderOpen className="w-4 h-4" />
                  Aggiungi cartella
                </button>
              </div>

              {/* File list (when files are selected) */}
              {files.length > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      File ({files.length}) — {formatBytes(totalSize)}
                    </span>
                    <button
                      type="button"
                      onClick={() => document.getElementById('fileInput')?.click()}
                      disabled={isUploading}
                      className="text-[#409cff] hover:text-[#2d8ae8] text-xs font-medium disabled:opacity-50"
                    >
                      + Aggiungi
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {files.map((fileItem, index) => {
                      const fileIcon = getFileIcon(fileItem.file.type);
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 group transition-colors"
                        >
                          <div className={`w-7 h-7 bg-gradient-to-br ${fileIcon.gradient} rounded flex items-center justify-center flex-shrink-0`}>
                            {fileIcon.icon}
                          </div>
                          <span className="text-sm text-gray-800 truncate flex-1">{fileItem.file.name}</span>
                          <span className="text-xs text-gray-400 flex-shrink-0">{formatBytes(fileItem.file.size)}</span>
                          {fileItem.status === 'uploading' && (
                            <Loader2 className="w-4 h-4 text-[#409cff] animate-spin flex-shrink-0" />
                          )}
                          {fileItem.status === 'completed' && (
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          )}
                          {fileItem.status === 'error' && (
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                          )}
                          {!isUploading && (
                            <button
                              onClick={() => removeFile(index)}
                              className="p-0.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {files.length === 0 && (
                <p className="text-xs text-gray-400 mb-4">
                  Max {planLimits.maxFilesPerTransfer === -1 ? 'illimitati' : planLimits.maxFilesPerTransfer} file — Trascina qui o usa i pulsanti sopra
                </p>
              )}

              {/* Form fields with dividers */}
              <div className="space-y-0">
                {/* Recipient Email - only when delivery is email */}
                {deliveryMethod === 'email' && (
                  <div className="border-b border-gray-200">
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      disabled={isUploading}
                      className="w-full py-3 text-sm text-gray-900 placeholder-gray-400 bg-transparent border-none outline-none focus:ring-0 disabled:opacity-50"
                      placeholder="Email destinatario"
                    />
                  </div>
                )}

                {/* Sender Email - for anonymous users (editable) */}
                {isAnonymous && (
                  <div className="border-b border-gray-200">
                    <div className="flex items-center">
                      <input
                        type="email"
                        value={senderEmail}
                        onChange={(e) => {
                          setSenderEmail(e.target.value);
                          setIsEmailVerified(false);
                        }}
                        disabled={isUploading || isEmailVerified}
                        className="w-full py-3 text-sm text-gray-900 placeholder-gray-400 bg-transparent border-none outline-none focus:ring-0 disabled:opacity-50"
                        placeholder="La tua email"
                      />
                      {isEmailVerified && (
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                )}

                {/* User email - for logged in users (read-only) */}
                {user && (
                  <div className="border-b border-gray-200">
                    <p className="py-3 text-sm text-gray-900">{user.email}</p>
                  </div>
                )}

                {/* Title */}
                <div className="border-b border-gray-200">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isUploading}
                    className="w-full py-3 text-sm text-gray-900 placeholder-gray-400 bg-transparent border-none outline-none focus:ring-0 disabled:opacity-50"
                    placeholder="Titolo"
                  />
                </div>

                {/* Message - optional */}
                <div className="border-b border-gray-200">
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isUploading}
                    className="w-full py-3 text-sm text-gray-900 placeholder-gray-400 bg-transparent border-none outline-none focus:ring-0 resize-none disabled:opacity-50"
                    placeholder="Messaggio (opzionale)"
                  />
                </div>
              </div>

              {/* Expiry + Advanced toggle row */}
              <div className="flex items-center justify-between mt-3 mb-3">
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock className="w-4 h-4" />
                  <select
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(parseInt(e.target.value))}
                    disabled={isUploading}
                    className="text-sm text-gray-600 bg-transparent border-none outline-none focus:ring-0 cursor-pointer disabled:opacity-50 py-1 -ml-1"
                  >
                    {availableExpiryOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className={`p-2 rounded-full transition-colors ${showAdvancedOptions ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                  title="Opzioni avanzate"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Transfer Button */}
              <button
                type="button"
                onClick={handleUpload}
                disabled={files.length === 0 || isUploading || isSendingCode}
                className="w-full bg-[#409cff] hover:bg-[#2d8ae8] text-white py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Caricamento in corso...
                  </>
                ) : isSendingCode ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Invio codice...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    {files.length > 0
                      ? isAnonymous && !isEmailVerified
                        ? 'Trasferisci'
                        : `Trasferisci (${formatBytes(totalSize)})`
                      : 'Trasferisci'
                    }
                  </>
                )}
              </button>
            </div>

            {/* Side Panel — Advanced Options (Desktop) */}
            <div
              ref={sidePanelRef}
              className={`absolute top-0 left-full ml-4 w-[300px] bg-white rounded-2xl shadow-lg p-5 transition-all duration-300 ease-in-out hidden lg:block ${
                showAdvancedOptions
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-4 pointer-events-none'
              }`}
            >
              <SidePanelContent
                deliveryMethod={deliveryMethod}
                setDeliveryMethod={setDeliveryMethod}
                password={password}
                setPassword={setPassword}
                canUsePassword={canUsePassword}
                senderName={senderName}
                setSenderName={setSenderName}
                accessControl={accessControl}
                setAccessControl={setAccessControl}
                viewOption={viewOption}
                setViewOption={setViewOption}
                isBusiness={currentPlan === 'business'}
                isUploading={isUploading}
                onViewOptionsHover={setViewOptionsExpanded}
                viewOptionsExpanded={viewOptionsExpanded}
              />

              {/* Floating sub-panel for View Options (Desktop) */}
              {viewOptionsExpanded && currentPlan === 'business' && (
                <div className="absolute top-0 left-full ml-3 w-[280px] bg-white rounded-2xl shadow-lg overflow-hidden">
                  {VIEW_OPTIONS.map((opt, idx) => {
                    const isSelected = viewOption === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => { setViewOption(opt.value); setViewOptionsExpanded(false); }}
                        className={`w-full text-left px-5 py-4 transition-colors ${
                          isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                        } ${idx < VIEW_OPTIONS.length - 1 ? 'border-b border-gray-100' : ''}`}
                      >
                        <span className={`text-sm font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                          {opt.label}
                        </span>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mobile Advanced Options — inline fallback */}
            {showAdvancedOptions && (
              <div className="lg:hidden mt-4 bg-white rounded-2xl shadow-lg p-5 w-full">
                <SidePanelContent
                  deliveryMethod={deliveryMethod}
                  setDeliveryMethod={setDeliveryMethod}
                  password={password}
                  setPassword={setPassword}
                  canUsePassword={canUsePassword}
                  senderName={senderName}
                  setSenderName={setSenderName}
                  accessControl={accessControl}
                  setAccessControl={setAccessControl}
                  viewOption={viewOption}
                  setViewOption={setViewOption}
                  isBusiness={currentPlan === 'business'}
                  isUploading={isUploading}
                  onViewOptionsHover={setViewOptionsExpanded}
                  viewOptionsExpanded={viewOptionsExpanded}
                />
              </div>
            )}
            </div>

            {/* Tagline below card */}
            <p className="mt-6 text-sm text-white/70 text-center max-w-[360px]">
              Condividi file fino a {planLimits.maxFilesPerTransfer === -1 ? 'illimitati' : planLimits.maxFilesPerTransfer} file con crittografia end-to-end
            </p>
          </div>

          {/* Right Panel — Ad space (visible on desktop, entire area is the ad container) */}
          <div id="ad-container-desktop" className="hidden lg:flex flex-1 flex-col items-center justify-center px-12">
            {/* Inserire qui il contenuto pubblicitario */}
          </div>
        </div>

        {/* Bottom Ad space (visible on mobile, entire area below card is the ad container) */}
        <div id="ad-container-mobile" className="lg:hidden relative z-10 flex-1 min-h-[250px] flex flex-col items-center justify-center px-6 pb-8">
          {/* Inserire qui il contenuto pubblicitario mobile */}
        </div>
      </div>
    </MainLayout>
  );
}
