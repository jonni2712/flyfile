import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { sendEmail, getVerificationCodeEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';
import crypto from 'crypto';

// Generate 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// SECURITY: Hash verification code before storing
function hashVerificationCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

// Anonymous user limits (same as free plan)
const ANONYMOUS_LIMITS = {
  monthlyQuota: 5 * 1024 * 1024 * 1024, // 5GB
  monthlyTransfers: 10,
  retentionDays: 5,
};

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 requests per minute for auth endpoints
    const rateLimitResponse = await checkRateLimit(request, 'auth');
    if (rateLimitResponse) return rateLimitResponse;

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email richiesta' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Formato email non valido' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const db = getAdminFirestore();

    // Find or create anonymous user record
    const anonSnap = await db.collection('anonymousUsers').doc(normalizedEmail).get();

    let anonData: Record<string, unknown>;
    const now = new Date();

    if (anonSnap.exists) {
      anonData = anonSnap.data() || {};

      // Check if monthly limits need reset (30 days)
      const lastReset = anonData.lastResetAt as FirebaseFirestore.Timestamp | undefined;
      const lastResetDate = lastReset?.toDate?.();
      if (lastResetDate) {
        const daysSinceReset = Math.floor((now.getTime() - lastResetDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceReset >= 30) {
          // Reset monthly limits
          anonData = {
            ...anonData,
            monthlyQuotaUsed: 0,
            monthlyTransfersUsed: 0,
            lastResetAt: FieldValue.serverTimestamp(),
          };
          await db.collection('anonymousUsers').doc(normalizedEmail).set(anonData, { merge: true });
        }
      }

      // Check transfer limit
      if ((anonData.monthlyTransfersUsed as number || 0) >= ANONYMOUS_LIMITS.monthlyTransfers) {
        return NextResponse.json(
          {
            success: false,
            error: 'Hai raggiunto il limite di 10 trasferimenti mensili. Registrati per limiti superiori.',
            limitsExceeded: true,
          },
          { status: 429 }
        );
      }
    } else {
      // Create new anonymous user
      anonData = {
        email: normalizedEmail,
        monthlyQuotaUsed: 0,
        monthlyTransfersUsed: 0,
        lastResetAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
      };
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const codeExpiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

    // SECURITY: Store hashed verification code, not plain text
    await db.collection('anonymousUsers').doc(normalizedEmail).set({
      ...anonData,
      verificationCodeHash: hashVerificationCode(verificationCode),
      codeExpiresAt,
      verifiedAt: null, // Reset verification for new code
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    // Send verification email
    try {
      const { html, text } = getVerificationCodeEmail({
        code: verificationCode,
        expiresInMinutes: 10,
      });

      await sendEmail({
        to: normalizedEmail,
        subject: 'Verifica la tua email - FlyFile',
        html,
        text,
      });

      // SECURITY: Don't log PII (email addresses)
      console.log('Verification code sent successfully');
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      return NextResponse.json(
        { success: false, error: 'Errore nell\'invio del codice. Riprova.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Codice di verifica inviato alla tua email',
      usage: {
        transfersUsed: anonData.monthlyTransfersUsed as number || 0,
        transfersLimit: ANONYMOUS_LIMITS.monthlyTransfers,
        quotaUsed: anonData.monthlyQuotaUsed as number || 0,
        quotaLimit: ANONYMOUS_LIMITS.monthlyQuota,
      },
    });
  } catch (error) {
    console.error('Error in send-code:', error);
    return NextResponse.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
