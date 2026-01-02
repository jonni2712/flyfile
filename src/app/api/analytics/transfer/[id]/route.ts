import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getTransferAnalytics } from '@/lib/analytics';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    const { id: transferId } = await params;

    if (!transferId) {
      return NextResponse.json(
        { error: 'Transfer ID richiesto' },
        { status: 400 }
      );
    }

    // Get userId from query params (for authorization)
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId richiesto' },
        { status: 400 }
      );
    }

    // Verify transfer exists and belongs to user
    const transferRef = doc(db, 'transfers', transferId);
    const transferSnap = await getDoc(transferRef);

    if (!transferSnap.exists()) {
      return NextResponse.json(
        { error: 'Transfer non trovato' },
        { status: 404 }
      );
    }

    const transferData = transferSnap.data();

    // Verify ownership
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
