// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://06569e6caca29d476fa3bebd71b7f054@o4511031096049664.ingest.de.sentry.io/4511031097622608",

  // Add optional integrations for additional features
  integrations: [Sentry.replayIntegration()],

  // Filter out noise from third-party browser extensions that inject scripts
  // into every page (MetaMask, Grammarly, password managers, etc.).
  // These errors come from extension code, not our app, and pollute the dashboard.
  beforeSend(event) {
    const frames = event.exception?.values?.[0]?.stacktrace?.frames;
    if (frames?.some((f) => f.filename?.includes('inpage.js') || f.filename?.includes('content-script'))) {
      return null; // Drop the event
    }
    // Also drop by message pattern for extensions that don't expose stacktrace
    const msg = event.exception?.values?.map((v) => v.value).join(' ') || '';
    if (/metamask|walletconnect|ethereum/i.test(msg)) {
      return null;
    }
    return event;
  },

  // 100% in dev, 20% in production
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.2,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
