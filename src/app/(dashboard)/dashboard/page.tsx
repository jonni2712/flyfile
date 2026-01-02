'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import {
  Upload,
  Download,
  HardDrive,
  Zap,
  BarChart3,
  Copy,
  ExternalLink,
  Lock,
  Trash2,
  Pencil,
  Check,
  X,
  CreditCard,
  Users,
  Cloud
} from 'lucide-react';
import Link from 'next/link';
import { PLANS } from '@/types';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Transfer {
  id: string;
  title: string;
  originalName: string;
  size: number;
  downloadCount: number;
  createdAt: Date;
  expiresAt?: Date;
  hasPassword: boolean;
  isExpired: boolean;
}

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [recentTransfers, setRecentTransfers] = useState<Transfer[]>([]);
  const [loadingTransfers, setLoadingTransfers] = useState(true);
  const [stats, setStats] = useState({
    totalTransfers: 0,
    totalDownloads: 0,
    activeTransfers: 0,
  });
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deletingTransfer, setDeletingTransfer] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchRecentTransfers();
    }
  }, [user]);

  const fetchRecentTransfers = async () => {
    if (!user) return;

    try {
      const transfersRef = collection(db, 'transfers');
      const q = query(
        transfersRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      );

      const snapshot = await getDocs(q);
      const transfers: Transfer[] = [];
      let totalDownloads = 0;
      let activeCount = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const expiresAt = data.expiresAt?.toDate();
        const isExpired = expiresAt ? expiresAt < new Date() : false;

        transfers.push({
          id: data.transferId || doc.id,
          title: data.title || 'Trasferimento senza titolo',
          originalName: data.title,
          size: data.totalSize || 0,
          downloadCount: data.downloadCount || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          expiresAt,
          hasPassword: !!data.password,
          isExpired,
        });

        totalDownloads += data.downloadCount || 0;
        if (!isExpired) activeCount++;
      });

      setRecentTransfers(transfers);
      setStats({
        totalTransfers: snapshot.size,
        totalDownloads,
        activeTransfers: activeCount,
      });
    } catch (error) {
      console.error('Error fetching transfers:', error);
    } finally {
      setLoadingTransfers(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Link copiato negli appunti!', 'success');
    }).catch(() => {
      showToast('Errore durante la copia', 'error');
    });
  };

  const deleteTransfer = async (transferId: string) => {
    if (!user) return;

    if (!confirm('Sei sicuro di voler eliminare questo trasferimento? Questa azione non può essere annullata.')) {
      return;
    }

    setDeletingTransfer(transferId);
    try {
      const response = await fetch(`/api/transfer/${transferId}?userId=${user.uid}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast('Trasferimento eliminato con successo!', 'success');
        // Refresh the transfers list
        fetchRecentTransfers();
      } else {
        const data = await response.json();
        showToast(data.error || 'Errore durante l\'eliminazione', 'error');
      }
    } catch (error) {
      console.error('Error deleting transfer:', error);
      showToast('Errore durante l\'eliminazione', 'error');
    } finally {
      setDeletingTransfer(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  const plan = PLANS[userProfile.plan] || PLANS.free;
  const isPaidPlan = userProfile.plan !== 'free';

  return (
    <div className="min-h-screen bg-white py-12">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          <div className="flex items-center">
            <Check className="w-5 h-5 mr-2" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50"></div>

        {/* Animated glass orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
      </div>

      {/* Main content with relative positioning */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100/80 border border-blue-200/50 rounded-full mb-6 backdrop-blur-sm">
              <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-blue-800 text-sm font-medium">Dashboard Controllo</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              La tua{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Benvenuto nel tuo pannello di controllo FlyFile. Monitora i tuoi trasferimenti e gestisci il tuo account.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Total Transfers */}
            <div className="backdrop-blur-sm bg-white/70 rounded-2xl p-6 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Upload className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{stats.totalTransfers}</h3>
              <p className="text-gray-600">Trasferimenti totali</p>
            </div>

            {/* Total Downloads */}
            <div className="backdrop-blur-sm bg-white/70 rounded-2xl p-6 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg">
                  <Download className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{stats.totalDownloads}</h3>
              <p className="text-gray-600">Download totali</p>
            </div>

            {/* Storage Used */}
            <div className="backdrop-blur-sm bg-white/70 rounded-2xl p-6 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                  <HardDrive className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{formatBytes(userProfile.storageUsed)}</h3>
              <p className="text-gray-600">Spazio utilizzato</p>
            </div>

            {/* Active Transfers */}
            <div className="backdrop-blur-sm bg-white/70 rounded-2xl p-6 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{stats.activeTransfers}</h3>
              <p className="text-gray-600">Trasferimenti attivi</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Transfers */}
            <div className="backdrop-blur-sm bg-white/70 rounded-2xl p-8 border border-white/50 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Trasferimenti recenti</h2>
              {loadingTransfers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : recentTransfers.length > 0 ? (
                <div className="space-y-4">
                  {recentTransfers.map((transfer) => (
                    <div
                      key={transfer.id}
                      className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-gray-200/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {editingTitle === transfer.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="font-semibold text-gray-800 bg-white border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ minWidth: '150px', maxWidth: '300px' }}
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    // Save logic would go here
                                    setEditingTitle(null);
                                    showToast('Titolo aggiornato con successo!', 'success');
                                  } else if (e.key === 'Escape') {
                                    setEditingTitle(null);
                                  }
                                }}
                              />
                              <button
                                className="inline-flex items-center justify-center w-7 h-7 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors shadow-sm"
                                onClick={() => {
                                  setEditingTitle(null);
                                  showToast('Titolo aggiornato con successo!', 'success');
                                }}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                className="inline-flex items-center justify-center w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-sm"
                                onClick={() => setEditingTitle(null)}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <h3 className="font-semibold text-gray-800 cursor-pointer hover:text-blue-600">
                                {transfer.title}
                              </h3>
                              <button
                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                onClick={() => {
                                  setEditingTitle(transfer.id);
                                  setNewTitle(transfer.title);
                                }}
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{formatDate(transfer.createdAt)}</p>
                        <p className="text-sm text-gray-500">{transfer.downloadCount} download</p>

                        {!transfer.isExpired && (
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <button
                              onClick={() => copyToClipboard(`${window.location.origin}/download/${transfer.id}`)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors cursor-pointer"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copia link
                            </button>
                            <Link
                              href={`/download/${transfer.id}`}
                              target="_blank"
                              className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Visualizza
                            </Link>
                            {isPaidPlan && (
                              <button className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200 transition-colors">
                                <Lock className="w-3 h-3 mr-1" />
                                {transfer.hasPassword ? 'Modifica password' : 'Imposta password'}
                              </button>
                            )}
                            <button
                              onClick={() => deleteTransfer(transfer.id)}
                              disabled={deletingTransfer === transfer.id}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {deletingTransfer === transfer.id ? (
                                <>
                                  <div className="w-3 h-3 mr-1 border-2 border-red-800 border-t-transparent rounded-full animate-spin"></div>
                                  Eliminando...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Elimina
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-medium text-gray-800">{formatBytes(transfer.size)}</p>
                        {transfer.isExpired ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            Scaduto
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Attivo
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Cloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nessun trasferimento recente</p>
                </div>
              )}
            </div>

            {/* Plan Limits */}
            <div className="backdrop-blur-sm bg-white/70 rounded-2xl p-8 border border-white/50 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Piano e limiti</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-gray-200/50 backdrop-blur-sm">
                  <div>
                    <h3 className="font-semibold text-gray-800">Piano attuale</h3>
                    <p className="text-sm text-gray-600">{plan.name}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                      userProfile.plan === 'business' ? 'bg-purple-100 text-purple-800' :
                      userProfile.plan === 'pro' ? 'bg-green-100 text-green-800' :
                      userProfile.plan === 'starter' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {plan.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-gray-200/50 backdrop-blur-sm">
                  <div>
                    <h3 className="font-semibold text-gray-800">Dimensione file</h3>
                    <p className="text-sm text-gray-600">Illimitata</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-gray-200/50 backdrop-blur-sm">
                  <div>
                    <h3 className="font-semibold text-gray-800">Dimensione transfer</h3>
                    <p className="text-sm text-gray-600">Illimitata</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-gray-200/50 backdrop-blur-sm">
                  <div>
                    <h3 className="font-semibold text-gray-800">Durata conservazione</h3>
                    <p className="text-sm text-gray-600">
                      {plan.retentionDays === 365 ? '1 anno' : `${plan.retentionDays} giorni`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-gray-200/50 backdrop-blur-sm">
                  <div>
                    <h3 className="font-semibold text-gray-800">Quota mensile</h3>
                    <p className="text-sm text-gray-600">
                      {userProfile.storageLimit === -1 ? 'Illimitato' : formatBytes(userProfile.storageLimit)}
                    </p>
                  </div>
                </div>
              </div>

              {!isPaidPlan ? (
                <div className="mt-6">
                  <Link href="/pricing">
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                      Aggiorna il piano
                    </Button>
                  </Link>
                </div>
              ) : (
                /* Subscription Management for paid plans */
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                      <h3 className="font-semibold text-blue-800">Gestione Abbonamento</h3>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      userProfile.plan === 'business' ? 'bg-purple-100 text-purple-800' :
                      userProfile.plan === 'pro' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {plan.name}
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 mb-4">
                    Gestisci il tuo abbonamento, visualizza le fatture e aggiorna i metodi di pagamento
                  </p>

                  <Button
                    variant="outline"
                    className="w-full border-blue-300 text-blue-700 bg-white hover:bg-blue-50"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Apri Portale Abbonamento
                  </Button>

                  <div className="mt-3 text-xs text-blue-600">
                    <ul className="space-y-1">
                      <li className="flex items-center">
                        <Check className="w-3 h-3 mr-1" />
                        Visualizza e scarica fatture
                      </li>
                      <li className="flex items-center">
                        <Check className="w-3 h-3 mr-1" />
                        Cambia o annulla piano
                      </li>
                      <li className="flex items-center">
                        <Check className="w-3 h-3 mr-1" />
                        Aggiorna metodo di pagamento
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Team Management Section for Business Plans */}
              {userProfile.plan === 'business' && (
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-purple-600 mr-2" />
                      <h3 className="font-semibold text-purple-800">Gestione Team</h3>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                      Business
                    </span>
                  </div>
                  <p className="text-sm text-purple-700 mb-3">
                    Collaborazione avanzata con 3 membri inclusi
                  </p>

                  <Button
                    variant="outline"
                    className="w-full border-purple-300 text-purple-700 bg-white hover:bg-purple-50"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Gestisci Team
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Upload Button */}
          <div className="mt-12 text-center">
            <div className="backdrop-blur-sm bg-white/60 rounded-2xl p-8 border border-white/50 shadow-xl inline-block">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Pronto per iniziare?</h3>
              <Link href="/upload">
                <Button
                  size="lg"
                  className="px-8 py-4 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                >
                  <Upload className="w-6 h-6 mr-3" />
                  Carica nuovi file
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for blob animation */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
