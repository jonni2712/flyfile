import { NextRequest, NextResponse } from 'next/server';
import { deleteFile } from '@/lib/r2';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireAuth, isAuthorizedForUser } from '@/lib/auth-utils';
import { csrfProtection } from '@/lib/csrf';

export async function DELETE(request: NextRequest) {
  try {
    // CSRF Protection
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    // Rate limiting: 60 requests per minute for API operations
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // CRITICAL: Verify authentication
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const { fileId, r2Key } = await request.json();

    if (!fileId || !r2Key) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();

    // Get file data to verify ownership
    const fileDoc = await db.collection('files').doc(fileId).get();

    if (!fileDoc.exists) {
      return NextResponse.json(
        { error: 'File non trovato' },
        { status: 404 }
      );
    }

    const fileData = fileDoc.data() || {};

    // CRITICAL: Verify the authenticated user owns this file
    if (!isAuthorizedForUser(authResult, fileData.userId)) {
      return NextResponse.json(
        { error: 'Non autorizzato a eliminare questo file' },
        { status: 403 }
      );
    }

    // Delete from R2
    try {
      await deleteFile(r2Key);
    } catch (err) {
      console.error('Error deleting from R2:', err);
    }

    // Delete from Firestore
    await db.collection('files').doc(fileId).delete();

    // Update user storage (don't go negative)
    if (fileData.userId && fileData.size) {
      const userRef = db.collection('users').doc(fileData.userId);
      const userDoc = await userRef.get();
      const userData = userDoc.data() || {};

      const currentStorage = userData.storageUsed || 0;
      const currentFilesCount = userData.filesCount || 0;

      const currentMonthlyTransfers = userData.monthlyTransfers || 0;

      await userRef.update({
        storageUsed: Math.max(0, currentStorage - fileData.size),
        filesCount: Math.max(0, currentFilesCount - 1),
        monthlyTransfers: Math.max(0, currentMonthlyTransfers - 1),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
