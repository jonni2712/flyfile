import { describe, it, expect } from 'vitest';
import {
  getFileExtension,
  isBlockedExtension,
  isFileSizeValid,
  sanitizeFilename,
  validateFile,
  MAX_FILE_SIZES
} from '../file-validation';

describe('file-validation', () => {
  describe('getFileExtension', () => {
    it('returns the correct extension', () => {
      expect(getFileExtension('test.pdf')).toBe('.pdf');
      expect(getFileExtension('TEST.PDF')).toBe('.pdf');
      expect(getFileExtension('my.archive.tar.gz')).toBe('.gz');
      expect(getFileExtension('no-extension')).toBe('');
    });
  });

  describe('isBlockedExtension', () => {
    it('identifies dangerous extensions', () => {
      expect(isBlockedExtension('virus.exe')).toBe(true);
      expect(isBlockedExtension('script.sh')).toBe(true);
      expect(isBlockedExtension('malware.bat')).toBe(true);
      expect(isBlockedExtension('valid.pdf')).toBe(false);
      expect(isBlockedExtension('image.png')).toBe(false);
    });
  });

  describe('isFileSizeValid', () => {
    it('validates size according to plan', () => {
      const oneMB = 1024 * 1024;
      const proLimit = MAX_FILE_SIZES.pro;

      expect(isFileSizeValid(oneMB, 'free')).toBe(true);
      expect(isFileSizeValid(proLimit, 'pro')).toBe(true);
      expect(isFileSizeValid(proLimit + 1, 'pro')).toBe(false);
      expect(isFileSizeValid(0, 'free')).toBe(false);
    });
  });

  describe('sanitizeFilename', () => {
    it('removes dangerous characters', () => {
      expect(sanitizeFilename('test/path.pdf')).toBe('test_path.pdf');
      expect(sanitizeFilename('test\\path.pdf')).toBe('test_path.pdf');
      expect(sanitizeFilename('../secret.txt')).toBe('_secret.txt');
      expect(sanitizeFilename('\0dangerous.txt')).toBe('dangerous.txt');
    });

    it('removes leading dots', () => {
      expect(sanitizeFilename('.hidden.txt')).toBe('hidden.txt');
    });

    it('handles long filenames', () => {
      const longName = 'a'.repeat(300) + '.pdf';
      const sanitized = sanitizeFilename(longName);
      expect(sanitized.length).toBeLessThanOrEqual(255);
      expect(sanitized.endsWith('.pdf')).toBe(true);
    });
  });

  describe('validateFile', () => {
    it('returns valid for good files', () => {
      const result = validateFile('document.pdf', 'application/pdf', 1024 * 1024, 'free');
      expect(result.valid).toBe(true);
    });

    it('returns invalid for blocked extensions', () => {
      const result = validateFile('virus.exe', 'application/x-msdownload', 1024, 'free');
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe('BLOCKED_EXTENSION');
    });

    it('returns invalid for oversized files', () => {
      const tooBig = MAX_FILE_SIZES.free + 1;
      const result = validateFile('huge.zip', 'application/zip', tooBig, 'free');
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe('FILE_TOO_LARGE');
    });
  });
});
