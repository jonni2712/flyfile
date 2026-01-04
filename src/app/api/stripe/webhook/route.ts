import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { PLANS } from '@/types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // SECURITY: Use Admin SDK instead of client SDK
  const db = getAdminFirestore();

  try {
    // SECURITY: Check for duplicate events (idempotency)
    const processedEventsRef = db.collection('processedStripeEvents');
    const existingEvent = await processedEventsRef.doc(event.id).get();

    if (existingEvent.exists) {
      console.log(`Duplicate Stripe event ignored: ${event.id}`);
      return NextResponse.json({ received: true, duplicate: true });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId as 'starter' | 'pro' | 'business';
        const billingCycle = session.metadata?.billingCycle as 'monthly' | 'annual';

        if (userId && planId) {
          const plan = PLANS[planId];
          if (plan) {
            // Build update data
            const updateData: Record<string, unknown> = {
              plan: planId,
              storageLimit: plan.storageLimit,
              maxMonthlyTransfers: plan.maxTransfers,
              retentionDays: plan.retentionDays,
              stripeCustomerId: session.customer,
              subscriptionId: session.subscription,
              subscriptionStatus: 'active',
              billingCycle: billingCycle || 'monthly',
              updatedAt: FieldValue.serverTimestamp(),
            };

            // If we have customer details from checkout, update billing info
            if (session.customer_details) {
              const customerDetails = session.customer_details;
              updateData['billing.firstName'] = customerDetails.name?.split(' ')[0] || '';
              updateData['billing.lastName'] = customerDetails.name?.split(' ').slice(1).join(' ') || '';
              updateData['billing.phone'] = customerDetails.phone || '';

              if (customerDetails.address) {
                updateData['billing.address'] = customerDetails.address.line1 || '';
                updateData['billing.city'] = customerDetails.address.city || '';
                updateData['billing.state'] = customerDetails.address.state || '';
                updateData['billing.postalCode'] = customerDetails.address.postal_code || '';
                updateData['billing.country'] = customerDetails.address.country || '';
              }
            }

            await db.collection('users').doc(userId).update(updateData);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by stripeCustomerId using Admin SDK
        const usersSnapshot = await db.collection('users')
          .where('stripeCustomerId', '==', customerId)
          .get();

        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0];
          await db.collection('users').doc(userDoc.id).update({
            subscriptionStatus: subscription.status as 'active' | 'canceled' | 'past_due' | 'trialing',
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by stripeCustomerId and downgrade to free
        const usersSnapshot = await db.collection('users')
          .where('stripeCustomerId', '==', customerId)
          .get();

        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0];
          const freePlan = PLANS.free;
          await db.collection('users').doc(userDoc.id).update({
            plan: 'free',
            storageLimit: freePlan.storageLimit,
            maxMonthlyTransfers: freePlan.maxTransfers,
            retentionDays: freePlan.retentionDays,
            subscriptionId: null,
            subscriptionStatus: 'canceled',
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Find user and update status
        const usersSnapshot = await db.collection('users')
          .where('stripeCustomerId', '==', customerId)
          .get();

        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0];
          await db.collection('users').doc(userDoc.id).update({
            subscriptionStatus: 'past_due',
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
        break;
      }
    }

    // Mark event as processed (idempotency)
    await processedEventsRef.doc(event.id).set({
      type: event.type,
      processedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
