import { NextRequest } from 'next/server';

/**
 * Sentry tunnel route — forwards client error reports through our own
 * domain to bypass ad-blockers that would otherwise drop the request.
 *
 * This is the manual implementation of `tunnelRoute: "/monitoring"` from
 * next.config.ts. We implement it ourselves because the automatic rewrite
 * from `withSentryConfig` conflicts with the custom rewrites() function.
 *
 * Pattern from https://docs.sentry.io/platforms/javascript/guides/nextjs/
 *   troubleshooting/#dealing-with-ad-blockers
 */

// Extracted from the DSN configured in instrumentation-client.ts:
// https://06569e6caca29d476fa3bebd71b7f054@o4511031096049664.ingest.de.sentry.io/4511031097622608
const SENTRY_HOST = 'o4511031096049664.ingest.de.sentry.io';
const ALLOWED_PROJECT_IDS = ['4511031097622608'];

export async function POST(request: NextRequest) {
  try {
    const envelopeBytes = await request.arrayBuffer();
    const envelope = new TextDecoder().decode(envelopeBytes);
    const firstLineEnd = envelope.indexOf('\n');
    if (firstLineEnd === -1) {
      return new Response('Invalid envelope', { status: 400 });
    }

    const header = JSON.parse(envelope.substring(0, firstLineEnd));
    const dsn = new URL(header.dsn);
    const projectId = dsn.pathname.replace('/', '');

    if (dsn.hostname !== SENTRY_HOST) {
      return new Response(`Invalid Sentry hostname: ${dsn.hostname}`, { status: 400 });
    }
    if (!ALLOWED_PROJECT_IDS.includes(projectId)) {
      return new Response(`Invalid Sentry project id: ${projectId}`, { status: 400 });
    }

    const upstream = `https://${SENTRY_HOST}/api/${projectId}/envelope/`;
    const upstreamResponse = await fetch(upstream, {
      method: 'POST',
      body: envelopeBytes,
      headers: { 'Content-Type': 'application/x-sentry-envelope' },
    });

    // Propagate Sentry's response status so the client SDK can react correctly
    return new Response(null, { status: upstreamResponse.status });
  } catch (err) {
    console.error('[sentry tunnel] forwarding failed:', err);
    return new Response('Tunnel error', { status: 500 });
  }
}

// Sentry sometimes preflights with OPTIONS when the envelope is large
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
