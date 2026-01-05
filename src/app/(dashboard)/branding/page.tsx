'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Palette,
  Image,
  Video,
  Upload,
  Trash2,
  Save,
  Eye,
  Crown,
  ArrowLeft,
  Loader2,
  Check,
  X,
  Building2,
  Type,
  MessageSquare,
} from 'lucide-react';
import { getPlanLimits, BrandSettings } from '@/types';

export default function BrandingPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  // Brand settings state
  const [brand, setBrand] = useState<BrandSettings>({
    backgroundType: 'gradient',
    primaryColor: '#06b6d4',
    secondaryColor: '#8b5cf6',
    showPoweredBy: true,
  });
  const [originalBrand, setOriginalBrand] = useState<BrandSettings | null>(null);

  // UI state
  const [loadingBrand, setLoadingBrand] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [canCustomize, setCanCustomize] = useState(false);
  const [canRemovePoweredBy, setCanRemovePoweredBy] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // File input refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchBrandSettings();
    }
  }, [user]);

  const fetchBrandSettings = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/brand?userId=${user.uid}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCanCustomize(data.canCustomize);
        setCanRemovePoweredBy(data.canRemovePoweredBy);

        if (data.brand) {
          setBrand({
            ...data.brand,
            backgroundType: data.brand.backgroundType || 'gradient',
            showPoweredBy: data.brand.showPoweredBy ?? true,
          });
          setOriginalBrand(data.brand);
        }
      }
    } catch (error) {
      console.error('Error fetching brand settings:', error);
    } finally {
      setLoadingBrand(false);
    }
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/brand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.uid,
          brand,
        }),
      });

      if (response.ok) {
        showMessage('Impostazioni brand salvate!', 'success');
        setOriginalBrand(brand);
      } else {
        const data = await response.json();
        showMessage(data.error || 'Errore nel salvataggio', 'error');
      }
    } catch (error) {
      showMessage('Errore nel salvataggio delle impostazioni', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (
    file: File,
    assetType: 'logo' | 'background' | 'backgroundVideo'
  ) => {
    if (!user) return;

    // Validate file size (max 10MB for images, 50MB for videos)
    const maxSize = assetType === 'backgroundVideo' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showMessage(
        `File troppo grande. Massimo ${assetType === 'backgroundVideo' ? '50' : '10'}MB.`,
        'error'
      );
      return;
    }

    setUploading(assetType);
    try {
      const token = await user.getIdToken();

      // Get presigned upload URL
      const response = await fetch('/api/brand', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.uid,
          assetType,
          contentType: file.type,
          fileName: file.name,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Errore upload');
      }

      const { uploadUrl, r2Key, publicUrl } = await response.json();

      // Upload file to R2
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Errore durante il caricamento');
      }

      // Update brand state with new URLs
      const updates: Partial<BrandSettings> = {};

      if (assetType === 'logo') {
        updates.logoUrl = publicUrl;
        updates.logoPath = r2Key;
      } else if (assetType === 'background') {
        updates.backgroundUrl = publicUrl;
        updates.backgroundPath = r2Key;
        updates.backgroundType = 'image';
      } else if (assetType === 'backgroundVideo') {
        updates.backgroundVideoUrl = publicUrl;
        updates.backgroundVideoPath = r2Key;
        updates.backgroundType = 'video';
      }

      setBrand((prev) => ({ ...prev, ...updates }));
      showMessage('File caricato con successo!', 'success');
    } catch (error) {
      console.error('Upload error:', error);
      showMessage(
        error instanceof Error ? error.message : 'Errore durante il caricamento',
        'error'
      );
    } finally {
      setUploading(null);
    }
  };

  const handleDeleteAsset = async (assetType: 'logo' | 'background' | 'backgroundVideo') => {
    if (!user) return;

    if (!confirm('Sei sicuro di voler rimuovere questo asset?')) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(
        `/api/brand?userId=${user.uid}&assetType=${assetType}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Update local state
        const updates: Partial<BrandSettings> = {};

        if (assetType === 'logo') {
          updates.logoUrl = undefined;
          updates.logoPath = undefined;
        } else if (assetType === 'background') {
          updates.backgroundUrl = undefined;
          updates.backgroundPath = undefined;
          updates.backgroundType = 'gradient';
        } else if (assetType === 'backgroundVideo') {
          updates.backgroundVideoUrl = undefined;
          updates.backgroundVideoPath = undefined;
          updates.backgroundType = 'gradient';
        }

        setBrand((prev) => ({ ...prev, ...updates }));
        showMessage('Asset rimosso con successo!', 'success');
      } else {
        const data = await response.json();
        showMessage(data.error || 'Errore nella rimozione', 'error');
      }
    } catch (error) {
      showMessage('Errore nella rimozione dell\'asset', 'error');
    }
  };

  if (loading || loadingBrand) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  // Show upgrade prompt if user can't customize branding
  if (!canCustomize) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna alla Dashboard
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Branding Personalizzato
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Personalizza la pagina di download con il tuo logo e i colori del tuo brand.
              Questa funzionalità è disponibile per i piani Pro e Business.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 className="font-semibold text-gray-900 mb-2">Piano Pro</h3>
                <ul className="text-sm text-gray-600 space-y-2 text-left mb-4">
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Logo personalizzato
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Sfondo immagine/video
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Colori personalizzati
                  </li>
                  <li className="flex items-center text-gray-400">
                    <X className="w-4 h-4 mr-2" />
                    Mostra &quot;Powered by FlyFile&quot;
                  </li>
                </ul>
                <p className="text-2xl font-bold text-gray-900">€12/mese</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                <h3 className="font-semibold text-gray-900 mb-2">Piano Business</h3>
                <ul className="text-sm text-gray-600 space-y-2 text-left mb-4">
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Logo personalizzato
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Sfondo immagine/video
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Colori personalizzati
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Rimuovi &quot;Powered by FlyFile&quot;
                  </li>
                </ul>
                <p className="text-2xl font-bold text-gray-900">€20/mese</p>
              </div>
            </div>

            <Link
              href="/pricing"
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
            >
              Passa a Pro o Business
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const hasChanges = JSON.stringify(brand) !== JSON.stringify(originalBrand);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna alla Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Palette className="w-8 h-8 mr-3 text-purple-600" />
              Branding Personalizzato
            </h1>
            <p className="text-gray-600 mt-2">
              Personalizza l&apos;aspetto della tua pagina di download
            </p>
          </div>

          <button
            onClick={() => setShowPreview(true)}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4 mr-2" />
            Anteprima
          </button>
        </div>

        {/* Message Toast */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="w-5 h-5 mr-2" />
            ) : (
              <X className="w-5 h-5 mr-2" />
            )}
            {message.text}
          </div>
        )}

        {/* Logo Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Image className="w-5 h-5 mr-2 text-blue-600" />
            Logo
          </h2>

          <div className="flex items-start gap-6">
            {/* Logo Preview */}
            <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
              {brand.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <Image className="w-8 h-8 mx-auto mb-1" />
                  <span className="text-xs">Nessun logo</span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-4">
                Carica il logo del tuo brand. Formati supportati: JPEG, PNG, GIF, WebP, SVG.
                Dimensione massima: 10MB.
              </p>

              <div className="flex gap-3">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'logo');
                    e.target.value = '';
                  }}
                  className="hidden"
                />
                <button
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploading === 'logo'}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {uploading === 'logo' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Carica Logo
                </button>

                {brand.logoUrl && (
                  <button
                    onClick={() => handleDeleteAsset('logo')}
                    className="inline-flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Rimuovi
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Background Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Video className="w-5 h-5 mr-2 text-purple-600" />
            Sfondo
          </h2>

          {/* Background Type Selector */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setBrand((prev) => ({ ...prev, backgroundType: 'gradient' }))}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                brand.backgroundType === 'gradient'
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Gradiente
            </button>
            <button
              onClick={() => setBrand((prev) => ({ ...prev, backgroundType: 'image' }))}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                brand.backgroundType === 'image'
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Immagine
            </button>
            <button
              onClick={() => setBrand((prev) => ({ ...prev, backgroundType: 'video' }))}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                brand.backgroundType === 'video'
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Video
            </button>
          </div>

          {/* Gradient Colors */}
          {brand.backgroundType === 'gradient' && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Colore Primario
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brand.primaryColor || '#06b6d4'}
                    onChange={(e) =>
                      setBrand((prev) => ({ ...prev, primaryColor: e.target.value }))
                    }
                    className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brand.primaryColor || '#06b6d4'}
                    onChange={(e) =>
                      setBrand((prev) => ({ ...prev, primaryColor: e.target.value }))
                    }
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
                    placeholder="#06b6d4"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Colore Secondario
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brand.secondaryColor || '#8b5cf6'}
                    onChange={(e) =>
                      setBrand((prev) => ({ ...prev, secondaryColor: e.target.value }))
                    }
                    className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brand.secondaryColor || '#8b5cf6'}
                    onChange={(e) =>
                      setBrand((prev) => ({ ...prev, secondaryColor: e.target.value }))
                    }
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
                    placeholder="#8b5cf6"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Image Upload */}
          {brand.backgroundType === 'image' && (
            <div>
              <div className="w-full h-48 bg-gray-100 rounded-xl mb-4 overflow-hidden border-2 border-dashed border-gray-300">
                {brand.backgroundUrl ? (
                  <img
                    src={brand.backgroundUrl}
                    alt="Background"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Image className="w-12 h-12 mx-auto mb-2" />
                      <span>Nessuna immagine di sfondo</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <input
                  ref={backgroundInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'background');
                    e.target.value = '';
                  }}
                  className="hidden"
                />
                <button
                  onClick={() => backgroundInputRef.current?.click()}
                  disabled={uploading === 'background'}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {uploading === 'background' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Carica Immagine
                </button>

                {brand.backgroundUrl && (
                  <button
                    onClick={() => handleDeleteAsset('background')}
                    className="inline-flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Rimuovi
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Video Upload */}
          {brand.backgroundType === 'video' && (
            <div>
              <div className="w-full h-48 bg-gray-900 rounded-xl mb-4 overflow-hidden border-2 border-dashed border-gray-600">
                {brand.backgroundVideoUrl ? (
                  <video
                    src={brand.backgroundVideoUrl}
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Video className="w-12 h-12 mx-auto mb-2" />
                      <span>Nessun video di sfondo</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'backgroundVideo');
                    e.target.value = '';
                  }}
                  className="hidden"
                />
                <button
                  onClick={() => videoInputRef.current?.click()}
                  disabled={uploading === 'backgroundVideo'}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {uploading === 'backgroundVideo' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Carica Video (max 50MB)
                </button>

                {brand.backgroundVideoUrl && (
                  <button
                    onClick={() => handleDeleteAsset('backgroundVideo')}
                    className="inline-flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Rimuovi
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Additional Settings */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-green-600" />
            Informazioni Brand
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Type className="w-4 h-4 inline mr-1" />
                Nome Azienda (opzionale)
              </label>
              <input
                type="text"
                value={brand.companyName || ''}
                onChange={(e) =>
                  setBrand((prev) => ({ ...prev, companyName: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Il nome della tua azienda"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Messaggio Personalizzato (opzionale)
              </label>
              <textarea
                value={brand.customMessage || ''}
                onChange={(e) =>
                  setBrand((prev) => ({ ...prev, customMessage: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Un messaggio che apparirà sulla pagina di download"
              />
            </div>

            {/* Powered By Toggle (only for Business) */}
            {canRemovePoweredBy && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    Mostra &quot;Powered by FlyFile&quot;
                  </p>
                  <p className="text-sm text-gray-500">
                    Nascondi il badge FlyFile dalla pagina di download
                  </p>
                </div>
                <button
                  onClick={() =>
                    setBrand((prev) => ({
                      ...prev,
                      showPoweredBy: !prev.showPoweredBy,
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    brand.showPoweredBy ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      brand.showPoweredBy ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            Salva Modifiche
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Anteprima Pagina Download</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative h-[70vh] overflow-hidden">
              {/* Background */}
              {brand.backgroundType === 'video' && brand.backgroundVideoUrl ? (
                <video
                  src={brand.backgroundVideoUrl}
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : brand.backgroundType === 'image' && brand.backgroundUrl ? (
                <img
                  src={brand.backgroundUrl}
                  alt="Background"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${brand.primaryColor || '#06b6d4'}, ${brand.secondaryColor || '#8b5cf6'})`,
                  }}
                />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40" />

              {/* Content Preview */}
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-white p-8">
                {/* Logo */}
                {brand.logoUrl && (
                  <img
                    src={brand.logoUrl}
                    alt="Logo"
                    className="h-16 mb-6 object-contain"
                  />
                )}

                {/* Company Name */}
                {brand.companyName && (
                  <p className="text-lg text-white/80 mb-2">{brand.companyName}</p>
                )}

                {/* Title */}
                <h1 className="text-3xl font-bold mb-4">Nome del Trasferimento</h1>

                {/* Custom Message */}
                {brand.customMessage && (
                  <p className="text-white/80 mb-6 text-center max-w-md">
                    {brand.customMessage}
                  </p>
                )}

                {/* Mock Download Card */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-md">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg" />
                    <div>
                      <p className="font-medium">documento.pdf</p>
                      <p className="text-sm text-white/60">2.5 MB</p>
                    </div>
                  </div>
                  <button className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors">
                    Scarica File
                  </button>
                </div>

                {/* Powered By */}
                {brand.showPoweredBy && (
                  <p className="mt-8 text-sm text-white/50">
                    Powered by FlyFile
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
