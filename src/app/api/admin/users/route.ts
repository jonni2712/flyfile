import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { checkAdminAccess } from '@/lib/admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { csrfProtection } from '@/lib/csrf';

// GET - List all users with pagination
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // Check admin access
    const adminCheck = await checkAdminAccess(request);
    if (adminCheck) return adminCheck;

    const { searchParams } = new URL(request.url);
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const search = searchParams.get('search')?.toLowerCase();
    const planFilter = searchParams.get('plan');
    const betaOnly = searchParams.get('betaOnly') === 'true';

    const db = getAdminFirestore();

    // Get users
    const usersSnapshot = await db.collection('users').get();

    let users: Array<Record<string, unknown>> = [];

    usersSnapshot.forEach((docSnap) => {
      const data = docSnap.data();

      // Apply filters
      if (search) {
        const email = (data.email || '').toLowerCase();
        const name = (data.displayName || '').toLowerCase();
        if (!email.includes(search) && !name.includes(search)) {
          return;
        }
      }

      if (planFilter && data.plan !== planFilter) {
        return;
      }

      if (betaOnly && !data.isBetaTester) {
        return;
      }

      users.push({
        id: docSnap.id,
        email: data.email,
        displayName: data.displayName,
        plan: data.plan || 'free',
        storageUsed: data.storageUsed || 0,
        storageLimit: data.storageLimit,
        monthlyTransfers: data.monthlyTransfers || 0,
        maxMonthlyTransfers: data.maxMonthlyTransfers,
        isBetaTester: data.isBetaTester || false,
        isAdmin: data.isAdmin || false,
        subscriptionStatus: data.subscriptionStatus,
        stripeCustomerId: data.stripeCustomerId,
        createdAt: data.createdAt?.toDate()?.toISOString() || null,
        lastLoginAt: data.lastLoginAt?.toDate()?.toISOString() || null,
      });
    });

    // Sort by creation date (newest first)
    users.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt as string).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt as string).getTime() : 0;
      return dateB - dateA;
    });

    // Apply pagination
    const paginatedUsers = users.slice(0, pageSize);

    return NextResponse.json({
      success: true,
      users: paginatedUsers,
      total: users.length,
      hasMore: users.length > pageSize,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Errore nel recupero degli utenti' },
      { status: 500 }
    );
  }
}

// PATCH - Update user
export async function PATCH(request: NextRequest) {
  try {
    // SECURITY: CSRF Protection
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // Check admin access
    const adminCheck = await checkAdminAccess(request);
    if (adminCheck) return adminCheck;

    const body = await request.json();
    const { targetUserId, updates } = body;

    if (!targetUserId || !updates) {
      return NextResponse.json(
        { success: false, error: 'ID utente e aggiornamenti richiesti' },
        { status: 400 }
      );
    }

    // Allowed fields to update
    // CRITICAL: isAdmin is NOT in this list to prevent privilege escalation
    // Admin status should only be managed through environment variables or direct database access
    const allowedFields = [
      'plan',
      'storageLimit',
      'maxMonthlyTransfers',
      'retentionDays',
      'isBetaTester',
      'disabled',
    ];

    const sanitizedUpdates: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        sanitizedUpdates[field] = updates[field];
      }
    }

    const db = getAdminFirestore();
    const userSnap = await db.collection('users').doc(targetUserId).get();

    if (!userSnap.exists) {
      return NextResponse.json(
        { success: false, error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    await db.collection('users').doc(targetUserId).update(sanitizedUpdates);

    return NextResponse.json({
      success: true,
      message: 'Utente aggiornato con successo',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Errore nell\'aggiornamento dell\'utente' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user (admin only)
export async function DELETE(request: NextRequest) {
  try {
    // SECURITY: CSRF Protection
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'sensitive');
    if (rateLimitResponse) return rateLimitResponse;

    // Check admin access
    const adminCheck = await checkAdminAccess(request);
    if (adminCheck) return adminCheck;

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('targetUserId');

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'ID utente richiesto' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();
    const userSnap = await db.collection('users').doc(targetUserId).get();

    if (!userSnap.exists) {
      return NextResponse.json(
        { success: false, error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    // Check if trying to delete an admin
    const userData = userSnap.data() || {};
    if (userData.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Non puoi eliminare un account admin' },
        { status: 403 }
      );
    }

    // Delete user
    await db.collection('users').doc(targetUserId).delete();

    return NextResponse.json({
      success: true,
      message: 'Utente eliminato con successo',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'Errore nell\'eliminazione dell\'utente' },
      { status: 500 }
    );
  }
}
