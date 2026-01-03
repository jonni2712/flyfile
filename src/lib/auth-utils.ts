import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from './firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthResult {
  authenticated: boolean;
  userId?: string;
  email?: string;
  decodedToken?: DecodedIdToken;
  error?: string;
}

/**
 * Verify Firebase ID token from Authorization header
 * @param request NextRequest object
 * @returns AuthResult with user info if authenticated
 */
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        authenticated: false,
        error: 'Token di autorizzazione mancante',
      };
    }

    const idToken = authHeader.split('Bearer ')[1];

    if (!idToken) {
      return {
        authenticated: false,
        error: 'Token non valido',
      };
    }

    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(idToken);

    return {
      authenticated: true,
      userId: decodedToken.uid,
      email: decodedToken.email,
      decodedToken,
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return {
      authenticated: false,
      error: 'Token scaduto o non valido',
    };
  }
}

/**
 * Middleware helper that returns an error response if not authenticated
 * @param request NextRequest object
 * @returns Tuple [authResult, errorResponse?]
 */
export async function requireAuth(request: NextRequest): Promise<[AuthResult, NextResponse | null]> {
  const authResult = await verifyAuth(request);

  if (!authResult.authenticated) {
    return [
      authResult,
      NextResponse.json(
        { error: authResult.error || 'Non autorizzato' },
        { status: 401 }
      ),
    ];
  }

  return [authResult, null];
}

/**
 * Verify that the authenticated user matches the requested userId
 * @param authResult Result from verifyAuth
 * @param requestedUserId The userId from the request
 * @returns true if authorized, false otherwise
 */
export function isAuthorizedForUser(authResult: AuthResult, requestedUserId: string): boolean {
  if (!authResult.authenticated || !authResult.userId) {
    return false;
  }
  return authResult.userId === requestedUserId;
}
