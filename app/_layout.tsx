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
import { initSentry } from '../src/sentry';
import { ErrorBoundary } from '../src/components/common/ErrorBoundary';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { AuthProvider } from '../src/contexts/AuthContext';

initSentry();

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
    <ErrorBoundary>
      <SafeAreaProvider>
        <I18nProvider>
          <ApolloProvider client={apolloClient}>
            <ThemeProvider>
              <AuthProvider>
                <Stack
                  screenOptions={{
                    headerShown: true,
                    headerStyle: {
                      backgroundColor: colorScheme === 'dark' ? '#111827' : '#ffffff',
                    },
                    headerTintColor: colorScheme === 'dark' ? '#ffffff' : '#111827',
                    headerTitleStyle: { fontWeight: '600' },
                    headerShadowVisible: false,
                    contentStyle: {
                      backgroundColor: colorScheme === 'dark' ? '#111827' : '#ffffff',
                    },
                  }}
                >
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                  <Stack.Screen name="ai-assistant" options={{ title: 'AI Assistant' }} />
                  <Stack.Screen name="baby-tracker" options={{ title: 'Baby Tracker' }} />
                  <Stack.Screen name="benchmark" options={{ title: 'Model Benchmark' }} />
                  <Stack.Screen name="child-development" options={{ title: 'Child Development' }} />
                  <Stack.Screen name="cloud-files" options={{ title: 'Cloud Files' }} />
                  <Stack.Screen name="daily-log" options={{ title: 'Daily Log' }} />
                  <Stack.Screen name="digital-library" options={{ title: 'Digital Library' }} />
                  <Stack.Screen name="doc-scanner" options={{ title: 'Doc Scanner' }} />
                  <Stack.Screen name="family-games" options={{ title: 'Family Games' }} />
                  <Stack.Screen name="flashcards" options={{ title: 'Flashcards' }} />
                  <Stack.Screen name="hiking-map" options={{ title: 'Hiking Map' }} />
                  <Stack.Screen name="immigration" options={{ title: 'Immigration' }} />
                  <Stack.Screen name="notebook" options={{ title: 'Notebook' }} />
                  <Stack.Screen name="polls" options={{ title: 'Polls' }} />
                  <Stack.Screen name="privacy" options={{ title: 'Privacy Policy' }} />
                  <Stack.Screen name="profile" options={{ title: 'Profile' }} />
                  <Stack.Screen name="radio" options={{ title: 'Radio Station' }} />
                  <Stack.Screen name="settings" options={{ title: 'Settings' }} />
                  <Stack.Screen name="terms" options={{ title: 'Terms of Service' }} />
                  <Stack.Screen name="trash" options={{ title: 'Recycle Bin' }} />
                  <Stack.Screen name="trip-planner" options={{ title: 'Trip Planner' }} />
                  <Stack.Screen name="whats-new" options={{ title: "What's New" }} />
                  <Stack.Screen name="worship" options={{ title: 'Worship Songs' }} />
                </Stack>
                <GlobalAudioPlayer />
              </AuthProvider>
            </ThemeProvider>
          </ApolloProvider>
        </I18nProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
