/**
 * Client-side encryption using Web Crypto API
 * AES-256-GCM encryption for end-to-end file security
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM

export interface EncryptedFile {
  encryptedData: ArrayBuffer;
  iv: string; // Base64 encoded
  key: string; // Base64 encoded (for storage)
}

export interface EncryptionMetadata {
  iv: string;
  key: string;
  algorithm: string;
  originalSize: number;
  encryptedSize: number;
}

/**
 * Generate a random encryption key
 */
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Export CryptoKey to base64 string for storage
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported);
}

/**
 * Import base64 key string back to CryptoKey
 */
export async function importKey(keyBase64: string): Promise<CryptoKey> {
  const keyBuffer = base64ToArrayBuffer(keyBase64);
  return await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: ALGORITHM },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate random IV (Initialization Vector)
 */
function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

/**
 * Encrypt a file using AES-256-GCM
 */
export async function encryptFile(file: File): Promise<{
  encryptedBlob: Blob;
  metadata: EncryptionMetadata;
}> {
  // Read file as ArrayBuffer
  const fileBuffer = await file.arrayBuffer();

  // Generate key and IV
  const key = await generateEncryptionKey();
  const iv = generateIV();

  // Encrypt the file
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: new Uint8Array(iv.buffer) as unknown as BufferSource,
    },
    key,
    fileBuffer
  );

  // Export key for storage
  const keyBase64 = await exportKey(key);
  const ivBase64 = arrayBufferToBase64(iv.buffer as ArrayBuffer);

  // Create encrypted blob with same mime type
  const encryptedBlob = new Blob([encryptedData], { type: 'application/octet-stream' });

  return {
    encryptedBlob,
    metadata: {
      iv: ivBase64,
      key: keyBase64,
      algorithm: ALGORITHM,
      originalSize: file.size,
      encryptedSize: encryptedData.byteLength,
    },
  };
}

/**
 * Encrypt an ArrayBuffer using AES-256-GCM
 */
export async function encryptBuffer(
  buffer: ArrayBuffer,
  existingKey?: CryptoKey
): Promise<{
  encryptedData: ArrayBuffer;
  iv: string;
  key: string;
}> {
  const key = existingKey || await generateEncryptionKey();
  const iv = generateIV();

  const encryptedData = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: new Uint8Array(iv.buffer) as unknown as BufferSource,
    },
    key,
    buffer
  );

  const keyBase64 = await exportKey(key);
  const ivBase64 = arrayBufferToBase64(iv.buffer as ArrayBuffer);

  return {
    encryptedData,
    iv: ivBase64,
    key: keyBase64,
  };
}

/**
 * Decrypt an ArrayBuffer using AES-256-GCM
 */
export async function decryptBuffer(
  encryptedData: ArrayBuffer,
  keyBase64: string,
  ivBase64: string
): Promise<ArrayBuffer> {
  const key = await importKey(keyBase64);
  const iv = base64ToArrayBuffer(ivBase64);

  const decryptedData = await crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv: new Uint8Array(iv) as unknown as BufferSource,
    },
    key,
    encryptedData
  );

  return decryptedData;
}

/**
 * Decrypt a file and return as Blob
 */
export async function decryptFile(
  encryptedBlob: Blob,
  keyBase64: string,
  ivBase64: string,
  originalMimeType: string
): Promise<Blob> {
  const encryptedBuffer = await encryptedBlob.arrayBuffer();
  const decryptedBuffer = await decryptBuffer(encryptedBuffer, keyBase64, ivBase64);

  return new Blob([decryptedBuffer], { type: originalMimeType });
}

// Utility functions for base64 conversion
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Check if Web Crypto API is available
 */
export function isEncryptionSupported(): boolean {
  return typeof crypto !== 'undefined' &&
         typeof crypto.subtle !== 'undefined' &&
         typeof crypto.subtle.encrypt === 'function';
}
