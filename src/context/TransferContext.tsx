'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { Transfer, TransferFile, TransferUploadData, UploadResponse } from '@/types';

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

export function TransferProvider({ children }: { children: ReactNode }) {
  const { user, userProfile } = useAuth();
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
      const transfersRef = collection(db, 'transfers');
      const q = query(
        transfersRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const transfersData: Transfer[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();

        // Fetch files for this transfer
        const filesRef = collection(db, 'transfers', docSnap.id, 'files');
        const filesSnapshot = await getDocs(filesRef);
        const files: TransferFile[] = filesSnapshot.docs.map(fileDoc => ({
          id: fileDoc.id,
          ...fileDoc.data(),
          createdAt: fileDoc.data().createdAt?.toDate() || new Date(),
        })) as TransferFile[];

        transfersData.push({
          id: docSnap.id,
          ...data,
          files,
          expiresAt: data.expiresAt?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Transfer);
      }

      setTransfers(transfersData);
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
      // Try to find by transferId field
      const transfersRef = collection(db, 'transfers');
      const q = query(
        transfersRef,
        where('transferId', '==', transferId),
        where('userId', '==', user.uid)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) return null;

      const docSnap = snapshot.docs[0];
      const data = docSnap.data();

      // Fetch files
      const filesRef = collection(db, 'transfers', docSnap.id, 'files');
      const filesSnapshot = await getDocs(filesRef);
      const files: TransferFile[] = filesSnapshot.docs.map(fileDoc => ({
        id: fileDoc.id,
        ...fileDoc.data(),
        createdAt: fileDoc.data().createdAt?.toDate() || new Date(),
      })) as TransferFile[];

      return {
        id: docSnap.id,
        ...data,
        files,
        expiresAt: data.expiresAt?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Transfer;
    } catch (err) {
      console.error('Error getting transfer:', err);
      return null;
    }
  }, [user]);

  // Get public transfer (for download page - no auth required)
  const getPublicTransfer = useCallback(async (transferId: string): Promise<Transfer | null> => {
    try {
      const transfersRef = collection(db, 'transfers');
      const q = query(
        transfersRef,
        where('transferId', '==', transferId)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) return null;

      const docSnap = snapshot.docs[0];
      const data = docSnap.data();

      // Check if expired
      const expiresAt = data.expiresAt?.toDate() || new Date();
      if (expiresAt < new Date()) {
        return {
          id: docSnap.id,
          ...data,
          status: 'expired',
          expiresAt,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Transfer;
      }

      // Fetch files
      const filesRef = collection(db, 'transfers', docSnap.id, 'files');
      const filesSnapshot = await getDocs(filesRef);
      const files: TransferFile[] = filesSnapshot.docs.map(fileDoc => ({
        id: fileDoc.id,
        ...fileDoc.data(),
        createdAt: fileDoc.data().createdAt?.toDate() || new Date(),
      })) as TransferFile[];

      return {
        id: docSnap.id,
        ...data,
        files,
        expiresAt,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Transfer;
    } catch (err) {
      console.error('Error getting public transfer:', err);
      return null;
    }
  }, []);

  // Create a new transfer
  const createTransfer = useCallback(async (
    data: TransferUploadData,
    files: File[]
  ): Promise<UploadResponse> => {
    setLoading(true);
    setError(null);

    try {
      // Calculate retention days based on user plan
      const retentionDays = data.expiryDays || userProfile?.retentionDays || 5;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + retentionDays);

      // Calculate total size
      const totalSize = files.reduce((acc, file) => acc + file.size, 0);

      // Generate unique transfer ID
      const transferId = generateTransferId();

      // Create transfer document
      const transferData = {
        transferId,
        userId: user?.uid || null,
        title: data.title,
        message: data.message || null,
        recipientEmail: data.recipientEmail || null,
        senderName: data.senderName || user?.displayName || 'Utente',
        password: data.password ? await hashPassword(data.password) : null,
        deliveryMethod: data.deliveryMethod,
        status: 'active',
        totalSize,
        fileCount: files.length,
        downloadCount: 0,
        maxDownloads: null,
        expiresAt: Timestamp.fromDate(expiresAt),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const transferRef = await addDoc(collection(db, 'transfers'), transferData);

      // Upload files to R2 and create file documents
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Get upload URL from API
        const uploadUrlResponse = await fetch('/api/files/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            transferId: transferRef.id,
          }),
        });

        if (!uploadUrlResponse.ok) {
          throw new Error('Impossibile ottenere URL di upload');
        }

        const { uploadUrl, key } = await uploadUrlResponse.json();

        // Upload to R2
        await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        // Create file document
        await addDoc(collection(db, 'transfers', transferRef.id, 'files'), {
          transferId: transferRef.id,
          originalName: file.name,
          storedName: key,
          path: key,
          size: file.size,
          mimeType: file.type,
          downloadCount: 0,
          createdAt: serverTimestamp(),
        });
      }

      // Confirm upload
      await fetch('/api/files/confirm-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transferId: transferRef.id }),
      });

      // Refresh transfers list
      await fetchTransfers();

      const downloadUrl = `${window.location.origin}/download/${transferId}`;

      return {
        success: true,
        transferId,
        downloadUrl,
        message: data.deliveryMethod === 'email'
          ? 'Email inviata con successo'
          : 'Transfer creato con successo',
        deliveryMethod: data.deliveryMethod,
        recipientEmail: data.recipientEmail,
        expiresAt: expiresAt.toISOString(),
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
  }, [user, userProfile, fetchTransfers]);

  // Update transfer
  const updateTransfer = useCallback(async (
    transferId: string,
    data: Partial<Transfer>
  ): Promise<void> => {
    if (!user) throw new Error('Non autorizzato');

    try {
      // Find transfer document
      const transfersRef = collection(db, 'transfers');
      const q = query(
        transfersRef,
        where('transferId', '==', transferId),
        where('userId', '==', user.uid)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) throw new Error('Transfer non trovato');

      const docRef = doc(db, 'transfers', snapshot.docs[0].id);

      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });

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
      // Find transfer document
      const transfersRef = collection(db, 'transfers');
      const q = query(
        transfersRef,
        where('transferId', '==', transferId),
        where('userId', '==', user.uid)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) throw new Error('Transfer non trovato');

      const docId = snapshot.docs[0].id;

      // Delete files from R2
      await fetch('/api/files/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transferId: docId }),
      });

      // Delete file documents
      const filesRef = collection(db, 'transfers', docId, 'files');
      const filesSnapshot = await getDocs(filesRef);
      for (const fileDoc of filesSnapshot.docs) {
        await deleteDoc(doc(db, 'transfers', docId, 'files', fileDoc.id));
      }

      // Delete transfer document
      await deleteDoc(doc(db, 'transfers', docId));

      await fetchTransfers();
    } catch (err) {
      console.error('Error deleting transfer:', err);
      throw err;
    }
  }, [user, fetchTransfers]);

  // Verify password for protected transfer
  const verifyPassword = useCallback(async (
    transferId: string,
    password: string
  ): Promise<boolean> => {
    try {
      const transfersRef = collection(db, 'transfers');
      const q = query(transfersRef, where('transferId', '==', transferId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) return false;

      const data = snapshot.docs[0].data();
      if (!data.password) return true;

      // Verify password hash
      const isValid = await verifyPasswordHash(password, data.password);
      return isValid;
    } catch (err) {
      console.error('Error verifying password:', err);
      return false;
    }
  }, []);

  // Increment download count
  const incrementDownloadCount = useCallback(async (transferId: string): Promise<void> => {
    try {
      const transfersRef = collection(db, 'transfers');
      const q = query(transfersRef, where('transferId', '==', transferId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) return;

      const docRef = doc(db, 'transfers', snapshot.docs[0].id);
      const currentCount = snapshot.docs[0].data().downloadCount || 0;

      await updateDoc(docRef, {
        downloadCount: currentCount + 1,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error incrementing download count:', err);
    }
  }, []);

  const value = {
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
  };

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

// Simple password hashing (in production, use bcrypt on server)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPasswordHash(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}
