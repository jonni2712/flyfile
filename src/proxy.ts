import { NextRequest, NextResponse } from 'next/server';

// Route che richiedono autenticazione
const protectedRoutes = [
  '/dashboard',
  '/files',
  '/profile',
  '/team',
  '/settings',
  '/api-keys',
];
// Nota: /upload NON è protetta per permettere upload anonimi

// Route solo per admin
const adminRoutes = ['/admin'];

// Route auth (redirect se già loggato)
const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

// Main domains that should not be treated as branded subdomains
const MAIN_DOMAINS = [
  'flyfile.it',
  'flyfile.io',
  'www.flyfile.it',
  'www.flyfile.io',
  'localhost',
  'localhost:3000',
];

// Vercel preview/development domains to ignore
const IGNORED_PATTERNS = [
  '.vercel.app',
  '.vercel.sh',
  'vercel.app',
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Skip per asset statici, API, e file
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return addSecurityHeaders(NextResponse.next());
  }

  // ===========================================
  // SUBDOMAIN BRANDING DETECTION
  // ===========================================

  // Skip for Vercel preview deployments
  const isIgnoredDomain = IGNORED_PATTERNS.some(pattern => hostname.includes(pattern));

  // Check if this is NOT the main domain (i.e., it's a subdomain)
  const isMainDomain = MAIN_DOMAINS.some(domain =>
    hostname === domain || hostname.endsWith(`:${domain.split(':')[1] || ''}`)
  );

  if (!isIgnoredDomain && !isMainDomain) {
    // Extract subdomain from hostname
    // e.g., "mafra.flyfile.it" -> "mafra"
    // e.g., "mafra.localhost:3000" -> "mafra" (for local testing)
    let slug: string | null = null;

    // Check for flyfile.it subdomain
    if (hostname.endsWith('.flyfile.it')) {
      slug = hostname.replace('.flyfile.it', '');
    }
    // Check for flyfile.io subdomain
    else if (hostname.endsWith('.flyfile.io')) {
      slug = hostname.replace('.flyfile.io', '');
    }
    // Check for localhost subdomain (for local development)
    else if (hostname.includes('.localhost')) {
      slug = hostname.split('.localhost')[0];
    }

    // If valid subdomain found, rewrite to branded page
    if (slug && slug !== 'www') {
      const url = request.nextUrl.clone();

      // If it's the root of the subdomain, show branded landing page
      if (pathname === '/' || pathname === '') {
        url.pathname = '/branded';
        const response = NextResponse.rewrite(url);
        response.headers.set('x-branded-slug', slug);
        return addSecurityHeaders(response);
      }

      // Extract transferId from path (first segment after /)
      const pathSegments = pathname.split('/').filter(Boolean);
      const transferId = pathSegments[0];

      if (transferId) {
        // Rewrite to branded download page
        url.pathname = `/branded/${transferId}`;
        const response = NextResponse.rewrite(url);
        response.headers.set('x-branded-slug', slug);
        return addSecurityHeaders(response);
      }
    }
  }

  // ===========================================
  // END SUBDOMAIN BRANDING DETECTION
  // ===========================================

  // Verifica sessione Firebase (cookie __session o token in localStorage tramite cookie)
  const sessionCookie = request.cookies.get('__session');
  const isAuthenticated = !!sessionCookie?.value;

  // Route protette: redirect a login se non autenticato
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Route admin: redirect se non autenticato
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  if (isAdminRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Route auth: redirect a dashboard se già loggato
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return addSecurityHeaders(NextResponse.next());
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Note: X-Frame-Options removed - using CSP frame-ancestors instead

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // XSS Protection (legacy but still useful)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy (restrict browser features)
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(self)'
  );

  // HSTS (HTTP Strict Transport Security) - only in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
