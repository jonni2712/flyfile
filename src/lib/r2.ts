import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Cloudflare R2 configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;

// R2 uses S3-compatible API
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// Generate presigned URL for upload (client-side upload)
export async function getUploadUrl(key: string, contentType: string, expiresIn = 3600) {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(r2Client, command, { expiresIn });
}

// Generate presigned URL for download
export async function getDownloadUrl(key: string, expiresIn = 3600, fileName?: string) {
  // Extract filename from key if not provided
  const downloadFileName = fileName || key.split('/').pop() || 'download';

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    // Force download instead of opening in browser
    ResponseContentDisposition: `attachment; filename="${encodeURIComponent(downloadFileName)}"`,
  });

  return getSignedUrl(r2Client, command, { expiresIn });
}

// Delete file from R2
export async function deleteFile(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  return r2Client.send(command);
}

// Generate unique file key
export function generateFileKey(userId: string, fileName: string) {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${userId}/${timestamp}-${randomString}-${sanitizedFileName}`;
}
