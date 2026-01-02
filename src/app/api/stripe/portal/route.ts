import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { checkRateLimit } from '@/lib/rate-limit';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

// POST - Create Stripe Customer Portal session
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    const { userId, returnUrl } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId richiesto' },
        { status: 400 }
      );
    }

    // Get user data
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    const userData = userSnap.data();

    if (!userData.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Account Stripe non trovato. Sottoscrivi prima un abbonamento.' },
        { status: 400 }
      );
    }

    // Create portal session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const session = await stripe.billingPortal.sessions.create({
      customer: userData.stripeCustomerId,
      return_url: returnUrl || `${baseUrl}/settings#subscription`,
    });

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: 'Impossibile accedere al portale di fatturazione' },
      { status: 500 }
    );
  }
}
