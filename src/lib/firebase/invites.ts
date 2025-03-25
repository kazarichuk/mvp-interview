import { db } from './config';
import { collection, addDoc, doc, getDoc, updateDoc, query, where, getDocs, writeBatch } from 'firebase/firestore';

interface InviteResult {
  success: boolean;
  inviteCode?: string;
  error?: string;
  invites?: any[];
}

interface CandidateData {
  name: string;
  email: string;
  inviteLink?: string;
  cvUrl?: string;
  cvFilename?: string;
  status?: string;
  level?: string;
}

export const createInvite = async (
  userId: string,
  position: string,
  validityHours: number = 24
): Promise<InviteResult> => {
  try {
    const inviteRef = await addDoc(collection(db, 'invites'), {
      userId,
      position,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + validityHours * 60 * 60 * 1000).toISOString(),
    });
    return { success: true, inviteCode: inviteRef.id };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const addCandidate = async (
  inviteId: string,
  candidateData: CandidateData
): Promise<InviteResult> => {
  try {
    const candidateRef = await addDoc(collection(db, 'candidates'), {
      ...candidateData,
      inviteId,
      createdAt: new Date().toISOString(),
    });
    return { success: true, inviteCode: candidateRef.id };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const validateInterviewSession = async (
  inviteCode: string,
  email: string
): Promise<InviteResult> => {
  try {
    const inviteRef = doc(db, 'invites', inviteCode);
    const inviteDoc = await getDoc(inviteRef);
    
    if (!inviteDoc.exists()) {
      return { success: false, error: 'Interview session not found' };
    }
    
    const inviteData = inviteDoc.data();
    const now = new Date();
    const expiresAt = new Date(inviteData.expiresAt);
    
    if (now > expiresAt) {
      return { success: false, error: 'Interview session has expired' };
    }
    
    if (inviteData.status !== 'pending') {
      return { success: false, error: 'Interview session is not active' };
    }

    // Check if email is already used
    const candidatesQuery = query(
      collection(db, 'candidates'),
      where('email', '==', email),
      where('status', '!=', 'cancelled')
    );
    
    const existingCandidates = await getDocs(candidatesQuery);
    if (!existingCandidates.empty) {
      return { success: false, error: 'Email already used for another interview' };
    }
    
    return { success: true, inviteCode };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const deactivateInvite = async (inviteId: string): Promise<InviteResult> => {
  try {
    const inviteRef = doc(db, 'invites', inviteId);
    await updateDoc(inviteRef, {
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to deactivate invite' 
    };
  }
};

export const resetInterviewStatus = async (email: string): Promise<InviteResult> => {
  try {
    const candidatesQuery = query(
      collection(db, 'candidates'),
      where('email', '==', email)
    );
    
    const candidatesSnapshot = await getDocs(candidatesQuery);
    if (candidatesSnapshot.empty) {
      return { success: false, error: 'No candidate found with this email' };
    }

    const batch = writeBatch(db);
    candidatesSnapshot.forEach((doc) => {
      batch.update(doc.ref, { 
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      });
    });

    await batch.commit();
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to reset interview status' 
    };
  }
};

export const getUserInvites = async (userId: string): Promise<InviteResult> => {
  try {
    const invitesQuery = query(
      collection(db, 'invites'),
      where('userId', '==', userId),
      where('status', '==', 'pending')
    );
    
    const invitesSnapshot = await getDocs(invitesQuery);
    const invites = invitesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, invites };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get user invites' 
    };
  }
}; 