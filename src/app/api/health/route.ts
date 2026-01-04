import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    firebase: ServiceStatus;
    r2: ServiceStatus;
    stripe: ServiceStatus;
  };
}

interface ServiceStatus {
  status: 'up' | 'down' | 'unknown';
  latency?: number;
  error?: string;
}

const startTime = Date.now();

// GET - Health check endpoint
export async function GET(request: NextRequest) {
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    services: {
      firebase: { status: 'unknown' },
      r2: { status: 'unknown' },
      stripe: { status: 'unknown' },
    },
  };

  // Check Firebase using Admin SDK
  try {
    const startFirebase = Date.now();
    const db = getAdminFirestore();
    await db.collection('users').limit(1).get();
    health.services.firebase = {
      status: 'up',
      latency: Date.now() - startFirebase,
    };
  } catch (error) {
    health.services.firebase = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Firebase connection failed',
    };
    health.status = 'degraded';
  }

  // Check R2 (basic config check)
  try {
    if (
      process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME
    ) {
      health.services.r2 = { status: 'up' };
    } else {
      health.services.r2 = {
        status: 'down',
        error: 'R2 configuration incomplete',
      };
      health.status = 'degraded';
    }
  } catch (error) {
    health.services.r2 = {
      status: 'down',
      error: error instanceof Error ? error.message : 'R2 check failed',
    };
    health.status = 'degraded';
  }

  // Check Stripe (basic config check)
  try {
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET) {
      health.services.stripe = { status: 'up' };
    } else {
      health.services.stripe = {
        status: 'down',
        error: 'Stripe configuration incomplete',
      };
      health.status = 'degraded';
    }
  } catch (error) {
    health.services.stripe = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Stripe check failed',
    };
    health.status = 'degraded';
  }

  // Determine overall status
  const allDown = Object.values(health.services).every(s => s.status === 'down');
  if (allDown) {
    health.status = 'unhealthy';
  }

  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}

// HEAD - Simple health check for load balancers
export async function HEAD() {
  try {
    // Quick check - just verify Firebase is accessible
    const db = getAdminFirestore();
    await db.collection('users').limit(1).get();
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}
