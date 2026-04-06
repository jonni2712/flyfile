/**
 * Funnel event tracking for FlyFile.
 *
 * Sends typed conversion events to Google Analytics 4 (gtag).
 * gtag is loaded ONLY after user consent (see ConsentScripts.tsx),
 * so calls here are automatically no-op when consent is denied.
 *
 * Use these events in GA4 → Reports → Funnel exploration to see
 * exactly where users drop off in the journey.
 */

declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'set',
      eventName: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

export type FunnelEvent =
  | 'sign_up_started'      // Step 1: registration form submitted
  | 'sign_up_completed'    // Step 2: OTP verified, account created
  | 'upload_started'       // File upload initiated
  | 'upload_completed'     // File upload finished successfully
  | 'link_copied'          // Share link copied to clipboard
  | 'checkout_started'     // Stripe checkout session created
  | 'checkout_completed';  // Payment success page reached

export function trackEvent(
  event: FunnelEvent,
  params?: Record<string, unknown>
): void {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag !== 'function') return;

  try {
    window.gtag('event', event, params);
  } catch (err) {
    // Never let analytics break the app
    console.warn('[analytics] failed to track event', event, err);
  }
}
