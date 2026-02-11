import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { verifyAuth } from '@/lib/auth-utils';
import { csrfProtection } from '@/lib/csrf';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: CSRF Protection
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { fileId, transferId } = body;

    // Support both fileId (for files collection) and transferId (for transfers collection)
    if (!fileId && !transferId) {
      return NextResponse.json(
        { error: 'Missing fileId or transferId' },
        { status: 400 }
      );
    }

    // Verify authentication (optional for anonymous users)
    const authResult = await verifyAuth(request);
    const authenticatedUserId = authResult.authenticated ? authResult.userId : null;

    const db = getAdminFirestore();

    if (fileId) {
      // Get file data to update user's storage
      const fileRef = db.collection('files').doc(fileId);
      const fileSnap = await fileRef.get();

      if (!fileSnap.exists) {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        );
      }

      const fileData = fileSnap.data() || {};
      const fileSize = fileData.size || 0;
      const fileUserId = fileData.userId;

      // CRITICAL: Verify ownership - authenticated user must match file owner
      // Exception: anonymous uploads (userId starts with 'anon_') don't require auth
      if (fileUserId && !fileUserId.startsWith('anon_')) {
        if (!authenticatedUserId) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
        }
        if (authenticatedUserId !== fileUserId) {
          return NextResponse.json(
            { error: 'Not authorized to confirm this upload' },
            { status: 403 }
          );
        }
      }

      // Update file status in files collection
      await fileRef.update({
        status: 'completed',
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Update user's storage and transfer count
      if (fileUserId && !fileUserId.startsWith('anon_')) {
        // Registered user
        const userRef = db.collection('users').doc(fileUserId);
        await userRef.update({
          storageUsed: FieldValue.increment(fileSize),
          monthlyTransfers: FieldValue.increment(1),
          filesCount: FieldValue.increment(1),
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else if (fileUserId && fileUserId.startsWith('anon_')) {
        // Anonymous user
        const anonUserRef = db.collection('anonymousUsers').doc(fileUserId);
        const anonUserSnap = await anonUserRef.get();

        if (anonUserSnap.exists) {
          await anonUserRef.update({
            transferCount: FieldValue.increment(1),
            storageUsed: FieldValue.increment(fileSize),
          });
        }
      }
    }

    if (transferId) {
      // Get transfer data to update user's storage
      const transferRef = db.collection('transfers').doc(transferId);
      const transferSnap = await transferRef.get();

      if (transferSnap.exists) {
        const transferData = transferSnap.data() || {};
        const transferUserId = transferData.userId;
        const totalSize = transferData.totalSize || 0;

        // CRITICAL: Verify ownership - authenticated user must match transfer owner
        // Exception: anonymous uploads (userId starts with 'anon_') don't require auth
        if (transferUserId && !transferUserId.startsWith('anon_')) {
          if (!authenticatedUserId) {
            return NextResponse.json(
              { error: 'Authentication required' },
              { status: 401 }
            );
          }
          if (authenticatedUserId !== transferUserId) {
            return NextResponse.json(
              { error: 'Not authorized to confirm this transfer' },
              { status: 403 }
            );
          }
        }

        // Update transfer status
        await transferRef.update({
          status: 'active',
          updatedAt: FieldValue.serverTimestamp(),
        });

        // Update user's storage and transfer count
        if (transferUserId && !transferUserId.startsWith('anon_')) {
          const userRef = db.collection('users').doc(transferUserId);
          await userRef.update({
            storageUsed: FieldValue.increment(totalSize),
            monthlyTransfers: FieldValue.increment(1),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      } else {
        return NextResponse.json(
          { error: 'Transfer not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error confirming upload:', error);
    return NextResponse.json(
      { error: 'Failed to confirm upload' },
      { status: 500 }
    );
  }
}
