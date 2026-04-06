'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics-events';

/**
 * Fires the `checkout_completed` funnel event once when mounted.
 * Used on /abbonamento/successo (server component) to track
 * Stripe checkout completion in GA4.
 */
export default function CheckoutSuccessTracker() {
  useEffect(() => {
    trackEvent('checkout_completed');
  }, []);

  return null;
}
