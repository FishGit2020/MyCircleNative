/**
 * Firebase configuration for React Native.
 *
 * With @react-native-firebase, config is read from GoogleService-Info.plist (iOS)
 * and google-services.json (Android) at build time via Expo config plugins.
 * No JS-level config object is needed — the native SDKs initialise automatically.
 *
 * This file exports helper references for use across the app.
 */

import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import appCheck from '@react-native-firebase/app-check';

// Initialize App Check with a known debug token for development
if (__DEV__) {
  const rnfbProvider = appCheck().newReactNativeFirebaseAppCheckProvider();
  rnfbProvider.configure({
    apple: {
      provider: 'debug',
      debugToken: process.env.EXPO_PUBLIC_APP_CHECK_DEBUG_TOKEN,
    },
    android: {
      provider: 'debug',
      debugToken: process.env.EXPO_PUBLIC_APP_CHECK_DEBUG_TOKEN,
    },
  });
  appCheck().initializeAppCheck({ provider: rnfbProvider, isTokenAutoRefreshEnabled: true });
}

export { auth, firestore, messaging };
export type { FirebaseAuthTypes };
