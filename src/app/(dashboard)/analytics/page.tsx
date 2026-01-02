'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  BarChart3,
  Download,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Calendar,
  TrendingUp,
  FileText,
  Loader2,
  Chrome,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

interface UserAnalytics {
  totalDownloads: number;
  totalTransfersWithDownloads: number;
  topTransfers: Array<{ transferId: string; title: string; downloads: number }>;
  recentDownloads: Array<{
    transferId: string;
    browser: string;
    downloadedAt: Date;
  }>;
  downloadsByDay: Record<string, number>;
}

export default function AnalyticsPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/analytics/user?userId=${user.uid}`);
        const data = await response.json();

        if (data.success) {
          // Parse dates
          data.analytics.recentDownloads = data.analytics.recentDownloads.map(
            (d: { downloadedAt: string }) => ({
              ...d,
              downloadedAt: new Date(d.downloadedAt),
            })
          );
          setAnalytics(data.analytics);
        } else {
          setError(data.error);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Errore nel caricamento delle analytics');
      } finally {
        setLoadingAnalytics(false);
      }
    };

    fetchAnalytics();
  }, [user]);

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

  // Calculate last 7 days data for chart
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      days.push({
        date: key,
        label: date.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric' }),
        downloads: analytics?.downloadsByDay[key] || 0,
      });
    }
    return days;
  };

  const last7Days = analytics ? getLast7Days() : [];
  const maxDownloads = Math.max(...last7Days.map((d) => d.downloads), 1);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
              <p className="text-gray-600">Monitora le performance dei tuoi trasferimenti</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Dashboard Analytics</span>
            </div>
          </div>
        </div>

        {loadingAnalytics ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Caricamento analytics...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : analytics ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Download className="w-6 h-6 text-blue-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {analytics.totalDownloads}
                </div>
                <div className="text-sm text-gray-600">Download totali</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {analytics.totalTransfersWithDownloads}
                </div>
                <div className="text-sm text-gray-600">Transfer con download</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {last7Days.reduce((sum, d) => sum + d.downloads, 0)}
                </div>
                <div className="text-sm text-gray-600">Download ultimi 7 giorni</div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Download ultimi 7 giorni</h2>
              <div className="flex items-end justify-between gap-2 h-48">
                {last7Days.map((day) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col items-center">
                      <span className="text-sm font-medium text-gray-900 mb-2">
                        {day.downloads}
                      </span>
                      <div
                        className="w-full bg-blue-500 rounded-t-lg transition-all duration-300"
                        style={{
                          height: `${Math.max((day.downloads / maxDownloads) * 140, 4)}px`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 mt-2">{day.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Transfers */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Transfer più scaricati</h2>
                {analytics.topTransfers.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.topTransfers.map((transfer, index) => (
                      <Link
                        key={transfer.transferId}
                        href={`/files?transfer=${transfer.transferId}`}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm mr-3">
                            {index + 1}
                          </div>
                          <span className="text-gray-900 font-medium truncate max-w-[200px]">
                            {transfer.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{transfer.downloads} download</span>
                          <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Nessun download ancora
                  </p>
                )}
              </div>

              {/* Recent Downloads */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Download recenti</h2>
                {analytics.recentDownloads.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.recentDownloads.map((download, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div className="p-2 bg-gray-100 rounded-lg mr-3">
                            {download.browser === 'Chrome' && <Chrome className="w-5 h-5 text-gray-600" />}
                            {download.browser === 'Firefox' && <Globe className="w-5 h-5 text-orange-500" />}
                            {download.browser === 'Safari' && <Globe className="w-5 h-5 text-blue-500" />}
                            {!['Chrome', 'Firefox', 'Safari'].includes(download.browser) && (
                              <Globe className="w-5 h-5 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {download.browser}
                            </div>
                            <div className="text-xs text-gray-500">
                              {download.downloadedAt.toLocaleDateString('it-IT', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Nessun download recente
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun dato disponibile</h3>
            <p className="text-gray-500">
              Inizia a condividere file per vedere le tue analytics
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
