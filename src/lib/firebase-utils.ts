import { collection, doc, setDoc, getDocs, query, where, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

// Collection names
export const COLLECTIONS = {
  SUBMISSIONS: 'submissions',
  PORTAL: 'portal',
};

export interface Submission {
  id?: string;
  studentName: string;
  studentId: string;
  month: string;
  selections: {
    [key: string]: boolean | string;
  };
  status: 'submitted' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface PortalStatus {
  isOpen: boolean;
  updatedAt: Date;
}

// Submissions

export const addSubmission = async (data: Omit<Submission, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
  const docRef = doc(collection(db, COLLECTIONS.SUBMISSIONS));
  const submission: Submission = {
    ...data,
    id: docRef.id,
    status: 'submitted',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  await setDoc(docRef, submission);
  return submission;
};

export const getSubmissions = async (month?: string) => {
  const q = month 
    ? query(collection(db, COLLECTIONS.SUBMISSIONS), where('month', '==', month))
    : collection(db, COLLECTIONS.SUBMISSIONS);
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Submission[];
};

// Portal Status

export const getPortalStatus = async (): Promise<boolean> => {
  const docRef = doc(db, COLLECTIONS.PORTAL, 'status');
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data().isOpen as boolean;
  }
  
  // If no document exists, create one with default status (closed)
  await setDoc(docRef, {
    isOpen: false,
    updatedAt: new Date(),
  });
  
  return false;
};

export const updatePortalStatus = async (isOpen: boolean): Promise<boolean> => {
  const docRef = doc(db, COLLECTIONS.PORTAL, 'status');
  await setDoc(docRef, {
    isOpen,
    updatedAt: new Date(),
  }, { merge: true });
  
  return isOpen;
};
