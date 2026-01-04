import crypto from 'crypto';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { encryptTotpSecret, decryptTotpSecret, isTotpSecretEncrypted } from './encryption';

// TOTP Configuration
const TOTP_PERIOD = 30; // seconds
const TOTP_DIGITS = 6;
const TOTP_ALGORITHM = 'sha1';
const BACKUP_CODES_COUNT = 10;

// Base32 encoding/decoding for secret
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(buffer: Buffer): string {
  let bits = '';
  for (const byte of buffer) {
    bits += byte.toString(2).padStart(8, '0');
  }

  let result = '';
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, '0');
    const index = parseInt(chunk, 2);
    result += BASE32_ALPHABET[index];
  }

  return result;
}

export function base32Decode(str: string): Buffer {
  let bits = '';
  for (const char of str.toUpperCase()) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) continue;
    bits += index.toString(2).padStart(5, '0');
  }

  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }

  return Buffer.from(bytes);
}

// Generate a random TOTP secret
export function generateTotpSecret(): string {
  const buffer = crypto.randomBytes(20);
  return base32Encode(buffer);
}

// Generate HMAC-based OTP
function hmacOtp(secret: Buffer, counter: number): string {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter));

  const hmac = crypto.createHmac(TOTP_ALGORITHM, secret);
  hmac.update(counterBuffer);
  const digest = hmac.digest();

  // Dynamic truncation
  const offset = digest[digest.length - 1] & 0x0f;
  const code =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const otp = (code % Math.pow(10, TOTP_DIGITS)).toString();
  return otp.padStart(TOTP_DIGITS, '0');
}

// Generate current TOTP
export function generateTotp(secret: string, time?: number): string {
  const secretBuffer = base32Decode(secret);
  const counter = Math.floor((time || Date.now() / 1000) / TOTP_PERIOD);
  return hmacOtp(secretBuffer, counter);
}

// Verify TOTP with time window
export function verifyTotp(secret: string, token: string, window: number = 1): boolean {
  const secretBuffer = base32Decode(secret);
  const now = Math.floor(Date.now() / 1000);
  const counter = Math.floor(now / TOTP_PERIOD);

  // Check current and adjacent time windows
  for (let i = -window; i <= window; i++) {
    const expected = hmacOtp(secretBuffer, counter + i);
    if (expected === token) {
      return true;
    }
  }

  return false;
}

// Generate TOTP URI for QR code
export function generateTotpUri(
  secret: string,
  email: string,
  issuer: string = 'FlyFile'
): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedEmail = encodeURIComponent(email);
  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=${TOTP_ALGORITHM.toUpperCase()}&digits=${TOTP_DIGITS}&period=${TOTP_PERIOD}`;
}

// Generate backup codes
export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < BACKUP_CODES_COUNT; i++) {
    // Generate 8-character alphanumeric code
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
}

// Hash backup codes for storage
export function hashBackupCodes(codes: string[]): string[] {
  return codes.map((code) =>
    crypto.createHash('sha256').update(code.replace('-', '').toUpperCase()).digest('hex')
  );
}

// Verify backup code
export function verifyBackupCode(code: string, hashedCodes: string[]): number {
  const hashedInput = crypto
    .createHash('sha256')
    .update(code.replace('-', '').toUpperCase())
    .digest('hex');

  return hashedCodes.findIndex((hashed) => hashed === hashedInput);
}

// 2FA status interface
export interface TwoFactorStatus {
  isEnabled: boolean;
  secret?: string;
  backupCodesRemaining?: number;
  enabledAt?: Date;
}

// Enable 2FA for user
export async function enable2FA(
  userId: string,
  secret: string,
  backupCodes: string[]
): Promise<boolean> {
  try {
    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(userId);
    const hashedCodes = hashBackupCodes(backupCodes);

    // SECURITY: Encrypt the TOTP secret before storing in database
    const encryptedSecret = encryptTotpSecret(secret);

    await userRef.update({
      twoFactorEnabled: true,
      twoFactorSecret: encryptedSecret,
      twoFactorBackupCodes: hashedCodes,
      twoFactorEnabledAt: Timestamp.now(),
    });

    return true;
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    return false;
  }
}

// Disable 2FA for user
export async function disable2FA(userId: string): Promise<boolean> {
  try {
    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(userId);

    await userRef.update({
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: null,
      twoFactorEnabledAt: null,
    });

    return true;
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return false;
  }
}

// Get 2FA status for user
export async function get2FAStatus(userId: string): Promise<TwoFactorStatus> {
  try {
    const db = getAdminFirestore();
    const userSnap = await db.collection('users').doc(userId).get();

    if (!userSnap.exists) {
      return { isEnabled: false };
    }

    const data = userSnap.data();

    return {
      isEnabled: !!data?.twoFactorEnabled,
      backupCodesRemaining: data?.twoFactorBackupCodes?.length || 0,
      enabledAt: data?.twoFactorEnabledAt?.toDate(),
    };
  } catch (error) {
    console.error('Error getting 2FA status:', error);
    return { isEnabled: false };
  }
}

// Verify 2FA token (TOTP or backup code)
export async function verify2FA(
  userId: string,
  token: string
): Promise<{ valid: boolean; usedBackupCode?: boolean }> {
  try {
    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return { valid: false };
    }

    const data = userSnap.data();

    if (!data?.twoFactorEnabled || !data?.twoFactorSecret) {
      return { valid: false };
    }

    // SECURITY: Decrypt the secret if it's encrypted
    // Also handle legacy plaintext secrets for backwards compatibility
    let secret: string;
    if (isTotpSecretEncrypted(data.twoFactorSecret)) {
      secret = decryptTotpSecret(data.twoFactorSecret);
    } else {
      // Legacy plaintext secret - should migrate these over time
      secret = data.twoFactorSecret;
      console.warn(`User ${userId} has legacy plaintext TOTP secret - consider migration`);
    }

    // First try TOTP
    if (verifyTotp(secret, token)) {
      return { valid: true };
    }

    // Then try backup codes
    if (data.twoFactorBackupCodes) {
      const codeIndex = verifyBackupCode(token, data.twoFactorBackupCodes);
      if (codeIndex !== -1) {
        // Remove used backup code
        const updatedCodes = [...data.twoFactorBackupCodes];
        updatedCodes.splice(codeIndex, 1);

        await userRef.update({
          twoFactorBackupCodes: updatedCodes,
        });

        return { valid: true, usedBackupCode: true };
      }
    }

    return { valid: false };
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    return { valid: false };
  }
}

// Regenerate backup codes
export async function regenerateBackupCodes(userId: string): Promise<string[] | null> {
  try {
    const db = getAdminFirestore();
    const newCodes = generateBackupCodes();
    const hashedCodes = hashBackupCodes(newCodes);

    await db.collection('users').doc(userId).update({
      twoFactorBackupCodes: hashedCodes,
    });

    return newCodes;
  } catch (error) {
    console.error('Error regenerating backup codes:', error);
    return null;
  }
}
