import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  signInWithGoogle,
  signOutUser,
  getUserEnquiries,
  getUserDrafts,
} from '../lib/firebase';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  userEnquiries: any[];
  userDrafts: any[];
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  userEnquiries: [],
  userDrafts: [],
  refreshUserData: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEnquiries, setUserEnquiries] = useState<any[]>([]);
  const [userDrafts, setUserDrafts] = useState<any[]>([]);

  const loadData = async (currentUser: FirebaseUser) => {
    try {
      if (currentUser.email) {
        const enqs = await getUserEnquiries(currentUser.email, currentUser.uid);
        setUserEnquiries(enqs);
      }
      const drafts = await getUserDrafts(currentUser.uid);
      setUserDrafts(drafts);
    } catch (e) {
      console.warn('Could not load user data from Firestore:', e);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        await loadData(currentUser);
      } else {
        setUserEnquiries([]);
        setUserDrafts([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const refreshUserData = async () => {
    if (user) {
      await loadData(user);
    }
  };

  const handleSignIn = async () => {
    try {
      const signedIn = await signInWithGoogle();
      if (signedIn) {
        await loadData(signedIn);
      }
    } catch (error) {
      console.error('Sign-in failed:', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
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
        loading,
        signIn: handleSignIn,
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
