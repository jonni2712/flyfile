import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Password hashing with salt
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = process.env.PASSWORD_SALT || 'flyfile-salt';
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: NextRequest) {
  try {
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

    // Verify password
    const hashedPassword = await hashPassword(password);
    const isValid = hashedPassword === transferData.password;

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error('Error verifying password:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to verify password' },
      { status: 500 }
    );
  }
}
