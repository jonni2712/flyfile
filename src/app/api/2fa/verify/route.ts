import { NextRequest, NextResponse } from 'next/server';
import { verify2FA } from '@/lib/two-factor';
import { checkRateLimit } from '@/lib/rate-limit';

// POST - Verify 2FA token
export async function POST(request: NextRequest) {
  try {
    // Stricter rate limiting for 2FA verification
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { userId, token } = body;

    if (!userId || !token) {
      return NextResponse.json(
        { error: 'userId e token richiesti' },
        { status: 400 }
      );
    }

    // Clean token (remove spaces and dashes)
    const cleanToken = token.replace(/[\s-]/g, '');

    const result = await verify2FA(userId, cleanToken);

    if (!result.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Codice non valido. Riprova.',
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      usedBackupCode: result.usedBackupCode || false,
      message: result.usedBackupCode
        ? 'Verificato con codice di backup. Ti rimangono meno codici di backup.'
        : 'Verificato con successo',
    });
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    return NextResponse.json(
      { error: 'Errore nella verifica 2FA' },
      { status: 500 }
    );
  }
}
