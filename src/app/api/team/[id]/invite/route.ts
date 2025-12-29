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
import { sendEmail, getTeamInviteEmail } from '@/lib/email';

// POST - Invite member to team
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params;
    const body = await request.json();
    const { userId, email } = body;

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'userId e email richiesti' },
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
        { error: 'Solo il proprietario può invitare membri' },
        { status: 403 }
      );
    }

    // Check member limit
    const membersRef = collection(db, 'teamMembers');
    const membersQuery = query(membersRef, where('teamId', '==', teamId));
    const membersSnapshot = await getDocs(membersQuery);

    const invitationsRef = collection(db, 'teamInvitations');
    const pendingInvitationsQuery = query(
      invitationsRef,
      where('teamId', '==', teamId),
      where('status', '==', 'pending')
    );
    const pendingInvitationsSnapshot = await getDocs(pendingInvitationsQuery);

    const currentCount = membersSnapshot.size + pendingInvitationsSnapshot.size;
    const maxMembers = teamData.maxMembers || 3;

    if (currentCount >= maxMembers) {
      return NextResponse.json(
        { error: `Limite massimo di ${maxMembers} membri raggiunto` },
        { status: 400 }
      );
    }

    // Check if email is already invited or is a member
    const existingInviteQuery = query(
      invitationsRef,
      where('teamId', '==', teamId),
      where('email', '==', email),
      where('status', '==', 'pending')
    );
    const existingInviteSnapshot = await getDocs(existingInviteQuery);

    if (!existingInviteSnapshot.empty) {
      return NextResponse.json(
        { error: 'Questo indirizzo email è già stato invitato' },
        { status: 400 }
      );
    }

    // Check if email is already a member
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('email', '==', email));
    const userSnapshot = await getDocs(userQuery);

    if (!userSnapshot.empty) {
      const invitedUserId = userSnapshot.docs[0].id;
      const existingMemberQuery = query(
        membersRef,
        where('teamId', '==', teamId),
        where('userId', '==', invitedUserId)
      );
      const existingMemberSnapshot = await getDocs(existingMemberQuery);

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

    const invitationRef = await addDoc(collection(db, 'teamInvitations'), {
      teamId,
      email,
      token,
      status: 'pending',
      expiresAt,
      createdAt: serverTimestamp(),
    });

    // Send invitation email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const inviteLink = `${baseUrl}/team/invite/${token}`;

    // Get inviter name
    const inviterDoc = await getDoc(doc(db, 'users', userId));
    const inviterName = inviterDoc.exists() ? inviterDoc.data().displayName || 'Un utente' : 'Un utente';

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
