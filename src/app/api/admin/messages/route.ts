import { NextRequest, NextResponse } from 'next/server';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  limit as firestoreLimit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// GET - Get all contact messages (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limitParam = searchParams.get('limit');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId richiesto' },
        { status: 400 }
      );
    }

    // Verify admin
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    const userData = userSnap.data();
    if (!userData.isAdmin) {
      return NextResponse.json(
        { error: 'Accesso non autorizzato' },
        { status: 403 }
      );
    }

    // Get contact messages
    const messagesRef = collection(db, 'contact_messages');
    const messagesQuery = query(
      messagesRef,
      orderBy('createdAt', 'desc'),
      firestoreLimit(parseInt(limitParam || '100'))
    );
    const messagesSnapshot = await getDocs(messagesQuery);

    const messages = messagesSnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate()?.toISOString() || null,
      readAt: docSnap.data().readAt?.toDate()?.toISOString() || null,
      repliedAt: docSnap.data().repliedAt?.toDate()?.toISOString() || null,
    }));

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Impossibile recuperare i messaggi' },
      { status: 500 }
    );
  }
}

// PATCH - Update message status (mark as read/replied)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, messageId, status } = body;

    if (!userId || !messageId) {
      return NextResponse.json(
        { error: 'userId e messageId richiesti' },
        { status: 400 }
      );
    }

    // Verify admin
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    const userData = userSnap.data();
    if (!userData.isAdmin) {
      return NextResponse.json(
        { error: 'Accesso non autorizzato' },
        { status: 403 }
      );
    }

    // Update message
    const messageRef = doc(db, 'contact_messages', messageId);
    const updateData: Record<string, unknown> = {
      status: status || 'read',
    };

    if (status === 'read') {
      updateData.readAt = serverTimestamp();
    } else if (status === 'replied') {
      updateData.repliedAt = serverTimestamp();
    }

    await updateDoc(messageRef, updateData);

    return NextResponse.json({
      success: true,
      message: 'Messaggio aggiornato',
    });
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: 'Impossibile aggiornare il messaggio' },
      { status: 500 }
    );
  }
}
