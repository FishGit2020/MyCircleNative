/**
 * Authentication helpers for React Native using @react-native-firebase/auth
 * and @react-native-google-signin/google-signin.
 */

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  getAuth,
  GoogleAuthProvider,
} from '@react-native-firebase/auth';

// Re-export for use elsewhere
export type { FirebaseAuthTypes } from '@react-native-firebase/auth';

// Configure Google Sign-In — on iOS the clientId is auto-read from GoogleService-Info.plist
GoogleSignin.configure({
  webClientId: '441498720264-ofoac5u80ru2bujilianunkparptg9ne.apps.googleusercontent.com',
});

const authInstance = getAuth();

/**
 * Sign in with Google via native Google Sign-In flow.
 * Returns the Firebase user on success, or null if cancelled.
 */
export async function signInWithGoogle() {
  // Ensure Google Play services are available (Android)
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  // Trigger the native Google sign-in UI
  const response = await GoogleSignin.signIn();

  if (!response.data?.idToken) {
    throw new Error('Google Sign-In failed: no ID token returned');
  }

  // Create a Google credential with the token
  const googleCredential = GoogleAuthProvider.credential(response.data.idToken);

  // Sign in to Firebase with the Google credential
  const result = await signInWithCredential(authInstance, googleCredential);
  return result.user;
}

/**
 * Sign in with email and password.
 */
export async function signInWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(authInstance, email, password);
  return result.user;
}

/**
 * Create a new account with email and password, optionally setting a display name.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string,
) {
  const result = await createUserWithEmailAndPassword(authInstance, email, password);

  if (displayName) {
    await result.user.updateProfile({ displayName });
  }

  return result.user;
}

/**
 * Send a password-reset email.
 */
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(authInstance, email);
}

/**
 * Sign the current user out.
 */
export async function logOut(): Promise<void> {
  // Also sign out of Google if they used Google sign-in
  try {
    await GoogleSignin.signOut();
  } catch {
    // Not signed in via Google — ignore
  }

  await signOut(authInstance);
}

/**
 * Subscribe to Firebase auth state changes.
 * Returns an unsubscribe function.
 */
export function subscribeToAuthChanges(
  callback: (user: any) => void,
): () => void {
  return onAuthStateChanged(authInstance, callback);
}

/**
 * Get the current user's Firebase ID token for authenticating API / GraphQL requests.
 * Returns null if no user is signed in.
 */
export async function getIdToken(): Promise<string | null> {
  const currentUser = authInstance.currentUser;
  if (!currentUser) return null;
  return currentUser.getIdToken();
}
