'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTeam } from '@/context/TeamContext';
import {
  Users,
  UserPlus,
  Settings,
  Trash2,
  Crown,
  Mail,
  Clock,
  HardDrive,
  BarChart3,
  ArrowLeft,
  X,
  Loader2,
  AlertTriangle,
  Check
} from 'lucide-react';

export default function TeamPage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  const {
    team,
    loading: teamLoading,
    fetchTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    inviteMember,
    removeMember,
    cancelInvitation
  } = useTeam();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState<{ id: string; name: string } | null>(null);
  const [showCancelInviteModal, setShowCancelInviteModal] = useState<{ id: string; email: string } | null>(null);

  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchTeam();
    }
  }, [user, fetchTeam]);

  // Check if user has business plan
  const hasBusinessPlan = userProfile?.plan === 'business';

  // Format bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle create team
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      await createTeam(teamName, teamDescription);
      setShowCreateModal(false);
      setTeamName('');
      setTeamDescription('');
      setSuccess('Team creato con successo!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Errore durante la creazione';
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  // Handle update team
  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      await updateTeam({ name: teamName, description: teamDescription });
      setShowEditModal(false);
      setSuccess('Team aggiornato con successo!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Errore durante l\'aggiornamento';
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  // Handle delete team
  const handleDeleteTeam = async () => {
    setProcessing(true);
    setError('');

    try {
      await deleteTeam();
      setShowDeleteModal(false);
      setSuccess('Team eliminato con successo!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Errore durante l\'eliminazione';
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  // Handle invite member
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      await inviteMember(inviteEmail);
      setShowInviteModal(false);
      setInviteEmail('');
      setSuccess('Invito inviato con successo!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Errore durante l\'invio dell\'invito';
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  // Handle remove member
  const handleRemoveMember = async (memberId: string) => {
    setProcessing(true);
    setError('');

    try {
      await removeMember(memberId);
      setShowRemoveMemberModal(null);
      setSuccess('Membro rimosso con successo!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Errore durante la rimozione';
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  // Handle cancel invitation
  const handleCancelInvitation = async (invitationId: string) => {
    setProcessing(true);
    setError('');

    try {
      await cancelInvitation(invitationId);
      setShowCancelInviteModal(null);
      setSuccess('Invito annullato!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Errore durante l\'annullamento';
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  // Open edit modal with current data
  const openEditModal = () => {
    if (team) {
      setTeamName(team.name);
      setTeamDescription(team.description || '');
      setShowEditModal(true);
    }
  };

  if (authLoading || teamLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // No business plan
  if (!hasBusinessPlan) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Gestione Team</h1>
            <p className="text-gray-600 mb-8">
              La gestione del team è disponibile solo con il piano Business.
              Passa al piano Business per collaborare con il tuo team.
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

  // No team yet
  if (!team) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-2xl mx-auto px-4">
            {/* Success message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl flex items-center">
                <Check className="w-5 h-5 mr-2" />
                {success}
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Crea il tuo Team</h1>
              <p className="text-gray-600 mb-8">
                Inizia a collaborare con il tuo team. Il piano Business include 3 membri,
                puoi aggiungerne altri a 10/mese ciascuno.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Crea Team
              </button>
            </div>
          </div>

          {/* Create Team Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Crea Team</h3>
                  <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleCreateTeam}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome del Team</label>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Il mio team"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descrizione (opzionale)</label>
                    <textarea
                      value={teamDescription}
                      onChange={(e) => setTeamDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Descrivi il tuo team..."
                    />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-6 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Annulla
                    </button>
                    <button
                      type="submit"
                      disabled={processing}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                      {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Crea Team
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Team dashboard
  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Link href="/dashboard" className="mr-4 text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
                <p className="text-gray-600 mt-1">{team.description || 'Gestisci il tuo team e i collaboratori'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                {team.memberCount} {team.memberCount === 1 ? 'membro' : 'membri'}
              </span>
              <button
                onClick={openEditModal}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                <Settings className="w-4 h-4 mr-2 inline" />
                Modifica
              </button>
            </div>
          </div>

          {/* Success/Error messages */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl flex items-center">
              <Check className="w-5 h-5 mr-2" />
              {success}
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Team Members */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Membri del Team</h2>
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      <UserPlus className="w-4 h-4 mr-2 inline" />
                      Invita Membro
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {team.members && team.members.length > 0 ? (
                    <div className="space-y-4">
                      {team.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {member.user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="ml-4">
                              <h3 className="text-sm font-semibold text-gray-900">{member.user?.name || 'Utente'}</h3>
                              <p className="text-sm text-gray-600">{member.user?.email}</p>
                              <div className="flex items-center mt-1">
                                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                  member.role === 'owner'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {member.role === 'owner' ? (
                                    <><Crown className="w-3 h-3 mr-1" /> Proprietario</>
                                  ) : 'Membro'}
                                </span>
                                <span className="text-xs text-gray-500 ml-2">
                                  Storage: {formatBytes(member.storageUsed || 0)}
                                </span>
                              </div>
                            </div>
                          </div>
                          {member.role !== 'owner' && (
                            <button
                              onClick={() => setShowRemoveMemberModal({ id: member.id, name: member.user?.name || 'questo membro' })}
                              className="text-red-600 hover:text-red-800 p-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun membro ancora</h3>
                      <p className="text-gray-600 mb-4">Invita i tuoi collaboratori per iniziare</p>
                      <button
                        onClick={() => setShowInviteModal(true)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Invita il primo membro
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Pending Invitations */}
              {team.pendingInvitations && team.pendingInvitations.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Inviti Pendenti</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {team.pendingInvitations.map((invitation) => (
                        <div key={invitation.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900 flex items-center">
                              <Mail className="w-4 h-4 mr-2 text-yellow-600" />
                              {invitation.email}
                            </p>
                            <p className="text-xs text-gray-600 flex items-center mt-1">
                              <Clock className="w-3 h-3 mr-1" />
                              Scade il {invitation.expiresAt.toLocaleDateString('it-IT')}
                            </p>
                          </div>
                          <button
                            onClick={() => setShowCancelInviteModal({ id: invitation.id, email: invitation.email })}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Annulla invito"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Team Stats */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiche Team</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Membri totali</span>
                    <span className="text-lg font-semibold text-gray-900">{team.memberCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Storage utilizzato</span>
                    <span className="text-lg font-semibold text-gray-900">{formatBytes(team.storageUsed || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Inviti pendenti</span>
                    <span className="text-lg font-semibold text-gray-900">{team.pendingInvitations?.length || 0}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h3>
                <div className="space-y-3">
                  <Link
                    href="/team/analytics"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <BarChart3 className="w-4 h-4 mr-3 inline" />
                    Analytics Team
                  </Link>
                  <Link
                    href="/team/storage"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <HardDrive className="w-4 h-4 mr-3 inline" />
                    Gestione Storage
                  </Link>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-3 inline" />
                    Elimina Team
                  </button>
                </div>
              </div>

              {/* Pricing Info */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Info Piano</h3>
                <div className="space-y-3 text-sm">
                  <p className="text-gray-600">3 membri inclusi nel piano base</p>
                  <p className="text-gray-600">10/mese per ogni membro aggiuntivo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Invita Membro</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleInviteMember}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email del nuovo membro</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  placeholder="nome@esempio.com"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button type="button" onClick={() => setShowInviteModal(false)} className="px-6 py-2 text-gray-600">
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Invia Invito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Modifica Team</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUpdateTeam}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome del Team</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrizione</label>
                <textarea
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-2 text-gray-600">
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Salva Modifiche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Team Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Elimina team</h3>
                <p className="text-gray-600">Sei sicuro di voler eliminare "{team.name}"?</p>
                <p className="text-red-600 text-sm mt-2">Questa azione non può essere annullata.</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
                Annulla
              </button>
              <button
                onClick={handleDeleteTeam}
                disabled={processing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Elimina definitivamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Modal */}
      {showRemoveMemberModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Rimuovi membro</h3>
                <p className="text-gray-600">Sei sicuro di voler rimuovere {showRemoveMemberModal.name} dal team?</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setShowRemoveMemberModal(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
                Annulla
              </button>
              <button
                onClick={() => handleRemoveMember(showRemoveMemberModal.id)}
                disabled={processing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Rimuovi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Invitation Modal */}
      {showCancelInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Annulla invito</h3>
                <p className="text-gray-600">Annullare l'invito per {showCancelInviteModal.email}?</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setShowCancelInviteModal(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
                Indietro
              </button>
              <button
                onClick={() => handleCancelInvitation(showCancelInviteModal.id)}
                disabled={processing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Annulla invito
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
