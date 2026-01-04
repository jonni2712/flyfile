import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getDownloadUrl } from '@/lib/r2';
import { checkRateLimit } from '@/lib/rate-limit';
import { decryptData } from '@/lib/encryption';
import { recordDownload } from '@/lib/analytics';

/**
 * Secure download endpoint that handles encrypted files
 * Fetches the encrypted file from R2, decrypts it, and streams to client
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'download');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { transferId, fileId, path } = body;

    if (!transferId || !fileId) {
      return NextResponse.json(
        { error: 'Missing transferId or fileId' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();

    // Get transfer document
    const transferDoc = await db.collection('transfers').doc(transferId).get();
    if (!transferDoc.exists) {
      return NextResponse.json(
        { error: 'Transfer not found' },
        { status: 404 }
      );
    }

    const transferData = transferDoc.data() || {};

    // Check if transfer is expired
    const expiresAt = transferData.expiresAt?.toDate?.();
    if (expiresAt && expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Transfer expired' },
        { status: 410 }
      );
    }

    // Get file document
    const fileDoc = await db.collection('transfers').doc(transferId).collection('files').doc(fileId).get();
    if (!fileDoc.exists) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const fileData = fileDoc.data() || {};
    const filePath = path || fileData.path || fileData.storedName;
    const fileName = fileData.originalName || 'download';
    const mimeType = fileData.mimeType || 'application/octet-stream';

    // Check if file is encrypted
    const isEncrypted = fileData.isEncrypted || transferData.isEncrypted;

    if (!isEncrypted) {
      // Not encrypted - return presigned URL for direct download
      const downloadUrl = await getDownloadUrl(filePath, 3600, fileName);
      return NextResponse.json({ downloadUrl, fileName });
    }

    // File is encrypted - fetch, decrypt, and stream
    const encryptionKey = fileData.encryptionKey;
    const encryptionIv = fileData.encryptionIv;

    if (!encryptionKey || !encryptionIv) {
      return NextResponse.json(
        { error: 'Encryption metadata missing' },
        { status: 500 }
      );
    }

    // Get presigned URL to fetch encrypted file
    const r2Url = await getDownloadUrl(filePath);

    // Fetch encrypted file from R2
    const r2Response = await fetch(r2Url);
    if (!r2Response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch file from storage' },
        { status: 500 }
      );
    }

    const encryptedBuffer = await r2Response.arrayBuffer();

    // Decrypt the file
    let decryptedBuffer: Buffer;
    try {
      decryptedBuffer = decryptData(
        {
          encryptedData: Buffer.from(encryptedBuffer),
          iv: encryptionIv,
          authTag: fileData.encryptionAuthTag || '', // AuthTag might be included in the encrypted data
        },
        encryptionKey
      );
    } catch (decryptError) {
      console.error('Decryption error:', decryptError);
      return NextResponse.json(
        { error: 'Failed to decrypt file' },
        { status: 500 }
      );
    }

    // Update download count
    await db.collection('transfers').doc(transferId).collection('files').doc(fileId).update({
      downloadCount: FieldValue.increment(1),
    });
    await db.collection('transfers').doc(transferId).update({
      downloadCount: FieldValue.increment(1),
    });

    // Record analytics
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';
    const userAgent = request.headers.get('user-agent');
    const country = request.headers.get('cf-ipcountry') || undefined;

    recordDownload({
      transferId,
      fileId,
      ip,
      userAgent,
      country,
      downloadType: 'secure',
    }).catch(err => console.error('Analytics error:', err));

    // Return decrypted file (convert Buffer to Uint8Array for Response)
    return new Response(new Uint8Array(decryptedBuffer), {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Content-Length': decryptedBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Secure download error:', error);
    return NextResponse.json(
      { error: 'Download failed' },
      { status: 500 }
    );
  }
}
