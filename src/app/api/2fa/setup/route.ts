import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { generateTotpSecret, generateTotpUri, generateBackupCodes, enable2FA, verifyTotp } from '@/lib/two-factor';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireAuth, isAuthorizedForUser } from '@/lib/auth-utils';
import { csrfProtection } from '@/lib/csrf';
import { FieldValue } from 'firebase-admin/firestore';
import QRCode from 'qrcode';
import crypto from 'crypto';

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

    // SECURITY: Store secret server-side with TTL instead of sending to client
    const setupId = crypto.randomUUID();
    await db.collection('twoFactorSetup').doc(setupId).set({
      userId,
      secret,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minute TTL
    });

    // SECURITY: Generate QR code server-side as base64 data URI
    const qrCodeDataUri = await QRCode.toDataURL(totpUri, {
      width: 200,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    });

    return NextResponse.json({
      success: true,
      setupId,
      totpUri,
      qrCodeUrl: qrCodeDataUri,
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
    const { userId, setupId, token } = body;

    if (!userId || !setupId || !token) {
      return NextResponse.json(
        { error: 'userId, setupId e token richiesti' },
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

    // SECURITY: Retrieve secret from server-side storage using setupId
    const db = getAdminFirestore();
    const setupRef = db.collection('twoFactorSetup').doc(setupId);
    const setupSnap = await setupRef.get();

    if (!setupSnap.exists) {
      return NextResponse.json(
        { error: 'Sessione di setup non trovata o scaduta. Riprova.' },
        { status: 400 }
      );
    }

    const setupData = setupSnap.data()!;

    // Verify the setup belongs to this user
    if (setupData.userId !== userId) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    // Check if setup has expired
    const expiresAt = setupData.expiresAt?.toDate?.() || setupData.expiresAt;
    if (expiresAt && expiresAt < new Date()) {
      await setupRef.delete();
      return NextResponse.json(
        { error: 'Sessione di setup scaduta. Riprova.' },
        { status: 400 }
      );
    }

    const secret = setupData.secret;

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

    // Clean up the setup document
    await setupRef.delete();

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
