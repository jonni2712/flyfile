import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { checkRateLimit, checkPasswordRateLimit } from '@/lib/rate-limit';
import { verifyPassword, hashPassword, needsHashUpgrade } from '@/lib/password';

export async function POST(request: NextRequest) {
  try {
    // Basic rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'sensitive');
    if (rateLimitResponse) return rateLimitResponse;

    const { transferId, password } = await request.json();

    if (!transferId || !password) {
      return NextResponse.json(
        { valid: false, error: 'Missing transferId or password' },
        { status: 400 }
      );
    }

    // SECURITY: Stricter rate limiting per transfer to prevent brute force attacks
    const passwordRateLimitResponse = await checkPasswordRateLimit(request, transferId);
    if (passwordRateLimitResponse) return passwordRateLimitResponse;

    const db = getAdminFirestore();

    // Find transfer by transferId
    const snapshot = await db.collection('transfers')
      .where('transferId', '==', transferId)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { valid: false, error: 'Transfer not found' },
        { status: 404 }
      );
    }

    const transferData = snapshot.docs[0].data();

    // If no password set, return true
    if (!transferData.password) {
      return NextResponse.json({ valid: true });
    }

    // Verify password (supports both bcrypt and legacy SHA-256)
    const isValid = await verifyPassword(password, transferData.password);

    // If password is valid and using legacy hash, upgrade to bcrypt
    if (isValid && needsHashUpgrade(transferData.password)) {
      try {
        const newHash = await hashPassword(password);
        await db.collection('transfers').doc(snapshot.docs[0].id).update({ password: newHash });
      } catch (upgradeError) {
        console.error('Failed to upgrade password hash:', upgradeError);
        // Don't fail the verification if upgrade fails
      }
    }

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error('Error verifying password:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to verify password' },
      { status: 500 }
    );
  }
}
