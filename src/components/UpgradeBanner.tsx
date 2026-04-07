'use client';

import { useRouter } from '@/i18n/navigation';
import { Sparkles, X, ArrowRight } from 'lucide-react';

interface UpgradeBannerProps {
  reason: 'storage_high' | 'frequent_uploader';
  onDismiss: () => void;
}

const COPY = {
  storage_high: {
    title: 'Stai usando molto spazio',
    subtitle: 'Più della metà del tuo storage è occupato. Sblocca più GB con un upgrade.',
  },
  frequent_uploader: {
    title: 'Sei un utente attivo',
    subtitle: 'Hai fatto diversi trasferimenti questa settimana. Sblocca più trasferimenti e funzioni.',
  },
};

export default function UpgradeBanner({ reason, onDismiss }: UpgradeBannerProps) {
  const router = useRouter();
  const { title, subtitle } = COPY[reason];

  return (
    <div className="relative bg-gradient-to-r from-brand-500 via-blue-500 to-accent-500 rounded-2xl p-4 sm:p-5 text-white shadow-lg overflow-hidden">
      {/* Decorative orb */}
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      <button
        onClick={onDismiss}
        aria-label="Chiudi"
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors z-10"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative flex items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0 pr-6">
          <h3 className="font-semibold text-sm sm:text-base">{title}</h3>
          <p className="text-xs sm:text-sm text-white/90 mt-0.5">{subtitle}</p>
        </div>
        <button
          onClick={() => router.push('/prezzi')}
          className="flex-shrink-0 hidden sm:inline-flex items-center gap-1.5 bg-white text-brand-600 hover:bg-gray-50 font-semibold text-sm px-4 py-2 rounded-full transition-colors"
        >
          Esplora i piani
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      {/* Mobile CTA */}
      <button
        onClick={() => router.push('/prezzi')}
        className="sm:hidden mt-3 w-full bg-white text-brand-600 hover:bg-gray-50 font-semibold text-sm px-4 py-2 rounded-full transition-colors flex items-center justify-center gap-1.5"
      >
        Esplora i piani
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
