'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
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
import SponsorVideoBackground from '@/components/SponsorVideoBackground';
import FilePreviewModal from '@/components/FilePreviewModal';
import { decryptFile, isEncryptionSupported } from '@/lib/client-encryption';
import { useToast } from '@/components/Toast';
import { useFocusTrap } from '@/hooks/useFocusTrap';

// File icon component
const FileIcon = ({ mimeType, className }: { mimeType: string; className?: string }) => {
  const iconType = getFileIcon(mimeType);
  const iconClass = className || 'w-6 h-6';

  switch (iconType) {
    case 'image':
      return <FileImage className={`${iconClass} text-pink-500`} />;
    case 'video':
      return <FileVideo className={`${iconClass} text-purple-500`} />;
    case 'audio':
      return <FileAudio className={`${iconClass} text-green-500`} />;
    case 'pdf':
      return <FileText className={`${iconClass} text-red-500`} />;
    case 'doc':
      return <FileText className={`${iconClass} text-blue-500`} />;
    case 'spreadsheet':
      return <FileText className={`${iconClass} text-emerald-500`} />;
    case 'archive':
      return <FileArchive className={`${iconClass} text-yellow-500`} />;
    default:
      return <File className={`${iconClass} text-gray-400`} />;
  }
};

export default function DownloadPage() {
  const t = useTranslations('download');
  const params = useParams();
  const router = useRouter();
  const transferId = params.id as string;
  const { getPublicTransfer, verifyPassword, incrementDownloadCount } = useTransfer();
  const toast = useToast();

  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);

  // Password state
  const passwordModalRef = useRef<HTMLDivElement>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  useFocusTrap(passwordModalRef, showPasswordModal);

  // File preview state
  const [previewFile, setPreviewFile] = useState<TransferFile | null>(null);

  // Brand customization state
  const [brand, setBrand] = useState<BrandSettings | null>(null);

  // Sponsor video state
  const [hasSponsorVideo, setHasSponsorVideo] = useState(false);

  const fetchBrandSettings = async (userId: string) => {
    try {
      const response = await fetch(`/api/brand?userId=${userId}&public=true`);
      if (response.ok) {
        const data = await response.json();
        if (data.brand && data.canCustomize) {
          setBrand(data.brand);
        }
      }
    } catch (err) {
      console.error('Error fetching brand settings:', err);
    }
  };

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

        if (data.userId) {
          fetchBrandSettings(data.userId);
        }

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
        setPasswordError(t('incorrectPassword'));
      }
    } catch (err) {
      setPasswordError(t('passwordVerifyError'));
    } finally {
      setVerifyingPassword(false);
    }
  };

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
        throw new Error(t('downloadUnavailable'));
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
      toast.error(t('downloadError'));
    } finally {
      setDownloading(false);
    }
  };

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
        throw new Error(errorData.error || t('downloadUnavailable'));
      }

      const { downloadUrl } = await response.json();

      if (isFileEncrypted && encryptionKey && encryptionIv && isEncryptionSupported()) {
        const encryptedResponse = await fetch(downloadUrl);
        if (!encryptedResponse.ok) {
          throw new Error(t('encryptedDownloadError'));
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
      toast.error(t('downloadError'));
    } finally {
      setDownloadingFileId(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
        <div className="text-center relative z-10">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white/70">{t('loadingTransfer')}</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (error === 'not_found') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center px-4">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{t('notFoundTitle')}</h1>
            <p className="text-gray-500 text-sm mb-6">
              {t('notFoundDescription')}
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-2.5 bg-[#409cff] hover:bg-[#2d8ae8] text-white font-medium rounded-full text-sm transition-colors"
            >
              {t('backToHome')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Expired state
  if (error === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center px-4">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{t('expiredTitle')}</h1>
            <p className="text-gray-500 text-sm mb-6">
              {t('expiredDescription')}
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-2.5 bg-[#409cff] hover:bg-[#2d8ae8] text-white font-medium rounded-full text-sm transition-colors"
            >
              {t('backToHome')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!transfer) return null;

  // Check if brand is active with custom background
  const hasBrandBg = brand?.backgroundType === 'image' || brand?.backgroundType === 'video' || (brand?.backgroundType === 'gradient' && brand.primaryColor);

  const getBackgroundStyle = () => {
    if (brand?.backgroundType === 'gradient' && brand.primaryColor && brand.secondaryColor) {
      return {
        background: `linear-gradient(135deg, ${brand.primaryColor}, ${brand.secondaryColor})`,
      };
    }
    return {};
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${!hasBrandBg ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500' : ''}`}
      style={hasBrandBg ? getBackgroundStyle() : undefined}
    >
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

      {/* Overlay for branded backgrounds */}
      {hasBrandBg && <div className="absolute inset-0 bg-black/40" />}

      {/* Sponsor video background (when no brand customization) */}
      {!hasBrandBg && (
        <SponsorVideoBackground onLoad={() => setHasSponsorVideo(true)} />
      )}

      {/* Decorative circles (default only, no brand and no sponsor) */}
      {!hasBrandBg && !hasSponsorVideo && (
        <>
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
        </>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div ref={passwordModalRef} role="dialog" aria-modal="true" aria-label={t('protectedTitle')} className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{t('protectedTitle')}</h3>
              <p className="text-gray-500 text-sm">{t('protectedDescription')}</p>
            </div>

            <form onSubmit={handleVerifyPassword}>
              <div className="mb-4">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="transfer-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-transparent border-b border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#409cff] transition-all text-sm"
                    placeholder={t('passwordPlaceholder')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-sm text-red-600 mt-2">{passwordError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={verifyingPassword}
                className="w-full py-3 bg-[#409cff] hover:bg-[#2d8ae8] text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {verifyingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('verifying')}
                  </>
                ) : (
                  t('verifyPassword')
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        {/* Left Panel — Download Card */}
        <div className="w-full lg:w-[480px] lg:min-w-[480px] flex flex-col items-center justify-center px-6 py-8 flex-shrink-0">
          {/* Custom Logo */}
          {brand?.logoUrl && (
            <div className="mb-6">
              <img
                src={brand.logoUrl}
                alt={brand.companyName || 'Logo'}
                className="h-12 md:h-16 mx-auto object-contain"
              />
            </div>
          )}

          {/* White Download Card */}
          <div className="relative w-full max-w-[420px]">
            <div
              className={`bg-white rounded-2xl shadow-lg w-full ${
                transfer.password && !passwordVerified ? 'filter blur-sm pointer-events-none' : ''
              }`}
            >
              {/* Card Header — sender + title */}
              <div className="p-6 pb-0">
                <div className="flex items-center gap-3 mb-3">
                  {!brand?.logoUrl && (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Cloud className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500 truncate">
                      {brand?.companyName || transfer.senderName || t('user')}
                    </p>
                    <h1 className="text-lg font-bold text-gray-900 truncate">{transfer.title}</h1>
                  </div>
                </div>

                {/* Message */}
                {transfer.message && (
                  <p className="text-sm text-gray-600 italic border-l-2 border-gray-200 pl-3 mb-1">
                    {transfer.message}
                  </p>
                )}

                {/* Custom brand message */}
                {brand?.customMessage && (
                  <p className="text-sm text-gray-500 mb-1">
                    {brand.customMessage}
                  </p>
                )}
              </div>

              {/* Stats row */}
              <div className="px-6 py-3 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <File className="w-4 h-4" />
                  <span className="text-sm">{t('fileCount', { count: transfer.fileCount })}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <HardDrive className="w-4 h-4" />
                  <span className="text-sm">{formatBytes(transfer.totalSize)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{getTimeRemaining(transfer.expiresAt)}</span>
                </div>
              </div>

              {/* Files list */}
              <div className="p-4">
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {transfer.files?.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-gray-50 group transition-colors"
                    >
                      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileIcon mimeType={file.mimeType} className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-800 truncate">{file.originalName}</p>
                        <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {isPreviewable(file.mimeType) && (
                          <button
                            onClick={() => setPreviewFile(file)}
                            className="p-1.5 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                            title={t('preview')}
                          >
                            <Search className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDownloadFile(file)}
                          disabled={downloadingFileId === file.id}
                          className="p-1.5 text-gray-300 hover:text-[#409cff] hover:bg-blue-50 rounded-full transition-all disabled:opacity-50"
                          title={t('download')}
                        >
                          {downloadingFileId === file.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#409cff]" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security badge */}
              <div className="mx-4 mb-3 flex items-center gap-2 text-xs text-gray-400">
                {transfer.isEncrypted ? (
                  <>
                    <Shield className="w-3.5 h-3.5 text-green-500" />
                    <span>{t('encryptionBadge')}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    <span>{t('httpsSecure')}</span>
                  </>
                )}
              </div>

              {/* Download All Button */}
              <div className="px-4 pb-4">
                <button
                  onClick={handleDownloadAll}
                  disabled={downloading || (!!transfer.password && !passwordVerified)}
                  className="w-full bg-[#409cff] hover:bg-[#2d8ae8] text-white py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('downloading')}
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      {t('downloadAll')} {transfer.fileCount > 1 ? `${t('downloadAllFiles')} (${formatBytes(transfer.totalSize)})` : `(${formatBytes(transfer.totalSize)})`}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Tagline below card */}
          <div className="mt-6 text-center">
            {(brand?.showPoweredBy !== false) && (
              <p className="text-sm text-white/70">
                {brand ? t('poweredBy') : t('promoText')}
                <Link href="/" className="text-white font-medium hover:underline">
                  FlyFile
                </Link>
                {!brand && t('promoSuffix')}
              </p>
            )}
          </div>
        </div>

        {/* Right Panel — Ad space (only when NOT branded) */}
        {!hasBrandBg && (
          <div id="download-ad-container-desktop" className="hidden lg:flex flex-1 flex-col items-center justify-center px-12">
            {/* Inserire qui il contenuto pubblicitario */}
          </div>
        )}
      </div>

      {/* Bottom Ad space — mobile only, only when NOT branded */}
      {!hasBrandBg && (
        <div id="download-ad-container-mobile" className="lg:hidden relative z-10 flex-1 min-h-[250px] flex flex-col items-center justify-center px-6 pb-8">
          {/* Inserire qui il contenuto pubblicitario mobile */}
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && transfer && (
        <FilePreviewModal
          file={previewFile}
          transferId={transfer.id}
          isEncrypted={transfer.isEncrypted}
          onClose={() => setPreviewFile(null)}
          onDownload={handleDownloadFile}
          isDownloading={downloadingFileId === previewFile.id}
        />
      )}
    </div>
  );
}
