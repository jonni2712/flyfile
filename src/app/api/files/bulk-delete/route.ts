import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { deleteFile } from '@/lib/r2';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    const { userId, fileIds } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId richiesto' },
        { status: 400 }
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

    const results = {
      deleted: [] as string[],
      failed: [] as { id: string; error: string }[],
    };

    // Process each file
    for (const fileId of fileIds) {
      try {
        const fileRef = doc(db, 'files', fileId);
        const fileSnap = await getDoc(fileRef);

        if (!fileSnap.exists()) {
          results.failed.push({ id: fileId, error: 'Non trovato' });
          continue;
        }

        const fileData = fileSnap.data();

        // Verify ownership
        if (fileData.userId !== userId) {
          results.failed.push({ id: fileId, error: 'Non autorizzato' });
          continue;
        }

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
        await deleteDoc(fileRef);
        results.deleted.push(fileId);

      } catch (err) {
        console.error(`Error deleting file ${fileId}:`, err);
        results.failed.push({ id: fileId, error: 'Errore interno' });
      }
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
