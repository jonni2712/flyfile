import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from './api-keys';

export interface ApiAuthResult {
  authenticated: boolean;
  userId?: string;
  apiKeyId?: string;
  permissions?: ('read' | 'write' | 'delete')[];
  error?: string;
}

// Authenticate API request using API key
export async function authenticateApiRequest(request: NextRequest): Promise<ApiAuthResult> {
  // Get API key from Authorization header
  const authHeader = request.headers.get('Authorization');

  if (!authHeader) {
    return {
      authenticated: false,
      error: 'Authorization header richiesto',
    };
  }

  // Support both "Bearer <key>" and just "<key>"
  let apiKey = authHeader;
  if (authHeader.startsWith('Bearer ')) {
    apiKey = authHeader.substring(7);
  }

  if (!apiKey || !apiKey.startsWith('fly_')) {
    return {
      authenticated: false,
      error: 'Formato API key non valido. Usa: fly_xxxxx',
    };
  }

  // Validate the API key
  const result = await validateApiKey(apiKey);

  if (!result.valid) {
    return {
      authenticated: false,
      error: result.error || 'API key non valida',
    };
  }

  return {
    authenticated: true,
    userId: result.userId,
    apiKeyId: result.apiKeyId,
    permissions: result.permissions,
  };
}

// Check if user has required permission
export function hasPermission(
  permissions: ('read' | 'write' | 'delete')[] | undefined,
  required: 'read' | 'write' | 'delete'
): boolean {
  if (!permissions) return false;
  return permissions.includes(required);
}

// Create unauthorized response
export function unauthorizedResponse(error: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error,
      code: 'UNAUTHORIZED',
    },
    { status: 401 }
  );
}

// Create forbidden response
export function forbiddenResponse(error: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error,
      code: 'FORBIDDEN',
    },
    { status: 403 }
  );
}
