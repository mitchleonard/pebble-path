import { initializeApp } from 'firebase/app';
import { getAuth, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// User profile management
export interface UserProfile {
  uid: string;
  firstName: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export async function createUserProfile(uid: string, firstName: string): Promise<void> {
  const profile: UserProfile = {
    uid,
    firstName,
    createdAt: new Date(),
    lastLoginAt: new Date(),
  };
  await setDoc(doc(db, 'users', uid), profile);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
}

export async function updateLastLogin(uid: string): Promise<void> {
  const docRef = doc(db, 'users', uid);
  await setDoc(docRef, { lastLoginAt: new Date() }, { merge: true });
}

// Data management with user isolation
export async function getUserData(uid: string): Promise<Record<string, any>> {
  const q = query(collection(db, 'userData'), where('uid', '==', uid));
  const querySnapshot = await getDocs(q);
  const data: Record<string, any> = {};
  
  querySnapshot.forEach((doc) => {
    const docData = doc.data();
    if (docData.dataType === 'days') {
      data.days = docData.data;
    } else if (docData.dataType === 'presets') {
      data.presets = docData.data;
    }
  });
  
  return data;
}

export async function saveUserData(uid: string, dataType: 'days' | 'presets', data: any): Promise<void> {
  const docRef = doc(db, 'userData', `${uid}_${dataType}`);
  await setDoc(docRef, {
    uid,
    dataType,
    data,
    updatedAt: new Date(),
  });
}



