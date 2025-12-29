'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
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

  // Fetch user's team
  const fetchTeam = useCallback(async () => {
    if (!user) {
      setTeam(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First check if user owns a team
      const teamsRef = collection(db, 'teams');
      let q = query(teamsRef, where('ownerId', '==', user.uid));
      let snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Check if user is a member of a team
        const membersRef = collection(db, 'teamMembers');
        const memberQuery = query(membersRef, where('userId', '==', user.uid));
        const memberSnapshot = await getDocs(memberQuery);

        if (!memberSnapshot.empty) {
          const memberData = memberSnapshot.docs[0].data();
          const teamDoc = await getDoc(doc(db, 'teams', memberData.teamId));
          if (teamDoc.exists()) {
            snapshot = { docs: [teamDoc], empty: false } as typeof snapshot;
          }
        }
      }

      if (snapshot.empty) {
        setTeam(null);
        return;
      }

      const teamDoc = snapshot.docs[0];
      const teamData = teamDoc.data();

      // Fetch members
      const membersRef = collection(db, 'teamMembers');
      const membersQuery = query(membersRef, where('teamId', '==', teamDoc.id));
      const membersSnapshot = await getDocs(membersQuery);

      const members: TeamMember[] = [];
      for (const memberDoc of membersSnapshot.docs) {
        const memberData = memberDoc.data();
        // Fetch user info for each member
        const userDoc = await getDoc(doc(db, 'users', memberData.userId));
        const userData = userDoc.exists() ? userDoc.data() : {};

        members.push({
          id: memberDoc.id,
          ...memberData,
          joinedAt: memberData.joinedAt?.toDate() || new Date(),
          user: {
            id: memberData.userId,
            name: userData.displayName || 'Utente',
            email: userData.email || '',
            photoURL: userData.photoURL,
          },
        } as TeamMember);
      }

      // Fetch pending invitations
      const invitationsRef = collection(db, 'teamInvitations');
      const invitationsQuery = query(
        invitationsRef,
        where('teamId', '==', teamDoc.id),
        where('status', '==', 'pending')
      );
      const invitationsSnapshot = await getDocs(invitationsQuery);

      const pendingInvitations: TeamInvitation[] = invitationsSnapshot.docs.map(invDoc => ({
        id: invDoc.id,
        ...invDoc.data(),
        expiresAt: invDoc.data().expiresAt?.toDate() || new Date(),
        createdAt: invDoc.data().createdAt?.toDate() || new Date(),
      })) as TeamInvitation[];

      setTeam({
        id: teamDoc.id,
        ...teamData,
        members,
        pendingInvitations,
        createdAt: teamData.createdAt?.toDate() || new Date(),
        updatedAt: teamData.updatedAt?.toDate() || new Date(),
      } as Team);
    } catch (err) {
      console.error('Error fetching team:', err);
      setError('Impossibile caricare il team');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create a new team
  const createTeam = useCallback(async (name: string, description?: string): Promise<Team> => {
    if (!user) throw new Error('Non autorizzato');

    // Check if user has business plan
    if (userProfile?.plan !== 'business') {
      throw new Error('Piano Business richiesto per creare un team');
    }

    try {
      // Create team document
      const teamData = {
        name,
        description: description || null,
        ownerId: user.uid,
        memberCount: 1,
        storageUsed: 0,
        maxMembers: 3, // Base plan includes 3 members
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const teamRef = await addDoc(collection(db, 'teams'), teamData);

      // Add owner as first member
      await addDoc(collection(db, 'teamMembers'), {
        teamId: teamRef.id,
        userId: user.uid,
        role: 'owner',
        storageUsed: 0,
        joinedAt: serverTimestamp(),
      });

      await fetchTeam();

      return {
        id: teamRef.id,
        ...teamData,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Team;
    } catch (err) {
      console.error('Error creating team:', err);
      throw new Error('Impossibile creare il team');
    }
  }, [user, userProfile, fetchTeam]);

  // Update team
  const updateTeam = useCallback(async (data: Partial<Team>): Promise<void> => {
    if (!user || !team) throw new Error('Non autorizzato');

    // Check if user is owner
    if (team.ownerId !== user.uid) {
      throw new Error('Solo il proprietario può modificare il team');
    }

    try {
      const teamRef = doc(db, 'teams', team.id);
      await updateDoc(teamRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });

      await fetchTeam();
    } catch (err) {
      console.error('Error updating team:', err);
      throw new Error('Impossibile aggiornare il team');
    }
  }, [user, team, fetchTeam]);

  // Delete team
  const deleteTeam = useCallback(async (): Promise<void> => {
    if (!user || !team) throw new Error('Non autorizzato');

    // Check if user is owner
    if (team.ownerId !== user.uid) {
      throw new Error('Solo il proprietario può eliminare il team');
    }

    try {
      // Delete all members
      const membersRef = collection(db, 'teamMembers');
      const membersQuery = query(membersRef, where('teamId', '==', team.id));
      const membersSnapshot = await getDocs(membersQuery);

      for (const memberDoc of membersSnapshot.docs) {
        await deleteDoc(doc(db, 'teamMembers', memberDoc.id));
      }

      // Delete all invitations
      const invitationsRef = collection(db, 'teamInvitations');
      const invitationsQuery = query(invitationsRef, where('teamId', '==', team.id));
      const invitationsSnapshot = await getDocs(invitationsQuery);

      for (const invDoc of invitationsSnapshot.docs) {
        await deleteDoc(doc(db, 'teamInvitations', invDoc.id));
      }

      // Delete team
      await deleteDoc(doc(db, 'teams', team.id));

      setTeam(null);
    } catch (err) {
      console.error('Error deleting team:', err);
      throw new Error('Impossibile eliminare il team');
    }
  }, [user, team]);

  // Invite member
  const inviteMember = useCallback(async (email: string): Promise<void> => {
    if (!user || !team) throw new Error('Non autorizzato');

    // Check if user is owner
    if (team.ownerId !== user.uid) {
      throw new Error('Solo il proprietario può invitare membri');
    }

    // Check member limit
    const currentMembers = team.members?.length || 1;
    const pendingInvitations = team.pendingInvitations?.length || 0;
    if (currentMembers + pendingInvitations >= team.maxMembers) {
      throw new Error(`Limite massimo di ${team.maxMembers} membri raggiunto`);
    }

    try {
      // Generate invitation token
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      await addDoc(collection(db, 'teamInvitations'), {
        teamId: team.id,
        email,
        token,
        status: 'pending',
        expiresAt,
        createdAt: serverTimestamp(),
      });

      // TODO: Send invitation email

      await fetchTeam();
    } catch (err) {
      console.error('Error inviting member:', err);
      throw new Error('Impossibile inviare l\'invito');
    }
  }, [user, team, fetchTeam]);

  // Remove member
  const removeMember = useCallback(async (memberId: string): Promise<void> => {
    if (!user || !team) throw new Error('Non autorizzato');

    // Check if user is owner
    if (team.ownerId !== user.uid) {
      throw new Error('Solo il proprietario può rimuovere membri');
    }

    try {
      // Get member document
      const memberDoc = await getDoc(doc(db, 'teamMembers', memberId));
      if (!memberDoc.exists()) {
        throw new Error('Membro non trovato');
      }

      const memberData = memberDoc.data();

      // Cannot remove owner
      if (memberData.role === 'owner') {
        throw new Error('Non puoi rimuovere il proprietario');
      }

      await deleteDoc(doc(db, 'teamMembers', memberId));

      // Update member count
      await updateDoc(doc(db, 'teams', team.id), {
        memberCount: (team.memberCount || 1) - 1,
        updatedAt: serverTimestamp(),
      });

      await fetchTeam();
    } catch (err) {
      console.error('Error removing member:', err);
      throw err;
    }
  }, [user, team, fetchTeam]);

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

  // Accept invitation
  const acceptInvitation = useCallback(async (token: string): Promise<void> => {
    if (!user) throw new Error('Devi effettuare il login');

    try {
      // Find invitation by token
      const invitationsRef = collection(db, 'teamInvitations');
      const q = query(
        invitationsRef,
        where('token', '==', token),
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error('Invito non valido o scaduto');
      }

      const invitationDoc = snapshot.docs[0];
      const invitation = invitationDoc.data();

      // Check if expired
      if (invitation.expiresAt?.toDate() < new Date()) {
        throw new Error('Invito scaduto');
      }

      // Check if email matches
      if (invitation.email !== user.email) {
        throw new Error('Questo invito è per un altro indirizzo email');
      }

      // Add user as team member
      await addDoc(collection(db, 'teamMembers'), {
        teamId: invitation.teamId,
        userId: user.uid,
        role: 'member',
        storageUsed: 0,
        joinedAt: serverTimestamp(),
      });

      // Update invitation status
      await updateDoc(doc(db, 'teamInvitations', invitationDoc.id), {
        status: 'accepted',
      });

      // Update team member count
      const teamDoc = await getDoc(doc(db, 'teams', invitation.teamId));
      if (teamDoc.exists()) {
        await updateDoc(doc(db, 'teams', invitation.teamId), {
          memberCount: (teamDoc.data().memberCount || 1) + 1,
          updatedAt: serverTimestamp(),
        });
      }

      await fetchTeam();
    } catch (err) {
      console.error('Error accepting invitation:', err);
      throw err;
    }
  }, [user, fetchTeam]);

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
