import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { deleteFile } from '@/lib/r2';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    const { userId, transferIds } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId richiesto' },
        { status: 400 }
      );
    }

    if (!transferIds || !Array.isArray(transferIds) || transferIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'transferIds richiesti (array)' },
        { status: 400 }
      );
    }

    // Limit bulk delete to 50 items at once
    if (transferIds.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Massimo 50 trasferimenti per operazione' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();
    const results = {
      deleted: [] as string[],
      failed: [] as { id: string; error: string }[],
    };

    let totalSizeDeleted = 0;

    // Process each transfer
    for (const transferId of transferIds) {
      try {
        const transferRef = db.collection('transfers').doc(transferId);
        const transferSnap = await transferRef.get();

        if (!transferSnap.exists) {
          results.failed.push({ id: transferId, error: 'Non trovato' });
          continue;
        }

        const transferData = transferSnap.data() || {};

        // Verify ownership
        if (transferData.userId !== userId) {
          results.failed.push({ id: transferId, error: 'Non autorizzato' });
          continue;
        }

        // Track size for storage update
        totalSizeDeleted += transferData.totalSize || 0;

        // Delete files from R2
        const filesSnapshot = await db.collection('transfers').doc(transferId).collection('files').get();

        for (const fileDoc of filesSnapshot.docs) {
          const fileData = fileDoc.data();
          try {
            if (fileData.path) {
              await deleteFile(fileData.path);
            }
          } catch (err) {
            console.error(`Error deleting file from R2:`, err);
          }
          // Delete file document
          await db.collection('transfers').doc(transferId).collection('files').doc(fileDoc.id).delete();
        }

        // Delete transfer document
        await transferRef.delete();
        results.deleted.push(transferId);

      } catch (err) {
        console.error(`Error deleting transfer ${transferId}:`, err);
        results.failed.push({ id: transferId, error: 'Errore interno' });
      }
    }

    // Update user's storage usage
    if (totalSizeDeleted > 0 && userId) {
      const userRef = db.collection('users').doc(userId);
      await userRef.update({
        storageUsed: FieldValue.increment(-totalSizeDeleted),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({
      success: true,
      message: `${results.deleted.length} trasferimenti eliminati`,
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
