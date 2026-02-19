import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { checkRateLimit } from '@/lib/rate-limit';

// POST - Track a click on a sponsor video
export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { sponsorshipId } = body;

    if (!sponsorshipId || typeof sponsorshipId !== 'string') {
      return NextResponse.json({ error: 'sponsorshipId obbligatorio' }, { status: 400 });
    }

    const db = getAdminFirestore();
    const docRef = db.collection('sponsorships').doc(sponsorshipId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Sponsorizzazione non trovata' }, { status: 404 });
    }

    await docRef.update({
      clickCount: FieldValue.increment(1),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/sponsorships/click error:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
