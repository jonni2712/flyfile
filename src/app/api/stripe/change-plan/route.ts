import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireAuth, isAuthorizedForUser } from '@/lib/auth-utils';
import { csrfProtection } from '@/lib/csrf';
import { PLANS } from '@/types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

// Price IDs mapping
const PRICE_IDS = {
  starter: {
    monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID!,
    annual: process.env.STRIPE_STARTER_ANNUAL_PRICE_ID!,
  },
  pro: {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
    annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID!,
  },
  business: {
    monthly: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID!,
    annual: process.env.STRIPE_BUSINESS_ANNUAL_PRICE_ID!,
  },
};

// Plan hierarchy for upgrade/downgrade detection
const PLAN_HIERARCHY: Record<string, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  business: 3,
};

// POST - Change subscription plan
export async function POST(request: NextRequest) {
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

    const { userId, newPlan, billingCycle = 'monthly' } = await request.json();

    if (!userId || !newPlan) {
      return NextResponse.json(
        { error: 'userId e newPlan richiesti' },
        { status: 400 }
      );
    }

    // SECURITY: Verify user is changing their own plan
    if (!isAuthorizedForUser(authResult, userId)) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    // Validate plan
    if (!['starter', 'pro', 'business'].includes(newPlan)) {
      return NextResponse.json(
        { error: 'Piano non valido' },
        { status: 400 }
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
    const currentPlan = userData.plan || 'free';

    // Check if already on the same plan
    if (currentPlan === newPlan && userData.billingCycle === billingCycle) {
      return NextResponse.json(
        { error: 'Sei già su questo piano' },
        { status: 400 }
      );
    }

    // Get price ID
    const priceId = PRICE_IDS[newPlan as keyof typeof PRICE_IDS][billingCycle as 'monthly' | 'annual'];
    if (!priceId) {
      return NextResponse.json(
        { error: 'Prezzo non configurato per questo piano' },
        { status: 400 }
      );
    }

    // Determine if upgrade or downgrade
    const currentLevel = PLAN_HIERARCHY[currentPlan] || 0;
    const newLevel = PLAN_HIERARCHY[newPlan] || 0;
    const isUpgrade = newLevel > currentLevel;

    // If user has no active subscription, create checkout session
    if (!userData.subscriptionId || userData.subscriptionStatus === 'canceled') {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        customer: userData.stripeCustomerId || undefined,
        customer_email: !userData.stripeCustomerId ? userData.email : undefined,
        client_reference_id: userId,
        success_url: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/pricing?canceled=true`,
        metadata: {
          userId,
          planId: newPlan,
          billingCycle,
        },
        subscription_data: {
          metadata: {
            userId,
            planId: newPlan,
            billingCycle,
          },
        },
        billing_address_collection: 'required',
      };

      const session = await stripe.checkout.sessions.create(sessionParams);

      return NextResponse.json({
        success: true,
        checkoutUrl: session.url,
        message: 'Checkout session creata',
      });
    }

    // User has active subscription - modify it
    const subscription = await stripe.subscriptions.retrieve(userData.subscriptionId);
    const subscriptionItem = subscription.items.data[0];

    if (isUpgrade) {
      // UPGRADE: Apply immediately with prorated charge
      await stripe.subscriptions.update(userData.subscriptionId, {
        items: [
          {
            id: subscriptionItem.id,
            price: priceId,
          },
        ],
        proration_behavior: 'always_invoice',
      });

      // Update user plan immediately
      const plan = PLANS[newPlan as keyof typeof PLANS];
      await db.collection('users').doc(userId).update({
        plan: newPlan,
        storageLimit: plan.storageLimit,
        maxMonthlyTransfers: plan.maxTransfers,
        retentionDays: plan.retentionDays,
        billingCycle,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({
        success: true,
        message: 'Piano aggiornato con successo',
        plan: newPlan,
        isUpgrade: true,
      });
    } else {
      // DOWNGRADE: Apply at period end (no proration)
      await stripe.subscriptions.update(userData.subscriptionId, {
        items: [
          {
            id: subscriptionItem.id,
            price: priceId,
          },
        ],
        proration_behavior: 'none',
      });

      // Store pending downgrade info
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const periodEnd = (subscription as any).current_period_end as number;
      await db.collection('users').doc(userId).update({
        pendingPlan: newPlan,
        pendingBillingCycle: billingCycle,
        planChangeAt: new Date(periodEnd * 1000).toISOString(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({
        success: true,
        message: `Passerai al piano ${newPlan} dal ${new Date(periodEnd * 1000).toLocaleDateString('it-IT')}`,
        plan: newPlan,
        isUpgrade: false,
        effectiveDate: new Date(periodEnd * 1000).toISOString(),
      });
    }
  } catch (error) {
    console.error('Error changing plan:', error);
    return NextResponse.json(
      { error: 'Impossibile cambiare piano' },
      { status: 500 }
    );
  }
}

// GET - Get available plans for user
export async function GET(request: NextRequest) {
  try {
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

    // SECURITY: Verify user is checking their own plans
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
    const currentPlan = userData.plan || 'free';

    // Return available plans with upgrade/downgrade info
    const plans = Object.entries(PLANS).map(([planId, plan]) => ({
      ...plan,
      planId,
      isCurrent: planId === currentPlan,
      isUpgrade: (PLAN_HIERARCHY[planId] || 0) > (PLAN_HIERARCHY[currentPlan] || 0),
      isDowngrade: (PLAN_HIERARCHY[planId] || 0) < (PLAN_HIERARCHY[currentPlan] || 0),
    }));

    return NextResponse.json({
      currentPlan,
      billingCycle: userData.billingCycle || 'monthly',
      subscriptionStatus: userData.subscriptionStatus || 'none',
      pendingPlan: userData.pendingPlan || null,
      planChangeAt: userData.planChangeAt || null,
      plans,
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Impossibile recuperare i piani' },
      { status: 500 }
    );
  }
}
