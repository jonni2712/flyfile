import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { checkAdminAccess } from '@/lib/admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { csrfProtection } from '@/lib/csrf';

// GET - Get all contact messages (admin only)
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // SECURITY: Check admin access via JWT token
    const adminCheck = await checkAdminAccess(request);
    if (adminCheck) return adminCheck;

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');

    const db = getAdminFirestore();

    // Get contact messages
    const messagesSnapshot = await db.collection('contact_messages')
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limitParam || '100'))
      .get();

    const messages = messagesSnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate()?.toISOString() || null,
        readAt: data.readAt?.toDate()?.toISOString() || null,
        repliedAt: data.repliedAt?.toDate()?.toISOString() || null,
      };
    });

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
    // SECURITY: CSRF Protection
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // SECURITY: Check admin access via JWT token
    const adminCheck = await checkAdminAccess(request);
    if (adminCheck) return adminCheck;

    const body = await request.json();
    const { messageId, status } = body;

    if (!messageId) {
      return NextResponse.json(
        { error: 'messageId richiesto' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();

    // Update message
    const updateData: Record<string, unknown> = {
      status: status || 'read',
    };

    if (status === 'read') {
      updateData.readAt = FieldValue.serverTimestamp();
    } else if (status === 'replied') {
      updateData.repliedAt = FieldValue.serverTimestamp();
    }

    await db.collection('contact_messages').doc(messageId).update(updateData);

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
