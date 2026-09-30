import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';

import configData from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: configData.apiKey,
  authDomain: configData.authDomain,
  projectId: configData.projectId,
  storageBucket: configData.storageBucket,
  messagingSenderId: configData.messagingSenderId,
  appId: configData.appId,
  measurementId: configData.measurementId,
};

// Initialize Firebase App singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with configured databaseId if provided
export const db = configData.firestoreDatabaseId
  ? getFirestore(app, configData.firestoreDatabaseId)
  : getFirestore(app);

// Test Firestore connection on boot (per Firebase skill guidelines)
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('ArkAja Studio: Firebase client is offline, check connection.');
    }
  }
}
testConnection();

// Sign In with Google
export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    if (user) {
      // Upsert user profile to Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'ArkAja Client',
          photoURL: user.photoURL || '',
          lastLoginAt: new Date().toISOString(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
    return user;
  } catch (err: any) {
    console.error('Google Sign-In error:', err);
    throw err;
  }
}

// Sign Out
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

// Persist Enquiry to Firestore
export async function saveEnquiryToFirestore(enquiry: any): Promise<void> {
  try {
    const enquiryRef = doc(db, 'enquiries', enquiry.id || enquiry.enquiryId);
    await setDoc(enquiryRef, {
      enquiryId: enquiry.id || enquiry.enquiryId,
      userId: enquiry.userId || 'guest',
      userEmail: enquiry.email,
      fullName: enquiry.fullName,
      brandName: enquiry.brandName,
      email: enquiry.email,
      country: enquiry.country || '',
      phone: enquiry.phone || '',
      businessCategory: enquiry.businessCategory || '',
      neededServices: enquiry.neededServices || [],
      preferredPackage: enquiry.preferredPackage || '',
      deliverableCounts: enquiry.deliverableCounts || {},
      timeline: enquiry.timeline || '',
      budget: enquiry.budget || '',
      projectDetails: enquiry.projectDetails,
      referenceLinks: enquiry.referenceLinks || '',
      status: 'pending_review',
      createdAt: enquiry.createdAt || new Date().toISOString(),
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.error('Failed to persist enquiry to Firestore:', err);
  }
}

// Save Project Scope Draft
export async function saveDraftToFirestore(userId: string, draft: any): Promise<void> {
  try {
    const draftId = draft.draftId || `draft-${Date.now()}`;
    const draftRef = doc(db, 'users', userId, 'drafts', draftId);
    await setDoc(
      draftRef,
      {
        draftId,
        userId,
        brandName: draft.brandName || '',
        category: draft.category || '',
        timeline: draft.timeline || '',
        budget: draft.budget || '',
        deliverables: draft.deliverables || {},
        selectedServices: draft.selectedServices || [],
        notes: draft.notes || '',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Failed to save draft to Firestore:', err);
  }
}

// Get User's submitted enquiries
export async function getUserEnquiries(email: string, userId?: string) {
  try {
    const enquiriesRef = collection(db, 'enquiries');
    const q = query(enquiriesRef, where('email', '==', email));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data());
  } catch (err) {
    console.error('Error fetching user enquiries:', err);
    return [];
  }
}

// Get User's drafts
export async function getUserDrafts(userId: string) {
  try {
    const draftsRef = collection(db, 'users', userId, 'drafts');
    const snapshot = await getDocs(draftsRef);
    return snapshot.docs.map((doc) => doc.data());
  } catch (err) {
    console.error('Error fetching user drafts:', err);
    return [];
  }
}
