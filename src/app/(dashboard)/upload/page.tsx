'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Upload, X, File, Check, AlertCircle, Lock, Mail, Link2, Clock, Shield, Plus, Image, Video, FileText } from 'lucide-react';

interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  shareLink?: string;
}

// Generate unique anonymous ID
const generateAnonymousId = (): string => {
  return 'anon_' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function UploadPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'link'>('link');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState(''); // For anonymous users
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [expiryDays, setExpiryDays] = useState('3');
  const [anonymousId] = useState(() => generateAnonymousId()); // Unique ID per session

  const isAnonymous = !user;

  useEffect(() => {
    if (!loading && user && userProfile) {
      setSenderName(userProfile.displayName || '');
    }
  }, [user, userProfile, loading]);

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
    const uploadFiles: UploadFile[] = newFiles.map((file) => ({
      file,
      progress: 0,
      status: 'pending' as const,
    }));
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
      const response = await fetch('/api/files/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: fileToUpload.file.name,
          contentType: fileToUpload.file.type,
          fileSize: fileToUpload.file.size,
          userId: user?.uid || anonymousId,
          isAnonymous: !user,
          senderEmail: !user ? senderEmail : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, fileId, shareLink } = await response.json();

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
            ? { ...f, status: 'error' as const, error: 'Upload fallito. Riprova.' }
            : f
        )
      );
    }
  };

  const uploadAllFiles = async () => {
    // Validate anonymous user has email
    if (isAnonymous && !senderEmail) {
      alert('Per favore inserisci la tua email per procedere con il caricamento.');
      return;
    }

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center -mt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const completedCount = files.filter((f) => f.status === 'completed').length;

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
            />

            {files.length === 0 ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full mb-6 animate-bounce">
                  <Upload className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Trascina i file qui</h3>
                <p className="text-blue-100/70 mb-6">oppure clicca per selezionarli</p>
                <button
                  type="button"
                  onClick={() => document.getElementById('fileInput')?.click()}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="w-5 h-5 inline-block mr-2" />
                  Seleziona File
                </button>
                <p className="text-xs text-blue-200/60 mt-4">Dimensione file illimitata • Tutti i formati supportati</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    File ({completedCount}/{files.length} caricati)
                  </h3>
                  <button
                    type="button"
                    onClick={() => document.getElementById('fileInput')?.click()}
                    className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                  >
                    + Aggiungi altri
                  </button>
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
                          {fileItem.status === 'error' && (
                            <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
                              <AlertCircle className="w-3 h-3" />
                              {fileItem.error}
                            </p>
                          )}
                          {fileItem.shareLink && (
                            <button
                              onClick={() => copyShareLink(fileItem.shareLink!)}
                              className="text-xs text-cyan-400 hover:underline mt-1"
                            >
                              Copia link di condivisione
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-3">
                        {fileItem.status === 'pending' && (
                          <button
                            onClick={() => handleUploadFile(index)}
                            className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-medium hover:bg-cyan-500/30 transition-colors"
                          >
                            Carica
                          </button>
                        )}
                        {fileItem.status === 'uploading' && (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-400"></div>
                        )}
                        {fileItem.status === 'completed' && (
                          <Check className="w-5 h-5 text-green-400" />
                        )}
                        {fileItem.status !== 'uploading' && (
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
                    className="hidden"
                  />
                  <div className={`w-5 h-5 border-2 rounded-full mr-3 ${
                    deliveryMethod === 'email' ? 'border-cyan-400 bg-cyan-400' : 'border-white/40'
                  }`}></div>
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
                    className="hidden"
                  />
                  <div className={`w-5 h-5 border-2 rounded-full mr-3 ${
                    deliveryMethod === 'link' ? 'border-cyan-400 bg-cyan-400' : 'border-white/40'
                  }`}></div>
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
                  Stai caricando come utente anonimo. Inserisci la tua email per ricevere il link di download.
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="senderEmail" className="block text-sm font-semibold text-white mb-2">
                      La tua Email *
                    </label>
                    <input
                      type="email"
                      id="senderEmail"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
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
                      className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
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
                    Email Destinatario
                  </label>
                  <input
                    type="email"
                    id="recipientEmail"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
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
                      className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
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
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all resize-none"
                placeholder="Aggiungi un messaggio per il destinatario..."
              />
            </div>

            {/* Advanced Options */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                  <Lock className="w-4 h-4 inline-block mr-1" />
                  Password (Opzionale)
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                  placeholder="Proteggi con password"
                />
              </div>

              {/* Expiry */}
              <div>
                <label htmlFor="expiryDays" className="block text-sm font-semibold text-white mb-2">
                  <Clock className="w-4 h-4 inline-block mr-1" />
                  Scadenza
                </label>
                <select
                  id="expiryDays"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                  className="w-full h-12 px-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all appearance-none cursor-pointer"
                >
                  <option value="1" className="bg-slate-900">1 Giorno</option>
                  <option value="3" className="bg-slate-900">3 Giorni</option>
                  <option value="7" className="bg-slate-900">1 Settimana</option>
                  <option value="14" className="bg-slate-900">2 Settimane</option>
                  <option value="30" className="bg-slate-900">1 Mese</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={uploadAllFiles}
                disabled={pendingCount === 0}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center group"
              >
                <Upload className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
                {pendingCount > 0 ? `Carica ${pendingCount} File` : 'Seleziona file da caricare'}
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
