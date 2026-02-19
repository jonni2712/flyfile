import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { requireAuth } from '@/lib/auth-utils';
import { checkRateLimit } from '@/lib/rate-limit';
import { getUploadUrl, getPreviewUrl, deleteFile } from '@/lib/r2';
import { randomUUID } from 'crypto';

const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

// POST - Generate presigned URL for video upload
export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const body = await request.json();
    const { contentType, fileSize } = body;

    // Validate content type
    if (contentType !== 'video/mp4') {
      return NextResponse.json(
        { error: 'Solo video MP4 sono consentiti' },
        { status: 400 }
      );
    }

    // Validate file size
    if (fileSize && fileSize > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { error: 'Il video non può superare i 50MB' },
        { status: 400 }
      );
    }

    // Check current video count
    const db = getAdminFirestore();
    const snapshot = await db
      .collection('sponsorships')
      .where('userId', '==', authResult.userId)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      const currentVideos = data.videos || [];
      if (currentVideos.length >= 3) {
        return NextResponse.json(
          { error: 'Massimo 3 video consentiti' },
          { status: 400 }
        );
      }
    }

    // Generate unique video ID and R2 key
    const videoId = randomUUID();
    const timestamp = Date.now();
    const r2Key = `sponsorships/${authResult.userId}/${videoId}-${timestamp}.mp4`;

    // Generate presigned upload URL
    const uploadUrl = await getUploadUrl(r2Key, contentType, fileSize);

    return NextResponse.json({
      success: true,
      uploadUrl,
      videoId,
      r2Key,
    });
  } catch (error) {
    console.error('POST /api/sponsorships/upload error:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

// PUT - Confirm upload completed, update Firestore
export async function PUT(request: NextRequest) {
  try {
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const body = await request.json();
    const { videoId, r2Key, linkUrl } = body;

    if (!videoId || !r2Key) {
      return NextResponse.json(
        { error: 'videoId e r2Key sono obbligatori' },
        { status: 400 }
      );
    }

    // Validate linkUrl if provided
    if (linkUrl && typeof linkUrl === 'string' && linkUrl.trim().length > 0) {
      try {
        const url = new URL(linkUrl);
        if (!['http:', 'https:'].includes(url.protocol)) {
          return NextResponse.json({ error: 'URL non valido. Usa https://' }, { status: 400 });
        }
      } catch {
        return NextResponse.json({ error: 'URL non valido' }, { status: 400 });
      }
    }

    // Generate preview URL for the video
    const videoUrl = await getPreviewUrl(r2Key, 86400, 'video/mp4');

    const db = getAdminFirestore();
    const snapshot = await db
      .collection('sponsorships')
      .where('userId', '==', authResult.userId)
      .limit(1)
      .get();

    const newVideo = {
      id: videoId,
      r2Key,
      videoUrl,
      linkUrl: linkUrl || '',
      status: 'processing',
      uploadedAt: FieldValue.serverTimestamp(),
    };

    if (snapshot.empty) {
      // Create sponsorship with this video
      await db.collection('sponsorships').add({
        userId: authResult.userId,
        userEmail: authResult.email || '',
        companyName: '',
        status: 'pending',
        videos: [newVideo],
        impressionCount: 0,
        clickCount: 0,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else {
      const docId = snapshot.docs[0].id;
      const data = snapshot.docs[0].data();
      const currentVideos = data.videos || [];

      if (currentVideos.length >= 3) {
        // Delete the uploaded file since we can't add it
        await deleteFile(r2Key);
        return NextResponse.json(
          { error: 'Massimo 3 video consentiti' },
          { status: 400 }
        );
      }

      await db.collection('sponsorships').doc(docId).update({
        videos: FieldValue.arrayUnion(newVideo),
        status: 'pending',
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({
      success: true,
      video: { id: videoId, r2Key, videoUrl, linkUrl: linkUrl || '' },
    });
  } catch (error) {
    console.error('PUT /api/sponsorships/upload error:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
