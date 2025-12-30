import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { checkRateLimit } from '@/lib/rate-limit';
import { verifyPassword, hashPassword, needsHashUpgrade } from '@/lib/password';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 requests per minute for sensitive operations
    const rateLimitResponse = await checkRateLimit(request, 'sensitive');
    if (rateLimitResponse) return rateLimitResponse;

    const { transferId, password } = await request.json();

    if (!transferId || !password) {
      return NextResponse.json(
        { valid: false, error: 'Missing transferId or password' },
        { status: 400 }
      );
    }

    // Find transfer by transferId
    const transfersRef = collection(db, 'transfers');
    const q = query(transfersRef, where('transferId', '==', transferId));
    const snapshot = await getDocs(q);

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
        const transferDocRef = doc(db, 'transfers', snapshot.docs[0].id);
        await updateDoc(transferDocRef, { password: newHash });
        console.log('Password hash upgraded to bcrypt for transfer:', transferId);
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
