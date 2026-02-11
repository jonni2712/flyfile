import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { requireAuth } from '@/lib/auth-utils';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    // SECURITY FIX: Add rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // SECURITY FIX: Require authentication
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json(
        { error: 'Missing fileId' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();

    // Get file metadata from Firestore
    const fileDoc = await db.collection('files').doc(fileId).get();

    if (!fileDoc.exists) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const fileData = fileDoc.data() || {};

    // SECURITY FIX: Verify the authenticated user owns this file
    if (fileData.userId !== authResult.userId) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      );
    }

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
