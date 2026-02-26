import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { deleteFile } from '@/lib/r2';
import { hashPassword, verifyPassword, needsHashUpgrade, validatePasswordStrength } from '@/lib/password';
import { requireAuth } from '@/lib/auth-utils';
import { csrfProtection } from '@/lib/csrf';
import { checkRateLimit } from '@/lib/rate-limit';

// GET - Get transfer by ID (public or by transferId)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SECURITY: Rate limit to prevent enumeration/scraping
    const rateLimitResponse = await checkRateLimit(request, 'download');
    if (rateLimitResponse) return rateLimitResponse;

    const { id: transferId } = await params;
    const db = getAdminFirestore();

    // First try to find by transferId (UUID for public access)
    const transfersRef = db.collection('transfers');
    const snapshot = await transfersRef.where('transferId', '==', transferId).get();

    let docSnap;
    let docId;

    if (!snapshot.empty) {
      docSnap = snapshot.docs[0];
      docId = docSnap.id;
    } else {
      // Try by document ID (for authenticated access)
      const directDoc = await db.collection('transfers').doc(transferId).get();
      if (!directDoc.exists) {
        return NextResponse.json(
          { error: 'Transfer non trovato' },
          { status: 404 }
        );
      }
      docSnap = directDoc;
      docId = transferId;
    }

    const data = docSnap.data() || {};

    // Check if expired
    const expiresAt = data.expiresAt?.toDate();
    if (expiresAt && expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Transfer scaduto', status: 'expired' },
        { status: 410 }
      );
    }

    // Fetch files - expose safe fields + encryption metadata needed for client-side decryption
    const filesSnapshot = await db.collection('transfers').doc(docId).collection('files').get();
    const files = filesSnapshot.docs.map(fileDoc => {
      const fData = fileDoc.data();
      return {
        id: fileDoc.id,
        originalName: fData.originalName,
        size: fData.size,
        mimeType: fData.mimeType,
        isEncrypted: fData.isEncrypted || false,
        encryptionKey: fData.encryptionKey || null,
        encryptionIv: fData.encryptionIv || null,
        createdAt: fData.createdAt?.toDate()?.toISOString() || null,
      };
    });

    // Return transfer data (excluding password hash for security)
    const { password, ...safeData } = data;

    return NextResponse.json({
      id: docId,
      ...safeData,
      hasPassword: !!password,
      files,
      expiresAt: data.expiresAt?.toDate()?.toISOString() || null,
      createdAt: data.createdAt?.toDate()?.toISOString() || null,
      updatedAt: data.updatedAt?.toDate()?.toISOString() || null,
    });
  } catch (error) {
    console.error('Error fetching transfer:', error);
    return NextResponse.json(
      { error: 'Impossibile recuperare il trasferimento' },
      { status: 500 }
    );
  }
}

// PATCH - Update transfer
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SECURITY: CSRF Protection
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    // SECURITY: Require authentication - don't trust userId from body
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const { id: transferId } = await params;
    const body = await request.json();
    const { title, password } = body;  // Remove userId from destructuring
    const db = getAdminFirestore();

    // Find transfer
    const snapshot = await db.collection('transfers').where('transferId', '==', transferId).get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Transfer non trovato' },
        { status: 404 }
      );
    }

    const docSnap = snapshot.docs[0];
    const data = docSnap.data() || {};

    // SECURITY: Check ownership using verified userId from token
    if (data.userId !== authResult.userId) {
      return NextResponse.json(
        { error: 'Non autorizzato a modificare questo transfer' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (title !== undefined) {
      updateData.title = title;
    }

    if (password !== undefined) {
      if (password) {
        const passwordCheck = validatePasswordStrength(password);
        if (!passwordCheck.valid) {
          return NextResponse.json(
            { error: passwordCheck.error },
            { status: 400 }
          );
        }
      }
      updateData.password = password ? await hashPassword(password) : null;
    }

    await db.collection('transfers').doc(docSnap.id).update(updateData);

    return NextResponse.json({
      success: true,
      message: 'Transfer aggiornato con successo',
    });
  } catch (error) {
    console.error('Error updating transfer:', error);
    return NextResponse.json(
      { error: 'Impossibile aggiornare il trasferimento' },
      { status: 500 }
    );
  }
}

// DELETE - Delete transfer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SECURITY: CSRF Protection
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    // SECURITY: Require authentication - don't trust userId from query params
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const { id: transferId } = await params;
    const db = getAdminFirestore();

    // Find transfer
    const snapshot = await db.collection('transfers').where('transferId', '==', transferId).get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Transfer non trovato' },
        { status: 404 }
      );
    }

    const docSnap = snapshot.docs[0];
    const data = docSnap.data() || {};

    // SECURITY: Check ownership using verified userId from token
    if (data.userId !== authResult.userId) {
      return NextResponse.json(
        { error: 'Non autorizzato a eliminare questo transfer' },
        { status: 403 }
      );
    }

    const transferDocId = docSnap.id;
    const transferUserId = data.userId;
    const totalSize = data.totalSize || 0;

    // Delete files from R2
    const filesSnapshot = await db.collection('transfers').doc(transferDocId).collection('files').get();

    for (const fileDoc of filesSnapshot.docs) {
      const fileData = fileDoc.data();
      try {
        await deleteFile(fileData.path);
      } catch (err) {
        console.error('Error deleting file from R2:', err);
      }
      // Delete file document
      await db.collection('transfers').doc(transferDocId).collection('files').doc(fileDoc.id).delete();
    }

    // Delete transfer document
    await db.collection('transfers').doc(transferDocId).delete();

    // Decrement user's storage usage and monthly transfers (if logged in user)
    if (transferUserId) {
      const userRef = db.collection('users').doc(transferUserId);
      const userDoc = await userRef.get();
      const userData = userDoc.data() || {};
      const currentStorage = userData.storageUsed || 0;
      const currentMonthlyTransfers = userData.monthlyTransfers || 0;

      await userRef.update({
        storageUsed: Math.max(0, currentStorage - totalSize),
        monthlyTransfers: Math.max(0, currentMonthlyTransfers - 1),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Transfer eliminato con successo',
    });
  } catch (error) {
    console.error('Error deleting transfer:', error);
    return NextResponse.json(
      { error: 'Impossibile eliminare il trasferimento' },
      { status: 500 }
    );
  }
}

// POST - Verify password
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: transferId } = await params;
    const body = await request.json();
    const { password, action } = body;
    const db = getAdminFirestore();

    // Find transfer
    const snapshot = await db.collection('transfers').where('transferId', '==', transferId).get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Transfer non trovato' },
        { status: 404 }
      );
    }

    const data = snapshot.docs[0].data() || {};

    // Handle password verification
    if (action === 'verify-password') {
      // SECURITY: Rate limit password verification to prevent brute force
      const passwordRateLimitResponse = await checkRateLimit(request, 'password');
      if (passwordRateLimitResponse) return passwordRateLimitResponse;

      if (!data.password) {
        return NextResponse.json({ success: true, message: 'Nessuna password richiesta' });
      }

      if (!password) {
        return NextResponse.json(
          { error: 'Password richiesta' },
          { status: 400 }
        );
      }

      // Use centralized password verification (supports bcrypt + legacy SHA-256)
      const isValid = await verifyPassword(password, data.password);

      if (!isValid) {
        return NextResponse.json(
          { error: 'Password non corretta' },
          { status: 403 }
        );
      }

      // Upgrade legacy SHA-256 hashes to bcrypt
      if (needsHashUpgrade(data.password)) {
        try {
          const newHash = await hashPassword(password);
          await db.collection('transfers').doc(snapshot.docs[0].id).update({
            password: newHash,
            updatedAt: FieldValue.serverTimestamp(),
          });
        } catch (upgradeError) {
          console.error('Failed to upgrade password hash:', upgradeError);
        }
      }

      return NextResponse.json({ success: true, message: 'Password verificata' });
    }

    // Handle download count increment
    if (action === 'increment-download') {
      await db.collection('transfers').doc(snapshot.docs[0].id).update({
        downloadCount: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Azione non valida' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing transfer action:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'elaborazione' },
      { status: 500 }
    );
  }
}
