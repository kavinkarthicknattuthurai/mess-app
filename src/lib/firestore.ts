import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  Timestamp
} from 'firebase/firestore';

export interface PortalStatus {
  month: string;
  isOpen: boolean;
  closingDate: string | null;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  createdAt: any; // Timestamp in Firestore
}

// Collection references
const portalsCollection = 'portals';

// Create or update a portal
export async function createOrUpdatePortal(portal: PortalStatus): Promise<void> {
  try {
    // Use the month as the document ID (lowercase for consistency)
    const docId = portal.month.toLowerCase();
    const docRef = doc(db, portalsCollection, docId);
    
    // Add createdAt if it's a new document
    const finalPortal = {
      ...portal,
      createdAt: portal.createdAt || Timestamp.now()
    };
    
    await setDoc(docRef, finalPortal);
    console.log(`Portal for ${portal.month} saved to Firestore`);
  } catch (error) {
    console.error('Error saving portal to Firestore:', error);
    throw error;
  }
}

// Get all portals
export async function getAllPortals(): Promise<PortalStatus[]> {
  try {
    const querySnapshot = await getDocs(collection(db, portalsCollection));
    const portals: PortalStatus[] = [];
    
    querySnapshot.forEach((doc) => {
      portals.push(doc.data() as PortalStatus);
    });
    
    return portals;
  } catch (error) {
    console.error('Error getting portals from Firestore:', error);
    throw error;
  }
}

// Get a specific portal by month
export async function getPortalByMonth(month: string): Promise<PortalStatus | null> {
  try {
    const docRef = doc(db, portalsCollection, month.toLowerCase());
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as PortalStatus;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting portal from Firestore:', error);
    throw error;
  }
}

// Close a portal
export async function closePortal(month: string): Promise<void> {
  try {
    const docRef = doc(db, portalsCollection, month.toLowerCase());
    await updateDoc(docRef, {
      isOpen: false,
      closingDate: null
    });
    console.log(`Portal for ${month} closed in Firestore`);
  } catch (error) {
    console.error('Error closing portal in Firestore:', error);
    throw error;
  }
} 