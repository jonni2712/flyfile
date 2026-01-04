import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { generateTotpSecret, generateTotpUri, generateBackupCodes, enable2FA, verifyTotp } from '@/lib/two-factor';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireAuth, isAuthorizedForUser } from '@/lib/auth-utils';
import { csrfProtection } from '@/lib/csrf';

// GET - Generate 2FA setup data
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

    // Get user data using Admin SDK
    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    const userData = userSnap.data() || {};

    // Check if 2FA is already enabled
    if (userData.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA già abilitata' },
        { status: 400 }
      );
    }

    // Generate new secret
    const secret = generateTotpSecret();
    const totpUri = generateTotpUri(secret, userData.email || userId);

    return NextResponse.json({
      success: true,
      secret,
      totpUri,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpUri)}`,
    });
  } catch (error) {
    console.error('Error generating 2FA setup:', error);
    return NextResponse.json(
      { error: 'Errore nella generazione 2FA' },
      { status: 500 }
    );
  }
}

// POST - Verify and enable 2FA
export async function POST(request: NextRequest) {
  try {
    // CSRF Protection
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // Verify authentication
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const body = await request.json();
    const { userId, secret, token } = body;

    if (!userId || !secret || !token) {
      return NextResponse.json(
        { error: 'userId, secret e token richiesti' },
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

    // Verify the token
    if (!verifyTotp(secret, token)) {
      return NextResponse.json(
        { error: 'Codice non valido. Riprova.' },
        { status: 400 }
      );
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes();

    // Enable 2FA
    const enabled = await enable2FA(userId, secret, backupCodes);

    if (!enabled) {
      return NextResponse.json(
        { error: 'Errore nell\'abilitazione 2FA' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '2FA abilitata con successo',
      backupCodes, // Show only once!
    });
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    return NextResponse.json(
      { error: 'Errore nell\'abilitazione 2FA' },
      { status: 500 }
    );
  }
}
