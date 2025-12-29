import { NextRequest, NextResponse } from 'next/server';
import { getUploadUrl, generateFileKey } from '@/lib/r2';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { fileName, contentType, fileSize, userId, isAnonymous, senderEmail } = await request.json();

    if (!fileName || !contentType || !fileSize || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // If anonymous user, store their info
    if (isAnonymous && senderEmail) {
      const anonUserRef = doc(db, 'anonymousUsers', userId);
      const anonUserSnap = await getDoc(anonUserRef);

      if (!anonUserSnap.exists()) {
        await setDoc(anonUserRef, {
          id: userId,
          email: senderEmail,
          transferCount: 1,
          createdAt: serverTimestamp(),
        });
      } else {
        // Increment transfer count
        const currentCount = anonUserSnap.data().transferCount || 0;
        await setDoc(anonUserRef, {
          transferCount: currentCount + 1,
        }, { merge: true });
      }
    }

    // Generate unique file ID and R2 key
    const fileId = uuidv4();
    const r2Key = generateFileKey(userId, fileName);

    // Get presigned upload URL from R2
    const uploadUrl = await getUploadUrl(r2Key, contentType);

    // Create file metadata in Firestore (pending status)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const shareLink = `${baseUrl}/s/${fileId}`;

    await setDoc(doc(db, 'files', fileId), {
      userId,
      fileName: r2Key.split('/').pop(),
      originalName: fileName,
      mimeType: contentType,
      size: fileSize,
      r2Key,
      shareLink,
      isPublic: true,
      downloadCount: 0,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      uploadUrl,
      fileId,
      shareLink,
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
