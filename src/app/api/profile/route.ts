import { NextRequest, NextResponse } from 'next/server';
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { deleteFile } from '@/lib/r2';

// PATCH - Update profile
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, displayName, company, phone, address, city, postalCode, country, vatNumber } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId richiesto' },
        { status: 400 }
      );
    }

    // Verify user exists
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (displayName !== undefined) updateData.displayName = displayName;
    if (company !== undefined) updateData.company = company;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (postalCode !== undefined) updateData.postalCode = postalCode;
    if (country !== undefined) updateData.country = country;
    if (vatNumber !== undefined) updateData.vatNumber = vatNumber;

    await updateDoc(userRef, updateData);

    return NextResponse.json({
      success: true,
      message: 'Profilo aggiornato con successo',
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Impossibile aggiornare il profilo' },
      { status: 500 }
    );
  }
}

// DELETE - Delete account
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId richiesto' },
        { status: 400 }
      );
    }

    // Verify user exists
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    // Delete all user's transfers and files
    const transfersRef = collection(db, 'transfers');
    const transfersQuery = query(transfersRef, where('userId', '==', userId));
    const transfersSnapshot = await getDocs(transfersQuery);

    for (const transferDoc of transfersSnapshot.docs) {
      // Delete files from R2
      const filesRef = collection(db, 'transfers', transferDoc.id, 'files');
      const filesSnapshot = await getDocs(filesRef);

      for (const fileDoc of filesSnapshot.docs) {
        const fileData = fileDoc.data();
        try {
          await deleteFile(fileData.path);
        } catch (err) {
          console.error('Error deleting file from R2:', err);
        }
        await deleteDoc(doc(db, 'transfers', transferDoc.id, 'files', fileDoc.id));
      }

      // Delete transfer
      await deleteDoc(doc(db, 'transfers', transferDoc.id));
    }

    // Delete user's files
    const userFilesRef = collection(db, 'files');
    const userFilesQuery = query(userFilesRef, where('userId', '==', userId));
    const userFilesSnapshot = await getDocs(userFilesQuery);

    for (const fileDoc of userFilesSnapshot.docs) {
      const fileData = fileDoc.data();
      try {
        await deleteFile(fileData.path);
      } catch (err) {
        console.error('Error deleting file from R2:', err);
      }
      await deleteDoc(doc(db, 'files', fileDoc.id));
    }

    // Delete team memberships
    const membersRef = collection(db, 'teamMembers');
    const membersQuery = query(membersRef, where('userId', '==', userId));
    const membersSnapshot = await getDocs(membersQuery);

    for (const memberDoc of membersSnapshot.docs) {
      await deleteDoc(doc(db, 'teamMembers', memberDoc.id));
    }

    // Delete owned teams
    const teamsRef = collection(db, 'teams');
    const teamsQuery = query(teamsRef, where('ownerId', '==', userId));
    const teamsSnapshot = await getDocs(teamsQuery);

    for (const teamDoc of teamsSnapshot.docs) {
      // Delete team members
      const teamMembersRef = collection(db, 'teamMembers');
      const teamMembersQuery = query(teamMembersRef, where('teamId', '==', teamDoc.id));
      const teamMembersSnapshot = await getDocs(teamMembersQuery);

      for (const memberDoc of teamMembersSnapshot.docs) {
        await deleteDoc(doc(db, 'teamMembers', memberDoc.id));
      }

      // Delete team invitations
      const invitationsRef = collection(db, 'teamInvitations');
      const invitationsQuery = query(invitationsRef, where('teamId', '==', teamDoc.id));
      const invitationsSnapshot = await getDocs(invitationsQuery);

      for (const invDoc of invitationsSnapshot.docs) {
        await deleteDoc(doc(db, 'teamInvitations', invDoc.id));
      }

      await deleteDoc(doc(db, 'teams', teamDoc.id));
    }

    // Delete avatar from R2 if exists
    const userData = userSnap.data();
    if (userData.avatarPath) {
      try {
        await deleteFile(userData.avatarPath);
      } catch (err) {
        console.error('Error deleting avatar from R2:', err);
      }
    }

    // Delete user profile
    await deleteDoc(userRef);

    return NextResponse.json({
      success: true,
      message: 'Account eliminato con successo',
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Impossibile eliminare l\'account' },
      { status: 500 }
    );
  }
}

// GET - Get profile
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

    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    const data = userSnap.data();

    return NextResponse.json({
      uid: userId,
      ...data,
      createdAt: data.createdAt?.toDate()?.toISOString() || null,
      updatedAt: data.updatedAt?.toDate()?.toISOString() || null,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Impossibile recuperare il profilo' },
      { status: 500 }
    );
  }
}
