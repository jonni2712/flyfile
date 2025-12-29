import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileId, transferId } = body;

    // Support both fileId (for files collection) and transferId (for transfers collection)
    if (!fileId && !transferId) {
      return NextResponse.json(
        { error: 'Missing fileId or transferId' },
        { status: 400 }
      );
    }

    if (fileId) {
      // Update file status in files collection
      await updateDoc(doc(db, 'files', fileId), {
        status: 'completed',
        updatedAt: serverTimestamp(),
      });
    }

    if (transferId) {
      // Update transfer status
      await updateDoc(doc(db, 'transfers', transferId), {
        status: 'active',
        updatedAt: serverTimestamp(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error confirming upload:', error);
    return NextResponse.json(
      { error: 'Failed to confirm upload' },
      { status: 500 }
    );
  }
}
