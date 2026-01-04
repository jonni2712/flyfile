import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { checkRateLimit } from '@/lib/rate-limit';
import crypto from 'crypto';

// SECURITY: Hash verification code for comparison
function hashVerificationCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 requests per minute for sensitive endpoints
    const rateLimitResponse = await checkRateLimit(request, 'sensitive');
    if (rateLimitResponse) return rateLimitResponse;

    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email e codice richiesti' },
        { status: 400 }
      );
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, error: 'Codice non valido. Deve essere di 6 cifre.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const db = getAdminFirestore();

    // Get anonymous user record
    const anonSnap = await db.collection('anonymousUsers').doc(normalizedEmail).get();

    if (!anonSnap.exists) {
      return NextResponse.json(
        { success: false, error: 'Utente non trovato. Richiedi un nuovo codice.' },
        { status: 404 }
      );
    }

    const anonData = anonSnap.data() || {};

    // SECURITY: Compare hashed codes (constant-time comparison)
    const inputHash = hashVerificationCode(code);
    const storedHash = anonData.verificationCodeHash as string | undefined;

    // Use timing-safe comparison to prevent timing attacks
    const hashesMatch = storedHash &&
      inputHash.length === storedHash.length &&
      crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(storedHash));

    if (!hashesMatch) {
      return NextResponse.json(
        { success: false, error: 'Codice di verifica non valido.' },
        { status: 400 }
      );
    }

    // Check if code is expired
    const codeExpiresAtField = anonData.codeExpiresAt as FirebaseFirestore.Timestamp | Date | undefined;
    const codeExpiresAt = codeExpiresAtField && 'toDate' in codeExpiresAtField
      ? codeExpiresAtField.toDate()
      : new Date(codeExpiresAtField as unknown as string);

    if (codeExpiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Codice scaduto. Richiedi un nuovo codice.' },
        { status: 400 }
      );
    }

    // Mark as verified
    await db.collection('anonymousUsers').doc(normalizedEmail).update({
      verifiedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Email verificata con successo',
      anonymousUserId: normalizedEmail,
      usage: {
        transfersUsed: anonData.monthlyTransfersUsed as number || 0,
        quotaUsed: anonData.monthlyQuotaUsed as number || 0,
      },
    });
  } catch (error) {
    console.error('Error in verify-code:', error);
    return NextResponse.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
