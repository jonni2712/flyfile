import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await checkRateLimit(request, 'auth');
    if (rateLimitResponse) return rateLimitResponse;

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email richiesta' },
        { status: 400 }
      );
    }

    const auth = getAdminAuth();

    try {
      const userRecord = await auth.getUserByEmail(email.toLowerCase().trim());

      // Check if user has password provider
      const hasPassword = userRecord.providerData.some(
        (provider) => provider.providerId === 'password'
      );

      return NextResponse.json({
        method: hasPassword ? 'password' : 'code',
      });
    } catch {
      // User not found — return 'code' to prevent user enumeration
      return NextResponse.json({ method: 'code' });
    }
  } catch (error) {
    console.error('Error in check-password:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
