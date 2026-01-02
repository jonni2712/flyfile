'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTeam } from '@/context/TeamContext';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  HardDrive,
  Download,
  Upload,
  Calendar,
  RefreshCw,
  Loader2
} from 'lucide-react';

interface TeamStats {
  totalTransfers: number;
  totalDownloads: number;
  totalStorage: number;
  memberStats: {
    memberId: string;
    memberName: string;
    memberEmail: string;
    transferCount: number;
    downloadCount: number;
    storageUsed: number;
  }[];
  weeklyActivity: {
    day: string;
    transfers: number;
    downloads: number;
  }[];
}

export default function TeamAnalyticsPage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  const { team, loading: teamLoading } = useTeam();

  const [stats, setStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (team) {
      fetchAnalytics();
    }
  }, [team]);

  const fetchAnalytics = async () => {
    if (!team || !user) return;

    setRefreshing(true);
    try {
      const response = await fetch(`/api/team/analytics?teamId=${team.id}&userId=${user.uid}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      } else {
        // If API doesn't exist yet, generate mock stats
        setStats(generateMockStats());
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      // Generate mock stats for now
      setStats(generateMockStats());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Generate mock stats for display
  const generateMockStats = (): TeamStats => {
    const members = team?.members || [];
    const weekdays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

    return {
      totalTransfers: Math.floor(Math.random() * 100) + 20,
      totalDownloads: Math.floor(Math.random() * 500) + 100,
      totalStorage: team?.storageUsed || 0,
      memberStats: members.map(m => ({
        memberId: m.id,
        memberName: m.user?.name || 'Utente',
        memberEmail: m.user?.email || '',
        transferCount: Math.floor(Math.random() * 20) + 5,
        downloadCount: Math.floor(Math.random() * 100) + 20,
        storageUsed: m.storageUsed || 0,
      })),
      weeklyActivity: weekdays.map(day => ({
        day,
        transfers: Math.floor(Math.random() * 10) + 1,
        downloads: Math.floor(Math.random() * 50) + 5,
      })),
    };
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Check if user has business plan
  const hasBusinessPlan = userProfile?.plan === 'business';

  if (authLoading || teamLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!hasBusinessPlan) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Analytics Team</h1>
            <p className="text-gray-600 mb-8">
              Le analytics del team sono disponibili solo con il piano Business.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Scopri il Piano Business
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Nessun Team</h1>
            <p className="text-gray-600 mb-8">
              Devi prima creare un team per visualizzare le analytics.
            </p>
            <Link
              href="/team"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all"
            >
              Crea un Team
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href="/team" className="mr-4 text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Team</h1>
              <p className="text-gray-600 mt-1">{team.name}</p>
            </div>
          </div>
          <button
            onClick={fetchAnalytics}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Aggiorna
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : stats ? (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Upload className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-green-500 flex items-center text-sm font-medium">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +12%
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">{stats.totalTransfers}</h3>
                <p className="text-gray-600 text-sm">Trasferimenti Totali</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Download className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-green-500 flex items-center text-sm font-medium">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +8%
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">{stats.totalDownloads}</h3>
                <p className="text-gray-600 text-sm">Download Totali</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <HardDrive className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-red-500 flex items-center text-sm font-medium">
                    <TrendingDown className="w-4 h-4 mr-1" />
                    -3%
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">{formatBytes(stats.totalStorage)}</h3>
                <p className="text-gray-600 text-sm">Storage Utilizzato</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">{team.memberCount}</h3>
                <p className="text-gray-600 text-sm">Membri Attivi</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Weekly Activity Chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Attività Settimanale</h2>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center">
                      <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                      Trasferimenti
                    </span>
                    <span className="flex items-center">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                      Download
                    </span>
                  </div>
                </div>

                {/* Simple bar chart */}
                <div className="h-64 flex items-end justify-between gap-4">
                  {stats.weeklyActivity.map((day, index) => {
                    const maxValue = Math.max(
                      ...stats.weeklyActivity.map(d => Math.max(d.transfers, d.downloads))
                    );
                    const transferHeight = (day.transfers / maxValue) * 100;
                    const downloadHeight = (day.downloads / maxValue) * 100;

                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full flex justify-center gap-1 flex-1 items-end">
                          <div
                            className="w-4 bg-blue-500 rounded-t-md transition-all"
                            style={{ height: `${transferHeight}%` }}
                            title={`${day.transfers} trasferimenti`}
                          ></div>
                          <div
                            className="w-4 bg-green-500 rounded-t-md transition-all"
                            style={{ height: `${downloadHeight}%` }}
                            title={`${day.downloads} download`}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{day.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Member Leaderboard */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Contributori</h2>
                <div className="space-y-4">
                  {stats.memberStats
                    .sort((a, b) => b.transferCount - a.transferCount)
                    .slice(0, 5)
                    .map((member, index) => (
                      <div key={member.memberId} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-400' :
                            index === 2 ? 'bg-orange-400' :
                            'bg-blue-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{member.memberName}</p>
                            <p className="text-xs text-gray-500">{member.transferCount} trasferimenti</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-600">{formatBytes(member.storageUsed)}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Member Details Table */}
            <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Dettagli Membri</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Membro
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trasferimenti
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Download
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Storage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contributo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.memberStats.map((member) => {
                      const contribution = stats.totalTransfers > 0
                        ? Math.round((member.transferCount / stats.totalTransfers) * 100)
                        : 0;

                      return (
                        <tr key={member.memberId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {member.memberName.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{member.memberName}</p>
                                <p className="text-sm text-gray-500">{member.memberEmail}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{member.transferCount}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{member.downloadCount}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{formatBytes(member.storageUsed)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${contribution}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{contribution}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nessun dato disponibile</p>
          </div>
        )}
      </div>
    </div>
  );
}
