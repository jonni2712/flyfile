import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireAuth, isAuthorizedForUser } from '@/lib/auth-utils';

// PATCH - Update billing info
export async function PATCH(request: NextRequest) {
  try {
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // Verify authentication
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const body = await request.json();
    const {
      userId,
      billingName,
      billingEmail,
      billingAddress,
      billingCity,
      billingPostalCode,
      billingCountry,
      vatNumber,
      taxId,
      invoiceNotes
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId richiesto' },
        { status: 400 }
      );
    }

    // Verify authorized
    if (!isAuthorizedForUser(authResult, userId)) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    // Prepare billing data
    const billingData: Record<string, unknown> = {};

    if (billingName !== undefined) billingData.billingName = billingName;
    if (billingEmail !== undefined) billingData.billingEmail = billingEmail;
    if (billingAddress !== undefined) billingData.billingAddress = billingAddress;
    if (billingCity !== undefined) billingData.billingCity = billingCity;
    if (billingPostalCode !== undefined) billingData.billingPostalCode = billingPostalCode;
    if (billingCountry !== undefined) billingData.billingCountry = billingCountry;
    if (vatNumber !== undefined) billingData.vatNumber = vatNumber;
    if (taxId !== undefined) billingData.taxId = taxId;
    if (invoiceNotes !== undefined) billingData.invoiceNotes = invoiceNotes;

    // Update user billing info
    await userRef.update({
      billing: billingData,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Dati di fatturazione aggiornati con successo',
    });
  } catch (error) {
    console.error('Error updating billing info:', error);
    return NextResponse.json(
      { error: 'Impossibile aggiornare i dati di fatturazione' },
      { status: 500 }
    );
  }
}

// GET - Get billing info
export async function GET(request: NextRequest) {
  try {
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // Verify authentication
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

    // Verify authorized
    if (!isAuthorizedForUser(authResult, userId)) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    const data = userSnap.data() || {};

    return NextResponse.json({
      billing: data.billing || {},
      stripeCustomerId: data.stripeCustomerId || null,
      subscriptionId: data.subscriptionId || null,
      subscriptionStatus: data.subscriptionStatus || null,
    });
  } catch (error) {
    console.error('Error fetching billing info:', error);
    return NextResponse.json(
      { error: 'Impossibile recuperare i dati di fatturazione' },
      { status: 500 }
    );
  }
}
