import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, getAdminAuth } from '@/lib/firebase-admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';

// SECURITY: Hash code for comparison
function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 requests per minute for sensitive endpoints
    const rateLimitResponse = await checkRateLimit(request, 'sensitive');
    if (rateLimitResponse) return rateLimitResponse;

    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email e codice richiesti' },
        { status: 400 }
      );
    }

    // Validate code format
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, error: 'Formato codice non valido' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const db = getAdminFirestore();
    const adminAuth = getAdminAuth();

    // Read auth code document
    const codeRef = db.collection('authCodes').doc(normalizedEmail);
    const codeSnap = await codeRef.get();

    if (!codeSnap.exists) {
      return NextResponse.json(
        { success: false, error: 'Codice non valido o scaduto' },
        { status: 400 }
      );
    }

    const codeData = codeSnap.data()!;

    // Check max attempts (brute-force protection)
    if ((codeData.attempts || 0) >= 5) {
      // Invalidate code
      await codeRef.delete();
      return NextResponse.json(
        { success: false, error: 'Troppi tentativi. Richiedi un nuovo codice.' },
        { status: 400 }
      );
    }

    // Check expiration
    const expiresAt = codeData.expiresAt?.toDate?.() || codeData.expiresAt;
    if (!expiresAt || new Date() > new Date(expiresAt)) {
      await codeRef.delete();
      return NextResponse.json(
        { success: false, error: 'Codice scaduto. Richiedi un nuovo codice.' },
        { status: 400 }
      );
    }

    // SECURITY: Timing-safe comparison of hashed codes
    const providedHash = hashCode(code);
    const storedHash = codeData.codeHash;

    const providedBuffer = Buffer.from(providedHash, 'hex');
    const storedBuffer = Buffer.from(storedHash, 'hex');

    const isValid = providedBuffer.length === storedBuffer.length &&
      crypto.timingSafeEqual(providedBuffer, storedBuffer);

    if (!isValid) {
      // Increment attempts
      await codeRef.update({ attempts: (codeData.attempts || 0) + 1 });
      return NextResponse.json(
        { success: false, error: 'Codice non valido' },
        { status: 400 }
      );
    }

    // Code is valid - delete it (one-time use)
    await codeRef.delete();

    // Check if user exists in Firebase Auth
    let isNewUser = false;
    let uid: string;

    try {
      const existingUser = await adminAuth.getUserByEmail(normalizedEmail);
      uid = existingUser.uid;
    } catch {
      // User doesn't exist - create new account
      isNewUser = true;
      const newUser = await adminAuth.createUser({
        email: normalizedEmail,
        emailVerified: true,
      });
      uid = newUser.uid;

      // Create Firestore user profile
      await db.collection('users').doc(uid).set({
        uid,
        email: normalizedEmail,
        displayName: '',
        plan: 'free',
        storageUsed: 0,
        storageLimit: 15 * 1024 * 1024 * 1024, // 15 GB for free plan
        monthlyTransfers: 0,
        maxMonthlyTransfers: 20,
        retentionDays: 7,
        filesCount: 0,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    // Generate custom token for client sign-in
    const customToken = await adminAuth.createCustomToken(uid);

    return NextResponse.json({
      success: true,
      customToken,
      isNewUser,
    });
  } catch (error) {
    console.error('Error in auth/verify-code:', error);
    return NextResponse.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
