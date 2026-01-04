'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  confirmPasswordReset as firebaseConfirmPasswordReset,
  verifyPasswordResetCode as firebaseVerifyPasswordResetCode,
  updateProfile,
  updateEmail as firebaseUpdateEmail,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { UserProfile, BillingInfo } from '@/types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, username?: string, billingData?: BillingInfo) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmPasswordReset: (oobCode: string, newPassword: string) => Promise<void>;
  verifyPasswordResetCode: (oobCode: string) => Promise<string>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateEmail: (newEmail: string, currentPassword: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (currentPassword: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  reauthenticate: (password: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
  async function createUserProfile(
    user: User,
    displayName?: string,
    username?: string,
    billingData?: BillingInfo
  ) {
    // Base profile data (Firestore doesn't accept undefined values)
    const userProfileData: Record<string, unknown> = {
      uid: user.uid,
      email: user.email || '',
      displayName: displayName || user.displayName || '',
      plan: 'free',
      storageUsed: 0,
      storageLimit: 5 * 1024 * 1024 * 1024, // 5 GB for free plan
      monthlyTransfers: 0,
      maxMonthlyTransfers: 10,
      retentionDays: 5,
      filesCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Only add optional fields if they have values
    if (username) {
      userProfileData.username = username;
    }
    if (user.photoURL) {
      userProfileData.photoURL = user.photoURL;
    }
    if (billingData) {
      userProfileData.billing = billingData;
    }

    await setDoc(doc(db, 'users', user.uid), userProfileData);

    await fetchUserProfile(user.uid);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        await fetchUserProfile(user.uid);
        // Set session cookie for middleware authentication
        const token = await user.getIdToken();
        document.cookie = `__session=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      } else {
        setUserProfile(null);
        // Clear session cookie on logout
        document.cookie = '__session=; path=/; max-age=0';
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    // Set session cookie immediately for middleware
    const token = await user.getIdToken();
    document.cookie = `__session=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  }

  async function signUp(
    email: string,
    password: string,
    displayName: string,
    username?: string,
    billingData?: BillingInfo
  ) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName });
    await createUserProfile(user, displayName, username, billingData);
    // Set session cookie immediately for middleware
    const token = await user.getIdToken();
    document.cookie = `__session=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  }

  async function signInWithGoogle() {
    const { user } = await signInWithPopup(auth, googleProvider);

    // Check if user profile exists
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      await createUserProfile(user);
    } else {
      await fetchUserProfile(user.uid);
    }

    // Set session cookie immediately for middleware
    const token = await user.getIdToken();
    document.cookie = `__session=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  }

  async function signOut() {
    // Clear session cookie before signing out
    document.cookie = '__session=; path=/; max-age=0';
    await firebaseSignOut(auth);
    setUserProfile(null);
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  // Confirm password reset with code from email
  async function confirmPasswordReset(oobCode: string, newPassword: string) {
    await firebaseConfirmPasswordReset(auth, oobCode, newPassword);
  }

  // Verify password reset code and get email
  async function verifyPasswordResetCode(oobCode: string): Promise<string> {
    return await firebaseVerifyPasswordResetCode(auth, oobCode);
  }

  async function updateUserProfile(data: Partial<UserProfile>) {
    if (!user) return;

    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    await fetchUserProfile(user.uid);
  }

  // Reauthenticate user (required for sensitive operations)
  async function reauthenticate(password: string) {
    if (!user || !user.email) throw new Error('Non autorizzato');

    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
  }

  // Update email
  async function updateEmail(newEmail: string, currentPassword: string) {
    if (!user || !user.email) throw new Error('Non autorizzato');

    // Reauthenticate first
    await reauthenticate(currentPassword);

    // Update email in Firebase Auth
    await firebaseUpdateEmail(user, newEmail);

    // Update email in Firestore
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, {
      email: newEmail,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    await fetchUserProfile(user.uid);
  }

  // Update password
  async function updatePassword(currentPassword: string, newPassword: string) {
    if (!user) throw new Error('Non autorizzato');

    // Reauthenticate first
    await reauthenticate(currentPassword);

    // Update password
    await firebaseUpdatePassword(user, newPassword);
  }

  // Delete account
  async function deleteAccount(currentPassword: string) {
    if (!user) throw new Error('Non autorizzato');

    // Reauthenticate first
    await reauthenticate(currentPassword);

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

  // Send verification email
  async function sendVerificationEmail() {
    if (!user) throw new Error('Non autorizzato');
    await sendEmailVerification(user);
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
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    confirmPasswordReset,
    verifyPasswordResetCode,
    updateUserProfile,
    updateEmail,
    updatePassword,
    deleteAccount,
    sendVerificationEmail,
    reauthenticate,
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
