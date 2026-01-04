import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32;
const KEY_LENGTH = 32; // 256 bits
const ITERATIONS = 100000;

export interface EncryptionResult {
  encryptedData: Buffer;
  iv: string; // Base64 encoded
  authTag: string; // Base64 encoded
  salt?: string; // Base64 encoded (only if password-derived)
}

export interface DecryptionParams {
  encryptedData: Buffer;
  iv: string;
  authTag: string;
  salt?: string;
}

// Generate a random encryption key
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('base64');
}

// Derive encryption key from password using PBKDF2
export function deriveKeyFromPassword(password: string, salt?: string): { key: Buffer; salt: string } {
  const saltBuffer = salt ? Buffer.from(salt, 'base64') : crypto.randomBytes(SALT_LENGTH);

  const key = crypto.pbkdf2Sync(
    password,
    saltBuffer,
    ITERATIONS,
    KEY_LENGTH,
    'sha256'
  );

  return {
    key,
    salt: saltBuffer.toString('base64'),
  };
}

// Encrypt data using AES-256-GCM
export function encryptData(
  data: Buffer,
  key: Buffer | string,
  password?: string
): EncryptionResult {
  const iv = crypto.randomBytes(IV_LENGTH);

  let encryptionKey: Buffer;
  let salt: string | undefined;

  if (password) {
    // Derive key from password
    const derived = deriveKeyFromPassword(password);
    encryptionKey = derived.key;
    salt = derived.salt;
  } else if (typeof key === 'string') {
    encryptionKey = Buffer.from(key, 'base64');
  } else {
    encryptionKey = key;
  }

  const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encryptedData: encrypted,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    salt,
  };
}

// Decrypt data using AES-256-GCM
export function decryptData(
  params: DecryptionParams,
  key: Buffer | string,
  password?: string
): Buffer {
  const { encryptedData, iv, authTag, salt } = params;

  let decryptionKey: Buffer;

  if (password) {
    if (!salt) {
      throw new Error('Salt is required for password-based decryption');
    }
    const derived = deriveKeyFromPassword(password, salt);
    decryptionKey = derived.key;
  } else if (typeof key === 'string') {
    decryptionKey = Buffer.from(key, 'base64');
  } else {
    decryptionKey = key;
  }

  const ivBuffer = Buffer.from(iv, 'base64');
  const authTagBuffer = Buffer.from(authTag, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, decryptionKey, ivBuffer, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  decipher.setAuthTag(authTagBuffer);

  const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

  return decrypted;
}

// Encrypt a file with streaming support (for large files)
export async function encryptFile(
  inputBuffer: Buffer,
  password?: string,
  existingKey?: string
): Promise<{
  encryptedBuffer: Buffer;
  metadata: {
    iv: string;
    authTag: string;
    salt?: string;
    keyHash?: string; // Hash of the key for verification
  };
}> {
  const key = existingKey || generateEncryptionKey();

  const result = encryptData(inputBuffer, key, password);

  // Create a combined buffer with metadata header
  // Format: [IV (12 bytes)][AuthTag (16 bytes)][Salt (32 bytes, optional)][Encrypted Data]
  const metadataBuffers: Buffer[] = [
    Buffer.from(result.iv, 'base64'),
    Buffer.from(result.authTag, 'base64'),
  ];

  if (result.salt) {
    metadataBuffers.push(Buffer.from(result.salt, 'base64'));
  }

  return {
    encryptedBuffer: result.encryptedData,
    metadata: {
      iv: result.iv,
      authTag: result.authTag,
      salt: result.salt,
      keyHash: password ? undefined : crypto.createHash('sha256').update(key).digest('hex').substring(0, 16),
    },
  };
}

// Decrypt a file
export async function decryptFile(
  encryptedBuffer: Buffer,
  metadata: {
    iv: string;
    authTag: string;
    salt?: string;
  },
  password?: string,
  key?: string
): Promise<Buffer> {
  return decryptData(
    {
      encryptedData: encryptedBuffer,
      iv: metadata.iv,
      authTag: metadata.authTag,
      salt: metadata.salt,
    },
    key || '',
    password
  );
}

// Verify if a password matches the encryption
export function verifyEncryptionPassword(
  sampleEncryptedData: Buffer,
  metadata: {
    iv: string;
    authTag: string;
    salt: string;
  },
  password: string
): boolean {
  try {
    decryptData(
      {
        encryptedData: sampleEncryptedData,
        iv: metadata.iv,
        authTag: metadata.authTag,
        salt: metadata.salt,
      },
      '',
      password
    );
    return true;
  } catch {
    return false;
  }
}

// Generate a secure encryption key and return it in a format suitable for sharing
export function generateShareableKey(): {
  key: string;
  keyId: string;
} {
  const key = generateEncryptionKey();
  const keyId = crypto.createHash('sha256').update(key).digest('hex').substring(0, 8);

  return { key, keyId };
}

// Encryption metadata interface for storage
export interface EncryptionMetadata {
  isEncrypted: boolean;
  algorithm: string;
  iv: string;
  authTag: string;
  salt?: string;
  keyId?: string;
  encryptedAt: Date;
}

// Create encryption metadata object
export function createEncryptionMetadata(
  result: EncryptionResult,
  keyId?: string
): EncryptionMetadata {
  return {
    isEncrypted: true,
    algorithm: ALGORITHM,
    iv: result.iv,
    authTag: result.authTag,
    salt: result.salt,
    keyId,
    encryptedAt: new Date(),
  };
}

// ============================================
// TOTP Secret Encryption (Environment Key Based)
// ============================================

/**
 * Get TOTP encryption key from environment variable
 * In production, TOTP_ENCRYPTION_KEY must be set (64 hex chars = 32 bytes)
 */
function getTotpEncryptionKey(): Buffer {
  const keyHex = process.env.TOTP_ENCRYPTION_KEY;

  if (!keyHex) {
    // In development, use a deterministic fallback key (NOT for production)
    if (process.env.NODE_ENV !== 'production') {
      console.warn('TOTP_ENCRYPTION_KEY not set, using development fallback');
      return crypto.createHash('sha256').update('dev-only-totp-key-not-for-prod').digest();
    }
    throw new Error('TOTP_ENCRYPTION_KEY environment variable is required in production');
  }

  // Key should be 64 hex characters (32 bytes)
  if (keyHex.length !== 64) {
    throw new Error('TOTP_ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
  }

  return Buffer.from(keyHex, 'hex');
}

/**
 * Encrypt TOTP secret using AES-256-GCM with environment key
 * Returns base64-encoded string containing: IV + encrypted data + auth tag
 */
export function encryptTotpSecret(plainSecret: string): string {
  const key = getTotpEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(plainSecret, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Combine IV + encrypted + authTag
  const combined = Buffer.concat([iv, encrypted, authTag]);

  return combined.toString('base64');
}

/**
 * Decrypt TOTP secret that was encrypted with encryptTotpSecret()
 * Expects base64-encoded string containing: IV + encrypted data + auth tag
 */
export function decryptTotpSecret(ciphertext: string): string {
  const key = getTotpEncryptionKey();
  const combined = Buffer.from(ciphertext, 'base64');

  // Extract components
  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(combined.length - AUTH_TAG_LENGTH);
  const encrypted = combined.subarray(IV_LENGTH, combined.length - AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

/**
 * Check if a TOTP secret appears to be encrypted
 * Used to detect if data needs decryption or is stored in legacy plaintext format
 */
export function isTotpSecretEncrypted(data: string): boolean {
  // Plaintext TOTP secrets are base32 encoded (uppercase letters A-Z and digits 2-7)
  // Encrypted secrets are base64 encoded with mixed case and more characters

  // Check if it looks like base32 (plaintext TOTP secret)
  if (/^[A-Z2-7]+$/.test(data)) {
    return false; // This is a plaintext base32 TOTP secret
  }

  // Minimum length for encrypted: IV (12) + at least 1 byte + tag (16) = 29 bytes
  // In base64: ceil(29 * 4/3) = 39 characters
  if (data.length < 39) return false;

  // Check if it's valid base64
  try {
    const decoded = Buffer.from(data, 'base64');
    return decoded.length >= IV_LENGTH + AUTH_TAG_LENGTH + 1;
  } catch {
    return false;
  }
}

/**
 * Generate a new random TOTP encryption key (for setup)
 * Returns 64 hex characters suitable for TOTP_ENCRYPTION_KEY env var
 */
export function generateTotpEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}
