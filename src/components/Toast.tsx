'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useToastStore, Toast as ToastType } from '@/lib/toast';

const ToastIcon = ({ type }: { type: ToastType['type'] }) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    case 'error':
      return <AlertCircle className="w-5 h-5 text-red-400" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    case 'info':
      return <Info className="w-5 h-5 text-blue-400" />;
  }
};

const getToastStyles = (type: ToastType['type']) => {
  switch (type) {
    case 'success':
      return 'bg-green-500/10 border-green-500/30';
    case 'error':
      return 'bg-red-500/10 border-red-500/30';
    case 'warning':
      return 'bg-yellow-500/10 border-yellow-500/30';
    case 'info':
      return 'bg-blue-500/10 border-blue-500/30';
  }
};

interface ToastItemProps {
  toast: ToastType;
  onRemove: () => void;
}

const ToastItem = ({ toast, onRemove }: ToastItemProps) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(onRemove, 200);
  };

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-xl backdrop-blur-lg border shadow-lg
        ${getToastStyles(toast.type)}
        ${isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'}
      `}
    >
      <ToastIcon type={toast.type} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{toast.title}</p>
        {toast.message && (
          <p className="text-sm text-white/70 mt-0.5">{toast.message}</p>
        )}
      </div>
      <button
        onClick={handleRemove}
        aria-label="Dismiss notification"
        className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-4 right-4 left-4 sm:left-auto z-[100] flex flex-col gap-3 sm:max-w-sm w-auto pointer-events-none"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={() => removeToast(toast.id)} />
        </div>
      ))}
    </div>
  );
}

// Export a hook for easy access
export function useToast() {
  const { addToast, removeToast, clearToasts } = useToastStore();

  return {
    success: (title: string, message?: string) =>
      addToast({ type: 'success', title, message }),
    error: (title: string, message?: string) =>
      addToast({ type: 'error', title, message }),
    warning: (title: string, message?: string) =>
      addToast({ type: 'warning', title, message }),
    info: (title: string, message?: string) =>
      addToast({ type: 'info', title, message }),
    remove: removeToast,
    clear: clearToasts,
  };
}
