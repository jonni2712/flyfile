import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { requireAuth } from '@/lib/auth-utils';
import { checkRateLimit } from '@/lib/rate-limit';
import { deleteFile } from '@/lib/r2';

// GET - Fetch user's sponsorship
export async function GET(request: NextRequest) {
  try {
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const db = getAdminFirestore();
    const snapshot = await db
      .collection('sponsorships')
      .where('userId', '==', authResult.userId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ success: true, sponsorship: null });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    return NextResponse.json({
      success: true,
      sponsorship: {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        reviewedAt: data.reviewedAt?.toDate?.()?.toISOString() || null,
        videos: (data.videos || []).map((v: Record<string, unknown>) => ({
          ...v,
          uploadedAt: (v.uploadedAt as { toDate?: () => Date })?.toDate?.()?.toISOString() || null,
        })),
      },
    });
  } catch (error) {
    console.error('GET /api/sponsorships error:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

// POST - Create or update sponsorship
export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const body = await request.json();
    const { companyName, videos } = body;

    if (!companyName || typeof companyName !== 'string' || companyName.trim().length === 0) {
      return NextResponse.json({ error: 'Nome azienda obbligatorio' }, { status: 400 });
    }

    // Validate videos array if provided
    if (videos && Array.isArray(videos)) {
      if (videos.length > 3) {
        return NextResponse.json({ error: 'Massimo 3 video consentiti' }, { status: 400 });
      }
      for (const video of videos) {
        if (video.linkUrl && typeof video.linkUrl === 'string' && video.linkUrl.trim().length > 0) {
          try {
            const url = new URL(video.linkUrl);
            if (!['http:', 'https:'].includes(url.protocol)) {
              return NextResponse.json({ error: 'URL non valido. Usa https://' }, { status: 400 });
            }
          } catch {
            return NextResponse.json({ error: 'URL non valido' }, { status: 400 });
          }
        }
      }
    }

    const db = getAdminFirestore();
    const snapshot = await db
      .collection('sponsorships')
      .where('userId', '==', authResult.userId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      // Create new sponsorship
      const docRef = await db.collection('sponsorships').add({
        userId: authResult.userId,
        userEmail: authResult.email || '',
        companyName: companyName.trim(),
        status: 'pending',
        videos: videos || [],
        impressionCount: 0,
        clickCount: 0,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ success: true, sponsorshipId: docRef.id });
    } else {
      // Update existing - reset status to pending for review
      const docId = snapshot.docs[0].id;
      const updateData: Record<string, unknown> = {
        companyName: companyName.trim(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      // If videos are provided, update them and reset status
      if (videos !== undefined) {
        updateData.videos = videos;
        updateData.status = 'pending';
      }

      await db.collection('sponsorships').doc(docId).update(updateData);

      return NextResponse.json({ success: true, sponsorshipId: docId });
    }
  } catch (error) {
    console.error('POST /api/sponsorships error:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

// DELETE - Delete user's sponsorship
export async function DELETE(request: NextRequest) {
  try {
    const rateLimitResponse = await checkRateLimit(request, 'sensitive');
    if (rateLimitResponse) return rateLimitResponse;

    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const db = getAdminFirestore();
    const snapshot = await db
      .collection('sponsorships')
      .where('userId', '==', authResult.userId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Sponsorizzazione non trovata' }, { status: 404 });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    // Delete videos from R2
    const videos = data.videos || [];
    for (const video of videos) {
      if (video.r2Key) {
        try {
          await deleteFile(video.r2Key);
        } catch (e) {
          console.error('Error deleting video from R2:', e);
        }
      }
    }

    await db.collection('sponsorships').doc(doc.id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/sponsorships error:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
