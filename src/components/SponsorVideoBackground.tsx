'use client';

import { useState, useEffect } from 'react';
import type { ActiveSponsorVideo } from '@/types';

interface SponsorVideoBackgroundProps {
  onLoad?: () => void;
}

export default function SponsorVideoBackground({ onLoad }: SponsorVideoBackgroundProps) {
  const [sponsor, setSponsor] = useState<ActiveSponsorVideo | null>(null);

  useEffect(() => {
    fetch('/api/sponsorships/active')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.sponsor) {
          setSponsor(data.sponsor);
        }
      })
      .catch(() => {
        // Silently fail - no sponsor video is fine
      });
  }, []);

  if (!sponsor) return null;

  const handleClick = () => {
    // Track click fire-and-forget
    fetch('/api/sponsorships/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sponsorshipId: sponsor.sponsorshipId }),
    }).catch(() => {});

    // Open sponsor link
    if (sponsor.linkUrl) {
      window.open(sponsor.linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      {/* Sponsor Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        onLoadedData={onLoad}
      >
        <source src={sponsor.videoUrl} type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Sponsor badge - bottom right */}
      <button
        onClick={handleClick}
        className="absolute bottom-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white/90 text-xs font-medium hover:bg-black/80 transition-colors cursor-pointer"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        Sponsor: {sponsor.companyName}
      </button>
    </>
  );
}
