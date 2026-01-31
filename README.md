<p align="center">
  <img src="public/logo.svg" alt="FlyFile Logo" width="120" height="120">
</p>

<h1 align="center">FlyFile</h1>

<p align="center">
  <strong>Piattaforma di trasferimento file sicura e open source</strong>
</p>

<p align="center">
  Invia file di qualsiasi dimensione con crittografia end-to-end, protezione con password e link con scadenza automatica.
</p>

<p align="center">
  <a href="https://flyfile.it">Versione Hosted</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-self-hosting">Self-Hosting</a> •
  <a href="#-documentazione">Docs</a> •
  <a href="#-api">API</a>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License"></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-black" alt="Next.js"></a>
  <a href="https://typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-blue" alt="TypeScript"></a>
  <a href="https://github.com/anthropics/claude-code"><img src="https://img.shields.io/badge/Built%20with-Claude%20Code-blueviolet" alt="Claude Code"></a>
</p>

---

> **Questo progetto è sviluppato in vibe coding con [Claude Code](https://github.com/anthropics/claude-code) di Anthropic**

---

## Indice

- [Panoramica](#-panoramica)
- [Funzionalità](#-funzionalità)
- [Demo](#-demo)
- [Quick Start](#-quick-start)
- [Self-Hosting](#-self-hosting)
- [Architettura](#-architettura)
- [Tech Stack](#-tech-stack)
- [API](#-api)
- [Piani e Limiti](#-piani-e-limiti)
- [Sicurezza](#-sicurezza)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [FAQ](#-faq)
- [Licenza](#-licenza)

---

## 🚀 Panoramica

**FlyFile** è una piattaforma di trasferimento file moderna, sicura e rispettosa della privacy. Pensata sia per utenti individuali che per aziende, offre:

- **Versione Hosted**: Usa [flyfile.it](https://flyfile.it) senza configurazione
- **Self-Hosted**: Installa FlyFile sui tuoi server con Docker

### Perché FlyFile?

| Caratteristica | FlyFile | WeTransfer | Google Drive |
|---------------|---------|------------|--------------|
| Open Source | ✅ | ❌ | ❌ |
| Self-Hostable | ✅ | ❌ | ❌ |
| Crittografia E2E | ✅ | ❌ | ❌ |
| Nessun limite dimensione* | ✅ | ❌ (2GB) | ❌ (15GB) |
| GDPR Compliant | ✅ | ✅ | ⚠️ |
| API | ✅ | 💰 | ✅ |
| Team/Workspace | ✅ | 💰 | ✅ |

*Con piano Business o self-hosted

---

## ✨ Funzionalità

### Core

| Funzionalità | Descrizione |
|-------------|-------------|
| 📤 **Upload Drag & Drop** | Trascina i file o clicca per selezionarli |
| 📁 **Upload Cartelle** | Carica intere cartelle mantenendo la struttura |
| 🔗 **Link Condivisibili** | Genera link unici per ogni trasferimento |
| ⏰ **Scadenza Automatica** | I file vengono eliminati dopo X giorni |
| 🔒 **Protezione Password** | Proteggi i trasferimenti con password |
| 📧 **Notifiche Email** | Ricevi notifiche quando i file vengono scaricati |

### Sicurezza

| Funzionalità | Descrizione |
|-------------|-------------|
| 🔐 **Crittografia AES-256** | Tutti i file sono crittografati a riposo |
| 🛡️ **Crittografia End-to-End** | Opzione per crittografare lato client |
| 📱 **2FA (TOTP)** | Autenticazione a due fattori |
| 🚫 **Rate Limiting** | Protezione contro abusi e brute force |
| 🔑 **API Keys** | Accesso programmatico sicuro |

### Collaborazione (Business)

| Funzionalità | Descrizione |
|-------------|-------------|
| 👥 **Team Workspace** | Condividi uno spazio con il tuo team |
| 👤 **Gestione Membri** | Invita, rimuovi e gestisci i permessi |
| 📊 **Dashboard Analytics** | Statistiche su upload e download |
| 🎨 **Custom Branding** | Logo e colori personalizzati |
| 🔗 **Custom URL** | Link personalizzati (es. tuodominio.flyfile.it) |

### Integrazioni

| Funzionalità | Descrizione |
|-------------|-------------|
| 🔌 **REST API** | API completa per automazioni |
| 🪝 **Webhooks** | Notifiche in tempo reale via HTTP |
| 📬 **SMTP Personalizzato** | Usa il tuo server email |
| ☁️ **Multi-Storage** | MinIO, R2, S3, o qualsiasi S3-compatible |

---

## 🎬 Demo

### Upload di un File

```
1. Vai su flyfile.it (o la tua istanza)
2. Trascina un file nella zona di upload
3. (Opzionale) Aggiungi password e scadenza
4. Clicca "Invia"
5. Copia il link e condividilo
```

### Download

```
1. Apri il link ricevuto
2. (Se richiesto) Inserisci la password
3. Clicca sul file per scaricarlo
```

---

## 🏃 Quick Start

### Opzione 1: Usa la Versione Hosted

Vai su **[flyfile.it](https://flyfile.it)** e inizia subito. Nessuna configurazione richiesta.

### Opzione 2: Self-Hosting con Docker (Consigliato)

```bash
# 1. Clona il repository
git clone https://github.com/flyfile/flyfile.git
cd flyfile

# 2. Copia e configura l'environment
cp .env.example .env
nano .env  # Compila i valori richiesti

# 3. Avvia i servizi
docker-compose up -d

# 4. Accedi a http://localhost:3000
```

> **Nota**: Per la configurazione dettagliata, vedi [SELF_HOSTING.md](SELF_HOSTING.md)

### Opzione 3: Sviluppo Locale

```bash
# 1. Clona e installa dipendenze
git clone https://github.com/flyfile/flyfile.git
cd flyfile
npm install

# 2. Configura environment
cp .env.example .env.local
nano .env.local

# 3. Avvia il server di sviluppo
npm run dev

# 4. Accedi a http://localhost:3000
```

---

## 🐳 Self-Hosting

### Requisiti Minimi

| Risorsa | Minimo | Consigliato |
|---------|--------|-------------|
| CPU | 1 core | 2+ cores |
| RAM | 1 GB | 2+ GB |
| Storage | 10 GB | 50+ GB |
| OS | Linux (Ubuntu 20.04+) | Ubuntu 22.04 LTS |

### Servizi Richiesti

| Servizio | Descrizione | Alternativa Self-Hosted |
|----------|-------------|-------------------------|
| **Firebase** | Auth + Database | - (richiesto) |
| **Storage** | File storage | MinIO (incluso) |
| **Redis** | Rate limiting | Incluso in Docker |
| **SMTP** | Invio email | Qualsiasi server SMTP |

### Configurazione Rapida

```bash
# Genera le chiavi di sicurezza
export PASSWORD_SALT=$(openssl rand -hex 32)
export TOTP_ENCRYPTION_KEY=$(openssl rand -hex 32)

# Avvia con Docker Compose
docker-compose up -d

# Verifica lo stato
docker-compose ps
docker-compose logs -f flyfile
```

### Produzione con HTTPS (Traefik)

```bash
# Configura dominio e email per Let's Encrypt
export DOMAIN=files.tuodominio.com
export ACME_EMAIL=admin@tuodominio.com

# Avvia con il file di produzione
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

> **Documentazione completa**: [SELF_HOSTING.md](SELF_HOSTING.md)

---

## 🏗️ Architettura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     Next.js 16 (React 19)                        │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │   │
│  │  │  Upload  │  │ Download │  │Dashboard │  │   Admin Panel    │ │   │
│  │  │   Page   │  │   Page   │  │   Page   │  │                  │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              BACKEND                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Next.js API Routes                            │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │   │
│  │  │/api/     │  │/api/     │  │/api/     │  │    /api/         │ │   │
│  │  │transfer  │  │ profile  │  │  2fa     │  │    stripe        │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│                  │  │                  │  │                  │
│  Firebase        │  │  Object Storage  │  │     Redis        │
│  ├─ Auth         │  │  ├─ MinIO        │  │  └─ Rate Limit   │
│  └─ Firestore    │  │  ├─ Cloudflare R2│  │                  │
│                  │  │  └─ AWS S3       │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
          │                    │
          ▼                    ▼
┌──────────────────┐  ┌──────────────────┐
│                  │  │                  │
│     Stripe       │  │      SMTP        │
│  └─ Payments     │  │  └─ Email        │
│                  │  │                  │
└──────────────────┘  └──────────────────┘
```

### Flusso di Upload

```
┌──────┐    ┌──────────┐    ┌─────────┐    ┌─────────┐    ┌──────────┐
│Client│───▶│  Valida  │───▶│ Richiedi│───▶│ Upload  │───▶│  Salva   │
│      │    │  file    │    │ URL firm│    │   S3    │    │ metadata │
└──────┘    └──────────┘    └─────────┘    └─────────┘    └──────────┘
                                 │                              │
                                 ▼                              ▼
                           ┌─────────┐                    ┌──────────┐
                           │ Genera  │                    │  Invia   │
                           │presigned│                    │  email   │
                           │  URL    │                    │ notifica │
                           └─────────┘                    └──────────┘
```

### Flusso di Download

```
┌──────┐    ┌──────────┐    ┌─────────┐    ┌─────────┐    ┌──────────┐
│Client│───▶│  Carica  │───▶│ Verifica│───▶│ Genera  │───▶│ Download │
│      │    │ transfer │    │ password│    │URL firm.│    │  da S3   │
└──────┘    └──────────┘    └─────────┘    └─────────┘    └──────────┘
                                                                │
                                                                ▼
                                                          ┌──────────┐
                                                          │ Registra │
                                                          │analytics │
                                                          │ + notify │
                                                          └──────────┘
```

---

## 🛠️ Tech Stack

### Frontend

| Tecnologia | Versione | Descrizione |
|------------|----------|-------------|
| [Next.js](https://nextjs.org) | 16.x | Framework React full-stack |
| [React](https://react.dev) | 19.x | Libreria UI |
| [TypeScript](https://typescriptlang.org) | 5.x | Type safety |
| [Tailwind CSS](https://tailwindcss.com) | 4.x | Utility-first CSS |
| [Zustand](https://zustand-demo.pmnd.rs) | 5.x | State management |
| [Lucide](https://lucide.dev) | - | Icon library |

### Backend

| Tecnologia | Versione | Descrizione |
|------------|----------|-------------|
| [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) | 16.x | REST API |
| [Firebase Admin](https://firebase.google.com/docs/admin/setup) | 13.x | Server-side Firebase |
| [AWS SDK](https://aws.amazon.com/sdk-for-javascript/) | 3.x | S3-compatible storage |
| [Nodemailer](https://nodemailer.com) | 7.x | Email sending |
| [Stripe](https://stripe.com/docs/api) | 20.x | Payments |

### Infrastruttura

| Servizio | Descrizione |
|----------|-------------|
| [Firebase](https://firebase.google.com) | Auth + Firestore Database |
| [Cloudflare R2](https://developers.cloudflare.com/r2/) | Object storage (default) |
| [MinIO](https://min.io) | Self-hosted object storage |
| [Redis](https://redis.io) | Rate limiting e caching |
| [Upstash](https://upstash.com) | Serverless Redis |

---

## 🔌 API

FlyFile espone una REST API completa per automazioni e integrazioni.

### Autenticazione

```bash
# Ottieni un API key dalla dashboard
# Usa l'header Authorization

curl -X GET https://flyfile.it/api/transfer/abc123 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Endpoints Principali

#### Trasferimenti

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| `POST` | `/api/transfer` | Crea un nuovo trasferimento |
| `GET` | `/api/transfer/:id` | Ottieni dettagli trasferimento |
| `DELETE` | `/api/transfer/:id` | Elimina trasferimento |
| `GET` | `/api/transfer/:id/download-zip` | Scarica come ZIP |

#### Profilo

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| `GET` | `/api/profile` | Ottieni profilo utente |
| `POST` | `/api/profile` | Aggiorna profilo |
| `GET` | `/api/profile/billing` | Ottieni dati fatturazione |

#### 2FA

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| `POST` | `/api/2fa/setup` | Inizia setup 2FA |
| `POST` | `/api/2fa/verify` | Verifica codice TOTP |
| `POST` | `/api/2fa/disable` | Disabilita 2FA |

### Esempio: Creare un Trasferimento

```javascript
const response = await fetch('https://flyfile.it/api/transfer', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Documenti progetto',
    recipientEmail: 'destinatario@example.com',
    password: 'password-opzionale',
    expiresIn: 7, // giorni
    files: [
      { name: 'doc.pdf', size: 1024000, type: 'application/pdf' }
    ]
  })
});

const { transferId, uploadUrls } = await response.json();

// Ora carica i file usando gli uploadUrls presigned
```

### Webhooks

Ricevi notifiche in tempo reale quando:

| Evento | Descrizione |
|--------|-------------|
| `transfer.created` | Nuovo trasferimento creato |
| `transfer.downloaded` | File scaricato |
| `transfer.expired` | Trasferimento scaduto |
| `transfer.deleted` | Trasferimento eliminato |

```json
{
  "event": "transfer.downloaded",
  "timestamp": "2025-01-31T10:30:00Z",
  "data": {
    "transferId": "abc123",
    "downloadedBy": "user@example.com",
    "fileName": "document.pdf"
  }
}
```

---

## 💰 Piani e Limiti

### Versione Hosted (flyfile.it)

| Caratteristica | Free | Starter | Pro | Business |
|----------------|------|---------|-----|----------|
| **Prezzo** | €0 | €6/mese | €12/mese | €20/mese |
| **Storage mensile** | 15 GB | 500 GB | 1 TB | Illimitato |
| **Trasferimenti/mese** | 20 | 50 | 100 | Illimitati |
| **Conservazione file** | 7 giorni | 14 giorni | 30 giorni | 365 giorni |
| **Max file singolo** | 2 GB | 10 GB | 50 GB | Illimitato |
| **Password protection** | ✅ | ✅ | ✅ | ✅ |
| **Crittografia E2E** | ✅ | ✅ | ✅ | ✅ |
| **Elimina trasferimenti** | ❌ | ✅ | ✅ | ✅ |
| **Custom expiry** | ❌ | ❌ | ✅ | ✅ |
| **Custom branding** | ❌ | ❌ | ✅ | ✅ |
| **API Access** | ❌ | ❌ | ✅ | ✅ |
| **Webhooks** | ❌ | ❌ | ❌ | ✅ |
| **Team workspace** | ❌ | ❌ | ❌ | ✅ |
| **Supporto** | Community | Email | Prioritario | Dedicato |

### Versione Self-Hosted

**Nessun limite artificiale!** Configura i limiti come preferisci.

---

## 🔒 Sicurezza

### Crittografia

- **A riposo**: Tutti i file sono crittografati con AES-256 sul storage
- **In transito**: TLS 1.3 per tutte le comunicazioni
- **End-to-End**: Opzione per crittografare lato client prima dell'upload

### Autenticazione

- **Firebase Auth**: Email/password e Google OAuth
- **2FA**: TOTP con app come Google Authenticator
- **Session**: Token JWT stateless con scadenza

### Rate Limiting

| Endpoint | Limite | Window |
|----------|--------|--------|
| Auth (login/register) | 5 req | 1 min |
| Upload | 10 req | 1 min |
| Download | 30 req | 1 min |
| API | 60 req | 1 min |
| Password verify | 5 req | 5 min |
| 2FA verify | 5 req | 5 min |

### Headers di Sicurezza

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'; ...
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### Compliance

- **GDPR**: Dati in EU, diritto all'oblio, export dati
- **Privacy by Design**: Minimizzazione dati, scadenza automatica

---

## 🗺️ Roadmap

### ✅ Completato

- [x] Upload/Download file con presigned URLs
- [x] Protezione password trasferimenti
- [x] Crittografia AES-256
- [x] Autenticazione Firebase
- [x] 2FA (TOTP)
- [x] Piani a pagamento con Stripe
- [x] Team workspace
- [x] API REST
- [x] Webhooks
- [x] Rate limiting
- [x] Docker support
- [x] Self-hosting documentation

### 🚧 In Sviluppo

- [ ] App mobile (React Native)
- [ ] Desktop app (Electron)
- [ ] CLI tool
- [ ] Integrazione Slack/Teams
- [ ] SSO (SAML/OIDC)

### 📋 Pianificato

- [ ] Virus scanning
- [ ] Preview file in-browser
- [ ] Commenti sui trasferimenti
- [ ] Folder sharing
- [ ] Audit log
- [ ] Backup automatici

### 💡 Idee Future

- [ ] P2P transfer option
- [ ] Torrent-like chunked transfer
- [ ] Blockchain verification

---

## 🤝 Contributing

Accogliamo contributi! Leggi [CONTRIBUTING.md](CONTRIBUTING.md) per le linee guida.

### Quick Contribution

```bash
# 1. Fork il repository

# 2. Clona il tuo fork
git clone https://github.com/TUO_USERNAME/flyfile.git
cd flyfile

# 3. Crea un branch per la feature
git checkout -b feature/mia-feature

# 4. Fai le modifiche e committa
git commit -m "feat: aggiungi nuova feature"

# 5. Pusha e apri una PR
git push origin feature/mia-feature
```

### Tipi di Contributo

- 🐛 **Bug fix**: Correggi errori nel codice
- ✨ **Features**: Aggiungi nuove funzionalità
- 📚 **Docs**: Migliora la documentazione
- 🌍 **i18n**: Traduci in altre lingue
- 🧪 **Tests**: Aggiungi test automatici

---

## ❓ FAQ

<details>
<summary><strong>È davvero gratis?</strong></summary>

La versione self-hosted è completamente gratuita e open source (Apache 2.0).
La versione hosted su flyfile.it ha un piano gratuito con limiti e piani a pagamento.
</details>

<details>
<summary><strong>I miei file sono sicuri?</strong></summary>

Sì. Tutti i file sono crittografati con AES-256. Con la crittografia E2E, nemmeno noi possiamo leggere i tuoi file.
</details>

<details>
<summary><strong>Posso usarlo per la mia azienda?</strong></summary>

Assolutamente! Puoi usare la versione hosted con piano Business, oppure self-hostare senza limiti.
</details>

<details>
<summary><strong>Che succede ai file scaduti?</strong></summary>

Vengono eliminati permanentemente dallo storage. Non conserviamo backup dei file degli utenti.
</details>

<details>
<summary><strong>Posso cambiare lo storage provider?</strong></summary>

Sì! FlyFile supporta MinIO, Cloudflare R2, AWS S3, e qualsiasi storage S3-compatible.
</details>

<details>
<summary><strong>Come funziona il rate limiting?</strong></summary>

In produzione usa Redis. In development usa un fallback in-memory. I limiti sono configurabili.
</details>

<details>
<summary><strong>Posso contribuire al progetto?</strong></summary>

Sì! Leggi CONTRIBUTING.md e apri una PR. Accogliamo contributi di ogni tipo.
</details>

---

## 📄 Licenza

Questo progetto è rilasciato sotto licenza **Apache License 2.0**.

```
Copyright 2024-2025 FlyFile

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

Vedi [LICENSE](LICENSE) per il testo completo.

---

## 🙏 Crediti

### Sviluppato con

<p align="center">
  <a href="https://github.com/anthropics/claude-code">
    <img src="https://img.shields.io/badge/Claude%20Code-Vibe%20Coding-blueviolet?style=for-the-badge" alt="Claude Code">
  </a>
</p>

Questo progetto è sviluppato in **vibe coding** con [Claude Code](https://github.com/anthropics/claude-code) di Anthropic - l'assistente AI per sviluppatori.

### Tecnologie Open Source

Grazie a tutti i progetti open source che rendono FlyFile possibile:

- [Next.js](https://nextjs.org) - Il framework React
- [Firebase](https://firebase.google.com) - Auth e Database
- [MinIO](https://min.io) - Object Storage
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Stripe](https://stripe.com) - Payments
- [Redis](https://redis.io) - Caching

---

<p align="center">
  <strong>Fatto con ❤️ in Italia</strong>
</p>

<p align="center">
  <a href="https://flyfile.it">Website</a> •
  <a href="https://github.com/flyfile/flyfile">GitHub</a> •
  <a href="https://twitter.com/flyfile_it">Twitter</a>
</p>
