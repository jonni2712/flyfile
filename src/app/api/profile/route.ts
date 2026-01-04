import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { deleteFile } from '@/lib/r2';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireAuth, isAuthorizedForUser } from '@/lib/auth-utils';
import { csrfProtection } from '@/lib/csrf';

// PATCH - Update profile
export async function PATCH(request: NextRequest) {
  try {
    // CSRF Protection
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    // Rate limiting: 60 requests per minute for API operations
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // Verify authentication
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const body = await request.json();
    const { userId, displayName, company, phone, address, city, postalCode, country, vatNumber } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId richiesto' },
        { status: 400 }
      );
    }

    // Verify authorized to update this user's profile
    if (!isAuthorizedForUser(authResult, userId)) {
      return NextResponse.json(
        { error: 'Non autorizzato a modificare questo profilo' },
        { status: 403 }
      );
    }

    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (displayName !== undefined) updateData.displayName = displayName;
    if (company !== undefined) updateData.company = company;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (postalCode !== undefined) updateData.postalCode = postalCode;
    if (country !== undefined) updateData.country = country;
    if (vatNumber !== undefined) updateData.vatNumber = vatNumber;

    await userRef.update(updateData);

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

// DELETE - Delete account (CRITICAL: Requires authentication)
export async function DELETE(request: NextRequest) {
  try {
    // CSRF Protection
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    // Rate limiting: 3 requests per minute for sensitive operations
    const rateLimitResponse = await checkRateLimit(request, 'sensitive');
    if (rateLimitResponse) return rateLimitResponse;

    // CRITICAL: Verify authentication
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

    // CRITICAL: Verify the authenticated user is deleting their own account
    if (!isAuthorizedForUser(authResult, userId)) {
      return NextResponse.json(
        { error: 'Non autorizzato a eliminare questo account' },
        { status: 403 }
      );
    }

    const db = getAdminFirestore();

    // Verify user exists
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    // Delete all user's transfers and files
    const transfersSnapshot = await db.collection('transfers')
      .where('userId', '==', userId)
      .get();

    for (const transferDoc of transfersSnapshot.docs) {
      // Delete files from R2
      const filesSnapshot = await db.collection('transfers')
        .doc(transferDoc.id)
        .collection('files')
        .get();

      for (const fileDoc of filesSnapshot.docs) {
        const fileData = fileDoc.data();
        try {
          if (fileData.path) {
            await deleteFile(fileData.path);
          }
        } catch (err) {
          console.error('Error deleting file from R2:', err);
        }
        await db.collection('transfers')
          .doc(transferDoc.id)
          .collection('files')
          .doc(fileDoc.id)
          .delete();
      }

      // Delete transfer
      await db.collection('transfers').doc(transferDoc.id).delete();
    }

    // Delete user's files
    const userFilesSnapshot = await db.collection('files')
      .where('userId', '==', userId)
      .get();

    for (const fileDoc of userFilesSnapshot.docs) {
      const fileData = fileDoc.data();
      try {
        if (fileData.path) {
          await deleteFile(fileData.path);
        }
      } catch (err) {
        console.error('Error deleting file from R2:', err);
      }
      await db.collection('files').doc(fileDoc.id).delete();
    }

    // Delete team memberships
    const membersSnapshot = await db.collection('teamMembers')
      .where('userId', '==', userId)
      .get();

    for (const memberDoc of membersSnapshot.docs) {
      await db.collection('teamMembers').doc(memberDoc.id).delete();
    }

    // Delete owned teams
    const teamsSnapshot = await db.collection('teams')
      .where('ownerId', '==', userId)
      .get();

    for (const teamDoc of teamsSnapshot.docs) {
      // Delete team members
      const teamMembersSnapshot = await db.collection('teamMembers')
        .where('teamId', '==', teamDoc.id)
        .get();

      for (const memberDoc of teamMembersSnapshot.docs) {
        await db.collection('teamMembers').doc(memberDoc.id).delete();
      }

      // Delete team invitations
      const invitationsSnapshot = await db.collection('teamInvitations')
        .where('teamId', '==', teamDoc.id)
        .get();

      for (const invDoc of invitationsSnapshot.docs) {
        await db.collection('teamInvitations').doc(invDoc.id).delete();
      }

      await db.collection('teams').doc(teamDoc.id).delete();
    }

    // Delete avatar from R2 if exists
    const userData = userSnap.data();
    if (userData?.avatarPath) {
      try {
        await deleteFile(userData.avatarPath);
      } catch (err) {
        console.error('Error deleting avatar from R2:', err);
      }
    }

    // Delete user profile
    await userRef.delete();

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
    // Rate limiting: 60 requests per minute for API operations
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

    // Verify authorized to view this user's profile
    if (!isAuthorizedForUser(authResult, userId)) {
      return NextResponse.json(
        { error: 'Non autorizzato a visualizzare questo profilo' },
        { status: 403 }
      );
    }

    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    const data = userSnap.data() || {};

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
