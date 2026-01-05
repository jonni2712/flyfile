import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { deleteFile } from '@/lib/r2';

/**
 * Cron job to cleanup expired transfers
 * - Deletes files from R2 storage
 * - Removes transfer documents from Firestore
 * - Decrements user storage usage
 *
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup",
 *     "schedule": "0 3 * * *"  // Daily at 3 AM UTC
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Security: Verify cron secret (Vercel sends this header)
    // This check will fail if CRON_SECRET is not set, preventing unauthorized access
    if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = getAdminFirestore();
    const now = Timestamp.now();

    // Find all expired transfers
    const expiredTransfersSnapshot = await db
      .collection('transfers')
      .where('expiresAt', '<', now)
      .limit(100) // Process in batches to avoid timeout
      .get();

    if (expiredTransfersSnapshot.empty) {
      return NextResponse.json({
        success: true,
        message: 'No expired transfers found',
        deletedCount: 0,
      });
    }

    let deletedCount = 0;
    let totalSizeFreed = 0;
    const errors: string[] = [];

    // Process each expired transfer
    for (const transferDoc of expiredTransfersSnapshot.docs) {
      try {
        const transferData = transferDoc.data();
        const transferId = transferDoc.id;
        const userId = transferData.userId;
        const transferSize = transferData.totalSize || 0;

        // Get all files for this transfer
        const filesSnapshot = await db
          .collection('transfers')
          .doc(transferId)
          .collection('files')
          .get();

        // Delete files from R2
        for (const fileDoc of filesSnapshot.docs) {
          const fileData = fileDoc.data();
          try {
            await deleteFile(fileData.path || fileData.storedName);
          } catch (r2Error) {
            console.error(`Error deleting file from R2: ${fileData.path}`, r2Error);
            // Continue with other files even if one fails
          }
          // Delete file document
          await fileDoc.ref.delete();
        }

        // Delete transfer document
        await transferDoc.ref.delete();

        // Decrement user's storage usage
        if (userId && transferSize > 0) {
          try {
            const userRef = db.collection('users').doc(userId);
            const userDoc = await userRef.get();

            if (userDoc.exists) {
              const currentStorage = userDoc.data()?.storageUsed || 0;
              const newStorage = Math.max(0, currentStorage - transferSize);

              await userRef.update({
                storageUsed: newStorage,
                updatedAt: FieldValue.serverTimestamp(),
              });
            }
          } catch (userError) {
            console.error(`Error updating user storage for ${userId}:`, userError);
          }
        }

        deletedCount++;
        totalSizeFreed += transferSize;
      } catch (transferError) {
        const errorMessage = transferError instanceof Error ? transferError.message : 'Unknown error';
        errors.push(`Transfer ${transferDoc.id}: ${errorMessage}`);
        console.error(`Error processing transfer ${transferDoc.id}:`, transferError);
      }
    }

    const totalSizeFreedMB = (totalSizeFreed / (1024 * 1024)).toFixed(2);

    console.log(`Cleanup completed: ${deletedCount} transfers deleted, ${totalSizeFreedMB} MB freed`);

    return NextResponse.json({
      success: true,
      message: `Cleanup completed`,
      deletedCount,
      totalSizeFreedMB,
      remainingExpired: expiredTransfersSnapshot.size > 100 ? 'More expired transfers pending' : 'All processed',
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Cron cleanup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Cleanup failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
