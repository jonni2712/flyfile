import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getUploadUrl, deleteFile } from '@/lib/r2';

// POST - Get presigned URL for avatar upload
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, fileName, contentType } = body;

    if (!userId || !fileName || !contentType) {
      return NextResponse.json(
        { error: 'userId, fileName e contentType richiesti' },
        { status: 400 }
      );
    }

    // Validate content type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: 'Formato immagine non supportato. Usa JPG, PNG, GIF o WebP.' },
        { status: 400 }
      );
    }

    // Verify user exists
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    // Delete old avatar if exists
    const userData = userSnap.data();
    if (userData.avatarPath) {
      try {
        await deleteFile(userData.avatarPath);
      } catch (err) {
        console.error('Error deleting old avatar:', err);
      }
    }

    // Generate unique avatar path
    const timestamp = Date.now();
    const extension = fileName.split('.').pop() || 'jpg';
    const avatarPath = `avatars/${userId}/${timestamp}.${extension}`;

    // Get presigned upload URL
    const uploadUrl = await getUploadUrl(avatarPath, contentType, 3600);

    // Update user with new avatar path
    await updateDoc(userRef, {
      avatarPath,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      uploadUrl,
      avatarPath,
    });
  } catch (error) {
    console.error('Error creating avatar upload URL:', error);
    return NextResponse.json(
      { error: 'Impossibile creare URL per upload avatar' },
      { status: 500 }
    );
  }
}

// PATCH - Confirm avatar upload and update photoURL
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, photoURL } = body;

    if (!userId || !photoURL) {
      return NextResponse.json(
        { error: 'userId e photoURL richiesti' },
        { status: 400 }
      );
    }

    // Verify user exists
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    // Update user photoURL
    await updateDoc(userRef, {
      photoURL,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Avatar aggiornato con successo',
    });
  } catch (error) {
    console.error('Error updating avatar:', error);
    return NextResponse.json(
      { error: 'Impossibile aggiornare l\'avatar' },
      { status: 500 }
    );
  }
}

// DELETE - Remove avatar
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId richiesto' },
        { status: 400 }
      );
    }

    // Verify user exists
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    const userData = userSnap.data();

    // Delete avatar from R2
    if (userData.avatarPath) {
      try {
        await deleteFile(userData.avatarPath);
      } catch (err) {
        console.error('Error deleting avatar from R2:', err);
      }
    }

    // Remove avatar from user profile
    await updateDoc(userRef, {
      photoURL: null,
      avatarPath: null,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Avatar rimosso con successo',
    });
  } catch (error) {
    console.error('Error removing avatar:', error);
    return NextResponse.json(
      { error: 'Impossibile rimuovere l\'avatar' },
      { status: 500 }
    );
  }
}
