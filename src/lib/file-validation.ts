// Comprehensive file validation for secure uploads

// Dangerous file extensions that should be blocked
const BLOCKED_EXTENSIONS = new Set([
  // Executables
  '.exe', '.bat', '.cmd', '.com', '.msi', '.scr', '.pif', '.gadget',
  // Scripts
  '.vbs', '.vbe', '.js', '.jse', '.ws', '.wsf', '.wsc', '.wsh',
  '.ps1', '.ps1xml', '.ps2', '.ps2xml', '.psc1', '.psc2',
  // Shell scripts
  '.sh', '.bash', '.csh', '.tcsh', '.zsh', '.fish',
  // Dynamic libraries
  '.dll', '.so', '.dylib',
  // System files
  '.sys', '.drv', '.cpl', '.ocx',
  // Registry
  '.reg',
  // Shortcuts
  '.lnk', '.scf', '.url', '.website',
  // Java
  '.jar', '.jnlp', '.class',
  // Application packages
  '.app', '.action', '.command', '.workflow', '.pkg', '.dmg',
  // Installer files
  '.inf', '.hta',
  // Archives that could contain executables (optional - may be too restrictive)
  // '.cab', '.iso',
]);

// Allowed MIME type categories (for reference)
const ALLOWED_MIME_PREFIXES = [
  'image/',
  'video/',
  'audio/',
  'text/',
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'application/gzip',
  'application/x-tar',
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument',
  'application/vnd.oasis.opendocument',
  'application/json',
  'application/xml',
  'application/x-yaml',
];

// Max file size per plan (in bytes)
export const MAX_FILE_SIZES = {
  anonymous: 500 * 1024 * 1024, // 500 MB
  free: 500 * 1024 * 1024, // 500 MB
  starter: 1024 * 1024 * 1024, // 1 GB
  pro: 2 * 1024 * 1024 * 1024, // 2 GB
  business: 5 * 1024 * 1024 * 1024, // 5 GB
};

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  errorCode?: string;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === filename.length - 1) {
    return '';
  }
  return filename.slice(lastDot).toLowerCase();
}

/**
 * Check if file extension is blocked
 */
export function isBlockedExtension(filename: string): boolean {
  const ext = getFileExtension(filename);
  return BLOCKED_EXTENSIONS.has(ext);
}

/**
 * Check if MIME type is allowed
 */
export function isAllowedMimeType(mimeType: string): boolean {
  if (!mimeType) return false;

  // Check against allowed prefixes
  return ALLOWED_MIME_PREFIXES.some(prefix => mimeType.startsWith(prefix));
}

/**
 * Check if file size is within limits for a plan
 */
export function isFileSizeValid(
  size: number,
  plan: 'anonymous' | 'free' | 'starter' | 'pro' | 'business' = 'free'
): boolean {
  const maxSize = MAX_FILE_SIZES[plan];
  return size > 0 && size <= maxSize;
}

/**
 * Sanitize filename to prevent path traversal attacks
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators and null bytes
  let sanitized = filename
    .replace(/[\/\\]/g, '_')
    .replace(/\0/g, '')
    .trim();

  // Remove leading dots (hidden files)
  while (sanitized.startsWith('.')) {
    sanitized = sanitized.slice(1);
  }

  // Limit length
  if (sanitized.length > 255) {
    const ext = getFileExtension(sanitized);
    sanitized = sanitized.slice(0, 255 - ext.length) + ext;
  }

  // If empty after sanitization, use default name
  if (!sanitized) {
    sanitized = 'unnamed_file';
  }

  return sanitized;
}

/**
 * Validate file for upload
 */
export function validateFile(
  filename: string,
  mimeType: string,
  size: number,
  plan: 'anonymous' | 'free' | 'starter' | 'pro' | 'business' = 'free'
): FileValidationResult {
  // Check for blocked extensions
  if (isBlockedExtension(filename)) {
    const ext = getFileExtension(filename);
    return {
      valid: false,
      error: `Il tipo di file "${ext}" non è permesso per motivi di sicurezza.`,
      errorCode: 'BLOCKED_EXTENSION',
    };
  }

  // Check MIME type (warn but don't block - MIME types can be spoofed)
  // In a production environment, you might want to check the actual file content
  // using magic bytes detection on the server side

  // Check file size
  if (size <= 0) {
    return {
      valid: false,
      error: 'Il file è vuoto.',
      errorCode: 'EMPTY_FILE',
    };
  }

  const maxSize = MAX_FILE_SIZES[plan];
  if (size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `Il file supera il limite di ${maxSizeMB} MB per il tuo piano.`,
      errorCode: 'FILE_TOO_LARGE',
    };
  }

  return { valid: true };
}

/**
 * Validate multiple files for upload
 */
export function validateFiles(
  files: Array<{ name: string; type: string; size: number }>,
  plan: 'anonymous' | 'free' | 'starter' | 'pro' | 'business' = 'free',
  maxFilesPerTransfer: number = 10
): FileValidationResult {
  // Check file count
  if (files.length === 0) {
    return {
      valid: false,
      error: 'Nessun file selezionato.',
      errorCode: 'NO_FILES',
    };
  }

  if (files.length > maxFilesPerTransfer) {
    return {
      valid: false,
      error: `Puoi caricare massimo ${maxFilesPerTransfer} file per trasferimento.`,
      errorCode: 'TOO_MANY_FILES',
    };
  }

  // Validate each file
  for (const file of files) {
    const result = validateFile(file.name, file.type, file.size, plan);
    if (!result.valid) {
      return {
        valid: false,
        error: `${file.name}: ${result.error}`,
        errorCode: result.errorCode,
      };
    }
  }

  return { valid: true };
}

/**
 * Get file type category for display
 */
export function getFileTypeCategory(mimeType: string, filename: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z') || mimeType.includes('tar') || mimeType.includes('gzip')) return 'archive';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'spreadsheet';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'presentation';

  // Fallback to extension
  const ext = getFileExtension(filename);
  switch (ext) {
    case '.pdf': return 'pdf';
    case '.doc':
    case '.docx':
    case '.odt': return 'document';
    case '.xls':
    case '.xlsx':
    case '.ods': return 'spreadsheet';
    case '.ppt':
    case '.pptx':
    case '.odp': return 'presentation';
    case '.zip':
    case '.rar':
    case '.7z':
    case '.tar':
    case '.gz': return 'archive';
    case '.jpg':
    case '.jpeg':
    case '.png':
    case '.gif':
    case '.webp':
    case '.svg': return 'image';
    case '.mp4':
    case '.avi':
    case '.mov':
    case '.mkv':
    case '.webm': return 'video';
    case '.mp3':
    case '.wav':
    case '.ogg':
    case '.flac':
    case '.aac': return 'audio';
    default: return 'file';
  }
}
