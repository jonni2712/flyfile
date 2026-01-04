# SECURITY FIX CHECKLIST - FLYFILE

Usa questa checklist per tracciare il progresso delle fix di sicurezza.

---

## FASE 1: EMERGENZA (P0) - Entro 24h

### 1.1 Firestore Rules - Files Collection
- [ ] Backup regole attuali
- [ ] Cambiare `allow update: if true` → `allow update: if isAuthenticated() && resource.data.userId == request.auth.uid`
- [ ] Deploy: `firebase deploy --only firestore:rules`
- [ ] **TEST**: Update file da non-owner → DEVE fallire

### 1.2 Download Password Bypass
- [ ] Rimuovere `passwordVerified` da body params in `download-url/route.ts`
- [ ] Aggiungere verifica password server-side
- [ ] Aggiornare client `download/[id]/page.tsx` per inviare password
- [ ] **TEST**: Download senza password su transfer protetto → DEVE richiedere password
- [ ] **TEST**: Download con password errata → DEVE fallire
- [ ] **TEST**: Download con password corretta → DEVE funzionare

### 1.3 Upload URL Authentication
- [ ] Aggiungere `requireAuth` import in `upload-url/route.ts`
- [ ] Per utenti non-anonimi, verificare token e usare userId dal token
- [ ] Per utenti anonimi, generare userId server-side
- [ ] **TEST**: Upload autenticato senza token → DEVE fallire (401)
- [ ] **TEST**: Upload autenticato con token → DEVE funzionare
- [ ] **TEST**: Upload anonimo → DEVE funzionare

### 1.4 Team Invitation Authentication
- [ ] Aggiungere `requireAuth` in `invitation/[token]/route.ts` POST
- [ ] Usare userId dal token verificato
- [ ] **TEST**: Accept invite senza auth → DEVE fallire
- [ ] **TEST**: Accept invite autenticato → DEVE funzionare

### 1.5 File Validation Server-Side
- [ ] Importare `validateFile`, `sanitizeFilename` in `upload-url/route.ts`
- [ ] Chiamare validazione prima di generare URL
- [ ] **TEST**: Upload .exe → DEVE fallire
- [ ] **TEST**: Upload file > limite piano → DEVE fallire

---

## FASE 2: CONSOLIDAMENTO (P1) - Giorni 2-3

### 2.1 Middleware Edge Protection
- [ ] Creare `src/middleware.ts`
- [ ] Configurare route protette
- [ ] Aggiungere security headers
- [ ] **TEST**: /dashboard non auth → redirect /login
- [ ] **TEST**: /admin non auth → redirect /login
- [ ] **TEST**: /login già auth → redirect /dashboard

### 2.2 Admin Frontend Auth Headers
- [ ] Rimuovere `?userId=` da URL
- [ ] Aggiungere `Authorization: Bearer ${idToken}` header
- [ ] Usare Promise.all per fetch parallele
- [ ] **TEST**: Admin panel funziona correttamente

### 2.3 Cifrare 2FA Secrets
- [ ] Generare `TOTP_ENCRYPTION_KEY`
- [ ] Aggiungere a `.env` e Vercel env vars
- [ ] Creare `src/lib/encryption.ts`
- [ ] Modificare `two-factor.ts` per cifrare/decifrare
- [ ] **TEST**: Setup 2FA → verifica funziona
- [ ] **VERIFY**: Secret in Firestore è cifrato

### 2.4 Upstash Obbligatorio in Prod
- [ ] Aggiungere check `isProduction` in `rate-limit.ts`
- [ ] Fail closed se Upstash non configurato
- [ ] Verificare env vars su Vercel

---

## FASE 3: HARDENING (P2) - Giorni 4-5

### 3.1 CSRF Protection
- [ ] Creare `src/lib/csrf.ts`
- [ ] Aggiungere `validateOrigin` a tutti i POST/PATCH/DELETE:
  - [ ] `/api/profile`
  - [ ] `/api/files/upload-url`
  - [ ] `/api/files/delete`
  - [ ] `/api/transfer/*`
  - [ ] `/api/team/*`
  - [ ] `/api/webhooks`
  - [ ] `/api/2fa/*`
  - [ ] `/api/admin/*`
- [ ] **TEST**: Request da origin non autorizzato → 403

### 3.2 Firestore Rules Complete Audit
- [ ] Backup regole attuali
- [ ] Applicare nuove regole per tutte le collection
- [ ] **TEST**: Ogni collection rispetta owner-only updates

### 3.3 Error Boundaries
- [ ] Creare `src/app/error.tsx`
- [ ] Creare `src/app/global-error.tsx`
- [ ] Integrare con Sentry

### 3.4 Sanitize Error Messages
- [ ] Creare `src/lib/errors.ts`
- [ ] Applicare a tutti gli endpoint

### 3.5 reCAPTCHA Fail-Closed
- [ ] Modificare `recaptcha.ts` per fail-closed in prod

---

## FASE 4: QUALITY (P3) - Ongoing

### 4.1 Test Suite
- [ ] Installare vitest
- [ ] Configurare vitest.config.ts
- [ ] Scrivere test per:
  - [ ] auth-utils
  - [ ] file-validation
  - [ ] password
  - [ ] rate-limit
  - [ ] API routes (integration)

### 4.2 Monitoring
- [ ] Setup Sentry
- [ ] Configurare alerting
- [ ] Setup log aggregation

### 4.3 Documentazione
- [ ] Creare SECURITY.md
- [ ] Documentare incident response
- [ ] Checklist deploy

---

## POST-FIX VERIFICATION

Dopo aver completato tutte le fix, eseguire questi test finali:

### Security Tests
```bash
# Test 1: Firestore rules
# Tentare update file da utente non-owner
# Expected: Permission denied

# Test 2: Password bypass
curl -X POST https://flyfile.it/api/files/download-url \
  -H "Content-Type: application/json" \
  -d '{"transferId":"<protected>","fileId":"<id>","path":"<path>"}'
# Expected: 401 con "Password richiesta"

# Test 3: Upload spoofing
curl -X POST https://flyfile.it/api/files/upload-url \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.pdf","contentType":"application/pdf","fileSize":1000,"isAnonymous":false}'
# Expected: 401 (no auth token)

# Test 4: CSRF
curl -X POST https://flyfile.it/api/profile \
  -H "Content-Type: application/json" \
  -H "Origin: https://evil.com" \
  -d '{"userId":"<id>","displayName":"hacked"}'
# Expected: 403 Invalid origin
```

### Functional Tests
- [ ] Login/Register funziona
- [ ] Upload file funziona
- [ ] Download pubblico funziona
- [ ] Download protetto richiede password
- [ ] Team creation/invitation funziona
- [ ] Admin panel funziona
- [ ] Stripe checkout funziona
- [ ] 2FA setup/verify funziona

---

## EMERGENCY CONTACTS

- **Security Lead**: [nome]
- **DevOps**: [nome]
- **On-call**: [numero]

## ROLLBACK PROCEDURE

1. Vercel: Dashboard → Deployments → Rollback
2. Firestore Rules: `firebase deploy --only firestore:rules` con backup
3. Env vars: Ripristinare da backup

---

**Ultimo aggiornamento**: 2026-01-03
