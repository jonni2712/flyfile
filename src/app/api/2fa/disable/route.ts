import { NextRequest, NextResponse } from 'next/server';
import { disable2FA } from '@/lib/two-factor';
import { checkRateLimit } from '@/lib/rate-limit';

// POST - Disable 2FA
export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await checkRateLimit(request, 'sensitive');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId richiesto' },
        { status: 400 }
      );
    }

    const disabled = await disable2FA(userId);

    if (!disabled) {
      return NextResponse.json(
        { error: 'Errore nella disabilitazione 2FA' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '2FA disabilitata con successo',
    });
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return NextResponse.json(
      { error: 'Errore nella disabilitazione 2FA' },
      { status: 500 }
    );
  }
}
