import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { verifyAuth, isAuthorizedForUser } from '../auth-utils';
import { getAdminAuth } from '../firebase-admin';

// Mock firebase-admin
vi.mock('../firebase-admin', () => ({
  getAdminAuth: vi.fn(),
}));

describe('auth-utils', () => {
  const mockVerifyIdToken = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (getAdminAuth as any).mockReturnValue({
      verifyIdToken: mockVerifyIdToken,
    });
  });

  describe('verifyAuth', () => {
    it('returns authenticated: false if no header', async () => {
      const request = new NextRequest('http://localhost/api/test');
      const result = await verifyAuth(request);
      expect(result.authenticated).toBe(false);
      expect(result.error).toContain('mancante');
    });

    it('returns authenticated: false if header is not Bearer', async () => {
      const request = new NextRequest('http://localhost/api/test', {
        headers: { Authorization: 'Basic 123' },
      });
      const result = await verifyAuth(request);
      expect(result.authenticated).toBe(false);
    });

    it('returns authenticated: true if token is valid', async () => {
      mockVerifyIdToken.mockResolvedValue({ uid: 'user123', email: 'test@example.com' });
      const request = new NextRequest('http://localhost/api/test', {
        headers: { Authorization: 'Bearer valid-token' },
      });
      const result = await verifyAuth(request);
      expect(result.authenticated).toBe(true);
      expect(result.userId).toBe('user123');
      expect(result.email).toBe('test@example.com');
    });

    it('returns authenticated: false if token verification fails', async () => {
      mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));
      const request = new NextRequest('http://localhost/api/test', {
        headers: { Authorization: 'Bearer invalid-token' },
      });
      const result = await verifyAuth(request);
      expect(result.authenticated).toBe(false);
      expect(result.error).toContain('scaduto o non valido');
    });
  });

  describe('isAuthorizedForUser', () => {
    it('returns true if userId matches', () => {
      const authResult = { authenticated: true, userId: 'user123' };
      expect(isAuthorizedForUser(authResult, 'user123')).toBe(true);
    });

    it('returns false if userId mismatch', () => {
      const authResult = { authenticated: true, userId: 'user123' };
      expect(isAuthorizedForUser(authResult, 'other456')).toBe(false);
    });

    it('returns false if not authenticated', () => {
      const authResult = { authenticated: false };
      expect(isAuthorizedForUser(authResult, 'user123')).toBe(false);
    });
  });
});
