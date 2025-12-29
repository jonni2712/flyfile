import { NextRequest, NextResponse } from 'next/server';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// GET - Get team by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params;
    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);

    if (!teamSnap.exists()) {
      return NextResponse.json(
        { error: 'Team non trovato' },
        { status: 404 }
      );
    }

    const teamData = teamSnap.data();

    // Fetch members
    const membersRef = collection(db, 'teamMembers');
    const membersQuery = query(membersRef, where('teamId', '==', teamId));
    const membersSnapshot = await getDocs(membersQuery);

    const members = [];
    for (const memberDoc of membersSnapshot.docs) {
      const memberData = memberDoc.data();
      const userDocRef = await getDoc(doc(db, 'users', memberData.userId));
      const userData = userDocRef.exists() ? userDocRef.data() : {};

      members.push({
        id: memberDoc.id,
        userId: memberData.userId,
        role: memberData.role,
        storageUsed: memberData.storageUsed || 0,
        joinedAt: memberData.joinedAt?.toDate()?.toISOString() || null,
        user: {
          id: memberData.userId,
          name: userData.displayName || 'Utente',
          email: userData.email || '',
          photoURL: userData.photoURL,
        },
      });
    }

    return NextResponse.json({
      team: {
        id: teamId,
        ...teamData,
        members,
        createdAt: teamData.createdAt?.toDate()?.toISOString() || null,
        updatedAt: teamData.updatedAt?.toDate()?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { error: 'Impossibile recuperare il team' },
      { status: 500 }
    );
  }
}

// PATCH - Update team
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params;
    const body = await request.json();
    const { userId, name, description } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId richiesto' },
        { status: 400 }
      );
    }

    // Verify team exists
    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);

    if (!teamSnap.exists()) {
      return NextResponse.json(
        { error: 'Team non trovato' },
        { status: 404 }
      );
    }

    const teamData = teamSnap.data();

    // Check if user is owner
    if (teamData.ownerId !== userId) {
      return NextResponse.json(
        { error: 'Solo il proprietario può modificare il team' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    await updateDoc(teamRef, updateData);

    return NextResponse.json({
      success: true,
      message: 'Team aggiornato con successo',
    });
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json(
      { error: 'Impossibile aggiornare il team' },
      { status: 500 }
    );
  }
}

// DELETE - Delete team
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId richiesto' },
        { status: 400 }
      );
    }

    // Verify team exists
    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);

    if (!teamSnap.exists()) {
      return NextResponse.json(
        { error: 'Team non trovato' },
        { status: 404 }
      );
    }

    const teamData = teamSnap.data();

    // Check if user is owner
    if (teamData.ownerId !== userId) {
      return NextResponse.json(
        { error: 'Solo il proprietario può eliminare il team' },
        { status: 403 }
      );
    }

    // Delete all members
    const membersRef = collection(db, 'teamMembers');
    const membersQuery = query(membersRef, where('teamId', '==', teamId));
    const membersSnapshot = await getDocs(membersQuery);

    for (const memberDoc of membersSnapshot.docs) {
      await deleteDoc(doc(db, 'teamMembers', memberDoc.id));
    }

    // Delete all invitations
    const invitationsRef = collection(db, 'teamInvitations');
    const invitationsQuery = query(invitationsRef, where('teamId', '==', teamId));
    const invitationsSnapshot = await getDocs(invitationsQuery);

    for (const invDoc of invitationsSnapshot.docs) {
      await deleteDoc(doc(db, 'teamInvitations', invDoc.id));
    }

    // Delete team
    await deleteDoc(teamRef);

    return NextResponse.json({
      success: true,
      message: 'Team eliminato con successo',
    });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json(
      { error: 'Impossibile eliminare il team' },
      { status: 500 }
    );
  }
}
