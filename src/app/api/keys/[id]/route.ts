import { NextRequest, NextResponse } from 'next/server';
import { deleteApiKey, toggleApiKeyStatus } from '@/lib/api-keys';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireAuth, isAuthorizedForUser } from '@/lib/auth-utils';

// DELETE - Delete an API key
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // Verify authentication
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const { id: keyId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId richiesto' },
        { status: 400 }
      );
    }

    // Verify authorized
    if (!isAuthorizedForUser(authResult, userId)) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    const deleted = await deleteApiKey(keyId, userId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'API key non trovata o non autorizzato' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'API key eliminata',
    });
  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione della API key' },
      { status: 500 }
    );
  }
}

// PATCH - Toggle API key status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // Verify authentication
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const { id: keyId } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId richiesto' },
        { status: 400 }
      );
    }

    // Verify authorized
    if (!isAuthorizedForUser(authResult, userId)) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    const toggled = await toggleApiKeyStatus(keyId, userId);

    if (!toggled) {
      return NextResponse.json(
        { error: 'API key non trovata o non autorizzato' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Stato API key aggiornato',
    });
  } catch (error) {
    console.error('Error toggling API key:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento della API key' },
      { status: 500 }
    );
  }
}
