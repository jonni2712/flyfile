'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Cloud,
  Download,
  File,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  FileArchive,
  Clock,
  Lock,
  User,
  HardDrive,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
  Search,
  Shield
} from 'lucide-react';
import { useTransfer, formatBytes, getTimeRemaining, getFileIcon } from '@/context/TransferContext';
import { Transfer, TransferFile, BrandSettings } from '@/types';
import FilePreviewModal from '@/components/FilePreviewModal';
import { decryptFile, isEncryptionSupported } from '@/lib/client-encryption';

interface BrandedDownloadClientProps {
  transferId: string;
  slug: string;
}

// File icon component
const FileIcon = ({ mimeType, className }: { mimeType: string; className?: string }) => {
  const iconType = getFileIcon(mimeType);
  const iconClass = className || 'w-6 h-6';

  switch (iconType) {
    case 'image':
      return <FileImage className={`${iconClass} text-pink-400`} />;
    case 'video':
      return <FileVideo className={`${iconClass} text-purple-400`} />;
    case 'audio':
      return <FileAudio className={`${iconClass} text-green-400`} />;
    case 'pdf':
      return <FileText className={`${iconClass} text-red-400`} />;
    case 'doc':
      return <FileText className={`${iconClass} text-blue-400`} />;
    case 'spreadsheet':
      return <FileText className={`${iconClass} text-emerald-400`} />;
    case 'archive':
      return <FileArchive className={`${iconClass} text-yellow-400`} />;
    default:
      return <File className={`${iconClass} text-gray-400`} />;
  }
};

export default function BrandedDownloadClient({ transferId, slug }: BrandedDownloadClientProps) {
  const { getPublicTransfer, verifyPassword, incrementDownloadCount } = useTransfer();

  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);

  // Password state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [verifyingPassword, setVerifyingPassword] = useState(false);

  // File preview state
  const [previewFile, setPreviewFile] = useState<TransferFile | null>(null);

  // Brand customization state
  const [brand, setBrand] = useState<BrandSettings | null>(null);
  const [slugValid, setSlugValid] = useState<boolean | null>(null);

  // Verify slug and fetch brand settings
  useEffect(() => {
    const verifySlugAndFetchBrand = async () => {
      if (!slug) return;

      try {
        // Fetch brand by slug
        const response = await fetch(`/api/brand/by-slug?slug=${encodeURIComponent(slug)}`);

        if (response.ok) {
          const data = await response.json();
          if (data.brand) {
            setBrand(data.brand);
            setSlugValid(true);
          } else {
            setSlugValid(false);
          }
        } else {
          setSlugValid(false);
        }
      } catch (err) {
        console.error('Error verifying slug:', err);
        setSlugValid(false);
      }
    };

    verifySlugAndFetchBrand();
  }, [slug]);

  // Fetch transfer data
  useEffect(() => {
    const fetchTransfer = async () => {
      if (!transferId) return;

      setLoading(true);
      try {
        const data = await getPublicTransfer(transferId);

        if (!data) {
          setError('not_found');
          return;
        }

        if (data.status === 'expired') {
          setError('expired');
          return;
        }

        setTransfer(data);

        // Check if password protected
        if (data.password && !passwordVerified) {
          setShowPasswordModal(true);
        }
      } catch (err) {
        console.error('Error fetching transfer:', err);
        setError('error');
      } finally {
        setLoading(false);
      }
    };

    fetchTransfer();
  }, [transferId, getPublicTransfer, passwordVerified]);

  // Handle password verification
  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setVerifyingPassword(true);

    try {
      const isValid = await verifyPassword(transferId, password);

      if (isValid) {
        setPasswordVerified(true);
        setShowPasswordModal(false);
      } else {
        setPasswordError('Password non corretta');
      }
    } catch (err) {
      setPasswordError('Errore nella verifica della password');
    } finally {
      setVerifyingPassword(false);
    }
  };

  // Handle download all files as ZIP
  const handleDownloadAll = async () => {
    if (!transfer || !transfer.files) return;

    setDownloading(true);
    try {
      if (transfer.files.length === 1) {
        await handleDownloadFile(transfer.files[0]);
        return;
      }

      const zipUrl = `/api/transfer/${transfer.id}/download-zip`;
      const response = await fetch(zipUrl);

      if (!response.ok) {
        throw new Error('Download non disponibile');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${transfer.title || 'flyfile_transfer'}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Download error:', err);
      alert('Errore durante il download. Riprova.');
    } finally {
      setDownloading(false);
    }
  };

  // Check if file type is previewable
  const isPreviewable = (mimeType: string): boolean => {
    return (
      mimeType.startsWith('image/') ||
      mimeType === 'application/pdf' ||
      mimeType.startsWith('video/') ||
      mimeType.startsWith('audio/') ||
      mimeType.startsWith('text/') ||
      mimeType === 'application/json' ||
      mimeType === 'application/xml' ||
      mimeType === 'application/javascript'
    );
  };

  // Handle single file download
  const handleDownloadFile = async (file: TransferFile) => {
    if (!transfer) return;

    setDownloadingFileId(file.id);
    try {
      const isFileEncrypted = file.isEncrypted || transfer.isEncrypted;
      const encryptionKey = file.encryptionKey;
      const encryptionIv = file.encryptionIv;

      const response = await fetch('/api/files/download-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transferId: transfer.id,
          fileId: file.id,
          path: file.path,
          password: transfer.password ? password : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.requiresPassword) {
          setShowPasswordModal(true);
          setDownloadingFileId(null);
          return;
        }
        throw new Error(errorData.error || 'Download non disponibile');
      }

      const { downloadUrl } = await response.json();

      if (isFileEncrypted && encryptionKey && encryptionIv && isEncryptionSupported()) {
        const encryptedResponse = await fetch(downloadUrl);
        if (!encryptedResponse.ok) {
          throw new Error('Impossibile scaricare il file cifrato');
        }

        const encryptedBlob = await encryptedResponse.blob();
        const decryptedBlob = await decryptFile(
          encryptedBlob,
          encryptionKey,
          encryptionIv,
          file.mimeType || 'application/octet-stream'
        );

        const url = window.URL.createObjectURL(decryptedBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.originalName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = file.originalName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      await incrementDownloadCount(transferId);
    } catch (err) {
      console.error('Download error:', err);
      alert('Errore durante il download. Riprova.');
    } finally {
      setDownloadingFileId(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-white/70">Caricamento trasferimento...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (error === 'not_found' || slugValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Transfer Non Trovato</h1>
          <p className="text-blue-200/70 mb-8">
            Il trasferimento che stai cercando non esiste o potrebbe essere stato eliminato.
          </p>
          <Link
            href="https://flyfile.it"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all"
          >
            Vai a FlyFile
          </Link>
        </div>
      </div>
    );
  }

  // Expired state
  if (error === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-orange-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Transfer Scaduto</h1>
          <p className="text-blue-200/70 mb-8">
            Questo trasferimento è scaduto e i file non sono più disponibili per il download.
          </p>
          <Link
            href="https://flyfile.it"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all"
          >
            Vai a FlyFile
          </Link>
        </div>
      </div>
    );
  }

  if (!transfer) return null;

  // Determine background style based on brand settings
  const getBackgroundStyle = () => {
    if (brand?.backgroundType === 'gradient' && brand.primaryColor && brand.secondaryColor) {
      return {
        background: `linear-gradient(135deg, ${brand.primaryColor}, ${brand.secondaryColor})`,
      };
    }
    return {
      background: 'linear-gradient(135deg, #0f172a, #1e3a8a, #312e81)',
    };
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={getBackgroundStyle()}>
      {/* Custom Background Image */}
      {brand?.backgroundType === 'image' && brand.backgroundUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${brand.backgroundUrl})` }}
        />
      )}

      {/* Custom Background Video */}
      {brand?.backgroundType === 'video' && brand.backgroundVideoUrl && (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={brand.backgroundVideoUrl}
          autoPlay
          loop
          muted
          playsInline
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Animated Background Pattern */}
      {!brand?.backgroundUrl && !brand?.backgroundVideoUrl && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 40% 80%, rgba(120, 200, 255, 0.3) 0%, transparent 50%)`
          }}
        />
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-white/20">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/20 rounded-full mb-4">
                <Lock className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Transfer Protetto</h3>
              <p className="text-blue-200/80">Inserisci la password per accedere ai file</p>
            </div>

            <form onSubmit={handleVerifyPassword}>
              <div className="mb-6">
                <label htmlFor="transfer-password" className="block text-sm font-semibold text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="transfer-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                    placeholder="Inserisci la password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-white/50 hover:text-white/80" />
                    ) : (
                      <Eye className="h-5 w-5 text-white/50 hover:text-white/80" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-sm text-red-400 mt-2">{passwordError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={verifyingPassword}
                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {verifyingPassword ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Verifica...
                  </>
                ) : (
                  'Verifica Password'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          {/* Custom Logo or Default Icon */}
          {brand?.logoUrl ? (
            <div className="mb-6">
              <img
                src={brand.logoUrl}
                alt={brand.companyName || 'Logo'}
                className="h-16 md:h-20 mx-auto object-contain"
              />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full mb-6 animate-pulse shadow-2xl shadow-cyan-500/50">
              <Cloud className="w-10 h-10 text-white" />
            </div>
          )}

          {/* Company Name */}
          {brand?.companyName && (
            <p className="text-lg text-white/70 mb-2">{brand.companyName}</p>
          )}

          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">
            {transfer.title}
          </h1>
          <div className="flex items-center justify-center gap-2 text-blue-200/80">
            <User className="w-5 h-5" />
            <span>
              Inviato da <span className="font-semibold text-cyan-400">{transfer.senderName || 'Utente'}</span>
            </span>
          </div>

          {/* Custom Message */}
          {brand?.customMessage && (
            <p className="mt-4 text-white/80 max-w-xl mx-auto">
              {brand.customMessage}
            </p>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-cyan-500/20 rounded-full mb-3">
              <File className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{transfer.fileCount}</div>
            <div className="text-sm text-blue-200/80">File</div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mb-3">
              <HardDrive className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {formatBytes(transfer.totalSize)}
            </div>
            <div className="text-sm text-blue-200/80">Dimensione Totale</div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500/20 rounded-full mb-3">
              <Clock className="w-6 h-6 text-orange-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {getTimeRemaining(transfer.expiresAt)}
            </div>
            <div className="text-sm text-blue-200/80">Tempo Rimanente</div>
          </div>
        </div>

        {/* Main Content Card */}
        <div
          className={`bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl overflow-hidden mb-8 ${
            transfer.password && !passwordVerified ? 'filter blur-sm pointer-events-none' : ''
          }`}
        >
          {/* Message Section */}
          {transfer.message && (
            <div className="p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-white/10">
              <p className="text-white/90 italic">&ldquo;{transfer.message}&rdquo;</p>
            </div>
          )}

          {/* Files List */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <File className="w-5 h-5 mr-2 text-cyan-400" />
              File nel Transfer
            </h2>

            <div className="space-y-3">
              {transfer.files?.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center min-w-0 flex-1">
                    <FileIcon mimeType={file.mimeType} className="w-8 h-8 flex-shrink-0" />
                    <div className="ml-4 min-w-0">
                      <p className="text-white font-medium truncate">{file.originalName}</p>
                      <p className="text-sm text-blue-200/60">{formatBytes(file.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {isPreviewable(file.mimeType) && (
                      <button
                        onClick={() => setPreviewFile(file)}
                        className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all flex items-center"
                        title="Anteprima"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDownloadFile(file)}
                      disabled={downloadingFileId === file.id}
                      className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all flex items-center disabled:opacity-50"
                      title="Scarica"
                    >
                      {downloadingFileId === file.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Download All Button */}
          <div className="p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-t border-white/10">
            <button
              onClick={handleDownloadAll}
              disabled={downloading || (!!transfer.password && !passwordVerified)}
              className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Download in corso...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Scarica Tutti i File ({formatBytes(transfer.totalSize)})
                </>
              )}
            </button>
          </div>
        </div>

        {/* Security Info */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {transfer.isEncrypted ? (
                <Shield className="w-6 h-6 text-green-400" />
              ) : (
                <CheckCircle className="w-6 h-6 text-green-400" />
              )}
            </div>
            <div className="ml-4">
              <h4 className="text-white font-semibold mb-1">
                {transfer.isEncrypted ? 'Crittografia End-to-End Attiva' : 'Transfer Sicuro'}
              </h4>
              <p className="text-blue-200/70 text-sm">
                {transfer.isEncrypted ? (
                  <>
                    I file sono protetti con crittografia AES-256-GCM end-to-end.
                    La decrittazione avviene direttamente nel tuo browser per la massima sicurezza.
                  </>
                ) : (
                  <>
                    Questo trasferimento utilizza una connessione sicura HTTPS.
                    I file vengono automaticamente eliminati dopo la scadenza.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Footer - Powered by FlyFile */}
        {(brand?.showPoweredBy !== false) && (
          <div className="mt-8 text-center">
            <p className="text-blue-200/50 text-sm">
              Powered by{' '}
              <a href="https://flyfile.it" className="text-cyan-400 hover:text-cyan-300 font-medium">
                FlyFile
              </a>
            </p>
          </div>
        )}
      </div>

      {/* File Preview Modal */}
      {previewFile && transfer && (
        <FilePreviewModal
          file={previewFile}
          transferId={transfer.id}
          onClose={() => setPreviewFile(null)}
          onDownload={handleDownloadFile}
          isDownloading={downloadingFileId === previewFile.id}
        />
      )}
    </div>
  );
}
