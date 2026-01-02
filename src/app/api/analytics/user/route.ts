import { NextRequest, NextResponse } from 'next/server';
import { getUserAnalytics } from '@/lib/analytics';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // Get userId from query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId richiesto' },
        { status: 400 }
      );
    }

    // Get user analytics
    const analytics = await getUserAnalytics(userId);

    return NextResponse.json({
      success: true,
      userId,
      analytics,
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle analytics' },
      { status: 500 }
    );
  }
}
