import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, query, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const STORAGE_KEY = 'dandiya_firebase_custom_config';

// Active production Firebase configuration for dandiya-raath
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAVeJ1Mx7r4rASVNSau0EzWkYZ77q3VofY",
  authDomain: "dandiya-raath.firebaseapp.com",
  projectId: "dandiya-raath",
  storageBucket: "dandiya-raath.firebasestorage.app",
  messagingSenderId: "50784887525",
  appId: "1:50784887525:web:0c8d309ffb9d0e8b5baa0c",
  measurementId: "G-8V65VS2P4V"
};

// Retrieve config from either custom localStorage, env variables, or default credentials
export function getFirebaseConfig() {
  const custom = localStorage.getItem(STORAGE_KEY);
  if (custom) {
    try {
      const parsed = JSON.parse(custom);
      if (parsed.apiKey && parsed.projectId) {
        return { ...parsed, source: 'localStorage' };
      }
    } catch (e) {
      console.warn('Failed to parse custom Firebase config from localStorage', e);
    }
  }

  // Check env vars or fallback to project configuration
  const envConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
    appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || DEFAULT_FIREBASE_CONFIG.measurementId,
    source: import.meta.env.VITE_FIREBASE_API_KEY ? 'env' : 'default'
  };

  return envConfig;
}

export function isFirebaseConfigured() {
  const config = getFirebaseConfig();
  return Boolean(config.apiKey && config.projectId && config.apiKey.length > 5);
}

let firebaseApp = null;
let firestoreDb = null;
let firebaseAuth = null;
let firebaseAnalytics = null;

export function initFirebase() {
  const config = getFirebaseConfig();
  if (!isFirebaseConfigured()) {
    return { app: null, db: null, auth: null, analytics: null, configured: false };
  }

  try {
    if (!getApps().length) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApp();
    }
    firestoreDb = getFirestore(firebaseApp);
    firebaseAuth = getAuth(firebaseApp);

    // Initialize Analytics if supported in client browser
    if (typeof window !== 'undefined') {
      isSupported().then(supported => {
        if (supported && firebaseApp) {
          try {
            firebaseAnalytics = getAnalytics(firebaseApp);
          } catch (e) {
            console.warn('Firebase analytics initialization skipped:', e);
          }
        }
      }).catch(() => {});
    }

    return {
      app: firebaseApp,
      db: firestoreDb,
      auth: firebaseAuth,
      analytics: firebaseAnalytics,
      configured: true
    };
  } catch (err) {
    console.error('Firebase initialization error:', err);
    return {
      app: null,
      db: null,
      auth: null,
      analytics: null,
      configured: false,
      error: err.message
    };
  }
}

export function saveFirebaseConfig(newConfig) {
  if (!newConfig) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  }
  // Reinitialize
  return initFirebase();
}

export async function testFirebaseConnection(configToTest) {
  try {
    const tempApp = initializeApp(configToTest, 'testApp-' + Date.now());
    const tempDb = getFirestore(tempApp);
    // Write and read a test ping doc
    const pingRef = doc(tempDb, '_system', 'ping');
    await setDoc(pingRef, { timestamp: new Date().toISOString(), status: 'connected', project: configToTest.projectId });
    return { success: true, message: 'Firebase successfully connected & Firestore verified!' };
  } catch (err) {
    return { success: false, message: err.message || 'Firebase connection failed.' };
  }
}

// Initialize on load
const { app, db, auth, analytics } = initFirebase();
export { app, db, auth, analytics };
