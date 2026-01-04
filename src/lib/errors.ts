/**
 * Error handling utilities for secure error responses
 *
 * In production, we sanitize error messages to avoid exposing internal details
 * that could help attackers understand our system architecture.
 */

// Generic error messages for different error types
const GENERIC_ERRORS = {
  internal: 'Si è verificato un errore interno. Riprova più tardi.',
  database: 'Errore nel database. Riprova più tardi.',
  network: 'Errore di rete. Verifica la connessione.',
  auth: 'Errore di autenticazione. Effettua nuovamente il login.',
  forbidden: 'Non hai i permessi per eseguire questa azione.',
  notFound: 'Risorsa non trovata.',
  validation: 'Dati non validi. Controlla i campi inseriti.',
  rateLimit: 'Troppe richieste. Riprova tra poco.',
  timeout: 'La richiesta ha impiegato troppo tempo. Riprova.',
};

// Sensitive information patterns to filter out
const SENSITIVE_PATTERNS = [
  // Database/system paths
  /\/[a-z0-9\-_]+\/[a-z0-9\-_]+\.(ts|js|json)/gi,
  // Stack traces
  /at\s+[\w.]+\s+\([^)]+\)/gi,
  // Firebase/Firestore internal errors
  /firestore|firebase/gi,
  // R2/S3 errors
  /cloudflare|r2|s3|bucket/gi,
  // IP addresses
  /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
  // Internal URLs
  /localhost|127\.0\.0\.1|0\.0\.0\.0/gi,
  // Environment variable names
  /process\.env\.\w+/gi,
  // API keys or tokens (partial matches)
  /[a-z0-9]{20,}/gi,
];

/**
 * Check if we're in production environment
 */
function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Sanitize error message by removing sensitive information
 */
export function sanitizeErrorMessage(message: string): string {
  if (!isProduction()) {
    return message;
  }

  let sanitized = message;

  for (const pattern of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  }

  // If too much was redacted, use generic message
  if ((sanitized.match(/\[REDACTED\]/g) || []).length > 2) {
    return GENERIC_ERRORS.internal;
  }

  return sanitized;
}

/**
 * Get a safe error message for API responses
 * Categorizes errors and returns appropriate user-facing messages
 */
export function getSafeErrorMessage(error: unknown): string {
  if (!isProduction()) {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  // Always return generic message in production unless it's a known safe error
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Authentication errors
    if (message.includes('unauthorized') || message.includes('unauthenticated')) {
      return GENERIC_ERRORS.auth;
    }

    // Authorization errors
    if (message.includes('forbidden') || message.includes('permission')) {
      return GENERIC_ERRORS.forbidden;
    }

    // Not found errors
    if (message.includes('not found')) {
      return GENERIC_ERRORS.notFound;
    }

    // Rate limit errors
    if (message.includes('rate limit') || message.includes('too many')) {
      return GENERIC_ERRORS.rateLimit;
    }

    // Validation errors (safe to show)
    if (message.includes('required') || message.includes('invalid') || message.includes('missing')) {
      return sanitizeErrorMessage(error.message);
    }

    // Timeout errors
    if (message.includes('timeout') || message.includes('timed out')) {
      return GENERIC_ERRORS.timeout;
    }
  }

  // Default to generic internal error
  return GENERIC_ERRORS.internal;
}

/**
 * Log error securely - full details in development, sanitized in production
 */
export function logSecureError(context: string, error: unknown): void {
  if (isProduction()) {
    // In production, log minimal info
    console.error(`[${context}]`, error instanceof Error ? error.message : 'Unknown error');
  } else {
    // In development, log full error
    console.error(`[${context}]`, error);
  }
}

/**
 * Create a standardized API error response
 */
export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}

export function createErrorResponse(
  error: unknown,
  code?: string
): ApiErrorResponse {
  const response: ApiErrorResponse = {
    error: getSafeErrorMessage(error),
  };

  if (code) {
    response.code = code;
  }

  // Include details only in development
  if (!isProduction() && error instanceof Error) {
    response.details = {
      message: error.message,
      stack: error.stack,
    };
  }

  return response;
}

/**
 * Wrap async function with error logging
 */
export async function withErrorHandling<T>(
  context: string,
  fn: () => Promise<T>,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    logSecureError(context, error);
    return fallback;
  }
}
