'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  signInWithCustomToken,
  signInWithRedirect,
  signInWithEmailAndPassword,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  deleteUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { UserProfile } from '@/types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isProcessingRedirect: boolean;
  sendAuthCode: (email: string) => Promise<void>;
  verifyAuthCode: (email: string, code: string) => Promise<{ isNewUser: boolean }>;
  signInWithGoogle: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(true);

  // Fetch user profile from Firestore
  async function fetchUserProfile(uid: string) {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      setUserProfile({
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as UserProfile);
    }
  }

  // Create user profile in Firestore
  async function createUserProfile(user: User, displayName?: string) {
    const userProfileData: Record<string, unknown> = {
      uid: user.uid,
      email: user.email || '',
      displayName: displayName || user.displayName || '',
      plan: 'free',
      storageUsed: 0,
      storageLimit: 15 * 1024 * 1024 * 1024, // 15 GB for free plan
      monthlyTransfers: 0,
      maxMonthlyTransfers: 20,
      retentionDays: 7,
      filesCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (user.photoURL) {
      userProfileData.photoURL = user.photoURL;
    }

    await setDoc(doc(db, 'users', user.uid), userProfileData);
    await fetchUserProfile(user.uid);
  }

  useEffect(() => {
    // Handle redirect result from Google sign-in
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          // Check if user profile exists, create if not
          const docRef = doc(db, 'users', result.user.uid);
          const docSnap = await getDoc(docRef);

          const isNewUser = !docSnap.exists();
          if (isNewUser) {
            await createUserProfile(result.user);
          } else {
            await fetchUserProfile(result.user.uid);
          }

          // Set session cookie BEFORE redirect
          const token = await result.user.getIdToken();

          // Ensure Stripe customer exists (for new and existing users)
          if (result.user.email) {
            try {
              await fetch('/api/auth/ensure-customer', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  userId: result.user.uid,
                  email: result.user.email,
                }),
              });
            } catch (e) {
              console.error('Failed to ensure Stripe customer:', e);
            }
          }
          document.cookie = `__session=${token}; path=/; max-age=3600; SameSite=Lax; Secure`;

          // Small delay to ensure cookie is set
          await new Promise(resolve => setTimeout(resolve, 100));

          // Redirect to dashboard after successful Google sign-in
          window.location.href = '/upload';
          return; // Don't set isProcessingRedirect to false, we're redirecting
        }
      } catch (error) {
        console.error('Redirect result error:', error);
      }
      setIsProcessingRedirect(false);
    };

    handleRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        await fetchUserProfile(user.uid);
        // Set session cookie for middleware authentication
        const token = await user.getIdToken();
        document.cookie = `__session=${token}; path=/; max-age=3600; SameSite=Lax; Secure`;
      } else {
        setUserProfile(null);
        // Clear session cookie on logout
        document.cookie = '__session=; path=/; max-age=0';
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Send auth code to email
  async function sendAuthCode(email: string) {
    const response = await fetch('/api/auth/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Errore nell\'invio del codice');
    }
  }

  // Verify auth code and sign in
  async function verifyAuthCode(email: string, code: string): Promise<{ isNewUser: boolean }> {
    const response = await fetch('/api/auth/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Codice non valido');
    }

    // Sign in with custom token from server
    await signInWithCustomToken(auth, data.customToken);

    return { isNewUser: data.isNewUser };
  }

  async function signInWithPassword(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signInWithGoogle() {
    // Use redirect flow instead of popup for better compatibility
    await signInWithRedirect(auth, googleProvider);
    // User will be redirected to Google, then back to the app
    // The redirect result is handled in useEffect
  }

  async function signOut() {
    // Clear session cookie before signing out
    document.cookie = '__session=; path=/; max-age=0';
    await firebaseSignOut(auth);
    setUserProfile(null);
  }

  async function updateUserProfile(data: Partial<UserProfile>) {
    if (!user) return;

    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // Update Firebase Auth profile if displayName changed
    if (data.displayName !== undefined) {
      await updateProfile(user, { displayName: data.displayName });
    }

    await fetchUserProfile(user.uid);
  }

  // Delete account (no password needed - uses Bearer token server-side)
  async function deleteAccount() {
    if (!user) throw new Error('Non autorizzato');

    // Get fresh ID token for API authentication
    const idToken = await user.getIdToken(true);

    // Delete user data via API (handles files, transfers, etc.)
    const response = await fetch(`/api/profile?userId=${user.uid}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Impossibile eliminare i dati dell\'account');
    }

    // Delete Firebase Auth account
    await deleteUser(user);

    setUserProfile(null);
  }

  // Refresh user profile (to get updated storage, etc.)
  async function refreshUserProfile() {
    if (user) {
      await fetchUserProfile(user.uid);
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    isProcessingRedirect,
    sendAuthCode,
    verifyAuthCode,
    signInWithGoogle,
    signInWithPassword,
    signOut,
    updateUserProfile,
    deleteAccount,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
