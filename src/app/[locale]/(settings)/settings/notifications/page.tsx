'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Preferences {
  transferSent: boolean;
  transferExpiring: boolean;
  transferDownloaded: boolean;
  transferViewed: boolean;
}

const DEFAULTS: Preferences = {
  transferSent: true,
  transferExpiring: true,
  transferDownloaded: true,
  transferViewed: true,
};

export default function NotificationsPage() {
  const { userProfile, updateUserProfile } = useAuth();
  const [prefs, setPrefs] = useState<Preferences>(DEFAULTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile?.notificationPreferences) {
      setPrefs({
        transferSent: userProfile.notificationPreferences.transferSent ?? true,
        transferExpiring: userProfile.notificationPreferences.transferExpiring ?? true,
        transferDownloaded: userProfile.notificationPreferences.transferDownloaded ?? true,
        transferViewed: userProfile.notificationPreferences.transferViewed ?? true,
      });
    }
  }, [userProfile]);

  const toggle = async (key: keyof Preferences) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    setSaving(true);
    try {
      await updateUserProfile({ notificationPreferences: newPrefs });
    } catch {
      // revert
      setPrefs(prefs);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      <p className="text-sm text-gray-500">
        Gestisci le tue preferenze email per rimanere informato sui tuoi trasferimenti
      </p>

      {/* Transfer info notifications */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Informazioni sui tuoi trasferimenti
        </h2>
        <div className="space-y-1">
          <ToggleRow
            title="Il tuo trasferimento è stato inviato"
            description="Ricevi una conferma quando il tuo trasferimento viene inviato con successo"
            enabled={prefs.transferSent}
            onToggle={() => toggle('transferSent')}
          />
          <ToggleRow
            title="Un trasferimento che hai inviato sta per scadere"
            description="Ricevi un promemoria prima che il tuo trasferimento scada"
            enabled={prefs.transferExpiring}
            onToggle={() => toggle('transferExpiring')}
          />
        </div>
      </section>

      {/* Download notifications */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Notifiche di download
        </h2>
        <div className="space-y-1">
          <ToggleRow
            title="Il tuo trasferimento è stato scaricato"
            description="Ricevi una notifica quando qualcuno scarica i tuoi file"
            enabled={prefs.transferDownloaded}
            onToggle={() => toggle('transferDownloaded')}
          />
        </div>
      </section>

      {/* Preview notifications */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Notifiche di anteprima
        </h2>
        <div className="space-y-1">
          <ToggleRow
            title="Un trasferimento che hai inviato è stato visualizzato"
            description="Ricevi una notifica quando qualcuno visualizza la pagina del tuo trasferimento"
            enabled={prefs.transferViewed}
            onToggle={() => toggle('transferViewed')}
          />
        </div>
      </section>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  enabled,
  onToggle,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
      <div className="pr-4">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
          enabled ? 'bg-blue-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
