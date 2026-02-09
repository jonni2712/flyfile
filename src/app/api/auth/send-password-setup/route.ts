import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';
import { sendEmail, getPasswordSetupEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireAuth } from '@/lib/auth-utils';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await checkRateLimit(request, 'auth');
    if (rateLimitResponse) return rateLimitResponse;

    // Verify authentication
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const email = authResult.email;
    if (!email) {
      return NextResponse.json(
        { error: 'Email non trovata' },
        { status: 400 }
      );
    }

    const auth = getAdminAuth();
    const resetLink = await auth.generatePasswordResetLink(email, {
      url: `${BASE_URL}/login`,
    });

    const { html, text } = getPasswordSetupEmail({ resetLink });
    await sendEmail({
      to: email,
      subject: 'Configura la tua password - FlyFile',
      html,
      text,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in send-password-setup:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
