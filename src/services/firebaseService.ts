import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, orderBy, getDocs, Timestamp, doc, setDoc, serverTimestamp, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { MindfulnessResponse } from './geminiService';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
// Explicitly pass the bucket to ensure it's using the right one
export const storage = getStorage(app, `gs://${firebaseConfig.storageBucket}`);

/**
 * Converts a gs:// URL to a public download URL
 */
export const resolveStorageUrl = async (gsUrl: string) => {
  try {
    // Standardize path: remove gs://[bucket]/
    const bucket = firebaseConfig.storageBucket;
    const prefix = `gs://${bucket}/`;
    let path = gsUrl;
    if (gsUrl.startsWith(prefix)) {
      path = gsUrl.replace(prefix, '');
    } else if (gsUrl.startsWith('gs://')) {
      // Handle case where bucket name might be different
      const parts = gsUrl.replace('gs://', '').split('/');
      parts.shift(); // remove bucket
      path = parts.join('/');
    }
    
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (err) {
    console.error("Error resolving storage URL:", gsUrl, err);
    return null;
  }
};

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
  UPLOAD = 'upload',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error Details: ', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}

const googleProvider = new GoogleAuthProvider();

export const uploadImage = async (userId: string, imageBlob: Blob, fileName: string) => {
  const path = `journal-photos/${userId}/${fileName}`;
  const storageRef = ref(storage, path);
  console.log(`Menyimpan ke path: ${path} di bucket: ${storage.app.options.storageBucket}`);

  try {
    const snapshot = await uploadBytes(storageRef, imageBlob, {
      contentType: 'image/jpeg'
    });
    console.log("Upload berhasil untuk file:", fileName);
    return await getDownloadURL(snapshot.ref);
  } catch (error: any) {
    console.error("Storage Upload Error Detail:", {
      code: error.code,
      message: error.message,
      customMetadata: error.customMetadata,
      serverResponse: error.serverResponse
    });
    
    if (error.code === 'storage/unauthorized' || (error.message && error.message.includes('permission-denied'))) {
      throw new Error(`Izin ditolak (Permission Denied). User: ${userId}. Path: ${path}. Pastikan Storage Rules mengizinkan upload ke path ini.`);
    }
    if (error.code === 'storage/retry-limit-exceeded') {
      throw new Error("Koneksi bermasalah atau waktu habis saat mengupload. Coba lagi.");
    }
    handleFirestoreError(error, OperationType.UPLOAD, path);
    return null;
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Initialize user doc if not exists
    const userPath = `users/${user.uid}`;
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, userPath);
    }
    
    return user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export interface StoredReflection {
  id?: string;
  userId: string;
  content: string;
  type: 'text' | 'audio';
  emotion: string;
  timestamp: Timestamp;
  response: MindfulnessResponse;
  photoUrl?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  customLogoURL?: string | null;
  onboarding_completed?: boolean;
  goal?: string;
  goal_text?: string;
  createdAt: any;
}

export const getUserProfile = async (uid: string) => {
  const path = `users/${uid}`;
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const path = `users/${uid}`;
  try {
    await setDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const saveReflection = async (userId: string, content: string, type: 'text' | 'audio', reflection: MindfulnessResponse, photoUrl?: string) => {
  const path = 'reflections';
  const currentUid = auth.currentUser?.uid;
  
  if (!currentUid) {
    throw new Error("User must be authenticated to save a reflection.");
  }

  if (userId !== currentUid) {
    console.warn(`UserId mismatch: passed ${userId}, but auth.currentUser.uid is ${currentUid}. Using auth.currentUser.uid.`);
  }

  try {
    const docData: any = {
      userId: currentUid, // Force use the authenticated UID
      content,
      type,
      emotion: reflection.mood || 'Tidak_terdeteksi',
      timestamp: serverTimestamp(),
      response: {
        ...reflection
      },
    };
    
    if (photoUrl) {
      docData.photoUrl = photoUrl;
    }

    await addDoc(collection(db, path), docData);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const getRecentReflections = async (userId: string, days: number = 7) => {
  const path = 'reflections';
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    const q = query(
      collection(db, path),
      where('userId', '==', userId),
      where('timestamp', '>=', Timestamp.fromDate(cutoff))
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StoredReflection));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return []; // Should not reach here due to handleFirestoreError throwing
  }
};

export const getAllReflections = async (userId: string) => {
  const path = 'reflections';
  try {
    const q = query(
      collection(db, path),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StoredReflection));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return []; // Should not reach here due to handleFirestoreError throwing
  }
};

export const deleteReflection = async (id: string | undefined) => {
  if (!id) return;
  const path = `reflections/${id}`;
  try {
    await deleteDoc(doc(db, 'reflections', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const updateReflection = async (id: string | undefined, content: string) => {
  if (!id) return;
  const path = `reflections/${id}`;
  try {
    await updateDoc(doc(db, 'reflections', id), {
      content,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};
