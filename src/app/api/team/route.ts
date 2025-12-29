import { NextRequest, NextResponse } from 'next/server';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// POST - Create team
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, description } = body;

    if (!userId || !name) {
      return NextResponse.json(
        { error: 'userId e name richiesti' },
        { status: 400 }
      );
    }

    // Verify user exists and has business plan
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    const userData = userSnap.data();
    if (userData.plan !== 'business') {
      return NextResponse.json(
        { error: 'Piano Business richiesto per creare un team' },
        { status: 403 }
      );
    }

    // Check if user already owns a team
    const teamsRef = collection(db, 'teams');
    const existingTeamQuery = query(teamsRef, where('ownerId', '==', userId));
    const existingTeamSnapshot = await getDocs(existingTeamQuery);

    if (!existingTeamSnapshot.empty) {
      return NextResponse.json(
        { error: 'Hai già un team' },
        { status: 400 }
      );
    }

    // Create team
    const teamData = {
      name,
      description: description || null,
      ownerId: userId,
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
      userId: userId,
      role: 'owner',
      storageUsed: 0,
      joinedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      teamId: teamRef.id,
      message: 'Team creato con successo',
    });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Impossibile creare il team' },
      { status: 500 }
    );
  }
}

// GET - Get user's team
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId richiesto' },
        { status: 400 }
      );
    }

    // First check if user owns a team
    const teamsRef = collection(db, 'teams');
    let q = query(teamsRef, where('ownerId', '==', userId));
    let snapshot = await getDocs(q);

    let teamDoc;

    if (snapshot.empty) {
      // Check if user is a member of a team
      const membersRef = collection(db, 'teamMembers');
      const memberQuery = query(membersRef, where('userId', '==', userId));
      const memberSnapshot = await getDocs(memberQuery);

      if (!memberSnapshot.empty) {
        const memberData = memberSnapshot.docs[0].data();
        const teamDocRef = await getDoc(doc(db, 'teams', memberData.teamId));
        if (teamDocRef.exists()) {
          teamDoc = teamDocRef;
        }
      }
    } else {
      teamDoc = snapshot.docs[0];
    }

    if (!teamDoc) {
      return NextResponse.json({ team: null });
    }

    const teamData = teamDoc.data();
    const teamId = teamDoc.id;

    // Fetch members
    const membersRef = collection(db, 'teamMembers');
    const membersQuery = query(membersRef, where('teamId', '==', teamId));
    const membersSnapshot = await getDocs(membersQuery);

    const members = [];
    for (const memberDoc of membersSnapshot.docs) {
      const memberData = memberDoc.data();
      // Fetch user info
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

    // Fetch pending invitations
    const invitationsRef = collection(db, 'teamInvitations');
    const invitationsQuery = query(
      invitationsRef,
      where('teamId', '==', teamId),
      where('status', '==', 'pending')
    );
    const invitationsSnapshot = await getDocs(invitationsQuery);

    const pendingInvitations = invitationsSnapshot.docs.map(invDoc => ({
      id: invDoc.id,
      email: invDoc.data().email,
      status: invDoc.data().status,
      expiresAt: invDoc.data().expiresAt?.toDate()?.toISOString() || null,
      createdAt: invDoc.data().createdAt?.toDate()?.toISOString() || null,
    }));

    return NextResponse.json({
      team: {
        id: teamId,
        name: teamData.name,
        description: teamData.description,
        ownerId: teamData.ownerId,
        memberCount: teamData.memberCount || members.length,
        maxMembers: teamData.maxMembers || 3,
        storageUsed: teamData.storageUsed || 0,
        members,
        pendingInvitations,
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
