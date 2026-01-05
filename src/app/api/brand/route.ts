import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { requireAuth, isAuthorizedForUser } from '@/lib/auth-utils';
import { checkRateLimit } from '@/lib/rate-limit';
import { getPlanLimits } from '@/types';
import { getUploadUrl, deleteFile } from '@/lib/r2';

// GET - Get brand settings for a user
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId richiesto' },
        { status: 400 }
      );
    }

    // For public access (download page), allow fetching brand without auth
    const isPublicRequest = searchParams.get('public') === 'true';

    if (!isPublicRequest) {
      // Require auth for non-public requests
      const [authResult, authError] = await requireAuth(request);
      if (authError) return authError;

      if (!isAuthorizedForUser(authResult, userId)) {
        return NextResponse.json(
          { error: 'Non autorizzato' },
          { status: 403 }
        );
      }
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
    const brand = userData.brand || null;
    const plan = userData.plan || 'free';
    const planLimits = getPlanLimits(plan);

    return NextResponse.json({
      success: true,
      brand,
      canCustomize: planLimits.customBranding,
      canRemovePoweredBy: planLimits.removePoweredBy,
      plan,
    });
  } catch (error) {
    console.error('Error fetching brand settings:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle impostazioni brand' },
      { status: 500 }
    );
  }
}

// POST - Update brand settings
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // Require authentication
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const body = await request.json();
    const { userId, brand } = body;

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
    const plan = userData.plan || 'free';
    const planLimits = getPlanLimits(plan);

    // Check if user can customize branding
    if (!planLimits.customBranding) {
      return NextResponse.json(
        {
          error: 'Il branding personalizzato non è disponibile per il tuo piano. Passa a Pro o Business.',
          code: 'FEATURE_NOT_AVAILABLE'
        },
        { status: 403 }
      );
    }

    // Enforce showPoweredBy for non-business plans
    const brandSettings = {
      ...brand,
      showPoweredBy: planLimits.removePoweredBy ? (brand.showPoweredBy ?? true) : true,
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Update user document with brand settings
    await userRef.update({
      brand: brandSettings,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Impostazioni brand salvate',
      brand: brandSettings,
    });
  } catch (error) {
    console.error('Error saving brand settings:', error);
    return NextResponse.json(
      { error: 'Errore nel salvataggio delle impostazioni brand' },
      { status: 500 }
    );
  }
}

// PUT - Get presigned URL for brand asset upload
export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // Require authentication
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const body = await request.json();
    const { userId, assetType, contentType, fileName } = body;

    if (!userId || !assetType || !contentType) {
      return NextResponse.json(
        { error: 'userId, assetType e contentType richiesti' },
        { status: 400 }
      );
    }

    // Validate asset type
    if (!['logo', 'background', 'backgroundVideo'].includes(assetType)) {
      return NextResponse.json(
        { error: 'Tipo asset non valido' },
        { status: 400 }
      );
    }

    // Validate content type
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    const allowedVideoTypes = ['video/mp4', 'video/webm'];

    if (assetType === 'backgroundVideo' && !allowedVideoTypes.includes(contentType)) {
      return NextResponse.json(
        { error: 'Tipo video non supportato. Usa MP4 o WebM.' },
        { status: 400 }
      );
    }

    if (assetType !== 'backgroundVideo' && !allowedImageTypes.includes(contentType)) {
      return NextResponse.json(
        { error: 'Tipo immagine non supportato. Usa JPEG, PNG, GIF, WebP o SVG.' },
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
    const plan = userData.plan || 'free';
    const planLimits = getPlanLimits(plan);

    if (!planLimits.customBranding) {
      return NextResponse.json(
        {
          error: 'Il branding personalizzato non è disponibile per il tuo piano.',
          code: 'FEATURE_NOT_AVAILABLE'
        },
        { status: 403 }
      );
    }

    // Generate unique key for the asset
    const timestamp = Date.now();
    const extension = fileName?.split('.').pop() || contentType.split('/')[1] || 'bin';
    const r2Key = `brand/${userId}/${assetType}-${timestamp}.${extension}`;

    // Get presigned upload URL
    const uploadUrl = await getUploadUrl(r2Key, contentType, 3600);

    // Delete old asset if exists
    const oldBrand = userData.brand || {};
    const oldPathKey = assetType === 'backgroundVideo' ? 'backgroundVideoPath' :
                       assetType === 'background' ? 'backgroundPath' : 'logoPath';

    if (oldBrand[oldPathKey]) {
      try {
        await deleteFile(oldBrand[oldPathKey]);
      } catch (err) {
        console.error('Error deleting old brand asset:', err);
      }
    }

    return NextResponse.json({
      success: true,
      uploadUrl,
      r2Key,
      publicUrl: `${process.env.R2_PUBLIC_URL || ''}/${r2Key}`,
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return NextResponse.json(
      { error: 'Errore nella generazione dell\'URL di upload' },
      { status: 500 }
    );
  }
}

// DELETE - Remove brand asset
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
    const assetType = searchParams.get('assetType');

    if (!userId || !assetType) {
      return NextResponse.json(
        { error: 'userId e assetType richiesti' },
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
    const brand = userData.brand || {};

    // Determine which fields to clear
    let pathKey: string, urlKey: string;
    if (assetType === 'logo') {
      pathKey = 'logoPath';
      urlKey = 'logoUrl';
    } else if (assetType === 'background') {
      pathKey = 'backgroundPath';
      urlKey = 'backgroundUrl';
    } else if (assetType === 'backgroundVideo') {
      pathKey = 'backgroundVideoPath';
      urlKey = 'backgroundVideoUrl';
    } else {
      return NextResponse.json(
        { error: 'Tipo asset non valido' },
        { status: 400 }
      );
    }

    // Delete from R2 if exists
    if (brand[pathKey]) {
      try {
        await deleteFile(brand[pathKey]);
      } catch (err) {
        console.error('Error deleting brand asset from R2:', err);
      }
    }

    // Update brand settings
    const updatedBrand = { ...brand };
    delete updatedBrand[pathKey];
    delete updatedBrand[urlKey];

    // Reset background type if removing background
    if (assetType === 'background' || assetType === 'backgroundVideo') {
      updatedBrand.backgroundType = 'gradient';
    }

    await userRef.update({
      brand: updatedBrand,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Asset rimosso con successo',
    });
  } catch (error) {
    console.error('Error deleting brand asset:', error);
    return NextResponse.json(
      { error: 'Errore nella rimozione dell\'asset' },
      { status: 500 }
    );
  }
}
