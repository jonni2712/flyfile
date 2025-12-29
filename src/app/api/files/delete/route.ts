import { NextRequest, NextResponse } from 'next/server';
import { deleteFile } from '@/lib/r2';
import { doc, deleteDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function DELETE(request: NextRequest) {
  try {
    const { fileId, r2Key } = await request.json();

    if (!fileId || !r2Key) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get file data to update user storage
    const fileDoc = await getDoc(doc(db, 'files', fileId));

    if (fileDoc.exists()) {
      const fileData = fileDoc.data();

      // Delete from R2
      await deleteFile(r2Key);

      // Delete from Firestore
      await deleteDoc(doc(db, 'files', fileId));

      // Update user storage
      if (fileData.userId) {
        await updateDoc(doc(db, 'users', fileData.userId), {
          storageUsed: increment(-fileData.size),
          filesCount: increment(-1),
        });
      }
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
