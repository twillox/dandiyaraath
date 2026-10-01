import { app, db, isFirebaseConfigured } from './firebase';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AUTH_STORAGE_KEY = 'dandiya_auth_user';

// Authorized administrator emails established in database configuration
export const DEFAULT_ADMIN_EMAILS = [
  'admin@dandiyaraat.com',
  'organisers@dandiyaraat.com',
  'prashanth@dandiyaraat.com',
  'tejaswithreddy0101@gmail.com'
];

export function getAdminEmails() {
  return DEFAULT_ADMIN_EMAILS;
}

// Client-side admin assignment is strictly disabled. Roles must be updated directly in the database.
export function addAdminEmail() {
  console.warn('Role assignment is restricted: Admin status can only be modified directly in the Firebase Firestore database.');
}

export function getCurrentUser() {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    const user = JSON.parse(raw);
    const admins = getAdminEmails();
    const isUserAdmin = admins.includes((user.email || '').toLowerCase()) || user.role === 'admin';
    user.role = isUserAdmin ? 'admin' : 'user';
    return user;
  } catch {
    return null;
  }
}

export function saveUserSession(user) {
  if (!user) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } else {
    const admins = getAdminEmails();
    const isUserAdmin = admins.includes((user.email || '').toLowerCase()) || user.role === 'admin';
    const cleanUser = {
      uid: user.uid || 'usr_' + Date.now().toString(36),
      email: user.email || 'user@example.com',
      displayName: user.displayName || user.name || 'Festival Guest',
      photoURL: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || 'Guest')}`,
      role: isUserAdmin ? 'admin' : 'user'
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(cleanUser));
  }
  notifyAuth();
}

export async function loginWithGoogleFirebase() {
  if (!isFirebaseConfigured() || !app) {
    throw new Error('Firebase credentials not yet configured. Use Simulated Google Login.');
  }

  try {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    const fbUser = result.user;

    // Check role strictly in database (Firestore users collection or pre-configured admins)
    let isUserAdmin = DEFAULT_ADMIN_EMAILS.includes((fbUser.email || '').toLowerCase());

    if (db) {
      try {
        const userDocRef = doc(db, 'users', fbUser.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.role === 'admin') {
            isUserAdmin = true;
          } else if (data.role === 'user' && !DEFAULT_ADMIN_EMAILS.includes((fbUser.email || '').toLowerCase())) {
            isUserAdmin = false;
          }
        }
      } catch (e) {
        console.warn('Firestore role fetch notice:', e);
      }
    }

    const userProfile = {
      uid: fbUser.uid,
      email: fbUser.email,
      displayName: fbUser.displayName || fbUser.email.split('@')[0],
      photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fbUser.displayName || 'Guest')}`,
      role: isUserAdmin ? 'admin' : 'user'
    };

    saveUserSession(userProfile);

    // Record user profile in Firestore users collection (preserves admin role in db)
    if (db) {
      try {
        const userDocRef = doc(db, 'users', fbUser.uid);
        await setDoc(userDocRef, {
          ...userProfile,
          lastLoginAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.warn('Firestore user profile sync error:', e);
      }
    }

    return userProfile;
  } catch (error) {
    console.error('Firebase Google Auth error:', error);
    throw error;
  }
}

// Simulated Google Sign-In for offline / local mode
export function loginSimulatedGoogle(customEmail, customName) {
  const email = (customEmail || 'guest@gmail.com').trim().toLowerCase();
  const name = customName || email.split('@')[0].replace('.', ' ').toUpperCase();

  const admins = getAdminEmails();
  const isUserAdmin = admins.includes(email);

  const profile = {
    uid: 'google_' + Math.abs(email.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)),
    email: email,
    displayName: name,
    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    role: isUserAdmin ? 'admin' : 'user'
  };

  saveUserSession(profile);
  return profile;
}

export function logout() {
  if (isFirebaseConfigured() && app) {
    try {
      const auth = getAuth(app);
      fbSignOut(auth).catch(() => {});
    } catch {}
  }
  saveUserSession(null);
}

// Subscribers
const authListeners = new Set();

export function subscribeToAuth(callback) {
  authListeners.add(callback);
  return () => authListeners.delete(callback);
}

function notifyAuth() {
  authListeners.forEach(cb => {
    try {
      cb();
    } catch (err) {
      console.error('Auth listener error:', err);
    }
  });
}
