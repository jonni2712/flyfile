import { NextRequest, NextResponse } from 'next/server';
import { createApiKey, getUserApiKeys, canUseApiKeys } from '@/lib/api-keys';
import { checkRateLimit } from '@/lib/rate-limit';

// GET - List all API keys for a user
export async function GET(request: NextRequest) {
  try {
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

    // Check if user can use API keys
    const canUse = await canUseApiKeys(userId);
    if (!canUse) {
      return NextResponse.json(
        { error: 'Piano Pro o Business richiesto per le API keys' },
        { status: 403 }
      );
    }

    const keys = await getUserApiKeys(userId);

    return NextResponse.json({
      success: true,
      keys,
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle API keys' },
      { status: 500 }
    );
  }
}

// POST - Create a new API key
export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { userId, name, permissions, expiresInDays } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId richiesto' },
        { status: 400 }
      );
    }

    if (!name || name.length < 1 || name.length > 50) {
      return NextResponse.json(
        { error: 'Nome richiesto (1-50 caratteri)' },
        { status: 400 }
      );
    }

    // Check if user can use API keys
    const canUse = await canUseApiKeys(userId);
    if (!canUse) {
      return NextResponse.json(
        { error: 'Piano Pro o Business richiesto per le API keys' },
        { status: 403 }
      );
    }

    // Check max keys limit (10 per user)
    const existingKeys = await getUserApiKeys(userId);
    if (existingKeys.length >= 10) {
      return NextResponse.json(
        { error: 'Limite massimo di 10 API keys raggiunto' },
        { status: 400 }
      );
    }

    const { apiKey, fullKey } = await createApiKey({
      userId,
      name,
      permissions: permissions || ['read', 'write'],
      expiresInDays,
    });

    return NextResponse.json({
      success: true,
      apiKey,
      fullKey, // This is shown only once!
      message: 'API key creata. Salva la chiave, non sarà più visibile!',
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Errore nella creazione della API key' },
      { status: 500 }
    );
  }
}
