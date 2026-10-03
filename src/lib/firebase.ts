import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDocFromServer,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';

import configData from '../../firebase-applet-config.json';

export const STUDIO_OWNER_EMAIL = 'divyaam2008@gmail.com';
export const STUDIO_OWNER_PASSWORD = 'animefanme';

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

// Persist ArkAja Studio metadata in Firestore
export async function initializeStudioMetadata() {
  try {
    const studioRef = doc(db, 'studio', 'info');
    await setDoc(
      studioRef,
      {
        name: 'ArkAja Studio',
        studioName: 'ArkAja Studio',
        displayName: 'ArkAja Studio',
        tagline: 'Creative content for brands with something to say.',
        positioning: 'AI-assisted creative production. Human-led art direction.',
        email: 'arkajastudio@gmail.com',
        databaseId: configData.firestoreDatabaseId,
        projectId: configData.projectId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Studio metadata sync note:', err);
  }
}
initializeStudioMetadata();

// Sign In with Google (Restricted to Studio Owner)
export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    if (user) {
      // Check if the user is the authorized studio owner
      if (user.email?.toLowerCase() !== STUDIO_OWNER_EMAIL.toLowerCase()) {
        await signOut(auth);
        throw new Error('Access restricted: Only the authorized studio director is permitted to access studio management.');
      }

      // Upsert admin profile to Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Studio Director',
          photoURL: user.photoURL || '',
          role: 'studio_owner',
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
      recipientEmail: STUDIO_OWNER_EMAIL,
      createdAt: enquiry.createdAt || new Date().toISOString(),
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.error('Failed to persist enquiry to Firestore:', err);
  }
}

// Real-time listener for ALL Enquiries (for Studio Owner divyaam2008@gmail.com)
export function subscribeToAllEnquiries(
  onUpdate: (enquiries: any[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const enquiriesRef = collection(db, 'enquiries');
    const unsubscribe = onSnapshot(
      enquiriesRef,
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        // Sort descending by date
        list.sort((a: any, b: any) => {
          const tA = new Date(a.createdAt || 0).getTime();
          const tB = new Date(b.createdAt || 0).getTime();
          return tB - tA;
        });
        onUpdate(list);
      },
      (error) => {
        console.warn('Real-time enquiries subscription note:', error);
        if (onError) onError(error);
      }
    );
    return unsubscribe;
  } catch (err: any) {
    console.warn('Failed to attach enquiries listener:', err);
    return () => {};
  }
}

// Real-time listener for Portfolio Projects (updates live on website for all visitors)
export function subscribeToPortfolioProjects(
  onUpdate: (projects: any[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const projectsRef = collection(db, 'projects');
    const unsubscribe = onSnapshot(
      projectsRef,
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        onUpdate(list);
      },
      (error) => {
        console.warn('Real-time portfolio projects subscription note:', error);
        if (onError) onError(error);
      }
    );
    return unsubscribe;
  } catch (err: any) {
    console.warn('Failed to attach portfolio projects listener:', err);
    return () => {};
  }
}

// Add New Project to Firestore (Only Studio Owner)
export async function addProjectToFirestore(project: {
  id: string;
  slug?: string;
  title: string;
  category: string;
  subtitle: string;
  description: string;
  images: string[];
  deliverables: string[];
  creativeDirections?: any[];
}): Promise<void> {
  const projectRef = doc(db, 'projects', project.id);
  await setDoc(projectRef, {
    ...project,
    createdBy: STUDIO_OWNER_EMAIL,
    createdAt: new Date().toISOString(),
    timestamp: serverTimestamp(),
  });
}

// Delete Project from Firestore
export async function deleteProjectFromFirestore(projectId: string): Promise<void> {
  const projectRef = doc(db, 'projects', projectId);
  await deleteDoc(projectRef);
}

// Update Enquiry Status in Firestore
export async function updateEnquiryStatusInFirestore(
  enquiryId: string,
  status: 'pending_review' | 'contacted' | 'booked' | 'archived'
): Promise<void> {
  const enquiryRef = doc(db, 'enquiries', enquiryId);
  await setDoc(enquiryRef, { status, updatedAt: new Date().toISOString() }, { merge: true });
}

// Get User's submitted enquiries
export async function getUserEnquiries(email: string, userId?: string) {
  try {
    const enquiriesRef = collection(db, 'enquiries');
    const q = query(enquiriesRef, where('email', '==', email));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => docSnap.data());
  } catch (err) {
    console.error('Error fetching user enquiries:', err);
    return [];
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

// Get User's drafts
export async function getUserDrafts(userId: string) {
  try {
    const draftsRef = collection(db, 'users', userId, 'drafts');
    const snapshot = await getDocs(draftsRef);
    return snapshot.docs.map((docSnap) => docSnap.data());
  } catch (err) {
    console.error('Error fetching user drafts:', err);
    return [];
  }
}
