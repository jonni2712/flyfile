'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Clock,
  Activity,
  AlertCircle,
  Loader2,
  Shield,
  Code,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  lastUsedAt?: string;
  usageCount: number;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
}

export default function ApiKeysPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create key modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>(['read', 'write']);
  const [creating, setCreating] = useState(false);

  // New key display
  const [newFullKey, setNewFullKey] = useState<string | null>(null);
  const { copied, copy } = useCopyToClipboard();

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/accedi');
    }
  }, [user, loading, router]);

  useEffect(() => {
    fetchApiKeys();
  }, [user]);

  const fetchApiKeys = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/keys?userId=${user.uid}`);
      const data = await response.json();

      if (data.success) {
        setApiKeys(data.keys);
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error('Error fetching API keys:', err);
      setError('Errore nel caricamento delle API keys');
    } finally {
      setLoadingKeys(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateKey = async () => {
    if (!user || !newKeyName.trim()) return;

    setCreating(true);
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          name: newKeyName.trim(),
          permissions: newKeyPermissions,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNewFullKey(data.fullKey);
        setApiKeys((prev) => [data.apiKey, ...prev]);
        setNewKeyName('');
        showToast('API key creata con successo', 'success');
      } else {
        showToast(data.error || 'Errore nella creazione', 'error');
      }
    } catch (err) {
      showToast('Errore nella creazione della API key', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!user || !confirm('Sei sicuro di voler eliminare questa API key?')) return;

    try {
      const response = await fetch(`/api/keys/${keyId}?userId=${user.uid}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setApiKeys((prev) => prev.filter((k) => k.id !== keyId));
        showToast('API key eliminata', 'success');
      } else {
        showToast(data.error || 'Errore nell\'eliminazione', 'error');
      }
    } catch (err) {
      showToast('Errore nell\'eliminazione della API key', 'error');
    }
  };

  const handleToggleKey = async (keyId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/keys/${keyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
      });

      const data = await response.json();

      if (data.success) {
        setApiKeys((prev) =>
          prev.map((k) => (k.id === keyId ? { ...k, isActive: !k.isActive } : k))
        );
        showToast('Stato API key aggiornato', 'success');
      } else {
        showToast(data.error || 'Errore nell\'aggiornamento', 'error');
      }
    } catch (err) {
      showToast('Errore nell\'aggiornamento della API key', 'error');
    }
  };


  const togglePermission = (perm: string) => {
    setNewKeyPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  // Check if user has access (Pro or Business plan)
  const hasAccess = ['pro', 'business'].includes(userProfile.plan);

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">API Access Richiede Piano Pro</h1>
            <p className="text-gray-600 mb-6">
              Per accedere alle API pubbliche di FlyFile, passa al piano Pro o Business.
            </p>
            <a
              href="/prezzi"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Vedi i piani
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg transition-all duration-300 ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
        >
          <div className="flex items-center">
            <Check className="w-5 h-5 mr-2" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">API Keys</h1>
              <p className="text-gray-600">Gestisci le tue chiavi API per integrazioni esterne</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuova API Key
            </button>
          </div>
        </div>

        {/* New Key Display */}
        {newFullKey && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Salva la tua API Key!
                </h3>
                <p className="text-yellow-700 mb-4">
                  Questa è l'unica volta che vedrai la chiave completa. Copiala e salvala in un posto sicuro.
                </p>
                <div className="flex items-center gap-2 bg-white border border-yellow-300 rounded-lg p-3">
                  <code className="flex-1 text-sm font-mono text-gray-900 break-all">
                    {newFullKey}
                  </code>
                  <button
                    onClick={() => copy(newFullKey)}
                    className="p-2 text-yellow-700 hover:bg-yellow-100 rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <button
                  onClick={() => setNewFullKey(null)}
                  className="mt-4 text-sm text-yellow-700 hover:text-yellow-900"
                >
                  Ho salvato la chiave, chiudi questo avviso
                </button>
              </div>
            </div>
          </div>
        )}

        {/* API Keys List */}
        {loadingKeys ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Caricamento API keys...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-500">{error}</p>
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna API Key</h3>
            <p className="text-gray-500 mb-6">
              Crea la tua prima API key per iniziare a usare le API di FlyFile
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crea API Key
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className={`bg-white rounded-xl shadow-sm border p-6 ${
                  key.isActive ? 'border-gray-200' : 'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{key.name}</h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          key.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {key.isActive ? 'Attiva' : 'Disattivata'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                        {key.keyPrefix}...
                      </span>
                      <span className="flex items-center">
                        <Activity className="w-4 h-4 mr-1" />
                        {key.usageCount} chiamate
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {key.lastUsedAt
                          ? `Ultimo uso: ${new Date(key.lastUsedAt).toLocaleDateString('it-IT')}`
                          : 'Mai usata'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {key.permissions.map((perm) => (
                        <span
                          key={perm}
                          className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleKey(key.id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title={key.isActive ? 'Disattiva' : 'Attiva'}
                    >
                      {key.isActive ? (
                        <ToggleRight className="w-5 h-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteKey(key.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Elimina"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* API Documentation Link */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Code className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Documentazione API</h3>
              <p className="text-sm text-gray-600">
                Base URL: <code className="bg-white px-2 py-0.5 rounded">https://flyfile.it/api/v1</code>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Usa l'header <code className="bg-white px-2 py-0.5 rounded">Authorization: Bearer fly_xxx</code>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Crea Nuova API Key</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome
              </label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Es. Integrazione CRM"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={50}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permessi
              </label>
              <div className="flex gap-3">
                {['read', 'write', 'delete'].map((perm) => (
                  <button
                    key={perm}
                    onClick={() => togglePermission(perm)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      newKeyPermissions.includes(perm)
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {perm}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewKeyName('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleCreateKey}
                disabled={creating || !newKeyName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {creating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Crea API Key'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
