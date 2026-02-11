import { useEffect, RefObject } from 'react';

export function useFocusTrap(ref: RefObject<HTMLElement | null>, isOpen: boolean) {
  useEffect(() => {
    if (!isOpen || !ref.current) return;

    const element = ref.current;
    const focusableSelector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const previouslyFocused = document.activeElement as HTMLElement;

    // Focus first focusable element
    const focusableElements = element.querySelectorAll<HTMLElement>(focusableSelector);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusable = element.querySelectorAll<HTMLElement>(focusableSelector);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [ref, isOpen]);
}
