'use client';

import { useEffect, useState } from 'react';
import { Cloud, AlertTriangle, Loader2 } from 'lucide-react';
import { BrandSettings } from '@/types';

interface BrandedLandingClientProps {
  slug: string;
}

export default function BrandedLandingClient({ slug }: BrandedLandingClientProps) {
  const [brand, setBrand] = useState<BrandSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const response = await fetch(`/api/brand/by-slug?slug=${encodeURIComponent(slug)}`);

        if (response.ok) {
          const data = await response.json();
          if (data.brand) {
            setBrand(data.brand);
          } else {
            setError(true);
          }
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching brand:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBrand();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-white/70">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Pagina Non Trovata</h1>
          <p className="text-blue-200/70 mb-8">
            Questo dominio non è configurato correttamente.
          </p>
          <a
            href="https://flyfile.it"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all"
          >
            Vai a FlyFile
          </a>
        </div>
      </div>
    );
  }

  // Determine background style
  const getBackgroundStyle = () => {
    if (brand.backgroundType === 'gradient' && brand.primaryColor && brand.secondaryColor) {
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
      {brand.backgroundType === 'image' && brand.backgroundUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${brand.backgroundUrl})` }}
        />
      )}

      {/* Custom Background Video */}
      {brand.backgroundType === 'video' && brand.backgroundVideoUrl && (
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

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Logo */}
        {brand.logoUrl ? (
          <img
            src={brand.logoUrl}
            alt={brand.companyName || 'Logo'}
            className="h-20 md:h-28 object-contain mb-8"
          />
        ) : (
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full mb-8 shadow-2xl shadow-cyan-500/50">
            <Cloud className="w-12 h-12 text-white" />
          </div>
        )}

        {/* Company Name */}
        {brand.companyName && (
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
            {brand.companyName}
          </h1>
        )}

        {/* Custom Message */}
        {brand.customMessage && (
          <p className="text-xl text-white/80 max-w-2xl text-center mb-8">
            {brand.customMessage}
          </p>
        )}

        {/* Info */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-md text-center">
          <p className="text-white/90 mb-4">
            Questa è la pagina di condivisione file di <strong>{brand.companyName || slug}</strong>.
          </p>
          <p className="text-white/70 text-sm">
            Se hai ricevuto un link per scaricare dei file, assicurati di utilizzare il link completo che ti è stato inviato.
          </p>
        </div>

        {/* Powered by */}
        {brand.showPoweredBy !== false && (
          <div className="mt-12 text-center">
            <p className="text-white/50 text-sm">
              Powered by{' '}
              <a href="https://flyfile.it" className="text-cyan-400 hover:text-cyan-300 font-medium">
                FlyFile
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
