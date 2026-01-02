import { collection, addDoc, query, where, getDocs, orderBy, Timestamp, limit, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { TransferDownload } from '@/types';

// Anonymize IP for GDPR compliance (keep first 3 octets)
export function anonymizeIp(ip: string): string {
  if (!ip) return 'unknown';

  // Handle IPv4
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }
  }

  // Handle IPv6
  if (ip.includes(':')) {
    const parts = ip.split(':');
    // Keep first 3 segments
    return parts.slice(0, 3).join(':') + ':0:0:0:0:0';
  }

  return 'unknown';
}

// Parse user agent to get browser/OS info
export function parseUserAgent(userAgent: string | null): {
  browser: string;
  os: string;
  device: 'desktop' | 'mobile' | 'tablet';
} {
  if (!userAgent) {
    return { browser: 'Unknown', os: 'Unknown', device: 'desktop' };
  }

  // Detect browser
  let browser = 'Unknown';
  if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
  } else if (userAgent.includes('Edge')) {
    browser = 'Edge';
  } else if (userAgent.includes('Chrome')) {
    browser = 'Chrome';
  } else if (userAgent.includes('Safari')) {
    browser = 'Safari';
  } else if (userAgent.includes('Opera')) {
    browser = 'Opera';
  }

  // Detect OS
  let os = 'Unknown';
  if (userAgent.includes('Windows')) {
    os = 'Windows';
  } else if (userAgent.includes('Mac OS')) {
    os = 'macOS';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
  } else if (userAgent.includes('Android')) {
    os = 'Android';
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    os = 'iOS';
  }

  // Detect device type
  let device: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  if (userAgent.includes('Mobile') || userAgent.includes('Android')) {
    if (userAgent.includes('iPad') || userAgent.includes('Tablet')) {
      device = 'tablet';
    } else {
      device = 'mobile';
    }
  }

  return { browser, os, device };
}

// Record a download event
export async function recordDownload(params: {
  transferId: string;
  fileId?: string;
  ip: string;
  userAgent: string | null;
  country?: string;
  downloadType: 'single' | 'zip' | 'all' | 'secure';
}): Promise<string | null> {
  try {
    const { browser, os, device } = parseUserAgent(params.userAgent);

    const downloadData = {
      transferId: params.transferId,
      fileId: params.fileId || null,
      ipAddress: anonymizeIp(params.ip),
      userAgent: params.userAgent?.substring(0, 500) || null, // Limit length
      browser,
      os,
      device,
      country: params.country || null,
      downloadType: params.downloadType,
      downloadedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'downloadAnalytics'), downloadData);
    return docRef.id;
  } catch (error) {
    console.error('Error recording download:', error);
    return null;
  }
}

// Get download analytics for a transfer
export async function getTransferAnalytics(transferId: string): Promise<{
  totalDownloads: number;
  uniqueIps: number;
  downloads: Array<{
    id: string;
    browser: string;
    os: string;
    device: string;
    country: string | null;
    downloadType: string;
    downloadedAt: Date;
  }>;
  browserStats: Record<string, number>;
  osStats: Record<string, number>;
  deviceStats: Record<string, number>;
  downloadsByDay: Record<string, number>;
}> {
  try {
    const analyticsRef = collection(db, 'downloadAnalytics');
    const q = query(
      analyticsRef,
      where('transferId', '==', transferId),
      orderBy('downloadedAt', 'desc'),
      limit(1000)
    );

    const snapshot = await getDocs(q);

    const downloads: Array<{
      id: string;
      browser: string;
      os: string;
      device: string;
      country: string | null;
      downloadType: string;
      downloadedAt: Date;
    }> = [];

    const uniqueIps = new Set<string>();
    const browserStats: Record<string, number> = {};
    const osStats: Record<string, number> = {};
    const deviceStats: Record<string, number> = {};
    const downloadsByDay: Record<string, number> = {};

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      const downloadedAt = data.downloadedAt?.toDate?.() || new Date();
      const dayKey = downloadedAt.toISOString().split('T')[0];

      downloads.push({
        id: docSnap.id,
        browser: data.browser || 'Unknown',
        os: data.os || 'Unknown',
        device: data.device || 'desktop',
        country: data.country || null,
        downloadType: data.downloadType || 'single',
        downloadedAt,
      });

      uniqueIps.add(data.ipAddress);

      // Browser stats
      browserStats[data.browser || 'Unknown'] = (browserStats[data.browser || 'Unknown'] || 0) + 1;

      // OS stats
      osStats[data.os || 'Unknown'] = (osStats[data.os || 'Unknown'] || 0) + 1;

      // Device stats
      deviceStats[data.device || 'desktop'] = (deviceStats[data.device || 'desktop'] || 0) + 1;

      // Daily downloads
      downloadsByDay[dayKey] = (downloadsByDay[dayKey] || 0) + 1;
    });

    return {
      totalDownloads: downloads.length,
      uniqueIps: uniqueIps.size,
      downloads,
      browserStats,
      osStats,
      deviceStats,
      downloadsByDay,
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return {
      totalDownloads: 0,
      uniqueIps: 0,
      downloads: [],
      browserStats: {},
      osStats: {},
      deviceStats: {},
      downloadsByDay: {},
    };
  }
}

// Get user's overall download analytics (across all transfers)
export async function getUserAnalytics(userId: string): Promise<{
  totalDownloads: number;
  totalTransfersWithDownloads: number;
  topTransfers: Array<{ transferId: string; title: string; downloads: number }>;
  recentDownloads: Array<{
    transferId: string;
    browser: string;
    downloadedAt: Date;
  }>;
  downloadsByDay: Record<string, number>;
}> {
  try {
    // First get all user's transfers
    const transfersRef = collection(db, 'transfers');
    const transfersQuery = query(transfersRef, where('userId', '==', userId));
    const transfersSnapshot = await getDocs(transfersQuery);

    const transferIds: string[] = [];
    const transferTitles: Record<string, string> = {};

    transfersSnapshot.forEach((docSnap) => {
      transferIds.push(docSnap.id);
      transferTitles[docSnap.id] = docSnap.data().title || 'Senza titolo';
    });

    if (transferIds.length === 0) {
      return {
        totalDownloads: 0,
        totalTransfersWithDownloads: 0,
        topTransfers: [],
        recentDownloads: [],
        downloadsByDay: {},
      };
    }

    // Get analytics for all transfers
    const analyticsRef = collection(db, 'downloadAnalytics');
    const downloadsByTransfer: Record<string, number> = {};
    const downloadsByDay: Record<string, number> = {};
    const recentDownloads: Array<{
      transferId: string;
      browser: string;
      downloadedAt: Date;
    }> = [];

    // Query in batches of 10 (Firestore 'in' query limit)
    for (let i = 0; i < transferIds.length; i += 10) {
      const batch = transferIds.slice(i, i + 10);
      const q = query(
        analyticsRef,
        where('transferId', 'in', batch),
        orderBy('downloadedAt', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(q);

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const transferId = data.transferId;
        const downloadedAt = data.downloadedAt?.toDate?.() || new Date();
        const dayKey = downloadedAt.toISOString().split('T')[0];

        downloadsByTransfer[transferId] = (downloadsByTransfer[transferId] || 0) + 1;
        downloadsByDay[dayKey] = (downloadsByDay[dayKey] || 0) + 1;

        if (recentDownloads.length < 10) {
          recentDownloads.push({
            transferId,
            browser: data.browser || 'Unknown',
            downloadedAt,
          });
        }
      });
    }

    // Sort recent downloads
    recentDownloads.sort((a, b) => b.downloadedAt.getTime() - a.downloadedAt.getTime());

    // Calculate totals and top transfers
    let totalDownloads = 0;
    const topTransfers = Object.entries(downloadsByTransfer)
      .map(([transferId, downloads]) => {
        totalDownloads += downloads;
        return {
          transferId,
          title: transferTitles[transferId] || 'Senza titolo',
          downloads,
        };
      })
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 5);

    return {
      totalDownloads,
      totalTransfersWithDownloads: Object.keys(downloadsByTransfer).length,
      topTransfers,
      recentDownloads,
      downloadsByDay,
    };
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return {
      totalDownloads: 0,
      totalTransfersWithDownloads: 0,
      topTransfers: [],
      recentDownloads: [],
      downloadsByDay: {},
    };
  }
}
