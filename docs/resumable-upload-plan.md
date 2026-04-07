# Piano: Resumable Upload con R2 Multipart + IndexedDB

> **Status**: PIANIFICATO — non implementato. Decisione di implementazione legata ai dati GA4 (vedi sezione "Criteri di decisione").
>
> **Stato attuale (versione semplificata)**: l'upload usa già auto-retry con exponential backoff (3 tentativi, vedi `src/lib/upload-with-progress.ts`). Risolve l'80% delle interruzioni di rete temporanee. Il presente piano descrive la versione "vera" di resumable upload che sopravvive a refresh, chiusura tab e crash.

---

## 📋 Sommario esecutivo

Implementare un sistema di upload chunked che permetta di:
- **Riprendere** un upload interrotto dopo refresh, chiusura tab, crash o spegnimento della macchina
- **Proseguire** dal punto esatto in cui era stato interrotto, senza ricaricare le parti già completate
- **Ridurre il drop-off** su upload lunghi (file >500MB su rete instabile)
- **Differenziare** FlyFile da WeTransfer (che non offre questa feature)

**Costo stimato**: 1500-2000 righe di nuovo codice, ~10 nuovi file, riscrittura del modulo encryption.

**Rischio principale**: la riscrittura della crittografia client-side per supportare streaming è il punto più delicato — un errore qui rompe la decifratura lato destinatario.

---

## 🎯 Criteri di decisione

Implementare **SOLO SE** almeno 2 di questi 3 indicatori sono veri (misurati su 30 giorni di dati GA4):

| Indicatore | Soglia | Come misurarlo |
|---|---|---|
| Drop-off `upload_started` → `upload_completed` | ≥ 12% | GA4 funnel exploration |
| % di upload con `total_bytes` >500MB | ≥ 20% | GA4 dimension breakdown su `upload_started` |
| % traffico mobile (sender) | ≥ 30% | GA4 device category |

Se solo 1/3 è vero, considerare la **versione intermedia low-cost** (sezione "Alternativa pragmatica").

---

## 🧩 Architettura

### Flusso completo

```
[CLIENT]                                    [SERVER]                              [R2]
   │                                          │                                    │
   │── 1. POST /upload-init ──────────────────►                                    │
   │   {fileName, size, contentType}           │── createMultipartUpload() ────────►
   │                                          │◄──── uploadId ──────────────────────
   │                                          │                                    │
   │                                          │── save in Firestore                │
   │                                          │   multipartUploads/{uploadId}      │
   │◄── {uploadId, key, partSize, totalParts} ┤                                    │
   │                                          │                                    │
   │── save in IndexedDB ─►                                                         │
   │   {uploadId, blob, metadata}                                                  │
   │                                                                                │
   │ ┌─ for each part (1 to totalParts) ─┐                                         │
   │ │                                    │                                         │
   │ │── 2. POST /upload-part-url ────────►                                         │
   │ │   {uploadId, partNumber}           │── verify ownership                     │
   │ │                                    │── getUploadPartUrl() ──────────────────►
   │ │                                    │◄── presigned URL ───────────────────────
   │ │◄── {url} ──────────────────────────┤                                         │
   │ │                                                                              │
   │ │── PUT direct to R2 ──────────────────────────────────────────────────────────►
   │ │   body = file.slice(start, end)                                              │
   │ │◄── {ETag} (header) ──────────────────────────────────────────────────────────┤
   │ │                                                                              │
   │ │── update IndexedDB ─►                                                        │
   │ │   completedParts.push({partNumber, etag})                                    │
   │ └────────────────────────────────────┘                                         │
   │                                                                                │
   │── 3. POST /upload-complete ──────────────►                                    │
   │   {uploadId, parts: [{partNumber, etag}]}│── verify ownership                 │
   │                                          │── completeMultipartUpload() ───────►
   │                                          │◄── ok ──────────────────────────────
   │                                          │                                    │
   │                                          │── create files/{fileId}            │
   │                                          │── delete multipartUploads/{id}     │
   │                                          │── update users/{uid}.storageUsed   │
   │◄── {success, fileId} ────────────────────┤                                    │
   │                                                                                │
   │── delete from IndexedDB ─►                                                     │
```

### Resume flow (post refresh)

```
[CLIENT mount]
   │
   │── loadIncompleteUploads() from IndexedDB ─►
   │◄── [{uploadId, blob, completedParts: [1,2,3], totalParts: 10}]
   │
   │── show ResumeBanner ─►
   │   "Hai un upload in sospeso: 'video.mp4' (30% completato)"
   │   [Riprendi] [Annulla]
   │
   │ User clicks Riprendi:
   │
   │── start from partNumber = 4
   │── reuse existing uploadId
   │── continue the for-each-part loop above
```

---

## 📂 File da creare / modificare

### 🆕 Nuovi file

| File | Righe stimate | Responsabilità |
|---|---|---|
| `src/app/api/files/upload-init/route.ts` | ~120 | Init multipart, validate plan limits, save state in Firestore |
| `src/app/api/files/upload-part-url/route.ts` | ~80 | Genera presigned URL per la singola parte |
| `src/app/api/files/upload-complete/route.ts` | ~150 | Complete multipart, finalizza file Firestore, aggiorna storage |
| `src/app/api/files/upload-abort/route.ts` | ~60 | Aborta multipart su R2 (chiamato su Annulla manuale) |
| `src/app/api/cron/cleanup-multipart/route.ts` | ~100 | Cron giornaliero che aborta upload >6 giorni |
| `src/lib/upload-storage.ts` | ~150 | Wrapper IndexedDB per blob persistence |
| `src/lib/upload-multipart.ts` | ~250 | Client-side chunking, retry per parte, ETag parsing |
| `src/lib/encryption-streaming.ts` | ~200 | Web Crypto TransformStream per cifrare in streaming |
| `src/components/ResumeUploadBanner.tsx` | ~80 | UI banner per riprendere upload incompleti |
| `src/hooks/useResumableUploads.ts` | ~80 | Hook che carica/refresha upload incompleti da IndexedDB |
| `vercel.json` | ~10 | Cron schedule per cleanup |

### ✏️ File da modificare

| File | Cosa cambia |
|---|---|
| `src/lib/r2.ts` | + 4 funzioni: `createMultipartUpload`, `getUploadPartUrl`, `completeMultipartUpload`, `abortMultipartUpload` |
| `src/lib/client-encryption.ts` | Riscrittura per usare TransformStream invece di in-memory encrypt |
| `src/context/TransferContext.tsx` | Branch su size: file <100MB → flusso single-PUT esistente; file ≥100MB → multipart |
| `src/app/[locale]/HomePageClient.tsx` | Mount: check IndexedDB + render `<ResumeUploadBanner />` |
| `src/types/index.ts` | + tipo `ResumableUploadState` |
| `firestore.rules` | + regole per `multipartUploads` collection (solo owner può leggere/scrivere) |

---

## 🔧 Implementazione dettagliata

### 1. R2 helpers (`src/lib/r2.ts`)

Aggiungere ai existing exports:

```typescript
import {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  CompletedPart,
} from '@aws-sdk/client-s3';

// Crea sessione multipart, ritorna uploadId univoco
export async function createMultipartUpload(
  key: string,
  contentType: string
): Promise<string> {
  const command = new CreateMultipartUploadCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });
  const response = await r2Client.send(command);
  if (!response.UploadId) {
    throw new Error('R2 did not return uploadId');
  }
  return response.UploadId;
}

// Presigned URL per UNA parte specifica
export async function getUploadPartUrl(
  key: string,
  uploadId: string,
  partNumber: number,
  expiresIn = 3600
): Promise<string> {
  const command = new UploadPartCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber,
  });
  return getSignedUrl(r2Client, command, { expiresIn });
}

// Riassembla tutte le parti in un singolo file su R2
export async function completeMultipartUpload(
  key: string,
  uploadId: string,
  parts: CompletedPart[]
): Promise<void> {
  const command = new CompleteMultipartUploadCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: { Parts: parts },
  });
  await r2Client.send(command);
}

// Aborta upload incompleto (cleanup R2 storage)
export async function abortMultipartUpload(
  key: string,
  uploadId: string
): Promise<void> {
  const command = new AbortMultipartUploadCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    UploadId: uploadId,
  });
  await r2Client.send(command);
}
```

### 2. API route: `/upload-init`

```typescript
// src/app/api/files/upload-init/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { createMultipartUpload } from '@/lib/r2';
import { checkRateLimit } from '@/lib/rate-limit';
import { PLANS } from '@/types';

const PART_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_PARTS = 10000; // R2/S3 limit

export async function POST(req: NextRequest) {
  const rateLimitResponse = await checkRateLimit(req, 'upload-init');
  if (rateLimitResponse) return rateLimitResponse;

  const auth = await verifyAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { fileName, fileSize, contentType, transferId } = await req.json();

  // Plan limit checks
  const db = getAdminFirestore();
  const userDoc = await db.collection('users').doc(auth.userId!).get();
  const userData = userDoc.data() || {};
  const plan = PLANS[userData.plan || 'free'];
  const storageUsed = userData.storageUsed || 0;

  if (plan.storageLimit !== -1 && storageUsed + fileSize > plan.storageLimit) {
    return NextResponse.json(
      { error: 'Storage limit exceeded' },
      { status: 402 }
    );
  }

  // Calculate parts
  const totalParts = Math.ceil(fileSize / PART_SIZE);
  if (totalParts > MAX_PARTS) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_PARTS * PART_SIZE} bytes per file)` },
      { status: 400 }
    );
  }

  // Create R2 multipart session
  const key = `users/${auth.userId}/${transferId}/${Date.now()}-${fileName}`;
  const uploadId = await createMultipartUpload(key, contentType);

  // Persist multipart state in Firestore for ownership verification
  await db.collection('multipartUploads').doc(uploadId).set({
    uploadId,
    userId: auth.userId,
    transferId,
    key,
    fileName,
    fileSize,
    contentType,
    totalParts,
    partSize: PART_SIZE,
    createdAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ uploadId, key, partSize: PART_SIZE, totalParts });
}
```

### 3. API route: `/upload-part-url`

```typescript
// src/app/api/files/upload-part-url/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { getUploadPartUrl } from '@/lib/r2';

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { uploadId, partNumber } = await req.json();

  if (!Number.isInteger(partNumber) || partNumber < 1 || partNumber > 10000) {
    return NextResponse.json({ error: 'Invalid partNumber' }, { status: 400 });
  }

  // Verify ownership
  const db = getAdminFirestore();
  const stateDoc = await db.collection('multipartUploads').doc(uploadId).get();
  if (!stateDoc.exists || stateDoc.data()?.userId !== auth.userId) {
    return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
  }

  const { key } = stateDoc.data()!;
  const url = await getUploadPartUrl(key, uploadId, partNumber);
  return NextResponse.json({ url });
}
```

### 4. API route: `/upload-complete`

```typescript
// src/app/api/files/upload-complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { completeMultipartUpload } from '@/lib/r2';

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { uploadId, parts } = await req.json();

  if (!Array.isArray(parts) || parts.length === 0) {
    return NextResponse.json({ error: 'Missing parts' }, { status: 400 });
  }

  // Verify ownership and load state
  const db = getAdminFirestore();
  const stateDoc = await db.collection('multipartUploads').doc(uploadId).get();
  if (!stateDoc.exists || stateDoc.data()?.userId !== auth.userId) {
    return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
  }

  const state = stateDoc.data()!;
  if (parts.length !== state.totalParts) {
    return NextResponse.json(
      { error: `Expected ${state.totalParts} parts, got ${parts.length}` },
      { status: 400 }
    );
  }

  // R2 expects parts sorted by PartNumber with ETag
  const sortedParts = parts
    .map((p: { partNumber: number; etag: string }) => ({
      PartNumber: p.partNumber,
      ETag: p.etag,
    }))
    .sort((a, b) => a.PartNumber - b.PartNumber);

  await completeMultipartUpload(state.key, uploadId, sortedParts);

  // Create file record
  const fileRef = await db.collection('files').add({
    userId: auth.userId,
    transferId: state.transferId,
    fileName: state.fileName,
    originalName: state.fileName,
    mimeType: state.contentType,
    size: state.fileSize,
    storageKey: state.key,
    createdAt: FieldValue.serverTimestamp(),
  });

  // Update user storage atomically
  await db.collection('users').doc(auth.userId!).update({
    storageUsed: FieldValue.increment(state.fileSize),
  });

  // Cleanup multipart state
  await db.collection('multipartUploads').doc(uploadId).delete();

  return NextResponse.json({ success: true, fileId: fileRef.id });
}
```

### 5. IndexedDB wrapper (`src/lib/upload-storage.ts`)

```typescript
const DB_NAME = 'flyfile-uploads';
const DB_VERSION = 1;
const STORE = 'resumableUploads';

export interface ResumableUpload {
  uploadId: string;
  key: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  totalParts: number;
  partSize: number;
  completedParts: { partNumber: number; etag: string }[];
  blob: Blob;            // IndexedDB supports Blob natively
  transferMetadata: {    // Original transfer form state
    title: string;
    message?: string;
    recipientEmail?: string;
    deliveryMethod: 'email' | 'link';
    expiryDays: number;
    password?: string;
  };
  createdAt: number;
  updatedAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'uploadId' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveUploadState(state: ResumableUpload): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put({ ...state, updatedAt: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadIncompleteUploads(): Promise<ResumableUpload[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as ResumableUpload[]);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteUploadState(uploadId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(uploadId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Cleanup uploads older than N days (called periodically)
export async function pruneOldUploads(maxAgeDays = 7): Promise<void> {
  const all = await loadIncompleteUploads();
  const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
  await Promise.all(
    all.filter((u) => u.createdAt < cutoff).map((u) => deleteUploadState(u.uploadId))
  );
}
```

### 6. Client multipart uploader (`src/lib/upload-multipart.ts`)

```typescript
import { saveUploadState, ResumableUpload } from './upload-storage';

interface MultipartOptions {
  file: File | Blob;
  uploadId: string;
  totalParts: number;
  partSize: number;
  startFromPart?: number;
  alreadyCompleted?: { partNumber: number; etag: string }[];
  getPartUrl: (partNumber: number) => Promise<string>;
  onProgress?: (bytesUploaded: number, totalBytes: number) => void;
  onPartComplete?: (partNumber: number, etag: string) => Promise<void>;
}

const MAX_RETRIES = 5;

function uploadPart(
  url: string,
  blob: Blob
): Promise<{ etag: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url, true);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // R2 returns ETag in the response header (with quotes)
        const etag = xhr.getResponseHeader('ETag')?.replace(/"/g, '') || '';
        if (!etag) {
          reject(new Error('No ETag in response'));
          return;
        }
        resolve({ etag });
      } else {
        reject(new Error(`Part upload failed: ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(blob);
  });
}

async function uploadPartWithRetry(
  url: string,
  blob: Blob
): Promise<{ etag: string }> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await uploadPart(url, blob);
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
      }
    }
  }
  throw lastError;
}

export async function uploadMultipart(
  opts: MultipartOptions
): Promise<{ partNumber: number; etag: string }[]> {
  const completed = [...(opts.alreadyCompleted || [])];
  const startFrom = opts.startFromPart || completed.length + 1;
  let bytesUploaded = (startFrom - 1) * opts.partSize;

  for (let partNumber = startFrom; partNumber <= opts.totalParts; partNumber++) {
    const start = (partNumber - 1) * opts.partSize;
    const end = Math.min(start + opts.partSize, opts.file.size);
    const blob = opts.file.slice(start, end);

    const url = await opts.getPartUrl(partNumber);
    const { etag } = await uploadPartWithRetry(url, blob);

    completed.push({ partNumber, etag });
    bytesUploaded += blob.size;

    opts.onProgress?.(bytesUploaded, opts.file.size);

    // Persist progress to IndexedDB after each successful part
    if (opts.onPartComplete) {
      await opts.onPartComplete(partNumber, etag);
    }
  }

  return completed;
}
```

### 7. Encryption streaming refactor (`src/lib/encryption-streaming.ts`)

⚠️ **Sezione più delicata**. La crittografia attuale (`client-encryption.ts`) cifra l'intero file in memoria. Questo non scala oltre ~500MB-1GB e impedisce il chunking lazy.

```typescript
// PSEUDOCODICE — l'implementazione vera richiede attenta gestione degli IV
// e validazione end-to-end con un destinatario reale.

export async function createEncryptingStream(
  file: File,
  key: CryptoKey
): Promise<{ encryptedStream: ReadableStream<Uint8Array>; iv: Uint8Array; size: number }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const transformer = new TransformStream<Uint8Array, Uint8Array>({
    async transform(chunk, controller) {
      // AES-GCM richiede tag authentication per chunk — usare AES-CTR
      // oppure AES-GCM con counter mode esplicito per evitare di
      // leggere tutto il file in memoria
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-CTR', counter: iv, length: 128 },
        key,
        chunk
      );
      controller.enqueue(new Uint8Array(encrypted));
    },
  });
  const stream = file.stream().pipeThrough(transformer);
  return { encryptedStream: stream, iv, size: file.size };
}

// Helper: convert ReadableStream to Blob for R2 upload (chunk-by-chunk)
export async function streamToBlobs(
  stream: ReadableStream<Uint8Array>,
  chunkSize: number
): Promise<Blob[]> {
  // Implementation buffers up to chunkSize bytes, emits a Blob, repeats
}
```

**ALTERNATIVA SEMPLIFICATA**: cifrare ogni parte con un IV derivato dal `partNumber + file IV iniziale`. Questo evita lo streaming ma richiede che il destinatario sappia ricomporre l'IV chunk-per-chunk durante la decifratura. Più rischioso ma più semplice.

### 8. Vercel Cron cleanup

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-multipart",
      "schedule": "0 3 * * *"
    }
  ]
}
```

```typescript
// src/app/api/cron/cleanup-multipart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { abortMultipartUpload } from '@/lib/r2';

export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel sets x-vercel-cron-signature)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getAdminFirestore();
  const cutoff = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
  const snapshot = await db
    .collection('multipartUploads')
    .where('createdAt', '<', cutoff)
    .get();

  let aborted = 0;
  for (const doc of snapshot.docs) {
    const { key, uploadId } = doc.data();
    try {
      await abortMultipartUpload(key, uploadId);
      await doc.ref.delete();
      aborted++;
    } catch (err) {
      console.error(`Failed to abort ${uploadId}:`, err);
    }
  }

  return NextResponse.json({ aborted });
}
```

---

## ⚠️ Insidie e gotcha

### Critiche
1. **CORS R2**: configurare manualmente nella dashboard Cloudflare. Aggiungere:
   ```json
   {
     "AllowedMethods": ["PUT", "GET"],
     "AllowedOrigins": ["https://flyfile.it", "http://localhost:3000"],
     "AllowedHeaders": ["*"],
     "ExposeHeaders": ["ETag"],
     "MaxAgeSeconds": 3600
   }
   ```
   Senza `ExposeHeaders: ["ETag"]`, il browser blocca l'accesso all'header ETag e tutto il flusso si rompe silenziosamente.

2. **ETag con virgolette**: R2 ritorna `"abc123"` con doppi apici letterali. Devi rimuoverli con `.replace(/"/g, '')` prima del complete, altrimenti R2 rifiuta.

3. **Encryption + multipart**: impossibile usare AES-GCM standard con multipart perché richiede tag authentication sull'intero ciphertext. Soluzioni:
   - **AES-CTR**: nessun tag, va bene per multipart, ma perde l'autenticazione
   - **AES-GCM con IV per chunk**: ogni chunk ha il suo IV derivato + tag, richiede formato custom
   - **Skip encryption per file >100MB** (compromesso pragmatico ma riduce il valore differenziante)

4. **Quota IndexedDB su Safari iOS**: ~50MB di default fino al primo prompt utente. Su file >50MB serve gestire `QuotaExceededError` e mostrare messaggio chiaro.

### Minori
5. **PartNumber max 10.000**: per file >50GB serve aumentare `PART_SIZE` a 10MB+
6. **Race condition multi-tab**: 2 tab che riprendono lo stesso upload simultaneamente → usare `BroadcastChannel` o un lock in IndexedDB
7. **Garbage collection IndexedDB**: pulire upload completati subito per non riempire lo storage browser
8. **Firefox object cloning**: alcune versioni vecchie di Firefox non clonano correttamente Blob in IndexedDB su transazioni concorrenti

---

## 🧪 Piano di testing

### Test funzionali

| Test | Setup | Atteso |
|---|---|---|
| Upload completo file 1GB | Throttling: nessuno | Successo, file decifrabile |
| Upload con throttling Slow 3G | DevTools throttling | Successo (con auto-retry) |
| Refresh metà upload | Ctrl+R a 50% | Banner "Riprendi" + ripresa dal chunk corretto |
| Chiusura tab metà upload | Cmd+W | Banner al prossimo accesso |
| Force kill browser metà upload | kill -9 chrome | Banner al prossimo accesso |
| Annulla upload manualmente | Click "Annulla" | Multipart abortito su R2, stato pulito |
| Upload 2 file paralleli | 2 file >100MB | Entrambi tracciati separatamente in IDB |
| Upload >50GB (1 chunk = 10MB) | File 50GB | Successo (test su rete veloce) |
| Refresh in mezzo a `/upload-complete` | Refresh a 99% | Stato in Firestore "incompleto", retry al prossimo accesso |
| Quota IndexedDB piena | Pre-riempire IDB | Errore esplicito + suggerimento "libera spazio" |

### Test di sicurezza

- Tentare di completare un `uploadId` di un altro utente → 404
- Tentare di richiedere `partNumber` per `uploadId` non proprio → 404
- Tentare di completare con `parts` modificati → R2 rifiuta (ETag mismatch)
- Tentare di superare il plan limit con resume → 402 al complete

### Test performance

- File 1GB su rete 100Mbps: misurare tempo totale vs single-PUT attuale
- File 100MB con 10% packet loss: misurare numero di retry medio
- 100 upload abbandonati simultanei: verificare cleanup cron

---

## 📊 Strategia di rollout

### Feature flag

```typescript
// src/lib/feature-flags.ts
export function shouldUseMultipart(file: File, userPlan: string): boolean {
  // Solo file >100MB usano multipart, gli altri stay single-PUT
  if (file.size < 100 * 1024 * 1024) return false;

  // Rollout graduale per piano (Pro/Business prima, free dopo)
  if (userPlan === 'business' || userPlan === 'pro') return true;

  // % rollout per free/starter
  const rolloutPercent = parseInt(process.env.NEXT_PUBLIC_MULTIPART_ROLLOUT || '0');
  return Math.random() * 100 < rolloutPercent;
}
```

### Fasi di rollout

1. **Settimana 1**: Solo dev environment, dogfooding interno
2. **Settimana 2**: Staging con testing automatizzato + manuale (lista test sopra)
3. **Settimana 3**: Production solo plan `business` (utenti più sofisticati, meno strict sulla regressione)
4. **Settimana 4**: Production `pro` + `business`
5. **Settimana 5+**: Production `free` + `starter` con rollout 10% → 50% → 100%

### Rollback

- **Trigger**: errore rate >2% sulle API multipart, o report utenti di file corrotti
- **Procedura**: settare `NEXT_PUBLIC_MULTIPART_ROLLOUT=0` e ridepoyare. Il branching nel codice cade automaticamente sul flusso single-PUT esistente. Gli upload già iniziati con multipart restano in IndexedDB e possono essere ripuliti manualmente.

---

## 💰 Costi operativi

### Aumento costi R2

- **Storage temporaneo**: parti incomplete sono fatturate finché non viene chiamato `complete` o `abort`. Con cleanup giornaliero a 6 giorni, max esposizione = 6 giorni di "spazzatura" per upload abbandonato.
- **Class A operations** (CreateMultipartUpload, UploadPart, CompleteMultipartUpload): R2 le fattura a $4.50 per milione. Per 100k upload/mese da 50 parti ciascuno = 5M operazioni = $22.50/mese.
- **Riduzione attesa**: upload riusciti aumentano (meno utenti che droppano), quindi più completi → più storage finale → più revenue.

### Aumento costi Firestore

- 1 read + 1 write per `multipartUploads/{uploadId}` ogni init/complete → trascurabile

### Aumento costi Vercel

- Cron giornaliero: $0 (è incluso nei piani Pro/Hobby)
- Function invocations: ogni parte = 1 invocation di `/upload-part-url` → 50 invocations per file da 250MB → potrebbe essere significativo su 100k upload/mese (5M invocations). Verificare se rientra nel piano corrente.

---

## ⏱️ Stima sforzo

| Fase | Componenti | Complessità |
|---|---|---|
| **Fase A** | R2 helpers + 3 API routes (no encryption, no IDB) | 🟡 2-3 giorni |
| **Fase B** | IndexedDB + resume banner UI | 🟡 1-2 giorni |
| **Fase C** | Encryption streaming refactor | 🔴 3-5 giorni |
| **Fase D** | Cron cleanup + monitoring | 🟢 1 giorno |
| **Fase E** | Testing manuale completo | 🟡 2-3 giorni |
| **Fase F** | Rollout graduale + monitoring | 🟢 1 settimana di osservazione passiva |

**Totale realistico**: 2-3 settimane di lavoro focalizzato.

---

## 🎨 Alternativa pragmatica (low-cost)

Se i dati GA4 NON giustificano la versione completa, considerare questa versione "intermedia" che richiede ~30 minuti:

**Salvare in localStorage solo i metadati** dell'upload interrotto (NON il blob):

```typescript
// On upload start
localStorage.setItem('flyfile:incomplete-upload', JSON.stringify({
  fileName: file.name,
  fileSize: file.size,
  title, message, recipientEmail,
  startedAt: Date.now(),
}));

// On upload complete
localStorage.removeItem('flyfile:incomplete-upload');

// On mount
const incomplete = localStorage.getItem('flyfile:incomplete-upload');
if (incomplete) {
  // Show banner: "Hai interrotto l'upload di 'video.mp4' (250MB).
  //               Riselezionalo per ricominciare."
  // [Riseleziona file] [Ignora]
}
```

**Cosa fa**:
- Riempie il form (titolo, messaggio, destinatario) automaticamente al ritorno
- Mostra all'utente quale file aveva selezionato e quanto pesava
- Riduce la frustrazione del "ho perso tutto"

**Cosa NON fa**:
- Non riprende dal byte corretto — l'utente deve riselezionare il file e ricominciare da zero
- Funziona solo per file dal disco locale, non per file generati dinamicamente

**Costo**: ~30 minuti di lavoro vs 2-3 settimane.

**Quando ha senso**: se il drop-off è <12% O i file sono mediamente <500MB, questa versione cattura il 60% del valore con il 2% del costo.

---

## ✅ Definition of Done

L'implementazione si considera completa quando **tutti** questi criteri sono veri:

- [ ] Tutti i 10 test funzionali della tabella sopra passano
- [ ] Tutti i 4 test di sicurezza passano
- [ ] Lighthouse mobile score della pagina upload ≥85 (no degradazione vs pre-multipart)
- [ ] File da 1GB caricato con successo su connessione 50Mbps in <5 minuti
- [ ] File da 1GB ripreso con successo dopo 3 refresh consecutivi
- [ ] Encryption end-to-end verificata: file caricato → destinatario lo decifra correttamente
- [ ] Cleanup cron eseguito con successo per 7 giorni di fila senza errori
- [ ] Zero report di file corrotti dalla beta interna (almeno 50 upload reali)
- [ ] Sentry: error rate sulle nuove API <0.5%
- [ ] Documentazione aggiornata: questo file marcato come "IMPLEMENTATO" con link al PR

---

## 📚 Riferimenti

- [R2 Multipart Upload docs](https://developers.cloudflare.com/r2/api/s3/multipart/)
- [AWS S3 Multipart docs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html) (R2 è S3-compatible)
- [IndexedDB MDN](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [TransformStream MDN](https://developer.mozilla.org/en-US/docs/Web/API/TransformStream)
- [Web Crypto API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
