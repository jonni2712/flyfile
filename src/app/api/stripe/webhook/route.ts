import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PLANS } from '@/types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

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

  try {
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

            await updateDoc(doc(db, 'users', userId), updateData);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by stripeCustomerId
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('stripeCustomerId', '==', customerId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          await updateDoc(doc(db, 'users', userDoc.id), {
            subscriptionStatus: subscription.status as 'active' | 'canceled' | 'past_due' | 'trialing',
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by stripeCustomerId and downgrade to free
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('stripeCustomerId', '==', customerId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const freePlan = PLANS.free;
          await updateDoc(doc(db, 'users', userDoc.id), {
            plan: 'free',
            storageLimit: freePlan.storageLimit,
            maxMonthlyTransfers: freePlan.maxTransfers,
            retentionDays: freePlan.retentionDays,
            subscriptionId: null,
            subscriptionStatus: 'canceled',
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Find user and update status
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('stripeCustomerId', '==', customerId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          await updateDoc(doc(db, 'users', userDoc.id), {
            subscriptionStatus: 'past_due',
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
