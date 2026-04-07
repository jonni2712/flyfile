'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { X, Sparkles, ArrowRight } from 'lucide-react';

export type PaywallReason =
  | 'storage_limit'
  | 'transfers_limit'
  | 'retention_days'
  | 'custom_branding'
  | 'custom_links'
  | 'team_access';

interface PaywallContent {
  title: string;
  description: string;
  recommendedPlan: string;
  features: string[];
}

const CONTENT_BY_REASON: Record<PaywallReason, PaywallContent> = {
  storage_limit: {
    title: 'Hai raggiunto il tuo limite di storage',
    description: 'Sblocca più spazio per condividere file più grandi e in maggior numero ogni mese.',
    recommendedPlan: 'pro',
    features: [
      '1 TB di storage mensile',
      '100 trasferimenti al mese',
      'Conservazione 30 giorni',
      'Branding personalizzato',
    ],
  },
  transfers_limit: {
    title: 'Hai esaurito i trasferimenti del mese',
    description: 'Passa a un piano superiore per inviare più trasferimenti senza interruzioni.',
    recommendedPlan: 'pro',
    features: [
      '100 trasferimenti al mese',
      '1 TB di storage',
      'Conservazione 30 giorni',
      'Link personalizzati',
    ],
  },
  retention_days: {
    title: 'Conservazione personalizzata richiesta',
    description: 'I tuoi destinatari hanno bisogno di più tempo per scaricare? Sblocca scadenze fino a 1 anno.',
    recommendedPlan: 'pro',
    features: [
      'Conservazione fino a 30 giorni (Pro)',
      'Conservazione fino a 1 anno (Business)',
      'Più storage e trasferimenti',
      'Branding personalizzato',
    ],
  },
  custom_branding: {
    title: 'Branding personalizzato disponibile su Pro',
    description: 'Aggiungi il tuo logo, i colori del brand e personalizza completamente l\'esperienza dei tuoi destinatari.',
    recommendedPlan: 'pro',
    features: [
      'Logo personalizzato',
      'Colori e sfondo del brand',
      'Link con dominio personalizzato',
      'Email personalizzate',
    ],
  },
  custom_links: {
    title: 'Link personalizzati disponibili su Pro',
    description: 'Crea URL leggibili e brandizzati per i tuoi trasferimenti, perfetti per condividere con clienti e colleghi.',
    recommendedPlan: 'pro',
    features: [
      'URL personalizzati',
      'Branding completo',
      '1 TB di storage',
      'Conservazione 30 giorni',
    ],
  },
  team_access: {
    title: 'Lavoro in team disponibile su Business',
    description: 'Invita collaboratori, condividi spazio di archiviazione e gestisci tutto da una dashboard unificata.',
    recommendedPlan: 'business',
    features: [
      'Fino a 3 membri inclusi',
      'Storage illimitato',
      'Trasferimenti illimitati',
      'Supporto prioritario',
    ],
  },
};

interface PaywallModalProps {
  open: boolean;
  reason: PaywallReason;
  onClose: () => void;
}

export default function PaywallModal({ open, reason, onClose }: PaywallModalProps) {
  const router = useRouter();
  const content = CONTENT_BY_REASON[reason];

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleUpgrade = () => {
    router.push('/prezzi');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Gradient header */}
        <div className="relative bg-gradient-to-br from-brand-500 via-blue-500 to-accent-500 p-6 text-white">
          <button
            onClick={onClose}
            aria-label="Chiudi"
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Upgrade</span>
          </div>
          <h2 id="paywall-title" className="text-xl font-bold mb-2">
            {content.title}
          </h2>
          <p className="text-sm text-white/90">{content.description}</p>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">
            Cosa sblocchi con {content.recommendedPlan === 'pro' ? 'Pro' : 'Business'}
          </div>
          <ul className="space-y-2 mb-6">
            {content.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <button
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-brand-500 to-accent-500 hover:from-brand-600 hover:to-accent-600 text-white font-semibold py-3 px-4 rounded-full transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            Vedi i piani
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors"
          >
            Forse più tardi
          </button>
        </div>
      </div>
    </div>
  );
}
