'use client';

import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Transfer, TransferUploadData, UploadResponse } from '@/types';
import { encryptFile, isEncryptionSupported } from '@/lib/client-encryption';

interface TransferContextType {
  transfers: Transfer[];
  loading: boolean;
  error: string | null;
  fetchTransfers: () => Promise<void>;
  getTransfer: (transferId: string) => Promise<Transfer | null>;
  getPublicTransfer: (transferId: string) => Promise<Transfer | null>;
  createTransfer: (data: TransferUploadData, files: File[]) => Promise<UploadResponse>;
  updateTransfer: (transferId: string, data: Partial<Transfer>) => Promise<void>;
  deleteTransfer: (transferId: string) => Promise<void>;
  verifyPassword: (transferId: string, password: string) => Promise<boolean>;
  incrementDownloadCount: (transferId: string) => Promise<void>;
}

const TransferContext = createContext<TransferContextType | undefined>(undefined);

// Helper to generate UUID-like transfer ID
const generateTransferId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Helper to format bytes
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Helper to calculate time remaining
export const getTimeRemaining = (expiresAt: Date): string => {
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();

  if (diff <= 0) return 'Scaduto';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}g ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

// Helper to get file icon based on mime type
export const getFileIcon = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'spreadsheet';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('compressed')) return 'archive';
  if (mimeType.includes('text')) return 'text';
  return 'file';
};

// Helper to convert API date strings to Date objects
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseTransferDates = (data: Record<string, any>): Transfer => ({
  ...data,
  // Map hasPassword to password for UI compatibility (UI checks `data.password` truthiness)
  password: data.hasPassword ? 'protected' : undefined,
  expiresAt: data.expiresAt ? new Date(data.expiresAt) : new Date(),
  createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
  updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  files: data.files?.map((f: Record<string, any>) => ({
    ...f,
    createdAt: f.createdAt ? new Date(f.createdAt) : new Date(),
  })),
} as Transfer);

export function TransferProvider({ children }: { children: ReactNode }) {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all transfers for current user
  const fetchTransfers = useCallback(async () => {
    if (!user) {
      setTransfers([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/transfer?userId=${user.uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Impossibile caricare i trasferimenti');
      }

      const { transfers: transfersData } = await response.json();
      setTransfers(transfersData.map(parseTransferDates));
    } catch (err) {
      console.error('Error fetching transfers:', err);
      setError('Impossibile caricare i trasferimenti');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get a specific transfer by ID (for authenticated user)
  const getTransfer = useCallback(async (transferId: string): Promise<Transfer | null> => {
    if (!user) return null;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/transfer/${transferId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) return null;

      const data = await response.json();
      return parseTransferDates(data);
    } catch (err) {
      console.error('Error getting transfer:', err);
      return null;
    }
  }, [user]);

  // Get public transfer (for download page - no auth required)
  const getPublicTransfer = useCallback(async (transferId: string): Promise<Transfer | null> => {
    try {
      const response = await fetch(`/api/transfer/${transferId}`);

      if (response.status === 410) {
        // Expired transfer - return with status 'expired' for UI compatibility
        return { status: 'expired' } as Transfer;
      }

      if (!response.ok) return null;

      const data = await response.json();
      return parseTransferDates(data);
    } catch (err) {
      console.error('Error getting public transfer:', err);
      return null;
    }
  }, []);

  // Create a new transfer (using API to enforce plan limits)
  const createTransfer = useCallback(async (
    data: TransferUploadData,
    files: File[]
  ): Promise<UploadResponse> => {
    setLoading(true);
    setError(null);

    try {
      // Check if encryption is supported in this browser
      const canEncrypt = isEncryptionSupported();

      // Encrypt files and prepare metadata
      const encryptedFilesData: Array<{
        file: File | Blob;
        metadata: {
          name: string;
          type: string;
          size: number;
          encryptionKey?: string;
          encryptionIv?: string;
        };
      }> = [];

      for (const file of files) {
        if (canEncrypt) {
          // Encrypt the file
          const { encryptedBlob, metadata } = await encryptFile(file);
          encryptedFilesData.push({
            file: encryptedBlob,
            metadata: {
              name: file.name,
              type: file.type, // Original type for decryption
              size: file.size, // Original size
              encryptionKey: metadata.key,
              encryptionIv: metadata.iv,
            },
          });
        } else {
          // No encryption available - upload as-is
          encryptedFilesData.push({
            file: file,
            metadata: {
              name: file.name,
              type: file.type,
              size: file.size,
            },
          });
        }
      }

      // Prepare files metadata for API
      const filesMetadata = encryptedFilesData.map(({ metadata }) => metadata);

      // Get auth token for authenticated users
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (user) {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Call API to create transfer (with plan limit validation)
      const createResponse = await fetch('/api/transfer', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: data.title,
          message: data.message,
          recipientEmail: data.recipientEmail,
          senderName: data.senderName || user?.displayName || 'Utente',
          senderEmail: data.email, // For anonymous users to receive confirmation
          password: data.password,
          deliveryMethod: data.deliveryMethod,
          expiryDays: data.expiryDays,
          userId: user?.uid || null,
          isAnonymous: !user,
          files: filesMetadata,
          isEncrypted: canEncrypt, // Tell API that files are encrypted
        }),
      });

      const createResult = await createResponse.json();

      if (!createResponse.ok || !createResult.success) {
        throw new Error(createResult.error || 'Impossibile creare il trasferimento');
      }

      const { transferId, internalId, downloadUrl, customUrl, uploadUrls, expiresAt, emailSent } = createResult;

      // Upload files to R2 using presigned URLs
      for (let i = 0; i < encryptedFilesData.length; i++) {
        const { file } = encryptedFilesData[i];
        const uploadUrl = uploadUrls[i].uploadUrl;

        // Upload encrypted data to R2
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': canEncrypt ? 'application/octet-stream' : (file as File).type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload fallito per ${filesMetadata[i].name}`);
        }
      }

      // Confirm upload to activate transfer and update user storage
      const confirmResponse = await fetch('/api/transfer/confirm', {
        method: 'POST',
        headers,
        body: JSON.stringify({ transferId: internalId }),
      });

      if (!confirmResponse.ok) {
        console.error('Failed to confirm transfer:', await confirmResponse.text());
      }

      // Refresh user profile to get updated storage
      await refreshUserProfile();

      // Refresh transfers list
      await fetchTransfers();

      return {
        success: true,
        transferId,
        downloadUrl,
        customUrl, // Branded URL if user has custom slug
        message: data.deliveryMethod === 'email'
          ? (emailSent ? 'Email inviata con successo' : 'Transfer creato, ma invio email fallito')
          : 'Transfer creato con successo',
        deliveryMethod: data.deliveryMethod,
        recipientEmail: data.recipientEmail,
        expiresAt,
      };
    } catch (err) {
      console.error('Error creating transfer:', err);
      const errorMessage = err instanceof Error ? err.message : 'Impossibile creare il trasferimento';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, [user, fetchTransfers, refreshUserProfile]);

  // Update transfer
  const updateTransfer = useCallback(async (
    transferId: string,
    data: Partial<Transfer>
  ): Promise<void> => {
    if (!user) throw new Error('Non autorizzato');

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/transfer/${transferId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Impossibile aggiornare il trasferimento');
      }

      await fetchTransfers();
    } catch (err) {
      console.error('Error updating transfer:', err);
      throw err;
    }
  }, [user, fetchTransfers]);

  // Delete transfer
  const deleteTransfer = useCallback(async (transferId: string): Promise<void> => {
    if (!user) throw new Error('Non autorizzato');

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/transfer/${transferId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Impossibile eliminare il trasferimento');
      }

      await fetchTransfers();
    } catch (err) {
      console.error('Error deleting transfer:', err);
      throw err;
    }
  }, [user, fetchTransfers]);

  // Verify password for protected transfer (using server-side API)
  const verifyPassword = useCallback(async (
    transferId: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/transfer/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transferId, password }),
      });

      if (!response.ok) return false;

      const { valid } = await response.json();
      return valid;
    } catch (err) {
      console.error('Error verifying password:', err);
      return false;
    }
  }, []);

  // Increment download count (using server-side API for atomic increment)
  const incrementDownloadCount = useCallback(async (transferId: string): Promise<void> => {
    try {
      await fetch(`/api/transfer/${transferId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'increment-download' }),
      });
    } catch (err) {
      console.error('Error incrementing download count:', err);
    }
  }, []);

  const value = useMemo(() => ({
    transfers,
    loading,
    error,
    fetchTransfers,
    getTransfer,
    getPublicTransfer,
    createTransfer,
    updateTransfer,
    deleteTransfer,
    verifyPassword,
    incrementDownloadCount,
  }), [transfers, loading, error, fetchTransfers, getTransfer, getPublicTransfer, createTransfer, updateTransfer, deleteTransfer, verifyPassword, incrementDownloadCount]);

  return (
    <TransferContext.Provider value={value}>
      {children}
    </TransferContext.Provider>
  );
}

export function useTransfer() {
  const context = useContext(TransferContext);
  if (context === undefined) {
    throw new Error('useTransfer must be used within a TransferProvider');
  }
  return context;
}
