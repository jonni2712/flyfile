'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const router = useRouter();

  useEffect(() => {
    // Navigate to home then open the pricing panel
    router.replace('/');
    // Small delay to ensure Navbar is mounted before dispatching
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('openPricing'));
    }, 100);
    return () => clearTimeout(timer);
  }, [router]);

  return null;
}
