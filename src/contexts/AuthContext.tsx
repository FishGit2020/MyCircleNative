import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { WindowEvents, StorageKeys, eventBus } from '@mycircle/shared';
import { safeSetItem, safeGetItem } from '@mycircle/shared';
import {
  auth,
  firestore,
} from '../firebase/config';
import {
  requestNotificationPermission,
  registerPushToken,
  unregisterPushToken,
  onTokenRefresh,
} from '../firebase/notifications';

// ---------------------------------------------------------------------------
// Types re-exported from the web firebase lib (duplicated here because the
// React Native project uses @react-native-firebase/* instead of firebase/*).
// ---------------------------------------------------------------------------

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  darkMode: boolean;
  locale?: string;
  tempUnit?: 'C' | 'F';
  speedUnit?: 'ms' | 'mph' | 'kmh';
  recentCities: RecentCity[];
  favoriteCities: FavoriteCity[];
  stockWatchlist?: WatchlistItem[];
  podcastSubscriptions?: string[];
  lastSeenAnnouncementId?: string;
  babyDueDate?: string;
  bottomNavOrder?: string[];
  weatherAlertsEnabled?: boolean;
  announcementAlertsEnabled?: boolean;
  bibleBookmarks?: Array<{ book: string; chapter: number; label: string; timestamp: number }>;
  worshipFavorites?: string[];
  childName?: string;
  childBirthDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WatchlistItem {
  symbol: string;
  companyName: string;
}

export interface FavoriteCity {
  id: string;
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

export interface RecentCity {
  id: string;
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
  searchedAt: Date;
}

// ---------------------------------------------------------------------------
// Safe AsyncStorage remove helper (safeRemoveItem doesn't exist in shared)
// ---------------------------------------------------------------------------

function safeRemoveItem(key: string): void {
  try {
    // AsyncStorage.removeItem is async but safeSetItem/safeGetItem in the
    // shared package swallow errors and return synchronously. We follow the
    // same pattern by writing an empty-ish tombstone, which downstream
    // readers treat as "not set". For a true remove we rely on the native
    // AsyncStorage import inside shared's safeStorage (which is patched to
    // use AsyncStorage in React Native).  A fire-and-forget approach is
    // acceptable here since the web version also ignores errors.
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    AsyncStorage.removeItem(key).catch(() => { /* ignore */ });
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Firestore helpers (thin wrappers around @react-native-firebase/firestore)
// ---------------------------------------------------------------------------

const usersCollection = () => firestore().collection('users');
const userDoc = (uid: string) => usersCollection().doc(uid);
const serverTimestamp = () => firestore.FieldValue.serverTimestamp();

async function ensureUserProfile(user: FirebaseAuthTypes.User) {
  const ref = userDoc(user.uid);
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      darkMode: false,
      recentCities: [],
      favoriteCities: [],
      stockWatchlist: [],
      podcastSubscriptions: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await userDoc(uid).get();
  if (snap.exists) return snap.data() as UserProfile;
  return null;
}

async function updateUserDarkMode(uid: string, darkMode: boolean) {
  await userDoc(uid).update({ darkMode, updatedAt: serverTimestamp() });
}

async function updateUserLocale(uid: string, locale: string) {
  await userDoc(uid).update({ locale, updatedAt: serverTimestamp() });
}

async function updateUserTempUnit(uid: string, tempUnit: 'C' | 'F') {
  await userDoc(uid).update({ tempUnit, updatedAt: serverTimestamp() });
}

async function updateUserSpeedUnit(uid: string, speedUnit: 'ms' | 'mph' | 'kmh') {
  await userDoc(uid).update({ speedUnit, updatedAt: serverTimestamp() });
}

async function addRecentCity(uid: string, city: Omit<RecentCity, 'searchedAt'>) {
  const snap = await userDoc(uid).get();
  if (snap.exists) {
    const profile = snap.data() as UserProfile;
    const recentCities = profile.recentCities || [];
    const filtered = recentCities.filter((c) => c.id !== city.id);
    const newCity: RecentCity = { ...city, searchedAt: new Date() };
    const updated = [newCity, ...filtered].slice(0, 10);
    await userDoc(uid).update({ recentCities: updated, updatedAt: serverTimestamp() });
  }
}

async function removeRecentCity(uid: string, cityId: string) {
  const snap = await userDoc(uid).get();
  if (snap.exists) {
    const profile = snap.data() as UserProfile;
    const updated = (profile.recentCities || []).filter((c) => c.id !== cityId);
    await userDoc(uid).update({ recentCities: updated, updatedAt: serverTimestamp() });
  }
}

async function clearRecentCities(uid: string) {
  await userDoc(uid).update({ recentCities: [], updatedAt: serverTimestamp() });
}

async function toggleFavoriteCity(uid: string, city: FavoriteCity): Promise<boolean> {
  const snap = await userDoc(uid).get();
  if (snap.exists) {
    const profile = snap.data() as UserProfile;
    const favorites = profile.favoriteCities || [];
    const exists = favorites.some((c) => c.id === city.id);
    const updated = exists ? favorites.filter((c) => c.id !== city.id) : [...favorites, city];
    await userDoc(uid).update({ favoriteCities: updated, updatedAt: serverTimestamp() });
    return !exists;
  }
  return false;
}

async function updateStockWatchlist(uid: string, watchlist: WatchlistItem[]) {
  await userDoc(uid).update({ stockWatchlist: watchlist, updatedAt: serverTimestamp() });
}

async function updatePodcastSubscriptions(uid: string, subscriptionIds: string[]) {
  await userDoc(uid).update({ podcastSubscriptions: subscriptionIds, updatedAt: serverTimestamp() });
}

async function updateUserBabyDueDate(uid: string, babyDueDate: string | null) {
  await userDoc(uid).update({ babyDueDate: babyDueDate || null, updatedAt: serverTimestamp() });
}

async function updateUserBottomNavOrder(uid: string, order: string[] | null) {
  await userDoc(uid).update({ bottomNavOrder: order || null, updatedAt: serverTimestamp() });
}

async function updateUserNotificationAlerts(
  uid: string,
  alerts: { weatherAlertsEnabled: boolean; announcementAlertsEnabled: boolean },
) {
  await userDoc(uid).update({ ...alerts, updatedAt: serverTimestamp() });
}

async function updateBibleBookmarks(
  uid: string,
  bookmarks: Array<{ book: string; chapter: number; label: string; timestamp: number }>,
) {
  await userDoc(uid).update({ bibleBookmarks: bookmarks, updatedAt: serverTimestamp() });
}

async function updateWorshipFavorites(uid: string, favorites: string[]) {
  await userDoc(uid).update({ worshipFavorites: favorites, updatedAt: serverTimestamp() });
}

async function updateChildData(
  uid: string,
  data: { childName: string | null; childBirthDate: string | null },
) {
  await userDoc(uid).update({
    childName: data.childName || null,
    childBirthDate: data.childBirthDate || null,
    updatedAt: serverTimestamp(),
  });
}

async function getRecentCities(uid: string): Promise<RecentCity[]> {
  const profile = await getUserProfile(uid);
  return profile?.recentCities || [];
}

// ---------------------------------------------------------------------------
// Analytics helpers (React Native Firebase analytics)
// ---------------------------------------------------------------------------

let analytics: ReturnType<typeof import('@react-native-firebase/analytics').default> | null = null;

function getAnalytics() {
  if (!analytics) {
    try {
      const mod = require('@react-native-firebase/analytics');
      analytics = mod.default();
    } catch {
      // Analytics not available (e.g. in tests)
    }
  }
  return analytics;
}

function identifyUser(uid: string, properties?: Record<string, string>) {
  const a = getAnalytics();
  if (!a) return;
  a.setUserId(uid).catch(() => {});
  if (properties) {
    a.setUserProperties(properties).catch(() => {});
  }
}

function clearUserIdentity() {
  const a = getAnalytics();
  if (!a) return;
  a.setUserId(null).catch(() => {});
}

function logEvent(eventName: string, params?: Record<string, any>) {
  const a = getAnalytics();
  if (!a) return;
  a.logEvent(eventName, params).catch(() => {});
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

type User = FirebaseAuthTypes.User;

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateDarkMode: (darkMode: boolean) => Promise<void>;
  updateLocale: (locale: string) => Promise<void>;
  updateTempUnit: (unit: 'C' | 'F') => Promise<void>;
  updateSpeedUnit: (unit: 'ms' | 'mph' | 'kmh') => Promise<void>;
  addCity: (city: Omit<RecentCity, 'searchedAt'>) => Promise<void>;
  removeCity: (cityId: string) => Promise<void>;
  clearCities: () => Promise<void>;
  toggleFavorite: (city: FavoriteCity) => Promise<boolean>;
  syncStockWatchlist: (watchlist: WatchlistItem[]) => Promise<void>;
  syncPodcastSubscriptions: (subscriptionIds: string[]) => Promise<void>;
  syncBabyDueDate: (date: string | null) => Promise<void>;
  recentCities: RecentCity[];
  favoriteCities: FavoriteCity[];
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentCities, setRecentCities] = useState<RecentCity[]>([]);
  const [favoriteCities, setFavoriteCities] = useState<FavoriteCity[]>([]);

  const refreshProfile = async () => {
    if (user) {
      const userProfile = await getUserProfile(user.uid);
      setProfile(userProfile);
      if (userProfile) {
        setRecentCities(userProfile.recentCities || []);
        setFavoriteCities(userProfile.favoriteCities || []);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Link analytics sessions to this authenticated user
        const method =
          firebaseUser.providerData[0]?.providerId === 'password' ? 'email' : 'google';
        identifyUser(firebaseUser.uid, { sign_in_method: method });
        logEvent('login', { method });

        // Register push notification token
        requestNotificationPermission().then((granted) => {
          if (granted) {
            registerPushToken(firebaseUser.uid);
          }
        });

        const userProfile = await getUserProfile(firebaseUser.uid);
        setProfile(userProfile);
        if (userProfile) {
          setRecentCities(userProfile.recentCities || []);
          setFavoriteCities(userProfile.favoriteCities || []);

          // Restore saved preferences to AsyncStorage so shared hooks pick them up
          if (userProfile.tempUnit) {
            safeSetItem(StorageKeys.TEMP_UNIT, userProfile.tempUnit);
            eventBus.publish(WindowEvents.UNITS_CHANGED);
          }
          if (userProfile.speedUnit) {
            safeSetItem(StorageKeys.SPEED_UNIT, userProfile.speedUnit);
            eventBus.publish(WindowEvents.UNITS_CHANGED);
          }

          // Restore stock watchlist
          if (userProfile.stockWatchlist && userProfile.stockWatchlist.length > 0) {
            safeSetItem(StorageKeys.STOCK_WATCHLIST, JSON.stringify(userProfile.stockWatchlist));
            eventBus.publish(WindowEvents.WATCHLIST_CHANGED);
          }

          // Restore podcast subscriptions
          if (userProfile.podcastSubscriptions && userProfile.podcastSubscriptions.length > 0) {
            safeSetItem(
              StorageKeys.PODCAST_SUBSCRIPTIONS,
              JSON.stringify(userProfile.podcastSubscriptions),
            );
            eventBus.publish(WindowEvents.SUBSCRIPTIONS_CHANGED);
          }

          // Restore baby due date
          if (userProfile.babyDueDate) {
            safeSetItem(StorageKeys.BABY_DUE_DATE, userProfile.babyDueDate);
            eventBus.publish(WindowEvents.BABY_DUE_DATE_CHANGED);
          }

          // Restore bottom nav order
          if (userProfile.bottomNavOrder && userProfile.bottomNavOrder.length > 0) {
            safeSetItem(
              StorageKeys.BOTTOM_NAV_ORDER,
              JSON.stringify(userProfile.bottomNavOrder),
            );
            eventBus.publish(WindowEvents.BOTTOM_NAV_ORDER_CHANGED);
          }

          // Restore notification alert preferences
          if (userProfile.weatherAlertsEnabled !== undefined) {
            safeSetItem(StorageKeys.WEATHER_ALERTS, String(userProfile.weatherAlertsEnabled));
          }
          if (userProfile.announcementAlertsEnabled !== undefined) {
            safeSetItem(
              StorageKeys.ANNOUNCEMENT_ALERTS,
              String(userProfile.announcementAlertsEnabled),
            );
          }
          eventBus.publish(WindowEvents.NOTIFICATION_ALERTS_CHANGED);

          // Restore Bible bookmarks
          if (userProfile.bibleBookmarks && userProfile.bibleBookmarks.length > 0) {
            safeSetItem(
              StorageKeys.BIBLE_BOOKMARKS,
              JSON.stringify(userProfile.bibleBookmarks),
            );
            eventBus.publish(WindowEvents.BIBLE_BOOKMARKS_CHANGED);
          }

          // Restore worship favorites
          if (userProfile.worshipFavorites && userProfile.worshipFavorites.length > 0) {
            safeSetItem(
              StorageKeys.WORSHIP_FAVORITES,
              JSON.stringify(userProfile.worshipFavorites),
            );
            eventBus.publish(WindowEvents.WORSHIP_FAVORITES_CHANGED);
          }

          // Restore Child Development data
          // React Native doesn't have btoa/atob — store plain dates directly
          if (userProfile.childName) {
            safeSetItem(StorageKeys.CHILD_NAME, userProfile.childName);
          }
          if (userProfile.childBirthDate) {
            // Normalise legacy btoa-encoded dates to plain YYYY-MM-DD.
            // In React Native we store plain dates (no base64 encoding).
            let plainDate = userProfile.childBirthDate;
            if (!/^\d{4}-\d{2}-\d{2}$/.test(plainDate)) {
              // Likely a base64-encoded date from the web app — decode it.
              try {
                // Buffer is available in React Native via the 'buffer' polyfill
                // or the hermes engine. Fall back to storing as-is if decode fails.
                const decoded = Buffer.from(plainDate, 'base64').toString('utf-8');
                if (/^\d{4}-\d{2}-\d{2}$/.test(decoded)) {
                  plainDate = decoded;
                }
              } catch {
                /* use as-is */
              }
            }
            safeSetItem(StorageKeys.CHILD_BIRTH_DATE, plainDate);
          }
          if (userProfile.childName || userProfile.childBirthDate) {
            eventBus.publish(WindowEvents.CHILD_DATA_CHANGED);
          }

          // Restore notebook count
          eventBus.publish(WindowEvents.NOTEBOOK_CHANGED);
        }
      } else {
        clearUserIdentity();
        setProfile(null);
        setRecentCities([]);
        setFavoriteCities([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ---------------------------------------------------------------------------
  // Auth actions
  // ---------------------------------------------------------------------------

  const signIn = async () => {
    // On React Native, Google Sign-In uses @react-native-google-signin.
    // This is a placeholder — the actual implementation will depend on the
    // native Google Sign-In package configuration.
    try {
      // TODO: integrate @react-native-google-signin/google-signin
      throw new Error('Google Sign-In not yet configured for React Native');
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  };

  const signInWithEmailFn = async (email: string, password: string) => {
    try {
      const result = await auth().signInWithEmailAndPassword(email, password);
      await ensureUserProfile(result.user);
    } catch (error) {
      console.error('Email sign in failed:', error);
      throw error;
    }
  };

  const signUpWithEmailFn = async (email: string, password: string, displayName?: string) => {
    try {
      const result = await auth().createUserWithEmailAndPassword(email, password);
      if (displayName) {
        await result.user.updateProfile({ displayName });
      }
      await ensureUserProfile(result.user);
    } catch (error) {
      console.error('Email sign up failed:', error);
      throw error;
    }
  };

  const resetPasswordFn = async (email: string) => {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      // Unregister push token before signing out
      if (user) {
        await unregisterPushToken(user.uid).catch(() => {});
      }
      await auth().signOut();

      // Clear user-specific AsyncStorage keys, preserving device-level preferences
      const keysToPreserve = new Set([
        StorageKeys.THEME,
        StorageKeys.LOCALE,
        StorageKeys.WEATHER_ALERTS,
        StorageKeys.ANNOUNCEMENT_ALERTS,
      ]);
      Object.values(StorageKeys).forEach((key) => {
        if (!keysToPreserve.has(key)) {
          safeRemoveItem(key);
        }
      });

      // Notify all listeners that data has been cleared
      eventBus.publish(WindowEvents.WATCHLIST_CHANGED);
      eventBus.publish(WindowEvents.SUBSCRIPTIONS_CHANGED);
      eventBus.publish(WindowEvents.WORSHIP_SONGS_CHANGED);
      eventBus.publish(WindowEvents.NOTEBOOK_CHANGED);
      eventBus.publish(WindowEvents.BIBLE_BOOKMARKS_CHANGED);
      eventBus.publish(WindowEvents.FLASHCARD_PROGRESS_CHANGED);
      eventBus.publish(WindowEvents.DAILY_LOG_CHANGED);
      eventBus.publish(WindowEvents.CHILD_DATA_CHANGED);
      eventBus.publish(WindowEvents.BABY_DUE_DATE_CHANGED);
      eventBus.publish(WindowEvents.UNITS_CHANGED);

      setProfile(null);
      setRecentCities([]);
      setFavoriteCities([]);
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  };

  // ---------------------------------------------------------------------------
  // Profile mutation actions
  // ---------------------------------------------------------------------------

  const updateDarkMode = async (darkMode: boolean) => {
    if (user) {
      await updateUserDarkMode(user.uid, darkMode);
      setProfile((prev) => (prev ? { ...prev, darkMode } : null));
    }
  };

  const updateLocale = useCallback(
    async (locale: string) => {
      if (user) {
        await updateUserLocale(user.uid, locale);
        setProfile((prev) => (prev ? { ...prev, locale } : null));
      }
    },
    [user],
  );

  const updateTempUnit = useCallback(
    async (tempUnit: 'C' | 'F') => {
      if (user) {
        await updateUserTempUnit(user.uid, tempUnit);
        setProfile((prev) => (prev ? { ...prev, tempUnit } : null));
      }
    },
    [user],
  );

  const updateSpeedUnit = useCallback(
    async (speedUnit: 'ms' | 'mph' | 'kmh') => {
      if (user) {
        await updateUserSpeedUnit(user.uid, speedUnit);
        setProfile((prev) => (prev ? { ...prev, speedUnit } : null));
      }
    },
    [user],
  );

  const addCity = useCallback(
    async (city: Omit<RecentCity, 'searchedAt'>) => {
      if (user) {
        await addRecentCity(user.uid, city);
        const cities = await getRecentCities(user.uid);
        setRecentCities(cities);
      }
      logEvent('city_searched', { city_name: city.name, city_country: city.country });
    },
    [user],
  );

  const removeCity = useCallback(
    async (cityId: string) => {
      if (user) {
        await removeRecentCity(user.uid, cityId);
        const cities = await getRecentCities(user.uid);
        setRecentCities(cities);
      }
    },
    [user],
  );

  const clearCities = useCallback(async () => {
    if (user) {
      await clearRecentCities(user.uid);
      setRecentCities([]);
    }
  }, [user]);

  const toggleFavorite = useCallback(
    async (city: FavoriteCity): Promise<boolean> => {
      if (user) {
        const isNowFavorite = await toggleFavoriteCity(user.uid, city);
        const updatedProfile = await getUserProfile(user.uid);
        if (updatedProfile) {
          setFavoriteCities(updatedProfile.favoriteCities || []);
        }
        return isNowFavorite;
      }
      return false;
    },
    [user],
  );

  const syncStockWatchlist = useCallback(
    async (watchlist: WatchlistItem[]) => {
      if (user) {
        await updateStockWatchlist(user.uid, watchlist);
      }
    },
    [user],
  );

  const syncPodcastSubscriptions = useCallback(
    async (subscriptionIds: string[]) => {
      if (user) {
        await updatePodcastSubscriptions(user.uid, subscriptionIds);
      }
    },
    [user],
  );

  const syncBabyDueDate = useCallback(
    async (date: string | null) => {
      if (user) {
        await updateUserBabyDueDate(user.uid, date);
      }
    },
    [user],
  );

  // ---------------------------------------------------------------------------
  // Auto-sync effects: listen to eventBus events and persist to Firestore
  // ---------------------------------------------------------------------------

  // Listen for FCM token refreshes and update Firestore
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onTokenRefresh(user.uid);
    return unsubscribe;
  }, [user]);

  // Auto-sync baby due date changes to Firestore
  useEffect(() => {
    const unsubscribe = eventBus.subscribe(WindowEvents.BABY_DUE_DATE_CHANGED, () => {
      const date = safeGetItem(StorageKeys.BABY_DUE_DATE);
      if (user) {
        updateUserBabyDueDate(user.uid, date);
      }
    });
    return unsubscribe;
  }, [user]);

  // Auto-sync bottom nav order changes to Firestore
  useEffect(() => {
    const unsubscribe = eventBus.subscribe(WindowEvents.BOTTOM_NAV_ORDER_CHANGED, () => {
      const stored = safeGetItem(StorageKeys.BOTTOM_NAV_ORDER);
      if (user) {
        try {
          const order = stored ? JSON.parse(stored) : null;
          updateUserBottomNavOrder(user.uid, order);
        } catch {
          /* ignore parse errors */
        }
      }
    });
    return unsubscribe;
  }, [user]);

  // Auto-sync notification alert preferences to Firestore
  useEffect(() => {
    const unsubscribe = eventBus.subscribe(WindowEvents.NOTIFICATION_ALERTS_CHANGED, () => {
      if (user) {
        updateUserNotificationAlerts(user.uid, {
          weatherAlertsEnabled: safeGetItem(StorageKeys.WEATHER_ALERTS) === 'true',
          announcementAlertsEnabled: safeGetItem(StorageKeys.ANNOUNCEMENT_ALERTS) === 'true',
        });
      }
    });
    return unsubscribe;
  }, [user]);

  // Auto-sync Bible bookmarks to Firestore
  useEffect(() => {
    const unsubscribe = eventBus.subscribe(WindowEvents.BIBLE_BOOKMARKS_CHANGED, () => {
      if (user) {
        try {
          const stored = safeGetItem(StorageKeys.BIBLE_BOOKMARKS);
          const bookmarks = stored ? JSON.parse(stored) : [];
          updateBibleBookmarks(user.uid, bookmarks);
        } catch {
          /* ignore parse errors */
        }
      }
    });
    return unsubscribe;
  }, [user]);

  // Auto-sync worship favorites to Firestore
  useEffect(() => {
    const unsubscribe = eventBus.subscribe(WindowEvents.WORSHIP_FAVORITES_CHANGED, () => {
      if (user) {
        try {
          const stored = safeGetItem(StorageKeys.WORSHIP_FAVORITES);
          const favorites = stored ? JSON.parse(stored) : [];
          updateWorshipFavorites(user.uid, favorites);
        } catch {
          /* ignore parse errors */
        }
      }
    });
    return unsubscribe;
  }, [user]);

  // Auto-sync child development data to Firestore
  useEffect(() => {
    const unsubscribe = eventBus.subscribe(WindowEvents.CHILD_DATA_CHANGED, () => {
      if (user) {
        const childName = safeGetItem(StorageKeys.CHILD_NAME);
        const childBirthDate = safeGetItem(StorageKeys.CHILD_BIRTH_DATE);
        // In React Native we store plain dates (no btoa encoding), so upload directly.
        updateChildData(user.uid, { childName, childBirthDate });
      }
    });
    return unsubscribe;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signInWithEmail: signInWithEmailFn,
        signUpWithEmail: signUpWithEmailFn,
        resetPassword: resetPasswordFn,
        signOut: signOutUser,
        updateDarkMode,
        updateLocale,
        updateTempUnit,
        updateSpeedUnit,
        addCity,
        removeCity,
        clearCities,
        toggleFavorite,
        syncStockWatchlist,
        syncPodcastSubscriptions,
        syncBabyDueDate,
        recentCities,
        favoriteCities,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
