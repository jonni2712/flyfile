import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { checkAdminAccess } from '@/lib/admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { deleteFile } from '@/lib/r2';

// GET - List all transfers with pagination
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // Check admin access
    const adminCheck = await checkAdminAccess(request);
    if (adminCheck) return adminCheck;

    const { searchParams } = new URL(request.url);
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const status = searchParams.get('status'); // 'active', 'expired', 'pending'

    const db = getAdminFirestore();

    // Get transfers
    const transfersSnapshot = await db.collection('transfers').get();

    const now = new Date();
    let transfers: Array<Record<string, unknown>> = [];

    // Build a map of userId -> email for resolving authenticated users
    const userIdsToResolve = new Set<string>();
    const transferDocs: Array<{ docSnap: FirebaseFirestore.QueryDocumentSnapshot; data: FirebaseFirestore.DocumentData }> = [];

    transfersSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      transferDocs.push({ docSnap, data });
      if (data.userId && !data.senderEmail) {
        userIdsToResolve.add(data.userId);
      }
    });

    // Batch resolve user emails
    const userEmailMap = new Map<string, string>();
    if (userIdsToResolve.size > 0) {
      const userIds = Array.from(userIdsToResolve);
      // Firestore 'in' queries support max 30 items
      for (let i = 0; i < userIds.length; i += 30) {
        const batch = userIds.slice(i, i + 30);
        const usersSnap = await db.collection('users').where('__name__', 'in', batch).get();
        usersSnap.forEach((userDoc) => {
          const userData = userDoc.data();
          if (userData.email) {
            userEmailMap.set(userDoc.id, userData.email);
          }
        });
      }
    }

    for (const { docSnap, data } of transferDocs) {
      // Calculate status
      const expiresAt = data.expiresAt?.toDate?.();
      let transferStatus = data.status || 'active';
      if (expiresAt && expiresAt < now) {
        transferStatus = 'expired';
      }

      // Apply status filter
      if (status && transferStatus !== status) {
        continue;
      }

      // Resolve user email: senderEmail (anonymous) → userId lookup → fallback
      const resolvedEmail = data.senderEmail || userEmailMap.get(data.userId) || null;

      transfers.push({
        id: docSnap.id,
        transferId: data.transferId,
        title: data.title,
        userId: data.userId,
        userEmail: resolvedEmail,
        senderEmail: data.senderEmail,
        recipientEmail: data.recipientEmail,
        status: transferStatus,
        totalSize: data.totalSize || 0,
        fileCount: data.fileCount || 0,
        downloadCount: data.downloadCount || 0,
        hasPassword: !!data.password,
        expiresAt: expiresAt?.toISOString() || null,
        createdAt: data.createdAt?.toDate()?.toISOString() || null,
      });
    }

    // Sort by creation date (newest first)
    transfers.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt as string).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt as string).getTime() : 0;
      return dateB - dateA;
    });

    // Apply pagination
    const paginatedTransfers = transfers.slice(0, pageSize);

    return NextResponse.json({
      success: true,
      transfers: paginatedTransfers,
      total: transfers.length,
      hasMore: transfers.length > pageSize,
    });
  } catch (error) {
    console.error('Error fetching transfers:', error);
    return NextResponse.json(
      { success: false, error: 'Errore nel recupero dei trasferimenti' },
      { status: 500 }
    );
  }
}

// DELETE - Delete transfer (admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'sensitive');
    if (rateLimitResponse) return rateLimitResponse;

    // Check admin access
    const adminCheck = await checkAdminAccess(request);
    if (adminCheck) return adminCheck;

    const { searchParams } = new URL(request.url);
    const transferId = searchParams.get('transferId');

    if (!transferId) {
      return NextResponse.json(
        { success: false, error: 'ID trasferimento richiesto' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();
    const transferSnap = await db.collection('transfers').doc(transferId).get();

    if (!transferSnap.exists) {
      return NextResponse.json(
        { success: false, error: 'Trasferimento non trovato' },
        { status: 404 }
      );
    }

    // Delete files from R2
    const filesSnapshot = await db.collection('transfers').doc(transferId).collection('files').get();

    for (const fileDoc of filesSnapshot.docs) {
      const fileData = fileDoc.data();
      try {
        if (fileData.path) {
          await deleteFile(fileData.path);
        }
      } catch (err) {
        console.error('Error deleting file from R2:', err);
      }
      await db.collection('transfers').doc(transferId).collection('files').doc(fileDoc.id).delete();
    }

    // Delete transfer document
    await db.collection('transfers').doc(transferId).delete();

    return NextResponse.json({
      success: true,
      message: 'Trasferimento eliminato con successo',
    });
  } catch (error) {
    console.error('Error deleting transfer:', error);
    return NextResponse.json(
      { success: false, error: 'Errore nell\'eliminazione del trasferimento' },
      { status: 500 }
    );
  }
}
