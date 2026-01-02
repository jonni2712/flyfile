import { NextRequest, NextResponse } from 'next/server';
import { verifyRecaptchaToken, type RecaptchaAction } from '@/lib/recaptcha';
import { checkRateLimit } from '@/lib/rate-limit';

// POST - Verify reCAPTCHA token
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { token, action } = body as { token: string; action?: RecaptchaAction };

    if (!token) {
      return NextResponse.json(
        { error: 'Token richiesto' },
        { status: 400 }
      );
    }

    const result = await verifyRecaptchaToken(token, action);

    if (!result.success || result.isBot) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Verifica CAPTCHA fallita',
          isBot: result.isBot
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      score: result.score,
      action: result.action
    });
  } catch (error) {
    console.error('Error verifying CAPTCHA:', error);
    return NextResponse.json(
      { error: 'Errore nella verifica CAPTCHA' },
      { status: 500 }
    );
  }
}
