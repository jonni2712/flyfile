import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendEmail, getVerificationCodeEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';

// Generate 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
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

    // Find or create anonymous user record
    const anonRef = doc(db, 'anonymousUsers', normalizedEmail);
    const anonSnap = await getDoc(anonRef);

    let anonData;
    const now = new Date();

    if (anonSnap.exists()) {
      anonData = anonSnap.data();

      // Check if monthly limits need reset (30 days)
      const lastReset = anonData.lastResetAt?.toDate();
      if (lastReset) {
        const daysSinceReset = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceReset >= 30) {
          // Reset monthly limits
          anonData = {
            ...anonData,
            monthlyQuotaUsed: 0,
            monthlyTransfersUsed: 0,
            lastResetAt: serverTimestamp(),
          };
          await setDoc(anonRef, anonData, { merge: true });
        }
      }

      // Check transfer limit
      if ((anonData.monthlyTransfersUsed || 0) >= ANONYMOUS_LIMITS.monthlyTransfers) {
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
        lastResetAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      };
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const codeExpiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

    // Update user with new code
    await setDoc(anonRef, {
      ...anonData,
      verificationCode,
      codeExpiresAt,
      verifiedAt: null, // Reset verification for new code
      updatedAt: serverTimestamp(),
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

      console.log('Verification code sent to:', normalizedEmail);
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
        transfersUsed: anonData.monthlyTransfersUsed || 0,
        transfersLimit: ANONYMOUS_LIMITS.monthlyTransfers,
        quotaUsed: anonData.monthlyQuotaUsed || 0,
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
