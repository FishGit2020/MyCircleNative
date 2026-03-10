/**
 * Authentication helpers for React Native using @react-native-firebase/auth
 * and @react-native-google-signin/google-signin.
 */

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { auth, FirebaseAuthTypes } from './config';

// Configure Google Sign-In — on iOS the clientId is auto-read from GoogleService-Info.plist
GoogleSignin.configure();

/**
 * Sign in with Google via native Google Sign-In flow.
 * Returns the Firebase user on success, or null if cancelled.
 */
export async function signInWithGoogle(): Promise<FirebaseAuthTypes.User | null> {
  // Ensure Google Play services are available (Android)
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  // Trigger the native Google sign-in UI
  const response = await GoogleSignin.signIn();

  if (!response.data?.idToken) {
    throw new Error('Google Sign-In failed: no ID token returned');
  }

  // Create a Google credential with the token
  const googleCredential = auth.GoogleAuthProvider.credential(response.data.idToken);

  // Sign in to Firebase with the Google credential
  const result = await auth().signInWithCredential(googleCredential);
  return result.user;
}

/**
 * Sign in with email and password.
 */
export async function signInWithEmail(
  email: string,
  password: string,
): Promise<FirebaseAuthTypes.User> {
  const result = await auth().signInWithEmailAndPassword(email, password);
  return result.user;
}

/**
 * Create a new account with email and password, optionally setting a display name.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string,
): Promise<FirebaseAuthTypes.User> {
  const result = await auth().createUserWithEmailAndPassword(email, password);

  if (displayName) {
    await result.user.updateProfile({ displayName });
  }

  return result.user;
}

/**
 * Send a password-reset email.
 */
export async function resetPassword(email: string): Promise<void> {
  await auth().sendPasswordResetEmail(email);
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

  await auth().signOut();
}

/**
 * Subscribe to Firebase auth state changes.
 * Returns an unsubscribe function.
 */
export function subscribeToAuthChanges(
  callback: (user: FirebaseAuthTypes.User | null) => void,
): () => void {
  return auth().onAuthStateChanged(callback);
}

/**
 * Get the current user's Firebase ID token for authenticating API / GraphQL requests.
 * Returns null if no user is signed in.
 */
export async function getIdToken(): Promise<string | null> {
  const currentUser = auth().currentUser;
  if (!currentUser) return null;
  return currentUser.getIdToken();
}
