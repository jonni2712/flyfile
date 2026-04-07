'use client';

import { useState, useEffect } from 'react';
import { Upload, Lock, Share2, Sparkles, ArrowRight } from 'lucide-react';

interface WelcomeTourProps {
  open: boolean;
  onComplete: () => void;
}

const STEPS = [
  {
    icon: Upload,
    title: 'Trascina i tuoi file ovunque',
    description:
      'Trascina file da qualsiasi cartella direttamente sulla pagina, oppure clicca per selezionarli. Nessun limite alla dimensione totale.',
  },
  {
    icon: Lock,
    title: 'Proteggi e personalizza',
    description:
      'Imposta una password, scegli quanti giorni durerà il link, decidi se permettere il preview dei file. Il controllo è tuo.',
  },
  {
    icon: Share2,
    title: 'Condividi il link',
    description:
      'Una volta caricato, copia il link e condividilo via email, chat o ovunque vuoi. Riceverai una notifica al primo download.',
  },
];

export default function WelcomeTour({ open, onComplete }: WelcomeTourProps) {
  const [stepIdx, setStepIdx] = useState(0);

  // Lock scroll while open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;

  const step = STEPS[stepIdx];
  const isLast = stepIdx === STEPS.length - 1;
  const Icon = step.icon;

  const next = () => {
    if (isLast) {
      onComplete();
    } else {
      setStepIdx((i) => i + 1);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Gradient header */}
        <div className="relative bg-gradient-to-br from-brand-500 via-blue-500 to-accent-500 p-8 text-white text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Benvenuto</span>
          </div>
          <div className="w-16 h-16 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
            <Icon className="w-8 h-8" strokeWidth={2.25} />
          </div>
          <h2 id="welcome-title" className="text-2xl font-bold mb-2">
            {step.title}
          </h2>
          <p className="text-sm text-white/90 leading-relaxed">{step.description}</p>
        </div>

        {/* Progress dots + actions */}
        <div className="p-6">
          <div className="flex items-center justify-center gap-2 mb-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === stepIdx ? 'bg-brand-500 w-8' : i < stepIdx ? 'bg-brand-300 w-1.5' : 'bg-gray-200 w-1.5'
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-full bg-gradient-to-r from-brand-500 to-accent-500 hover:from-brand-600 hover:to-accent-600 text-white font-semibold py-3 px-4 rounded-full transition-all flex items-center justify-center gap-2 shadow-md"
          >
            {isLast ? 'Inizia a usare FlyFile' : 'Avanti'}
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onComplete}
            className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors"
          >
            Salta il tour
          </button>
        </div>
      </div>
    </div>
  );
}
