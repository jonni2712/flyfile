'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { Team, TeamMember, TeamInvitation } from '@/types';

interface TeamContextType {
  team: Team | null;
  loading: boolean;
  error: string | null;
  fetchTeam: () => Promise<void>;
  createTeam: (name: string, description?: string) => Promise<Team>;
  updateTeam: (data: Partial<Team>) => Promise<void>;
  deleteTeam: () => Promise<void>;
  inviteMember: (email: string) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  cancelInvitation: (invitationId: string) => Promise<void>;
  acceptInvitation: (token: string) => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const { user, userProfile } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to get auth headers
  const getAuthHeaders = useCallback(async (): Promise<Record<string, string>> => {
    if (!user) throw new Error('Non autorizzato');
    const token = await user.getIdToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }, [user]);

  // Fetch user's team
  const fetchTeam = useCallback(async () => {
    if (!user) {
      setTeam(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/team?userId=${user.uid}`, { headers });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Impossibile caricare il team');
      }

      if (!data.team) {
        setTeam(null);
        return;
      }

      const t = data.team;

      const members: TeamMember[] = (t.members || []).map((m: Record<string, unknown>) => ({
        id: m.id,
        teamId: t.id,
        userId: m.userId,
        role: m.role,
        storageUsed: m.storageUsed || 0,
        joinedAt: m.joinedAt ? new Date(m.joinedAt as string) : new Date(),
        user: m.user,
      }));

      const pendingInvitations: TeamInvitation[] = (t.pendingInvitations || []).map((inv: Record<string, unknown>) => ({
        id: inv.id,
        teamId: t.id,
        email: inv.email,
        status: inv.status,
        token: inv.token || '',
        expiresAt: inv.expiresAt ? new Date(inv.expiresAt as string) : new Date(),
        createdAt: inv.createdAt ? new Date(inv.createdAt as string) : new Date(),
      }));

      setTeam({
        id: t.id,
        name: t.name,
        description: t.description,
        ownerId: t.ownerId,
        memberCount: t.memberCount,
        maxMembers: t.maxMembers,
        storageUsed: t.storageUsed || 0,
        members,
        pendingInvitations,
        createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
        updatedAt: t.updatedAt ? new Date(t.updatedAt) : new Date(),
      });
    } catch (err) {
      console.error('Error fetching team:', err);
      setError('Impossibile caricare il team');
    } finally {
      setLoading(false);
    }
  }, [user, getAuthHeaders]);

  // Create a new team via API (server-side with Admin SDK)
  const createTeam = useCallback(async (name: string, description?: string): Promise<Team> => {
    if (!user) throw new Error('Non autorizzato');

    if (userProfile?.plan !== 'business') {
      throw new Error('Piano Business richiesto per creare un team');
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/team', {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId: user.uid, name, description }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Impossibile creare il team');
      }

      await fetchTeam();
      return data.team;
    } catch (err) {
      console.error('Error creating team:', err);
      throw err instanceof Error ? err : new Error('Impossibile creare il team');
    }
  }, [user, userProfile, fetchTeam, getAuthHeaders]);

  // Update team
  const updateTeam = useCallback(async (data: Partial<Team>): Promise<void> => {
    if (!user || !team) throw new Error('Non autorizzato');

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/team/${team.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Impossibile aggiornare il team');
      }

      await fetchTeam();
    } catch (err) {
      console.error('Error updating team:', err);
      throw err instanceof Error ? err : new Error('Impossibile aggiornare il team');
    }
  }, [user, team, fetchTeam, getAuthHeaders]);

  // Delete team
  const deleteTeam = useCallback(async (): Promise<void> => {
    if (!user || !team) throw new Error('Non autorizzato');

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/team/${team.id}`, {
        method: 'DELETE',
        headers,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Impossibile eliminare il team');
      }

      setTeam(null);
    } catch (err) {
      console.error('Error deleting team:', err);
      throw err instanceof Error ? err : new Error('Impossibile eliminare il team');
    }
  }, [user, team, getAuthHeaders]);

  // Invite member via API (server-side with Admin SDK)
  const inviteMember = useCallback(async (email: string): Promise<void> => {
    if (!user || !team) throw new Error('Non autorizzato');

    if (team.ownerId !== user.uid) {
      throw new Error('Solo il proprietario può invitare membri');
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/team/${team.id}/invite`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Impossibile inviare l\'invito');
      }

      await fetchTeam();
    } catch (err) {
      console.error('Error inviting member:', err);
      throw err instanceof Error ? err : new Error('Impossibile inviare l\'invito');
    }
  }, [user, team, fetchTeam, getAuthHeaders]);

  // Remove member
  const removeMember = useCallback(async (memberId: string): Promise<void> => {
    if (!user || !team) throw new Error('Non autorizzato');

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `/api/team/${team.id}/members/${memberId}?userId=${user.uid}`,
        { method: 'DELETE', headers }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Impossibile rimuovere il membro');
      }

      await fetchTeam();
    } catch (err) {
      console.error('Error removing member:', err);
      throw err instanceof Error ? err : new Error('Impossibile rimuovere il membro');
    }
  }, [user, team, fetchTeam, getAuthHeaders]);

  // Cancel invitation
  const cancelInvitation = useCallback(async (invitationId: string): Promise<void> => {
    if (!user || !team) throw new Error('Non autorizzato');

    // Check if user is owner
    if (team.ownerId !== user.uid) {
      throw new Error('Solo il proprietario può annullare inviti');
    }

    try {
      await deleteDoc(doc(db, 'teamInvitations', invitationId));
      await fetchTeam();
    } catch (err) {
      console.error('Error canceling invitation:', err);
      throw new Error('Impossibile annullare l\'invito');
    }
  }, [user, team, fetchTeam]);

  // Accept invitation via API (server-side with Admin SDK)
  const acceptInvitation = useCallback(async (token: string): Promise<void> => {
    if (!user) throw new Error('Devi effettuare il login');

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/team/invitation/${token}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invito non valido o scaduto');
      }

      await fetchTeam();
    } catch (err) {
      console.error('Error accepting invitation:', err);
      throw err instanceof Error ? err : new Error('Impossibile accettare l\'invito');
    }
  }, [user, fetchTeam, getAuthHeaders]);

  const value = {
    team,
    loading,
    error,
    fetchTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    inviteMember,
    removeMember,
    cancelInvitation,
    acceptInvitation,
  };

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}
