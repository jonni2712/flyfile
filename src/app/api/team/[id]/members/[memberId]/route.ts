import { NextRequest, NextResponse } from 'next/server';
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// DELETE - Remove member from team
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { id: teamId, memberId } = await params;
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
        { error: 'Solo il proprietario può rimuovere membri' },
        { status: 403 }
      );
    }

    // Get member document
    const memberRef = doc(db, 'teamMembers', memberId);
    const memberSnap = await getDoc(memberRef);

    if (!memberSnap.exists()) {
      return NextResponse.json(
        { error: 'Membro non trovato' },
        { status: 404 }
      );
    }

    const memberData = memberSnap.data();

    // Check member belongs to this team
    if (memberData.teamId !== teamId) {
      return NextResponse.json(
        { error: 'Membro non appartiene a questo team' },
        { status: 400 }
      );
    }

    // Cannot remove owner
    if (memberData.role === 'owner') {
      return NextResponse.json(
        { error: 'Non puoi rimuovere il proprietario del team' },
        { status: 400 }
      );
    }

    // Delete member
    await deleteDoc(memberRef);

    // Update team member count
    await updateDoc(teamRef, {
      memberCount: (teamData.memberCount || 1) - 1,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Membro rimosso con successo',
    });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { error: 'Impossibile rimuovere il membro' },
      { status: 500 }
    );
  }
}

// PATCH - Update member role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { id: teamId, memberId } = await params;
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId e role richiesti' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['admin', 'member'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Ruolo non valido' },
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
        { error: 'Solo il proprietario può modificare i ruoli' },
        { status: 403 }
      );
    }

    // Get member document
    const memberRef = doc(db, 'teamMembers', memberId);
    const memberSnap = await getDoc(memberRef);

    if (!memberSnap.exists()) {
      return NextResponse.json(
        { error: 'Membro non trovato' },
        { status: 404 }
      );
    }

    const memberData = memberSnap.data();

    // Check member belongs to this team
    if (memberData.teamId !== teamId) {
      return NextResponse.json(
        { error: 'Membro non appartiene a questo team' },
        { status: 400 }
      );
    }

    // Cannot change owner role
    if (memberData.role === 'owner') {
      return NextResponse.json(
        { error: 'Non puoi modificare il ruolo del proprietario' },
        { status: 400 }
      );
    }

    // Update member role
    await updateDoc(memberRef, {
      role,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Ruolo aggiornato con successo',
    });
  } catch (error) {
    console.error('Error updating member role:', error);
    return NextResponse.json(
      { error: 'Impossibile aggiornare il ruolo' },
      { status: 500 }
    );
  }
}
