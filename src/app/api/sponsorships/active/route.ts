import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getPreviewUrl } from '@/lib/r2';

// GET - Get a random active sponsor video (public, no auth required)
export async function GET(request: NextRequest) {
  try {
    const db = getAdminFirestore();

    // Query all active sponsorships
    const snapshot = await db
      .collection('sponsorships')
      .where('status', '==', 'active')
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ success: true, sponsor: null });
    }

    // Collect all sponsorships with ready videos
    const candidates: Array<{
      docId: string;
      companyName: string;
      video: { id: string; r2Key: string; linkUrl: string };
    }> = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const readyVideos = (data.videos || []).filter(
        (v: Record<string, unknown>) => v.status === 'ready'
      );
      for (const video of readyVideos) {
        candidates.push({
          docId: doc.id,
          companyName: data.companyName,
          video: { id: video.id, r2Key: video.r2Key, linkUrl: video.linkUrl },
        });
      }
    }

    if (candidates.length === 0) {
      return NextResponse.json({ success: true, sponsor: null });
    }

    // Pick a random candidate
    const selected = candidates[Math.floor(Math.random() * candidates.length)];

    // Generate a fresh presigned URL for the video
    const videoUrl = await getPreviewUrl(selected.video.r2Key, 3600, 'video/mp4');

    // Increment impression count (fire-and-forget)
    db.collection('sponsorships')
      .doc(selected.docId)
      .update({ impressionCount: FieldValue.increment(1) })
      .catch((e: unknown) => console.error('Impression increment error:', e));

    return NextResponse.json({
      success: true,
      sponsor: {
        videoUrl,
        linkUrl: selected.video.linkUrl,
        companyName: selected.companyName,
        sponsorshipId: selected.docId,
        videoId: selected.video.id,
      },
    });
  } catch (error) {
    console.error('GET /api/sponsorships/active error:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
