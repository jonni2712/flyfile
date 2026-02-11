import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isAuthorizedForUser } from '@/lib/auth-utils';
import { ensureStripeCustomer } from '@/lib/stripe';
import { checkRateLimit } from '@/lib/rate-limit';
import { csrfProtection } from '@/lib/csrf';

/**
 * POST /api/auth/ensure-customer
 *
 * Called after Google OAuth registration to ensure the user
 * has a Stripe customer. Also serves as a fallback for any
 * user who may have been created without one.
 */
export async function POST(request: NextRequest) {
  try {
    // SECURITY: CSRF Protection
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'userId and email required' },
        { status: 400 }
      );
    }

    if (!isAuthorizedForUser(authResult, userId)) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    const stripeCustomerId = await ensureStripeCustomer(
      userId,
      email,
      'flyfile_google_oauth'
    );

    return NextResponse.json({ success: true, stripeCustomerId });
  } catch (error) {
    console.error('Error ensuring Stripe customer:', error);
    return NextResponse.json(
      { error: 'Failed to ensure Stripe customer' },
      { status: 500 }
    );
  }
}
