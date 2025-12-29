import { NextRequest, NextResponse } from 'next/server';
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
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// GET - Get invitation by token
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find invitation by token
    const invitationsRef = collection(db, 'teamInvitations');
    const q = query(
      invitationsRef,
      where('token', '==', token),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Invito non trovato o già utilizzato' },
        { status: 404 }
      );
    }

    const invDoc = snapshot.docs[0];
    const invitation = invDoc.data();

    // Check if expired
    if (invitation.expiresAt?.toDate() < new Date()) {
      return NextResponse.json(
        { error: 'Invito scaduto', status: 'expired' },
        { status: 410 }
      );
    }

    // Get team info
    const teamRef = doc(db, 'teams', invitation.teamId);
    const teamSnap = await getDoc(teamRef);

    if (!teamSnap.exists()) {
      return NextResponse.json(
        { error: 'Team non trovato' },
        { status: 404 }
      );
    }

    const teamData = teamSnap.data();

    // Get owner info
    const ownerRef = doc(db, 'users', teamData.ownerId);
    const ownerSnap = await getDoc(ownerRef);
    const ownerData = ownerSnap.exists() ? ownerSnap.data() : {};

    return NextResponse.json({
      invitation: {
        id: invDoc.id,
        email: invitation.email,
        expiresAt: invitation.expiresAt?.toDate()?.toISOString() || null,
        createdAt: invitation.createdAt?.toDate()?.toISOString() || null,
      },
      team: {
        id: invitation.teamId,
        name: teamData.name,
        description: teamData.description,
        memberCount: teamData.memberCount || 1,
        owner: {
          name: ownerData.displayName || 'Proprietario',
          email: ownerData.email || '',
        },
      },
    });
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return NextResponse.json(
      { error: 'Impossibile recuperare l\'invito' },
      { status: 500 }
    );
  }
}

// POST - Accept invitation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId richiesto' },
        { status: 400 }
      );
    }

    // Get user info
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    const userData = userSnap.data();

    // Find invitation by token
    const invitationsRef = collection(db, 'teamInvitations');
    const q = query(
      invitationsRef,
      where('token', '==', token),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Invito non valido o già utilizzato' },
        { status: 404 }
      );
    }

    const invDoc = snapshot.docs[0];
    const invitation = invDoc.data();

    // Check if expired
    if (invitation.expiresAt?.toDate() < new Date()) {
      return NextResponse.json(
        { error: 'Invito scaduto' },
        { status: 410 }
      );
    }

    // Check if email matches
    if (invitation.email.toLowerCase() !== userData.email?.toLowerCase()) {
      return NextResponse.json(
        { error: 'Questo invito è per un altro indirizzo email' },
        { status: 403 }
      );
    }

    // Check if user is already a member of any team
    const membersRef = collection(db, 'teamMembers');
    const existingMemberQuery = query(membersRef, where('userId', '==', userId));
    const existingMemberSnapshot = await getDocs(existingMemberQuery);

    if (!existingMemberSnapshot.empty) {
      return NextResponse.json(
        { error: 'Sei già membro di un team' },
        { status: 400 }
      );
    }

    // Get team
    const teamRef = doc(db, 'teams', invitation.teamId);
    const teamSnap = await getDoc(teamRef);

    if (!teamSnap.exists()) {
      return NextResponse.json(
        { error: 'Team non trovato' },
        { status: 404 }
      );
    }

    const teamData = teamSnap.data();

    // Add user as team member
    await addDoc(collection(db, 'teamMembers'), {
      teamId: invitation.teamId,
      userId: userId,
      role: 'member',
      storageUsed: 0,
      joinedAt: serverTimestamp(),
    });

    // Update invitation status
    await updateDoc(doc(db, 'teamInvitations', invDoc.id), {
      status: 'accepted',
      acceptedAt: serverTimestamp(),
    });

    // Update team member count
    await updateDoc(teamRef, {
      memberCount: (teamData.memberCount || 1) + 1,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      teamId: invitation.teamId,
      message: 'Invito accettato con successo',
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'Impossibile accettare l\'invito' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel/decline invitation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action'); // 'cancel' or 'decline'

    // Find invitation by token
    const invitationsRef = collection(db, 'teamInvitations');
    const q = query(
      invitationsRef,
      where('token', '==', token),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Invito non trovato' },
        { status: 404 }
      );
    }

    const invDoc = snapshot.docs[0];
    const invitation = invDoc.data();

    // If canceling (owner action), verify ownership
    if (action === 'cancel' && userId) {
      const teamRef = doc(db, 'teams', invitation.teamId);
      const teamSnap = await getDoc(teamRef);

      if (!teamSnap.exists()) {
        return NextResponse.json(
          { error: 'Team non trovato' },
          { status: 404 }
        );
      }

      const teamData = teamSnap.data();

      if (teamData.ownerId !== userId) {
        return NextResponse.json(
          { error: 'Solo il proprietario può annullare gli inviti' },
          { status: 403 }
        );
      }
    }

    // Delete invitation
    await deleteDoc(doc(db, 'teamInvitations', invDoc.id));

    return NextResponse.json({
      success: true,
      message: action === 'cancel' ? 'Invito annullato con successo' : 'Invito rifiutato',
    });
  } catch (error) {
    console.error('Error deleting invitation:', error);
    return NextResponse.json(
      { error: 'Impossibile elaborare la richiesta' },
      { status: 500 }
    );
  }
}
