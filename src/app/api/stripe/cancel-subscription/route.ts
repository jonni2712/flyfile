import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireAuth, isAuthorizedForUser } from '@/lib/auth-utils';
import { csrfProtection } from '@/lib/csrf';
import { PLANS } from '@/types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// POST - Cancel subscription
export async function POST(request: NextRequest) {
  try {
    // SECURITY: CSRF Protection
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    // Rate limiting: 5 requests per minute for sensitive operations
    const rateLimitResponse = await checkRateLimit(request, 'sensitive');
    if (rateLimitResponse) return rateLimitResponse;

    // SECURITY: Require authentication
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const { userId, cancelImmediately = false } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId richiesto' },
        { status: 400 }
      );
    }

    // SECURITY: Verify user is canceling their own subscription
    if (!isAuthorizedForUser(authResult, userId)) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    const db = getAdminFirestore();

    // Get user data
    const userSnap = await db.collection('users').doc(userId).get();

    if (!userSnap.exists) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    const userData = userSnap.data() || {};

    if (!userData.subscriptionId) {
      return NextResponse.json(
        { error: 'Nessun abbonamento attivo' },
        { status: 400 }
      );
    }

    // Cancel the subscription
    if (cancelImmediately) {
      // Cancel immediately
      await stripe.subscriptions.cancel(userData.subscriptionId);

      // Downgrade to free plan immediately
      const freePlan = PLANS.free;
      await db.collection('users').doc(userId).update({
        plan: 'free',
        storageLimit: freePlan.storageLimit,
        maxMonthlyTransfers: freePlan.maxTransfers,
        retentionDays: freePlan.retentionDays,
        subscriptionId: null,
        subscriptionStatus: 'canceled',
      });

      return NextResponse.json({
        success: true,
        message: 'Abbonamento cancellato con successo',
        immediate: true,
      });
    } else {
      // Cancel at period end
      await stripe.subscriptions.update(userData.subscriptionId, {
        cancel_at_period_end: true,
      });

      // Get subscription to know when it ends
      const subscription = await stripe.subscriptions.retrieve(userData.subscriptionId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const periodEnd = (subscription as any).current_period_end as number;

      await db.collection('users').doc(userId).update({
        subscriptionStatus: 'canceling',
        cancelAt: new Date(periodEnd * 1000).toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: 'Abbonamento verrà cancellato alla fine del periodo',
        cancelAt: new Date(periodEnd * 1000).toISOString(),
      });
    }
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'Impossibile cancellare l\'abbonamento' },
      { status: 500 }
    );
  }
}

// DELETE - Resume/reactivate subscription (undo cancel)
export async function DELETE(request: NextRequest) {
  try {
    // SECURITY: CSRF Protection
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'sensitive');
    if (rateLimitResponse) return rateLimitResponse;

    // SECURITY: Require authentication
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

    // SECURITY: Verify user is reactivating their own subscription
    if (!isAuthorizedForUser(authResult, userId)) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    const db = getAdminFirestore();

    // Get user data
    const userSnap = await db.collection('users').doc(userId).get();

    if (!userSnap.exists) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    const userData = userSnap.data() || {};

    if (!userData.subscriptionId) {
      return NextResponse.json(
        { error: 'Nessun abbonamento trovato' },
        { status: 400 }
      );
    }

    // Reactivate the subscription
    await stripe.subscriptions.update(userData.subscriptionId, {
      cancel_at_period_end: false,
    });

    await db.collection('users').doc(userId).update({
      subscriptionStatus: 'active',
      cancelAt: null,
    });

    return NextResponse.json({
      success: true,
      message: 'Abbonamento riattivato con successo',
    });
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    return NextResponse.json(
      { error: 'Impossibile riattivare l\'abbonamento' },
      { status: 500 }
    );
  }
}
