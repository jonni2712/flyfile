# FlyFile - Self-Hosting Guide

> **This project is developed with vibe coding using [Claude Code](https://github.com/anthropics/claude-code) by Anthropic**

FlyFile is a secure file transfer platform that you can self-host on your own infrastructure. This guide will walk you through the setup process.

## Table of Contents

- [Requirements](#requirements)
- [Quick Start with Docker](#quick-start-with-docker)
- [Manual Installation](#manual-installation)
- [Configuration](#configuration)
- [Storage Options](#storage-options)
- [Production Deployment](#production-deployment)
- [Updating](#updating)
- [Troubleshooting](#troubleshooting)

---

## Requirements

### Minimum System Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 1 core | 2+ cores |
| RAM | 1 GB | 2+ GB |
| Storage | 10 GB | 50+ GB (depends on usage) |
| OS | Linux (Ubuntu 20.04+, Debian 11+) | Ubuntu 22.04 LTS |

### Required Services

1. **Firebase Project** (Free tier is sufficient for small deployments)
   - Authentication (Email/Password, Google OAuth)
   - Firestore Database
   - [Create a project](https://console.firebase.google.com)

2. **S3-Compatible Storage** (choose one):
   - **MinIO** (self-hosted, included in Docker Compose)
   - **Cloudflare R2** (cheap egress)
   - **AWS S3**
   - Any S3-compatible storage

3. **SMTP Server** for sending emails
   - Your own mail server
   - Gmail SMTP
   - SendGrid, Mailgun, etc.

### Optional Services

- **Redis** - For rate limiting (included in Docker Compose)
- **Stripe** - For payment processing (only if you want paid plans)
- **reCAPTCHA** - For anonymous upload protection

---

## Quick Start with Docker

The fastest way to get FlyFile running is with Docker Compose.

### Step 1: Clone the Repository

```bash
git clone https://github.com/flyfile/flyfile.git
cd flyfile
```

### Step 2: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit with your values
nano .env
```

**Minimum required variables:**

```env
# Firebase (create at console.firebase.google.com)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Storage (MinIO - included in Docker Compose)
STORAGE_PROVIDER=minio
STORAGE_ENDPOINT=http://minio:9000
STORAGE_ACCESS_KEY=minioadmin
STORAGE_SECRET_KEY=minioadmin
STORAGE_BUCKET=flyfile

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM_ADDRESS=your-email@gmail.com

# Security (generate these!)
PASSWORD_SALT=$(openssl rand -hex 32)
TOTP_ENCRYPTION_KEY=$(openssl rand -hex 32)

# Self-hosted mode
SELF_HOSTED=true
```

### Step 3: Start the Services

```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f flyfile
```

### Step 4: Access FlyFile

Open `http://localhost:3000` in your browser.

- **MinIO Console**: `http://localhost:9001` (minioadmin/minioadmin)

---

## Manual Installation

If you prefer not to use Docker, you can install FlyFile manually.

### Prerequisites

- Node.js 20+
- npm or yarn
- Redis (optional, for rate limiting)

### Step 1: Clone and Install

```bash
git clone https://github.com/flyfile/flyfile.git
cd flyfile
npm install
```

### Step 2: Configure

```bash
cp .env.example .env.local
nano .env.local
```

### Step 3: Build and Run

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

---

## Configuration

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** → Email/Password and Google
4. Create a **Firestore Database**
5. Go to **Project Settings** → **General** to get client config
6. Go to **Project Settings** → **Service Accounts** → Generate private key

### Firestore Security Rules

Deploy these security rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Transfers are publicly readable (for download links)
    match /transfers/{transferId} {
      allow read: if true;
      allow write: if request.auth != null;

      match /files/{fileId} {
        allow read: if true;
        allow write: if request.auth != null;
      }
    }

    // Anonymous users - server only
    match /anonymousUsers/{docId} {
      allow read, write: if false;
    }

    // API keys - owner only
    match /apiKeys/{keyId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

### Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_*` | Yes | Firebase client configuration |
| `FIREBASE_ADMIN_*` | Yes | Firebase Admin SDK credentials |
| `STORAGE_PROVIDER` | Yes | `minio`, `r2`, `s3`, or `custom` |
| `STORAGE_*` | Yes | Storage configuration |
| `MAIL_*` | Yes | SMTP email configuration |
| `PASSWORD_SALT` | Yes | Salt for password hashing |
| `TOTP_ENCRYPTION_KEY` | Yes | Key for 2FA secret encryption |
| `SELF_HOSTED` | No | Set to `true` for self-hosted mode |
| `STRIPE_*` | No | Stripe configuration (optional) |
| `REDIS_URL` | No | Redis URL for rate limiting |
| `ADMIN_EMAILS` | No | Comma-separated admin email list |

---

## Storage Options

### MinIO (Self-hosted)

MinIO is an S3-compatible object storage that you can run yourself.

```env
STORAGE_PROVIDER=minio
STORAGE_ENDPOINT=http://minio:9000
STORAGE_ACCESS_KEY=minioadmin
STORAGE_SECRET_KEY=minioadmin
STORAGE_BUCKET=flyfile
STORAGE_REGION=us-east-1
STORAGE_FORCE_PATH_STYLE=true
```

### Cloudflare R2

R2 has no egress fees, making it cost-effective for file transfers.

```env
STORAGE_PROVIDER=r2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=flyfile
R2_PUBLIC_URL=https://files.yourdomain.com
```

### AWS S3

```env
STORAGE_PROVIDER=s3
STORAGE_ENDPOINT=https://s3.amazonaws.com
STORAGE_ACCESS_KEY=your_aws_access_key
STORAGE_SECRET_KEY=your_aws_secret_key
STORAGE_BUCKET=your-bucket-name
STORAGE_REGION=us-east-1
```

### CORS Configuration

For any S3-compatible storage, configure CORS:

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://your-flyfile-domain.com"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3600
    }
  ]
}
```

---

## Production Deployment

### With Traefik (Recommended)

The included `docker-compose.prod.yml` adds Traefik for automatic HTTPS.

```bash
# Set production variables
export DOMAIN=files.yourdomain.com
export ACME_EMAIL=admin@yourdomain.com

# Generate Traefik dashboard password
export TRAEFIK_DASHBOARD_AUTH=$(htpasswd -nb admin your-password)

# Deploy
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### DNS Configuration

Point your domain to your server:

```
A     files.yourdomain.com    → YOUR_SERVER_IP
AAAA  files.yourdomain.com    → YOUR_SERVER_IPV6 (optional)
```

### Security Checklist

- [ ] Use strong passwords for MinIO and Redis
- [ ] Enable firewall (only allow 80, 443)
- [ ] Set up fail2ban
- [ ] Configure backup for MinIO data
- [ ] Enable Firestore backup
- [ ] Use environment variables, never commit secrets

### Backup Strategy

```bash
# Backup MinIO data
docker run --rm -v flyfile_minio-data:/data -v $(pwd):/backup alpine \
  tar czf /backup/minio-backup-$(date +%Y%m%d).tar.gz /data

# Backup Redis data
docker run --rm -v flyfile_redis-data:/data -v $(pwd):/backup alpine \
  tar czf /backup/redis-backup-$(date +%Y%m%d).tar.gz /data
```

---

## Updating

### Docker

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Manual

```bash
git pull origin main
npm install
npm run build
pm2 restart flyfile  # or your process manager
```

---

## Troubleshooting

### Common Issues

#### "Firebase Admin SDK credentials not configured"

Make sure your `FIREBASE_ADMIN_PRIVATE_KEY` is properly formatted:
- Escape newlines as `\n`
- Or base64 encode the entire key

```bash
# Base64 encode your key
cat serviceAccountKey.json | base64 -w 0
```

#### MinIO connection refused

Check if MinIO is running and the endpoint is correct:

```bash
docker-compose logs minio
curl http://localhost:9000/minio/health/live
```

#### Rate limiting not working

Redis is required for production rate limiting. Check Redis connection:

```bash
docker-compose logs redis
docker exec flyfile-redis redis-cli ping
```

#### Emails not sending

Verify SMTP settings and check for blocked ports:

```bash
# Test SMTP connection
openssl s_client -connect smtp.gmail.com:587 -starttls smtp
```

### Getting Help

- [GitHub Issues](https://github.com/flyfile/flyfile/issues)
- [Documentation](https://docs.flyfile.it)

---

## License

FlyFile is open source software licensed under the [Apache License 2.0](LICENSE).

---

## Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a pull request.

---

## Credits

This project is developed with **vibe coding** using [Claude Code](https://github.com/anthropics/claude-code) by Anthropic.

Built with:
- [Next.js](https://nextjs.org)
- [Firebase](https://firebase.google.com)
- [Tailwind CSS](https://tailwindcss.com)
- [MinIO](https://min.io)
