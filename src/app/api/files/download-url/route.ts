import { NextRequest, NextResponse } from 'next/server';
import { getDownloadUrl } from '@/lib/r2';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json(
        { error: 'Missing fileId' },
        { status: 400 }
      );
    }

    // Get file metadata from Firestore
    const fileDoc = await getDoc(doc(db, 'files', fileId));

    if (!fileDoc.exists()) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const fileData = fileDoc.data();

    // Check if file is expired
    if (fileData.expiresAt && fileData.expiresAt.toDate() < new Date()) {
      return NextResponse.json(
        { error: 'File has expired' },
        { status: 410 }
      );
    }

    // Check max downloads
    if (fileData.maxDownloads && fileData.downloadCount >= fileData.maxDownloads) {
      return NextResponse.json(
        { error: 'Download limit reached' },
        { status: 429 }
      );
    }

    // Get presigned download URL from R2
    const downloadUrl = await getDownloadUrl(fileData.r2Key);

    // Increment download count
    await updateDoc(doc(db, 'files', fileId), {
      downloadCount: increment(1),
    });

    return NextResponse.json({
      downloadUrl,
      fileName: fileData.originalName,
    });
  } catch (error) {
    console.error('Error generating download URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    );
  }
}
