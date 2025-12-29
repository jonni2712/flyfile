'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Download, File, AlertCircle, Lock, Calendar, Hash } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface FileInfo {
  originalName: string;
  size: number;
  mimeType: string;
  downloadCount: number;
  maxDownloads?: number;
  expiresAt?: Date;
  hasPassword: boolean;
  isPublic: boolean;
}

export default function SharePage() {
  const params = useParams();
  const fileId = params.id as string;

  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    fetchFileInfo();
  }, [fileId]);

  const fetchFileInfo = async () => {
    try {
      const fileDoc = await getDoc(doc(db, 'files', fileId));

      if (!fileDoc.exists()) {
        setError('File not found');
        setLoading(false);
        return;
      }

      const data = fileDoc.data();

      // Check if file is public
      if (!data.isPublic) {
        setError('This file is private');
        setLoading(false);
        return;
      }

      // Check if expired
      if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
        setError('This file has expired');
        setLoading(false);
        return;
      }

      // Check download limit
      if (data.maxDownloads && data.downloadCount >= data.maxDownloads) {
        setError('Download limit reached');
        setLoading(false);
        return;
      }

      setFileInfo({
        originalName: data.originalName,
        size: data.size,
        mimeType: data.mimeType,
        downloadCount: data.downloadCount,
        maxDownloads: data.maxDownloads,
        expiresAt: data.expiresAt?.toDate(),
        hasPassword: !!data.password,
        isPublic: data.isPublic,
      });
    } catch (err) {
      setError('Failed to load file information');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    setError('');

    try {
      const response = await fetch(`/api/files/download-url?fileId=${fileId}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Download failed');
      }

      const { downloadUrl, fileName } = await response.json();

      // Trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update local download count
      if (fileInfo) {
        setFileInfo({
          ...fileInfo,
          downloadCount: fileInfo.downloadCount + 1,
        });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Download failed';
      setError(errorMessage);
    } finally {
      setDownloading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !fileInfo) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!fileInfo) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <File className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 break-all">
            {fileInfo.originalName}
          </h1>
          <p className="text-gray-500 mt-1">{formatBytes(fileInfo.size)}</p>
        </div>

        {/* File Details */}
        <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-gray-500">
              <Download className="w-4 h-4" />
              Downloads
            </span>
            <span className="text-gray-900">
              {fileInfo.downloadCount}
              {fileInfo.maxDownloads && ` / ${fileInfo.maxDownloads}`}
            </span>
          </div>

          {fileInfo.expiresAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-500">
                <Calendar className="w-4 h-4" />
                Expires
              </span>
              <span className="text-gray-900">
                {fileInfo.expiresAt.toLocaleDateString()}
              </span>
            </div>
          )}

          {fileInfo.hasPassword && (
            <div className="flex items-center gap-2 text-sm text-yellow-600">
              <Lock className="w-4 h-4" />
              Password protected
            </div>
          )}
        </div>

        {/* Password Input */}
        {fileInfo.hasPassword && (
          <div className="mb-6">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Download Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleDownload}
          loading={downloading}
          disabled={fileInfo.hasPassword && !password}
        >
          <Download className="w-5 h-5 mr-2" />
          Download File
        </Button>

        {/* Branding */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Shared via FlyFile
        </p>
      </div>
    </div>
  );
}
