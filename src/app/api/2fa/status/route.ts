import { NextRequest, NextResponse } from 'next/server';
import { get2FAStatus, disable2FA, regenerateBackupCodes, verify2FA } from '@/lib/two-factor';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireAuth, isAuthorizedForUser } from '@/lib/auth-utils';

// GET - Get 2FA status
export async function GET(request: NextRequest) {
  try {
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // Verify authentication
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId richiesto' },
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

    const status = await get2FAStatus(userId);

    return NextResponse.json({
      success: true,
      status,
    });
  } catch (error) {
    console.error('Error getting 2FA status:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero stato 2FA' },
      { status: 500 }
    );
  }
}

// DELETE - Disable 2FA
export async function DELETE(request: NextRequest) {
  try {
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // Verify authentication
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const token = searchParams.get('token');

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

    // Verify token first
    const verifyResult = await verify2FA(userId, token);
    if (!verifyResult.valid) {
      return NextResponse.json(
        { error: 'Codice non valido' },
        { status: 401 }
      );
    }

    // Disable 2FA
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

// POST - Regenerate backup codes
export async function POST(request: NextRequest) {
  try {
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

    // Verify token first
    const verifyResult = await verify2FA(userId, token);
    if (!verifyResult.valid) {
      return NextResponse.json(
        { error: 'Codice non valido' },
        { status: 401 }
      );
    }

    // Regenerate backup codes
    const newCodes = await regenerateBackupCodes(userId);

    if (!newCodes) {
      return NextResponse.json(
        { error: 'Errore nella rigenerazione codici' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      backupCodes: newCodes,
      message: 'Nuovi codici di backup generati',
    });
  } catch (error) {
    console.error('Error regenerating backup codes:', error);
    return NextResponse.json(
      { error: 'Errore nella rigenerazione codici' },
      { status: 500 }
    );
  }
}
