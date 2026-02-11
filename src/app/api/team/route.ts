import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { requireAuth, isAuthorizedForUser } from '@/lib/auth-utils';
import { checkRateLimit } from '@/lib/rate-limit';
import { csrfProtection } from '@/lib/csrf';

// POST - Create team
export async function POST(request: NextRequest) {
  try {
    // SECURITY: CSRF Protection
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // Verify authentication
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const body = await request.json();
    const { userId, name, description } = body;

    if (!userId || !name) {
      return NextResponse.json(
        { error: 'userId e name richiesti' },
        { status: 400 }
      );
    }

    // CRITICAL: Verify the authenticated user matches the userId
    if (!isAuthorizedForUser(authResult, userId)) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    const db = getAdminFirestore();

    // Verify user exists and has business plan
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    const userData = userSnap.data() || {};
    if (userData.plan !== 'business') {
      return NextResponse.json(
        { error: 'Piano Business richiesto per creare un team' },
        { status: 403 }
      );
    }

    // Check if user already owns a team
    const existingTeamSnapshot = await db.collection('teams')
      .where('ownerId', '==', userId)
      .get();

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
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const teamRef = await db.collection('teams').add(teamData);

    // Add owner as first member (use composite ID for security rules)
    const memberDocId = `${userId}_${teamRef.id}`;
    await db.collection('teamMembers').doc(memberDocId).set({
      teamId: teamRef.id,
      userId: userId,
      role: 'owner',
      storageUsed: 0,
      joinedAt: FieldValue.serverTimestamp(),
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
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // Verify authentication
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId richiesto' },
        { status: 400 }
      );
    }

    // CRITICAL: Verify the authenticated user matches the userId
    if (!isAuthorizedForUser(authResult, userId)) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    const db = getAdminFirestore();

    // First check if user owns a team
    let snapshot = await db.collection('teams')
      .where('ownerId', '==', userId)
      .get();

    let teamDoc: FirebaseFirestore.DocumentSnapshot | null = null;
    let teamId = '';

    if (snapshot.empty) {
      // Check if user is a member of a team
      const memberSnapshot = await db.collection('teamMembers')
        .where('userId', '==', userId)
        .get();

      if (!memberSnapshot.empty) {
        const memberData = memberSnapshot.docs[0].data();
        const teamDocRef = await db.collection('teams').doc(memberData.teamId).get();
        if (teamDocRef.exists) {
          teamDoc = teamDocRef;
          teamId = teamDocRef.id;
        }
      }
    } else {
      teamDoc = snapshot.docs[0];
      teamId = teamDoc.id;
    }

    if (!teamDoc) {
      return NextResponse.json({ team: null });
    }

    const teamData = teamDoc.data() || {};

    // Fetch members
    const membersSnapshot = await db.collection('teamMembers')
      .where('teamId', '==', teamId)
      .get();

    const members = [];
    for (const memberDoc of membersSnapshot.docs) {
      const memberData = memberDoc.data();
      // Fetch user info
      const userDocRef = await db.collection('users').doc(memberData.userId).get();
      const userData = userDocRef.exists ? userDocRef.data() || {} : {};

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
    const invitationsSnapshot = await db.collection('teamInvitations')
      .where('teamId', '==', teamId)
      .where('status', '==', 'pending')
      .get();

    const pendingInvitations = invitationsSnapshot.docs.map(invDoc => {
      const data = invDoc.data();
      return {
        id: invDoc.id,
        email: data.email,
        status: data.status,
        expiresAt: data.expiresAt?.toDate()?.toISOString() || null,
        createdAt: data.createdAt?.toDate()?.toISOString() || null,
      };
    });

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
