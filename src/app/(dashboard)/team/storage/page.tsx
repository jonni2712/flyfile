'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTeam } from '@/context/TeamContext';
import {
  ArrowLeft,
  HardDrive,
  Users,
  Trash2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  FileIcon,
  Clock,
  X
} from 'lucide-react';

interface StorageFile {
  id: string;
  transferId: string;
  transferTitle: string;
  fileName: string;
  size: number;
  createdAt: string;
  expiresAt: string;
  ownerId: string;
  ownerName: string;
}

interface MemberStorage {
  memberId: string;
  memberName: string;
  memberEmail: string;
  storageUsed: number;
  fileCount: number;
  percentage: number;
}

export default function TeamStoragePage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  const { team, loading: teamLoading } = useTeam();

  const [memberStorage, setMemberStorage] = useState<MemberStorage[]>([]);
  const [recentFiles, setRecentFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; file?: StorageFile }>({ show: false });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (team) {
      fetchStorageData();
    }
  }, [team]);

  const fetchStorageData = async () => {
    if (!team || !user) return;

    setRefreshing(true);
    try {
      const response = await fetch(`/api/team/storage?teamId=${team.id}&userId=${user.uid}`);
      const data = await response.json();

      if (data.success) {
        setMemberStorage(data.memberStorage);
        setRecentFiles(data.recentFiles);
      } else {
        // Generate mock data if API doesn't exist yet
        generateMockData();
      }
    } catch (err) {
      console.error('Error fetching storage data:', err);
      generateMockData();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateMockData = () => {
    const members = team?.members || [];
    const totalStorage = team?.storageUsed || 0;

    const memberData: MemberStorage[] = members.map(m => {
      const storage = m.storageUsed || Math.floor(Math.random() * 1024 * 1024 * 1024);
      return {
        memberId: m.id,
        memberName: m.user?.name || 'Utente',
        memberEmail: m.user?.email || '',
        storageUsed: storage,
        fileCount: Math.floor(Math.random() * 50) + 5,
        percentage: totalStorage > 0 ? Math.round((storage / totalStorage) * 100) : 0,
      };
    });

    setMemberStorage(memberData);
    setRecentFiles([]);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDeleteFile = async () => {
    if (!deleteModal.file) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/transfer/${deleteModal.file.transferId}?userId=${user?.uid}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRecentFiles(prev => prev.filter(f => f.id !== deleteModal.file?.id));
        setDeleteModal({ show: false });
      }
    } catch (err) {
      console.error('Error deleting file:', err);
    } finally {
      setDeleting(false);
    }
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
              <HardDrive className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Gestione Storage</h1>
            <p className="text-gray-600 mb-8">
              La gestione dello storage team è disponibile solo con il piano Business.
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
              Devi prima creare un team per gestire lo storage.
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

  const totalStorage = team.storageUsed || 0;

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
              <h1 className="text-3xl font-bold text-gray-900">Gestione Storage</h1>
              <p className="text-gray-600 mt-1">{team.name}</p>
            </div>
          </div>
          <button
            onClick={fetchStorageData}
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
        ) : (
          <>
            {/* Storage Overview */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Storage Totale Team</h2>
                  <p className="text-gray-600 mt-1">Distribuzione dello spazio tra i membri</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">{formatBytes(totalStorage)}</p>
                  <p className="text-sm text-gray-500">Utilizzato</p>
                </div>
              </div>

              {/* Storage bar */}
              <div className="mb-6">
                <div className="h-8 bg-gray-200 rounded-full overflow-hidden flex">
                  {memberStorage.map((member, index) => {
                    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
                    return (
                      <div
                        key={member.memberId}
                        className={`${colors[index % colors.length]} h-full transition-all`}
                        style={{ width: `${member.percentage}%` }}
                        title={`${member.memberName}: ${formatBytes(member.storageUsed)}`}
                      ></div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4">
                {memberStorage.map((member, index) => {
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
                  return (
                    <div key={member.memberId} className="flex items-center">
                      <span className={`w-3 h-3 ${colors[index % colors.length]} rounded-full mr-2`}></span>
                      <span className="text-sm text-gray-600">
                        {member.memberName} ({member.percentage}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Member Storage Details */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Storage per Membro</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Membro
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Storage Utilizzato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quota
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {memberStorage.map((member) => (
                      <tr key={member.memberId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              {member.memberName.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-900">{member.memberName}</p>
                              <p className="text-sm text-gray-500">{member.memberEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{formatBytes(member.storageUsed)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{member.fileCount} file</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${Math.min(member.percentage, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{member.percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Files */}
            {recentFiles.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">File Recenti</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center">
                          <div className="p-3 bg-blue-100 rounded-lg mr-4">
                            <FileIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.fileName}</p>
                            <p className="text-xs text-gray-500">
                              {file.transferTitle} - {file.ownerName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{formatBytes(file.size)}</p>
                            <p className="text-xs text-gray-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              Scade: {new Date(file.expiresAt).toLocaleDateString('it-IT')}
                            </p>
                          </div>
                          <button
                            onClick={() => setDeleteModal({ show: true, file })}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Elimina"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Storage Tips */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Suggerimenti per ottimizzare lo storage</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-3"></span>
                  I file scaduti vengono eliminati automaticamente per liberare spazio
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-3"></span>
                  Imposta scadenze più brevi per i file temporanei
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-3"></span>
                  Elimina i trasferimenti non più necessari dalla dashboard
                </li>
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && deleteModal.file && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Elimina File</h3>
                <p className="text-gray-600">
                  Sei sicuro di voler eliminare "{deleteModal.file.fileName}"?
                </p>
                <p className="text-red-600 text-sm mt-2">Questa azione non può essere annullata.</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setDeleteModal({ show: false })}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Annulla
              </button>
              <button
                onClick={handleDeleteFile}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
