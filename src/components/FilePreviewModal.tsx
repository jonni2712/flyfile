'use client';

import { useState, useEffect } from 'react';
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
import { TransferFile } from '@/types';

interface FilePreviewModalProps {
  file: TransferFile;
  transferId: string;
  onClose: () => void;
  onDownload: (file: TransferFile) => void;
  isDownloading: boolean;
}

export default function FilePreviewModal({
  file,
  transferId,
  onClose,
  onDownload,
  isDownloading
}: FilePreviewModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);

  // Determine file type for preview
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

  // Fetch preview URL
  useEffect(() => {
    const fetchPreviewUrl = async () => {
      // Skip fetching for unsupported types
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
            path: file.path
          }),
        });

        if (!response.ok) {
          throw new Error('Impossibile caricare anteprima');
        }

        const { downloadUrl } = await response.json();
        setPreviewUrl(downloadUrl);
      } catch (err) {
        console.error('Preview error:', err);
        setError('Impossibile caricare l\'anteprima del file');
      } finally {
        setLoading(false);
      }
    };

    fetchPreviewUrl();
  }, [file, transferId, fileType]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Render preview content based on file type
  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
          <p className="text-white/70">Caricamento anteprima...</p>
        </div>
      );
    }

    if (error || !previewUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <File className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-white/70 mb-2">{error || 'Anteprima non disponibile'}</p>
          <button
            onClick={() => onDownload(file)}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Scarica per visualizzare
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
            className="w-full h-full border-0"
            title={file.originalName}
          />
        );

      case 'video':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <video
              src={previewUrl}
              controls
              className="max-w-full max-h-full"
              autoPlay={false}
            >
              Il tuo browser non supporta la riproduzione video.
            </video>
          </div>
        );

      case 'audio':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <FileAudio className="w-24 h-24 text-green-400 mb-8" />
            <audio src={previewUrl} controls className="w-full max-w-md">
              Il tuo browser non supporta la riproduzione audio.
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
            <File className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-white/70 mb-2">Anteprima non disponibile per questo tipo di file</p>
            <button
              onClick={() => onDownload(file)}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Scarica per visualizzare
            </button>
          </div>
        );
    }
  };

  // Format file size
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-white/10">
        <div className="flex items-center min-w-0 flex-1">
          {fileType === 'image' && <FileImage className="w-5 h-5 text-pink-400 mr-3 flex-shrink-0" />}
          {fileType === 'pdf' && <FileText className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />}
          {fileType === 'video' && <FileVideo className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" />}
          {fileType === 'audio' && <FileAudio className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />}
          {fileType === 'text' && <FileText className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />}
          {fileType === 'unsupported' && <File className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />}
          <div className="min-w-0">
            <h3 className="text-white font-medium truncate">{file.originalName}</h3>
            <p className="text-sm text-white/50">{formatBytes(file.size)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          {/* Image zoom controls */}
          {fileType === 'image' && previewUrl && (
            <>
              <button
                onClick={() => setImageZoom(z => Math.max(0.5, z - 0.25))}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-white/70 text-sm min-w-[3rem] text-center">
                {Math.round(imageZoom * 100)}%
              </span>
              <button
                onClick={() => setImageZoom(z => Math.min(3, z + 0.25))}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={() => setImageRotation(r => (r + 90) % 360)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Ruota"
              >
                <RotateCw className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-white/20 mx-2" />
            </>
          )}

          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Apri in nuova scheda"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          )}

          <button
            onClick={() => onDownload(file)}
            disabled={isDownloading}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors flex items-center disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Scarica
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
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
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(url);
        const text = await response.text();
        // Limit content to prevent performance issues
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
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white/70">Impossibile caricare il contenuto del file</p>
      </div>
    );
  }

  // Determine if it's code based on extension
  const isCode = /\.(js|ts|jsx|tsx|py|java|cpp|c|h|cs|go|rb|php|swift|kt|rs|json|xml|html|css|scss|sass|less|yaml|yml|md|sql|sh|bash|zsh|ps1)$/i.test(fileName);

  return (
    <div className="w-full h-full overflow-auto">
      <pre className={`p-4 rounded-lg ${isCode ? 'bg-slate-900' : 'bg-slate-800'} text-sm`}>
        <code className={`text-white/90 whitespace-pre-wrap break-words ${isCode ? 'font-mono' : ''}`}>
          {content}
        </code>
      </pre>
    </div>
  );
}
