import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// List of admin email addresses (can be moved to environment variable)
const ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL || 'admin@flyfile.it',
];

export interface AdminCheckResult {
  isAdmin: boolean;
  userId?: string;
  error?: string;
}

/**
 * Check if a user is an admin by their email
 */
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Check if a user is an admin by their user ID
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return false;
    }

    const userData = userSnap.data();

    // Check isAdmin flag in database
    if (userData.isAdmin === true) {
      return true;
    }

    // Check if email is in admin list
    if (userData.email && isAdminEmail(userData.email)) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Middleware to check admin access for API routes
 * Returns a NextResponse with 401/403 if not authorized
 */
export async function checkAdminAccess(request: NextRequest): Promise<NextResponse | null> {
  // Get user ID from header or query
  const userId = request.headers.get('x-user-id') ||
                 new URL(request.url).searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'Non autorizzato. Effettua il login.' },
      { status: 401 }
    );
  }

  const isAdmin = await isUserAdmin(userId);

  if (!isAdmin) {
    return NextResponse.json(
      { success: false, error: 'Accesso negato. Permessi di amministratore richiesti.' },
      { status: 403 }
    );
  }

  return null; // Access granted
}

/**
 * Get admin dashboard statistics
 */
export interface AdminStats {
  totalUsers: number;
  totalTransfers: number;
  totalStorageUsed: number;
  totalDownloads: number;
  activeSubscriptions: number;
  betaTesters: number;
  recentSignups: number;
  planDistribution: {
    free: number;
    starter: number;
    pro: number;
    business: number;
  };
}
