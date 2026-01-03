import { NextRequest, NextResponse } from 'next/server';
import { deleteWebhook, toggleWebhook, updateWebhook, WebhookEvent, WEBHOOK_EVENTS } from '@/lib/webhooks';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireAuth, isAuthorizedForUser } from '@/lib/auth-utils';

// DELETE - Delete a webhook
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

    const { id: webhookId } = await params;
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

    const deleted = await deleteWebhook(webhookId, userId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Webhook non trovato o non autorizzato' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook eliminato',
    });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione del webhook' },
      { status: 500 }
    );
  }
}

// PATCH - Toggle webhook status or update settings
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

    const { id: webhookId } = await params;
    const body = await request.json();
    const { userId, action, name, url, events } = body;

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

    // Toggle action
    if (action === 'toggle') {
      const toggled = await toggleWebhook(webhookId, userId);

      if (!toggled) {
        return NextResponse.json(
          { error: 'Webhook non trovato o non autorizzato' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Stato webhook aggiornato',
      });
    }

    // Update action
    const updates: { name?: string; url?: string; events?: WebhookEvent[] } = {};

    if (name) {
      if (name.length < 1 || name.length > 50) {
        return NextResponse.json(
          { error: 'Nome deve essere 1-50 caratteri' },
          { status: 400 }
        );
      }
      updates.name = name;
    }

    if (url) {
      if (!url.startsWith('https://')) {
        return NextResponse.json(
          { error: 'URL HTTPS richiesto' },
          { status: 400 }
        );
      }
      updates.url = url;
    }

    if (events) {
      if (!Array.isArray(events) || events.length === 0) {
        return NextResponse.json(
          { error: 'Almeno un evento richiesto' },
          { status: 400 }
        );
      }

      const validEvents = WEBHOOK_EVENTS.map((e) => e.event);
      const invalidEvents = events.filter((e: string) => !validEvents.includes(e as WebhookEvent));
      if (invalidEvents.length > 0) {
        return NextResponse.json(
          { error: `Eventi non validi: ${invalidEvents.join(', ')}` },
          { status: 400 }
        );
      }
      updates.events = events as WebhookEvent[];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'Nessun aggiornamento specificato' },
        { status: 400 }
      );
    }

    const updated = await updateWebhook(webhookId, userId, updates);

    if (!updated) {
      return NextResponse.json(
        { error: 'Webhook non trovato o non autorizzato' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook aggiornato',
    });
  } catch (error) {
    console.error('Error updating webhook:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento del webhook' },
      { status: 500 }
    );
  }
}
