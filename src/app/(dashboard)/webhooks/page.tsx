'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Webhook,
  Plus,
  Trash2,
  Copy,
  Check,
  Clock,
  Activity,
  AlertCircle,
  Loader2,
  Shield,
  ToggleLeft,
  ToggleRight,
  Bell,
  Globe,
  XCircle,
  CheckCircle
} from 'lucide-react';

interface WebhookData {
  id: string;
  name: string;
  url: string;
  secret: string;
  events: string[];
  isActive: boolean;
  failureCount: number;
  lastTriggeredAt?: string;
  lastStatus?: number;
  createdAt: string;
}

interface WebhookEvent {
  event: string;
  label: string;
  description: string;
}

export default function WebhooksPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [webhooks, setWebhooks] = useState<WebhookData[]>([]);
  const [availableEvents, setAvailableEvents] = useState<WebhookEvent[]>([]);
  const [loadingWebhooks, setLoadingWebhooks] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newEvents, setNewEvents] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  // New secret display
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/accedi');
    }
  }, [user, loading, router]);

  useEffect(() => {
    fetchWebhooks();
  }, [user]);

  const fetchWebhooks = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/webhooks?userId=${user.uid}`);
      const data = await response.json();

      if (data.success) {
        setWebhooks(data.webhooks);
        setAvailableEvents(data.availableEvents || []);
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error('Error fetching webhooks:', err);
      setError('Errore nel caricamento dei webhooks');
    } finally {
      setLoadingWebhooks(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateWebhook = async () => {
    if (!user || !newName.trim() || !newUrl.trim() || newEvents.length === 0) return;

    setCreating(true);
    try {
      const response = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          name: newName.trim(),
          url: newUrl.trim(),
          events: newEvents,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNewSecret(data.fullSecret);
        setWebhooks((prev) => [data.webhook, ...prev]);
        setNewName('');
        setNewUrl('');
        setNewEvents([]);
        showToast('Webhook creato con successo', 'success');
      } else {
        showToast(data.error || 'Errore nella creazione', 'error');
      }
    } catch (err) {
      showToast('Errore nella creazione del webhook', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!user || !confirm('Sei sicuro di voler eliminare questo webhook?')) return;

    try {
      const response = await fetch(`/api/webhooks/${webhookId}?userId=${user.uid}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setWebhooks((prev) => prev.filter((w) => w.id !== webhookId));
        showToast('Webhook eliminato', 'success');
      } else {
        showToast(data.error || 'Errore nell\'eliminazione', 'error');
      }
    } catch (err) {
      showToast('Errore nell\'eliminazione del webhook', 'error');
    }
  };

  const handleToggleWebhook = async (webhookId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/webhooks/${webhookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, action: 'toggle' }),
      });

      const data = await response.json();

      if (data.success) {
        setWebhooks((prev) =>
          prev.map((w) => (w.id === webhookId ? { ...w, isActive: !w.isActive } : w))
        );
        showToast('Stato webhook aggiornato', 'success');
      } else {
        showToast(data.error || 'Errore nell\'aggiornamento', 'error');
      }
    } catch (err) {
      showToast('Errore nell\'aggiornamento del webhook', 'error');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleEvent = (event: string) => {
    setNewEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  const getStatusIcon = (webhook: WebhookData) => {
    if (!webhook.lastStatus) return null;
    if (webhook.lastStatus >= 200 && webhook.lastStatus < 300) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <XCircle className="w-4 h-4 text-red-500" />;
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

  // Check if user has access (Business plan only)
  const hasAccess = userProfile.plan === 'business';

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Webhooks Richiede Piano Business</h1>
            <p className="text-gray-600 mb-6">
              Per usare i webhooks e ricevere notifiche in tempo reale, passa al piano Business.
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Webhooks</h1>
              <p className="text-gray-600">Ricevi notifiche in tempo reale per gli eventi FlyFile</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Webhook
            </button>
          </div>
        </div>

        {/* New Secret Display */}
        {newSecret && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Salva il Webhook Secret!
                </h3>
                <p className="text-yellow-700 mb-4">
                  Usa questo secret per verificare le firme dei webhook. Non sarà più visibile.
                </p>
                <div className="flex items-center gap-2 bg-white border border-yellow-300 rounded-lg p-3">
                  <code className="flex-1 text-sm font-mono text-gray-900 break-all">
                    {newSecret}
                  </code>
                  <button
                    onClick={() => copyToClipboard(newSecret)}
                    className="p-2 text-yellow-700 hover:bg-yellow-100 rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <button
                  onClick={() => setNewSecret(null)}
                  className="mt-4 text-sm text-yellow-700 hover:text-yellow-900"
                >
                  Ho salvato il secret, chiudi questo avviso
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Webhooks List */}
        {loadingWebhooks ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Caricamento webhooks...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-500">{error}</p>
          </div>
        ) : webhooks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun Webhook</h3>
            <p className="text-gray-500 mb-6">
              Crea il tuo primo webhook per ricevere notifiche in tempo reale
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crea Webhook
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <div
                key={webhook.id}
                className={`bg-white rounded-xl shadow-sm border p-6 ${
                  webhook.isActive ? 'border-gray-200' : 'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{webhook.name}</h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          webhook.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {webhook.isActive ? 'Attivo' : 'Disattivato'}
                      </span>
                      {webhook.failureCount >= 5 && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                          {webhook.failureCount} fallimenti
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center">
                        <Globe className="w-4 h-4 mr-1" />
                        <span className="font-mono text-xs truncate max-w-[300px]">{webhook.url}</span>
                      </span>
                      {webhook.lastTriggeredAt && (
                        <span className="flex items-center gap-1">
                          {getStatusIcon(webhook)}
                          <Clock className="w-4 h-4" />
                          {new Date(webhook.lastTriggeredAt).toLocaleDateString('it-IT')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {webhook.events.map((event) => (
                        <span
                          key={event}
                          className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded"
                        >
                          {event}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleWebhook(webhook.id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title={webhook.isActive ? 'Disattiva' : 'Attiva'}
                    >
                      {webhook.isActive ? (
                        <ToggleRight className="w-5 h-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteWebhook(webhook.id)}
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
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Crea Nuovo Webhook</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Es. Notifiche Slack"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={50}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">URL Endpoint</label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com/webhook"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Deve essere un URL HTTPS</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Eventi</label>
              <div className="space-y-2">
                {availableEvents.map((event) => (
                  <button
                    key={event.event}
                    onClick={() => toggleEvent(event.event)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                      newEvents.includes(event.event)
                        ? 'bg-purple-50 border-purple-300 text-purple-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{event.label}</div>
                    <div className="text-xs opacity-75">{event.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewName('');
                  setNewUrl('');
                  setNewEvents([]);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleCreateWebhook}
                disabled={creating || !newName.trim() || !newUrl.trim() || newEvents.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {creating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Crea Webhook'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
