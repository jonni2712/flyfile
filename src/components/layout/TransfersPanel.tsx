'use client';

import { useState, useEffect, useCallback } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { X, Search, ChevronDown, Copy, ExternalLink, Trash2, Calendar, Download, Lock, FileText } from 'lucide-react';
import { formatBytes } from '@/lib/format';

interface TransferItem {
  id: string;
  transferId: string;
  title: string;
  totalSize: number;
  fileCount: number;
  downloadCount: number;
  createdAt: Date;
  expiresAt?: Date;
  hasPassword: boolean;
  isExpired: boolean;
  recipientEmail?: string;
}

interface TransfersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPricing: () => void;
}

export default function TransfersPanel({ isOpen, onClose, onOpenPricing }: TransfersPanelProps) {
  const { user, userProfile } = useAuth();
  const t = useTranslations('navbar');
  const tc = useTranslations('common');

  const [transfersTab, setTransfersTab] = useState<'sent' | 'requested' | 'received'>('sent');
  const [transfersList, setTransfersList] = useState<TransferItem[]>([]);
  const [transfersLoading, setTransfersLoading] = useState(false);
  const [transfersSearch, setTransfersSearch] = useState('');
  const [transfersSortBy, setTransfersSortBy] = useState<'date' | 'size' | 'title' | 'expiry'>('date');
  const [transfersSortOpen, setTransfersSortOpen] = useState(false);
  const [transferToast, setTransferToast] = useState<string | null>(null);

  const fetchTransfers = useCallback(async () => {
    if (!user) return;
    setTransfersLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/transfer?userId=${user.uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch transfers');
      const data = await res.json();
      const now = new Date();
      const list: TransferItem[] = (data.transfers || []).map((t: Record<string, unknown>) => {
        const expiresAt = t.expiresAt ? new Date(t.expiresAt as string) : undefined;
        return {
          id: t.id as string,
          transferId: (t.transferId || t.id) as string,
          title: (t.title as string) || 'Untitled',
          totalSize: (t.totalSize as number) || 0,
          fileCount: (t.fileCount as number) || 0,
          downloadCount: (t.downloadCount as number) || 0,
          createdAt: t.createdAt ? new Date(t.createdAt as string) : now,
          expiresAt,
          hasPassword: !!t.hasPassword,
          isExpired: expiresAt ? expiresAt < now : false,
          recipientEmail: t.recipientEmail as string | undefined,
        };
      });
      setTransfersList(list);
    } catch (error) {
      console.error('Error fetching transfers:', error);
    } finally {
      setTransfersLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && user) {
      fetchTransfers();
    }
  }, [isOpen, user, fetchTransfers]);

  const filteredTransfers = transfersList
    .filter((item) => {
      if (transfersSearch.trim()) {
        const q = transfersSearch.toLowerCase();
        return item.title.toLowerCase().includes(q) || (item.recipientEmail && item.recipientEmail.toLowerCase().includes(q));
      }
      return true;
    })
    .sort((a, b) => {
      switch (transfersSortBy) {
        case 'size': return b.totalSize - a.totalSize;
        case 'title': return a.title.localeCompare(b.title);
        case 'expiry': return (b.expiresAt?.getTime() || 0) - (a.expiresAt?.getTime() || 0);
        default: return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

  const handleCopyLink = (transferId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/s/${transferId}`);
    setTransferToast(t('transfersPanel.linkCopied'));
    setTimeout(() => setTransferToast(null), 2000);
  };

  const handleDeleteTransfer = async (transferId: string) => {
    if (!user || !confirm(t('transfersPanel.confirmDelete'))) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/transfer/${transferId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'x-csrf-token': '1',
        },
      });
      if (!res.ok) throw new Error('Failed to delete transfer');
      setTransfersList((prev) => prev.filter((item) => item.transferId !== transferId));
    } catch {
      console.error('Error deleting transfer');
    }
  };

  const formatTransferDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[900px] bg-white z-[70] transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={t('transfersPanel.title')}
      >
        {/* Toast */}
        {transferToast && (
          <div className="absolute top-4 right-4 z-20 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
            {transferToast}
          </div>
        )}

        {/* Close button */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 px-6 py-4 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors min-h-[44px]"
          >
            <X className="w-5 h-5" />
            <span className="text-sm font-medium">{tc('cta.close')}</span>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 sm:px-10 pb-16">
          {/* Header */}
          <div className="mb-8">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
              {user?.email}
            </p>
            <h2 className="text-4xl font-bold text-gray-900">
              {t('transfersPanel.title')}
            </h2>
            {userProfile?.plan !== 'free' && (
              <p className="text-sm text-gray-500 mt-2">
                {formatBytes(userProfile?.storageUsed || 0)} {t('transfersPanel.usedOf')}{' '}
                {userProfile?.storageLimit === -1 ? t('transfersPanel.unlimited') : formatBytes(userProfile?.storageLimit || 0)}
              </p>
            )}
          </div>

          {/* Tabs + Sort */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setTransfersTab('sent')}
                className={`pb-2 text-base font-medium transition-colors min-h-[44px] ${
                  transfersTab === 'sent'
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {t('transfersPanel.sent')}
              </button>
              <button
                onClick={() => setTransfersTab('requested')}
                className={`pb-2 text-base font-medium transition-colors min-h-[44px] ${
                  transfersTab === 'requested'
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {t('transfersPanel.requested')}
              </button>
              <button
                onClick={() => setTransfersTab('received')}
                className={`pb-2 text-base font-medium transition-colors min-h-[44px] ${
                  transfersTab === 'received'
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {t('transfersPanel.received')}
              </button>
            </div>

            <div className="relative flex items-center gap-2">
              <span className="text-sm text-gray-400">{t('transfersPanel.sortBy')}</span>
              <button
                onClick={() => setTransfersSortOpen(!transfersSortOpen)}
                className="flex items-center gap-1 text-sm font-medium text-gray-900 underline underline-offset-2 hover:text-gray-600 transition-colors min-h-[44px]"
              >
                {{ date: t('transfersPanel.sortDate'), size: t('transfersPanel.sortSize'), title: t('transfersPanel.sortTitle'), expiry: t('transfersPanel.sortExpiry') }[transfersSortBy]}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {transfersSortOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setTransfersSortOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                    {([
                      { key: 'date', label: t('transfersPanel.sortDate') },
                      { key: 'size', label: t('transfersPanel.sortSize') },
                      { key: 'title', label: t('transfersPanel.sortTitle') },
                      { key: 'expiry', label: t('transfersPanel.sortExpiry') },
                    ] as { key: 'date' | 'size' | 'title' | 'expiry'; label: string }[]).map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          setTransfersSortBy(opt.key);
                          setTransfersSortOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors min-h-[44px] ${
                          transfersSortBy === opt.key
                            ? 'bg-blue-500 text-white font-medium'
                            : opt.key === 'expiry'
                              ? 'text-blue-600 hover:bg-gray-50'
                              : 'text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={transfersSearch}
              onChange={(e) => setTransfersSearch(e.target.value)}
              placeholder={t('transfersPanel.searchPlaceholder')}
              aria-label={t('transfersPanel.searchPlaceholder')}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors min-h-[44px]"
            />
          </div>

          {/* Usage Stats — full boxes only for free plan */}
          {userProfile?.plan === 'free' ? (
            <div className="space-y-3 mb-10">
              {/* Transfers usage */}
              <div className="flex items-center gap-4 bg-purple-50/60 border border-purple-100 rounded-xl p-4">
                <div className="shrink-0">
                  <span className="text-sm font-bold text-purple-700">
                    {userProfile?.monthlyTransfers || 0}<span className="text-purple-400">/{userProfile?.maxMonthlyTransfers || 0}</span>
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">
                    {t('transfersPanel.transfersUsage', {
                      used: String(userProfile?.monthlyTransfers || 0),
                      total: String(userProfile?.maxMonthlyTransfers || 0),
                    })}
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenPricing();
                  }}
                  className="shrink-0 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-full hover:bg-purple-700 transition-colors min-h-[44px]"
                >
                  {t('transfersPanel.increaseLimit')}
                </button>
              </div>

              {/* Storage usage */}
              <div className="flex items-center gap-4 bg-purple-50/60 border border-purple-100 rounded-xl p-4">
                <div className="shrink-0">
                  <span className="text-sm font-bold text-purple-700">
                    {formatBytes(userProfile?.storageUsed || 0).split(' ')[0]}<span className="text-purple-400">/{formatBytes(userProfile?.storageLimit || 0)}</span>
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">
                    {t('transfersPanel.storageUsage', {
                      used: formatBytes(userProfile?.storageUsed || 0),
                      total: formatBytes(userProfile?.storageLimit || 0),
                    })}
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenPricing();
                  }}
                  className="shrink-0 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-full hover:bg-purple-700 transition-colors min-h-[44px]"
                >
                  {t('transfersPanel.increaseLimit')}
                </button>
              </div>
            </div>
          ) : null}

          {/* Transfer List */}
          {transfersTab === 'sent' && (
            <>
              {transfersLoading ? (
                <div className="py-16 text-center">
                  <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">{t('transfersPanel.loading')}</p>
                </div>
              ) : filteredTransfers.length > 0 ? (
                <div className="space-y-3">
                  {filteredTransfers.map((transfer) => (
                    <div
                      key={transfer.id}
                      className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-gray-900 truncate">{transfer.title}</h4>
                            {transfer.isExpired ? (
                              <span className="shrink-0 text-[10px] font-medium bg-red-100 text-red-700 px-1.5 py-0.5 rounded">{t('transfersPanel.expired')}</span>
                            ) : (
                              <span className="shrink-0 text-[10px] font-medium bg-green-100 text-green-700 px-1.5 py-0.5 rounded">{t('transfersPanel.active')}</span>
                            )}
                            {transfer.hasPassword && (
                              <Lock className="w-3 h-3 text-gray-400 shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatTransferDate(transfer.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {transfer.fileCount}
                            </span>
                            <span>{formatBytes(transfer.totalSize)}</span>
                            <span className="flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              {transfer.downloadCount}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleCopyLink(transfer.transferId)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title={t('transfersPanel.copyLink')}
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <Link
                            href={{ pathname: '/s/[id]', params: { id: transfer.transferId } }}
                            target="_blank"
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title={t('transfersPanel.open')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          {userProfile?.plan !== 'free' && (
                            <button
                              onClick={() => handleDeleteTransfer(transfer.transferId)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                              title={t('transfersPanel.delete')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {t('transfersPanel.emptyTitle')}
                  </h3>
                  <p className="text-gray-500 text-sm max-w-md mx-auto">
                    {t('transfersPanel.emptyDesc')}
                  </p>
                </div>
              )}
            </>
          )}

          {transfersTab === 'requested' && (
            <div className="py-16 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t('transfersPanel.requestedTitle')}
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                {t('transfersPanel.requestedDesc')}
              </p>
            </div>
          )}

          {transfersTab === 'received' && (
            <div className="py-16 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t('transfersPanel.receivedTitle')}
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                {t('transfersPanel.receivedDesc')}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
