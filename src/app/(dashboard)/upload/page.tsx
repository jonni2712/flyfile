'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import { Upload, X, File, Check, AlertCircle } from 'lucide-react';
import { PLANS } from '@/types';

interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  shareLink?: string;
}

export default function UploadPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const plan = userProfile ? PLANS[userProfile.plan] || PLANS.free : PLANS.free;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
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
    const uploadFiles: UploadFile[] = newFiles.map((file) => {
      return {
        file,
        progress: 0,
        status: 'pending' as const,
      };
    });

    setFiles((prev) => [...prev, ...uploadFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadFile = async (index: number) => {
    const fileToUpload = files[index];
    if (fileToUpload.status !== 'pending') return;

    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, status: 'uploading' as const } : f))
    );

    try {
      // Get presigned upload URL from our API
      const response = await fetch('/api/files/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: fileToUpload.file.name,
          contentType: fileToUpload.file.type,
          fileSize: fileToUpload.file.size,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, fileId, shareLink } = await response.json();

      // Upload directly to R2
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: fileToUpload.file,
        headers: {
          'Content-Type': fileToUpload.file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      // Confirm upload completion
      await fetch('/api/files/confirm-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId }),
      });

      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? { ...f, status: 'completed' as const, progress: 100, shareLink }
            : f
        )
      );
    } catch (error) {
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? { ...f, status: 'error' as const, error: 'Upload failed. Please try again.' }
            : f
        )
      );
    }
  };

  const uploadAllFiles = async () => {
    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'pending') {
        await handleUploadFile(i);
      }
    }
  };

  const copyShareLink = (link: string) => {
    navigator.clipboard.writeText(link);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const completedCount = files.filter((f) => f.status === 'completed').length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Carica File</h1>
        <p className="text-gray-600 mt-1">
          Trascina i file qui o clicca per selezionarli. Dimensione file illimitata.
        </p>
      </div>

      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg text-gray-600 mb-2">
          Drag and drop your files here
        </p>
        <p className="text-sm text-gray-500 mb-4">or</p>
        <label className="cursor-pointer">
          <span className="inline-flex items-center justify-center font-medium rounded-lg transition-colors px-4 py-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-50">
            Browse Files
          </span>
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Files ({completedCount}/{files.length} uploaded)
            </h2>
            {pendingCount > 0 && (
              <Button onClick={uploadAllFiles}>
                Upload All ({pendingCount})
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {files.map((fileItem, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4"
              >
                <File className="w-8 h-8 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fileItem.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatBytes(fileItem.file.size)}
                  </p>
                  {fileItem.status === 'error' && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      {fileItem.error}
                    </p>
                  )}
                  {fileItem.shareLink && (
                    <button
                      onClick={() => copyShareLink(fileItem.shareLink!)}
                      className="text-xs text-blue-600 hover:underline mt-1"
                    >
                      Copy share link
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {fileItem.status === 'pending' && (
                    <Button size="sm" onClick={() => handleUploadFile(index)}>
                      Upload
                    </Button>
                  )}
                  {fileItem.status === 'uploading' && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  )}
                  {fileItem.status === 'completed' && (
                    <Check className="w-5 h-5 text-green-600" />
                  )}
                  {fileItem.status !== 'uploading' && (
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
