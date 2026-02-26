import { useState, useCallback, useRef } from 'react';

/**
 * Hook for copying text to clipboard with a temporary "copied" state.
 * @param resetDelay - ms before `copied` resets to false (default 2000)
 */
export function useCopyToClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState<boolean | string>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const copy = useCallback(
    async (text: string, id?: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(id ?? true);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), resetDelay);
      } catch {
        // Clipboard API can fail in insecure contexts — fail silently
      }
    },
    [resetDelay],
  );

  return { copied, copy } as const;
}
