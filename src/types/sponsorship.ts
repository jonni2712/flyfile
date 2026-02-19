// Sponsorship video types
export interface SponsorVideo {
  id: string;           // UUID
  r2Key: string;        // R2 storage key
  videoUrl: string;     // Presigned URL (runtime)
  linkUrl: string;      // Click-through URL
  status: 'processing' | 'ready' | 'rejected';
  uploadedAt: Date;
}

export interface Sponsorship {
  id: string;
  userId: string;
  userEmail: string;
  companyName: string;
  status: 'pending' | 'active' | 'rejected' | 'deactivated';
  videos: SponsorVideo[];  // max 3
  impressionCount: number;
  clickCount: number;
  createdAt: Date;
  updatedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  // Future paid package fields
  packageType?: 'free' | 'basic' | 'premium';
  expiresAt?: Date;
}

// Response from /api/sponsorships/active
export interface ActiveSponsorVideo {
  videoUrl: string;
  linkUrl: string;
  companyName: string;
  sponsorshipId: string;
  videoId: string;
}
