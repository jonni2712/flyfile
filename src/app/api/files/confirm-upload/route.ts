import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, getDoc, setDoc, serverTimestamp, increment } from 'firebase/firestore';
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
      // Get file data to update user's storage
      const fileRef = doc(db, 'files', fileId);
      const fileSnap = await getDoc(fileRef);

      if (!fileSnap.exists()) {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        );
      }

      const fileData = fileSnap.data();
      const fileSize = fileData.size || 0;
      const userId = fileData.userId;

      // Update file status in files collection
      await updateDoc(fileRef, {
        status: 'completed',
        updatedAt: serverTimestamp(),
      });

      // Update user's storage and transfer count
      if (userId && !userId.startsWith('anon_')) {
        // Registered user
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          storageUsed: increment(fileSize),
          monthlyTransfers: increment(1),
          filesCount: increment(1),
          updatedAt: serverTimestamp(),
        });
      } else if (userId && userId.startsWith('anon_')) {
        // Anonymous user
        const anonUserRef = doc(db, 'anonymousUsers', userId);
        const anonUserSnap = await getDoc(anonUserRef);

        if (anonUserSnap.exists()) {
          await updateDoc(anonUserRef, {
            transferCount: increment(1),
            storageUsed: increment(fileSize),
          });
        }
      }
    }

    if (transferId) {
      // Get transfer data to update user's storage
      const transferRef = doc(db, 'transfers', transferId);
      const transferSnap = await getDoc(transferRef);

      if (transferSnap.exists()) {
        const transferData = transferSnap.data();
        const userId = transferData.userId;
        const totalSize = transferData.totalSize || 0;

        // Update transfer status
        await updateDoc(transferRef, {
          status: 'active',
          updatedAt: serverTimestamp(),
        });

        // Update user's storage and transfer count
        if (userId && !userId.startsWith('anon_')) {
          const userRef = doc(db, 'users', userId);
          await updateDoc(userRef, {
            storageUsed: increment(totalSize),
            monthlyTransfers: increment(1),
            updatedAt: serverTimestamp(),
          });
        }
      } else {
        // Update transfer status even if not found in transfers collection
        await updateDoc(transferRef, {
          status: 'active',
          updatedAt: serverTimestamp(),
        });
      }
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
