import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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

    const results = {
      deleted: [] as string[],
      failed: [] as { id: string; error: string }[],
    };

    // Process each transfer
    for (const transferId of transferIds) {
      try {
        const transferRef = doc(db, 'transfers', transferId);
        const transferSnap = await getDoc(transferRef);

        if (!transferSnap.exists()) {
          results.failed.push({ id: transferId, error: 'Non trovato' });
          continue;
        }

        const transferData = transferSnap.data();

        // Verify ownership
        if (transferData.userId !== userId) {
          results.failed.push({ id: transferId, error: 'Non autorizzato' });
          continue;
        }

        // Delete files from R2
        const filesRef = collection(db, 'transfers', transferId, 'files');
        const filesSnapshot = await getDocs(filesRef);

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
          await deleteDoc(doc(db, 'transfers', transferId, 'files', fileDoc.id));
        }

        // Delete transfer document
        await deleteDoc(transferRef);
        results.deleted.push(transferId);

      } catch (err) {
        console.error(`Error deleting transfer ${transferId}:`, err);
        results.failed.push({ id: transferId, error: 'Errore interno' });
      }
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
