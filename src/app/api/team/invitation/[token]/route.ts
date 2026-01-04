import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { requireAuth } from '@/lib/auth-utils';
import { csrfProtection } from '@/lib/csrf';

// GET - Get invitation by token (public, no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const db = getAdminFirestore();

    // Find invitation by token
    const invSnapshot = await db.collection('teamInvitations')
      .where('token', '==', token)
      .where('status', '==', 'pending')
      .get();

    if (invSnapshot.empty) {
      return NextResponse.json(
        { error: 'Invito non trovato o già utilizzato' },
        { status: 404 }
      );
    }

    const invDoc = invSnapshot.docs[0];
    const invitation = invDoc.data();

    // Check if expired
    const expiresAt = invitation.expiresAt?.toDate?.();
    if (expiresAt && expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Invito scaduto', status: 'expired' },
        { status: 410 }
      );
    }

    // Get team info
    const teamSnap = await db.collection('teams').doc(invitation.teamId).get();

    if (!teamSnap.exists) {
      return NextResponse.json(
        { error: 'Team non trovato' },
        { status: 404 }
      );
    }

    const teamData = teamSnap.data() || {};

    // Get owner info
    const ownerSnap = await db.collection('users').doc(teamData.ownerId).get();
    const ownerData = ownerSnap.exists ? ownerSnap.data() || {} : {};

    return NextResponse.json({
      invitation: {
        id: invDoc.id,
        email: invitation.email,
        expiresAt: invitation.expiresAt?.toDate?.()?.toISOString() || null,
        createdAt: invitation.createdAt?.toDate?.()?.toISOString() || null,
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
    // SECURITY: CSRF Protection
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    const { token } = await params;

    // SECURITY: Require authentication - don't trust userId from body
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const userId = authResult.userId!;  // Use verified userId from token

    const db = getAdminFirestore();

    // Get user info
    const userSnap = await db.collection('users').doc(userId).get();

    if (!userSnap.exists) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    const userData = userSnap.data() || {};

    // Find invitation by token
    const invSnapshot = await db.collection('teamInvitations')
      .where('token', '==', token)
      .where('status', '==', 'pending')
      .get();

    if (invSnapshot.empty) {
      return NextResponse.json(
        { error: 'Invito non valido o già utilizzato' },
        { status: 404 }
      );
    }

    const invDoc = invSnapshot.docs[0];
    const invitation = invDoc.data();

    // Check if expired
    const expiresAt = invitation.expiresAt?.toDate?.();
    if (expiresAt && expiresAt < new Date()) {
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
    const existingMemberSnapshot = await db.collection('teamMembers')
      .where('userId', '==', userId)
      .get();

    if (!existingMemberSnapshot.empty) {
      return NextResponse.json(
        { error: 'Sei già membro di un team' },
        { status: 400 }
      );
    }

    // Get team
    const teamSnap = await db.collection('teams').doc(invitation.teamId).get();

    if (!teamSnap.exists) {
      return NextResponse.json(
        { error: 'Team non trovato' },
        { status: 404 }
      );
    }

    const teamData = teamSnap.data() || {};

    // Add user as team member
    await db.collection('teamMembers').add({
      teamId: invitation.teamId,
      userId: userId,
      role: 'member',
      storageUsed: 0,
      joinedAt: FieldValue.serverTimestamp(),
    });

    // Update invitation status
    await db.collection('teamInvitations').doc(invDoc.id).update({
      status: 'accepted',
      acceptedAt: FieldValue.serverTimestamp(),
    });

    // Update team member count
    await db.collection('teams').doc(invitation.teamId).update({
      memberCount: (teamData.memberCount || 1) + 1,
      updatedAt: FieldValue.serverTimestamp(),
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
    // SECURITY: CSRF Protection
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    // SECURITY: Require authentication
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const userId = authResult.userId!;

    const { token } = await params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action'); // 'cancel' or 'decline'

    const db = getAdminFirestore();

    // Find invitation by token
    const invSnapshot = await db.collection('teamInvitations')
      .where('token', '==', token)
      .where('status', '==', 'pending')
      .get();

    if (invSnapshot.empty) {
      return NextResponse.json(
        { error: 'Invito non trovato' },
        { status: 404 }
      );
    }

    const invDoc = invSnapshot.docs[0];
    const invitation = invDoc.data();

    // If canceling (owner action), verify ownership
    if (action === 'cancel') {
      const teamSnap = await db.collection('teams').doc(invitation.teamId).get();

      if (!teamSnap.exists) {
        return NextResponse.json(
          { error: 'Team non trovato' },
          { status: 404 }
        );
      }

      const teamData = teamSnap.data() || {};

      if (teamData.ownerId !== userId) {
        return NextResponse.json(
          { error: 'Solo il proprietario può annullare gli inviti' },
          { status: 403 }
        );
      }
    } else if (action === 'decline') {
      // For declining, verify the invitation is for this user's email
      const userSnap = await db.collection('users').doc(userId).get();
      const userData = userSnap.exists ? userSnap.data() || {} : {};

      if (invitation.email.toLowerCase() !== userData.email?.toLowerCase()) {
        return NextResponse.json(
          { error: 'Non autorizzato a rifiutare questo invito' },
          { status: 403 }
        );
      }
    }

    // Delete invitation
    await db.collection('teamInvitations').doc(invDoc.id).delete();

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
