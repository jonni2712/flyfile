import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, doc, getDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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

    // Get transfers
    const transfersRef = collection(db, 'transfers');
    const transfersSnapshot = await getDocs(transfersRef);

    const now = new Date();
    let transfers: Array<Record<string, unknown>> = [];

    transfersSnapshot.forEach((docSnap) => {
      const data = docSnap.data();

      // Calculate status
      const expiresAt = data.expiresAt?.toDate?.();
      let transferStatus = data.status || 'active';
      if (expiresAt && expiresAt < now) {
        transferStatus = 'expired';
      }

      // Apply status filter
      if (status && transferStatus !== status) {
        return;
      }

      transfers.push({
        id: docSnap.id,
        transferId: data.transferId,
        title: data.title,
        userId: data.userId,
        userEmail: data.senderEmail || data.userEmail,
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
    });

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

    const transferRef = doc(db, 'transfers', transferId);
    const transferSnap = await getDoc(transferRef);

    if (!transferSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Trasferimento non trovato' },
        { status: 404 }
      );
    }

    // Delete files from R2
    const filesRef = collection(db, 'transfers', transferId, 'files');
    const filesSnapshot = await getDocs(filesRef);

    for (const fileDoc of filesSnapshot.docs) {
      const fileData = fileDoc.data();
      try {
        if (fileData.path) {
          await deleteFile(fileData.path);
        }
      } catch (err) {
        console.error('Error deleting file from R2:', err);
      }
      await deleteDoc(doc(db, 'transfers', transferId, 'files', fileDoc.id));
    }

    // Delete transfer document
    await deleteDoc(transferRef);

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
