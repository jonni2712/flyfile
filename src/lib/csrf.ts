import { NextRequest, NextResponse } from 'next/server';

/**
 * CSRF Protection Module
 *
 * Validates Origin header to prevent cross-site request forgery attacks.
 * Uses Origin validation which is more reliable than CSRF tokens in modern browsers.
 */

// Get allowed origins from environment or default to localhost
function getAllowedOrigins(): string[] {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const allowedOrigins = [baseUrl];

  // Also allow Vercel preview URLs in non-production
  if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:3000');
    allowedOrigins.push('http://127.0.0.1:3000');
  }

  // Add any additional allowed origins from env
  const extraOrigins = process.env.ALLOWED_ORIGINS;
  if (extraOrigins) {
    allowedOrigins.push(...extraOrigins.split(',').map(o => o.trim()));
  }

  return allowedOrigins;
}

/**
 * Validate that the request origin matches allowed origins
 * This provides CSRF protection by ensuring requests come from our own site
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // For same-origin requests, origin might be null
  // In this case, check referer or allow if it's a trusted context
  if (!origin) {
    // Referer-based fallback
    if (referer) {
      const refererUrl = new URL(referer);
      const allowedOrigins = getAllowedOrigins();
      return allowedOrigins.some(allowed => {
        try {
          const allowedUrl = new URL(allowed);
          return refererUrl.origin === allowedUrl.origin;
        } catch {
          return false;
        }
      });
    }

    // No origin or referer - this could be:
    // 1. Same-origin request (browsers might not send origin)
    // 2. Non-browser client (curl, Postman)
    // 3. Server-side request
    // For security, we block these in production for mutative endpoints
    if (process.env.NODE_ENV === 'production') {
      return false;
    }

    // In development, allow requests without origin
    return true;
  }

  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.some(allowed => {
    try {
      const allowedUrl = new URL(allowed);
      return origin === allowedUrl.origin;
    } catch {
      return origin === allowed;
    }
  });
}

/**
 * CSRF protection middleware for API routes
 * Returns an error response if origin validation fails
 */
export function csrfProtection(request: NextRequest): NextResponse | null {
  // Only validate for mutative methods
  const method = request.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return null;
  }

  // SECURITY: API key presence alone does NOT skip CSRF validation.
  // API keys are validated separately in api-auth.ts; CSRF still applies here.

  if (!validateOrigin(request)) {
    console.warn('CSRF protection triggered:', {
      method: request.method,
      url: request.url,
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
    });

    return NextResponse.json(
      {
        error: 'Richiesta non autorizzata',
        code: 'CSRF_VALIDATION_FAILED'
      },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Validate CSRF for webhook endpoints (Stripe, etc.)
 * Webhooks use signature verification instead of origin validation
 */
export function isWebhookRequest(request: NextRequest): boolean {
  // Check for Stripe webhook signature
  if (request.headers.get('stripe-signature')) {
    return true;
  }

  // Add other webhook signatures here as needed

  return false;
}

/**
 * Helper to wrap API route handler with CSRF protection
 */
export function withCsrfProtection<T>(
  handler: (request: NextRequest, context?: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: T): Promise<NextResponse> => {
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    return handler(request, context);
  };
}
