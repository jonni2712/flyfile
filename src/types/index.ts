// User types
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  plan: 'free' | 'starter' | 'pro' | 'business';
  storageUsed: number; // in bytes
  storageLimit: number; // in bytes
  monthlyTransfers: number;
  maxMonthlyTransfers: number;
  retentionDays: number;
  filesCount: number;
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing';
  billingCycle?: 'monthly' | 'annual';
  createdAt: Date;
  updatedAt: Date;
}

// File types
export interface FileMetadata {
  id: string;
  userId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number; // in bytes
  r2Key: string; // Key in R2 storage
  shareLink?: string;
  shareExpiry?: Date;
  isPublic: boolean;
  downloadCount: number;
  maxDownloads?: number;
  password?: string; // hashed
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface ShareSettings {
  isPublic: boolean;
  expiresAt?: Date;
  maxDownloads?: number;
  password?: string;
}

// Subscription types
export interface Plan {
  id: 'free' | 'starter' | 'pro' | 'business';
  name: string;
  priceMonthly: number; // in EUR cents
  priceAnnual: number; // in EUR cents (yearly total)
  storageLimit: number; // in bytes per month
  maxTransfers: number; // per month (-1 for unlimited)
  retentionDays: number; // file retention
  features: string[];
  stripePriceIdMonthly?: string;
  stripePriceIdAnnual?: string;
}

export const PLANS: Record<string, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    priceAnnual: 0,
    storageLimit: 5 * 1024 * 1024 * 1024, // 5 GB/mese
    maxTransfers: 10,
    retentionDays: 5,
    features: [
      'Condividi e ricevi fino a 5GB/mese',
      '10 trasferimenti al mese',
      'Conservazione 5 giorni',
      'Crittografia AES-256',
      'Dimensione file illimitata',
    ],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 600, // €6
    priceAnnual: 6000, // €60 (risparmio €12)
    storageLimit: 300 * 1024 * 1024 * 1024, // 300 GB/mese
    maxTransfers: 15,
    retentionDays: 7,
    stripePriceIdMonthly: 'price_1RiiBLRvnkGxlG3gaHbNQnvd',
    stripePriceIdAnnual: 'price_1SFgByRvnkGxlG3got46mSF5',
    features: [
      'Condividi e ricevi fino a 300GB/mese',
      '15 trasferimenti al mese',
      'Conservazione 7 giorni',
      'Dashboard avanzata',
      'Dimensione file illimitata',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 1200, // €12
    priceAnnual: 12000, // €120 (risparmio €24)
    storageLimit: 500 * 1024 * 1024 * 1024, // 500 GB/mese
    maxTransfers: 30,
    retentionDays: 30,
    stripePriceIdMonthly: 'price_1RYtiARvnkGxlG3gZUW7Kb4v',
    stripePriceIdAnnual: 'price_1SFgD4RvnkGxlG3gEnyvOLNr',
    features: [
      'Condividi e ricevi fino a 500GB/mese',
      '30 trasferimenti al mese',
      'Conservazione 30 giorni',
      'Protezione password',
      'UI personalizzabile',
      'Dimensione file illimitata',
    ],
  },
  business: {
    id: 'business',
    name: 'Business',
    priceMonthly: 2000, // €20
    priceAnnual: 20000, // €200 (risparmio €40)
    storageLimit: -1, // Illimitato
    maxTransfers: -1, // Illimitato
    retentionDays: 365, // 1 anno
    stripePriceIdMonthly: 'price_1RYtipRvnkGxlG3gXhaIzIAl',
    stripePriceIdAnnual: 'price_1SFgDkRvnkGxlG3gc3QzdSoF',
    features: [
      'Condividi e ricevi illimitato',
      'Trasferimenti illimitati',
      'Conservazione 1 anno',
      'Gestione team avanzata',
      '3 membri inclusi',
      'Support prioritario',
      'Dimensione file illimitata',
    ],
  },
};
