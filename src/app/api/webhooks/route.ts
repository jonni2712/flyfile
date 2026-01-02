import { NextRequest, NextResponse } from 'next/server';
import { createWebhook, getUserWebhooks, canUseWebhooks, WebhookEvent, WEBHOOK_EVENTS } from '@/lib/webhooks';
import { checkRateLimit } from '@/lib/rate-limit';

// GET - List all webhooks for a user
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

    // Check if user can use webhooks
    const canUse = await canUseWebhooks(userId);
    if (!canUse) {
      return NextResponse.json(
        { error: 'Piano Business richiesto per i webhooks' },
        { status: 403 }
      );
    }

    const webhooks = await getUserWebhooks(userId);

    // Hide secrets in response
    const safeWebhooks = webhooks.map((w) => ({
      ...w,
      secret: `${w.secret.substring(0, 12)}...`, // Only show prefix
    }));

    return NextResponse.json({
      success: true,
      webhooks: safeWebhooks,
      availableEvents: WEBHOOK_EVENTS,
    });
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei webhooks' },
      { status: 500 }
    );
  }
}

// POST - Create a new webhook
export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { userId, name, url, events } = body;

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

    if (!url || !url.startsWith('https://')) {
      return NextResponse.json(
        { error: 'URL HTTPS richiesto' },
        { status: 400 }
      );
    }

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'Almeno un evento richiesto' },
        { status: 400 }
      );
    }

    // Validate events
    const validEvents = WEBHOOK_EVENTS.map((e) => e.event);
    const invalidEvents = events.filter((e: string) => !validEvents.includes(e as WebhookEvent));
    if (invalidEvents.length > 0) {
      return NextResponse.json(
        { error: `Eventi non validi: ${invalidEvents.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if user can use webhooks
    const canUse = await canUseWebhooks(userId);
    if (!canUse) {
      return NextResponse.json(
        { error: 'Piano Business richiesto per i webhooks' },
        { status: 403 }
      );
    }

    // Check max webhooks limit (5 per user)
    const existingWebhooks = await getUserWebhooks(userId);
    if (existingWebhooks.length >= 5) {
      return NextResponse.json(
        { error: 'Limite massimo di 5 webhooks raggiunto' },
        { status: 400 }
      );
    }

    const { webhook, secret } = await createWebhook({
      userId,
      name,
      url,
      events: events as WebhookEvent[],
    });

    return NextResponse.json({
      success: true,
      webhook: {
        ...webhook,
        secret: `${secret.substring(0, 12)}...`, // Hide most of secret
      },
      fullSecret: secret, // This is shown only once!
      message: 'Webhook creato. Salva il secret, non sarà più visibile!',
    });
  } catch (error) {
    console.error('Error creating webhook:', error);
    return NextResponse.json(
      { error: 'Errore nella creazione del webhook' },
      { status: 500 }
    );
  }
}
