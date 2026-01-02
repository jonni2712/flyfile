import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, orderBy, getDocs, limit, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { authenticateApiRequest, hasPermission, unauthorizedResponse, forbiddenResponse } from '@/lib/api-auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { v4 as uuidv4 } from 'uuid';

// GET /api/v1/transfers - List user's transfers
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // Authenticate
    const auth = await authenticateApiRequest(request);
    if (!auth.authenticated) {
      return unauthorizedResponse(auth.error || 'Non autorizzato');
    }

    // Check permissions
    if (!hasPermission(auth.permissions, 'read')) {
      return forbiddenResponse('Permesso "read" richiesto');
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // active, expired, all
    const limitParam = parseInt(searchParams.get('limit') || '20');
    const pageLimit = Math.min(Math.max(1, limitParam), 100);

    // Build query
    const transfersRef = collection(db, 'transfers');
    let q = query(
      transfersRef,
      where('userId', '==', auth.userId),
      orderBy('createdAt', 'desc'),
      limit(pageLimit)
    );

    const snapshot = await getDocs(q);

    const transfers: Array<{
      id: string;
      transferId: string;
      title: string;
      status: string;
      fileCount: number;
      totalSize: number;
      downloadCount: number;
      expiresAt: string;
      createdAt: string;
    }> = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const expiresAt = data.expiresAt?.toDate?.();
      const isExpired = expiresAt ? expiresAt < new Date() : false;
      const transferStatus = isExpired ? 'expired' : data.status || 'active';

      // Filter by status if specified
      if (status && status !== 'all') {
        if (status === 'active' && isExpired) return;
        if (status === 'expired' && !isExpired) return;
      }

      transfers.push({
        id: docSnap.id,
        transferId: data.transferId,
        title: data.title || 'Senza titolo',
        status: transferStatus,
        fileCount: data.fileCount || 0,
        totalSize: data.totalSize || 0,
        downloadCount: data.downloadCount || 0,
        expiresAt: expiresAt?.toISOString() || null,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      });
    });

    return NextResponse.json({
      success: true,
      data: transfers,
      meta: {
        count: transfers.length,
        limit: pageLimit,
      },
    });
  } catch (error) {
    console.error('API v1 GET transfers error:', error);
    return NextResponse.json(
      { success: false, error: 'Errore interno del server', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// POST /api/v1/transfers - Create a new transfer
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // Authenticate
    const auth = await authenticateApiRequest(request);
    if (!auth.authenticated) {
      return unauthorizedResponse(auth.error || 'Non autorizzato');
    }

    // Check permissions
    if (!hasPermission(auth.permissions, 'write')) {
      return forbiddenResponse('Permesso "write" richiesto');
    }

    const body = await request.json();
    const { title, message, expiryDays, password, recipientEmail } = body;

    // Validate required fields
    if (!title || title.length < 1 || title.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Titolo richiesto (1-100 caratteri)', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Calculate expiration (default 7 days, max 365)
    const expiry = Math.min(Math.max(1, expiryDays || 7), 365);
    const expiresAt = new Date(Date.now() + expiry * 24 * 60 * 60 * 1000);

    // Create transfer document
    const transferId = uuidv4();
    const transferData = {
      transferId,
      userId: auth.userId,
      title,
      message: message || null,
      recipientEmail: recipientEmail || null,
      password: password || null, // Note: In production, this should be hashed
      deliveryMethod: recipientEmail ? 'email' : 'link',
      status: 'pending', // Will be 'active' once files are uploaded
      totalSize: 0,
      fileCount: 0,
      downloadCount: 0,
      expiresAt: Timestamp.fromDate(expiresAt),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      source: 'api', // Mark as created via API
    };

    const docRef = await addDoc(collection(db, 'transfers'), transferData);

    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        transferId,
        title,
        status: 'pending',
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString(),
        uploadUrl: `/api/v1/transfers/${docRef.id}/files`, // Endpoint to upload files
      },
      message: 'Transfer creato. Usa uploadUrl per caricare i file.',
    });
  } catch (error) {
    console.error('API v1 POST transfers error:', error);
    return NextResponse.json(
      { success: false, error: 'Errore interno del server', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
