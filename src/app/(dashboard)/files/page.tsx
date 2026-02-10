'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Upload,
  Search,
  ExternalLink,
  Copy,
  Trash2,
  Lock,
  FileText,
  Download,
  Calendar,
  Check,
  Square,
  CheckSquare,
  Loader2
} from 'lucide-react';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
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
  r2Key: string;
}

export default function FilesPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [filteredTransfers, setFilteredTransfers] = useState<Transfer[]>([]);
  const [loadingTransfers, setLoadingTransfers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    totalDownloads: 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/accedi');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchTransfers();
    }
  }, [user]);

  useEffect(() => {
    filterTransfers();
  }, [transfers, searchQuery, statusFilter]);

  const fetchTransfers = async () => {
    if (!user) return;

    try {
      const filesRef = collection(db, 'files');
      const q = query(
        filesRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const transfersList: Transfer[] = [];
      let activeCount = 0;
      let expiredCount = 0;
      let totalDownloads = 0;

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const expiresAt = data.expiresAt?.toDate();
        const isExpired = expiresAt ? expiresAt < new Date() : false;

        transfersList.push({
          id: docSnap.id,
          title: data.title || data.originalName || 'Trasferimento senza titolo',
          originalName: data.originalName,
          size: data.size,
          downloadCount: data.downloadCount || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          expiresAt,
          hasPassword: !!data.password,
          isExpired,
          r2Key: data.r2Key,
        });

        totalDownloads += data.downloadCount || 0;
        if (isExpired) {
          expiredCount++;
        } else {
          activeCount++;
        }
      });

      setTransfers(transfersList);
      setStats({
        total: transfersList.length,
        active: activeCount,
        expired: expiredCount,
        totalDownloads,
      });
    } catch (error) {
      console.error('Error fetching transfers:', error);
      showToast('Errore nel caricamento dei file', 'error');
    } finally {
      setLoadingTransfers(false);
    }
  };

  const filterTransfers = () => {
    let filtered = [...transfers];

    if (statusFilter === 'active') {
      filtered = filtered.filter((t) => !t.isExpired);
    } else if (statusFilter === 'expired') {
      filtered = filtered.filter((t) => t.isExpired);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.originalName.toLowerCase().includes(q)
      );
    }

    setFilteredTransfers(filtered);
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

  const handleDelete = async (transferId: string, r2Key: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo transfer? Questa azione non può essere annullata.')) {
      return;
    }

    try {
      await fetch('/api/files/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: transferId, r2Key }),
      });

      await deleteDoc(doc(db, 'files', transferId));
      setTransfers((prev) => prev.filter((t) => t.id !== transferId));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(transferId);
        return next;
      });
      showToast('Transfer eliminato con successo', 'success');
    } catch (error) {
      console.error('Error deleting transfer:', error);
      showToast('Errore durante l\'eliminazione', 'error');
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredTransfers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTransfers.map((t) => t.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    const count = selectedIds.size;
    if (!confirm(`Sei sicuro di voler eliminare ${count} file? Questa azione non può essere annullata.`)) {
      return;
    }

    setBulkDeleting(true);

    try {
      const response = await fetch('/api/files/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid,
          fileIds: Array.from(selectedIds),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Remove deleted files from state
        setTransfers((prev) => prev.filter((t) => !data.results.deleted.includes(t.id)));
        setSelectedIds(new Set());

        if (data.results.failed.length > 0) {
          showToast(
            `${data.results.deleted.length} eliminati, ${data.results.failed.length} falliti`,
            'error'
          );
        } else {
          showToast(`${data.results.deleted.length} file eliminati con successo`, 'success');
        }
      } else {
        showToast(data.error || 'Errore durante l\'eliminazione', 'error');
      }
    } catch (error) {
      console.error('Error bulk deleting:', error);
      showToast('Errore durante l\'eliminazione', 'error');
    } finally {
      setBulkDeleting(false);
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

  const getTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    if (diff <= 0) return 'Scaduto';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} giorni`;
    return `${hours} ore`;
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

  const canDelete = userProfile.plan !== 'free';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Toast Notification */}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">I miei Upload</h1>
              <p className="text-gray-600">Gestisci tutti i tuoi file caricati</p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Nuovo Upload
            </Link>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cerca per titolo..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  statusFilter === 'active'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Attivi
              </button>
              <button
                onClick={() => setStatusFilter('expired')}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  statusFilter === 'expired'
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Scaduti
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Tutti
              </button>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {canDelete && filteredTransfers.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {selectedIds.size === filteredTransfers.length && filteredTransfers.length > 0 ? (
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                  <span>
                    {selectedIds.size === filteredTransfers.length && filteredTransfers.length > 0
                      ? 'Deseleziona tutti'
                      : 'Seleziona tutti'}
                  </span>
                </button>
                {selectedIds.size > 0 && (
                  <span className="text-sm text-gray-500">
                    {selectedIds.size} di {filteredTransfers.length} selezionati
                  </span>
                )}
              </div>
              {selectedIds.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bulkDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Elimina selezionati ({selectedIds.size})
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-600/80">Transfer totali</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-green-600/80">Attivi</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
              <div className="text-sm text-red-600/80">Scaduti</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.totalDownloads}</div>
              <div className="text-sm text-purple-600/80">Download totali</div>
            </div>
          </div>
        </div>

        {/* Transfers Grid */}
        <div className="grid gap-6">
          {loadingTransfers ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Caricamento...</p>
            </div>
          ) : filteredTransfers.length > 0 ? (
            filteredTransfers.map((transfer) => (
              <div
                key={transfer.id}
                className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-all ${
                  selectedIds.has(transfer.id) ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  {/* Checkbox */}
                  {canDelete && (
                    <button
                      onClick={() => toggleSelection(transfer.id)}
                      className="mr-4 mt-1 flex-shrink-0"
                    >
                      {selectedIds.has(transfer.id) ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{transfer.title}</h3>
                      {transfer.isExpired ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Scaduto
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Attivo
                        </span>
                      )}
                      {transfer.hasPassword && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Lock className="w-3 h-3 mr-1" />
                          Protetto
                        </span>
                      )}
                    </div>

                    <div className="flex items-center text-sm text-gray-600 space-x-4 mb-3 flex-wrap">
                      <span className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        1 file
                      </span>
                      <span className="flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        {formatBytes(transfer.size)}
                      </span>
                      <span className="flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        {transfer.downloadCount} download
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(transfer.createdAt)}
                      </span>
                      {transfer.expiresAt && !transfer.isExpired && (
                        <span className="flex items-center text-orange-600">
                          Scade tra {getTimeRemaining(transfer.expiresAt)}
                        </span>
                      )}
                    </div>

                    {/* File name */}
                    <div className="text-sm text-gray-500">
                      <FileText className="w-4 h-4 inline mr-1" />
                      {transfer.originalName}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-6">
                    <Link
                      href={`/s/${transfer.id}`}
                      target="_blank"
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Apri
                    </Link>

                    <button
                      onClick={() => copyToClipboard(`${window.location.origin}/s/${transfer.id}`)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copia Link
                    </button>

                    {canDelete && (
                      <button
                        onClick={() => handleDelete(transfer.id, transfer.r2Key)}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Elimina
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun transfer trovato</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery
                  ? `Nessun risultato per "${searchQuery}"`
                  : 'Non hai ancora caricato file'}
              </p>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                Carica il primo file
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
