import { NextRequest, NextResponse } from 'next/server';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
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

    // First try to find by transferId (UUID for public access)
    const transfersRef = collection(db, 'transfers');
    const q = query(transfersRef, where('transferId', '==', transferId));
    const snapshot = await getDocs(q);

    let docSnap;
    let docId;

    if (!snapshot.empty) {
      docSnap = snapshot.docs[0];
      docId = docSnap.id;
    } else {
      // Try by document ID (for authenticated access)
      const directDoc = await getDoc(doc(db, 'transfers', transferId));
      if (!directDoc.exists()) {
        return NextResponse.json(
          { error: 'Transfer non trovato' },
          { status: 404 }
        );
      }
      docSnap = directDoc;
      docId = transferId;
    }

    const data = docSnap.data();

    // Check if expired
    const expiresAt = data.expiresAt?.toDate();
    if (expiresAt && expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Transfer scaduto', status: 'expired' },
        { status: 410 }
      );
    }

    // Fetch files
    const filesRef = collection(db, 'transfers', docId, 'files');
    const filesSnapshot = await getDocs(filesRef);
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

    // Find transfer
    const transfersRef = collection(db, 'transfers');
    const q = query(transfersRef, where('transferId', '==', transferId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Transfer non trovato' },
        { status: 404 }
      );
    }

    const docSnap = snapshot.docs[0];
    const data = docSnap.data();

    // Check ownership
    if (userId && data.userId !== userId) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (title !== undefined) {
      updateData.title = title;
    }

    if (password !== undefined) {
      updateData.password = password ? await hashPassword(password) : null;
    }

    await updateDoc(doc(db, 'transfers', docSnap.id), updateData);

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

    // Find transfer
    const transfersRef = collection(db, 'transfers');
    const q = query(transfersRef, where('transferId', '==', transferId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Transfer non trovato' },
        { status: 404 }
      );
    }

    const docSnap = snapshot.docs[0];
    const data = docSnap.data();

    // Check ownership
    if (userId && data.userId !== userId) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    // Delete files from R2
    const filesRef = collection(db, 'transfers', docSnap.id, 'files');
    const filesSnapshot = await getDocs(filesRef);

    for (const fileDoc of filesSnapshot.docs) {
      const fileData = fileDoc.data();
      try {
        await deleteFile(fileData.path);
      } catch (err) {
        console.error('Error deleting file from R2:', err);
      }
      // Delete file document
      await deleteDoc(doc(db, 'transfers', docSnap.id, 'files', fileDoc.id));
    }

    // Delete transfer document
    await deleteDoc(doc(db, 'transfers', docSnap.id));

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

    // Find transfer
    const transfersRef = collection(db, 'transfers');
    const q = query(transfersRef, where('transferId', '==', transferId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Transfer non trovato' },
        { status: 404 }
      );
    }

    const data = snapshot.docs[0].data();

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
      const docRef = doc(db, 'transfers', snapshot.docs[0].id);
      await updateDoc(docRef, {
        downloadCount: (data.downloadCount || 0) + 1,
        updatedAt: serverTimestamp(),
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
