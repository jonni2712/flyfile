'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import {
  X,
  Download,
  Loader2,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  File,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCw
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TransferFile } from '@/types';
import { decryptFile, isEncryptionSupported } from '@/lib/client-encryption';

interface FilePreviewModalProps {
  file: TransferFile;
  transferId: string;
  isEncrypted?: boolean;
  onClose: () => void;
  onDownload: (file: TransferFile) => void;
  isDownloading: boolean;
}

export default function FilePreviewModal({
  file,
  transferId,
  isEncrypted,
  onClose,
  onDownload,
  isDownloading
}: FilePreviewModalProps) {
  const t = useTranslations('filePreview');
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, true);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);

  const getFileType = (mimeType: string): 'image' | 'pdf' | 'video' | 'audio' | 'text' | 'unsupported' => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (
      mimeType.startsWith('text/') ||
      mimeType === 'application/json' ||
      mimeType === 'application/xml' ||
      mimeType === 'application/javascript'
    ) {
      return 'text';
    }
    return 'unsupported';
  };

  const fileType = getFileType(file.mimeType);

  // Check if file is encrypted
  const fileIsEncrypted = file.isEncrypted || isEncrypted;
  const canDecrypt = fileIsEncrypted && file.encryptionKey && file.encryptionIv && isEncryptionSupported();

  // Fetch preview URL (handles both encrypted and plain files)
  useEffect(() => {
    const fetchPreview = async () => {
      if (fileType === 'unsupported') {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/files/download-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transferId,
            fileId: file.id,
            path: file.path,
            preview: true,
          }),
        });

        if (!response.ok) {
          throw new Error(t('loadError'));
        }

        const { downloadUrl } = await response.json();

        // If file is encrypted, decrypt client-side and create blob URL
        if (fileIsEncrypted && canDecrypt) {
          const encryptedResponse = await fetch(downloadUrl);
          if (!encryptedResponse.ok) throw new Error(t('encryptedError'));

          const encryptedBlob = await encryptedResponse.blob();
          const decryptedBlob = await decryptFile(
            encryptedBlob,
            file.encryptionKey!,
            file.encryptionIv!,
            file.mimeType
          );
          const blobUrl = URL.createObjectURL(decryptedBlob);
          setPreviewUrl(blobUrl);
        } else if (fileIsEncrypted && !canDecrypt) {
          setError(t('encryptedUnavailable'));
        } else {
          setPreviewUrl(downloadUrl);
        }
      } catch (err) {
        console.error('Preview error:', err);
        setError(t('fileLoadError'));
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();

    // Cleanup blob URLs on unmount
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, transferId, fileType, fileIsEncrypted, canDecrypt]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const formatBytes = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full" role="status" aria-busy="true">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" aria-hidden="true" />
          <p className="text-gray-500">{t('loading')}</p>
        </div>
      );
    }

    if (error || !previewUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <File className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">{error || t('unavailable')}</p>
          <button
            onClick={() => onDownload(file)}
            className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-full transition-colors flex items-center text-sm font-medium"
          >
            <Download className="w-4 h-4 mr-2" />
            {t('downloadToView')}
          </button>
        </div>
      );
    }

    switch (fileType) {
      case 'image':
        return (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <img
              src={previewUrl}
              alt={file.originalName}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{
                transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`
              }}
            />
          </div>
        );

      case 'pdf':
        return (
          <iframe
            src={`${previewUrl}#toolbar=0`}
            className="w-full h-full border-0 rounded-xl"
            title={file.originalName}
          />
        );

      case 'video':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <video
              src={previewUrl}
              controls
              className="max-w-full max-h-full rounded-xl"
              autoPlay={false}
            >
              {t('videoNotSupported')}
            </video>
          </div>
        );

      case 'audio':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <FileAudio className="w-24 h-24 text-purple-400 mb-8" />
            <audio src={previewUrl} controls className="w-full max-w-md">
              {t('audioNotSupported')}
            </audio>
          </div>
        );

      case 'text':
        return (
          <TextPreview url={previewUrl} fileName={file.originalName} />
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <File className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">{t('unsupportedType')}</p>
            <button
              onClick={() => onDownload(file)}
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-full transition-colors flex items-center text-sm font-medium"
            >
              <Download className="w-4 h-4 mr-2" />
              {t('downloadToView')}
            </button>
          </div>
        );
    }
  };

  const fileTypeIcon = () => {
    switch (fileType) {
      case 'image': return <FileImage className="w-5 h-5 text-pink-500 mr-3 flex-shrink-0" />;
      case 'pdf': return <FileText className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />;
      case 'video': return <FileVideo className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" />;
      case 'audio': return <FileAudio className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />;
      case 'text': return <FileText className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />;
      default: return <File className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />;
    }
  };

  return (
    <div ref={modalRef} role="dialog" aria-modal="true" aria-label={file.originalName} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center min-w-0 flex-1">
          {fileTypeIcon()}
          <div className="min-w-0">
            <h3 className="text-gray-900 font-medium truncate">{file.originalName}</h3>
            <p className="text-sm text-gray-400">{formatBytes(file.size)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 ml-4">
          {/* Image zoom controls — hidden on mobile (use pinch-to-zoom) */}
          {fileType === 'image' && previewUrl && (
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => setImageZoom(z => Math.max(0.5, z - 0.25))}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={t('zoomOut')}
                title={t('zoomOut')}
              >
                <ZoomOut className="w-5 h-5" aria-hidden="true" />
              </button>
              <span className="text-gray-500 text-sm min-w-[3rem] text-center" aria-live="polite">
                {Math.round(imageZoom * 100)}%
              </span>
              <button
                onClick={() => setImageZoom(z => Math.min(3, z + 0.25))}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={t('zoomIn')}
                title={t('zoomIn')}
              >
                <ZoomIn className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                onClick={() => setImageRotation(r => (r + 90) % 360)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={t('rotate')}
                title={t('rotate')}
              >
                <RotateCw className="w-5 h-5" aria-hidden="true" />
              </button>
              <div className="w-px h-6 bg-gray-200 mx-1" />
            </div>
          )}

          {previewUrl && !previewUrl.startsWith('blob:') && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={t('openInNewTab')}
              title={t('openInNewTab')}
            >
              <ExternalLink className="w-5 h-5" aria-hidden="true" />
            </a>
          )}

          <button
            onClick={() => onDownload(file)}
            disabled={isDownloading}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-full transition-colors flex items-center text-sm font-medium disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                {t('download')}
              </>
            )}
          </button>

          <button
            onClick={onClose}
            aria-label={t('close') || 'Close preview'}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-hidden p-4">
        {renderPreview()}
      </div>
    </div>
  );
}

// Text file preview component
function TextPreview({ url, fileName }: { url: string; fileName: string }) {
  const t = useTranslations('filePreview');
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(url);
        const text = await response.text();
        setContent(text.substring(0, 100000));
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [url]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">{t('contentLoadError')}</p>
      </div>
    );
  }

  const isCode = /\.(js|ts|jsx|tsx|py|java|cpp|c|h|cs|go|rb|php|swift|kt|rs|json|xml|html|css|scss|sass|less|yaml|yml|md|sql|sh|bash|zsh|ps1)$/i.test(fileName);

  return (
    <div className="w-full h-full overflow-auto">
      <pre className={`p-4 rounded-2xl ${isCode ? 'bg-gray-900' : 'bg-gray-800'} text-sm`}>
        <code className={`text-white/90 whitespace-pre-wrap break-words ${isCode ? 'font-mono' : ''}`}>
          {content}
        </code>
      </pre>
    </div>
  );
}
