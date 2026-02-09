'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Image,
  Video,
  Upload,
  Trash2,
  Save,
  Eye,
  Crown,
  Loader2,
  Check,
  X,
  Copy,
  AlertCircle,
  Plus,
  Lightbulb,
} from 'lucide-react';
import { getPlanLimits, BrandSettings } from '@/types';

export default function BrandPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  const [brand, setBrand] = useState<BrandSettings>({
    backgroundType: 'gradient',
    primaryColor: '#06b6d4',
    secondaryColor: '#8b5cf6',
    showPoweredBy: true,
  });
  const [originalBrand, setOriginalBrand] = useState<BrandSettings | null>(null);
  const [loadingBrand, setLoadingBrand] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [canCustomize, setCanCustomize] = useState(false);
  const [canRemovePoweredBy, setCanRemovePoweredBy] = useState(false);
  const [canUseCustomLinks, setCanUseCustomLinks] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Custom slug
  const [slugInput, setSlugInput] = useState('');
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'owned'>('idle');
  const [slugError, setSlugError] = useState('');
  const [savingSlug, setSavingSlug] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const emailBannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) fetchBrandSettings();
  }, [user]);

  const fetchBrandSettings = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/brand?userId=${user.uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCanCustomize(data.canCustomize);
        setCanRemovePoweredBy(data.canRemovePoweredBy);
        const planLimits = data.plan ? getPlanLimits(data.plan) : null;
        setCanUseCustomLinks(planLimits?.customLinks ?? false);
        if (data.brand) {
          setBrand({ ...data.brand, backgroundType: data.brand.backgroundType || 'gradient', showPoweredBy: data.brand.showPoweredBy ?? true });
          setOriginalBrand(data.brand);
          if (data.brand.customSlug) {
            setSlugInput(data.brand.customSlug);
            setSlugStatus('owned');
          }
        }
      }
    } catch { /* ignore */ } finally { setLoadingBrand(false); }
  };

  const showMsg = (text: string, type: 'success' | 'error') => { setMessage({ text, type }); setTimeout(() => setMessage(null), 4000); };

  const checkSlugAvailability = async (slug: string) => {
    if (!slug || slug.length < 3) { setSlugStatus('idle'); setSlugError(''); return; }
    setSlugStatus('checking'); setSlugError('');
    try {
      const response = await fetch(`/api/brand/slug?slug=${encodeURIComponent(slug)}&userId=${user?.uid}`);
      const data = await response.json();
      if (data.available) { setSlugStatus(data.ownedByUser ? 'owned' : 'available'); setSlugError(''); }
      else { setSlugStatus(data.error?.includes('Formato') ? 'invalid' : 'taken'); setSlugError(data.error || 'Slug non disponibile'); }
    } catch { setSlugStatus('idle'); setSlugError('Errore nel controllo'); }
  };

  const handleSlugChange = (value: string) => {
    const v = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlugInput(v);
    if (!v) { setSlugStatus('idle'); setSlugError(''); return; }
    const t = setTimeout(() => checkSlugAvailability(v), 500);
    return () => clearTimeout(t);
  };

  const handleSaveSlug = async () => {
    if (!user || !slugInput || slugStatus === 'taken' || slugStatus === 'invalid') return;
    setSavingSlug(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/brand/slug', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ userId: user.uid, slug: slugInput }) });
      const data = await response.json();
      if (response.ok) { showMsg('Link personalizzato salvato!', 'success'); setSlugStatus('owned'); setBrand(prev => ({ ...prev, customSlug: slugInput, customSlugVerified: true })); }
      else showMsg(data.error || 'Errore', 'error');
    } catch { showMsg('Errore nel salvataggio', 'error'); } finally { setSavingSlug(false); }
  };

  const handleRemoveSlug = async () => {
    if (!user || !confirm('Sei sicuro di voler rimuovere il link personalizzato?')) return;
    setSavingSlug(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/brand/slug?userId=${user.uid}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) { showMsg('Link rimosso', 'success'); setSlugInput(''); setSlugStatus('idle'); setBrand(prev => { const { customSlug, customSlugVerified, ...rest } = prev; return rest; }); }
      else { const data = await response.json(); showMsg(data.error || 'Errore', 'error'); }
    } catch { showMsg('Errore nella rimozione', 'error'); } finally { setSavingSlug(false); }
  };

  const copyCustomLink = () => {
    const domain = process.env.NEXT_PUBLIC_BASE_URL || 'https://flyfile.it';
    const url = `${domain}/t/${slugInput}`;
    navigator.clipboard.writeText(url).then(() => showMsg('Link copiato!', 'success'));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/brand', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ userId: user.uid, brand }) });
      if (response.ok) { showMsg('Impostazioni salvate!', 'success'); setOriginalBrand(brand); }
      else { const data = await response.json(); showMsg(data.error || 'Errore', 'error'); }
    } catch { showMsg('Errore nel salvataggio', 'error'); } finally { setSaving(false); }
  };

  const handleFileUpload = async (file: File, assetType: 'logo' | 'background' | 'backgroundVideo' | 'emailBanner') => {
    if (!user) return;
    const maxSize = assetType === 'backgroundVideo' ? 50 * 1024 * 1024 : assetType === 'emailBanner' ? 3 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) { showMsg(`File troppo grande. Max ${assetType === 'backgroundVideo' ? '50' : assetType === 'emailBanner' ? '3' : '10'}MB.`, 'error'); return; }
    setUploading(assetType);
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/brand', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ userId: user.uid, assetType, contentType: file.type, fileName: file.name }) });
      if (!response.ok) { const d = await response.json(); throw new Error(d.error || 'Errore upload'); }
      const { uploadUrl, r2Key, publicUrl } = await response.json();
      const uploadResponse = await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      if (!uploadResponse.ok) throw new Error('Errore caricamento');
      const updates: Partial<BrandSettings> = {};
      if (assetType === 'logo') { updates.logoUrl = publicUrl; updates.logoPath = r2Key; }
      else if (assetType === 'background') { updates.backgroundUrl = publicUrl; updates.backgroundPath = r2Key; updates.backgroundType = 'image'; }
      else if (assetType === 'backgroundVideo') { updates.backgroundVideoUrl = publicUrl; updates.backgroundVideoPath = r2Key; updates.backgroundType = 'video'; }
      else if (assetType === 'emailBanner') { updates.emailBannerUrl = publicUrl; updates.emailBannerPath = r2Key; }
      setBrand(prev => ({ ...prev, ...updates }));
      showMsg('File caricato!', 'success');
    } catch (err) { showMsg(err instanceof Error ? err.message : 'Errore caricamento', 'error'); } finally { setUploading(null); }
  };

  const handleDeleteAsset = async (assetType: 'logo' | 'background' | 'backgroundVideo' | 'emailBanner') => {
    if (!user || !confirm('Rimuovere questo asset?')) return;
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/brand?userId=${user.uid}&assetType=${assetType}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) {
        const updates: Partial<BrandSettings> = {};
        if (assetType === 'logo') { updates.logoUrl = undefined; updates.logoPath = undefined; }
        else if (assetType === 'background') { updates.backgroundUrl = undefined; updates.backgroundPath = undefined; updates.backgroundType = 'gradient'; }
        else if (assetType === 'backgroundVideo') { updates.backgroundVideoUrl = undefined; updates.backgroundVideoPath = undefined; updates.backgroundType = 'gradient'; }
        else if (assetType === 'emailBanner') { updates.emailBannerUrl = undefined; updates.emailBannerPath = undefined; }
        setBrand(prev => ({ ...prev, ...updates }));
        showMsg('Asset rimosso!', 'success');
      } else { const d = await response.json(); showMsg(d.error || 'Errore', 'error'); }
    } catch { showMsg('Errore nella rimozione', 'error'); }
  };

  if (loading || loadingBrand) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  // Free/Starter users see upgrade prompt
  if (!canCustomize) {
    return (
      <div className="space-y-8">
        <div className="border border-gray-200 rounded-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Crown className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Crea uno spazio tutto tuo e in linea con il brand</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Personalizza la pagina di download con il tuo logo, colori e sfondo.
            Disponibile per i piani Pro e Business.
          </p>
          <button
            onClick={() => router.push('/pricing')}
            className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            Effettua l&apos;upgrade
          </button>
        </div>
      </div>
    );
  }

  const hasChanges = JSON.stringify(brand) !== JSON.stringify(originalBrand);

  return (
    <div className="space-y-10">
      {/* Message */}
      {message && (
        <div className={`p-3 rounded-xl flex items-center gap-2 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* ─── Spazio di lavoro ─── */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Spazio di lavoro</h3>
        <p className="text-sm text-gray-500 mb-5">Cambia il nome e l&apos;icona dello spazio di lavoro.</p>

        <div className="flex items-start gap-5">
          {/* Workspace icon */}
          <div
            onClick={() => logoInputRef.current?.click()}
            className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border border-dashed border-gray-300 flex-shrink-0 cursor-pointer hover:border-gray-400 transition-colors"
          >
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <Image className="w-8 h-8 text-gray-300" />
            )}
          </div>
          <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, 'logo'); e.target.value = ''; }} className="hidden" />

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome dello spazio di lavoro</label>
            <input
              type="text"
              value={brand.companyName || ''}
              onChange={(e) => setBrand(prev => ({ ...prev, companyName: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-900 transition-colors"
              placeholder="La tua azienda"
            />
          </div>
        </div>

        {/* Upload/remove logo buttons */}
        <div className="flex gap-2 mt-3 ml-[100px]">
          <button onClick={() => logoInputRef.current?.click()} disabled={uploading === 'logo'} className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-full hover:bg-gray-50 flex items-center gap-1.5 disabled:opacity-50">
            {uploading === 'logo' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />} Carica icona
          </button>
          {brand.logoUrl && (
            <button onClick={() => handleDeleteAsset('logo')} className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-100 rounded-full hover:bg-red-50 flex items-center gap-1.5">
              <Trash2 className="w-3 h-3" /> Rimuovi
            </button>
          )}
        </div>
      </section>

      {/* ─── Modifica la tua pagina ─── */}
      {canUseCustomLinks && (
        <section>
          <h3 className="text-base font-semibold text-gray-900 mb-1">Modifica la tua pagina</h3>
          <p className="text-sm text-gray-500 mb-5">
            Puoi modificare il tuo nome e l&apos;URL tutte le volte che vuoi. Una volta scelto un nuovo URL, la tua pagina verr&agrave; aggiornata subito.
          </p>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
              <input
                type="text"
                value={brand.companyName || ''}
                onChange={(e) => setBrand(prev => ({ ...prev, companyName: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-900 transition-colors"
                placeholder="Il tuo nome o azienda"
              />
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">URL del profilo</label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <input
                    type="text"
                    value={slugInput}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="flex-1 px-4 py-2.5 text-sm focus:outline-none"
                    placeholder="tuoslug"
                    maxLength={30}
                  />
                  <span className="pr-4 text-sm text-gray-400 whitespace-nowrap">.flyfile.it</span>
                  <div className="pr-3 flex items-center">
                    {slugStatus === 'checking' && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
                    {slugStatus === 'available' && <Check className="w-4 h-4 text-green-500" />}
                    {slugStatus === 'owned' && <Check className="w-4 h-4 text-blue-500" />}
                    {(slugStatus === 'taken' || slugStatus === 'invalid') && <AlertCircle className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
                {slugStatus === 'owned' ? (
                  <div className="flex gap-1.5">
                    <button onClick={copyCustomLink} className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors" title="Copia">
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                    <button onClick={handleRemoveSlug} disabled={savingSlug} className="p-2.5 border border-red-100 text-red-600 rounded-xl hover:bg-red-50 disabled:opacity-50">
                      {savingSlug ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                ) : (
                  <button onClick={handleSaveSlug} disabled={savingSlug || slugStatus !== 'available' || !slugInput || slugInput.length < 3} className="px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors">
                    {savingSlug ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salva'}
                  </button>
                )}
              </div>
              {slugError && <p className="mt-1 text-xs text-red-600">{slugError}</p>}
              {slugStatus === 'available' && !slugError && <p className="mt-1 text-xs text-green-600">Disponibile!</p>}
            </div>
          </div>

          {/* Tip box */}
          <div className="mt-5 flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
            <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">Vuoi richiedere un trasferimento a qualcuno?</p>
              <p className="text-xs text-gray-500 mt-0.5">Crea un link speciale per precompilare il titolo o la descrizione per loro.</p>
            </div>
          </div>
        </section>
      )}

      {/* ─── Sfondo con il tuo brand ─── */}
      <section>
        <h3 className="text-base font-semibold text-gray-900 mb-1">Imposta uno sfondo con il tuo brand</h3>
        <p className="text-sm text-gray-500 mb-5">
          Metti te stesso o il tuo brand al centro con fino a cinque video o immagini in rotazione.
        </p>

        {/* Current background preview */}
        <div className="w-full h-48 bg-gray-100 rounded-xl mb-4 overflow-hidden border border-gray-200 relative">
          {brand.backgroundType === 'video' && brand.backgroundVideoUrl ? (
            <video src={brand.backgroundVideoUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline />
          ) : brand.backgroundType === 'image' && brand.backgroundUrl ? (
            <img src={brand.backgroundUrl} alt="Background" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${brand.primaryColor || '#06b6d4'}, ${brand.secondaryColor || '#8b5cf6'})` }} />
          )}
          {(brand.backgroundUrl || brand.backgroundVideoUrl) && (
            <button
              onClick={() => handleDeleteAsset(brand.backgroundType === 'video' ? 'backgroundVideo' : 'background')}
              className="absolute top-3 right-3 p-1.5 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          )}
        </div>

        {/* Upload buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <input ref={backgroundInputRef} type="file" accept="image/jpeg,image/png" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, 'background'); e.target.value = ''; }} className="hidden" />
          <input ref={videoInputRef} type="file" accept="video/mp4" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, 'backgroundVideo'); e.target.value = ''; }} className="hidden" />

          <button
            onClick={() => backgroundInputRef.current?.click()}
            disabled={!!uploading}
            className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-full hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 transition-colors"
          >
            {uploading === 'background' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Aggiungi nuovo
          </button>
          <button
            onClick={() => videoInputRef.current?.click()}
            disabled={!!uploading}
            className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-full hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 transition-colors"
          >
            {uploading === 'backgroundVideo' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
            Carica video
          </button>
        </div>

        {/* Gradient colors (if no image/video) */}
        {brand.backgroundType === 'gradient' && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Colore primario</label>
              <div className="flex items-center gap-2">
                <input type="color" value={brand.primaryColor || '#06b6d4'} onChange={(e) => setBrand(prev => ({ ...prev, primaryColor: e.target.value }))} className="w-8 h-8 rounded-lg border cursor-pointer" />
                <input type="text" value={brand.primaryColor || '#06b6d4'} onChange={(e) => setBrand(prev => ({ ...prev, primaryColor: e.target.value }))} className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Colore secondario</label>
              <div className="flex items-center gap-2">
                <input type="color" value={brand.secondaryColor || '#8b5cf6'} onChange={(e) => setBrand(prev => ({ ...prev, secondaryColor: e.target.value }))} className="w-8 h-8 rounded-lg border cursor-pointer" />
                <input type="text" value={brand.secondaryColor || '#8b5cf6'} onChange={(e) => setBrand(prev => ({ ...prev, secondaryColor: e.target.value }))} className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs" />
              </div>
            </div>
          </div>
        )}

        {/* Upload guidelines */}
        <div className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4">
          <Lightbulb className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-gray-700">Linee guida per il caricamento dei media</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Formati accettati: immagini JPEG/PNG o video MP4, fino a 5 MB ciascuno. Gli sfondi ruotano ogni 30s e i video pi&ugrave; lunghi di 30s verranno tagliati. Puoi anche dare a ogni trasferimento il suo sfondo personalizzato.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Link di destinazione ─── */}
      <section>
        <h3 className="text-base font-semibold text-gray-900 mb-1">Link di destinazione</h3>
        <p className="text-xs text-gray-500 mb-3">
          &Egrave; il link a cui le persone verranno reindirizzate quando cliccano sullo sfondo (ad esempio, puoi aggiungere il tuo sito web)
        </p>
        <input
          type="url"
          value={brand.destinationUrl || ''}
          onChange={(e) => setBrand(prev => ({ ...prev, destinationUrl: e.target.value }))}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-900 transition-colors"
          placeholder="https://www.esempio.com"
        />
      </section>

      {/* ─── Link social ─── */}
      <section>
        <h3 className="text-base font-semibold text-gray-900 mb-1">Aggiungi link social</h3>
        <p className="text-xs text-gray-500 mb-5">
          Connettiti con il tuo pubblico online aggiungendo link ai social ai tuoi sfondi brandizzati e personalizzati.
        </p>

        <div className="space-y-4">
          {[
            { key: 'socialLinkedin' as const, label: 'LinkedIn' },
            { key: 'socialTwitter' as const, label: 'Twitter' },
            { key: 'socialInstagram' as const, label: 'Instagram' },
            { key: 'socialTiktok' as const, label: 'TikTok' },
            { key: 'socialFacebook' as const, label: 'Facebook' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <input
                type="url"
                value={brand[key] || ''}
                onChange={(e) => setBrand(prev => ({ ...prev, [key]: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-900 transition-colors"
                placeholder={`Scrivi qui il link completo del tuo profilo (https://\u2026)`}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ─── Personalizza le tue email ─── */}
      <section>
        <h3 className="text-base font-semibold text-gray-900 mb-1">Personalizza le tue email</h3>
        <p className="text-xs text-gray-500 mb-5">
          Aggiungi un&apos;immagine per far risaltare le email dei tuoi trasferimenti. Per risultati ottimali, la tua immagine dovrebbe essere di 1600 &times; 800 pixel (altrimenti la ritaglieremo per adattarla). La dimensione massima del file &egrave; 3 MB.
        </p>

        {/* Email banner upload */}
        <div>
          <input ref={emailBannerInputRef} type="file" accept="image/jpeg,image/png" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, 'emailBanner'); e.target.value = ''; }} className="hidden" />

          {brand.emailBannerUrl ? (
            <div className="relative mb-3">
              <img src={brand.emailBannerUrl} alt="Email banner" className="w-full h-auto rounded-xl border border-gray-200" />
              <button
                onClick={() => handleDeleteAsset('emailBanner')}
                className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => emailBannerInputRef.current?.click()}
              disabled={uploading === 'emailBanner'}
              className="w-full py-8 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors flex flex-col items-center gap-2 mb-3"
            >
              {uploading === 'emailBanner' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              {uploading === 'emailBanner' ? 'Caricamento...' : 'Nessun file selezionato'}
            </button>
          )}

          {brand.emailBannerUrl && (
            <button
              onClick={() => emailBannerInputRef.current?.click()}
              disabled={uploading === 'emailBanner'}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-full hover:bg-gray-50 flex items-center gap-1.5 disabled:opacity-50"
            >
              {uploading === 'emailBanner' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
              Cambia immagine
            </button>
          )}

          {/* Email preview mockup */}
          <div className="mt-5 border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-6 py-4">
              {brand.emailBannerUrl ? (
                <img src={brand.emailBannerUrl} alt="Banner" className="w-full h-auto rounded-lg" />
              ) : (
                <div className="w-full h-24 bg-gray-200 rounded-lg" />
              )}
            </div>
            <div className="px-6 py-4 text-center">
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="text-sm font-medium text-gray-900">ti ha inviato dei file</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Powered by toggle ─── */}
      {canRemovePoweredBy && (
        <section>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-900">Mostra &quot;Powered by FlyFile&quot;</p>
              <p className="text-xs text-gray-500">Nascondi il badge dalla pagina di download</p>
            </div>
            <button
              onClick={() => setBrand(prev => ({ ...prev, showPoweredBy: !prev.showPoweredBy }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${brand.showPoweredBy ? 'bg-blue-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${brand.showPoweredBy ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </section>
      )}

      {/* ─── Save + Preview ─── */}
      <div className="flex gap-3 pb-8">
        <button onClick={handleSave} disabled={saving || !hasChanges} className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2 transition-colors">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salva modifiche
        </button>
        <button onClick={() => setShowPreview(true)} className="px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-full hover:bg-gray-50 flex items-center gap-2 transition-colors">
          <Eye className="w-4 h-4" /> Anteprima
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Anteprima</h3>
              <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="relative h-[70vh] overflow-hidden">
              {brand.backgroundType === 'video' && brand.backgroundVideoUrl ? (
                <video src={brand.backgroundVideoUrl} className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted playsInline />
              ) : brand.backgroundType === 'image' && brand.backgroundUrl ? (
                <img src={brand.backgroundUrl} alt="Background" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${brand.primaryColor || '#06b6d4'}, ${brand.secondaryColor || '#8b5cf6'})` }} />
              )}
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-white p-8">
                {brand.logoUrl && <img src={brand.logoUrl} alt="Logo" className="h-16 mb-6 object-contain" />}
                {brand.companyName && <p className="text-lg text-white/80 mb-2">{brand.companyName}</p>}
                <h1 className="text-3xl font-bold mb-4">Nome del Trasferimento</h1>
                {brand.customMessage && <p className="text-white/80 mb-6 text-center max-w-md">{brand.customMessage}</p>}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-md">
                  <div className="flex items-center gap-4 mb-4"><div className="w-12 h-12 bg-white/20 rounded-lg" /><div><p className="font-medium">documento.pdf</p><p className="text-sm text-white/60">2.5 MB</p></div></div>
                  <button className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors">Scarica File</button>
                </div>
                {brand.showPoweredBy && <p className="mt-8 text-sm text-white/50">Powered by FlyFile</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
