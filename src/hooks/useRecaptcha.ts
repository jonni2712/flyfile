'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  loadRecaptchaScript,
  executeRecaptcha,
  RECAPTCHA_SITE_KEY,
  type RecaptchaAction
} from '@/lib/recaptcha';

interface UseRecaptchaReturn {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  executeRecaptcha: (action: RecaptchaAction) => Promise<string | null>;
}

/**
 * React hook for reCAPTCHA v3 integration
 * Automatically loads the script and provides execution function
 */
export function useRecaptcha(): UseRecaptchaReturn {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip if no site key configured
    if (!RECAPTCHA_SITE_KEY) {
      setIsLoading(false);
      setIsReady(true); // Allow forms to work without captcha in dev
      return;
    }

    loadRecaptchaScript()
      .then(() => {
        setIsReady(true);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load reCAPTCHA:', err);
        setError(err.message);
        setIsLoading(false);
        // Still set ready to true to not block forms if captcha fails to load
        setIsReady(true);
      });
  }, []);

  const execute = useCallback(async (action: RecaptchaAction): Promise<string | null> => {
    if (!RECAPTCHA_SITE_KEY) {
      return null; // Skip captcha if not configured
    }

    if (!isReady) {
      console.warn('reCAPTCHA not ready yet');
      return null;
    }

    return executeRecaptcha(action);
  }, [isReady]);

  return {
    isReady,
    isLoading,
    error,
    executeRecaptcha: execute
  };
}
