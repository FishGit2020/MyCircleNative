/**
 * Firestore helpers for React Native using @react-native-firebase/firestore.
 *
 * Mirrors the web app's Firestore helpers but uses the React Native Firebase SDK.
 * Shares the same Firestore collections / document structure so data syncs across
 * the web PWA and the native app.
 */

import { firestore } from './config';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
  bibleBookmarks?: Array<{
    book: string;
    chapter: number;
    label: string;
    timestamp: number;
  }>;
  worshipFavorites?: string[];
  childName?: string;
  childBirthDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function usersRef() {
  return firestore().collection('users');
}

function userDoc(uid: string) {
  return usersRef().doc(uid);
}

// ---------------------------------------------------------------------------
// User Profile
// ---------------------------------------------------------------------------

/**
 * Fetch the user profile document from `users/{uid}`.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await userDoc(uid).get();
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export async function updateUserDarkMode(uid: string, darkMode: boolean): Promise<void> {
  await userDoc(uid).update({
    darkMode,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

export async function updateUserLocale(uid: string, locale: string): Promise<void> {
  await userDoc(uid).update({
    locale,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

export async function updateUserTempUnit(uid: string, unit: 'C' | 'F'): Promise<void> {
  await userDoc(uid).update({
    tempUnit: unit,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

export async function updateUserSpeedUnit(
  uid: string,
  unit: 'ms' | 'mph' | 'kmh',
): Promise<void> {
  await userDoc(uid).update({
    speedUnit: unit,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

// ---------------------------------------------------------------------------
// Recent Cities
// ---------------------------------------------------------------------------

export async function addRecentCity(
  uid: string,
  city: Omit<RecentCity, 'searchedAt'>,
): Promise<void> {
  const snap = await userDoc(uid).get();
  if (!snap.exists()) return;

  const profile = snap.data() as UserProfile;
  const recentCities = profile.recentCities || [];

  // Remove duplicate if it exists
  const filtered = recentCities.filter((c) => c.id !== city.id);

  // Prepend the new city with current timestamp
  const newCity: RecentCity = { ...city, searchedAt: new Date() };

  // Keep only the last 10 cities
  const updated = [newCity, ...filtered].slice(0, 10);

  await userDoc(uid).update({
    recentCities: updated,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

export async function removeRecentCity(uid: string, cityId: string): Promise<void> {
  const snap = await userDoc(uid).get();
  if (!snap.exists()) return;

  const profile = snap.data() as UserProfile;
  const updated = (profile.recentCities || []).filter((c) => c.id !== cityId);

  await userDoc(uid).update({
    recentCities: updated,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

export async function clearRecentCities(uid: string): Promise<void> {
  await userDoc(uid).update({
    recentCities: [],
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

export async function getRecentCities(uid: string): Promise<RecentCity[]> {
  const profile = await getUserProfile(uid);
  return profile?.recentCities || [];
}

// ---------------------------------------------------------------------------
// Favorite Cities
// ---------------------------------------------------------------------------

/**
 * Toggle a city's favorite status. Returns `true` if the city was added,
 * `false` if it was removed.
 */
export async function toggleFavoriteCity(
  uid: string,
  city: FavoriteCity,
): Promise<boolean> {
  const snap = await userDoc(uid).get();
  if (!snap.exists()) return false;

  const profile = snap.data() as UserProfile;
  const favorites = profile.favoriteCities || [];
  const exists = favorites.some((c) => c.id === city.id);

  const updatedFavorites = exists
    ? favorites.filter((c) => c.id !== city.id)
    : [...favorites, city];

  await userDoc(uid).update({
    favoriteCities: updatedFavorites,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });

  return !exists;
}

// ---------------------------------------------------------------------------
// Stocks
// ---------------------------------------------------------------------------

export async function updateStockWatchlist(
  uid: string,
  watchlist: WatchlistItem[],
): Promise<void> {
  await userDoc(uid).update({
    stockWatchlist: watchlist,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

// ---------------------------------------------------------------------------
// Podcasts
// ---------------------------------------------------------------------------

export async function updatePodcastSubscriptions(
  uid: string,
  subscriptionIds: string[],
): Promise<void> {
  await userDoc(uid).update({
    podcastSubscriptions: subscriptionIds,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

// ---------------------------------------------------------------------------
// Baby Due Date
// ---------------------------------------------------------------------------

export async function updateUserBabyDueDate(
  uid: string,
  date: string | null,
): Promise<void> {
  await userDoc(uid).update({
    babyDueDate: date || null,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

// ---------------------------------------------------------------------------
// Bible Bookmarks
// ---------------------------------------------------------------------------

export async function updateBibleBookmarks(
  uid: string,
  bookmarks: Array<{ book: string; chapter: number; label: string; timestamp: number }>,
): Promise<void> {
  await userDoc(uid).update({
    bibleBookmarks: bookmarks,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

// ---------------------------------------------------------------------------
// Worship Favorites
// ---------------------------------------------------------------------------

export async function updateWorshipFavorites(
  uid: string,
  favorites: string[],
): Promise<void> {
  await userDoc(uid).update({
    worshipFavorites: favorites,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

// ---------------------------------------------------------------------------
// Child Data
// ---------------------------------------------------------------------------

export async function updateChildData(
  uid: string,
  data: { childName: string | null; childBirthDate: string | null },
): Promise<void> {
  await userDoc(uid).update({
    childName: data.childName || null,
    childBirthDate: data.childBirthDate || null,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}
