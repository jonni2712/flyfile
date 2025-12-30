import { NextRequest, NextResponse } from 'next/server';
import { getUploadUrl, generateFileKey } from '@/lib/r2';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';
import { getPlanLimits } from '@/types';
import { checkRateLimit } from '@/lib/rate-limit';

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

    const { fileName, contentType, fileSize, userId, isAnonymous, senderEmail } = await request.json();

    if (!fileName || !contentType || !fileSize || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

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
        const anonUserRef = doc(db, 'anonymousUsers', userId);
        const anonUserSnap = await getDoc(anonUserRef);

        if (anonUserSnap.exists()) {
          const anonData = anonUserSnap.data();
          currentMonthlyTransfers = anonData.transferCount || 0;
          currentStorageUsed = anonData.storageUsed || 0;
        }
      }
    } else {
      // Registered user - check their plan limits
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return NextResponse.json(
          { error: 'Utente non trovato' },
          { status: 404 }
        );
      }

      const userData = userSnap.data();
      const userPlan = userData.plan || 'free';
      const planLimits = getPlanLimits(userPlan);

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
      const anonUserRef = doc(db, 'anonymousUsers', userId);
      const anonUserSnap = await getDoc(anonUserRef);

      if (!anonUserSnap.exists()) {
        await setDoc(anonUserRef, {
          id: userId,
          email: senderEmail,
          transferCount: 1,
          storageUsed: fileSize,
          createdAt: serverTimestamp(),
        });
      } else {
        // Check limits for anonymous user before proceeding
        const anonData = anonUserSnap.data();
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

    // Generate unique file ID and R2 key
    const fileId = uuidv4();
    const r2Key = generateFileKey(userId, fileName);

    // Get presigned upload URL from R2
    const uploadUrl = await getUploadUrl(r2Key, contentType);

    // Create file metadata in Firestore (pending status)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const shareLink = `${baseUrl}/s/${fileId}`;

    await setDoc(doc(db, 'files', fileId), {
      userId,
      fileName: r2Key.split('/').pop(),
      originalName: fileName,
      mimeType: contentType,
      size: fileSize,
      r2Key,
      shareLink,
      isPublic: true,
      downloadCount: 0,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      uploadUrl,
      fileId,
      shareLink,
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    // Return more detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Errore nella generazione URL di upload',
        details: errorMessage,
        hint: 'Verifica le variabili R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME'
      },
      { status: 500 }
    );
  }
}
