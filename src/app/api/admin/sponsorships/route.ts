import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { checkAdminAccess, getVerifiedAdminUserId } from '@/lib/admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { deleteFile } from '@/lib/r2';

// GET - List all sponsorships (with optional status filter)
export async function GET(request: NextRequest) {
  try {
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    const adminError = await checkAdminAccess(request);
    if (adminError) return adminError;

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    const db = getAdminFirestore();
    let query = db.collection('sponsorships').orderBy('createdAt', 'desc');

    if (statusFilter && ['pending', 'active', 'rejected', 'deactivated'].includes(statusFilter)) {
      query = query.where('status', '==', statusFilter);
    }

    const snapshot = await query.get();

    const sponsorships = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        reviewedAt: data.reviewedAt?.toDate?.()?.toISOString() || null,
        videos: (data.videos || []).map((v: Record<string, unknown>) => ({
          ...v,
          uploadedAt: (v.uploadedAt as { toDate?: () => Date })?.toDate?.()?.toISOString() || null,
        })),
      };
    });

    return NextResponse.json({ success: true, sponsorships });
  } catch (error) {
    console.error('GET /api/admin/sponsorships error:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

// PATCH - Approve, reject, or deactivate a sponsorship
export async function PATCH(request: NextRequest) {
  try {
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    const adminError = await checkAdminAccess(request);
    if (adminError) return adminError;

    const adminUserId = getVerifiedAdminUserId(request);

    const body = await request.json();
    const { sponsorshipId, action } = body;

    if (!sponsorshipId || typeof sponsorshipId !== 'string') {
      return NextResponse.json({ error: 'sponsorshipId obbligatorio' }, { status: 400 });
    }

    if (!['approve', 'reject', 'deactivate'].includes(action)) {
      return NextResponse.json(
        { error: 'Azione non valida. Usa: approve, reject, deactivate' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();
    const docRef = db.collection('sponsorships').doc(sponsorshipId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Sponsorizzazione non trovata' }, { status: 404 });
    }

    const data = docSnap.data()!;

    const statusMap: Record<string, string> = {
      approve: 'active',
      reject: 'rejected',
      deactivate: 'deactivated',
    };

    const updateData: Record<string, unknown> = {
      status: statusMap[action],
      reviewedAt: FieldValue.serverTimestamp(),
      reviewedBy: adminUserId,
      updatedAt: FieldValue.serverTimestamp(),
    };

    // When approving, mark all processing videos as ready
    if (action === 'approve') {
      const updatedVideos = (data.videos || []).map((v: Record<string, unknown>) => ({
        ...v,
        status: v.status === 'processing' ? 'ready' : v.status,
      }));
      updateData.videos = updatedVideos;
    }

    // When rejecting, mark all videos as rejected
    if (action === 'reject') {
      const updatedVideos = (data.videos || []).map((v: Record<string, unknown>) => ({
        ...v,
        status: 'rejected',
      }));
      updateData.videos = updatedVideos;
    }

    await docRef.update(updateData);

    return NextResponse.json({ success: true, newStatus: statusMap[action] });
  } catch (error) {
    console.error('PATCH /api/admin/sponsorships error:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

// DELETE - Delete a sponsorship and its videos from R2
export async function DELETE(request: NextRequest) {
  try {
    const rateLimitResponse = await checkRateLimit(request, 'sensitive');
    if (rateLimitResponse) return rateLimitResponse;

    const adminError = await checkAdminAccess(request);
    if (adminError) return adminError;

    const { searchParams } = new URL(request.url);
    const sponsorshipId = searchParams.get('sponsorshipId');

    if (!sponsorshipId) {
      return NextResponse.json({ error: 'sponsorshipId obbligatorio' }, { status: 400 });
    }

    const db = getAdminFirestore();
    const docRef = db.collection('sponsorships').doc(sponsorshipId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Sponsorizzazione non trovata' }, { status: 404 });
    }

    const data = docSnap.data()!;

    // Delete videos from R2
    for (const video of data.videos || []) {
      if (video.r2Key) {
        try {
          await deleteFile(video.r2Key);
        } catch (e) {
          console.error('Error deleting video from R2:', e);
        }
      }
    }

    await docRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/sponsorships error:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
