import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { deleteFile } from '@/lib/r2';
import { authenticateApiRequest, hasPermission, unauthorizedResponse, forbiddenResponse } from '@/lib/api-auth';
import { checkRateLimit } from '@/lib/rate-limit';

// GET /api/v1/transfers/:id - Get transfer details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // Authenticate
    const auth = await authenticateApiRequest(request);
    if (!auth.authenticated) {
      return unauthorizedResponse(auth.error || 'Non autorizzato');
    }

    // Check permissions
    if (!hasPermission(auth.permissions, 'read')) {
      return forbiddenResponse('Permesso "read" richiesto');
    }

    const { id: transferId } = await params;

    // Get transfer document using Admin SDK
    const db = getAdminFirestore();
    const transferRef = db.collection('transfers').doc(transferId);
    const transferSnap = await transferRef.get();

    if (!transferSnap.exists) {
      return NextResponse.json(
        { success: false, error: 'Transfer non trovato', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const data = transferSnap.data() || {};

    // Verify ownership
    if (data.userId !== auth.userId) {
      return forbiddenResponse('Non autorizzato ad accedere a questo transfer');
    }

    // Get files
    const filesSnapshot = await db.collection('transfers').doc(transferId).collection('files').get();

    const files: Array<{
      id: string;
      name: string;
      size: number;
      mimeType: string;
    }> = [];

    filesSnapshot.forEach((fileDoc) => {
      const fileData = fileDoc.data();
      files.push({
        id: fileDoc.id,
        name: fileData.originalName,
        size: fileData.size,
        mimeType: fileData.mimeType,
      });
    });

    const expiresAt = data.expiresAt?.toDate?.();
    const isExpired = expiresAt ? expiresAt < new Date() : false;

    return NextResponse.json({
      success: true,
      data: {
        id: transferSnap.id,
        transferId: data.transferId,
        title: data.title || 'Senza titolo',
        message: data.message || null,
        status: isExpired ? 'expired' : data.status || 'active',
        fileCount: data.fileCount || files.length,
        totalSize: data.totalSize || 0,
        downloadCount: data.downloadCount || 0,
        hasPassword: !!data.password,
        recipientEmail: data.recipientEmail || null,
        expiresAt: expiresAt?.toISOString() || null,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        downloadUrl: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/download/${data.transferId}`,
        files,
      },
    });
  } catch (error) {
    console.error('API v1 GET transfer error:', error);
    return NextResponse.json(
      { success: false, error: 'Errore interno del server', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/transfers/:id - Delete a transfer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // Authenticate
    const auth = await authenticateApiRequest(request);
    if (!auth.authenticated) {
      return unauthorizedResponse(auth.error || 'Non autorizzato');
    }

    // Check permissions
    if (!hasPermission(auth.permissions, 'delete')) {
      return forbiddenResponse('Permesso "delete" richiesto');
    }

    const { id: transferId } = await params;

    // Get transfer document using Admin SDK
    const db = getAdminFirestore();
    const transferRef = db.collection('transfers').doc(transferId);
    const transferSnap = await transferRef.get();

    if (!transferSnap.exists) {
      return NextResponse.json(
        { success: false, error: 'Transfer non trovato', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const data = transferSnap.data() || {};

    // Verify ownership
    if (data.userId !== auth.userId) {
      return forbiddenResponse('Non autorizzato ad eliminare questo transfer');
    }

    const totalSize = data.totalSize || 0;

    // Delete files from R2
    const filesSnapshot = await db.collection('transfers').doc(transferId).collection('files').get();

    for (const fileDoc of filesSnapshot.docs) {
      const fileData = fileDoc.data();
      try {
        if (fileData.path) {
          await deleteFile(fileData.path);
        }
      } catch (err) {
        console.error('Error deleting file from R2:', err);
      }
      // Delete file document
      await db.collection('transfers').doc(transferId).collection('files').doc(fileDoc.id).delete();
    }

    // Delete transfer document
    await transferRef.delete();

    // Update user's storage (don't go negative)
    if (data.userId && totalSize > 0) {
      const userRef = db.collection('users').doc(data.userId);
      const userDoc = await userRef.get();
      const currentStorage = userDoc.data()?.storageUsed || 0;
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
    console.error('API v1 DELETE transfer error:', error);
    return NextResponse.json(
      { success: false, error: 'Errore interno del server', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
