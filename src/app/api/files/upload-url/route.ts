import { NextRequest, NextResponse } from 'next/server';
import { getUploadUrl, generateFileKey } from '@/lib/r2';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import { getPlanLimits } from '@/types';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireAuth } from '@/lib/auth-utils';
import { validateFile, sanitizeFilename } from '@/lib/file-validation';

// Default limits for anonymous users (same as free plan)
const ANONYMOUS_LIMITS = {
  storageLimit: 5 * 1024 * 1024 * 1024, // 5 GB
  maxTransfers: 10,
  maxFilesPerTransfer: 10,
};

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 requests per minute for upload operations
    const rateLimitResponse = await checkRateLimit(request, 'upload');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    // SECURITY FIX: Don't trust userId from body for authenticated users
    const { fileName, contentType, fileSize, isAnonymous, senderEmail } = body;

    if (!fileName || !contentType || !fileSize) {
      return NextResponse.json(
        { error: 'Missing required fields: fileName, contentType, fileSize' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();

    // SECURITY FIX: Determine userId securely
    let userId: string;
    let userPlan: 'anonymous' | 'free' | 'starter' | 'pro' | 'business' = 'free';

    if (isAnonymous) {
      // Anonymous users: generate userId server-side (don't trust client)
      userId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      userPlan = 'anonymous';
    } else {
      // Authenticated users: verify token and extract userId
      const [authResult, authError] = await requireAuth(request);
      if (authError) return authError;
      userId = authResult.userId!;

      // Fetch user's actual plan BEFORE validation
      const userSnap = await db.collection('users').doc(userId).get();
      if (userSnap.exists) {
        const userData = userSnap.data() || {};
        userPlan = (userData.plan || 'free') as typeof userPlan;
      }
    }

    // SECURITY: Validate file with the correct user plan
    const validation = validateFile(fileName, contentType, fileSize, userPlan);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error, code: validation.errorCode },
        { status: 400 }
      );
    }

    // Sanitize filename to prevent path traversal
    const sanitizedFileName = sanitizeFilename(fileName);

    // Check user limits based on plan
    let storageLimit: number;
    let maxTransfers: number;
    let currentStorageUsed = 0;
    let currentMonthlyTransfers = 0;

    if (isAnonymous) {
      // Anonymous users get free plan limits
      storageLimit = ANONYMOUS_LIMITS.storageLimit;
      maxTransfers = ANONYMOUS_LIMITS.maxTransfers;

      // Check anonymous user's usage
      if (senderEmail) {
        const anonUserSnap = await db.collection('anonymousUsers').doc(userId).get();

        if (anonUserSnap.exists) {
          const anonData = anonUserSnap.data() || {};
          currentMonthlyTransfers = anonData.transferCount || 0;
          currentStorageUsed = anonData.storageUsed || 0;
        }
      }
    } else {
      // Registered user - check their plan limits (reuse data if already fetched)
      const userSnap = await db.collection('users').doc(userId).get();

      if (!userSnap.exists) {
        return NextResponse.json(
          { error: 'Utente non trovato' },
          { status: 404 }
        );
      }

      const userData = userSnap.data() || {};
      const fetchedUserPlan = userData.plan || 'free';
      userPlan = fetchedUserPlan as typeof userPlan;
      const planLimits = getPlanLimits(fetchedUserPlan);

      storageLimit = userData.storageLimit || planLimits.storageLimit;
      maxTransfers = userData.maxMonthlyTransfers || planLimits.maxTransfers;
      currentStorageUsed = userData.storageUsed || 0;
      currentMonthlyTransfers = userData.monthlyTransfers || 0;

      // Business plan has unlimited storage (-1)
      if (storageLimit !== -1 && currentStorageUsed + fileSize > storageLimit) {
        const limitInGB = (storageLimit / (1024 * 1024 * 1024)).toFixed(0);
        const usedInGB = (currentStorageUsed / (1024 * 1024 * 1024)).toFixed(2);
        return NextResponse.json(
          {
            error: `Limite di storage raggiunto. Hai usato ${usedInGB} GB su ${limitInGB} GB disponibili. Passa a un piano superiore per più spazio.`,
            code: 'STORAGE_LIMIT_EXCEEDED'
          },
          { status: 403 }
        );
      }

      // Business plan has unlimited transfers (-1)
      if (maxTransfers !== -1 && currentMonthlyTransfers >= maxTransfers) {
        return NextResponse.json(
          {
            error: `Hai raggiunto il limite di ${maxTransfers} trasferimenti mensili. Passa a un piano superiore per più trasferimenti.`,
            code: 'TRANSFER_LIMIT_EXCEEDED'
          },
          { status: 403 }
        );
      }
    }

    // If anonymous user, store their info
    if (isAnonymous && senderEmail) {
      const anonUserSnap = await db.collection('anonymousUsers').doc(userId).get();

      if (!anonUserSnap.exists) {
        await db.collection('anonymousUsers').doc(userId).set({
          id: userId,
          email: senderEmail,
          transferCount: 1,
          storageUsed: fileSize,
          createdAt: FieldValue.serverTimestamp(),
        });
      } else {
        // Check limits for anonymous user before proceeding
        const anonData = anonUserSnap.data() || {};
        const anonTransfers = anonData.transferCount || 0;
        const anonStorage = anonData.storageUsed || 0;

        if (anonTransfers >= ANONYMOUS_LIMITS.maxTransfers) {
          return NextResponse.json(
            {
              error: `Hai raggiunto il limite di ${ANONYMOUS_LIMITS.maxTransfers} trasferimenti. Registrati per avere più trasferimenti.`,
              code: 'TRANSFER_LIMIT_EXCEEDED'
            },
            { status: 403 }
          );
        }

        if (anonStorage + fileSize > ANONYMOUS_LIMITS.storageLimit) {
          return NextResponse.json(
            {
              error: `Limite di storage raggiunto (5 GB). Registrati per avere più spazio.`,
              code: 'STORAGE_LIMIT_EXCEEDED'
            },
            { status: 403 }
          );
        }
      }
    }

    // Generate unique file ID and R2 key (use sanitized filename)
    const fileId = uuidv4();
    const r2Key = generateFileKey(userId, sanitizedFileName);

    // Get presigned upload URL from R2
    const uploadUrl = await getUploadUrl(r2Key, contentType);

    // Create file metadata in Firestore (pending status)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const shareLink = `${baseUrl}/s/${fileId}`;

    await db.collection('files').doc(fileId).set({
      userId,
      fileName: r2Key.split('/').pop(),
      originalName: sanitizedFileName,  // Use sanitized filename
      mimeType: contentType,
      size: fileSize,
      r2Key,
      shareLink,
      isPublic: true,
      downloadCount: 0,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      uploadUrl,
      fileId,
      shareLink,
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    // SECURITY: Don't expose internal error details in production
    return NextResponse.json(
      { error: 'Errore nella generazione URL di upload' },
      { status: 500 }
    );
  }
}
