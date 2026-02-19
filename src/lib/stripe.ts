import Stripe from 'stripe';
import { getAdminFirestore } from '@/lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Ensures a Stripe customer exists for the given user.
 *
 * 1. If Firestore already has a valid stripeCustomerId → returns it
 * 2. If not, searches Stripe by email to avoid duplicates
 * 3. If still not found, creates a new customer
 * 4. Saves the ID atomically via Firestore transaction (prevents race conditions)
 * 5. If another concurrent request won the race, cleans up the duplicate
 *
 * This is the SINGLE source of truth for Stripe customer creation.
 */
export async function ensureStripeCustomer(
  userId: string,
  email: string,
  source: string = 'flyfile'
): Promise<string> {
  const db = getAdminFirestore();
  const userRef = db.collection('users').doc(userId);
  const userSnap = await userRef.get();
  const userData = userSnap.data();

  let stripeCustomerId = userData?.stripeCustomerId || null;

  // 1. Verify existing customer is still valid on Stripe
  if (stripeCustomerId) {
    try {
      const existing = await stripe.customers.retrieve(stripeCustomerId);
      if (!existing.deleted) {
        return stripeCustomerId;
      }
      // Customer was deleted on Stripe — need a new one
      stripeCustomerId = null;
    } catch {
      // Invalid ID — need a new one
      stripeCustomerId = null;
    }
  }

  // 2. Search Stripe by email to prevent duplicates
  const normalizedEmail = email.toLowerCase().trim();
  let wasCreated = false;

  const existingCustomers = await stripe.customers.list({
    email: normalizedEmail,
    limit: 1,
  });

  if (existingCustomers.data.length > 0 && !existingCustomers.data[0].deleted) {
    stripeCustomerId = existingCustomers.data[0].id;

    // Update metadata to link to this user if not already linked
    const existingMetadata = existingCustomers.data[0].metadata;
    if (existingMetadata?.userId !== userId) {
      await stripe.customers.update(stripeCustomerId, {
        metadata: { ...existingMetadata, userId, source },
      });
    }
  }

  // 3. Create new customer only if none found
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: normalizedEmail,
      metadata: {
        userId,
        source,
      },
    });
    stripeCustomerId = customer.id;
    wasCreated = true;
  }

  // 4. Save to Firestore atomically — prevents race condition where two
  //    concurrent requests both create a Stripe customer and both try to save.
  //    Only the first write wins; the loser detects it and cleans up.
  const winnerId = await db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef);
    const currentId = snap.data()?.stripeCustomerId;

    if (currentId) {
      // Another request already saved a customer ID — verify it's valid
      // (not a stale/deleted one we already checked above)
      if (currentId !== userData?.stripeCustomerId) {
        // A different, newly-saved ID from a concurrent request — use theirs
        return currentId;
      }
    }

    // We're first — save our ID
    tx.update(userRef, { stripeCustomerId });
    return stripeCustomerId;
  });

  // 5. If we lost the race and WE created a new customer, delete it to avoid orphans
  if (winnerId !== stripeCustomerId && wasCreated) {
    try {
      await stripe.customers.del(stripeCustomerId!);
    } catch {
      // Best effort cleanup — orphan will be harmless
    }
  }

  return winnerId!;
}
