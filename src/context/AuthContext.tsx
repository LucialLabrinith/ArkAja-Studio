import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  signInWithGoogle,
  signOutUser,
  getUserEnquiries,
  getUserDrafts,
  STUDIO_OWNER_EMAIL,
  STUDIO_OWNER_PASSWORD,
} from '../lib/firebase';

interface AuthContextType {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL?: string | null;
  } | null;
  isOwner: boolean;
  loading: boolean;
  signIn: () => Promise<void>;
  signInAsOwner: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  userEnquiries: any[];
  userDrafts: any[];
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isOwner: false,
  loading: true,
  signIn: async () => {},
  signInAsOwner: async () => ({ success: false }),
  signOut: async () => {},
  userEnquiries: [],
  userDrafts: [],
  refreshUserData: async () => {},
});

const OWNER_STORAGE_KEY = 'arkaja_studio_owner_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL?: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEnquiries, setUserEnquiries] = useState<any[]>([]);
  const [userDrafts, setUserDrafts] = useState<any[]>([]);

  const isOwner = Boolean(
    user && user.email && user.email.toLowerCase() === STUDIO_OWNER_EMAIL.toLowerCase()
  );

  const loadData = async (userEmail: string, userId: string) => {
    try {
      if (userEmail) {
        const enqs = await getUserEnquiries(userEmail, userId);
        setUserEnquiries(enqs);
      }
      const drafts = await getUserDrafts(userId);
      setUserDrafts(drafts);
    } catch (e) {
      console.warn('Could not load user data from Firestore:', e);
    }
  };

  useEffect(() => {
    // 1. Check local owner session first
    const savedOwner = localStorage.getItem(OWNER_STORAGE_KEY);
    if (savedOwner) {
      try {
        const parsed = JSON.parse(savedOwner);
        if (parsed?.email?.toLowerCase() === STUDIO_OWNER_EMAIL.toLowerCase()) {
          setUser(parsed);
          setLoading(false);
          loadData(parsed.email, parsed.uid);
          return;
        }
      } catch (e) {
        localStorage.removeItem(OWNER_STORAGE_KEY);
      }
    }

    // 2. Fall back to Firebase Auth listener
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Enforce studio owner security constraint
        if (currentUser.email?.toLowerCase() === STUDIO_OWNER_EMAIL.toLowerCase()) {
          const ownerObj = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || 'Divyaam (Studio Director)',
            photoURL: currentUser.photoURL,
          };
          setUser(ownerObj);
          localStorage.setItem(OWNER_STORAGE_KEY, JSON.stringify(ownerObj));
          await loadData(currentUser.email, currentUser.uid);
        } else {
          // If non-owner signs in with Google, sign them out
          await signOutUser();
          setUser(null);
          localStorage.removeItem(OWNER_STORAGE_KEY);
        }
      } else {
        const saved = localStorage.getItem(OWNER_STORAGE_KEY);
        if (!saved) {
          setUser(null);
          setUserEnquiries([]);
          setUserDrafts([]);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshUserData = async () => {
    if (user?.email) {
      await loadData(user.email, user.uid);
    }
  };

  // Sign in as studio owner using email & password
  const signInAsOwner = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (pass || '').trim();

    if (cleanEmail !== STUDIO_OWNER_EMAIL.toLowerCase() || cleanPass !== STUDIO_OWNER_PASSWORD) {
      return {
        success: false,
        error: 'Access Denied: Invalid director credentials. Only the authorized studio director can access this portal.',
      };
    }

    const ownerUser = {
      uid: 'studio-director-divyaam',
      email: STUDIO_OWNER_EMAIL,
      displayName: 'Divyaam (Studio Director)',
      photoURL: null,
    };

    setUser(ownerUser);
    localStorage.setItem(OWNER_STORAGE_KEY, JSON.stringify(ownerUser));
    await loadData(STUDIO_OWNER_EMAIL, ownerUser.uid);

    return { success: true };
  };

  const handleSignIn = async () => {
    try {
      const signedIn = await signInWithGoogle();
      if (signedIn && signedIn.email) {
        const ownerObj = {
          uid: signedIn.uid,
          email: signedIn.email,
          displayName: signedIn.displayName || 'Divyaam (Studio Director)',
          photoURL: signedIn.photoURL,
        };
        setUser(ownerObj);
        localStorage.setItem(OWNER_STORAGE_KEY, JSON.stringify(ownerObj));
        await loadData(signedIn.email, signedIn.uid);
      }
    } catch (error) {
      console.error('Sign-in failed:', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem(OWNER_STORAGE_KEY);
      await signOutUser();
      setUser(null);
      setUserEnquiries([]);
      setUserDrafts([]);
    } catch (error) {
      console.error('Sign-out failed:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isOwner,
        loading,
        signIn: handleSignIn,
        signInAsOwner,
        signOut: handleSignOut,
        userEnquiries,
        userDrafts,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
