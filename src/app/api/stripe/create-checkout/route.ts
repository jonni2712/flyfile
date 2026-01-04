import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireAuth, isAuthorizedForUser } from '@/lib/auth-utils';
import { csrfProtection } from '@/lib/csrf';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

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

    // Rate limiting: 5 requests per minute for payment operations
    const rateLimitResponse = await checkRateLimit(request, 'auth');
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

    // Prepare customer creation/update data for Stripe
    const customerData: Stripe.Checkout.SessionCreateParams.CustomerCreation = 'always';

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
      customer_email: userEmail,
      client_reference_id: userId,
      customer_creation: customerData,
      success_url: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
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
      // Pre-fill billing address if available
      billing_address_collection: 'required',
    };

    // If user has billing data, pre-populate the checkout
    if (billing) {
      // Set tax ID collection for business users
      if (billing.userType === 'business') {
        sessionParams.tax_id_collection = { enabled: true };
      }

      // Add customer update to populate address
      sessionParams.customer_update = {
        address: 'auto',
        name: 'auto',
      };

      // Pre-fill phone number collection
      sessionParams.phone_number_collection = { enabled: true };

      // Add invoice creation for proper billing
      sessionParams.invoice_creation = {
        enabled: true,
        invoice_data: {
          metadata: {
            userId,
            userType: billing.userType || 'individual',
          },
          custom_fields: billing.userType === 'business' && billing.vatNumber ? [
            { name: 'Partita IVA', value: billing.vatNumber },
          ] : undefined,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
