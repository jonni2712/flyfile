import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, getAdminAuth } from '@/lib/firebase-admin';

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
 * Check if a user is an admin by their user ID (using Admin SDK)
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return false;
    }

    const userData = userSnap.data() || {};

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
 * CRITICAL: Verify Firebase ID token and check admin access
 * This replaces the vulnerable x-user-id header method
 */
export async function checkAdminAccess(request: NextRequest): Promise<NextResponse | null> {
  try {
    // CRITICAL: Get token from Authorization header, NOT from x-user-id header
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Token di autorizzazione mancante. Effettua il login.' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];

    if (!idToken) {
      return NextResponse.json(
        { success: false, error: 'Token non valido' },
        { status: 401 }
      );
    }

    // CRITICAL: Verify the token with Firebase Admin SDK
    const auth = getAdminAuth();
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError);
      return NextResponse.json(
        { success: false, error: 'Token scaduto o non valido. Effettua nuovamente il login.' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;

    // Now check if this verified user is an admin
    const isAdmin = await isUserAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Accesso negato. Permessi di amministratore richiesti.' },
        { status: 403 }
      );
    }

    // Store the verified userId in headers for the route handler to use
    // This is safe because we've verified the token
    request.headers.set('x-verified-user-id', userId);

    return null; // Access granted
  } catch (error) {
    console.error('Admin access check error:', error);
    return NextResponse.json(
      { success: false, error: 'Errore di autenticazione' },
      { status: 500 }
    );
  }
}

/**
 * Get verified user ID from a request that passed admin check
 */
export function getVerifiedAdminUserId(request: NextRequest): string | null {
  return request.headers.get('x-verified-user-id');
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
