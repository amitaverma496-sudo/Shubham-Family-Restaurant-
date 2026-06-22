import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

console.log('[Firebase Init] Loading configuration JSON values:', JSON.stringify({
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  firestoreDatabaseId: (firebaseConfig as any).firestoreDatabaseId,
  hasApiKey: !!firebaseConfig.apiKey,
}));

const config = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
};

console.log('[Firebase Init] Computed config params:', {
  projectId: config.projectId,
  authDomain: config.authDomain,
  hasApiKey: !!config.apiKey,
  apiKeyLength: config.apiKey ? config.apiKey.length : 0,
});

let app;
try {
  app = initializeApp(config);
  console.log('[Firebase Init] Firebase App successfully initialized.');
} catch (error) {
  console.error('[Firebase Init] CRITICAL Firebase initialization error:', error);
  throw error;
}

export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || '(default)');
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

console.log('[Firebase Init] Auth & Firestore initialized successfully.');


export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
