import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { checkRateLimit } from '@/lib/rate-limit';

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

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, error: 'Codice non valido. Deve essere di 6 cifre.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Get anonymous user record
    const anonRef = doc(db, 'anonymousUsers', normalizedEmail);
    const anonSnap = await getDoc(anonRef);

    if (!anonSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Utente non trovato. Richiedi un nuovo codice.' },
        { status: 404 }
      );
    }

    const anonData = anonSnap.data();

    // Check if code matches
    if (anonData.verificationCode !== code) {
      return NextResponse.json(
        { success: false, error: 'Codice di verifica non valido.' },
        { status: 400 }
      );
    }

    // Check if code is expired
    const codeExpiresAt = anonData.codeExpiresAt?.toDate ? anonData.codeExpiresAt.toDate() : new Date(anonData.codeExpiresAt);
    if (codeExpiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Codice scaduto. Richiedi un nuovo codice.' },
        { status: 400 }
      );
    }

    // Mark as verified
    await updateDoc(anonRef, {
      verifiedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Email verificata con successo',
      anonymousUserId: normalizedEmail,
      usage: {
        transfersUsed: anonData.monthlyTransfersUsed || 0,
        quotaUsed: anonData.monthlyQuotaUsed || 0,
      },
    });
  } catch (error) {
    console.error('Error in verify-code:', error);
    return NextResponse.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
