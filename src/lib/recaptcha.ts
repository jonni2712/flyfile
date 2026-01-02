// reCAPTCHA v3 integration for FlyFile
// Invisible CAPTCHA that runs in the background

// Site key from environment
export const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';
export const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY || '';

// Minimum score threshold (0.0 - 1.0, higher = more likely human)
export const RECAPTCHA_SCORE_THRESHOLD = 0.5;

// reCAPTCHA actions for tracking
export type RecaptchaAction =
  | 'contact_form'
  | 'download_request'
  | 'share_file'
  | 'login'
  | 'register'
  | 'forgot_password'
  | 'anonymous_upload';

// Response from Google reCAPTCHA API
interface RecaptchaVerifyResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

// Verification result
export interface RecaptchaVerificationResult {
  success: boolean;
  score?: number;
  action?: string;
  error?: string;
  isBot: boolean;
}

/**
 * Verify reCAPTCHA token on the server
 */
export async function verifyRecaptchaToken(
  token: string,
  expectedAction?: RecaptchaAction
): Promise<RecaptchaVerificationResult> {
  if (!RECAPTCHA_SECRET_KEY) {
    console.warn('reCAPTCHA secret key not configured');
    // In development, allow through if not configured
    return {
      success: true,
      isBot: false,
      error: 'reCAPTCHA not configured'
    };
  }

  if (!token) {
    return {
      success: false,
      isBot: true,
      error: 'No reCAPTCHA token provided'
    };
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: RECAPTCHA_SECRET_KEY,
        response: token,
      }),
    });

    const data: RecaptchaVerifyResponse = await response.json();

    if (!data.success) {
      return {
        success: false,
        isBot: true,
        error: data['error-codes']?.join(', ') || 'Verification failed'
      };
    }

    // Check score threshold (v3)
    const score = data.score ?? 1.0;
    const isBot = score < RECAPTCHA_SCORE_THRESHOLD;

    // Check action matches (v3)
    if (expectedAction && data.action !== expectedAction) {
      console.warn(`reCAPTCHA action mismatch: expected ${expectedAction}, got ${data.action}`);
    }

    return {
      success: true,
      score,
      action: data.action,
      isBot,
      error: isBot ? 'Low reCAPTCHA score' : undefined
    };
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return {
      success: false,
      isBot: true,
      error: 'Failed to verify reCAPTCHA'
    };
  }
}

/**
 * Load reCAPTCHA script (client-side)
 */
export function loadRecaptchaScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window not available'));
      return;
    }

    // Check if already loaded
    if (window.grecaptcha) {
      resolve();
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="recaptcha"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load reCAPTCHA')));
      return;
    }

    if (!RECAPTCHA_SITE_KEY) {
      reject(new Error('reCAPTCHA site key not configured'));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      resolve();
    };

    script.onerror = () => {
      reject(new Error('Failed to load reCAPTCHA script'));
    };

    document.head.appendChild(script);
  });
}

/**
 * Execute reCAPTCHA and get token (client-side)
 */
export async function executeRecaptcha(action: RecaptchaAction): Promise<string | null> {
  if (typeof window === 'undefined' || !window.grecaptcha) {
    console.warn('reCAPTCHA not loaded');
    return null;
  }

  if (!RECAPTCHA_SITE_KEY) {
    console.warn('reCAPTCHA site key not configured');
    return null;
  }

  try {
    await new Promise<void>((resolve) => {
      window.grecaptcha.ready(() => resolve());
    });

    const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
    return token;
  } catch (error) {
    console.error('reCAPTCHA execution error:', error);
    return null;
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}
