import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { csrfProtection } from '@/lib/csrf';
import { requireAuth } from '@/lib/auth-utils';

// POST - Confirm transfer upload is complete
export async function POST(request: NextRequest) {
  try {
    // SECURITY: CSRF Protection
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    const { transferId } = await request.json();

    if (!transferId) {
      return NextResponse.json(
        { error: 'transferId richiesto' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();

    // Get the transfer to find userId and totalSize
    const transferRef = db.collection('transfers').doc(transferId);
    const transferSnap = await transferRef.get();

    if (!transferSnap.exists) {
      return NextResponse.json(
        { error: 'Trasferimento non trovato' },
        { status: 404 }
      );
    }

    const transferData = transferSnap.data();
    const userId = transferData?.userId;
    const totalSize = transferData?.totalSize || 0;

    // SECURITY: For transfers with userId, require authentication and verify ownership
    // For anonymous transfers (userId is null), the internalId acts as proof of ownership
    if (userId) {
      const [authResult, authError] = await requireAuth(request);
      if (authError) return authError;

      if (userId !== authResult.userId) {
        return NextResponse.json(
          { error: 'Non autorizzato a confermare questo transfer' },
          { status: 403 }
        );
      }
    }

    // Update transfer status to active
    await transferRef.update({
      status: 'active',
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Update user's storage usage and monthly transfers count (if logged in user)
    if (userId) {
      const userRef = db.collection('users').doc(userId);
      await userRef.update({
        storageUsed: FieldValue.increment(totalSize),
        monthlyTransfers: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Transfer confermato e attivato',
    });
  } catch (error) {
    console.error('Error confirming transfer:', error);
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
    return NextResponse.json(
      { error: `Impossibile confermare il trasferimento: ${errorMessage}` },
      { status: 500 }
    );
  }
}
