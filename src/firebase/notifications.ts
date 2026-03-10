/**
 * Push notification setup for React Native using @react-native-firebase/messaging.
 *
 * Handles:
 * - Permission request
 * - FCM token registration and refresh
 * - Token storage in Firestore for server-side targeting
 * - Foreground message handling
 */

import { Platform } from 'react-native';
import { messaging, firestore } from './config';

/**
 * Request notification permissions (required on iOS, auto-granted on Android 12-).
 * Returns true if permission was granted.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const authStatus = await messaging().requestPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
}

/**
 * Get the current FCM token and store it in Firestore under the user's document.
 * Should be called after sign-in and whenever the token refreshes.
 */
export async function registerPushToken(uid: string): Promise<void> {
  try {
    const token = await messaging().getToken();
    if (token) {
      await saveTokenToFirestore(uid, token);
    }
  } catch (error) {
    console.warn('Failed to register push token:', error);
  }
}

/**
 * Save or update the FCM token in Firestore.
 * Stores as an array of tokens (user may have multiple devices).
 */
async function saveTokenToFirestore(uid: string, token: string): Promise<void> {
  const userRef = firestore().collection('users').doc(uid);
  await userRef.update({
    fcmTokens: firestore.FieldValue.arrayUnion(token),
    lastTokenUpdate: firestore.FieldValue.serverTimestamp(),
    tokenPlatform: Platform.OS,
  });
}

/**
 * Remove the current device's FCM token from Firestore (e.g., on sign-out).
 */
export async function unregisterPushToken(uid: string): Promise<void> {
  try {
    const token = await messaging().getToken();
    if (token) {
      const userRef = firestore().collection('users').doc(uid);
      await userRef.update({
        fcmTokens: firestore.FieldValue.arrayRemove(token),
      });
    }
  } catch (error) {
    console.warn('Failed to unregister push token:', error);
  }
}

/**
 * Listen for FCM token refreshes and update Firestore.
 * Returns an unsubscribe function.
 */
export function onTokenRefresh(uid: string): () => void {
  return messaging().onTokenRefresh(async (token) => {
    await saveTokenToFirestore(uid, token);
  });
}

/**
 * Subscribe to foreground messages.
 * Returns an unsubscribe function.
 */
export function onForegroundMessage(
  handler: (message: { title?: string; body?: string; data?: Record<string, string> }) => void,
): () => void {
  return messaging().onMessage(async (remoteMessage) => {
    handler({
      title: remoteMessage.notification?.title,
      body: remoteMessage.notification?.body,
      data: remoteMessage.data as Record<string, string> | undefined,
    });
  });
}
