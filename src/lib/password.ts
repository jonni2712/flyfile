import bcrypt from 'bcryptjs';

// Cost factor for bcrypt (10-12 recommended for production)
const SALT_ROUNDS = 12;

// Legacy SHA-256 hashing (for migration purposes)
async function legacyHashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = process.env.PASSWORD_SALT || 'flyfile-salt';
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash a password using bcrypt
 * @param password - Plain text password to hash
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 * Supports both bcrypt (new) and SHA-256 (legacy) hashes
 * @param password - Plain text password to verify
 * @param hash - Stored password hash
 * @returns True if password matches
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Check if it's a bcrypt hash (starts with $2a$, $2b$, or $2y$)
  if (hash.startsWith('$2')) {
    return bcrypt.compare(password, hash);
  }

  // Legacy SHA-256 hash (64 hex characters)
  if (hash.length === 64 && /^[a-f0-9]+$/i.test(hash)) {
    const legacyHash = await legacyHashPassword(password);
    return legacyHash === hash;
  }

  return false;
}

/**
 * Check if a hash needs to be upgraded from SHA-256 to bcrypt
 * @param hash - Stored password hash
 * @returns True if hash should be upgraded
 */
export function needsHashUpgrade(hash: string): boolean {
  // SHA-256 hashes are 64 hex characters
  return hash.length === 64 && /^[a-f0-9]+$/i.test(hash);
}

/**
 * Generate a secure random password
 * @param length - Password length (default 16)
 * @returns Random password string
 */
export function generateSecurePassword(length: number = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);

  return Array.from(randomValues)
    .map(value => charset[value % charset.length])
    .join('');
}
