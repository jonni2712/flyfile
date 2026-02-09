import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { sendEmail, getAuthCodeEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';
import crypto from 'crypto';

// Generate 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// SECURITY: Hash verification code before storing
function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

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

    // Generate new verification code
    const code = generateVerificationCode();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

    // SECURITY: Store hashed code in separate authCodes collection
    await db.collection('authCodes').doc(normalizedEmail).set({
      email: normalizedEmail,
      codeHash: hashCode(code),
      expiresAt,
      attempts: 0,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Send auth code email
    try {
      const { html, text } = getAuthCodeEmail({
        code,
        expiresInMinutes: 10,
      });

      await sendEmail({
        to: normalizedEmail,
        subject: 'Il tuo codice di accesso - FlyFile',
        html,
        text,
      });

      console.log('Auth code sent successfully');
    } catch (emailError) {
      console.error('Error sending auth code email:', emailError);
      return NextResponse.json(
        { success: false, error: "Errore nell'invio del codice. Riprova." },
        { status: 500 }
      );
    }

    // SECURITY: Always return success to prevent user enumeration
    return NextResponse.json({
      success: true,
      message: 'Codice di verifica inviato alla tua email',
    });
  } catch (error) {
    console.error('Error in auth/send-code:', error);
    return NextResponse.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
