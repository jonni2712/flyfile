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

export interface BillingInfo {
  userType?: 'individual' | 'business';
  firstName?: string;
  lastName?: string;
  companyName?: string;
  vatNumber?: string;
  taxCode?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  username?: string;
  displayName: string;
  photoURL?: string;
  avatarPath?: string;
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
  billing?: BillingInfo;
  // Beta tester fields
  isBetaTester?: boolean;
  betaTesterCode?: string;
  betaTesterSince?: Date;
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

// Transfer types
export interface Transfer {
  id: string;
  transferId: string;      // UUID pubblico per URL
  userId?: string;
  anonymousUserId?: string;
  title: string;
  message?: string;
  recipientEmail?: string;
  senderName?: string;
  password?: string;       // Hashed
  deliveryMethod: 'email' | 'link';
  status: 'pending' | 'active' | 'expired' | 'deleted';
  totalSize: number;
  fileCount: number;
  downloadCount: number;
  maxDownloads?: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  files?: TransferFile[];
}

export interface TransferFile {
  id: string;
  transferId: string;
  originalName: string;
  storedName: string;
  path: string;           // R2 key
  size: number;
  mimeType: string;
  downloadCount: number;
  createdAt: Date;
}

export interface TransferDownload {
  id: string;
  transferId: string;
  fileId?: string;
  ipAddress: string;      // Anonimizzato per GDPR
  userAgent?: string;
  country?: string;
  downloadedAt: Date;
}

export interface TransferUploadData {
  title: string;
  message?: string;
  recipientEmail?: string;
  senderName?: string;
  password?: string;
  deliveryMethod: 'email' | 'link';
  expiryDays?: number;
  email?: string;         // Per utenti anonimi
}

// Team types
export interface Team {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  memberCount: number;
  storageUsed: number;
  maxMembers: number;
  createdAt: Date;
  updatedAt: Date;
  members?: TeamMember[];
  pendingInvitations?: TeamInvitation[];
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: 'owner' | 'member';
  storageUsed: number;
  joinedAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    photoURL?: string;
  };
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  email: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: Date;
  createdAt: Date;
}

// Anonymous user types
export interface AnonymousUser {
  id: string;
  email: string;
  verifiedAt?: Date;
  transferCount: number;
  createdAt: Date;
}

// Upload response types
export interface UploadResponse {
  success: boolean;
  transferId?: string;
  downloadUrl?: string;
  message?: string;
  error?: string;
  requiresVerification?: boolean;
  tempId?: string;
  deliveryMethod?: 'email' | 'link';
  recipientEmail?: string;
  expiresAt?: string;
}

// Plan limits helper
export interface PlanLimits {
  storageLimit: number;
  maxTransfers: number;
  retentionDays: number;
  maxFilesPerTransfer: number;
  passwordProtection: boolean;
  customExpiry: boolean;
  teamAccess: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
  canDelete: boolean;
}

export const getPlanLimits = (plan: Plan['id']): PlanLimits => {
  const limits: Record<Plan['id'], PlanLimits> = {
    free: {
      storageLimit: 5 * 1024 * 1024 * 1024,
      maxTransfers: 10,
      retentionDays: 5,
      maxFilesPerTransfer: 10,
      passwordProtection: false,
      customExpiry: false,
      teamAccess: false,
      apiAccess: false,
      prioritySupport: false,
      canDelete: false,
    },
    starter: {
      storageLimit: 300 * 1024 * 1024 * 1024,
      maxTransfers: 15,
      retentionDays: 7,
      maxFilesPerTransfer: 15,
      passwordProtection: false,
      customExpiry: false,
      teamAccess: false,
      apiAccess: false,
      prioritySupport: false,
      canDelete: false,
    },
    pro: {
      storageLimit: 500 * 1024 * 1024 * 1024,
      maxTransfers: 30,
      retentionDays: 30,
      maxFilesPerTransfer: 30,
      passwordProtection: true,
      customExpiry: true,
      teamAccess: false,
      apiAccess: true,
      prioritySupport: false,
      canDelete: true,
    },
    business: {
      storageLimit: -1,
      maxTransfers: -1,
      retentionDays: 365,
      maxFilesPerTransfer: -1,
      passwordProtection: true,
      customExpiry: true,
      teamAccess: true,
      apiAccess: true,
      prioritySupport: true,
      canDelete: true,
    },
  };
  return limits[plan];
};

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
