import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let app: App;
let adminDb: Firestore;
let adminAuth: Auth;

function formatPrivateKey(key: string): string {
  // Check if the key is base64 encoded (doesn't start with -----)
  if (!key.startsWith('-----') && !key.includes('BEGIN')) {
    try {
      // Try to decode from base64
      const decoded = Buffer.from(key, 'base64').toString('utf-8');
      if (decoded.includes('-----BEGIN PRIVATE KEY-----')) {
        return decoded.endsWith('\n') ? decoded : decoded + '\n';
      }
    } catch {
      // Not base64, continue with normal processing
    }
  }

  // Remove surrounding quotes if present
  let formattedKey = key.replace(/^["']|["']$/g, '');

  // Handle escaped newlines from environment variables
  // Vercel and other platforms may store \n as literal characters
  // Try multiple replacement patterns

  // Pattern 1: Double-escaped newlines (\\n in the raw string)
  if (formattedKey.includes('\\n')) {
    formattedKey = formattedKey.split('\\n').join('\n');
  }

  // Pattern 2: Check if key has actual newlines already
  if (!formattedKey.includes('\n') && formattedKey.includes('-----BEGIN')) {
    // Key might be on a single line without any newlines
    // Try to reconstruct proper PEM format
    const beginMarker = '-----BEGIN PRIVATE KEY-----';
    const endMarker = '-----END PRIVATE KEY-----';

    if (formattedKey.includes(beginMarker) && formattedKey.includes(endMarker)) {
      const start = formattedKey.indexOf(beginMarker) + beginMarker.length;
      const end = formattedKey.indexOf(endMarker);
      const keyContent = formattedKey.substring(start, end).trim();

      // Split key content into 64-character lines (PEM standard)
      const lines = keyContent.match(/.{1,64}/g) || [];
      formattedKey = `${beginMarker}\n${lines.join('\n')}\n${endMarker}\n`;
    }
  }

  // Ensure the key ends with a newline
  if (!formattedKey.endsWith('\n')) {
    formattedKey += '\n';
  }

  return formattedKey;
}

function getFirebaseAdmin() {
  if (!getApps().length) {
    const privateKeyRaw = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;

    if (!privateKeyRaw || !clientEmail || !projectId) {
      throw new Error('Firebase Admin SDK credentials not configured. Missing: ' +
        [!privateKeyRaw && 'FIREBASE_ADMIN_PRIVATE_KEY', !clientEmail && 'FIREBASE_ADMIN_CLIENT_EMAIL', !projectId && 'FIREBASE_ADMIN_PROJECT_ID'].filter(Boolean).join(', '));
    }

    // Format the private key to handle various environment variable formats
    const privateKey = formatPrivateKey(privateKeyRaw);

    // Validate key format
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----') || !privateKey.includes('-----END PRIVATE KEY-----')) {
      throw new Error('Invalid private key format. Key must be a valid PEM-encoded private key.');
    }

    try {
      app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to initialize Firebase Admin SDK: ${errorMessage}`);
    }
  } else {
    app = getApps()[0];
  }

  if (!adminDb) {
    adminDb = getFirestore(app);
  }

  if (!adminAuth) {
    adminAuth = getAuth(app);
  }

  return { app, db: adminDb, auth: adminAuth };
}

// Export initialized instances
export const getAdminFirestore = () => getFirebaseAdmin().db;
export const getAdminAuth = () => getFirebaseAdmin().auth;

// For backwards compatibility, also export as named exports
export { getFirebaseAdmin };
