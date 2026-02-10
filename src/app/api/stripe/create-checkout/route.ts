import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireAuth, isAuthorizedForUser } from '@/lib/auth-utils';
import { csrfProtection } from '@/lib/csrf';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Price IDs mapping - supports all plans with monthly/annual billing
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

export async function POST(request: NextRequest) {
  try {
    // SECURITY: CSRF Protection
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    // Rate limiting: 60 requests per minute (auth + CSRF already protect this endpoint)
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // SECURITY: Require authentication
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const { planId, priceId, billingCycle, userId, userEmail } = await request.json();

    if (!planId || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // SECURITY: Verify user is creating checkout for themselves
    if (!isAuthorizedForUser(authResult, userId)) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    // Validate plan
    if (!['starter', 'pro', 'business'].includes(planId)) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // Get the correct price ID based on plan and billing cycle
    const cycle = billingCycle === 'annual' ? 'annual' : 'monthly';
    const selectedPriceId = priceId || PRICE_IDS[planId as keyof typeof PRICE_IDS][cycle];

    if (!selectedPriceId) {
      return NextResponse.json(
        { error: 'Price ID not configured for this plan' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const db = getAdminFirestore();

    // Fetch user billing data from Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const billing = userData?.billing;

    // Check if user already has a Stripe customer ID
    let stripeCustomerId = userData?.stripeCustomerId;

    // Verify customer exists in Stripe, create if missing or invalid
    if (stripeCustomerId) {
      try {
        await stripe.customers.retrieve(stripeCustomerId);
      } catch {
        // Customer doesn't exist in Stripe, reset so we create a new one
        stripeCustomerId = null;
      }
    }

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId,
          source: 'flyfile_checkout',
        },
      });
      stripeCustomerId = customer.id;

      // Save customer ID to user record
      await db.collection('users').doc(userId).update({
        stripeCustomerId: customer.id,
      });
    }

    // Build session parameters
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPriceId,
          quantity: 1,
        },
      ],
      // Use customer ID instead of email for better management
      customer: stripeCustomerId,
      client_reference_id: userId,
      success_url: `${baseUrl}/abbonamento/successo?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/prezzi?canceled=true`,
      metadata: {
        userId,
        planId,
        billingCycle: cycle,
      },
      subscription_data: {
        metadata: {
          userId,
          planId,
          billingCycle: cycle,
        },
      },
      // Enable promo/coupon codes
      allow_promotion_codes: true,
      // Pre-fill billing address
      billing_address_collection: 'required',
      // Auto-update customer info from checkout
      customer_update: {
        name: 'auto',
        address: 'auto',
      },
      // Enable tax ID collection for all users (VAT, etc.)
      tax_id_collection: { enabled: true },
    };

    // If user has billing data, add phone number collection
    if (billing) {
      sessionParams.phone_number_collection = { enabled: true };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);

    // Extract error details
    let errorMessage = 'Failed to create checkout session';
    let errorCode = 'UNKNOWN_ERROR';
    let stripeMessage = '';

    if (error instanceof Error) {
      errorMessage = error.message;
      stripeMessage = error.message;

      // Stripe specific errors
      if ('type' in error) {
        errorCode = (error as { type: string }).type;
      }
      // Get Stripe's specific error message
      if ('raw' in error) {
        const raw = (error as { raw?: { message?: string } }).raw;
        if (raw?.message) stripeMessage = raw.message;
      }
    }

    // Return detailed error for debugging
    return NextResponse.json(
      {
        error: errorMessage,
        code: errorCode,
        stripeMessage,
        details: String(error)
      },
      { status: 500 }
    );
  }
}
