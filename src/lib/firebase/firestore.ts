import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { db } from './config';

export const getUserProfile = async (userId: string) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() ? userDoc.data() : null;
};

export const updateUserProfile = async (userId: string, data: any) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, data);
};

export const getInterviews = async (userId: string) => {
  const interviewsRef = collection(db, 'interviews');
  const q = query(interviewsRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getInterview = async (interviewId: string) => {
  const interviewDoc = await getDoc(doc(db, 'interviews', interviewId));
  return interviewDoc.exists() ? { id: interviewDoc.id, ...interviewDoc.data() } : null;
};

export const createInterview = async (data: any) => {
  const interviewsRef = collection(db, 'interviews');
  const newDocRef = doc(interviewsRef);
  await setDoc(newDocRef, data);
  return newDocRef.id;
};

export const updateInterview = async (interviewId: string, data: any) => {
  const interviewRef = doc(db, 'interviews', interviewId);
  await updateDoc(interviewRef, data);
}; 