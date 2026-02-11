import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { requireAuth, isAuthorizedForUser } from '@/lib/auth-utils';
import { csrfProtection } from '@/lib/csrf';
import { checkRateLimit } from '@/lib/rate-limit';

// GET - Get team by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // SECURITY: Require authentication
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const { id: teamId } = await params;
    const db = getAdminFirestore();

    const teamSnap = await db.collection('teams').doc(teamId).get();

    if (!teamSnap.exists) {
      return NextResponse.json(
        { error: 'Team non trovato' },
        { status: 404 }
      );
    }

    const teamData = teamSnap.data() || {};

    // SECURITY: Verify user is owner or member of the team
    const membershipSnapshot = await db.collection('teamMembers')
      .where('teamId', '==', teamId)
      .where('userId', '==', authResult.userId)
      .get();

    const isOwner = teamData.ownerId === authResult.userId;
    const isMember = !membershipSnapshot.empty;

    if (!isOwner && !isMember) {
      return NextResponse.json(
        { error: 'Non autorizzato a visualizzare questo team' },
        { status: 403 }
      );
    }

    // Fetch members
    const membersSnapshot = await db.collection('teamMembers')
      .where('teamId', '==', teamId)
      .get();

    const members = [];
    for (const memberDoc of membersSnapshot.docs) {
      const memberData = memberDoc.data();
      const userDoc = await db.collection('users').doc(memberData.userId).get();
      const userData = userDoc.exists ? userDoc.data() || {} : {};

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
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // SECURITY: CSRF Protection
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    // SECURITY: Require authentication
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const { id: teamId } = await params;
    const body = await request.json();
    const { name, description } = body;

    const db = getAdminFirestore();

    // Verify team exists
    const teamSnap = await db.collection('teams').doc(teamId).get();

    if (!teamSnap.exists) {
      return NextResponse.json(
        { error: 'Team non trovato' },
        { status: 404 }
      );
    }

    const teamData = teamSnap.data() || {};

    // SECURITY: Check if authenticated user is owner
    if (teamData.ownerId !== authResult.userId) {
      return NextResponse.json(
        { error: 'Solo il proprietario può modificare il team' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    await db.collection('teams').doc(teamId).update(updateData);

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
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // SECURITY: CSRF Protection
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    // SECURITY: Require authentication
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const { id: teamId } = await params;
    const db = getAdminFirestore();

    // Verify team exists
    const teamSnap = await db.collection('teams').doc(teamId).get();

    if (!teamSnap.exists) {
      return NextResponse.json(
        { error: 'Team non trovato' },
        { status: 404 }
      );
    }

    const teamData = teamSnap.data() || {};

    // SECURITY: Check if authenticated user is owner
    if (teamData.ownerId !== authResult.userId) {
      return NextResponse.json(
        { error: 'Solo il proprietario può eliminare il team' },
        { status: 403 }
      );
    }

    // Delete all members
    const membersSnapshot = await db.collection('teamMembers')
      .where('teamId', '==', teamId)
      .get();

    for (const memberDoc of membersSnapshot.docs) {
      await db.collection('teamMembers').doc(memberDoc.id).delete();
    }

    // Delete all invitations
    const invitationsSnapshot = await db.collection('teamInvitations')
      .where('teamId', '==', teamId)
      .get();

    for (const invDoc of invitationsSnapshot.docs) {
      await db.collection('teamInvitations').doc(invDoc.id).delete();
    }

    // Delete team
    await db.collection('teams').doc(teamId).delete();

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
