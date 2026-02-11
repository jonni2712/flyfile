import { NextRequest, NextResponse } from 'next/server';
import { disable2FA, verify2FA } from '@/lib/two-factor';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireAuth, isAuthorizedForUser } from '@/lib/auth-utils';

// POST - Disable 2FA
export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await checkRateLimit(request, 'sensitive');
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

    // SECURITY: Verify TOTP token before allowing 2FA disable
    const verifyResult = await verify2FA(userId, token);
    if (!verifyResult.valid) {
      return NextResponse.json(
        { error: 'Codice non valido. Inserisci il codice TOTP per disabilitare la 2FA.' },
        { status: 401 }
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
