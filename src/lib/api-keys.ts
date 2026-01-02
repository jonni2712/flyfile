import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc, Timestamp, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import crypto from 'crypto';

export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  keyPrefix: string; // First 8 chars for display (e.g., "fly_xxxx")
  keyHash: string; // SHA-256 hash of the full key
  permissions: ('read' | 'write' | 'delete')[];
  lastUsedAt?: Date;
  usageCount: number;
  rateLimit: number; // requests per minute
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

// Generate a new API key
export function generateApiKey(): { key: string; prefix: string; hash: string } {
  // Generate 32 random bytes and encode as base64
  const randomBytes = crypto.randomBytes(32);
  const key = `fly_${randomBytes.toString('base64url')}`;
  const prefix = key.substring(0, 12); // "fly_" + 8 chars
  const hash = crypto.createHash('sha256').update(key).digest('hex');

  return { key, prefix, hash };
}

// Hash an API key for comparison
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

// Create a new API key for a user
export async function createApiKey(params: {
  userId: string;
  name: string;
  permissions?: ('read' | 'write' | 'delete')[];
  expiresInDays?: number;
}): Promise<{ apiKey: ApiKey; fullKey: string }> {
  const { key, prefix, hash } = generateApiKey();

  const apiKeyData = {
    userId: params.userId,
    name: params.name,
    keyPrefix: prefix,
    keyHash: hash,
    permissions: params.permissions || ['read', 'write'],
    usageCount: 0,
    rateLimit: 60, // 60 requests per minute default
    createdAt: Timestamp.now(),
    expiresAt: params.expiresInDays
      ? Timestamp.fromDate(new Date(Date.now() + params.expiresInDays * 24 * 60 * 60 * 1000))
      : null,
    isActive: true,
  };

  const docRef = await addDoc(collection(db, 'apiKeys'), apiKeyData);

  const apiKey: ApiKey = {
    id: docRef.id,
    ...apiKeyData,
    createdAt: apiKeyData.createdAt.toDate(),
    expiresAt: apiKeyData.expiresAt?.toDate(),
  };

  return { apiKey, fullKey: key };
}

// Get all API keys for a user (without the actual key)
export async function getUserApiKeys(userId: string): Promise<ApiKey[]> {
  const apiKeysRef = collection(db, 'apiKeys');
  const q = query(apiKeysRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);

  const keys: ApiKey[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    keys.push({
      id: docSnap.id,
      userId: data.userId,
      name: data.name,
      keyPrefix: data.keyPrefix,
      keyHash: data.keyHash,
      permissions: data.permissions,
      lastUsedAt: data.lastUsedAt?.toDate(),
      usageCount: data.usageCount,
      rateLimit: data.rateLimit,
      createdAt: data.createdAt.toDate(),
      expiresAt: data.expiresAt?.toDate(),
      isActive: data.isActive,
    });
  });

  return keys.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// Validate an API key and return the associated user
export async function validateApiKey(key: string): Promise<{
  valid: boolean;
  userId?: string;
  apiKeyId?: string;
  permissions?: ('read' | 'write' | 'delete')[];
  error?: string;
}> {
  if (!key || !key.startsWith('fly_')) {
    return { valid: false, error: 'Invalid API key format' };
  }

  const hash = hashApiKey(key);

  const apiKeysRef = collection(db, 'apiKeys');
  const q = query(apiKeysRef, where('keyHash', '==', hash));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return { valid: false, error: 'API key not found' };
  }

  const docSnap = snapshot.docs[0];
  const data = docSnap.data();

  // Check if key is active
  if (!data.isActive) {
    return { valid: false, error: 'API key is inactive' };
  }

  // Check expiration
  if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
    return { valid: false, error: 'API key has expired' };
  }

  // Update last used timestamp and usage count
  await updateDoc(doc(db, 'apiKeys', docSnap.id), {
    lastUsedAt: Timestamp.now(),
    usageCount: (data.usageCount || 0) + 1,
  });

  return {
    valid: true,
    userId: data.userId,
    apiKeyId: docSnap.id,
    permissions: data.permissions,
  };
}

// Delete an API key
export async function deleteApiKey(keyId: string, userId: string): Promise<boolean> {
  const keyRef = doc(db, 'apiKeys', keyId);
  const keySnap = await getDoc(keyRef);

  if (!keySnap.exists()) {
    return false;
  }

  // Verify ownership
  if (keySnap.data().userId !== userId) {
    return false;
  }

  await deleteDoc(keyRef);
  return true;
}

// Toggle API key active status
export async function toggleApiKeyStatus(keyId: string, userId: string): Promise<boolean> {
  const keyRef = doc(db, 'apiKeys', keyId);
  const keySnap = await getDoc(keyRef);

  if (!keySnap.exists()) {
    return false;
  }

  const data = keySnap.data();

  // Verify ownership
  if (data.userId !== userId) {
    return false;
  }

  await updateDoc(keyRef, {
    isActive: !data.isActive,
  });

  return true;
}

// Check if user can create API keys (Business plan only)
export async function canUseApiKeys(userId: string): Promise<boolean> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return false;
  }

  const userData = userSnap.data();
  // Only Pro and Business plans can use API keys
  return ['pro', 'business'].includes(userData.plan);
}
