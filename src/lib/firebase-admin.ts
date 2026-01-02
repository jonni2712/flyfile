import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let app: App;
let adminDb: Firestore;
let adminAuth: Auth;

function getFirebaseAdmin() {
  if (!getApps().length) {
    // Get private key and handle newline characters
    // Vercel may store the key with literal \n or actual newlines
    let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    if (!privateKey || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !process.env.FIREBASE_ADMIN_PROJECT_ID) {
      throw new Error('Firebase Admin SDK credentials not configured');
    }

    // Handle different formats of private key
    // If the key contains literal \n strings, replace them with actual newlines
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    // Remove any surrounding quotes that might have been added
    privateKey = privateKey.replace(/^["']|["']$/g, '');

    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
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
