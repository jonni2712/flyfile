import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Protected routes (require auth)
const protectedRoutes = [
  "/files",
  "/profile",
  "/team",
  "/settings",
  "/api-keys",
];

// Admin routes
const adminRoutes = ["/admin"];

// Auth routes (redirect if already logged in)
const authRoutes = ["/accedi", "/registrati"];

// Main domains that should not be treated as branded subdomains
const MAIN_DOMAINS = [
  "flyfile.it",
  "flyfile.io",
  "www.flyfile.it",
  "www.flyfile.io",
  "localhost",
  "localhost:3000",
];

// Vercel preview/development domains to ignore
const IGNORED_PATTERNS = [".vercel.app", ".vercel.sh", "vercel.app"];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Skip for static assets, API routes, and files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/__/auth") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // ===========================================
  // SUBDOMAIN BRANDING DETECTION
  // ===========================================
  const isIgnoredDomain = IGNORED_PATTERNS.some((pattern) =>
    hostname.includes(pattern)
  );
  const isMainDomain = MAIN_DOMAINS.some(
    (domain) =>
      hostname === domain ||
      hostname.endsWith(`:${domain.split(":")[1] || ""}`)
  );

  if (!isIgnoredDomain && !isMainDomain) {
    let slug: string | null = null;

    if (hostname.endsWith(".flyfile.it")) {
      slug = hostname.replace(".flyfile.it", "");
    } else if (hostname.endsWith(".flyfile.io")) {
      slug = hostname.replace(".flyfile.io", "");
    } else if (hostname.includes(".localhost")) {
      slug = hostname.split(".localhost")[0];
    }

    if (slug && slug !== "www") {
      const url = request.nextUrl.clone();
      if (pathname === "/" || pathname === "") {
        url.pathname = "/branded";
        const response = NextResponse.rewrite(url);
        response.headers.set("x-branded-slug", slug);
        return response;
      }
      const pathSegments = pathname.split("/").filter(Boolean);
      const transferId = pathSegments[0];
      if (transferId) {
        url.pathname = `/branded/${transferId}`;
        const response = NextResponse.rewrite(url);
        response.headers.set("x-branded-slug", slug);
        return response;
      }
    }
  }

  // ===========================================
  // NEXT-INTL LOCALE ROUTING
  // ===========================================
  const response = intlMiddleware(request);

  // ===========================================
  // AUTH PROTECTION
  // ===========================================
  // Extract the actual pathname without locale prefix for route matching
  const localePrefix = routing.locales.find(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  );
  const pathWithoutLocale = localePrefix
    ? pathname.replace(`/${localePrefix}`, "") || "/"
    : pathname;

  const sessionCookie = request.cookies.get("__session");
  const isAuthenticated = !!sessionCookie?.value;

  // Protected routes: redirect to login if not authenticated
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathWithoutLocale.startsWith(route)
  );
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL(
      localePrefix && localePrefix !== "it"
        ? `/${localePrefix}/accedi`
        : "/accedi",
      request.url
    );
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes: redirect if not authenticated
  const isAdminRoute = adminRoutes.some((route) =>
    pathWithoutLocale.startsWith(route)
  );
  if (isAdminRoute && !isAuthenticated) {
    return NextResponse.redirect(
      new URL(
        localePrefix && localePrefix !== "it"
          ? `/${localePrefix}/accedi`
          : "/accedi",
        request.url
      )
    );
  }

  // Auth routes: redirect to upload if already logged in
  const isAuthRoute = authRoutes.some((route) =>
    pathWithoutLocale.startsWith(route)
  );
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(
      new URL(
        localePrefix && localePrefix !== "it"
          ? `/${localePrefix}/upload`
          : "/upload",
        request.url
      )
    );
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
