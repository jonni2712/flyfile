import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { checkRateLimit } from '@/lib/rate-limit';

// GET - Get brand settings by slug (public endpoint for download pages)
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug')?.toLowerCase();

    if (!slug) {
      return NextResponse.json(
        { error: 'slug richiesto' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();

    // Find user with this slug
    const usersSnapshot = await db.collection('users')
      .where('brand.customSlug', '==', slug)
      .where('brand.customSlugVerified', '==', true)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      return NextResponse.json(
        { error: 'Slug non trovato' },
        { status: 404 }
      );
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    const brand = userData.brand || {};
    const plan = userData.plan || 'free';

    // Return public brand data (don't expose sensitive fields)
    return NextResponse.json({
      success: true,
      userId: userDoc.id,
      slug: brand.customSlug,
      brand: {
        logoUrl: brand.logoUrl,
        backgroundUrl: brand.backgroundUrl,
        backgroundType: brand.backgroundType,
        backgroundVideoUrl: brand.backgroundVideoUrl,
        primaryColor: brand.primaryColor,
        secondaryColor: brand.secondaryColor,
        companyName: brand.companyName,
        customMessage: brand.customMessage,
        // Business plan can hide "Powered by FlyFile"
        showPoweredBy: plan !== 'business' || brand.showPoweredBy !== false,
      },
    });
  } catch (error) {
    console.error('Error fetching brand by slug:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero del brand' },
      { status: 500 }
    );
  }
}
