import { NextRequest, NextResponse } from 'next/server';
import { getDownloadUrl } from '@/lib/r2';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { checkRateLimit } from '@/lib/rate-limit';
import { recordDownload } from '@/lib/analytics';
import { verifyAuth } from '@/lib/auth-utils';

// GET method for single file download via query params
export async function GET(request: NextRequest) {
  try {
    // Rate limiting: 30 requests per minute for download operations
    const rateLimitResponse = await checkRateLimit(request, 'download');
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json(
        { error: 'Missing fileId' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();

    // Get file metadata from Firestore
    const fileRef = db.collection('files').doc(fileId);
    const fileDoc = await fileRef.get();

    if (!fileDoc.exists) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const fileData = fileDoc.data() || {};

    // SECURITY: Check if file is public or user is authorized
    if (fileData.isPublic === false) {
      const authResult = await verifyAuth(request);

      // For private files, require authentication and ownership
      if (!authResult.authenticated) {
        return NextResponse.json(
          { error: 'Authentication required for private files' },
          { status: 401 }
        );
      }

      // Check if user owns the file
      if (authResult.userId !== fileData.userId) {
        return NextResponse.json(
          { error: 'Not authorized to download this file' },
          { status: 403 }
        );
      }
    }

    // Check if file is expired
    if (fileData.expiresAt && fileData.expiresAt.toDate() < new Date()) {
      return NextResponse.json(
        { error: 'File has expired' },
        { status: 410 }
      );
    }

    // Check max downloads
    if (fileData.maxDownloads && fileData.downloadCount >= fileData.maxDownloads) {
      return NextResponse.json(
        { error: 'Download limit reached' },
        { status: 429 }
      );
    }

    // Get presigned download URL from R2 with proper filename for download
    const downloadUrl = await getDownloadUrl(fileData.r2Key, 3600, fileData.originalName);

    // Increment download count
    await fileRef.update({
      downloadCount: FieldValue.increment(1),
    });

    return NextResponse.json({
      downloadUrl,
      fileName: fileData.originalName,
    });
  } catch (error) {
    console.error('Error generating download URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    );
  }
}

// POST method for transfer file downloads (used by download page)
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 30 requests per minute for download operations
    const rateLimitResponse = await checkRateLimit(request, 'download');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { transferId, fileId, path, all, passwordVerified } = body;

    if (!transferId) {
      return NextResponse.json(
        { error: 'Missing transferId' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();

    // Get transfer document
    const transferRef = db.collection('transfers').doc(transferId);
    const transferDoc = await transferRef.get();

    if (!transferDoc.exists) {
      return NextResponse.json(
        { error: 'Transfer not found' },
        { status: 404 }
      );
    }

    const transferData = transferDoc.data() || {};

    // SECURITY: Check if transfer is password-protected
    // Password verification happens on the download page, but we need to ensure
    // direct API calls also require verification
    if (transferData.password && !passwordVerified) {
      return NextResponse.json(
        { error: 'Password verification required' },
        { status: 401 }
      );
    }

    // SECURITY: Check if transfer is private (not public link)
    if (transferData.isPublic === false) {
      const authResult = await verifyAuth(request);

      if (!authResult.authenticated) {
        return NextResponse.json(
          { error: 'Authentication required for private transfers' },
          { status: 401 }
        );
      }

      // Check if user owns the transfer
      if (authResult.userId !== transferData.userId) {
        return NextResponse.json(
          { error: 'Not authorized to download from this transfer' },
          { status: 403 }
        );
      }
    }

    // Check if transfer is expired
    if (transferData.expiresAt && transferData.expiresAt.toDate() < new Date()) {
      return NextResponse.json(
        { error: 'Transfer has expired' },
        { status: 410 }
      );
    }

    // If downloading all files, return a single URL for the first file (or handle zip creation)
    if (all) {
      // Get all files for this transfer
      const filesSnapshot = await db.collection('transfers').doc(transferId).collection('files').get();

      if (filesSnapshot.empty) {
        return NextResponse.json(
          { error: 'No files found' },
          { status: 404 }
        );
      }

      // For now, return the first file's download URL
      // TODO: Implement zip download for multiple files
      const firstFile = filesSnapshot.docs[0].data();
      const downloadUrl = await getDownloadUrl(firstFile.path || firstFile.storedName, 3600, firstFile.originalName);

      return NextResponse.json({
        downloadUrl,
        fileName: firstFile.originalName,
        fileCount: filesSnapshot.size,
      });
    }

    // Single file download
    if (fileId && path) {
      // Get file info first to have the filename
      const fileDocRef = await db.collection('transfers').doc(transferId).collection('files').doc(fileId).get();
      const fileName = fileDocRef.exists ? (fileDocRef.data()?.originalName || 'download') : 'download';

      const downloadUrl = await getDownloadUrl(path, 3600, fileName);

      // Record download analytics
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
        downloadType: 'single',
      }).catch(err => console.error('Analytics error:', err));

      return NextResponse.json({
        downloadUrl,
        fileName,
      });
    }

    return NextResponse.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error generating download URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    );
  }
}
