import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { deleteFile } from '@/lib/r2';

// Simple password hashing
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + process.env.PASSWORD_SALT || 'flyfile-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPasswordHash(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// GET - Get transfer by ID (public or by transferId)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    // Fetch files
    const filesSnapshot = await db.collection('transfers').doc(docId).collection('files').get();
    const files = filesSnapshot.docs.map(fileDoc => ({
      id: fileDoc.id,
      ...fileDoc.data(),
      createdAt: fileDoc.data().createdAt?.toDate()?.toISOString() || null,
    }));

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
    const { id: transferId } = await params;
    const body = await request.json();
    const { title, password, userId } = body;
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

    // Check ownership
    if (userId && data.userId !== userId) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
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
    const { id: transferId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
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

    // Check ownership
    if (userId && data.userId !== userId) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
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

    // Decrement user's storage usage (if logged in user)
    if (transferUserId && totalSize > 0) {
      const userRef = db.collection('users').doc(transferUserId);
      const userDoc = await userRef.get();
      const currentStorage = userDoc.data()?.storageUsed || 0;

      // Only decrement if we won't go negative
      const newStorage = Math.max(0, currentStorage - totalSize);
      await userRef.update({
        storageUsed: newStorage,
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
      if (!data.password) {
        return NextResponse.json({ success: true, message: 'Nessuna password richiesta' });
      }

      if (!password) {
        return NextResponse.json(
          { error: 'Password richiesta' },
          { status: 400 }
        );
      }

      const isValid = await verifyPasswordHash(password, data.password);

      if (!isValid) {
        return NextResponse.json(
          { error: 'Password non corretta' },
          { status: 403 }
        );
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
