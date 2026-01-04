import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireAuth, isAuthorizedForUser } from '@/lib/auth-utils';
import { csrfProtection } from '@/lib/csrf';

// Valid beta tester codes
const VALID_BETA_CODES = [
  'FLYFILE-BETA-2024',
  'FLYFILE-TESTER',
  'BETATEST2024',
  'EARLYBIRD-FLYFILE',
];

// POST - Activate beta tester status
export async function POST(request: NextRequest) {
  try {
    // SECURITY: CSRF Protection
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    // Rate limiting: 5 requests per minute for auth-like operations
    const rateLimitResponse = await checkRateLimit(request, 'auth');
    if (rateLimitResponse) return rateLimitResponse;

    // SECURITY: Require authentication
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const { userId, code } = await request.json();

    if (!userId || !code) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or code' },
        { status: 400 }
      );
    }

    // SECURITY: Verify user is activating their own beta status
    if (!isAuthorizedForUser(authResult, userId)) {
      return NextResponse.json(
        { success: false, error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    // Validate code
    const normalizedCode = code.trim().toUpperCase();
    if (!VALID_BETA_CODES.includes(normalizedCode)) {
      return NextResponse.json(
        { success: false, error: 'Codice beta tester non valido' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();

    // Check if user exists
    const userSnap = await db.collection('users').doc(userId).get();

    if (!userSnap.exists) {
      return NextResponse.json(
        { success: false, error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    // Check if already a beta tester
    const userData = userSnap.data() || {};
    if (userData.isBetaTester) {
      return NextResponse.json(
        { success: false, error: 'Sei già un beta tester!' },
        { status: 400 }
      );
    }

    // Activate beta tester status
    await db.collection('users').doc(userId).update({
      isBetaTester: true,
      betaTesterCode: normalizedCode,
      betaTesterSince: FieldValue.serverTimestamp(),
      // Give beta testers Pro plan benefits
      plan: 'pro',
      storageLimit: 500 * 1024 * 1024 * 1024, // 500 GB
      maxMonthlyTransfers: 30,
      retentionDays: 30,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Benvenuto nel programma beta tester! Hai ricevuto i benefici del piano Pro.',
    });
  } catch (error) {
    console.error('Error activating beta tester:', error);
    return NextResponse.json(
      { success: false, error: 'Errore durante l\'attivazione' },
      { status: 500 }
    );
  }
}

// GET - Check beta tester status
export async function GET(request: NextRequest) {
  try {
    // Rate limiting: 60 requests per minute for API operations
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // SECURITY: Require authentication
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId' },
        { status: 400 }
      );
    }

    // SECURITY: Verify user is checking their own status
    if (!isAuthorizedForUser(authResult, userId)) {
      return NextResponse.json(
        { success: false, error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    const db = getAdminFirestore();

    const userSnap = await db.collection('users').doc(userId).get();

    if (!userSnap.exists) {
      return NextResponse.json(
        { success: false, error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    const userData = userSnap.data() || {};

    return NextResponse.json({
      success: true,
      isBetaTester: userData.isBetaTester || false,
      betaTesterSince: userData.betaTesterSince?.toDate?.()?.toISOString() || null,
    });
  } catch (error) {
    console.error('Error checking beta tester status:', error);
    return NextResponse.json(
      { success: false, error: 'Errore durante la verifica' },
      { status: 500 }
    );
  }
}
