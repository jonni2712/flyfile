import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// POST - Confirm transfer upload is complete
export async function POST(request: NextRequest) {
  try {
    const { transferId } = await request.json();

    if (!transferId) {
      return NextResponse.json(
        { error: 'transferId richiesto' },
        { status: 400 }
      );
    }

    // Update transfer status to active
    const transferRef = doc(db, 'transfers', transferId);
    await updateDoc(transferRef, {
      status: 'active',
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Transfer confermato e attivato',
    });
  } catch (error) {
    console.error('Error confirming transfer:', error);
    return NextResponse.json(
      { error: 'Impossibile confermare il trasferimento' },
      { status: 500 }
    );
  }
}
