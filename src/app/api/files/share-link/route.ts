import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
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

    return NextResponse.json({
      shareLink: fileData.shareLink,
    });
  } catch (error) {
    console.error('Error getting share link:', error);
    return NextResponse.json(
      { error: 'Failed to get share link' },
      { status: 500 }
    );
  }
}
