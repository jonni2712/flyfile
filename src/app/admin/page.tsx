'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AdminStats {
  totalUsers: number;
  totalTransfers: number;
  totalStorageUsed: number;
  totalDownloads: number;
  activeSubscriptions: number;
  betaTesters: number;
  recentSignups: number;
  planDistribution: {
    free: number;
    starter: number;
    pro: number;
    business: number;
  };
}

interface User {
  id: string;
  email: string;
  displayName: string;
  plan: string;
  storageUsed: number;
  isBetaTester: boolean;
  isAdmin: boolean;
  createdAt: string;
}

interface Transfer {
  id: string;
  transferId: string;
  title: string;
  userId: string;
  userEmail: string;
  fileCount: number;
  totalSize: number;
  downloadCount: number;
  status: string;
  createdAt: string;
  expiresAt: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'transfers' | 'messages'>('stats');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingMessage, setViewingMessage] = useState<ContactMessage | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchData();
    }
  }, [user, authLoading, router]);

  const fetchData = async (showRefreshing = false) => {
    if (!user) return;

    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // SECURITY FIX: Use Authorization header instead of userId query param
      const idToken = await user.getIdToken();
      const headers = {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      };

      // Fetch all data in parallel for better performance
      const [statsRes, usersRes, transfersRes, messagesRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/transfers?limit=100', { headers }),
        fetch('/api/admin/messages', { headers }),
      ]);

      const statsData = await statsRes.json();

      if (!statsRes.ok) {
        if (statsRes.status === 403) {
          setError('Non hai i permessi di amministratore per accedere a questa pagina.');
          return;
        }
        throw new Error(statsData.error || 'Errore nel caricamento delle statistiche');
      }

      setStats(statsData.stats);

      const usersData = await usersRes.json();
      if (usersRes.ok) {
        setUsers(usersData.users);
      }

      const transfersData = await transfersRes.json();
      if (transfersRes.ok) {
        setTransfers(transfersData.transfers || []);
      }

      const messagesData = await messagesRes.json();
      if (messagesRes.ok) {
        setContactMessages(messagesData.messages || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateUser = async (targetUserId: string, updates: Record<string, unknown>) => {
    if (!user) return;

    try {
      // SECURITY FIX: Use Authorization header
      const idToken = await user.getIdToken();

      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId,
          updates,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Errore nell\'aggiornamento');
      }

      // Refresh data
      fetchData();
      setEditingUser(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Errore');
    }
  };

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Accesso Negato</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/upload" className="text-blue-600 hover:underline">
            Torna alla Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/upload" className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
              Admin
            </span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-4 border-b flex-1">
            <button
              onClick={() => setActiveTab('stats')}
              className={`pb-2 px-1 ${activeTab === 'stats' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            >
              Statistiche
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-2 px-1 ${activeTab === 'users' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            >
              Utenti ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('transfers')}
              className={`pb-2 px-1 ${activeTab === 'transfers' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            >
              Trasferimenti ({transfers.length})
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`pb-2 px-1 relative ${activeTab === 'messages' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            >
              Messaggi
              {contactMessages.filter(m => m.status === 'new').length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {contactMessages.filter(m => m.status === 'new').length}
                </span>
              )}
            </button>
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="ml-4 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
          >
            <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? 'Aggiornamento...' : 'Aggiorna'}
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Users */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Utenti Totali</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-green-600 mt-2">+{stats.recentSignups} questo mese</p>
            </div>

            {/* Total Transfers */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Trasferimenti</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalTransfers}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">{stats.totalDownloads} download totali</p>
            </div>

            {/* Storage Used */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Storage Utilizzato</p>
                  <p className="text-3xl font-bold text-gray-900">{formatBytes(stats.totalStorageUsed)}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Active Subscriptions */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Abbonamenti Attivi</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">{stats.betaTesters} beta tester</p>
            </div>

            {/* Plan Distribution */}
            <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuzione Piani</h3>
              <div className="space-y-3">
                {Object.entries(stats.planDistribution).map(([plan, count]) => (
                  <div key={plan} className="flex items-center gap-3">
                    <span className="w-20 text-sm text-gray-600 capitalize">{plan}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full ${
                          plan === 'free' ? 'bg-gray-400' :
                          plan === 'starter' ? 'bg-blue-400' :
                          plan === 'pro' ? 'bg-purple-400' :
                          'bg-yellow-400'
                        }`}
                        style={{ width: `${stats.totalUsers > 0 ? (count / stats.totalUsers) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="w-12 text-sm text-gray-600 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow">
            {/* Search */}
            <div className="p-4 border-b">
              <input
                type="text"
                placeholder="Cerca utenti per email o nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Utente</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Piano</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Storage</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Registrato</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{u.displayName || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{u.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.plan === 'free' ? 'bg-gray-100 text-gray-800' :
                          u.plan === 'starter' ? 'bg-blue-100 text-blue-800' :
                          u.plan === 'pro' ? 'bg-purple-100 text-purple-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {u.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatBytes(u.storageUsed)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {u.isBetaTester && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Beta</span>
                          )}
                          {u.isAdmin && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Admin</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('it-IT') : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setEditingUser(u)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Modifica
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'transfers' && (
          <div className="bg-white rounded-lg shadow">
            {/* Search */}
            <div className="p-4 border-b">
              <input
                type="text"
                placeholder="Cerca trasferimenti per titolo o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Transfers Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Titolo</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Utente</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">File</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Dimensione</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Download</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Stato</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Creato</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Scadenza</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transfers
                    .filter(t =>
                      t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      t.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((t) => {
                      const isExpired = new Date(t.expiresAt) < new Date();
                      return (
                        <tr key={t.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">{t.title || 'Senza titolo'}</p>
                            <p className="text-xs text-gray-400">{t.transferId}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {t.userEmail || 'Anonimo'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {t.fileCount} file
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatBytes(t.totalSize)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {t.downloadCount}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isExpired ? 'bg-red-100 text-red-800' :
                              t.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {isExpired ? 'Scaduto' : t.status || 'Attivo'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {t.createdAt ? new Date(t.createdAt).toLocaleDateString('it-IT') : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {t.expiresAt ? new Date(t.expiresAt).toLocaleDateString('it-IT') : 'N/A'}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              {transfers.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  Nessun trasferimento trovato
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="bg-white rounded-lg shadow">
            {/* Messages List */}
            <div className="divide-y divide-gray-200">
              {contactMessages.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Nessun messaggio ricevuto
                </div>
              ) : (
                contactMessages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => setViewingMessage(msg)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${msg.status === 'new' ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-medium ${msg.status === 'new' ? 'text-blue-900' : 'text-gray-900'}`}>
                            {msg.subject}
                          </h3>
                          {msg.status === 'new' && (
                            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">Nuovo</span>
                          )}
                          {msg.status === 'replied' && (
                            <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">Risposto</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Da: <span className="font-medium">{msg.name}</span> ({msg.email})
                          {msg.company && <span className="text-gray-400"> - {msg.company}</span>}
                        </p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{msg.message}</p>
                      </div>
                      <div className="text-sm text-gray-400 ml-4 whitespace-nowrap">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString('it-IT', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Modifica Utente</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{editingUser.email}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Piano</label>
                <select
                  defaultValue={editingUser.plan}
                  id="edit-plan"
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="free">Free</option>
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                  <option value="business">Business</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-beta"
                  defaultChecked={editingUser.isBetaTester}
                />
                <label htmlFor="edit-beta" className="text-sm text-gray-600">Beta Tester</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-admin"
                  defaultChecked={editingUser.isAdmin}
                />
                <label htmlFor="edit-admin" className="text-sm text-gray-600">Amministratore</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annulla
              </button>
              <button
                onClick={() => {
                  const plan = (document.getElementById('edit-plan') as HTMLSelectElement).value;
                  const isBetaTester = (document.getElementById('edit-beta') as HTMLInputElement).checked;
                  const isAdmin = (document.getElementById('edit-admin') as HTMLInputElement).checked;
                  handleUpdateUser(editingUser.id, { plan, isBetaTester, isAdmin });
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Salva
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Message Modal */}
      {viewingMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{viewingMessage.subject}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Da: <span className="font-medium">{viewingMessage.name}</span> ({viewingMessage.email})
                    {viewingMessage.company && <span> - {viewingMessage.company}</span>}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {viewingMessage.createdAt ? new Date(viewingMessage.createdAt).toLocaleString('it-IT') : 'N/A'}
                  </p>
                </div>
                <button
                  onClick={() => setViewingMessage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-gray-700">
                {viewingMessage.message}
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-between">
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  viewingMessage.status === 'new' ? 'bg-blue-100 text-blue-800' :
                  viewingMessage.status === 'replied' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {viewingMessage.status === 'new' ? 'Nuovo' :
                   viewingMessage.status === 'replied' ? 'Risposto' : 'Letto'}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setViewingMessage(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Chiudi
                </button>
                <a
                  href={`mailto:${viewingMessage.email}?subject=Re: ${encodeURIComponent(viewingMessage.subject)}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Rispondi via Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
