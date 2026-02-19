'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from 'next-intl';
import { Upload, Trash2, ExternalLink, Loader2, Building2, BarChart3, Eye, MousePointerClick, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SponsorVideo {
  id: string;
  r2Key: string;
  videoUrl: string;
  linkUrl: string;
  status: string;
  uploadedAt: string | null;
}

interface SponsorshipData {
  id: string;
  companyName: string;
  status: string;
  videos: SponsorVideo[];
  impressionCount: number;
  clickCount: number;
}

export default function SponsorshipsPage() {
  const { user } = useAuth();
  const t = useTranslations('sponsorships');

  const [sponsorship, setSponsorship] = useState<SponsorshipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [linkUrls, setLinkUrls] = useState<string[]>(['', '', '']);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  useEffect(() => {
    if (user) fetchSponsorship();
  }, [user]);

  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    if (!user) return {};
    const token = await user.getIdToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchSponsorship = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const res = await fetch('/api/sponsorships', { headers });
      const data = await res.json();

      if (data.success && data.sponsorship) {
        setSponsorship(data.sponsorship);
        setCompanyName(data.sponsorship.companyName || '');
        const urls = ['', '', ''];
        (data.sponsorship.videos || []).forEach((v: SponsorVideo, i: number) => {
          if (i < 3) urls[i] = v.linkUrl || '';
        });
        setLinkUrls(urls);
      }
    } catch {
      showMessage('error', t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const validateVideoDuration = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        if (video.duration < 15) {
          showMessage('error', t('errors.videoDurationShort'));
          resolve(false);
        } else if (video.duration > 30) {
          showMessage('error', t('errors.videoDurationLong'));
          resolve(false);
        } else {
          resolve(true);
        }
      };
      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        resolve(true); // Allow upload even if metadata can't be read
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const handleUploadVideo = async (slotIndex: number, file: File) => {
    if (!user) return;

    // Validate format
    if (file.type !== 'video/mp4') {
      showMessage('error', t('errors.invalidVideoFormat'));
      return;
    }

    // Validate size
    if (file.size > 50 * 1024 * 1024) {
      showMessage('error', t('errors.videoTooLarge'));
      return;
    }

    // Validate duration
    const validDuration = await validateVideoDuration(file);
    if (!validDuration) return;

    try {
      setUploadingSlot(slotIndex);
      const headers = await getAuthHeaders();

      // Step 1: Get presigned URL
      const urlRes = await fetch('/api/sponsorships/upload', {
        method: 'POST',
        headers,
        body: JSON.stringify({ contentType: file.type, fileSize: file.size }),
      });

      const urlData = await urlRes.json();
      if (!urlRes.ok) {
        showMessage('error', urlData.error || t('errors.uploadFailed'));
        return;
      }

      // Step 2: Upload to R2
      await fetch(urlData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      // Step 3: Confirm upload
      const confirmRes = await fetch('/api/sponsorships/upload', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          videoId: urlData.videoId,
          r2Key: urlData.r2Key,
          linkUrl: linkUrls[slotIndex] || '',
        }),
      });

      const confirmData = await confirmRes.json();
      if (!confirmRes.ok) {
        showMessage('error', confirmData.error || t('errors.uploadFailed'));
        return;
      }

      showMessage('success', t('success.videoUploaded'));
      await fetchSponsorship();
    } catch {
      showMessage('error', t('errors.uploadFailed'));
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleRemoveVideo = async (videoIndex: number) => {
    if (!sponsorship) return;

    const updatedVideos = sponsorship.videos.filter((_, i) => i !== videoIndex);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/sponsorships', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          companyName,
          videos: updatedVideos,
        }),
      });

      if (res.ok) {
        showMessage('success', t('success.videoRemoved'));
        await fetchSponsorship();
      } else {
        showMessage('error', t('errors.saveFailed'));
      }
    } catch {
      showMessage('error', t('errors.saveFailed'));
    }
  };

  const handleSave = async () => {
    if (!companyName.trim()) {
      showMessage('error', t('errors.companyRequired'));
      return;
    }

    // Validate link URLs
    for (const url of linkUrls) {
      if (url.trim() && !url.match(/^https?:\/\/.+/)) {
        showMessage('error', t('errors.invalidLink'));
        return;
      }
    }

    try {
      setSaving(true);
      const headers = await getAuthHeaders();

      // Update link URLs on existing videos
      const updatedVideos = (sponsorship?.videos || []).map((v, i) => ({
        ...v,
        linkUrl: linkUrls[i] || v.linkUrl || '',
      }));

      const res = await fetch('/api/sponsorships', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          companyName: companyName.trim(),
          videos: updatedVideos,
        }),
      });

      if (res.ok) {
        showMessage('success', t('success.saved'));
        await fetchSponsorship();
      } else {
        const data = await res.json();
        showMessage('error', data.error || t('errors.saveFailed'));
      }
    } catch {
      showMessage('error', t('errors.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Sei sicuro di voler eliminare la sponsorizzazione?')) return;

    try {
      setDeleting(true);
      const headers = await getAuthHeaders();
      const res = await fetch('/api/sponsorships', { method: 'DELETE', headers });

      if (res.ok) {
        showMessage('success', t('success.deleted'));
        setSponsorship(null);
        setCompanyName('');
        setLinkUrls(['', '', '']);
      } else {
        showMessage('error', t('errors.deleteFailed'));
      }
    } catch {
      showMessage('error', t('errors.deleteFailed'));
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      deactivated: 'bg-gray-100 text-gray-800',
      processing: 'bg-blue-100 text-blue-800',
      ready: 'bg-green-100 text-green-800',
    };
    const labels: Record<string, string> = {
      pending: t('statusPending'),
      active: t('statusActive'),
      rejected: t('statusRejected'),
      deactivated: t('statusDeactivated'),
      processing: t('statusProcessing'),
      ready: t('statusReady'),
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Toast message */}
      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-xl text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="w-6 h-6 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">{t('title')}</h2>
          {sponsorship && getStatusBadge(sponsorship.status)}
        </div>
        <p className="text-sm text-gray-500">{t('subtitle')}</p>
      </div>

      {/* Stats (if sponsorship exists) */}
      {sponsorship && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500">{t('impressions')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{sponsorship.impressionCount.toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <MousePointerClick className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500">{t('clicks')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{sponsorship.clickCount.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Company Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('companyName')}</label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder={t('companyNamePlaceholder')}
          className="w-full px-4 py-3 bg-transparent border-b border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-all text-sm"
        />
      </div>

      {/* Video Slots */}
      <div className="space-y-6">
        {[0, 1, 2].map((slotIndex) => {
          const video = sponsorship?.videos?.[slotIndex];
          const isUploading = uploadingSlot === slotIndex;

          return (
            <div key={slotIndex} className="border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  {t('videoSlot', { number: slotIndex + 1 })}
                </h3>
                {video && getStatusBadge(video.status)}
              </div>

              {video ? (
                <div className="space-y-4">
                  {/* Video preview */}
                  <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                    <video
                      src={video.videoUrl}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                      onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                      onMouseLeave={(e) => { (e.target as HTMLVideoElement).pause(); (e.target as HTMLVideoElement).currentTime = 0; }}
                    />
                  </div>

                  {/* Link URL */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('linkUrl')}</label>
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <input
                        type="url"
                        value={linkUrls[slotIndex]}
                        onChange={(e) => {
                          const newUrls = [...linkUrls];
                          newUrls[slotIndex] = e.target.value;
                          setLinkUrls(newUrls);
                        }}
                        placeholder={t('linkUrlPlaceholder')}
                        className="flex-1 px-3 py-2 bg-transparent border-b border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-all"
                      />
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemoveVideo(slotIndex)}
                    className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {t('removeVideo')}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Upload area */}
                  <button
                    onClick={() => fileInputRefs[slotIndex].current?.click()}
                    disabled={isUploading}
                    className="w-full py-8 border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-400 transition-colors flex flex-col items-center gap-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="text-sm">Caricamento...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6" />
                        <span className="text-sm font-medium">{t('uploadVideo')}</span>
                        <span className="text-xs text-gray-400">MP4, 15-30s, max 50MB</span>
                      </>
                    )}
                  </button>

                  <input
                    ref={fileInputRefs[slotIndex]}
                    type="file"
                    accept="video/mp4"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadVideo(slotIndex, file);
                      e.target.value = '';
                    }}
                  />

                  {/* Link URL (pre-fill before upload) */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('linkUrl')}</label>
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <input
                        type="url"
                        value={linkUrls[slotIndex]}
                        onChange={(e) => {
                          const newUrls = [...linkUrls];
                          newUrls[slotIndex] = e.target.value;
                          setLinkUrls(newUrls);
                        }}
                        placeholder={t('linkUrlPlaceholder')}
                        className="flex-1 px-3 py-2 bg-transparent border-b border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Guidelines */}
      <div className="bg-blue-50 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">{t('guidelines')}</h3>
            <p className="text-sm text-blue-800">{t('guidelinesText')}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {t('save')}
        </button>

        {sponsorship && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-6 py-2.5 text-red-600 hover:text-red-800 text-sm font-medium rounded-full transition-colors border border-red-200 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
            <Trash2 className="w-4 h-4" />
            {t('delete')}
          </button>
        )}
      </div>
    </div>
  );
}
