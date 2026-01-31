/**
 * ============================================================================
 * FlyFile - Storage Abstraction Layer
 *
 * Supports multiple S3-compatible storage providers:
 * - MinIO (self-hosted)
 * - Cloudflare R2
 * - AWS S3
 * - Any S3-compatible storage
 *
 * This project is developed with vibe coding using Claude Code by Anthropic
 * https://github.com/anthropics/claude-code
 * ============================================================================
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Storage provider types
export type StorageProvider = 'minio' | 'r2' | 's3' | 'custom';

// Storage configuration interface
export interface StorageConfig {
  provider: StorageProvider;
  endpoint: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
  region: string;
  publicUrl?: string;
  forcePathStyle?: boolean;
}

// Get storage configuration from environment
function getStorageConfig(): StorageConfig {
  const provider = (process.env.STORAGE_PROVIDER || 'r2') as StorageProvider;

  // Legacy R2 support - check for R2-specific environment variables first
  if (provider === 'r2' || process.env.R2_ACCOUNT_ID) {
    const accountId = process.env.R2_ACCOUNT_ID;
    if (!accountId) {
      throw new Error('R2_ACCOUNT_ID is required for Cloudflare R2 storage');
    }

    return {
      provider: 'r2',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      accessKey: process.env.R2_ACCESS_KEY_ID!,
      secretKey: process.env.R2_SECRET_ACCESS_KEY!,
      bucket: process.env.R2_BUCKET_NAME!,
      region: 'auto',
      publicUrl: process.env.R2_PUBLIC_URL,
      forcePathStyle: false,
    };
  }

  // New unified storage configuration
  return {
    provider,
    endpoint: process.env.STORAGE_ENDPOINT!,
    accessKey: process.env.STORAGE_ACCESS_KEY!,
    secretKey: process.env.STORAGE_SECRET_KEY!,
    bucket: process.env.STORAGE_BUCKET!,
    region: process.env.STORAGE_REGION || 'us-east-1',
    publicUrl: process.env.STORAGE_PUBLIC_URL,
    // MinIO and most self-hosted solutions require path-style URLs
    forcePathStyle: provider === 'minio' || provider === 'custom' || process.env.STORAGE_FORCE_PATH_STYLE === 'true',
  };
}

// Singleton storage client
let storageClient: S3Client | null = null;
let storageConfig: StorageConfig | null = null;

// Initialize storage client
function getStorageClient(): S3Client {
  if (!storageClient) {
    storageConfig = getStorageConfig();

    storageClient = new S3Client({
      region: storageConfig.region,
      endpoint: storageConfig.endpoint,
      credentials: {
        accessKeyId: storageConfig.accessKey,
        secretAccessKey: storageConfig.secretKey,
      },
      forcePathStyle: storageConfig.forcePathStyle,
    });
  }

  return storageClient;
}

// Get current storage config
function getConfig(): StorageConfig {
  if (!storageConfig) {
    storageConfig = getStorageConfig();
  }
  return storageConfig;
}

/**
 * Generate presigned URL for file upload
 */
export async function getUploadUrl(key: string, contentType: string, expiresIn = 3600): Promise<string> {
  const client = getStorageClient();
  const config = getConfig();

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(client, command, { expiresIn });
}

/**
 * Generate presigned URL for file download
 */
export async function getDownloadUrl(key: string, expiresIn = 3600, fileName?: string): Promise<string> {
  const client = getStorageClient();
  const config = getConfig();

  // Extract filename from key if not provided
  const downloadFileName = fileName || key.split('/').pop() || 'download';

  const command = new GetObjectCommand({
    Bucket: config.bucket,
    Key: key,
    // Force download instead of opening in browser
    ResponseContentDisposition: `attachment; filename="${encodeURIComponent(downloadFileName)}"`,
  });

  return getSignedUrl(client, command, { expiresIn });
}

/**
 * Delete file from storage
 */
export async function deleteFile(key: string): Promise<void> {
  const client = getStorageClient();
  const config = getConfig();

  const command = new DeleteObjectCommand({
    Bucket: config.bucket,
    Key: key,
  });

  await client.send(command);
}

/**
 * Check if file exists in storage
 */
export async function fileExists(key: string): Promise<boolean> {
  const client = getStorageClient();
  const config = getConfig();

  try {
    const command = new HeadObjectCommand({
      Bucket: config.bucket,
      Key: key,
    });
    await client.send(command);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate unique file key
 */
export function generateFileKey(userId: string, fileName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${userId}/${timestamp}-${randomString}-${sanitizedFileName}`;
}

/**
 * Get public URL for a file (if public access is configured)
 */
export function getPublicUrl(key: string): string | null {
  const config = getConfig();

  if (!config.publicUrl) {
    return null;
  }

  // Ensure no double slashes
  const baseUrl = config.publicUrl.replace(/\/$/, '');
  return `${baseUrl}/${key}`;
}

/**
 * Get storage provider info (for debugging/admin)
 */
export function getStorageInfo(): { provider: StorageProvider; bucket: string; endpoint: string } {
  const config = getConfig();
  return {
    provider: config.provider,
    bucket: config.bucket,
    endpoint: config.endpoint,
  };
}

// ============================================================================
// Legacy exports for backward compatibility with r2.ts
// These ensure existing code continues to work without modifications
// ============================================================================

// Re-export the storage client as r2Client for backward compatibility
export const r2Client = {
  get client() {
    return getStorageClient();
  }
};

// Export all functions with their original names from r2.ts
export { getStorageClient as getR2Client };
