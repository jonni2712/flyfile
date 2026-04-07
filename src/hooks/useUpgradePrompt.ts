'use client';

import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'flyfile:upgrade-prompt';
const COOLDOWN_DAYS = 14;

interface PromptState {
  dismissedAt: number | null; // epoch ms
  uploadCount: number;
  countResetAt: number; // epoch ms (start of 7-day rolling window)
}

const DEFAULT_STATE: PromptState = {
  dismissedAt: null,
  uploadCount: 0,
  countResetAt: Date.now(),
};

function readState(): PromptState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

function writeState(state: PromptState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

interface Options {
  /** User's current plan id — `'free'` and `'starter'` get prompted. */
  plan: string | undefined;
  /** Storage used in bytes (from userProfile). */
  storageUsed: number | undefined;
  /** Storage limit in bytes (-1 for unlimited). */
  storageLimit: number | undefined;
}

interface ReturnShape {
  /** Whether the banner should be displayed right now. */
  shouldShow: boolean;
  /** Why the banner is showing — used to drive copy. */
  reason: 'storage_high' | 'frequent_uploader' | null;
  /** Call when user dismisses the banner. Cooldown starts. */
  dismiss: () => void;
  /** Call after a successful upload to increment the rolling counter. */
  recordUpload: () => void;
}

/**
 * Smart upgrade prompt logic — only surfaces the banner in the
 * highest-intent moments (storage near limit OR power user).
 *
 * Rules:
 * - Never shown to business users.
 * - Never shown if dismissed within COOLDOWN_DAYS.
 * - `storage_high`: storageUsed / storageLimit >= 50%
 * - `frequent_uploader`: 3+ uploads completed in last 7 days
 */
export function useUpgradePrompt({ plan, storageUsed, storageLimit }: Options): ReturnShape {
  const [state, setState] = useState<PromptState>(DEFAULT_STATE);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setState(readState());
  }, []);

  const dismiss = useCallback(() => {
    const next = { ...readState(), dismissedAt: Date.now() };
    writeState(next);
    setState(next);
  }, []);

  const recordUpload = useCallback(() => {
    const current = readState();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const isWindowExpired = Date.now() - current.countResetAt > sevenDaysMs;
    const next: PromptState = {
      ...current,
      uploadCount: isWindowExpired ? 1 : current.uploadCount + 1,
      countResetAt: isWindowExpired ? Date.now() : current.countResetAt,
    };
    writeState(next);
    setState(next);
  }, []);

  // Decision logic
  if (!plan || plan === 'business') {
    return { shouldShow: false, reason: null, dismiss, recordUpload };
  }

  // Cooldown check
  if (state.dismissedAt) {
    const cooldownMs = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
    if (Date.now() - state.dismissedAt < cooldownMs) {
      return { shouldShow: false, reason: null, dismiss, recordUpload };
    }
  }

  // Storage trigger
  if (storageLimit && storageLimit > 0 && storageUsed !== undefined) {
    const ratio = storageUsed / storageLimit;
    if (ratio >= 0.5) {
      return { shouldShow: true, reason: 'storage_high', dismiss, recordUpload };
    }
  }

  // Frequent uploader trigger
  if (state.uploadCount >= 3) {
    return { shouldShow: true, reason: 'frequent_uploader', dismiss, recordUpload };
  }

  return { shouldShow: false, reason: null, dismiss, recordUpload };
}
