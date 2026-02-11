import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { deleteFile } from '@/lib/r2';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireAuth, isAuthorizedForUser } from '@/lib/auth-utils';
import { csrfProtection } from '@/lib/csrf';

export async function POST(request: NextRequest) {
  try {
    // SECURITY FIX: CSRF Protection
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // CRITICAL: Verify authentication
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const { userId, fileIds } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId richiesto' },
        { status: 400 }
      );
    }

    // CRITICAL: Verify the authenticated user matches the requested userId
    if (!isAuthorizedForUser(authResult, userId)) {
      return NextResponse.json(
        { success: false, error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'fileIds richiesti (array)' },
        { status: 400 }
      );
    }

    // Limit bulk delete to 50 items at once
    if (fileIds.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Massimo 50 file per operazione' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();
    const results = {
      deleted: [] as string[],
      failed: [] as { id: string; error: string }[],
    };

    let totalSizeDeleted = 0;
    let totalFilesDeleted = 0;

    // Process each file
    for (const fileId of fileIds) {
      try {
        const fileRef = db.collection('files').doc(fileId);
        const fileSnap = await fileRef.get();

        if (!fileSnap.exists) {
          results.failed.push({ id: fileId, error: 'Non trovato' });
          continue;
        }

        const fileData = fileSnap.data() || {};

        // Double-check ownership
        if (fileData.userId !== userId) {
          results.failed.push({ id: fileId, error: 'Non autorizzato' });
          continue;
        }

        // Track size for storage update
        totalSizeDeleted += fileData.size || 0;
        totalFilesDeleted++;

        // Delete file from R2
        try {
          if (fileData.r2Key) {
            await deleteFile(fileData.r2Key);
          }
        } catch (err) {
          console.error(`Error deleting file from R2:`, err);
          // Continue with Firestore deletion even if R2 fails
        }

        // Delete file document from Firestore
        await fileRef.delete();
        results.deleted.push(fileId);

      } catch (err) {
        console.error(`Error deleting file ${fileId}:`, err);
        results.failed.push({ id: fileId, error: 'Errore interno' });
      }
    }

    // Update user's storage usage (don't go negative)
    if (totalSizeDeleted > 0 && userId) {
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();
      const userData = userDoc.data() || {};

      const currentStorage = userData.storageUsed || 0;
      const currentFilesCount = userData.filesCount || 0;

      const currentMonthlyTransfers = userData.monthlyTransfers || 0;

      await userRef.update({
        storageUsed: Math.max(0, currentStorage - totalSizeDeleted),
        filesCount: Math.max(0, currentFilesCount - totalFilesDeleted),
        monthlyTransfers: Math.max(0, currentMonthlyTransfers - totalFilesDeleted),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({
      success: true,
      message: `${results.deleted.length} file eliminati`,
      results,
    });
  } catch (error) {
    console.error('Error in bulk delete:', error);
    return NextResponse.json(
      { success: false, error: 'Errore nell\'eliminazione' },
      { status: 500 }
    );
  }
}
