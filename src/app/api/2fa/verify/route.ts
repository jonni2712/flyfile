import { NextRequest, NextResponse } from 'next/server';
import { verify2FA } from '@/lib/two-factor';
import { checkRateLimit, check2FARateLimit } from '@/lib/rate-limit';
import { requireAuth, isAuthorizedForUser } from '@/lib/auth-utils';

// POST - Verify 2FA token
export async function POST(request: NextRequest) {
  try {
    // Basic rate limit
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // Verify authentication
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const body = await request.json();
    const { userId, token } = body;

    if (!userId || !token) {
      return NextResponse.json(
        { error: 'userId e token richiesti' },
        { status: 400 }
      );
    }

    // Verify authorized
    if (!isAuthorizedForUser(authResult, userId)) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    // SECURITY: Stricter rate limiting for 2FA verification to prevent brute force
    const twoFaRateLimitResponse = await check2FARateLimit(request, userId);
    if (twoFaRateLimitResponse) return twoFaRateLimitResponse;

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
