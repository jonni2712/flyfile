import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { requireAuth, isAuthorizedForUser } from '@/lib/auth-utils';
import { checkRateLimit } from '@/lib/rate-limit';
import { getPlanLimits } from '@/types';

// Reserved slugs that cannot be used
const RESERVED_SLUGS = [
  // English (legacy + API routes)
  'admin', 'api', 'app', 'dashboard', 'download', 'help', 'login', 'logout',
  'pricing', 'profile', 'register', 'settings', 'support', 'team', 'upload',
  'files', 'transfer', 'transfers', 'user', 'users', 'account', 'billing',
  'branding', 'analytics', 'webhooks', 'docs', 'documentation', 'privacy',
  'terms', 'security', 'contact', 'about', 'blog', 'status', 'health',
  // Italian (current public routes)
  'funzionalita', 'documentazione', 'supporto', 'contatti', 'termini',
  'cookie', 'sicurezza', 'accedi', 'registrati', 'scarica', 'abbonamento',
  'prezzi', 'chi-siamo',
  // Brand/system
  'flyfile', 'fly', 'file', 's', 't', 'd', 'p', 'www', 'mail', 'email',
];

// Validate slug format
function isValidSlugFormat(slug: string): boolean {
  // Must be 3-30 characters, alphanumeric and hyphens only, no leading/trailing hyphens
  const slugRegex = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;
  return slugRegex.test(slug) && !slug.includes('--');
}

// GET - Check if a slug is available
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug')?.toLowerCase();
    const userId = searchParams.get('userId');

    if (!slug) {
      return NextResponse.json(
        { error: 'slug richiesto' },
        { status: 400 }
      );
    }

    // Validate format
    if (!isValidSlugFormat(slug)) {
      return NextResponse.json({
        available: false,
        error: 'Formato non valido. Usa 3-30 caratteri: lettere, numeri e trattini.',
      });
    }

    // Check reserved
    if (RESERVED_SLUGS.includes(slug)) {
      return NextResponse.json({
        available: false,
        error: 'Questo slug è riservato.',
      });
    }

    const db = getAdminFirestore();

    // Check if slug is already taken by another user
    const usersSnapshot = await db.collection('users')
      .where('brand.customSlug', '==', slug)
      .limit(1)
      .get();

    if (!usersSnapshot.empty) {
      const ownerDoc = usersSnapshot.docs[0];
      // If the current user owns this slug, it's "available" for them
      if (userId && ownerDoc.id === userId) {
        return NextResponse.json({
          available: true,
          ownedByUser: true,
          message: 'Questo è il tuo slug attuale.',
        });
      }

      return NextResponse.json({
        available: false,
        error: 'Questo slug è già in uso.',
      });
    }

    return NextResponse.json({
      available: true,
      message: 'Slug disponibile!',
    });
  } catch (error) {
    console.error('Error checking slug:', error);
    return NextResponse.json(
      { error: 'Errore nel controllo dello slug' },
      { status: 500 }
    );
  }
}

// POST - Reserve/claim a slug
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // Require authentication
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const body = await request.json();
    const { userId, slug } = body;

    if (!userId || !slug) {
      return NextResponse.json(
        { error: 'userId e slug richiesti' },
        { status: 400 }
      );
    }

    const normalizedSlug = slug.toLowerCase().trim();

    // Verify authorization
    if (!isAuthorizedForUser(authResult, userId)) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    // Validate format
    if (!isValidSlugFormat(normalizedSlug)) {
      return NextResponse.json(
        { error: 'Formato slug non valido. Usa 3-30 caratteri: lettere minuscole, numeri e trattini.' },
        { status: 400 }
      );
    }

    // Check reserved
    if (RESERVED_SLUGS.includes(normalizedSlug)) {
      return NextResponse.json(
        { error: 'Questo slug è riservato e non può essere utilizzato.' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    const userData = userSnap.data() || {};
    const plan = userData.plan || 'free';
    const planLimits = getPlanLimits(plan);

    // Check if user can use custom links
    if (!planLimits.customLinks) {
      return NextResponse.json(
        {
          error: 'I link personalizzati non sono disponibili per il tuo piano. Passa a Pro o Business.',
          code: 'FEATURE_NOT_AVAILABLE'
        },
        { status: 403 }
      );
    }

    // Check if slug is already taken (by someone else)
    const existingSnapshot = await db.collection('users')
      .where('brand.customSlug', '==', normalizedSlug)
      .limit(1)
      .get();

    if (!existingSnapshot.empty) {
      const ownerDoc = existingSnapshot.docs[0];
      if (ownerDoc.id !== userId) {
        return NextResponse.json(
          { error: 'Questo slug è già in uso da un altro utente.' },
          { status: 409 }
        );
      }
      // User already owns this slug
      return NextResponse.json({
        success: true,
        slug: normalizedSlug,
        message: 'Questo è già il tuo slug.',
      });
    }

    // Update user's brand settings with the new slug
    const currentBrand = userData.brand || {};
    await userRef.update({
      brand: {
        ...currentBrand,
        customSlug: normalizedSlug,
        customSlugVerified: true,
      },
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      slug: normalizedSlug,
      message: 'Slug registrato con successo!',
    });
  } catch (error) {
    console.error('Error reserving slug:', error);
    return NextResponse.json(
      { error: 'Errore nella registrazione dello slug' },
      { status: 500 }
    );
  }
}

// DELETE - Release a slug
export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // Require authentication
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId richiesto' },
        { status: 400 }
      );
    }

    // Verify authorization
    if (!isAuthorizedForUser(authResult, userId)) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    const userData = userSnap.data() || {};
    const currentBrand = userData.brand || {};

    // Remove slug from brand settings
    const { customSlug, customSlugVerified, ...restBrand } = currentBrand;

    await userRef.update({
      brand: restBrand,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Slug rimosso con successo.',
    });
  } catch (error) {
    console.error('Error releasing slug:', error);
    return NextResponse.json(
      { error: 'Errore nella rimozione dello slug' },
      { status: 500 }
    );
  }
}
