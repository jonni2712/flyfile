import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Valid beta tester codes
const VALID_BETA_CODES = [
  'FLYFILE-BETA-2024',
  'FLYFILE-TESTER',
  'BETATEST2024',
  'EARLYBIRD-FLYFILE',
];

// POST - Activate beta tester status
export async function POST(request: NextRequest) {
  try {
    const { userId, code } = await request.json();

    if (!userId || !code) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or code' },
        { status: 400 }
      );
    }

    // Validate code
    const normalizedCode = code.trim().toUpperCase();
    if (!VALID_BETA_CODES.includes(normalizedCode)) {
      return NextResponse.json(
        { success: false, error: 'Codice beta tester non valido' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    // Check if already a beta tester
    const userData = userSnap.data();
    if (userData.isBetaTester) {
      return NextResponse.json(
        { success: false, error: 'Sei già un beta tester!' },
        { status: 400 }
      );
    }

    // Activate beta tester status
    await updateDoc(userRef, {
      isBetaTester: true,
      betaTesterCode: normalizedCode,
      betaTesterSince: serverTimestamp(),
      // Give beta testers Pro plan benefits
      plan: 'pro',
      storageLimit: 500 * 1024 * 1024 * 1024, // 500 GB
      maxMonthlyTransfers: 30,
      retentionDays: 30,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Benvenuto nel programma beta tester! Hai ricevuto i benefici del piano Pro.',
    });
  } catch (error) {
    console.error('Error activating beta tester:', error);
    return NextResponse.json(
      { success: false, error: 'Errore durante l\'attivazione' },
      { status: 500 }
    );
  }
}

// GET - Check beta tester status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId' },
        { status: 400 }
      );
    }

    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    const userData = userSnap.data();

    return NextResponse.json({
      success: true,
      isBetaTester: userData.isBetaTester || false,
      betaTesterSince: userData.betaTesterSince?.toDate()?.toISOString() || null,
    });
  } catch (error) {
    console.error('Error checking beta tester status:', error);
    return NextResponse.json(
      { success: false, error: 'Errore durante la verifica' },
      { status: 500 }
    );
  }
}
