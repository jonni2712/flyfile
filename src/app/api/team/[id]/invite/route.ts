import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { sendEmail, getTeamInviteEmail } from '@/lib/email';
import { requireAuth } from '@/lib/auth-utils';
import { csrfProtection } from '@/lib/csrf';

// POST - Invite member to team
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SECURITY: CSRF Protection
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    // SECURITY: Require authentication
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const { id: teamId } = await params;
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'email richiesta' },
        { status: 400 }
      );
    }

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
        { error: 'Solo il proprietario può invitare membri' },
        { status: 403 }
      );
    }

    // Check member limit
    const membersSnapshot = await db.collection('teamMembers')
      .where('teamId', '==', teamId)
      .get();

    const pendingInvitationsSnapshot = await db.collection('teamInvitations')
      .where('teamId', '==', teamId)
      .where('status', '==', 'pending')
      .get();

    const currentCount = membersSnapshot.size + pendingInvitationsSnapshot.size;
    const maxMembers = teamData.maxMembers || 3;

    if (currentCount >= maxMembers) {
      return NextResponse.json(
        { error: `Limite massimo di ${maxMembers} membri raggiunto` },
        { status: 400 }
      );
    }

    // Check if email is already invited
    const existingInviteSnapshot = await db.collection('teamInvitations')
      .where('teamId', '==', teamId)
      .where('email', '==', email)
      .where('status', '==', 'pending')
      .get();

    if (!existingInviteSnapshot.empty) {
      return NextResponse.json(
        { error: 'Questo indirizzo email è già stato invitato' },
        { status: 400 }
      );
    }

    // Check if email is already a member
    const userSnapshot = await db.collection('users')
      .where('email', '==', email)
      .get();

    if (!userSnapshot.empty) {
      const invitedUserId = userSnapshot.docs[0].id;
      const existingMemberSnapshot = await db.collection('teamMembers')
        .where('teamId', '==', teamId)
        .where('userId', '==', invitedUserId)
        .get();

      if (!existingMemberSnapshot.empty) {
        return NextResponse.json(
          { error: 'Questo utente è già un membro del team' },
          { status: 400 }
        );
      }
    }

    // Generate invitation token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const invitationRef = await db.collection('teamInvitations').add({
      teamId,
      email,
      token,
      status: 'pending',
      expiresAt,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Send invitation email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const inviteLink = `${baseUrl}/team/invite/${token}`;

    // Get inviter name
    const inviterDoc = await db.collection('users').doc(authResult.userId!).get();
    const inviterData = inviterDoc.exists ? inviterDoc.data() || {} : {};
    const inviterName = inviterData.displayName || 'Un utente';

    try {
      const { html, text } = getTeamInviteEmail({
        teamName: teamData.name,
        inviterName,
        inviteLink,
      });

      await sendEmail({
        to: email,
        subject: `Sei stato invitato a unirti al team "${teamData.name}" su FlyFile`,
        html,
        text,
      });
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError);
      // Don't fail the request if email fails - invitation is still created
    }

    return NextResponse.json({
      success: true,
      invitationId: invitationRef.id,
      token,
      inviteLink,
      message: 'Invito inviato con successo',
    });
  } catch (error) {
    console.error('Error inviting member:', error);
    return NextResponse.json(
      { error: 'Impossibile inviare l\'invito' },
      { status: 500 }
    );
  }
}
