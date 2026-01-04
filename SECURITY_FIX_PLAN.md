# PIANO DI REMEDIATION SICUREZZA - FLYFILE

**Data creazione:** 2026-01-03
**Priorità:** CRITICA
**Tempo stimato totale:** 3-5 giorni lavorativi

---

## PANORAMICA FASI

```
FASE 1: EMERGENZA (P0)     → 4-6 ore   → Blocca vulnerabilità critiche
FASE 2: CONSOLIDAMENTO (P1) → 1-2 giorni → Rafforza autenticazione
FASE 3: HARDENING (P2)      → 1-2 giorni → Migliora sicurezza generale
FASE 4: QUALITY (P3)        → Ongoing    → Test, monitoring, docs
```

---

## FASE 1: EMERGENZA (P0) - Entro 24 ore

### 1.1 Fix Firestore Rules - CRITICO
**Tempo:** 30 minuti
**File:** `firestore.rules`
**Rischio se non fatto:** Chiunque può modificare qualsiasi file nel database

```javascript
// PRIMA (VULNERABILE)
match /files/{fileId} {
  allow read: if true;
  allow create: if true;
  allow update: if true;  // ❌ CRITICO
  allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
}

// DOPO (SICURO)
match /files/{fileId} {
  allow read: if true;
  allow create: if isAuthenticated();
  allow update: if isAuthenticated() && resource.data.userId == request.auth.uid;
  allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
}
```

**Checklist:**
- [ ] Backup regole attuali
- [ ] Modificare regola `files` collection
- [ ] Verificare regola `transfers` collection
- [ ] Verificare regola `anonymousUsers` collection
- [ ] Deploy: `firebase deploy --only firestore:rules`
- [ ] Test: tentare update da utente non-owner → deve fallire

---

### 1.2 Fix Download Password Bypass - CRITICO
**Tempo:** 1 ora
**File:** `src/app/api/files/download-url/route.ts`
**Rischio se non fatto:** Password protection completamente bypassabile

```typescript
// AGGIUNGERE dopo riga 10
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// MODIFICARE la verifica password (circa riga 134)
// PRIMA (VULNERABILE)
if (transferData.password && !passwordVerified) {
  return NextResponse.json({ error: 'Password verification required' }, { status: 401 });
}

// DOPO (SICURO) - Opzione 1: Richiedi password ad ogni download
if (transferData.password) {
  const { password } = body;
  if (!password) {
    return NextResponse.json(
      { error: 'Password richiesta per questo transfer', requiresPassword: true },
      { status: 401 }
    );
  }
  const isValid = await verifyPassword(password, transferData.password);
  if (!isValid) {
    return NextResponse.json(
      { error: 'Password non corretta' },
      { status: 401 }
    );
  }
}
```

**Checklist:**
- [ ] Rimuovere parametro `passwordVerified` dalla destrutturazione body
- [ ] Aggiungere logica verifica password server-side
- [ ] Aggiornare client `src/app/download/[id]/page.tsx` per inviare password
- [ ] Test: tentare download senza password → deve fallire
- [ ] Test: tentare download con password errata → deve fallire
- [ ] Test: download con password corretta → deve funzionare

---

### 1.3 Fix Upload URL Authentication - CRITICO
**Tempo:** 1.5 ore
**File:** `src/app/api/files/upload-url/route.ts`
**Rischio se non fatto:** Chiunque può caricare file attribuendoli ad altri utenti

```typescript
// AGGIUNGERE import all'inizio
import { requireAuth, isAuthorizedForUser } from '@/lib/auth-utils';

// MODIFICARE la funzione POST (dopo rate limit check)
export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await checkRateLimit(request, 'upload');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { fileName, contentType, fileSize, isAnonymous, senderEmail, transferId } = body;

    let userId: string;
    let userPlan: 'anonymous' | 'free' | 'starter' | 'pro' | 'business' = 'free';

    if (isAnonymous) {
      // Upload anonimo - genera ID server-side
      userId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      userPlan = 'anonymous';
    } else {
      // CRITICAL: Verifica autenticazione per utenti registrati
      const [authResult, authError] = await requireAuth(request);
      if (authError) return authError;

      userId = authResult.userId!;

      // Recupera piano utente dal database
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        userPlan = userDoc.data()?.plan || 'free';
      }
    }

    // Continua con validazione file...
```

**Checklist:**
- [ ] Aggiungere import `requireAuth`
- [ ] Rimuovere `userId` dalla destrutturazione body per utenti autenticati
- [ ] Verificare token per utenti non-anonimi
- [ ] Usare userId dal token verificato
- [ ] Test: upload senza token → deve fallire (401)
- [ ] Test: upload anonimo → deve funzionare
- [ ] Test: upload autenticato → deve usare userId del token

---

### 1.4 Fix Team Invitation Authentication - ALTO
**Tempo:** 45 minuti
**File:** `src/app/api/team/invitation/[token]/route.ts`
**Rischio se non fatto:** Chiunque può accettare inviti team per conto di altri

```typescript
// AGGIUNGERE import all'inizio
import { requireAuth, isAuthorizedForUser } from '@/lib/auth-utils';

// MODIFICARE la funzione POST (riga 97+)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // CRITICAL: Richiedi autenticazione
    const [authResult, authError] = await requireAuth(request);
    if (authError) return authError;

    const userId = authResult.userId!;  // Usa userId dal token verificato

    // Rimuovere: const { userId } = body;  // NON fidarsi del body

    // ... resto del codice usa userId verificato
```

**Checklist:**
- [ ] Aggiungere `requireAuth` check
- [ ] Usare userId dal token invece che dal body
- [ ] Test: accettare invito senza auth → deve fallire
- [ ] Test: accettare invito autenticato → deve funzionare
- [ ] Test: accettare invito con email diversa → deve fallire

---

### 1.5 Applicare File Validation Server-Side
**Tempo:** 30 minuti
**File:** `src/app/api/files/upload-url/route.ts`
**Rischio se non fatto:** Upload di file malevoli (exe, scripts)

```typescript
// AGGIUNGERE import
import { validateFile, sanitizeFilename } from '@/lib/file-validation';

// AGGIUNGERE dopo aver determinato userPlan
const validation = validateFile(fileName, contentType, fileSize, userPlan);
if (!validation.valid) {
  return NextResponse.json(
    { error: validation.error, code: validation.errorCode },
    { status: 400 }
  );
}

// Sanitizza filename
const sanitizedFileName = sanitizeFilename(fileName);

// Usa sanitizedFileName per generare r2Key
const r2Key = generateFileKey(userId, sanitizedFileName);
```

**Checklist:**
- [ ] Importare funzioni da file-validation.ts
- [ ] Chiamare validateFile prima di generare URL
- [ ] Sanitizzare filename
- [ ] Test: upload .exe → deve fallire
- [ ] Test: upload file troppo grande per piano → deve fallire

---

## FASE 2: CONSOLIDAMENTO (P1) - Giorni 2-3

### 2.1 Creare Middleware Edge Protection
**Tempo:** 2 ore
**File:** `src/middleware.ts` (NUOVO)

```typescript
import { NextRequest, NextResponse } from 'next/server';

// Route che richiedono autenticazione
const protectedRoutes = [
  '/dashboard',
  '/upload',
  '/files',
  '/profile',
  '/team',
  '/settings',
  '/api-keys',
];

// Route solo per admin
const adminRoutes = ['/admin'];

// Route auth (redirect se già loggato)
const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

// Route pubbliche (nessun check)
const publicRoutes = ['/', '/download', '/pricing', '/privacy', '/terms', '/contact'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip per asset statici e API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // file statici
  ) {
    return NextResponse.next();
  }

  // Verifica sessione Firebase (cookie __session)
  const sessionCookie = request.cookies.get('__session');
  const isAuthenticated = !!sessionCookie?.value;

  // Route protette: redirect a login se non autenticato
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Route admin: redirect se non autenticato (check admin avviene in API)
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  if (isAdminRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Route auth: redirect a dashboard se già loggato
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Aggiungi security headers
  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
};
```

**Checklist:**
- [ ] Creare file `src/middleware.ts`
- [ ] Configurare route protette
- [ ] Aggiungere security headers
- [ ] Test: accesso /dashboard non autenticato → redirect /login
- [ ] Test: accesso /admin non autenticato → redirect /login
- [ ] Test: accesso /login autenticato → redirect /dashboard

---

### 2.2 Fix Admin Frontend - Auth Headers
**Tempo:** 1 ora
**File:** `src/app/admin/page.tsx`

```typescript
// MODIFICARE le fetch per includere Authorization header

const fetchData = async () => {
  if (!user) return;

  try {
    setLoading(true);

    // Ottieni token Firebase
    const idToken = await user.getIdToken();
    const headers = {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    };

    // Fetch parallelo con auth headers
    const [statsRes, usersRes, transfersRes] = await Promise.all([
      fetch('/api/admin/stats', { headers }),
      fetch('/api/admin/users', { headers }),
      fetch('/api/admin/transfers', { headers }),
    ]);

    // ... resto della logica
  } catch (error) {
    // ...
  }
};
```

**Checklist:**
- [ ] Rimuovere `?userId=` da tutte le URL
- [ ] Aggiungere `Authorization: Bearer ${idToken}` header
- [ ] Usare Promise.all per fetch parallele
- [ ] Test: pannello admin funziona
- [ ] Test: pannello admin senza token → 401

---

### 2.3 Cifrare 2FA Secret
**Tempo:** 1.5 ore
**Files:**
- `src/lib/encryption.ts` (NUOVO)
- `src/lib/two-factor.ts`

**Nuovo file `src/lib/encryption.ts`:**
```typescript
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

export function encrypt(text: string, key: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const keyBuffer = Buffer.from(key, 'hex');

  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedData: string, key: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const keyBuffer = Buffer.from(key, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

**Modifiche a `src/lib/two-factor.ts`:**
```typescript
import { encrypt, decrypt } from './encryption';

const TOTP_ENCRYPTION_KEY = process.env.TOTP_ENCRYPTION_KEY!;

// In enable2FA function
export async function enable2FA(userId: string, secret: string, backupCodes: string[]): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userId);
    const hashedCodes = hashBackupCodes(backupCodes);

    // Cifra il secret prima di salvarlo
    const encryptedSecret = encrypt(secret, TOTP_ENCRYPTION_KEY);

    await updateDoc(userRef, {
      twoFactorEnabled: true,
      twoFactorSecret: encryptedSecret,  // Ora cifrato!
      twoFactorBackupCodes: hashedCodes,
      twoFactorEnabledAt: Timestamp.now(),
    });

    return true;
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    return false;
  }
}

// In verify2FA function - decifra prima di usare
const decryptedSecret = decrypt(data.twoFactorSecret, TOTP_ENCRYPTION_KEY);
if (verifyTotp(decryptedSecret, token)) {
  return { valid: true };
}
```

**Checklist:**
- [ ] Generare TOTP_ENCRYPTION_KEY (32 bytes hex)
- [ ] Aggiungere a .env: `TOTP_ENCRYPTION_KEY=<chiave>`
- [ ] Creare `src/lib/encryption.ts`
- [ ] Modificare enable2FA per cifrare
- [ ] Modificare verify2FA per decifrare
- [ ] Test: setup 2FA → verifica funziona
- [ ] Verificare in Firestore che secret è cifrato

---

### 2.4 Rendere Upstash Obbligatorio in Produzione
**Tempo:** 30 minuti
**File:** `src/lib/rate-limit.ts`

```typescript
// All'inizio del file
const isProduction = process.env.NODE_ENV === 'production';

// In checkRateLimit function
export async function checkRateLimit(request: NextRequest, type: RateLimitType): Promise<NextResponse | null> {
  // CRITICAL: In produzione, Upstash è obbligatorio
  if (isProduction && (!UPSTASH_REDIS_URL || !UPSTASH_REDIS_TOKEN)) {
    console.error('CRITICAL: Upstash Redis not configured in production!');
    // Fail closed - blocca la richiesta
    return NextResponse.json(
      { error: 'Service temporarily unavailable' },
      { status: 503 }
    );
  }

  // ... resto della funzione
}
```

**Checklist:**
- [ ] Aggiungere check produzione
- [ ] Fail closed invece di fallback in-memory
- [ ] Verificare Upstash configurato su Vercel
- [ ] Test locale: funziona con fallback
- [ ] Test staging: verifica Upstash attivo

---

## FASE 3: HARDENING (P2) - Giorni 4-5

### 3.1 Implementare CSRF Protection
**Tempo:** 2 ore
**Files:**
- `src/lib/csrf.ts` (NUOVO)
- Tutti gli endpoint mutativi

**Nuovo file `src/lib/csrf.ts`:**
```typescript
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_BASE_URL,
  'https://flyfile.it',
  'https://www.flyfile.it',
].filter(Boolean);

export function validateOrigin(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // Per richieste senza origin (same-origin), controlla referer
  const sourceOrigin = origin || (referer ? new URL(referer).origin : null);

  if (!sourceOrigin) {
    // Richieste da tool come curl - permetti solo in dev
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return NextResponse.json({ error: 'Origin required' }, { status: 403 });
  }

  if (!ALLOWED_ORIGINS.includes(sourceOrigin)) {
    console.warn(`CSRF: Blocked request from ${sourceOrigin}`);
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }

  return null;
}
```

**Uso negli endpoint:**
```typescript
import { validateOrigin } from '@/lib/csrf';

export async function POST(request: NextRequest) {
  // CSRF check
  const csrfError = validateOrigin(request);
  if (csrfError) return csrfError;

  // ... resto dell'endpoint
}
```

**Checklist:**
- [ ] Creare `src/lib/csrf.ts`
- [ ] Aggiungere a tutti i POST/PATCH/DELETE endpoints:
  - [ ] `/api/profile`
  - [ ] `/api/files/upload-url`
  - [ ] `/api/files/delete`
  - [ ] `/api/transfer/*`
  - [ ] `/api/team/*`
  - [ ] `/api/webhooks`
  - [ ] `/api/2fa/*`
  - [ ] `/api/admin/*`
- [ ] Test: richiesta da origin non autorizzato → 403

---

### 3.2 Audit Completo Firestore Rules
**Tempo:** 1 ora
**File:** `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isAdmin() {
      return isAuthenticated() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isOwner(userId);
      allow delete: if false; // Solo via Admin SDK
    }

    // Transfers collection
    match /transfers/{transferId} {
      // Lettura: owner o transfer pubblico
      allow read: if resource.data.userId == request.auth.uid
        || resource.data.status == 'active';
      allow create: if isAuthenticated();
      allow update: if isOwner(resource.data.userId);
      allow delete: if isOwner(resource.data.userId);

      // Files subcollection
      match /files/{fileId} {
        allow read: if true; // Download pubblico
        allow write: if isOwner(get(/databases/$(database)/documents/transfers/$(transferId)).data.userId);
      }
    }

    // Files collection (standalone)
    match /files/{fileId} {
      allow read: if resource.data.isPublic == true || isOwner(resource.data.userId);
      allow create: if isAuthenticated();
      allow update: if isOwner(resource.data.userId);
      allow delete: if isOwner(resource.data.userId);
    }

    // Teams
    match /teams/{teamId} {
      allow read: if isOwner(resource.data.ownerId) ||
        exists(/databases/$(database)/documents/teamMembers/$(request.auth.uid + '_' + teamId));
      allow create: if isAuthenticated();
      allow update: if isOwner(resource.data.ownerId);
      allow delete: if isOwner(resource.data.ownerId);
    }

    // Team Members
    match /teamMembers/{memberId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated(); // Validazione in backend
      allow update: if false; // Solo via Admin SDK
      allow delete: if isAuthenticated(); // Validazione in backend
    }

    // Team Invitations
    match /teamInvitations/{invitationId} {
      allow read: if resource.data.email == request.auth.token.email;
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if isAuthenticated();
    }

    // API Keys
    match /apiKeys/{keyId} {
      allow read: if isOwner(resource.data.userId);
      allow create: if isAuthenticated();
      allow update: if isOwner(resource.data.userId);
      allow delete: if isOwner(resource.data.userId);
    }

    // Webhooks
    match /webhooks/{webhookId} {
      allow read: if isOwner(resource.data.userId);
      allow create: if isAuthenticated();
      allow update: if isOwner(resource.data.userId);
      allow delete: if isOwner(resource.data.userId);
    }

    // Anonymous Users - Limitato
    match /anonymousUsers/{anonId} {
      allow read: if false; // Solo via Admin SDK
      allow create: if true; // Necessario per upload anonimi
      allow update: if false;
      allow delete: if false;
    }
  }
}
```

**Checklist:**
- [ ] Backup regole attuali
- [ ] Applicare nuove regole
- [ ] Test ogni collection:
  - [ ] users: solo owner può leggere/modificare
  - [ ] transfers: pubblici leggibili, solo owner modifica
  - [ ] files: solo owner modifica
  - [ ] teams: solo membri leggono
  - [ ] apiKeys: solo owner
  - [ ] webhooks: solo owner

---

### 3.3 Aggiungere Error Boundaries
**Tempo:** 1 ora
**File:** `src/app/error.tsx` (NUOVO), `src/app/global-error.tsx` (NUOVO)

```typescript
// src/app/error.tsx
'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Qualcosa è andato storto</h1>
        <p className="text-blue-200/70 mb-8">
          Si è verificato un errore inaspettato. Il nostro team è stato notificato.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Riprova
        </button>
      </div>
    </div>
  );
}
```

**Checklist:**
- [ ] Creare `src/app/error.tsx`
- [ ] Creare `src/app/global-error.tsx`
- [ ] Aggiungere error boundaries specifici per route critiche
- [ ] Integrare con servizio monitoring (Sentry)

---

### 3.4 Sanitizzare Error Messages in Produzione
**Tempo:** 30 minuti
**File:** `src/lib/errors.ts` (NUOVO)

```typescript
export function sanitizeError(error: unknown): string {
  if (process.env.NODE_ENV === 'development') {
    return error instanceof Error ? error.message : String(error);
  }

  // In produzione, messaggi generici
  return 'Si è verificato un errore. Riprova più tardi.';
}

export function logError(context: string, error: unknown): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  // In produzione, invia a servizio logging
  console.error(`[${context}]`, { message: errorMessage, stack });

  // TODO: Inviare a Sentry/LogRocket
}
```

**Uso:**
```typescript
import { sanitizeError, logError } from '@/lib/errors';

catch (error) {
  logError('upload-url', error);
  return NextResponse.json(
    { error: sanitizeError(error) },
    { status: 500 }
  );
}
```

---

### 3.5 Rendere reCAPTCHA Fail-Closed
**Tempo:** 15 minuti
**File:** `src/lib/recaptcha.ts`

```typescript
// MODIFICARE la funzione verifyRecaptchaToken
export async function verifyRecaptchaToken(
  token: string,
  expectedAction?: RecaptchaAction
): Promise<RecaptchaVerificationResult> {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!RECAPTCHA_SECRET_KEY) {
    if (isProduction) {
      // FAIL CLOSED in produzione
      console.error('CRITICAL: reCAPTCHA not configured in production');
      return {
        success: false,
        isBot: true,
        error: 'Security check unavailable'
      };
    }
    // In dev, permetti (con warning)
    console.warn('reCAPTCHA secret key not configured - allowing in development');
    return { success: true, isBot: false };
  }

  // ... resto della funzione
}
```

---

## FASE 4: QUALITY (P3) - Ongoing

### 4.1 Setup Test Suite
**Tempo:** 4 ore iniziali
**Files:**
- `vitest.config.ts` (NUOVO)
- `src/__tests__/` directory

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/__tests__/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Test prioritari da scrivere:**
1. Auth utils - `requireAuth`, `isAuthorizedForUser`
2. File validation - `validateFile`, `sanitizeFilename`
3. Password - `hashPassword`, `verifyPassword`
4. Rate limiting - `checkRateLimit`
5. API routes - integration tests

---

### 4.2 Setup Monitoring & Alerting
**Tempo:** 2 ore

**Checklist:**
- [ ] Configurare Sentry per error tracking
- [ ] Setup Vercel Analytics
- [ ] Configurare alerting per:
  - [ ] Error rate > 1%
  - [ ] Response time > 2s
  - [ ] Rate limit exceeded
  - [ ] Failed auth attempts > threshold
- [ ] Setup log aggregation (Vercel Logs o esterno)

---

### 4.3 Documentazione Sicurezza
**Tempo:** 2 ore

**Creare:**
- [ ] `SECURITY.md` - policy di sicurezza e contatti
- [ ] Runbook per incident response
- [ ] Checklist deploy sicuro
- [ ] Documentazione API con note sicurezza

---

## TIMELINE RIASSUNTIVA

```
Giorno 1 (URGENTE):
├── 09:00-09:30  Fix Firestore rules
├── 09:30-10:30  Fix download password bypass
├── 10:30-12:00  Fix upload URL auth
├── 12:00-12:45  Fix team invitation auth
├── 14:00-14:30  Apply file validation
├── 14:30-16:00  Testing fixes P0
└── 16:00-17:00  Deploy e verifica produzione

Giorno 2:
├── 09:00-11:00  Creare middleware.ts
├── 11:00-12:00  Fix admin frontend
├── 14:00-15:30  Cifrare 2FA secrets
└── 15:30-16:00  Upstash obbligatorio

Giorno 3:
├── 09:00-11:00  CSRF protection
├── 11:00-12:00  Audit Firestore rules completo
├── 14:00-15:00  Error boundaries
├── 15:00-15:30  Sanitize errors
└── 15:30-16:00  reCAPTCHA fail-closed

Giorni 4-5:
├── Setup test suite
├── Scrivere test critici
├── Setup monitoring
└── Documentazione
```

---

## COMANDI UTILI

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Verificare regole
firebase emulators:start

# Test locali
npm run dev

# Build per verificare errori
npm run build

# Generare chiave cifratura TOTP
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## NOTE IMPORTANTI

1. **Backup prima di ogni modifica** - Fare snapshot Firestore
2. **Test su staging** - Non deployare direttamente in prod
3. **Rollback plan** - Avere sempre versione precedente pronta
4. **Comunicazione** - Notificare team prima di deploy critici
5. **Monitoring** - Controllare metriche dopo ogni deploy

---

**Documento creato da:** Security Audit Team
**Ultima modifica:** 2026-01-03
**Prossima review:** Dopo completamento Fase 2
