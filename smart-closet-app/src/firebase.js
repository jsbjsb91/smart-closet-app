// ============================================================================
// CONFIGURACIÓN Y SERVICIO DE AUTENTICACIÓN FIREBASE
// Soporta registro con email/password, verificación de correo, reset de clave y Google Sign-in.
// Si las credenciales no están configuradas en .env, opera en modo transparente.
// ============================================================================

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDOdjeSTn5c2kK_fzovRygQ5ilIj4RblyA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "smartcloset-64e59.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "smartcloset-64e59",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "smartcloset-64e59.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "53053304551",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:53053304551:web:cdf515a1da862feb47fc42",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-S7GQ8MF03P"
};

export const isFirebaseConfigured = () => {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
};

let app = null;
let auth = null;
let analytics = null;
let googleProvider = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    auth.languageCode = 'es'; // Plantillas de email en español
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });

    // Inicializar Firebase Analytics si el entorno lo soporta
    if (typeof window !== 'undefined') {
      isAnalyticsSupported().then(supported => {
        if (supported && app) {
          analytics = getAnalytics(app);
        }
      }).catch(() => {});
    }
  } catch (err) {
    console.warn('Error inicializando Firebase:', err);
  }
}

export { app, auth, analytics, googleProvider };

/**
 * Registra un usuario con correo y contraseña, asigna su nombre y envía email de verificación.
 */
export const registerWithEmail = async (email, password, displayName = '') => {
  if (!isFirebaseConfigured() || !auth) {
    throw new Error('Firebase no está configurado. Revisa tu archivo .env.local');
  }
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    try {
      await updateProfile(credential.user, { displayName });
    } catch (e) {
      console.warn('No se pudo guardar el displayName:', e);
    }
  }
  // Enviar correo de confirmación oficial
  try {
    await sendEmailVerification(credential.user);
  } catch (e) {
    console.warn('No se pudo enviar el correo de verificación:', e);
  }
  return credential.user;
};

/**
 * Inicia sesión con correo y contraseña.
 */
export const loginWithEmail = async (email, password) => {
  if (!isFirebaseConfigured() || !auth) {
    throw new Error('Firebase no está configurado. Revisa tu archivo .env.local');
  }
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
};

/**
 * Inicia sesión con cuenta de Google.
 */
export const loginWithGoogle = async () => {
  if (!isFirebaseConfigured() || !auth || !googleProvider) {
    throw new Error('Firebase Google Sign-In no está configurado.');
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

/**
 * Envía un correo para restablecer la contraseña.
 */
export const resetPassword = async (email) => {
  if (!isFirebaseConfigured() || !auth) {
    throw new Error('Firebase no está configurado.');
  }
  await sendPasswordResetEmail(auth, email);
};

/**
 * Reenvía el correo de verificación si el usuario no lo ha recibido.
 */
export const resendVerificationEmail = async (user) => {
  const targetUser = user || auth?.currentUser;
  if (!targetUser) throw new Error('No hay usuario activo para reenviar el correo.');
  await sendEmailVerification(targetUser);
};

/**
 * Cierra la sesión en Firebase.
 */
export const logoutFirebase = async () => {
  if (auth) {
    await signOut(auth);
  }
};

/**
 * Escucha cambios en el estado de autenticación de Firebase.
 */
export const subscribeToAuthChanges = (callback) => {
  if (!isFirebaseConfigured() || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};
