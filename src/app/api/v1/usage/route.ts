import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { authenticateApiRequest, unauthorizedResponse } from '@/lib/api-auth';
import { checkRateLimit } from '@/lib/rate-limit';

// GET /api/v1/usage - Get API usage statistics
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

    // Get user profile for plan info
    const userRef = doc(db, 'users', auth.userId!);
    const userSnap = await getDoc(userRef);

    let plan = 'pro';
    let storageUsed = 0;
    let storageLimit = 500 * 1024 * 1024 * 1024; // 500GB default

    if (userSnap.exists()) {
      const userData = userSnap.data();
      plan = userData.plan || 'pro';
      storageUsed = userData.storageUsed || 0;
      storageLimit = userData.storageLimit || storageLimit;
    }

    // Get transfer stats
    const transfersRef = collection(db, 'transfers');
    const transfersQuery = query(transfersRef, where('userId', '==', auth.userId));
    const transfersSnapshot = await getDocs(transfersQuery);

    let totalTransfers = 0;
    let activeTransfers = 0;
    let totalDownloads = 0;
    let totalSize = 0;
    let apiCreatedTransfers = 0;

    transfersSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      totalTransfers++;

      const expiresAt = data.expiresAt?.toDate?.();
      const isExpired = expiresAt ? expiresAt < new Date() : false;

      if (!isExpired) {
        activeTransfers++;
      }

      totalDownloads += data.downloadCount || 0;
      totalSize += data.totalSize || 0;

      if (data.source === 'api') {
        apiCreatedTransfers++;
      }
    });

    // Get API key usage
    const apiKeysRef = collection(db, 'apiKeys');
    const apiKeysQuery = query(apiKeysRef, where('userId', '==', auth.userId));
    const apiKeysSnapshot = await getDocs(apiKeysQuery);

    let totalApiCalls = 0;
    let activeKeys = 0;

    apiKeysSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      totalApiCalls += data.usageCount || 0;
      if (data.isActive) {
        activeKeys++;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        plan,
        storage: {
          used: storageUsed,
          limit: storageLimit,
          percentage: storageLimit > 0 ? Math.round((storageUsed / storageLimit) * 100) : 0,
        },
        transfers: {
          total: totalTransfers,
          active: activeTransfers,
          apiCreated: apiCreatedTransfers,
        },
        downloads: {
          total: totalDownloads,
        },
        api: {
          totalCalls: totalApiCalls,
          activeKeys,
        },
        limits: {
          rateLimit: '60 requests/minute',
          maxKeys: 10,
        },
      },
    });
  } catch (error) {
    console.error('API v1 usage error:', error);
    return NextResponse.json(
      { success: false, error: 'Errore interno del server', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
