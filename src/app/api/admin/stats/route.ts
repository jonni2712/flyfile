import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { checkAdminAccess, AdminStats } from '@/lib/admin';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // Check admin access
    const adminCheck = await checkAdminAccess(request);
    if (adminCheck) return adminCheck;

    const db = getAdminFirestore();

    // Get all users
    const usersSnapshot = await db.collection('users').get();

    let totalUsers = 0;
    let totalStorageUsed = 0;
    let activeSubscriptions = 0;
    let betaTesters = 0;
    let recentSignups = 0;
    const planDistribution = {
      free: 0,
      starter: 0,
      pro: 0,
      business: 0,
    };

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      totalUsers++;

      // Count storage
      totalStorageUsed += data.storageUsed || 0;

      // Count subscriptions
      if (data.stripeSubscriptionId && data.subscriptionStatus === 'active') {
        activeSubscriptions++;
      }

      // Count beta testers
      if (data.isBetaTester) {
        betaTesters++;
      }

      // Count plan distribution
      const plan = data.plan || 'free';
      if (plan in planDistribution) {
        planDistribution[plan as keyof typeof planDistribution]++;
      }

      // Count recent signups
      const createdAt = data.createdAt?.toDate?.();
      if (createdAt && createdAt > thirtyDaysAgo) {
        recentSignups++;
      }
    });

    // Get all transfers
    const transfersSnapshot = await db.collection('transfers').get();

    let totalTransfers = 0;
    let totalDownloads = 0;

    transfersSnapshot.forEach((doc) => {
      const data = doc.data();
      totalTransfers++;
      totalDownloads += data.downloadCount || 0;
    });

    const stats: AdminStats = {
      totalUsers,
      totalTransfers,
      totalStorageUsed,
      totalDownloads,
      activeSubscriptions,
      betaTesters,
      recentSignups,
      planDistribution,
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { success: false, error: 'Errore nel recupero delle statistiche' },
      { status: 500 }
    );
  }
}
