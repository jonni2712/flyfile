import { NextRequest, NextResponse } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/upload',
  '/files',
  '/profile',
  '/team',
  '/analytics',
  '/api-keys',
  '/webhooks',
  '/branding',
  '/account-security',
];

// Routes only for admin
const adminRoutes = ['/admin'];

// Auth routes (redirect to dashboard if already logged in)
const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip for static assets and API (API has its own auth logic)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|json|webmanifest)$/)
  ) {
    return NextResponse.next();
  }

  // Check for Firebase session cookie (__session is the standard for Firebase Hosting + Cloud Functions/SSR)
  // Note: FlyFile might use a different cookie name, but __session is the recommended one for Firebase
  const sessionCookie = request.cookies.get('__session');
  const isAuthenticated = !!sessionCookie?.value;

  // 1. Protected routes: redirect to login if not authenticated
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Admin routes: redirect to login if not authenticated
  // (Actual admin role check happens in the API or via a separate admin-only cookie if implemented)
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  if (isAdminRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. Auth routes: redirect to dashboard if already logged in
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Add Security Headers
  const response = NextResponse.next();

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy (limit browser features)
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
