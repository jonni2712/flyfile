import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const securityHeaders = [
  // Note: X-Frame-Options removed - using CSP frame-ancestors instead
  // which allows Google OAuth and Firebase auth framing
  // Prevent MIME type sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  // Enable XSS protection (legacy browsers)
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  // Control referrer information
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  // Permissions Policy (disable unnecessary features)
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  },
  // Strict Transport Security (HSTS)
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload'
  },
  // Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // TODO: SECURITY — Replace 'unsafe-inline' and 'unsafe-eval' with nonce-based CSP
      // when Next.js supports per-request nonces in static headers (see next.config.ts headers()).
      // Current limitation: Next.js requires 'unsafe-inline' for its own script injection
      // and 'unsafe-eval' for development/HMR. Consider using middleware-based CSP with nonces
      // for stricter production security.
      // Scripts: self, inline for Next.js, Vercel analytics, Stripe, Google APIs, GTM, reCAPTCHA
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://va.vercel-scripts.com https://apis.google.com https://accounts.google.com https://www.gstatic.com https://www.googletagmanager.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
      // Styles: self, inline for CSS-in-JS
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
      // Images: self, data URIs, Cloudflare R2, Firebase, Stripe, Google
      "img-src 'self' data: blob: https://*.r2.cloudflarestorage.com https://*.googleapis.com https://lh3.googleusercontent.com https://www.google.com https://*.googleusercontent.com https://www.googletagmanager.com",
      // Fonts: self, Google Fonts
      "font-src 'self' https://fonts.gstatic.com data:",
      // Connect: API calls to self, Firebase, Cloudflare R2, Stripe, Vercel, Google, GTM, reCAPTCHA
      "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://*.r2.cloudflarestorage.com https://api.stripe.com https://vitals.vercel-insights.com wss://*.firebaseio.com https://accounts.google.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://*.google-analytics.com https://www.googletagmanager.com https://www.google.com/recaptcha/",
      // Frames: Stripe checkout, Google Auth, Firebase Auth, reCAPTCHA
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://accounts.google.com https://*.firebaseapp.com https://flyfile.it https://www.google.com/recaptcha/ https://recaptcha.google.com",
      // Workers: self for service workers
      "worker-src 'self' blob:",
      // Object: none
      "object-src 'none'",
      // Base URI: self
      "base-uri 'self'",
      // Form action: self, Google
      "form-action 'self' https://accounts.google.com",
      // Frame ancestors: allow Google OAuth and Firebase
      "frame-ancestors 'self' https://accounts.google.com https://*.firebaseapp.com",
      // Upgrade insecure requests
      "upgrade-insecure-requests"
    ].join('; ')
  }
];

const nextConfig: NextConfig = {
  // Enable React strict mode for better debugging
  reactStrictMode: true,

  // Enable standalone output for Docker deployments
  // This creates a minimal production build that can be run with node server.js
  output: 'standalone',

  // Security headers
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },

  // Rewrites for Firebase Auth custom domain
  async rewrites() {
    return [
      {
        // Proxy Firebase Auth requests to allow custom authDomain
        source: '/__/auth/:path*',
        destination: 'https://flyfile-7f676.firebaseapp.com/__/auth/:path*',
      },
    ];
  },

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleapis.com',
      },
    ],
  },

  // Disable x-powered-by header for security
  poweredByHeader: false,
};

export default withNextIntl(nextConfig);
