'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTeam } from '@/context/TeamContext';
import { formatBytes } from '@/lib/format';
import { PLANS } from '@/types';
import {
  Users,
  UserPlus,
  Settings,
  Trash2,
  Crown,
  Mail,
  Clock,
  X,
  Loader2,
  AlertTriangle,
  Check,
} from 'lucide-react';

export default function MembersPage() {
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
    cancelInvitation,
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
    if (!authLoading && !user) router.push('/accedi');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) fetchTeam();
  }, [user, fetchTeam]);

  const hasBusinessPlan = userProfile?.plan === 'business';
  const planName = PLANS[userProfile?.plan || 'free']?.name || 'Free';

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true); setError('');
    try {
      await createTeam(teamName, teamDescription);
      setShowCreateModal(false); setTeamName(''); setTeamDescription('');
      setSuccess('Team creato!'); setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Errore'); } finally { setProcessing(false); }
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true); setError('');
    try {
      await updateTeam({ name: teamName, description: teamDescription });
      setShowEditModal(false);
      setSuccess('Team aggiornato!'); setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Errore'); } finally { setProcessing(false); }
  };

  const handleDeleteTeam = async () => {
    setProcessing(true); setError('');
    try {
      await deleteTeam();
      setShowDeleteModal(false);
      setSuccess('Team eliminato!'); setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Errore'); } finally { setProcessing(false); }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true); setError('');
    try {
      await inviteMember(inviteEmail);
      setShowInviteModal(false); setInviteEmail('');
      setSuccess('Invito inviato!'); setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Errore'); } finally { setProcessing(false); }
  };

  const handleRemoveMember = async (memberId: string) => {
    setProcessing(true); setError('');
    try {
      await removeMember(memberId);
      setShowRemoveMemberModal(null);
      setSuccess('Membro rimosso!'); setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Errore'); } finally { setProcessing(false); }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    setProcessing(true); setError('');
    try {
      await cancelInvitation(invitationId);
      setShowCancelInviteModal(null);
      setSuccess('Invito annullato!'); setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Errore'); } finally { setProcessing(false); }
  };

  if (authLoading || teamLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  }

  // Non-business users
  if (!hasBusinessPlan) {
    return (
      <div className="space-y-8">
        <p className="text-sm text-gray-500">
          Hai un account personale con il piano {planName}
        </p>

        <div className="border border-gray-200 rounded-xl p-8 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Collabora con altre persone</h3>
          <ul className="text-sm text-gray-600 space-y-2 mb-6 text-left max-w-sm mx-auto">
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500 flex-shrink-0" /> Panoramica condivisa dei trasferimenti</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500 flex-shrink-0" /> Trasferimenti illimitati</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500 flex-shrink-0" /> Pagina pubblica personalizzata</li>
          </ul>
          <button
            onClick={() => router.push('/prezzi')}
            className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            Crea un team
          </button>
        </div>
      </div>
    );
  }

  // Business users — no team yet
  if (!team) {
    return (
      <div className="space-y-6">
        {success && <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm flex items-center gap-2"><Check className="w-4 h-4" />{success}</div>}

        <div className="border border-gray-200 rounded-xl p-8 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Crea il tuo Team</h3>
          <p className="text-sm text-gray-500 mb-6">Il piano Business include 3 membri. Puoi aggiungerne altri a 10/mese ciascuno.</p>
          <button onClick={() => setShowCreateModal(true)} className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 flex items-center gap-2 mx-auto">
            <UserPlus className="w-4 h-4" /> Crea Team
          </button>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <Modal title="Crea Team" onClose={() => setShowCreateModal(false)}>
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">{error}</div>}
            <form onSubmit={handleCreateTeam}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome del Team</label>
                <input type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900" placeholder="Il mio team" />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione (opzionale)</label>
                <textarea value={teamDescription} onChange={(e) => setTeamDescription(e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm text-gray-500">Annulla</button>
                <button type="submit" disabled={processing} className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2">
                  {processing && <Loader2 className="w-4 h-4 animate-spin" />} Crea Team
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    );
  }

  // Business users with team
  return (
    <div className="space-y-8">
      {success && <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm flex items-center gap-2"><Check className="w-4 h-4" />{success}</div>}
      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{error}</div>}

      {/* Team header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{team.name}</h3>
          {team.description && <p className="text-sm text-gray-500">{team.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
            {team.memberCount} {team.memberCount === 1 ? 'membro' : 'membri'}
          </span>
          <button onClick={() => { setTeamName(team.name); setTeamDescription(team.description || ''); setShowEditModal(true); }} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Members list */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Membri del Team</h3>
          <button onClick={() => setShowInviteModal(true)} className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Invita
          </button>
        </div>

        {team.members && team.members.length > 0 ? (
          <div className="space-y-2">
            {team.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {member.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{member.user?.name || 'Utente'}</p>
                    <p className="text-xs text-gray-500">{member.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${member.role === 'owner' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                    {member.role === 'owner' ? 'Proprietario' : 'Membro'}
                  </span>
                  <span className="text-xs text-gray-400">{formatBytes(member.storageUsed || 0)}</span>
                  {member.role !== 'owner' && (
                    <button onClick={() => setShowRemoveMemberModal({ id: member.id, name: member.user?.name || 'questo membro' })} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-gray-200 rounded-xl p-8 text-center">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Nessun membro ancora</p>
            <button onClick={() => setShowInviteModal(true)} className="mt-3 text-sm text-gray-900 font-medium hover:underline">Invita il primo membro</button>
          </div>
        )}
      </section>

      {/* Pending Invitations */}
      {team.pendingInvitations && team.pendingInvitations.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Inviti Pendenti</h3>
          <div className="space-y-2">
            {team.pendingInvitations.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-2"><Mail className="w-4 h-4 text-yellow-600" />{inv.email}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> Scade il {inv.expiresAt.toLocaleDateString('it-IT')}</p>
                </div>
                <button onClick={() => setShowCancelInviteModal({ id: inv.id, email: inv.email })} className="p-1.5 text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Delete team */}
      <section className="border-t border-gray-200 pt-6">
        <button onClick={() => setShowDeleteModal(true)} className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-2">
          <Trash2 className="w-4 h-4" /> Elimina Team
        </button>
      </section>

      {/* Invite Modal */}
      {showInviteModal && (
        <Modal title="Invita Membro" onClose={() => setShowInviteModal(false)}>
          <form onSubmit={handleInviteMember}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900" placeholder="nome@esempio.com" />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowInviteModal(false)} className="px-4 py-2 text-sm text-gray-500">Annulla</button>
              <button type="submit" disabled={processing} className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2">
                {processing && <Loader2 className="w-4 h-4 animate-spin" />} Invia Invito
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <Modal title="Modifica Team" onClose={() => setShowEditModal(false)}>
          <form onSubmit={handleUpdateTeam}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900" />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
              <textarea value={teamDescription} onChange={(e) => setTeamDescription(e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900" />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm text-gray-500">Annulla</button>
              <button type="submit" disabled={processing} className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2">
                {processing && <Loader2 className="w-4 h-4 animate-spin" />} Salva
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Team Modal */}
      {showDeleteModal && (
        <Modal title="Elimina Team" onClose={() => setShowDeleteModal(false)}>
          <p className="text-sm text-gray-600 mb-2">Sei sicuro di voler eliminare &quot;{team.name}&quot;?</p>
          <p className="text-sm text-red-600 mb-6">Questa azione non può essere annullata.</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-sm text-gray-500">Annulla</button>
            <button onClick={handleDeleteTeam} disabled={processing} className="px-5 py-2 bg-red-600 text-white text-sm font-medium rounded-full hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
              {processing && <Loader2 className="w-4 h-4 animate-spin" />} Elimina
            </button>
          </div>
        </Modal>
      )}

      {/* Remove Member Modal */}
      {showRemoveMemberModal && (
        <Modal title="Rimuovi membro" onClose={() => setShowRemoveMemberModal(null)}>
          <p className="text-sm text-gray-600 mb-6">Rimuovere {showRemoveMemberModal.name} dal team?</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowRemoveMemberModal(null)} className="px-4 py-2 text-sm text-gray-500">Annulla</button>
            <button onClick={() => handleRemoveMember(showRemoveMemberModal.id)} disabled={processing} className="px-5 py-2 bg-red-600 text-white text-sm font-medium rounded-full hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
              {processing && <Loader2 className="w-4 h-4 animate-spin" />} Rimuovi
            </button>
          </div>
        </Modal>
      )}

      {/* Cancel Invite Modal */}
      {showCancelInviteModal && (
        <Modal title="Annulla invito" onClose={() => setShowCancelInviteModal(null)}>
          <p className="text-sm text-gray-600 mb-6">Annullare l&apos;invito per {showCancelInviteModal.email}?</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowCancelInviteModal(null)} className="px-4 py-2 text-sm text-gray-500">Indietro</button>
            <button onClick={() => handleCancelInvitation(showCancelInviteModal.id)} disabled={processing} className="px-5 py-2 bg-red-600 text-white text-sm font-medium rounded-full hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
              {processing && <Loader2 className="w-4 h-4 animate-spin" />} Annulla invito
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
