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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'transfers'>('stats');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchData();
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch stats
      const statsRes = await fetch(`/api/admin/stats?userId=${user.uid}`);
      const statsData = await statsRes.json();

      if (!statsRes.ok) {
        if (statsRes.status === 403) {
          setError('Non hai i permessi di amministratore per accedere a questa pagina.');
          return;
        }
        throw new Error(statsData.error || 'Errore nel caricamento delle statistiche');
      }

      setStats(statsData.stats);

      // Fetch users
      const usersRes = await fetch(`/api/admin/users?userId=${user.uid}`);
      const usersData = await usersRes.json();

      if (usersRes.ok) {
        setUsers(usersData.users);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, updates: Record<string, unknown>) => {
    if (!user) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          targetUserId: userId,
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
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Torna alla Dashboard
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
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
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
        <div className="flex gap-4 border-b">
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
            Trasferimenti
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
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">Gestione trasferimenti in arrivo...</p>
            <Link href="/api/admin/transfers" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
              Visualizza via API
            </Link>
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
    </div>
  );
}
