import '../global.css';

import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ApolloProvider } from '@apollo/client';
import { I18nProvider } from '@mycircle/shared';
import { getApolloClient } from '@mycircle/shared';
import { subscribeToAuthChanges } from '../src/firebase/auth';
import type { FirebaseAuthTypes } from '../src/firebase/config';
import GlobalAudioPlayer from '../src/components/GlobalAudioPlayer';

// Prevent the splash screen from auto-hiding until we finish loading
SplashScreen.preventAutoHideAsync();

function useProtectedRoute(user: FirebaseAuthTypes.User | null, isLoading: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated and not already in auth group
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect to home if authenticated and still in auth group
      router.replace('/(tabs)');
    }
  }, [user, segments, isLoading, router]);
}

export default function RootLayout() {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const colorScheme = useColorScheme();

  // Load custom fonts
  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          // Add custom fonts here if needed, e.g.:
          // 'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
        });
      } catch (error) {
        // Font loading failed — continue with system fonts
        console.warn('Failed to load custom fonts:', error);
      } finally {
        setFontsLoaded(true);
      }
    }

    loadFonts();
  }, []);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Hide splash screen once fonts and auth are ready
  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoading]);

  // Protect routes based on auth state
  useProtectedRoute(user, isLoading);

  // Don't render until everything is loaded
  if (!fontsLoaded || isLoading) {
    return null;
  }

  const apolloClient = getApolloClient();

  return (
    <SafeAreaProvider>
      <I18nProvider>
        <ApolloProvider client={apolloClient}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: colorScheme === 'dark' ? '#111827' : '#ffffff',
              },
            }}
          />
          <GlobalAudioPlayer />
        </ApolloProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}
