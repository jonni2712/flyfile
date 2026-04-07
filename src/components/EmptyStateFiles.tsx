'use client';

import { Link } from '@/i18n/navigation';
import { Upload, Camera, FileText, Film } from 'lucide-react';

const USE_CASES = [
  {
    icon: Camera,
    title: 'Foto del matrimonio',
    description: 'Centinaia di foto in alta risoluzione, condivise con un click',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: FileText,
    title: 'Documenti commercialista',
    description: 'PDF e contratti riservati con password e scadenza personalizzata',
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    icon: Film,
    title: 'Video pesanti',
    description: 'File da decine di GB senza compressione, qualità intatta',
    gradient: 'from-purple-500 to-fuchsia-500',
  },
];

export default function EmptyStateFiles() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12">
      <div className="text-center max-w-xl mx-auto">
        {/* Decorative icon */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-accent-500 rounded-2xl rotate-6" />
          <div className="absolute inset-0 bg-white rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm">
            <Upload className="w-9 h-9 text-brand-500" strokeWidth={2.25} />
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Nessun trasferimento ancora
        </h3>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Crea il tuo primo trasferimento e inizia a condividere file in modo sicuro e veloce.
          Ecco alcune idee per iniziare:
        </p>

        {/* Use case cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {USE_CASES.map((useCase, i) => {
            const Icon = useCase.icon;
            return (
              <div
                key={i}
                className="text-left p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${useCase.gradient} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm font-semibold text-gray-900 mb-1">{useCase.title}</div>
                <div className="text-xs text-gray-500 leading-snug">{useCase.description}</div>
              </div>
            );
          })}
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-500 to-accent-500 hover:from-brand-600 hover:to-accent-600 text-white font-semibold px-6 py-3 rounded-full transition-all shadow-md hover:shadow-lg"
        >
          <Upload className="w-4 h-4" />
          Crea il tuo primo trasferimento
        </Link>
      </div>
    </div>
  );
}
