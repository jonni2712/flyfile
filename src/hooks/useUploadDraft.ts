'use client';

import { useEffect, useRef } from 'react';

const STORAGE_KEY = 'flyfile:upload-draft';
const DEBOUNCE_MS = 500;

export interface UploadDraft {
  title: string;
  message: string;
  recipientEmail: string;
  senderEmail: string;
}

/**
 * Persists upload form fields to localStorage with debounce.
 * Returns the initial draft (if any) and a clearDraft() function
 * to call after a successful upload.
 *
 * Note: only serializable form fields are persisted — File objects
 * are excluded by design (they would need IndexedDB and break on reload).
 */
export function useUploadDraft(values: UploadDraft) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const isEmpty =
      !values.title &&
      !values.message &&
      !values.recipientEmail &&
      !values.senderEmail;

    if (isEmpty) return;

    debounceRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
      } catch {
        // localStorage may be full or disabled (e.g., private mode)
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [values]);
}

/**
 * Read the saved draft (call once at component mount).
 * Returns null if no draft exists or parsing fails.
 */
export function loadUploadDraft(): UploadDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UploadDraft>;
    return {
      title: parsed.title || '',
      message: parsed.message || '',
      recipientEmail: parsed.recipientEmail || '',
      senderEmail: parsed.senderEmail || '',
    };
  } catch {
    return null;
  }
}

/**
 * Clear the saved draft. Call after a successful upload.
 */
export function clearUploadDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
