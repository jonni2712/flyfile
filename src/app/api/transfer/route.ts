import { NextRequest, NextResponse } from 'next/server';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getUploadUrl, generateFileKey } from '@/lib/r2';
import { sendEmail, getTransferNotificationEmail, getUploadConfirmationEmail, formatFileSize } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';
import { getPlanLimits } from '@/types';

// Default limits for anonymous users (same as free plan)
const ANONYMOUS_LIMITS = {
  storageLimit: 5 * 1024 * 1024 * 1024, // 5 GB
  maxTransfers: 10,
  maxFilesPerTransfer: 10,
  retentionDays: 5,
  passwordProtection: false,
  customExpiry: false,
};

// Simple password hashing for demo (in production use bcrypt on server)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + process.env.PASSWORD_SALT || 'flyfile-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// POST - Create a new transfer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      message,
      recipientEmail,
      senderName,
      senderEmail, // Email for anonymous users to receive confirmation
      password,
      deliveryMethod,
      expiryDays,
      userId,
      isAnonymous,
      files // Array of { name, type, size }
    } = body;

    // Validation
    if (!title || !files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Titolo e file sono obbligatori' },
        { status: 400 }
      );
    }

    // Calculate total size
    const totalSize = files.reduce((acc: number, file: { size: number }) => acc + file.size, 0);

    // Check user plan limits
    let planLimits;
    let currentStorageUsed = 0;
    let currentMonthlyTransfers = 0;
    let maxRetentionDays = 5;

    if (isAnonymous || !userId) {
      // Anonymous user - use free plan limits
      planLimits = ANONYMOUS_LIMITS;
      maxRetentionDays = ANONYMOUS_LIMITS.retentionDays;
    } else {
      // Registered user - fetch their plan
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return NextResponse.json(
          { success: false, error: 'Utente non trovato' },
          { status: 404 }
        );
      }

      const userData = userSnap.data();
      const userPlan = userData.plan || 'free';
      planLimits = getPlanLimits(userPlan);
      currentStorageUsed = userData.storageUsed || 0;
      currentMonthlyTransfers = userData.monthlyTransfers || 0;
      maxRetentionDays = userData.retentionDays || planLimits.retentionDays;

      // Check storage limit (skip for business plan with unlimited storage)
      if (planLimits.storageLimit !== -1 && currentStorageUsed + totalSize > (userData.storageLimit || planLimits.storageLimit)) {
        const limitInGB = ((userData.storageLimit || planLimits.storageLimit) / (1024 * 1024 * 1024)).toFixed(0);
        const usedInGB = (currentStorageUsed / (1024 * 1024 * 1024)).toFixed(2);
        return NextResponse.json(
          {
            success: false,
            error: `Limite di storage raggiunto. Hai usato ${usedInGB} GB su ${limitInGB} GB disponibili. Passa a un piano superiore per più spazio.`,
            code: 'STORAGE_LIMIT_EXCEEDED'
          },
          { status: 403 }
        );
      }

      // Check monthly transfer limit (skip for business plan with unlimited transfers)
      const maxTransfers = userData.maxMonthlyTransfers || planLimits.maxTransfers;
      if (planLimits.maxTransfers !== -1 && currentMonthlyTransfers >= maxTransfers) {
        return NextResponse.json(
          {
            success: false,
            error: `Hai raggiunto il limite di ${maxTransfers} trasferimenti mensili. Passa a un piano superiore per più trasferimenti.`,
            code: 'TRANSFER_LIMIT_EXCEEDED'
          },
          { status: 403 }
        );
      }

      // Check max files per transfer (skip for business plan)
      if (planLimits.maxFilesPerTransfer !== -1 && files.length > planLimits.maxFilesPerTransfer) {
        return NextResponse.json(
          {
            success: false,
            error: `Puoi caricare massimo ${planLimits.maxFilesPerTransfer} file per trasferimento. Passa a un piano superiore per caricare più file.`,
            code: 'FILES_LIMIT_EXCEEDED'
          },
          { status: 403 }
        );
      }

      // Check password protection (only Pro and Business)
      if (password && !planLimits.passwordProtection) {
        return NextResponse.json(
          {
            success: false,
            error: 'La protezione con password è disponibile solo per i piani Pro e Business.',
            code: 'FEATURE_NOT_AVAILABLE'
          },
          { status: 403 }
        );
      }

      // Check custom expiry (only Pro and Business)
      if (expiryDays && expiryDays > maxRetentionDays && !planLimits.customExpiry) {
        return NextResponse.json(
          {
            success: false,
            error: `Il tuo piano permette una conservazione massima di ${maxRetentionDays} giorni. Passa a un piano superiore per una maggiore durata.`,
            code: 'EXPIRY_LIMIT_EXCEEDED'
          },
          { status: 403 }
        );
      }
    }

    // For anonymous users, check limits
    if (isAnonymous || !userId) {
      if (files.length > ANONYMOUS_LIMITS.maxFilesPerTransfer) {
        return NextResponse.json(
          {
            success: false,
            error: `Puoi caricare massimo ${ANONYMOUS_LIMITS.maxFilesPerTransfer} file per trasferimento. Registrati per caricare più file.`,
            code: 'FILES_LIMIT_EXCEEDED'
          },
          { status: 403 }
        );
      }

      if (password) {
        return NextResponse.json(
          {
            success: false,
            error: 'La protezione con password è disponibile solo per utenti registrati con piano Pro o Business.',
            code: 'FEATURE_NOT_AVAILABLE'
          },
          { status: 403 }
        );
      }
    }

    // Calculate expiry date (respect plan limits)
    const retentionDays = Math.min(expiryDays || 5, maxRetentionDays);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + retentionDays);

    // Generate unique transfer ID (UUID for public URL)
    const transferId = uuidv4();

    // Hash password if provided
    const hashedPassword = password ? await hashPassword(password) : null;

    // Create transfer document
    const transferData = {
      transferId,
      userId: userId || null,
      title,
      message: message || null,
      recipientEmail: recipientEmail || null,
      senderName: senderName || 'Utente',
      senderEmail: senderEmail || null, // For anonymous users
      password: hashedPassword,
      deliveryMethod: deliveryMethod || 'link',
      status: 'pending', // Will be set to 'active' after files are uploaded
      totalSize,
      fileCount: files.length,
      downloadCount: 0,
      maxDownloads: null,
      expiresAt: Timestamp.fromDate(expiresAt),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const transferRef = await addDoc(collection(db, 'transfers'), transferData);

    // Generate upload URLs for each file
    const uploadUrls = await Promise.all(
      files.map(async (file: { name: string; type: string; size: number }, index: number) => {
        const r2Key = generateFileKey(transferRef.id, file.name);
        const uploadUrl = await getUploadUrl(r2Key, file.type);

        // Create file document
        await addDoc(collection(db, 'transfers', transferRef.id, 'files'), {
          transferId: transferRef.id,
          originalName: file.name,
          storedName: r2Key,
          path: r2Key,
          size: file.size,
          mimeType: file.type,
          downloadCount: 0,
          order: index,
          createdAt: serverTimestamp(),
        });

        return {
          fileName: file.name,
          uploadUrl,
          key: r2Key,
        };
      })
    );

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const downloadUrl = `${baseUrl}/download/${transferId}`;

    // Send email notification to recipient if delivery method is email
    let emailSent = false;
    if (deliveryMethod === 'email' && recipientEmail) {
      try {
        const { html, text } = getTransferNotificationEmail({
          senderName: senderName || 'Qualcuno',
          title,
          message,
          downloadLink: downloadUrl,
          fileCount: files.length,
          totalSize: formatFileSize(totalSize),
          expiresAt: expiresAt.toLocaleDateString('it-IT', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        });

        await sendEmail({
          to: recipientEmail,
          subject: `${senderName || 'Qualcuno'} ti ha inviato dei file tramite FlyFile`,
          html,
          text,
        });

        emailSent = true;
      } catch (emailError) {
        console.error('Error sending transfer notification email:', emailError);
        // Don't fail the transfer if email fails
      }
    }

    // Send confirmation email to sender (for anonymous users)
    let senderEmailSent = false;
    if (senderEmail) {
      try {
        const { html: confirmHtml, text: confirmText } = getUploadConfirmationEmail({
          senderName: senderName || 'Utente',
          title,
          downloadLink: downloadUrl,
          fileCount: files.length,
          totalSize: formatFileSize(totalSize),
          expiresAt: expiresAt.toLocaleDateString('it-IT', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          recipientEmail: recipientEmail || undefined,
        });

        await sendEmail({
          to: senderEmail,
          subject: `Upload completato: ${title} - FlyFile`,
          html: confirmHtml,
          text: confirmText,
        });

        senderEmailSent = true;
      } catch (emailError) {
        console.error('Error sending upload confirmation email:', emailError);
        // Don't fail the transfer if email fails
      }
    }

    return NextResponse.json({
      success: true,
      transferId,
      internalId: transferRef.id,
      downloadUrl,
      uploadUrls,
      expiresAt: expiresAt.toISOString(),
      emailSent,
      senderEmailSent,
      message: deliveryMethod === 'email'
        ? emailSent ? 'Email inviata con successo' : 'Transfer creato, ma invio email fallito'
        : senderEmailSent ? 'Transfer creato e conferma inviata via email' : 'Transfer creato con successo',
    });
  } catch (error) {
    console.error('Error creating transfer:', error);
    return NextResponse.json(
      { success: false, error: 'Impossibile creare il trasferimento' },
      { status: 500 }
    );
  }
}

// GET - Get all transfers for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId richiesto' },
        { status: 400 }
      );
    }

    const transfersRef = collection(db, 'transfers');
    const q = query(
      transfersRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const transfers = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();

      // Fetch files for this transfer
      const filesRef = collection(db, 'transfers', docSnap.id, 'files');
      const filesSnapshot = await getDocs(filesRef);
      const files = filesSnapshot.docs.map(fileDoc => ({
        id: fileDoc.id,
        ...fileDoc.data(),
        createdAt: fileDoc.data().createdAt?.toDate()?.toISOString() || null,
      }));

      transfers.push({
        id: docSnap.id,
        ...data,
        files,
        expiresAt: data.expiresAt?.toDate()?.toISOString() || null,
        createdAt: data.createdAt?.toDate()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate()?.toISOString() || null,
      });
    }

    return NextResponse.json({ transfers });
  } catch (error) {
    console.error('Error fetching transfers:', error);
    return NextResponse.json(
      { error: 'Impossibile recuperare i trasferimenti' },
      { status: 500 }
    );
  }
}
