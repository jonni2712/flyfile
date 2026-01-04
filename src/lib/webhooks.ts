import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc, Timestamp, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import crypto from 'crypto';

export type WebhookEvent =
  | 'transfer.created'
  | 'transfer.downloaded'
  | 'transfer.expired'
  | 'transfer.deleted'
  | 'file.uploaded'
  | 'file.downloaded';

export interface Webhook {
  id: string;
  userId: string;
  name: string;
  url: string;
  secretMask: string; // Masked version for display (only last 4 chars shown)
  events: WebhookEvent[];
  isActive: boolean;
  failureCount: number;
  lastTriggeredAt?: Date;
  lastStatus?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Internal type with full secret for signing
interface WebhookWithSecret extends Omit<Webhook, 'secretMask'> {
  secret: string;
}

// SECURITY: Mask webhook secret for display (only show last 4 characters)
function maskSecret(secret: string): string {
  if (secret.length <= 8) return '••••••••';
  return `${'•'.repeat(secret.length - 4)}${secret.slice(-4)}`;
}

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, unknown>;
}

// Generate a webhook secret
export function generateWebhookSecret(): string {
  return `whsec_${crypto.randomBytes(24).toString('hex')}`;
}

// Sign a webhook payload
export function signWebhookPayload(payload: string, secret: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');
  return `t=${timestamp},v1=${signature}`;
}

// Create a new webhook
// SECURITY: Returns the full secret only once during creation
export async function createWebhook(params: {
  userId: string;
  name: string;
  url: string;
  events: WebhookEvent[];
}): Promise<{ webhook: Webhook; secret: string }> {
  const secret = generateWebhookSecret();

  const webhookData = {
    userId: params.userId,
    name: params.name,
    url: params.url,
    secret, // Stored in Firestore for signing payloads
    events: params.events,
    isActive: true,
    failureCount: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, 'webhooks'), webhookData);

  // Return webhook with masked secret for display
  const webhook: Webhook = {
    id: docRef.id,
    userId: webhookData.userId,
    name: webhookData.name,
    url: webhookData.url,
    secretMask: maskSecret(secret), // Masked for subsequent displays
    events: webhookData.events,
    isActive: webhookData.isActive,
    failureCount: webhookData.failureCount,
    createdAt: webhookData.createdAt.toDate(),
    updatedAt: webhookData.updatedAt.toDate(),
  };

  // Return full secret only once for user to save
  return { webhook, secret };
}

// Get all webhooks for a user (SECURITY: secrets are masked)
export async function getUserWebhooks(userId: string): Promise<Webhook[]> {
  const webhooksRef = collection(db, 'webhooks');
  const q = query(webhooksRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);

  const webhooks: Webhook[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    webhooks.push({
      id: docSnap.id,
      userId: data.userId,
      name: data.name,
      url: data.url,
      // SECURITY: Never expose full secret - only show masked version
      secretMask: maskSecret(data.secret || ''),
      events: data.events,
      isActive: data.isActive,
      failureCount: data.failureCount || 0,
      lastTriggeredAt: data.lastTriggeredAt?.toDate(),
      lastStatus: data.lastStatus,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    });
  });

  return webhooks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// Delete a webhook
export async function deleteWebhook(webhookId: string, userId: string): Promise<boolean> {
  const webhookRef = doc(db, 'webhooks', webhookId);
  const webhookSnap = await getDoc(webhookRef);

  if (!webhookSnap.exists()) {
    return false;
  }

  if (webhookSnap.data().userId !== userId) {
    return false;
  }

  await deleteDoc(webhookRef);
  return true;
}

// Toggle webhook active status
export async function toggleWebhook(webhookId: string, userId: string): Promise<boolean> {
  const webhookRef = doc(db, 'webhooks', webhookId);
  const webhookSnap = await getDoc(webhookRef);

  if (!webhookSnap.exists()) {
    return false;
  }

  const data = webhookSnap.data();
  if (data.userId !== userId) {
    return false;
  }

  await updateDoc(webhookRef, {
    isActive: !data.isActive,
    updatedAt: Timestamp.now(),
  });

  return true;
}

// Update webhook
export async function updateWebhook(
  webhookId: string,
  userId: string,
  updates: { name?: string; url?: string; events?: WebhookEvent[] }
): Promise<boolean> {
  const webhookRef = doc(db, 'webhooks', webhookId);
  const webhookSnap = await getDoc(webhookRef);

  if (!webhookSnap.exists()) {
    return false;
  }

  if (webhookSnap.data().userId !== userId) {
    return false;
  }

  await updateDoc(webhookRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });

  return true;
}

// Regenerate webhook secret
// SECURITY: Returns new secret only once - user must save it
export async function regenerateWebhookSecret(
  webhookId: string,
  userId: string
): Promise<string | null> {
  const webhookRef = doc(db, 'webhooks', webhookId);
  const webhookSnap = await getDoc(webhookRef);

  if (!webhookSnap.exists()) {
    return null;
  }

  if (webhookSnap.data().userId !== userId) {
    return null;
  }

  const newSecret = generateWebhookSecret();

  await updateDoc(webhookRef, {
    secret: newSecret,
    updatedAt: Timestamp.now(),
  });

  return newSecret;
}

// Trigger webhooks for an event
export async function triggerWebhooks(
  userId: string,
  event: WebhookEvent,
  data: Record<string, unknown>
): Promise<void> {
  try {
    // Get active webhooks for this user and event
    const webhooksRef = collection(db, 'webhooks');
    const q = query(
      webhooksRef,
      where('userId', '==', userId),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);

    const webhooksToTrigger: Array<{ id: string; url: string; secret: string }> = [];

    snapshot.forEach((docSnap) => {
      const webhookData = docSnap.data();
      if (webhookData.events.includes(event)) {
        webhooksToTrigger.push({
          id: docSnap.id,
          url: webhookData.url,
          secret: webhookData.secret,
        });
      }
    });

    // Trigger webhooks asynchronously
    for (const webhook of webhooksToTrigger) {
      sendWebhook(webhook.id, webhook.url, webhook.secret, event, data);
    }
  } catch (error) {
    console.error('Error triggering webhooks:', error);
  }
}

// Send a webhook (fire and forget)
async function sendWebhook(
  webhookId: string,
  url: string,
  secret: string,
  event: WebhookEvent,
  data: Record<string, unknown>
): Promise<void> {
  try {
    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    const payloadString = JSON.stringify(payload);
    const signature = signWebhookPayload(payloadString, secret);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': event,
        'User-Agent': 'FlyFile-Webhooks/1.0',
      },
      body: payloadString,
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    // Update webhook status
    const webhookRef = doc(db, 'webhooks', webhookId);
    await updateDoc(webhookRef, {
      lastTriggeredAt: Timestamp.now(),
      lastStatus: response.status,
      failureCount: response.ok ? 0 : (await getFailureCount(webhookId)) + 1,
    });

    // Disable webhook after too many failures
    const failureCount = await getFailureCount(webhookId);
    if (failureCount >= 10) {
      await updateDoc(webhookRef, {
        isActive: false,
      });
      console.log(`Webhook ${webhookId} disabled after ${failureCount} failures`);
    }
  } catch (error) {
    console.error(`Webhook delivery failed for ${webhookId}:`, error);

    // Update failure count
    const webhookRef = doc(db, 'webhooks', webhookId);
    const currentFailures = await getFailureCount(webhookId);
    await updateDoc(webhookRef, {
      lastTriggeredAt: Timestamp.now(),
      lastStatus: 0,
      failureCount: currentFailures + 1,
    });
  }
}

async function getFailureCount(webhookId: string): Promise<number> {
  const webhookRef = doc(db, 'webhooks', webhookId);
  const webhookSnap = await getDoc(webhookRef);
  return webhookSnap.exists() ? webhookSnap.data().failureCount || 0 : 0;
}

// Check if user can use webhooks (Business plan only)
export async function canUseWebhooks(userId: string): Promise<boolean> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return false;
  }

  const userData = userSnap.data();
  return userData.plan === 'business';
}

// Available webhook events
export const WEBHOOK_EVENTS: { event: WebhookEvent; label: string; description: string }[] = [
  { event: 'transfer.created', label: 'Transfer Creato', description: 'Quando viene creato un nuovo transfer' },
  { event: 'transfer.downloaded', label: 'Transfer Scaricato', description: 'Quando qualcuno scarica i file' },
  { event: 'transfer.expired', label: 'Transfer Scaduto', description: 'Quando un transfer scade' },
  { event: 'transfer.deleted', label: 'Transfer Eliminato', description: 'Quando un transfer viene eliminato' },
  { event: 'file.uploaded', label: 'File Caricato', description: 'Quando un file viene caricato' },
  { event: 'file.downloaded', label: 'File Scaricato', description: 'Quando un singolo file viene scaricato' },
];
