import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { getTransferAnalytics } from '@/lib/analytics';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // SECURITY: Require authentication
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const userId = authResult.userId!;

    const { id: transferId } = await params;

    if (!transferId) {
      return NextResponse.json(
        { error: 'Transfer ID richiesto' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();

    // Verify transfer exists and belongs to user
    const transferSnap = await db.collection('transfers').doc(transferId).get();

    if (!transferSnap.exists) {
      return NextResponse.json(
        { error: 'Transfer non trovato' },
        { status: 404 }
      );
    }

    const transferData = transferSnap.data() || {};

    // SECURITY: Verify ownership using authenticated userId
    if (transferData.userId !== userId) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    // Get analytics
    const analytics = await getTransferAnalytics(transferId);

    return NextResponse.json({
      success: true,
      transferId,
      title: transferData.title || 'Senza titolo',
      analytics,
    });
  } catch (error) {
    console.error('Error fetching transfer analytics:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle analytics' },
      { status: 500 }
    );
  }
}
