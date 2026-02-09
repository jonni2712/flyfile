import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireAuth, isAuthorizedForUser } from '@/lib/auth-utils';
import { csrfProtection } from '@/lib/csrf';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// POST - Update billing info in Firestore + Stripe customer
export async function POST(request: NextRequest) {
  try {
    // SECURITY: CSRF Protection
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // SECURITY: Require authentication
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const { userId, billing } = await request.json();

    if (!userId || !billing) {
      return NextResponse.json(
        { error: 'userId e billing richiesti' },
        { status: 400 }
      );
    }

    // SECURITY: Verify user is updating their own data
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

    // Save to Firestore
    await db.collection('users').doc(userId).update({
      billing,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // If user has a Stripe customer, sync billing data there too
    if (userData.stripeCustomerId) {
      const customerName = billing.userType === 'business' && billing.companyName
        ? billing.companyName
        : [billing.firstName, billing.lastName].filter(Boolean).join(' ') || undefined;

      const updateParams: Stripe.CustomerUpdateParams = {
        name: customerName,
        phone: billing.phone || undefined,
        address: {
          line1: billing.address || '',
          city: billing.city || '',
          postal_code: billing.postalCode || '',
          country: billing.country || '',
        },
      };

      // Add tax ID info for businesses
      if (billing.userType === 'business' && billing.vatNumber) {
        // Check existing tax IDs to avoid duplicates
        const existingTaxIds = await stripe.customers.listTaxIds(userData.stripeCustomerId);
        const hasVat = existingTaxIds.data.some(
          (t) => t.value === billing.vatNumber
        );

        if (!hasVat) {
          // Remove old tax IDs before adding new one
          for (const taxId of existingTaxIds.data) {
            await stripe.customers.deleteTaxId(userData.stripeCustomerId, taxId.id);
          }

          try {
            await stripe.customers.createTaxId(userData.stripeCustomerId, {
              type: 'eu_vat',
              value: billing.vatNumber,
            });
          } catch (taxError) {
            // Tax ID validation may fail — don't block the whole update
            console.warn('Could not set tax ID on Stripe:', taxError);
          }
        }
      }

      await stripe.customers.update(userData.stripeCustomerId, updateParams);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating billing info:', error);
    return NextResponse.json(
      { error: 'Impossibile aggiornare i dati di fatturazione' },
      { status: 500 }
    );
  }
}
