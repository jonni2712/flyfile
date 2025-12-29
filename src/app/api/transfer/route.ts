import { NextRequest, NextResponse } from 'next/server';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getUploadUrl, generateFileKey } from '@/lib/r2';
import { sendEmail, getTransferNotificationEmail, formatFileSize } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

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
      password,
      deliveryMethod,
      expiryDays,
      userId,
      files // Array of { name, type, size }
    } = body;

    // Validation
    if (!title || !files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Titolo e file sono obbligatori' },
        { status: 400 }
      );
    }

    // Calculate expiry date
    const retentionDays = expiryDays || 5;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + retentionDays);

    // Calculate total size
    const totalSize = files.reduce((acc: number, file: { size: number }) => acc + file.size, 0);

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

    // Send email notification if delivery method is email
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

    return NextResponse.json({
      success: true,
      transferId,
      internalId: transferRef.id,
      downloadUrl,
      uploadUrls,
      expiresAt: expiresAt.toISOString(),
      emailSent,
      message: deliveryMethod === 'email'
        ? emailSent ? 'Email inviata con successo' : 'Transfer creato, ma invio email fallito'
        : 'Transfer creato con successo',
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
